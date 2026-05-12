// @ts-nocheck — server-side only (Prisma not installed in frontend bundle)
// =============================================================================
// Affiliate Router — tRPC-compatible
// Endpoints: generateLink, trackClick, getAttribution, calculateCommission,
//            requestPayout, getDashboard, listFraudFlags, blockFlag
// =============================================================================

import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import { hashPii, lookupIpIntel } from '../lib/fingerprint';
import { inferIndustry, getAttributionWindowDays } from '../lib/industryRates';
import { calculateCommission as calcCommission } from './commissionService';
import { screenClick } from './fraudDetectionService';
import { attributeOrder } from './attributionService';
import type {
  ApiResponse,
  AffiliateTier,
  Industry,
  ClickResult,
  CommissionBreakdown,
  AttributionRequest,
  AttributionResult,
  AffiliateKpi,
  AffiliateChartPoint,
  PayoutRequest,
  PayoutStatus,
  ConsentScope,
  FraudFlagType,
  FraudSeverity,
} from '../types';
import { MANUAL_REVIEW_THRESHOLD } from '../types';

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// 1) generateLink
// ---------------------------------------------------------------------------

export async function generateLink(input: {
  affiliateId: string;
  productId?: string;
  destinationUrl: string;
  industry?: Industry;
  tier?: AffiliateTier;
}): Promise<ApiResponse<{ linkId: string; slug: string; trackingUrl: string }>> {
  try {
    const slug = crypto.randomBytes(4).toString('hex');                  // 8 hex chars
    const industry = input.industry ?? 'default';
    const tier = input.tier ?? 'STANDARD';

    const link = await prisma.affiliateLink.create({
      data: {
        affiliateId: input.affiliateId,
        productId: input.productId ?? null,
        slug,
        destinationUrl: input.destinationUrl,
        industry,
        tier,
        isActive: true,
      },
    });

    const baseUrl = process.env.PUBLIC_URL ?? 'https://acf.vn';
    const trackingUrl = `${baseUrl}/r/${slug}`;
    return { success: true, data: { linkId: link.id, slug, trackingUrl } };
  } catch (err) {
    return { success: false, code: 'GENERATE_FAILED', message: (err as Error).message };
  }
}

// ---------------------------------------------------------------------------
// 2) trackClick — Self-check #5 (consent required)
// ---------------------------------------------------------------------------

export async function trackClick(input: {
  slug: string;
  sessionId: string;
  ipAddress: string;
  userAgent: string;
  deviceFingerprint: string;
  referrer?: string;
  consentLogId?: string;
  country?: string;
}): Promise<ApiResponse<ClickResult>> {
  try {
    // Self-check #5: consent required (NĐ 13/2023)
    if (!input.consentLogId) {
      return {
        success: false,
        code: 'CONSENT_REQUIRED',
        message: 'Cần đồng ý theo dõi trước khi click (NĐ 13/2023)',
      };
    }
    const consent = await prisma.consentLog.findUnique({ where: { id: input.consentLogId } });
    if (!consent || consent.revokedAt || !consent.scopes.includes('TRACKING')) {
      return { success: false, code: 'CONSENT_INVALID', message: 'Consent log không hợp lệ' };
    }

    // Resolve link
    const link = await prisma.affiliateLink.findUnique({ where: { slug: input.slug } });
    if (!link || !link.isActive) {
      return { success: false, code: 'LINK_NOT_FOUND', message: 'Link không tồn tại hoặc đã tắt' };
    }

    // Fraud screening (Self-check #3, #4)
    const screen = await screenClick(prisma, {
      linkSlug: input.slug,
      sessionId: input.sessionId,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
      deviceFingerprint: input.deviceFingerprint,
      referrer: input.referrer,
      consentLogId: input.consentLogId,
      country: input.country,
    });

    if (screen.blocked) {
      return { success: false, code: 'BLOCKED_BY_FRAUD', message: screen.reason ?? 'Bị chặn' };
    }

    const intel = await lookupIpIntel(input.ipAddress);

    const click = await prisma.affiliateClick.create({
      data: {
        linkId: link.id,
        sessionId: input.sessionId,
        ipHash: hashPii(input.ipAddress),
        ipCountry: intel.country ?? null,
        ipAsn: intel.asn ?? null,
        isDatacenter: intel.isDatacenter,
        deviceFingerprint: input.deviceFingerprint,
        userAgentHash: hashPii(input.userAgent),
        referrer: input.referrer ?? null,
        consentLogId: input.consentLogId,
        isSuspicious: screen.flags.length > 0,
        fraudFlags: screen.flags,
        commissionEligible: screen.commissionEligible,
      },
    });

    return {
      success: true,
      data: {
        clickId: click.id,
        destinationUrl: link.destinationUrl,
        isSuspicious: click.isSuspicious,
        flags: screen.flags,
        commissionEligible: click.commissionEligible,
      },
    };
  } catch (err) {
    return { success: false, code: 'TRACK_FAILED', message: (err as Error).message };
  }
}

