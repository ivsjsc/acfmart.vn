export type VendorKycProviderId = "vnpt" | "fpt" | "manual"

export type SellerKycStatus =
  | "NOT_SUBMITTED"
  | "REQUESTED"
  | "PROCESSING"
  | "AUTO_CHECKING"
  | "MANUAL_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "TECHNICAL_ERROR"
  | "ERROR"
  | "EXPIRED"

export type LegacyVendorKycStatus =
  | "not_started"
  | "draft"
  | "submitted"
  | "provider_pending"
  | "approved"
  | "rejected"
  | "expired"
  | "failed"

export type VendorKycStatus = SellerKycStatus | LegacyVendorKycStatus

export type VendorKycLevel = "none" | "basic" | "verified" | "premium"

export interface SellerKycSessionRecord {
  id?: string | null
  sessionId?: string | null
  applicationId?: string | null
  provider?: VendorKycProviderId | string | null
  status?: SellerKycStatus | LegacyVendorKycStatus | string | null
  providerStatus?: string | null
  providerCode?: string | null
  providerMessage?: string | null
  technicalError?: unknown
  providerError?: unknown
  errorMessage?: string | null
  sdkUrl?: string | null
  redirectUrl?: string | null
  launchUrl?: string | null
  createdAt?: string | null
  updatedAt?: string | null
  expiresAt?: string | null
  submittedAt?: string | null
  verifiedAt?: string | null
  rejectedAt?: string | null
  sdkAvailable?: boolean | null
  unavailableReason?: string | null
  sdkConfig?: VnptSdkConfig | null
}

export interface VnptSdkConfig {
  backendUrl: string
  // SECURITY: Token fields are deprecated - backend proxy handles authentication
  // These fields are kept optional for backward compatibility but MUST NOT be used in frontend
  tokenId?: string
  tokenKey?: string
  accessToken?: string
  language: "vi" | "en"
  flowType: "DOCUMENT"
  typeDocument: number
  listItem: number[]
  useWebcam: boolean
  useUpload: boolean
  showResult: boolean
  showHelp: boolean
  showTrademark: boolean
  checkLivenessCard: boolean
  checkLivenessFace: boolean
  checkMaskedFace: boolean
  compareFace: boolean
  advanceLivenessFace: boolean
}

export interface SellerKycStatusPayload {
  sdkAvailable?: boolean | null
  unavailableReason?: string | null
  lastTechnicalErrorAt?: string | null
  sellerFinalStatus?: string | null
  sellerKycStatus?: string | null
  sellerStatus?: string | null
  finalStatus?: string | null
  kycStatus?: string | null
  latestVnptSessionStatus?: string | null
  latestSessionStatus?: string | null
  vnptSessionStatus?: string | null
  sessionStatus?: string | null
  adminManualReviewState?: string | null
  manualReviewState?: string | null
  adminReviewState?: string | null
  reviewState?: string | null
  technicalError?: unknown
  providerError?: unknown
  errorMessage?: string | null
  message?: string | null
  latestVnptSession?: SellerKycSessionRecord | null
  latestSession?: SellerKycSessionRecord | null
  session?: SellerKycSessionRecord | null
  sessions?: SellerKycSessionRecord[]
}

export interface StartSellerVnptKycSessionInput {
  returnUrl?: string
}

export interface StartSellerVnptKycSessionResult extends SellerKycSessionRecord {
  status?: SellerKycStatus | LegacyVendorKycStatus | string | null
  message?: string | null
  sdkAvailable?: boolean | null
  unavailableReason?: string | null
  sdkConfig?: VnptSdkConfig | null
}

export interface SubmitSellerVnptKycResultResponse {
  provider: "vnpt"
  sessionId: string
  status: SellerKycStatus | string
  accepted: boolean
  rawResultRedacted: true
  summary: {
    verified: boolean
    reasonCodes: string[]
    hasOcrData: boolean
    hasRawDocumentImage: boolean
    hasRawFaceImage: boolean
    [key: string]: unknown
  }
}

