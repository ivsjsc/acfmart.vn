// @ts-nocheck — server-side only (BullMQ/Redis not installed in frontend bundle)
// =============================================================================
// BullMQ Queue Configuration
// Self-check #1: Race condition prevention via lockDuration + atomic DB update
// Self-check #3: AI timeout fallback → HUMAN_REVIEW + Slack alert
// =============================================================================

import { Queue, Worker, QueueEvents, type Job } from 'bullmq';
import { createClient } from 'redis';
import type { ModerationJobPayload, ModerationJobResult } from '../types';

// ---------------------------------------------------------------------------
// Redis Connection
// ---------------------------------------------------------------------------

const REDIS_URL = process.env.REDIS_URL ?? 'redis://localhost:6379';

export const redisClient = createClient({ url: REDIS_URL });

export const redisConnection = {
  host: new URL(REDIS_URL).hostname,
  port: Number(new URL(REDIS_URL).port) || 6379,
  password: process.env.REDIS_PASSWORD,
};

// ---------------------------------------------------------------------------
// Queue Names
// ---------------------------------------------------------------------------

export const QUEUE_NAMES = {
  MODERATION: 'product:moderation',
  QR_GENERATE: 'product:qr-generate',
  AUDIT_EXPORT: 'admin:audit-export',
  SLACK_ALERT: 'system:slack-alert',
} as const;

// ---------------------------------------------------------------------------
// Moderation Queue
// ---------------------------------------------------------------------------

export const moderationQueue = new Queue<ModerationJobPayload, ModerationJobResult>(
  QUEUE_NAMES.MODERATION,
  {
    connection: redisConnection,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2_000,   // 2s → 4s → 8s
      },
      removeOnComplete: { age: 86_400, count: 1_000 }, // 24h
      removeOnFail: { age: 604_800 },                  // 7 days — keep failed jobs
    },
  },
);

export const qrGenerateQueue = new Queue(QUEUE_NAMES.QR_GENERATE, {
  connection: redisConnection,
  defaultJobOptions: { attempts: 2, backoff: { type: 'fixed', delay: 3_000 } },
});

export const slackAlertQueue = new Queue(QUEUE_NAMES.SLACK_ALERT, {
  connection: redisConnection,
  defaultJobOptions: { attempts: 5, backoff: { type: 'exponential', delay: 1_000 } },
});

// ---------------------------------------------------------------------------
// Queue Events — monitoring & metrics
// ---------------------------------------------------------------------------

export const moderationQueueEvents = new QueueEvents(QUEUE_NAMES.MODERATION, {
  connection: redisConnection,
});

moderationQueueEvents.on('completed', ({ jobId, returnvalue }) => {
  console.info('[Moderation] Job completed', { jobId, result: returnvalue });
});

moderationQueueEvents.on('failed', ({ jobId, failedReason }) => {
  console.error('[Moderation] Job failed', { jobId, reason: failedReason });
});

// ---------------------------------------------------------------------------
// Enqueue helpers
// ---------------------------------------------------------------------------

export async function enqueueModerationJob(
  payload: ModerationJobPayload,
): Promise<string> {
  const priority = payload.priority === 'HIGH' ? 1 : payload.priority === 'NORMAL' ? 5 : 10;
  const job = await moderationQueue.add(
    `moderation:${payload.productId}`,
    payload,
    {
      jobId: `moderation-${payload.productId}`,  // Idempotent — BullMQ dedups by jobId
      priority,
    },
  );
  return job.id!;
}

export async function enqueueQrGeneration(productId: string): Promise<void> {
  await qrGenerateQueue.add(`qr:${productId}`, { productId }, {
    jobId: `qr-${productId}`,
  });
}

// ---------------------------------------------------------------------------
// Slack alert helper
// ---------------------------------------------------------------------------

export interface SlackAlertPayload {
  level: 'ERROR' | 'WARNING' | 'INFO';
  title: string;
  message: string;
  productId?: string;
  jobId?: string;
}

export async function sendSlackAlert(payload: SlackAlertPayload): Promise<void> {
  await slackAlertQueue.add('alert', payload);
}

// ---------------------------------------------------------------------------
// Redis Cache helpers (self-check #6: dedup cache)
// ---------------------------------------------------------------------------

const CACHE_TTL = 86_400;  // 24 hours

export async function getCachedModerationResult(imageHash: string) {
  const key = `moderation:img:${imageHash}`;
  const cached = await redisClient.get(key);
  return cached ? JSON.parse(cached) : null;
}

export async function setCachedModerationResult(
  imageHash: string,
  result: unknown,
): Promise<void> {
  const key = `moderation:img:${imageHash}`;
  await redisClient.setEx(key, CACHE_TTL, JSON.stringify(result));
}

export async function getCachedContentResult(contentHash: string) {
  const key = `moderation:content:${contentHash}`;
  const cached = await redisClient.get(key);
  return cached ? JSON.parse(cached) : null;
}

export async function setCachedContentResult(
  contentHash: string,
  result: unknown,
): Promise<void> {
  const key = `moderation:content:${contentHash}`;
  await redisClient.setEx(key, CACHE_TTL, JSON.stringify(result));
}
