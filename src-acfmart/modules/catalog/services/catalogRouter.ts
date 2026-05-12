// @ts-nocheck — server-side only (Prisma/BullMQ not installed in frontend bundle)
// =============================================================================
// Catalog Router — tRPC-compatible service layer
// Self-check #4: Correct fee formula (effectivePrice = price - shopDiscount)
// Self-check #5: Consent validation before upload (NĐ 13/2023)
// =============================================================================

import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import { enqueueModerationJob } from '../lib/queue';
import {
  createModerationLog,
  moderationLogImmutabilityMiddleware,
  exportAuditLogs,
} from './moderationLogService';
import { calculatePricing } from '../types';
import type {
  ProductDraft,
  ModerationDecision,
  ModerationQueueItem,
  ApiResponse,
} from '../types';

const prisma = new PrismaClient();
// @ts-expect-error — middleware
prisma.$use(moderationLogImmutabilityMiddleware);

// ---------------------------------------------------------------------------
// Input validators
// ---------------------------------------------------------------------------

function validatePrice(price: number, shopDiscount: number): void {
  if (price <= 0) throw new Error('Giá sản phẩm phải lớn hơn 0');
  if (shopDiscount < 0) throw new Error('Giảm giá không được âm');
  if (shopDiscount >= price) throw new Error('Giảm giá không được lớn hơn hoặc bằng giá gốc');
}

function validateConsent(consentScope: string[]): void {
  // NĐ 13/2023: purpose must be declared before processing
  const required = ['PRODUCT_SCAN', 'LABEL_OCR'];
  for (const purpose of required) {
    if (!consentScope.includes(purpose)) {
      throw new Error(`Cần đồng ý mục đích "${purpose}" trước khi xử lý ảnh (NĐ 13/2023)`);
    }
  }
}

// ---------------------------------------------------------------------------
// Submit product for AI moderation
// ---------------------------------------------------------------------------

export async function submitProduct(
  shopId: string,
  draft: ProductDraft,
): Promise<ApiResponse<{ productId: string; jobId: string }>> {
  try {
    // 1. Validate consent (self-check #5, NĐ 13/2023)
    validateConsent(draft.consentScope);

    // 2. Validate pricing (self-check #4)
    validatePrice(draft.price, draft.shopDiscount);

    // 3. Compute pricing breakdown
    const pricing = calculatePricing(
      draft.price,
      draft.shopDiscount,
      0.05,   // 5% platform fee rate
      0,      // No listing fee for MVP
    );

    // 4. Compute content hash for dedup
    const primaryHash = draft.mediaFiles[0]?.imageHash ?? 'no-image';
    const contentHash = crypto
      .createHash('sha256')
      .update(`${draft.name}:${draft.barcode ?? ''}:${primaryHash}`)
      .digest('hex');

    // 5. Create product in DB
    const product = await prisma.product.create({
      data: {
        shopId,
        name: draft.name,
        description: draft.description,
        category: draft.category,
        origin: draft.origin || null,
        price: pricing.price,
        shopDiscount: pricing.shopDiscount,
        platformFeeRate: pricing.platformFeeRate,
        brandName: draft.brandName || null,
        manufacturerName: draft.manufacturerName || null,
        originCountry: draft.originCountry || null,
        batchNumber: draft.batchNumber || null,
        barcode: draft.barcode || null,
        status: 'PENDING',
        contentHash,
        media: {
          create: draft.mediaFiles.map((f, i) => ({
            type: 'IMAGE' as const,
            url: f.storageKey ?? f.previewUrl,
            storageKey: f.storageKey ?? '',
            imageHash: f.imageHash,
            isPrimary: i === 0,
            sortOrder: i,
            faceDetected: f.faceDetected ?? false,
            faceBlurApplied: f.faceDetected ?? false,
          })),
        },
      },
      include: { media: true },
    });

    // 6. Log creation
    await createModerationLog(prisma, {
      productId: product.id,
      action: 'AI_SCAN_STARTED',
      actorId: shopId,
      actorType: 'SYSTEM',
      toStatus: 'PENDING',
    });

    // 7. Enqueue AI moderation job
    const jobId = await enqueueModerationJob({
      productId: product.id,
      shopId,
      mediaUrls: product.media.map((m) => m.url),
      imageHashes: product.media.map((m) => m.imageHash ?? ''),
      contentHash,
      priority: 'NORMAL',
      attempt: 1,
    });

    return { success: true, data: { productId: product.id, jobId } };
  } catch (err) {
    return {
      success: false,
      code: 'SUBMIT_FAILED',
      message: (err as Error).message,
    };
  }
}

