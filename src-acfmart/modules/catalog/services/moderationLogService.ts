// @ts-nocheck — server-side only (Prisma not installed in frontend bundle)
// =============================================================================
// ModerationLog Service — Immutable Hash Chain
// Self-check #2: SHA-256 hash chain, Prisma middleware blocks UPDATE/DELETE
// Self-check #7: CSV/JSON export for NĐ 98/2020 compliance
// =============================================================================

import crypto from 'crypto';
import type { PrismaClient } from '@prisma/client';
import type {
  ModerationAction,
  ViolationType,
  ProductStatus,
  AiModerationResult,
} from '../types';

// ---------------------------------------------------------------------------
// Hash computation
// ---------------------------------------------------------------------------

export function computeLogHash(data: {
  id: string;
  productId: string;
  action: string;
  actorId: string | null;
  createdAt: string;
  previousHash: string;
}): string {
  const payload = JSON.stringify(data);
  return crypto.createHash('sha256').update(payload).digest('hex');
}

// ---------------------------------------------------------------------------
// Get previous hash for chain
// ---------------------------------------------------------------------------

async function getPreviousHash(
  prisma: PrismaClient,
  productId: string,
): Promise<string> {
  const last = await prisma.moderationLog.findFirst({
    where: { productId },
    orderBy: { createdAt: 'desc' },
    select: { dataHash: true },
  });
  return last?.dataHash ?? 'GENESIS';
}

// ---------------------------------------------------------------------------
// Create immutable log entry
// ---------------------------------------------------------------------------

export async function createModerationLog(
  prisma: PrismaClient,
  params: {
    productId: string;
    action: ModerationAction;
    actorId?: string;
    actorType: 'AI' | 'ADMIN' | 'SYSTEM';
    fromStatus?: ProductStatus;
    toStatus?: ProductStatus;
    aiResult?: AiModerationResult;
    humanNotes?: string;
    reviewDurationSeconds?: number;
  },
) {
  const {
    productId,
    action,
    actorId = null,
    actorType,
    fromStatus,
    toStatus,
    aiResult,
    humanNotes,
    reviewDurationSeconds,
  } = params;

  const id = crypto.randomUUID();
  const now = new Date();
  const previousHash = await getPreviousHash(prisma, productId);

  const dataHash = computeLogHash({
    id,
    productId,
    action,
    actorId,
    createdAt: now.toISOString(),
    previousHash,
  });

  return prisma.moderationLog.create({
    data: {
      id,
      productId,
      action,
      actorId,
      actorType,
      fromStatus,
      toStatus,
      aiScore: aiResult?.overallScore,
      aiModelVersion: aiResult?.modelVersion,
      violationTypes: (aiResult?.violations.map((v) => v.type) ?? []) as ViolationType[],
      reasoning: aiResult?.violations.map((v) => v.reasoning).join('; '),
      rawAiResponse: aiResult ? (aiResult as unknown as Record<string, unknown>) : undefined,
      humanNotes,
      reviewDuration: reviewDurationSeconds,
      dataHash,
      previousHash,
      createdAt: now,
    },
  });
}

// ---------------------------------------------------------------------------
// Verify hash chain integrity
// ---------------------------------------------------------------------------

export async function verifyHashChain(
  prisma: PrismaClient,
  productId: string,
): Promise<{ valid: boolean; firstInvalidId?: string }> {
  const logs = await prisma.moderationLog.findMany({
    where: { productId },
    orderBy: { createdAt: 'asc' },
  });

  let previousHash = 'GENESIS';
  for (const log of logs) {
    if (log.previousHash !== previousHash) {
      return { valid: false, firstInvalidId: log.id };
    }
    const expectedHash = computeLogHash({
      id: log.id,
      productId: log.productId,
      action: log.action,
      actorId: log.actorId,
      createdAt: log.createdAt.toISOString(),
      previousHash: log.previousHash,
    });
    if (expectedHash !== log.dataHash) {
      return { valid: false, firstInvalidId: log.id };
    }
    previousHash = log.dataHash;
  }
  return { valid: true };
}

// ---------------------------------------------------------------------------
// Prisma middleware — block UPDATE/DELETE on ModerationLog (self-check #2)
// ---------------------------------------------------------------------------

// Call this when initialising PrismaClient:
// prisma.$use(moderationLogImmutabilityMiddleware);
export async function moderationLogImmutabilityMiddleware(
  params: { model?: string; action: string },
  next: (params: unknown) => Promise<unknown>,
) {
  if (
    params.model === 'ModerationLog' &&
    (params.action === 'update' ||
      params.action === 'updateMany' ||
      params.action === 'delete' ||
      params.action === 'deleteMany')
  ) {
    throw new Error(
      'ModerationLog is immutable — UPDATE/DELETE operations are forbidden.',
    );
  }
  return next(params);
}

// ---------------------------------------------------------------------------
// Audit export (self-check #7, NĐ 98/2020)
// ---------------------------------------------------------------------------

export async function exportAuditLogs(
  prisma: PrismaClient,
  params: {
    from: Date;
    to: Date;
    productId?: string;
    format: 'csv' | 'json';
  },
): Promise<string> {
  const where = {
    createdAt: { gte: params.from, lte: params.to },
    ...(params.productId ? { productId: params.productId } : {}),
  };

  // Cursor-based streaming for large datasets
  const batchSize = 1_000;
  let cursor: string | undefined;
  const rows: string[] = [];

  if (params.format === 'csv') {
    rows.push(
      'id,productId,action,actorId,actorType,fromStatus,toStatus,aiScore,violations,createdAt,dataHash',
    );
  }

  do {
    const logs = await prisma.moderationLog.findMany({
      where,
      take: batchSize,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { createdAt: 'asc' },
    });

    if (logs.length === 0) break;

    for (const log of logs) {
      if (params.format === 'csv') {
        rows.push(
          [
            log.id,
            log.productId,
            log.action,
            log.actorId ?? '',
            log.actorType,
            log.fromStatus ?? '',
            log.toStatus ?? '',
            log.aiScore ?? '',
            log.violationTypes.join('|'),
            log.createdAt.toISOString(),
            log.dataHash,
          ].join(','),
        );
      } else {
        rows.push(JSON.stringify(log));
      }
    }

    cursor = logs[logs.length - 1].id;
    if (logs.length < batchSize) break;
  } while (true);

  return params.format === 'csv' ? rows.join('\n') : `[${rows.join(',')}]`;
}
