// @ts-nocheck — server-side only (Prisma not installed in frontend bundle)
// =============================================================================
// Attribution Service — LAST_CLICK rule
// Self-check #1: Dedup (sessionId, orderId) UNIQUE constraint
// Self-check #6: Attribution window (7d STANDARD / 30d PREMIUM)
// Self-check #7: Self-affiliate reject
// =============================================================================

import type { PrismaClient } from '@prisma/client';
import { getAttributionWindowDays } from '../lib/industryRates';
import { calculateCommission } from './commissionService';
import { checkSelfAffiliate } from './fraudDetectionService';
import type {
  AttributionRequest,
  AttributionResult,
} from '../types';

export async function attributeOrder(
  prisma: PrismaClient,
  req: AttributionRequest,
): Promise<AttributionResult> {
  // Step 1: dedup — has this (sessionId, orderId) already been attributed?
  const existing = await prisma.affiliateConversion.findUnique({
    where: { sessionId_orderId: { sessionId: req.sessionId, orderId: req.orderId } },
  });
  if (existing) {
    return {
      matched: false,
      reason: 'Already attributed (dedup hit)',
      conversionId: existing.id,
    };
  }

  // Step 2: find clicks within max possible window (30d), order DESC = LAST_CLICK
  const maxWindowAgo = new Date(Date.now() - 30 * 24 * 3600 * 1000);
  const candidates = await prisma.affiliateClick.findMany({
    where: {
      sessionId: req.sessionId,
      createdAt: { gte: maxWindowAgo, lte: req.orderTimestamp },
      commissionEligible: true,                       // skip flagged clicks
    },
    include: { link: true },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  // Step 3: pick the most recent click whose link tier's window covers it
  let winner: typeof candidates[number] | undefined;
  for (const c of candidates) {
    const windowDays = getAttributionWindowDays(c.link.tier);
    const cutoff = new Date(req.orderTimestamp.getTime() - windowDays * 24 * 3600 * 1000);
    if (c.createdAt >= cutoff) {
      // also: link must match product (or be generic)
      if (!c.link.productId || c.link.productId === req.productId) {
        winner = c;
        break;
      }
    }
  }

  if (!winner) {
    return { matched: false, reason: 'No click within attribution window' };
  }

  // Step 4: Self-check #7 — block self-affiliate
  const isSelf = await checkSelfAffiliate(prisma, winner.link.affiliateId, req.customerId);
  if (isSelf) {
    return { matched: false, reason: 'Self-affiliate fraud rejected' };
  }

  // Step 5: compute commission
  const commission = calculateCommission({
    price: req.amount,
    shopDiscount: req.shopDiscount,
    industry: req.industry,
    tier: winner.link.tier,
  });

  // Step 6: persist (UNIQUE will prevent race condition double-write)
  try {
    const conversion = await prisma.affiliateConversion.create({
      data: {
        linkId: winner.linkId,
        clickId: winner.id,
        orderId: req.orderId,
        productId: req.productId,
        customerId: req.customerId,
        affiliateId: winner.link.affiliateId,
        sessionId: req.sessionId,
        amount: commission.effectivePrice,
        industryRate: commission.industryRate,
        grossCommission: commission.grossCommission,
        platformFee: commission.platformFee,
        payoutFee: commission.payoutFee,
        netCommission: commission.netCommission,
        attributionDays: getAttributionWindowDays(winner.link.tier),
        status: 'PENDING',
      },
    });

    return {
      matched: true,
      conversionId: conversion.id,
      winningClickId: winner.id,
      attributionDays: conversion.attributionDays,
      commission,
    };
  } catch (err) {
    if (String(err).includes('Unique constraint')) {
      return { matched: false, reason: 'Race condition — already attributed' };
    }
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Status transitions: PENDING → APPROVED (after T+7), → PAYABLE, → PAID
// ---------------------------------------------------------------------------

export async function approveCommissions(prisma: PrismaClient): Promise<number> {
  // After 7 days from conversion (return-window expired)
  const cutoff = new Date(Date.now() - 7 * 24 * 3600 * 1000);
  const result = await prisma.affiliateConversion.updateMany({
    where: { status: 'PENDING', convertedAt: { lte: cutoff } },
    data: { status: 'APPROVED', approvedAt: new Date() },
  });
  return result.count;
}

export async function reverseCommission(
  prisma: PrismaClient,
  orderId: string,
  reason: string,
): Promise<void> {
  await prisma.affiliateConversion.updateMany({
    where: { orderId, status: { in: ['PENDING', 'APPROVED', 'PAYABLE'] } },
    data: { status: 'REVERSED', reversedAt: new Date(), reversalReason: reason },
  });
}