// ---------------------------------------------------------------------------
// Get moderation queue for admin
// ---------------------------------------------------------------------------

export async function getModerationQueue(params: {
  status?: string[];
  page?: number;
  pageSize?: number;
}): Promise<ApiResponse<{ items: ModerationQueueItem[]; total: number }>> {
  try {
    const { status = ['HUMAN_REVIEW'], page = 1, pageSize = 20 } = params;

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where: { status: { in: status as any } },
        orderBy: { createdAt: 'asc' },
        take: pageSize,
        skip: (page - 1) * pageSize,
        include: {
          shop: { select: { shopName: true } },
          media: { where: { isPrimary: true }, select: { url: true } },
          moderationLogs: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: { aiScore: true, violationTypes: true },
          },
        },
      }),
      prisma.product.count({ where: { status: { in: status as any } } }),
    ]);

    const deadline24h = new Date();
    deadline24h.setHours(deadline24h.getHours() + 24);

    const queueItems: ModerationQueueItem[] = items.map((p) => {
      const latestLog = p.moderationLogs[0];
      const submittedAt = p.createdAt;
      const reviewDeadline = new Date(submittedAt);
      reviewDeadline.setHours(reviewDeadline.getHours() + 24);

      return {
        productId: p.id,
        productName: p.name,
        shopName: p.shop.shopName,
        status: p.status as any,
        aiScore: latestLog?.aiScore ?? undefined,
        violations: (latestLog?.violationTypes ?? []) as any,
        primaryImageUrl: p.media[0]?.url,
        submittedAt: submittedAt.toISOString(),
        reviewDeadline: reviewDeadline.toISOString(),
        isUrgent: new Date() > new Date(reviewDeadline.getTime() - 4 * 3_600_000),
      };
    });

    return { success: true, data: { items: queueItems, total } };
  } catch (err) {
    return { success: false, code: 'QUEUE_FETCH_FAILED', message: (err as Error).message };
  }
}

// ---------------------------------------------------------------------------
// Admin: approve / reject product
// ---------------------------------------------------------------------------

export async function moderateProduct(
  decision: ModerationDecision,
  reviewStartedAt: Date,
): Promise<ApiResponse<{ productId: string }>> {
  try {
    const product = await prisma.product.findUniqueOrThrow({
      where: { id: decision.productId },
    });

    const newStatus = decision.action === 'APPROVE'
      ? 'APPROVED'
      : decision.action === 'REJECT'
      ? 'REJECTED'
      : 'SUSPENDED';

    await prisma.product.update({
      where: { id: decision.productId },
      data: {
        status: newStatus,
        statusReason: decision.reason,
      },
    });

    const reviewDurationSeconds = Math.round(
      (Date.now() - reviewStartedAt.getTime()) / 1000,
    );

    await createModerationLog(prisma, {
      productId: decision.productId,
      action: decision.action === 'APPROVE' ? 'HUMAN_APPROVED' : 'HUMAN_REJECTED',
      actorId: decision.reviewerId,
      actorType: 'ADMIN',
      fromStatus: product.status as any,
      toStatus: newStatus as any,
      humanNotes: decision.reason,
      reviewDurationSeconds,
    });

    // If approved, generate QR
    if (decision.action === 'APPROVE') {
      const { enqueueQrGeneration } = await import('../lib/queue');
      await enqueueQrGeneration(decision.productId);
    }

    return { success: true, data: { productId: decision.productId } };
  } catch (err) {
    return { success: false, code: 'MODERATE_FAILED', message: (err as Error).message };
  }
}

// ---------------------------------------------------------------------------
// Admin: export audit logs
// ---------------------------------------------------------------------------

export async function exportModerationAudit(params: {
  from: string;
  to: string;
  productId?: string;
  format: 'csv' | 'json';
}): Promise<ApiResponse<string>> {
  try {
    const data = await exportAuditLogs(prisma, {
      from: new Date(params.from),
      to: new Date(params.to),
      productId: params.productId,
      format: params.format,
    });
    return { success: true, data };
  } catch (err) {
    return { success: false, code: 'EXPORT_FAILED', message: (err as Error).message };
  }
}