export const KYC_STATUS_LABELS: Record<SellerKycStatus, string> = {
  NOT_SUBMITTED: "Chưa gửi",
  REQUESTED: "Đã yêu cầu",
  PROCESSING: "Đang xử lý",
  AUTO_CHECKING: "Đang kiểm tra tự động",
  MANUAL_REVIEW: "Đang chờ xử lý",
  APPROVED: "Đã xác thực",
  REJECTED: "Cần bổ sung thông tin",
  TECHNICAL_ERROR: "Lỗi hệ thống",
  ERROR: "Có lỗi xảy ra",
  EXPIRED: "Hết hạn",
}

export const KYC_PROVIDER_LABELS: Record<VendorKycProviderId, string> = {
  vnpt: "IVS Trust eKYC",
  fpt: "FPT eKYC",
  manual: "Thủ công",
}

export const KYC_LEVEL_LABELS: Record<VendorKycLevel, string> = {
  none: "Chưa xác minh",
  basic: "Basic",
  verified: "Xác thực danh tính hợp pháp",
  premium: "Premium",
}

const LEGACY_STATUS_MAP: Record<LegacyVendorKycStatus, SellerKycStatus> = {
  not_started: "NOT_SUBMITTED",
  draft: "REQUESTED",
  submitted: "REQUESTED",
  provider_pending: "PROCESSING",
  approved: "APPROVED",
  rejected: "REJECTED",
  expired: "EXPIRED",
  failed: "TECHNICAL_ERROR",
}

const SECRET_FIELD_RE = /token|secret|credential|authorization|signature|access[_-]?key|token[_-]?key|public[_-]?key[_-]?ca|webhook[_-]?secret/i

export function normalizeKycStatus(
  status: SellerKycStatus | LegacyVendorKycStatus | string | null | undefined
): SellerKycStatus {
  if (!status) return "NOT_SUBMITTED"
  const raw = String(status).trim()
  const legacy = raw as LegacyVendorKycStatus
  if (legacy in LEGACY_STATUS_MAP) return LEGACY_STATUS_MAP[legacy]
  if (raw.toUpperCase() === "SDK_WEB_UNAVAILABLE") return "TECHNICAL_ERROR"

  const normalized = raw.toUpperCase().replace(/[\s-]+/g, "_") as SellerKycStatus
  if (normalized in KYC_STATUS_LABELS) return normalized
  return "ERROR"
}

export function isTerminalKycStatus(status: VendorKycStatus | string | null | undefined) {
  const normalized = normalizeKycStatus(status)
  return (
    normalized === "APPROVED" ||
    normalized === "REJECTED" ||
    normalized === "EXPIRED" ||
    normalized === "TECHNICAL_ERROR" ||
    normalized === "ERROR"
  )
}

export function getKycProviderLabel(provider: VendorKycProviderId | string | null | undefined) {
  if (!provider) return "Chưa chọn"
  return KYC_PROVIDER_LABELS[provider as VendorKycProviderId] ?? provider
}

export function getKycLevelLabel(level: VendorKycLevel | null | undefined) {
  if (!level) return KYC_LEVEL_LABELS.none
  return KYC_LEVEL_LABELS[level] ?? level
}

export function getKycStatusLabel(status: VendorKycStatus | string | null | undefined) {
  return KYC_STATUS_LABELS[normalizeKycStatus(status)]
}