// ---------------------------------------------------------------------------
// 3) getAttribution — called by Order module on order.confirm
// ---------------------------------------------------------------------------

export async function getAttribution(
  req: AttributionRequest,
): Promise<ApiResponse<AttributionResult>> {
  try {
    const result = await attributeOrder(prisma, req);
    return { success: true, data: result };
  } catch (err) {
    return { success: false, code: 'ATTRIBUTION_FAILED', message: (err as Error).message };
  }
}

// ---------------------------------------------------------------------------
// 4) calculateCommission — pure preview, no persistence
// ---------------------------------------------------------------------------

export function calculateCommission(input: {
  price: number;
  shopDiscount: number;
  category: string;
  tier: AffiliateTier;
}): ApiResponse<CommissionBreakdown> {
  try {
    const industry = inferIndustry(input.category);
    const breakdown = calcCommission({
      price: input.price,
      shopDiscount: input.shopDiscount,
      industry,
      tier: input.tier,
    });
    return { success: true, data: breakdown };
  } catch (err) {
    return { success: false, code: 'CALC_FAILED', message: (err as Error).message };
  }
}

// ---------------------------------------------------------------------------
// 5) requestPayout — Self-check #8 (manual review threshold)
// ---------------------------------------------------------------------------

export async function requestPayout(
  req: PayoutRequest,
): Promise<ApiResponse<{ payoutId: string; status: PayoutStatus; csvExportPath?: string }>> {
  try {
    // Validate conversions are PAYABLE and belong to affiliate
    const conversions = await prisma.affiliateConversion.findMany({
      where: { id: { in: req.conversionIds }, affiliateId: req.affiliateId },
    });
    if (conversions.length !== req.conversionIds.length) {
      return { success: false, code: 'INVALID_CONVERSIONS', message: 'Một số conversion không thuộc affiliate này' };
    }
    const sumNet = conversions.reduce((s, c) => s + c.netCommission, 0);
    if (Math.abs(sumNet - req.amount) > 1) {
      return { success: false, code: 'AMOUNT_MISMATCH', message: 'Tổng tiền không khớp' };
    }
    const notPayable = conversions.find((c) => c.status !== 'PAYABLE' && c.status !== 'APPROVED');
    if (notPayable) {
      return { success: false, code: 'NOT_PAYABLE', message: `Conversion ${notPayable.id} chưa sẵn sàng chi trả` };
    }

    // Self-check #8: manual review threshold
    const priorPaid = await prisma.affiliatePayout.count({
      where: { affiliateId: req.affiliateId, status: 'PAID' },
    });
    const isFirstPayout = priorPaid === 0;
    const requiresReview = req.amount > MANUAL_REVIEW_THRESHOLD && isFirstPayout;
    const status: PayoutStatus = requiresReview ? 'REQUIRES_MANUAL_REVIEW' : 'REQUESTED';

    // Phase 1: export CSV path (placeholder)
    const csvExportPath = `payouts/${req.affiliateId}-${Date.now()}.csv`;

    const payout = await prisma.affiliatePayout.create({
      data: {
        affiliateId: req.affiliateId,
        amount: req.amount,
        conversionIds: req.conversionIds,
        status,
        csvExportPath,
      },
    });

    return { success: true, data: { payoutId: payout.id, status, csvExportPath } };
  } catch (err) {
    return { success: false, code: 'PAYOUT_FAILED', message: (err as Error).message };
  }
}

// ---------------------------------------------------------------------------
// 6) getDashboard — KPI + chart data for AffiliateDashboard component
// ---------------------------------------------------------------------------

