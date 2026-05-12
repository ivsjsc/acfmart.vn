// =============================================================================
// Moderation Worker — BullMQ
// Self-check #1: Atomic DB status transition (optimistic lock)
// Self-check #3: AI timeout → HUMAN_REVIEW + Slack alert
// =============================================================================

import { Worker, type Job } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import {
  redisConnection,
  QUEUE_NAMES,
  sendSlackAlert,
  enqueueQrGeneration,
} from '../lib/queue';
import {
  runAiModeration,
  determineStatusFromAiResult,
} from '../services/aiModerationService';
import {
  createModerationLog,
  moderationLogImmutabilityMiddleware,
} from '../services/moderationLogService';
import type { ModerationJobPayload, ModerationJobResult } from '../types';

// ---------------------------------------------------------------------------
// Prisma client with immutability middleware
// ---------------------------------------------------------------------------

const prisma = new PrismaClient();
// @ts-expect-error — $use is middleware API
prisma.$use(moderationLogImmutabilityMiddleware);

// ---------------------------------------------------------------------------
// Worker
// ---------------------------------------------------------------------------

export const moderationWorker = new Worker<ModerationJobPayload, ModerationJobResult>(
  QUEUE_NAMES.MODERATION,
  async (job: Job<ModerationJobPayload>) => {
    const { productId, mediaUrls, imageHashes, contentHash } = job.data;
    const startMs = Date.now();

    // ------------------------------------------------------------------
    // Step 1: Atomic status lock — prevents race condition (self-check #1)
    // Only proceed if product is still PENDING
    // ------------------------------------------------------------------
    const updated = await prisma.product.updateMany({
      where: {
        id: productId,
        status: 'PENDING',          // Optimistic lock: only one worker wins
      },
      data: { status: 'PENDING' },  // No-op data change — just verifying lock
    });

    if (updated.count === 0) {
      // Another worker already grabbed this product
      console.warn(`[Worker] Product ${productId} already being processed — skipping`);
      return {
        productId,
        newStatus: 'PENDING',
        aiResult: { overallScore: 0, approved: false, violations: [], modelVersion: 'skip', processingMs: 0, fromCache: false },
        processingMs: 0,
      };
    }

    await createModerationLog(prisma, {
      productId,
      action: 'AI_SCAN_STARTED',
      actorType: 'AI',
      fromStatus: 'PENDING',
      toStatus: 'PENDING',
    });

    // ------------------------------------------------------------------
    // Step 2: Run AI moderation (includes 5s timeout & fallback)
    // ------------------------------------------------------------------
    let aiResult;
    try {
      aiResult = await runAiModeration({
        productId,
        mediaUrls,
        imageHashes,
        contentHash,
      });
    } catch (aiError) {
      const errorMsg = (aiError as Error).message;
      const isTimeout = errorMsg === 'AI_TIMEOUT';
      const isAllFailed = errorMsg === 'AI_ALL_PROVIDERS_FAILED';

      // Fallback to HUMAN_REVIEW (self-check #3)
      await prisma.product.update({
        where: { id: productId },
        data: { status: 'HUMAN_REVIEW' },
      });

      await createModerationLog(prisma, {
        productId,
        action: isTimeout ? 'AI_SCAN_TIMEOUT' : 'AI_SCAN_FAILED',
        actorType: 'SYSTEM',
        fromStatus: 'PENDING',
        toStatus: 'HUMAN_REVIEW',
        humanNotes: errorMsg,
      });

      // Alert ops team (self-check #3)
      await sendSlackAlert({
        level: 'ERROR',
        title: isTimeout ? '⏱ AI Scan Timeout' : '❌ AI Scan Failed',
        message: `Product ${productId} ${isTimeout ? 'timed out after 5s' : 'failed on all providers'} — moved to HUMAN_REVIEW`,
        productId,
        jobId: job.id,
      });

      return {
        productId,
        newStatus: 'HUMAN_REVIEW',
        aiResult: {
          overallScore: 0,
          approved: false,
          violations: [],
          modelVersion: 'error',
          processingMs: Date.now() - startMs,
          fromCache: false,
        },
        processingMs: Date.now() - startMs,
      };
    }

    // ------------------------------------------------------------------
    // Step 3: Determine new status
    // ------------------------------------------------------------------
    const newStatus = determineStatusFromAiResult(aiResult);

    // ------------------------------------------------------------------
    // Step 4: Update product status atomically
    // ------------------------------------------------------------------
    await prisma.product.update({
      where: { id: productId },
      data: {
        status: newStatus,
        aiConfidenceScore: aiResult.overallScore,
        aiProcessedAt: new Date(),
        aiModelVersion: aiResult.modelVersion,
      },
    });

    // ------------------------------------------------------------------
    // Step 5: Log the result
    // ------------------------------------------------------------------
    await createModerationLog(prisma, {
      productId,
      action: newStatus === 'AI_APPROVED' ? 'AI_AUTO_APPROVED' : 'AI_FLAGGED',
      actorType: 'AI',
      fromStatus: 'PENDING',
      toStatus: newStatus,
      aiResult,
      reviewDurationSeconds: Math.round((Date.now() - startMs) / 1000),
    });

    // ------------------------------------------------------------------
    // Step 6: If approved, enqueue QR code generation
    // ------------------------------------------------------------------
    if (newStatus === 'AI_APPROVED') {
      await enqueueQrGeneration(productId);
    }

    // ------------------------------------------------------------------
    // Step 7: Alert on high-confidence violations
    // ------------------------------------------------------------------
    if (newStatus === 'REJECTED' && aiResult.overallScore > 0.9) {
      await sendSlackAlert({
        level: 'WARNING',
        title: '🚨 Sản phẩm vi phạm nghiêm trọng',
        message: `Product ${productId} score=${aiResult.overallScore.toFixed(2)} violations=${aiResult.violations.map((v) => v.type).join(', ')}`,
        productId,
        jobId: job.id,
      });
    }

    const processingMs = Date.now() - startMs;
    console.info(`[Worker] ${productId} → ${newStatus} (${processingMs}ms, cache=${aiResult.fromCache})`);

    return { productId, newStatus, aiResult, processingMs };
  },
  {
    connection: redisConnection,
    concurrency: 5,              // 5 parallel AI calls
    lockDuration: 60_000,        // 60s lock (self-check #1 — prevents race)
    lockRenewTime: 20_000,       // Renew every 20s for long-running jobs
  },
);