export function getKycStatusMeta(status: VendorKycStatus | string | null | undefined) {
  const value = normalizeKycStatus(status)
  switch (value) {
    case "APPROVED":
      return {
        label: KYC_STATUS_LABELS.APPROVED,
        tone: "bg-emerald-100 text-emerald-700",
        description: "Hồ sơ đã được xác thực thành công sau khi đối soát kết quả eKYC.",
      }
    case "MANUAL_REVIEW":
      return {
        label: KYC_STATUS_LABELS.MANUAL_REVIEW,
        tone: "bg-amber-100 text-amber-700",
        description: "eKYC đã xác minh - hồ sơ đang được kiểm tra.",
      }
    case "REQUESTED":
    case "PROCESSING":
    case "AUTO_CHECKING":
      return {
        label: KYC_STATUS_LABELS[value],
        tone: "bg-blue-100 text-blue-700",
        description: "Phiên eKYC đã được tạo và đang chờ người bán hoặc hệ thống hoàn tất xử lý.",
      }
    case "REJECTED":
      return {
        label: KYC_STATUS_LABELS.REJECTED,
        tone: "bg-rose-100 text-rose-700",
        description: "Hồ sơ hoặc phiên eKYC chưa đạt yêu cầu.",
      }
    case "EXPIRED":
      return {
        label: KYC_STATUS_LABELS.EXPIRED,
        tone: "bg-amber-100 text-amber-700",
        description: "Phiên eKYC đã hết hạn, cần tạo phiên mới.",
      }
    case "TECHNICAL_ERROR":
      return {
        label: KYC_STATUS_LABELS.TECHNICAL_ERROR,
        tone: "bg-orange-100 text-orange-700",
        description: "Chưa thể mở phiên xác thực. Vui lòng thử lại sau hoặc liên hệ hỗ trợ.",
      }
    case "ERROR":
      return {
        label: KYC_STATUS_LABELS.ERROR,
        tone: "bg-orange-100 text-orange-700",
        description: "Có lỗi trong quá trình xử lý eKYC.",
      }
    case "NOT_SUBMITTED":
    default:
      return {
        label: KYC_STATUS_LABELS.NOT_SUBMITTED,
        tone: "bg-neutral-100 text-neutral-700",
        description: "Hồ sơ eKYC chưa được bắt đầu.",
      }
  }
}

export function getLatestKycSession(payload: SellerKycStatusPayload | null | undefined) {
  return (
    payload?.latestVnptSession ??
    payload?.latestSession ??
    payload?.session ??
    payload?.sessions?.[0] ??
    null
  )
}

export function getSellerFinalKycStatus(
  payload: SellerKycStatusPayload | null | undefined,
  fallback?: VendorKycStatus | string | null
) {
  return normalizeKycStatus(
    payload?.sellerFinalStatus ??
      payload?.sellerKycStatus ??
      payload?.sellerStatus ??
      payload?.finalStatus ??
      payload?.kycStatus ??
      fallback
  )
}

export function getLatestVnptSessionStatus(payload: SellerKycStatusPayload | null | undefined) {
  const latestSession = getLatestKycSession(payload)
  return normalizeKycStatus(
    payload?.latestVnptSessionStatus ??
      payload?.latestSessionStatus ??
      payload?.vnptSessionStatus ??
      payload?.sessionStatus ??
      latestSession?.status ??
      latestSession?.providerStatus
  )
}

export function getManualReviewState(payload: SellerKycStatusPayload | null | undefined) {
  return (
    payload?.adminManualReviewState ??
    payload?.manualReviewState ??
    payload?.adminReviewState ??
    payload?.reviewState ??
    null
  )
}

export function getSafeKycLaunchUrl(
  input: StartSellerVnptKycSessionResult | SellerKycSessionRecord | null | undefined,
  origin = typeof window !== "undefined" ? window.location.origin : "https://acfmart.vn"
) {
  const raw = input?.sdkUrl ?? input?.redirectUrl ?? input?.launchUrl
  if (!raw) return null

  try {
    const url = new URL(raw, origin)
    if (url.protocol !== "https:" && url.protocol !== "http:") return null
    return url.toString()
  } catch {
    return null
  }
}

export function safeKycMessage(value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null
  if (typeof value === "string") return redactSecretLikeText(value)
  if (value instanceof Error) return redactSecretLikeText(value.message)

  if (typeof value === "object") {
    const obj = value as Record<string, unknown>
    const safeKeys = ["message", "error", "reason", "code", "status", "description"]
    const parts = safeKeys
      .filter((key) => !SECRET_FIELD_RE.test(key) && typeof obj[key] === "string")
      .map((key) => `${key}: ${redactSecretLikeText(String(obj[key]))}`)
    return parts.length > 0 ? parts.join(" · ") : null
  }

  return redactSecretLikeText(String(value))
}

