// =============================================================================
// Catalog & AI Moderation — TypeScript Types
// =============================================================================

// ---------------------------------------------------------------------------
// Status & Enums
// ---------------------------------------------------------------------------

export type ProductStatus =
  | 'DRAFT'
  | 'PENDING'
  | 'AI_APPROVED'
  | 'HUMAN_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'SUSPENDED';

export type ModerationAction =
  | 'AI_SCAN_STARTED'
  | 'AI_SCAN_COMPLETED'
  | 'AI_SCAN_FAILED'
  | 'AI_SCAN_TIMEOUT'
  | 'AI_AUTO_APPROVED'
  | 'AI_FLAGGED'
  | 'HUMAN_APPROVED'
  | 'HUMAN_REJECTED'
  | 'SUSPENDED'
  | 'REINSTATED'
  | 'APPEAL_SUBMITTED'
  | 'APPEAL_RESOLVED';

export type ViolationType =
  | 'COUNTERFEIT'
  | 'PROHIBITED_ITEM'
  | 'MISLEADING_DESCRIPTION'
  | 'MISSING_LABEL_INFO'
  | 'DANGEROUS_PRODUCT'
  | 'PRICE_MANIPULATION'
  | 'COPYRIGHT_INFRINGEMENT'
  | 'ADULT_CONTENT'
  | 'OCR_LABEL_MISMATCH';

// ---------------------------------------------------------------------------
// AI Moderation Result
// ---------------------------------------------------------------------------

export interface AiViolationFlag {
  type: ViolationType;
  confidence: number;           // 0.0 – 1.0
  reasoning: string;
  highlightRegions?: BoundingBox[];
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
}

export interface AiModerationResult {
  overallScore: number;          // 0 = clean, 1 = definitely violating
  approved: boolean;
  violations: AiViolationFlag[];
  ocrText?: string;
  modelVersion: string;
  processingMs: number;
  fromCache: boolean;            // Hit Redis dedup cache
}

// ---------------------------------------------------------------------------
// Upload Wizard
// ---------------------------------------------------------------------------

export interface UploadStep {
  id: number;
  label: string;
  description: string;
}

export const UPLOAD_STEPS: UploadStep[] = [
  { id: 1, label: 'Hình ảnh', description: 'Tải lên ảnh sản phẩm' },
  { id: 2, label: 'Thông tin', description: 'Điền thông tin sản phẩm' },
  { id: 3, label: 'Nhãn & Giá', description: 'Thông tin pháp lý & giá' },
  { id: 4, label: 'Xác nhận', description: 'Xem lại và đăng' },
];

export interface UploadedFile {
  id: string;
  file: File;
  previewUrl: string;
  uploadProgress: number;       // 0-100
  storageKey?: string;
  imageHash?: string;
  faceDetected?: boolean;
}

export interface ProductDraft {
  // Step 1
  mediaFiles: UploadedFile[];

  // Step 2
  name: string;
  description: string;
  category: string;
  origin: 'domestic' | 'imported' | '';

  // Step 3 — NĐ 43/2017
  price: number;
  shopDiscount: number;
  brandName: string;
  manufacturerName: string;
  originCountry: string;
  batchNumber: string;
  barcode: string;

  // Consent — NĐ 13/2023
  consentScope: string[];
}

// ---------------------------------------------------------------------------
// Pricing formula (fix self-check #4)
// ---------------------------------------------------------------------------

export interface PricingBreakdown {
  price: number;
  shopDiscount: number;
  effectivePrice: number;        // price - shopDiscount
  platformFeeRate: number;
  commission: number;            // effectivePrice * platformFeeRate
  listingFee: number;
  totalPlatformCost: number;     // commission + listingFee
  sellerReceives: number;        // effectivePrice - totalPlatformCost
}

export function calculatePricing(
  price: number,
  shopDiscount: number,
  platformFeeRate: number,
  listingFee: number,
): PricingBreakdown {
  const effectivePrice = Math.max(0, price - shopDiscount);
  const commission = effectivePrice * platformFeeRate;
  const totalPlatformCost = commission + listingFee;
  return {
    price,
    shopDiscount,
    effectivePrice,
    platformFeeRate,
    commission,
    listingFee,
    totalPlatformCost,
    sellerReceives: Math.max(0, effectivePrice - totalPlatformCost),
  };
}

// ---------------------------------------------------------------------------
// Moderation Queue
// ---------------------------------------------------------------------------

export interface ModerationQueueItem {
  productId: string;
  productName: string;
  shopName: string;
  status: ProductStatus;
  aiScore?: number;
  violations: ViolationType[];
  primaryImageUrl?: string;
  submittedAt: string;
  reviewDeadline: string;        // SLA: HUMAN_REVIEW must be resolved within 24h
  isUrgent: boolean;
}

export interface ModerationDecision {
  productId: string;
  action: 'APPROVE' | 'REJECT' | 'SUSPEND';
  reason?: string;
  violations?: ViolationType[];
  reviewerId: string;
}

// ---------------------------------------------------------------------------
// Queue Job Payload
// ---------------------------------------------------------------------------

export interface ModerationJobPayload {
  productId: string;
  shopId: string;
  mediaUrls: string[];
  imageHashes: string[];
  contentHash: string;
  priority: 'HIGH' | 'NORMAL' | 'LOW';
  attempt: number;
}

export interface ModerationJobResult {
  productId: string;
  newStatus: ProductStatus;
  aiResult: AiModerationResult;
  processingMs: number;
}

// ---------------------------------------------------------------------------
// API Responses
// ---------------------------------------------------------------------------

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  code: string;
  message: string;
  details?: unknown;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
