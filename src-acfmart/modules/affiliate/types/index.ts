// =============================================================================
// Affiliate Engine — TypeScript Types
// =============================================================================

export type AffiliateTier = 'STANDARD' | 'PREMIUM';

export type CommissionStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'PAYABLE'
  | 'PAID'
  | 'REVERSED';

export type PayoutStatus =
  | 'REQUESTED'
  | 'REQUIRES_MANUAL_REVIEW'
  | 'APPROVED'
  | 'PAID'
  | 'REJECTED';

export type FraudFlagType =
  | 'CLICK_FLOOD'
  | 'DATACENTER_IP'
  | 'GEO_MISMATCH'
  | 'COOKIE_STUFFING'
  | 'SELF_AFFILIATE'
  | 'ZERO_CONVERSION_RATIO'
  | 'REFERRER_SPOOF';

export type FraudSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type ConsentScope = 'TRACKING' | 'ANALYTICS' | 'MARKETING';

export type Industry =
  | 'food'
  | 'beverage'
  | 'cosmetics'
  | 'electronics'
  | 'fashion'
  | 'home'
  | 'default';

// ---------------------------------------------------------------------------
// Commission breakdown (Self-check #2)
// ---------------------------------------------------------------------------

export interface CommissionBreakdown {
  price: number;              // giá gross
  shopDiscount: number;
  effectivePrice: number;     // price - shopDiscount
  industry: Industry;
  industryRate: number;       // 0.05 - 0.12 theo barem
  grossCommission: number;    // effectivePrice * industryRate
  platformFee: number;        // hạ tầng (1.5% gross commission)
  payoutFee: number;          // bank transfer flat (5k VND)
  netCommission: number;      // gross - platformFee - payoutFee
}

// ---------------------------------------------------------------------------
// Tracking
// ---------------------------------------------------------------------------

export interface ClickContext {
  linkSlug: string;
  sessionId: string;
  ipAddress: string;          // raw IP (hashed before store)
  userAgent: string;          // raw UA (hashed before store)
  referrer?: string;
  deviceFingerprint: string;  // SHA-256 from client-side collector
  consentLogId?: string;      // bắt buộc nếu tracking-enabled region
  country?: string;
}

export interface ClickResult {
  clickId: string;
  destinationUrl: string;
  isSuspicious: boolean;
  flags: FraudFlagType[];
  commissionEligible: boolean;
}

// ---------------------------------------------------------------------------
// Attribution (Self-check #1, #6)
// ---------------------------------------------------------------------------

export interface AttributionRequest {
  orderId: string;
  customerId: string;
  productId: string;
  sessionId: string;
  amount: number;             // price
  shopDiscount: number;
  industry: Industry;
  orderTimestamp: Date;
}

export interface AttributionResult {
  matched: boolean;
  reason?: string;            // nếu không match
  conversionId?: string;
  winningClickId?: string;
  attributionDays?: number;
  commission?: CommissionBreakdown;
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

export interface AffiliateKpi {
  clicks: number;
  uniqueClicks: number;
  conversions: number;
  conversionRate: number;     // 0-1
  pendingCommission: number;
  paidCommission: number;
  reversedCommission: number;
  ctr7d: number;              // click-through trend
}

export interface AffiliateChartPoint {
  date: string;               // ISO YYYY-MM-DD
  clicks: number;
  conversions: number;
  commission: number;
}

// ---------------------------------------------------------------------------
// Payout (Self-check #8)
// ---------------------------------------------------------------------------

export const MANUAL_REVIEW_THRESHOLD = 500_000; // VND

export interface PayoutRequest {
  affiliateId: string;
  amount: number;
  conversionIds: string[];
}

// ---------------------------------------------------------------------------
// API envelope
// ---------------------------------------------------------------------------

export interface ApiSuccess<T> { success: true; data: T; }
export interface ApiError { success: false; code: string; message: string; }
export type ApiResponse<T> = ApiSuccess<T> | ApiError;