export function getTechnicalErrorMessage(payload: SellerKycStatusPayload | null | undefined) {
  const latestSession = getLatestKycSession(payload)
  return (
    safeKycMessage(payload?.technicalError) ??
    safeKycMessage(latestSession?.technicalError) ??
    safeKycMessage(payload?.providerError) ??
    safeKycMessage(latestSession?.providerError) ??
    safeKycMessage(payload?.errorMessage) ??
    safeKycMessage(latestSession?.errorMessage) ??
    (getSellerFinalKycStatus(payload) === "TECHNICAL_ERROR"
      ? "Chưa thể mở phiên xác thực. Vui lòng thử lại sau hoặc liên hệ hỗ trợ."
      : null)
  )
}

export function getProviderMessage(session: SellerKycSessionRecord | null | undefined) {
  return safeKycMessage(session?.providerMessage) ?? safeKycMessage(session?.providerCode)
}

export function getVnptSdkUnavailableMessage(payload: SellerKycStatusPayload | null | undefined) {
  const latestSession = getLatestKycSession(payload)
  if (payload?.sdkAvailable !== false && latestSession?.sdkAvailable !== false) {
    return null
  }

  return (
    safeKycMessage(payload?.unavailableReason) ??
    safeKycMessage(latestSession?.unavailableReason) ??
    "Xác thực eKYC chưa khả dụng. Vui lòng thử lại sau hoặc liên hệ hỗ trợ."
  )
}

function redactSecretLikeText(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return null
  if (SECRET_FIELD_RE.test(trimmed)) return "Thông tin kỹ thuật đã được ẩn để bảo mật."
  return trimmed.length > 240 ? `${trimmed.slice(0, 237)}...` : trimmed
}

export type SellerKycUiState = "verified" | "processing" | "needs_action" | "not_started"

export interface SellerKycUiStateResult {
  state: SellerKycUiState
  label: string
  badge: string
  levelLabel: string
  canStartKyc: boolean
}

export function getSellerKycUiState(
  payload: SellerKycStatusPayload | null | undefined,
  vendorStatus?: string | null
): SellerKycUiStateResult {
  const finalStatus = getSellerFinalKycStatus(payload, vendorStatus)
  const sessionStatus = getLatestVnptSessionStatus(payload)
  const technicalError = getTechnicalErrorMessage(payload)
  const sdkUnavailable = getVnptSdkUnavailableMessage(payload)
  const hasBlockingError = !!(technicalError || sdkUnavailable)

  // Verified: Only if KYC-specific status confirms approval AND no blocking error
  if (
    (finalStatus === "APPROVED" || finalStatus === "MANUAL_REVIEW") &&
    !hasBlockingError &&
    sessionStatus !== "ERROR" &&
    sessionStatus !== "TECHNICAL_ERROR" &&
    sessionStatus !== "REJECTED"
  ) {
    return {
      state: "verified",
      label: "Đã xác thực",
      badge: "ĐÃ XÁC THỰC",
      levelLabel: "Xác thực danh tính hợp pháp",
      canStartKyc: false,
    }
  }

  // Processing: Session is in progress
  if (
    sessionStatus === "PROCESSING" ||
    sessionStatus === "REQUESTED" ||
    sessionStatus === "AUTO_CHECKING" ||
    finalStatus === "PROCESSING" ||
    finalStatus === "REQUESTED"
  ) {
    return {
      state: "processing",
      label: "Đang xác thực",
      badge: "ĐANG XÁC THỰC",
      levelLabel: "Đang hoàn tất xác thực",
      canStartKyc: false,
    }
  }

  // Needs action: Error, failed, rejected, or blocking error exists
  if (
    hasBlockingError ||
    finalStatus === "TECHNICAL_ERROR" ||
    finalStatus === "ERROR" ||
    finalStatus === "REJECTED" ||
    sessionStatus === "ERROR" ||
    sessionStatus === "TECHNICAL_ERROR" ||
    sessionStatus === "REJECTED" ||
    sessionStatus === "EXPIRED"
  ) {
    return {
      state: "needs_action",
      label: "Cần kiểm tra lại",
      badge: "CẦN KIỂM TRA",
      levelLabel: "Chưa hoàn tất xác thực",
      canStartKyc: true,
    }
  }

  // Not started: Default state
  return {
    state: "not_started",
    label: "Chưa xác thực",
    badge: "CHƯA XÁC THỰC",
    levelLabel: "Chưa hoàn tất xác thực",
    canStartKyc: true,
  }
}