export async function getDashboard(input: {
  affiliateId: string;
  fromDate: string;
  toDate: string;
}): Promise<ApiResponse<{ kpi: AffiliateKpi; chart: AffiliateChartPoint[] }>> {
  try {
    const from = new Date(input.fromDate);
    const to = new Date(input.toDate);

    const [clicks, conversions, commissions] = await Promise.all([
      prisma.affiliateClick.findMany({
        where: { link: { affiliateId: input.affiliateId }, createdAt: { gte: from, lte: to } },
        select: { id: true, sessionId: true, createdAt: true },
      }),
      prisma.affiliateConversion.findMany({
        where: { affiliateId: input.affiliateId, convertedAt: { gte: from, lte: to } },
        select: { netCommission: true, status: true, convertedAt: true },
      }),
      prisma.affiliateConversion.groupBy({
        by: ['status'],
        where: { affiliateId: input.affiliateId },
        _sum: { netCommission: true },
      }),
    ]);

    const uniqueSessions = new Set(clicks.map((c) => c.sessionId));

    const pendingSum = commissions.find((g) => g.status === 'PENDING' || g.status === 'APPROVED');
    const paidSum = commissions.find((g) => g.status === 'PAID');
    const reversedSum = commissions.find((g) => g.status === 'REVERSED');

    const kpi: AffiliateKpi = {
      clicks: clicks.length,
      uniqueClicks: uniqueSessions.size,
      conversions: conversions.length,
      conversionRate: clicks.length > 0 ? conversions.length / clicks.length : 0,
      pendingCommission: pendingSum?._sum.netCommission ?? 0,
      paidCommission: paidSum?._sum.netCommission ?? 0,
      reversedCommission: reversedSum?._sum.netCommission ?? 0,
      ctr7d: clicks.length / 7,
    };

    // Bucket by day
    const buckets = new Map<string, AffiliateChartPoint>();
    for (const c of clicks) {
      const key = c.createdAt.toISOString().slice(0, 10);
      const b = buckets.get(key) ?? { date: key, clicks: 0, conversions: 0, commission: 0 };
      b.clicks++;
      buckets.set(key, b);
    }
    for (const c of conversions) {
      const key = c.convertedAt.toISOString().slice(0, 10);
      const b = buckets.get(key) ?? { date: key, clicks: 0, conversions: 0, commission: 0 };
      b.conversions++;
      b.commission += c.netCommission;
      buckets.set(key, b);
    }

    const chart = Array.from(buckets.values()).sort((a, b) => a.date.localeCompare(b.date));

    return { success: true, data: { kpi, chart } };
  } catch (err) {
    return { success: false, code: 'DASHBOARD_FAILED', message: (err as Error).message };
  }
}

// ---------------------------------------------------------------------------
// 7) Admin: list fraud flags + block/unblock
// ---------------------------------------------------------------------------

export async function listFraudFlags(input: {
  severity?: FraudSeverity[];
  blocked?: boolean;
  page?: number;
  pageSize?: number;
}): Promise<ApiResponse<{ items: unknown[]; total: number }>> {
  try {
    const { severity, blocked, page = 1, pageSize = 20 } = input;
    const where: Record<string, unknown> = {};
    if (severity?.length) where.severity = { in: severity };
    if (blocked !== undefined) where.isBlocked = blocked;

    const [items, total] = await Promise.all([
      prisma.fraudFlag.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: pageSize,
        skip: (page - 1) * pageSize,
      }),
      prisma.fraudFlag.count({ where }),
    ]);
    return { success: true, data: { items, total } };
  } catch (err) {
    return { success: false, code: 'LIST_FLAGS_FAILED', message: (err as Error).message };
  }
}

// ---------------------------------------------------------------------------
// 8) recordConsent — must be called before trackClick (Self-check #5)
// ---------------------------------------------------------------------------

export async function recordConsent(input: {
  sessionId: string;
  ipAddress: string;
  userAgent: string;
  scopes: ConsentScope[];
  policyVersion: string;
  policyText: string;
}): Promise<ApiResponse<{ consentLogId: string }>> {
  try {
    const log = await prisma.consentLog.create({
      data: {
        sessionId: input.sessionId,
        ipHash: hashPii(input.ipAddress),
        userAgentHash: hashPii(input.userAgent),
        scopes: input.scopes,
        version: input.policyVersion,
        policyHash: hashPii(input.policyText),
      },
    });
    return { success: true, data: { consentLogId: log.id } };
  } catch (err) {
    return { success: false, code: 'CONSENT_FAILED', message: (err as Error).message };
  }
}