// ---------------------------------------------------------------------------
// Worker event handlers
// ---------------------------------------------------------------------------

moderationWorker.on('failed', async (job, err) => {
  if (!job) return;
  const { productId } = job.data;
  const isFinalAttempt = job.attemptsMade >= (job.opts.attempts ?? 3);

  if (isFinalAttempt) {
    // After all retries failed → force HUMAN_REVIEW
    await prisma.product.update({
      where: { id: productId },
      data: { status: 'HUMAN_REVIEW' },
    }).catch(console.error);

    await sendSlackAlert({
      level: 'ERROR',
      title: '❌ Moderation job exhausted all retries',
      message: `Product ${productId} failed after ${job.attemptsMade} attempts: ${err.message}`,
      productId,
      jobId: job.id,
    });
  }
});

moderationWorker.on('error', (err) => {
  console.error('[ModerationWorker] Unhandled error:', err);
});

// ---------------------------------------------------------------------------
// QR Worker
// ---------------------------------------------------------------------------

export const qrWorker = new Worker(
  QUEUE_NAMES.QR_GENERATE,
  async (job: Job<{ productId: string }>) => {
    const { productId } = job.data;
    const { generateQrCode } = await import('../services/qrCodeService');
    await generateQrCode(prisma, productId);
  },
  { connection: redisConnection, concurrency: 10 },
);

// ---------------------------------------------------------------------------
// Slack Alert Worker
// ---------------------------------------------------------------------------

export const slackWorker = new Worker(
  QUEUE_NAMES.SLACK_ALERT,
  async (job: Job) => {
    const { level, title, message } = job.data;
    const webhookUrl = process.env.SLACK_WEBHOOK_URL;
    if (!webhookUrl) return;

    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `[${level}] ${title}`,
        blocks: [
          {
            type: 'section',
            text: { type: 'mrkdwn', text: `*[${level}] ${title}*\n${message}` },
          },
        ],
      }),
    });
  },
  { connection: redisConnection, concurrency: 3 },
);
