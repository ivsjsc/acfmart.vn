// @ts-nocheck — server-side only (Prisma/Redis not installed in frontend bundle)
// =============================================================================
// Fraud Detection Service
// Self-check #3: Click flood (Redis rate-limit)
// Self-check #4: Datacenter IP
// Self-check #7: Self-affiliate
// =============================================================================

import type { PrismaClient } from '@prisma/client';
import { createClient } from 'redis';
import { isDatacenterAsn, lookupIpIntel } from '../lib/fingerprint';
import type {
  FraudFlagType,
  FraudSeverity,
  ClickContext,
} from '../types';

const CLICK_FLOOD_LIMIT_PER_HOUR = 10;            // Self-check #3
const COOKIE_STUFFING_AFFILIATE_LIMIT = 5;        // 1 device → max N affiliates
const ZERO_CONVERSION_CLICK_THRESHOLD = 1000;     // 7d window

const redis = createClient({ url: process.env.REDIS_URL ?? 'redis://localhost:6379' });
redis.connect().catch(() => {/* lazy in test */});

// ---------------------------------------------------------------------------
// Click-time fraud screening (synchronous, < 50ms target)
// ---------------------------------------------------------------------------

export interface FraudScreenResult {
  flags: FraudFlagType[];
  severity: FraudSeverity;
  blocked: boolean;
  commissionEligible: boolean;
  reason?: string;
}

export async function screenClick(
  prisma: PrismaClient,
  ctx: ClickContext,
): Promise<FraudScreenResult> {
  const flags: FraudFlagType[] = [];
  let severity: FraudSeverity = 'LOW';
  let blocked = false;

  // --- Self-check #3: Click flood per device ---
  const fpKey = `fp:${ctx.deviceFingerprint}:1h`;
  const count = await redis.incr(fpKey);
  if (count === 1) await redis.expire(fpKey, 3600);
  if (count > CLICK_FLOOD_LIMIT_PER_HOUR) {
    flags.push('CLICK_FLOOD');
    severity = 'HIGH';
    blocked = true;
  }

  // --- Self-check #4: Datacenter IP / VPN ---
  const intel = await lookupIpIntel(ctx.ipAddress);
  if (intel.isDatacenter || isDatacenterAsn(intel.asn)) {
    flags.push('DATACENTER_IP');
    if (severity === 'LOW') severity = 'MEDIUM';
  }

  // --- Geo mismatch ---
  if (ctx.country && intel.country && ctx.country !== intel.country) {
    flags.push('GEO_MISMATCH');
    if (severity === 'LOW') severity = 'MEDIUM';
  }

  // --- Cookie stuffing: 1 fingerprint → many affiliates in 24h ---
  const distinctAffiliates = await prisma.affiliateClick.findMany({
    where: {
      deviceFingerprint: ctx.deviceFingerprint,
      createdAt: { gte: new Date(Date.now() - 24 * 3600 * 1000) },
    },
    distinct: ['linkId'],
    select: { link: { select: { affiliateId: true } } },
  });
  const uniqueAffs = new Set(distinctAffiliates.map((c) => c.link.affiliateId));
  if (uniqueAffs.size > COOKIE_STUFFING_AFFILIATE_LIMIT) {
    flags.push('COOKIE_STUFFING');
    severity = 'HIGH';
  }

  // --- Referrer spoof: empty referrer on a click that should have one ---
  if (!ctx.referrer || ctx.referrer === 'null') {
    flags.push('REFERRER_SPOOF');
    // Low severity — many privacy browsers strip referrer legitimately
  }

  // Persist flag if any non-trivial signal
  if (flags.length > 0 && severity !== 'LOW') {
    await prisma.fraudFlag.create({
      data: {
        type: flags[0],
        severity,
        entityType: 'device',
        entityKey: ctx.deviceFingerprint,
        reason: flags.join(','),
        evidence: {
          ipAsn: intel.asn,
          ipCountry: intel.country,
          clickCountInWindow: count,
          distinctAffiliates: uniqueAffs.size,
        },
        isBlocked: blocked,
      },
    });
  }

  const commissionEligible = !blocked && !flags.includes('DATACENTER_IP');

  return {
    flags,
    severity,
    blocked,
    commissionEligible,
    reason: flags.length > 0 ? `Detected: ${flags.join(', ')}` : undefined,
  };
}

// ---------------------------------------------------------------------------
// Self-check #7: Self-affiliate guard (called at attribution time)
// ---------------------------------------------------------------------------

export async function checkSelfAffiliate(
  prisma: PrismaClient,
  affiliateId: string,
  customerId: string,
): Promise<boolean> {
  if (affiliateId === customerId) {
    await prisma.fraudFlag.create({
      data: {
        type: 'SELF_AFFILIATE',
        severity: 'CRITICAL',
        entityType: 'affiliate',
        entityKey: affiliateId,
        reason: 'Affiliate purchased through their own link',
        evidence: { customerId },
        isBlocked: true,
      },
    });
    return true;
  }
  return false;
}

// ---------------------------------------------------------------------------
// Batch job: zero-conversion ratio (called by node-cron daily)
// ---------------------------------------------------------------------------

export async function flagZeroConversionAffiliates(prisma: PrismaClient): Promise<number> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000);

  const grouped = await prisma.affiliateClick.groupBy({
    by: ['linkId'],
    where: { createdAt: { gte: sevenDaysAgo } },
    _count: true,
    having: { linkId: { _count: { gt: ZERO_CONVERSION_CLICK_THRESHOLD } } },
  });

  let flagged = 0;
  for (const g of grouped) {
    const conv = await prisma.affiliateConversion.count({
      where: { linkId: g.linkId, convertedAt: { gte: sevenDaysAgo } },
    });
    if (conv === 0) {
      const link = await prisma.affiliateLink.findUnique({ where: { id: g.linkId } });
      if (!link) continue;
      await prisma.fraudFlag.create({
        data: {
          type: 'ZERO_CONVERSION_RATIO',
          severity: 'MEDIUM',
          entityType: 'affiliate',
          entityKey: link.affiliateId,
          reason: `${g._count} clicks 0 conversions in 7d`,
          evidence: { linkId: g.linkId, clicks: g._count },
          isBlocked: false,
        },
      });
      flagged++;
    }
  }
  return flagged;
}

// ---------------------------------------------------------------------------
// Admin: block / unblock entity
// ---------------------------------------------------------------------------

export async function blockEntity(
  prisma: PrismaClient,
  flagId: string,
  reviewerId: string,
): Promise<void> {
  await prisma.fraudFlag.update({
    where: { id: flagId },
    data: { isBlocked: true, reviewedBy: reviewerId, reviewedAt: new Date() },
  });
}

export async function unblockEntity(
  prisma: PrismaClient,
  flagId: string,
  reviewerId: string,
): Promise<void> {
  await prisma.fraudFlag.update({
    where: { id: flagId },
    data: { isBlocked: false, reviewedBy: reviewerId, reviewedAt: new Date() },
  });
}
