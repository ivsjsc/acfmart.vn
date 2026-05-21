import { collection, getDocs, limit, query, where, Timestamp } from "firebase/firestore"
import { httpsCallable } from "firebase/functions"
import { auth, firestore, functions } from "./firebase"

export type VendorKycProviderId = "vnpt" | "fpt" | "manual"

export type VendorKycStatus =
  | "not_started"
  | "draft"
  | "submitted"
  | "provider_pending"
  | "approved"
  | "rejected"
  | "expired"
  | "failed"

export type VendorKycLevel = "none" | "basic" | "verified" | "premium"

export interface KycApplicationResult {
  full_name?: string | null
  id_number?: string | null
  id_number_masked?: string | null
  face_match_score?: number | null
  liveness_score?: number | null
  note?: string | null
}

export interface KycApplicationRecord {
  id: string
  vendor_id: string
  firebase_uid: string
  provider: VendorKycProviderId
  status: VendorKycStatus
  requested_level: VendorKycLevel
  provider_application_id?: string | null
  provider_reference_id?: string | null
  launch_url?: string | null
  return_url?: string | null
  webhook_url?: string | null
  provider_message?: string | null
  provider_code?: string | null
  result?: KycApplicationResult | null
  created_at: Timestamp
  updated_at: Timestamp
  submitted_at?: Timestamp | null
  verified_at?: Timestamp | null
  rejected_at?: Timestamp | null
  expired_at?: Timestamp | null
  failed_at?: Timestamp | null
}

export interface StartVendorKycInput {
  vendorId: string
  provider?: VendorKycProviderId
  requestedLevel?: VendorKycLevel
  returnUrl?: string
}

export interface StartVendorKycResult {
  applicationId: string
  provider: VendorKycProviderId
  status: VendorKycStatus
  launchUrl?: string | null
  message?: string | null
  application?: KycApplicationRecord | null
}

export const KYC_APPLICATIONS_COLLECTION = "kycApplications"

export const KYC_STATUS_LABELS: Record<VendorKycStatus, string> = {
  not_started: "Chưa bắt đầu",
  draft: "Đang khởi tạo",
  submitted: "Đã gửi",
  provider_pending: "Đang xử lý",
  approved: "Đã xác minh",
  rejected: "Bị từ chối",
  expired: "Hết hạn",
  failed: "Lỗi",
}

export const KYC_PROVIDER_LABELS: Record<VendorKycProviderId, string> = {
  vnpt: "VNPT eKYC",
  fpt: "FPT eKYC",
  manual: "Thủ công",
}

export const KYC_LEVEL_LABELS: Record<VendorKycLevel, string> = {
  none: "Chưa xác minh",
  basic: "Basic",
  verified: "Verified",
  premium: "Premium",
}

export function isTerminalKycStatus(status: VendorKycStatus | null | undefined) {
  return status === "approved" || status === "rejected" || status === "expired" || status === "failed"
}

export function getKycProviderLabel(provider: VendorKycProviderId | null | undefined) {
  if (!provider) return "Chưa chọn"
  return KYC_PROVIDER_LABELS[provider] ?? provider
}

export function getKycLevelLabel(level: VendorKycLevel | null | undefined) {
  if (!level) return KYC_LEVEL_LABELS.none
  return KYC_LEVEL_LABELS[level] ?? level
}

export function getKycStatusLabel(status: VendorKycStatus | null | undefined) {
  if (!status) return KYC_STATUS_LABELS.not_started
  return KYC_STATUS_LABELS[status] ?? status
}

export function getKycStatusMeta(status: VendorKycStatus | null | undefined) {
  const value = status ?? "not_started"
  switch (value) {
    case "approved":
      return {
        label: KYC_STATUS_LABELS.approved,
        tone: "bg-emerald-100 text-emerald-700",
        description: "Hồ sơ eKYC đã được xác minh và có thể dùng làm căn cứ duyệt seller.",
      }
    case "submitted":
    case "provider_pending":
      return {
        label: KYC_STATUS_LABELS[value],
        tone: "bg-blue-100 text-blue-700",
        description: "Phiên eKYC đã được tạo, đang chờ người dùng hoàn tất hoặc hệ thống xác nhận.",
      }
    case "draft":
      return {
        label: KYC_STATUS_LABELS.draft,
        tone: "bg-neutral-100 text-neutral-700",
        description: "Phiên xác minh đã được khởi tạo nhưng chưa gửi sang VNPT.",
      }
    case "rejected":
      return {
        label: KYC_STATUS_LABELS.rejected,
        tone: "bg-rose-100 text-rose-700",
        description: "VNPT trả về kết quả không đạt hoặc dữ liệu cần được kiểm tra lại.",
      }
    case "expired":
      return {
        label: KYC_STATUS_LABELS.expired,
        tone: "bg-amber-100 text-amber-700",
        description: "Phiên eKYC đã quá thời hạn xử lý, cần tạo lại phiên mới.",
      }
    case "failed":
      return {
        label: KYC_STATUS_LABELS.failed,
        tone: "bg-orange-100 text-orange-700",
        description: "Có lỗi kỹ thuật khi tạo hoặc nhận kết quả eKYC.",
      }
    case "not_started":
    default:
      return {
        label: KYC_STATUS_LABELS.not_started,
        tone: "bg-neutral-100 text-neutral-700",
        description: "Hồ sơ eKYC chưa được bắt đầu.",
      }
  }
}

async function waitForAuthReady() {
  await auth.authStateReady()
}

function timestampToMs(value: Timestamp | null | undefined): number {
  return value?.toMillis?.() ?? 0
}

function sortKycApplicationsDesc(
  a: KycApplicationRecord,
  b: KycApplicationRecord
): number {
  return timestampToMs(b.updated_at ?? b.created_at) - timestampToMs(a.updated_at ?? a.created_at)
}

const kycApplicationsCol = collection(firestore, KYC_APPLICATIONS_COLLECTION)

export async function listMyVendorKycApplications(
  firebaseUid: string
): Promise<KycApplicationRecord[]> {
  await waitForAuthReady()
  const q = query(
    kycApplicationsCol,
    where("firebase_uid", "==", firebaseUid),
    limit(20)
  )
  const snap = await getDocs(q)
  return snap.docs
    .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as KycApplicationRecord))
    .sort(sortKycApplicationsDesc)
}

export async function startVendorKyc(
  input: StartVendorKycInput
): Promise<StartVendorKycResult> {
  await waitForAuthReady()
  const callable = httpsCallable<StartVendorKycInput, StartVendorKycResult>(
    functions,
    "startVendorKyc"
  )
  const result = await callable(input)
  return result.data
}

