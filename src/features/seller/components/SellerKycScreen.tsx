import { useEffect, useMemo, useState } from "react"
import type { ReactNode } from "react"
import { Link } from "react-router-dom"
import {
  AlertTriangle,
  BadgeCheck,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileText,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from "lucide-react"
import toast from "react-hot-toast"
import { useAuthStore } from "../../../stores/auth-store"
import { Skeleton } from "../../../components/Skeleton"
import { sanitizeUserError } from "../../../lib/error-utils"
import {
  getKycLevelLabel,
  getKycProviderLabel,
  getKycStatusMeta,
  getKycStatusLabel,
  getLatestKycSession,
  getLatestVnptSessionStatus,
  getManualReviewState,
  getProviderMessage,
  getSafeKycLaunchUrl,
  getSellerFinalKycStatus,
  getTechnicalErrorMessage,
  getVnptSdkUnavailableMessage,
  normalizeKycStatus,
  type SellerKycSessionRecord,
  type SellerKycStatus,
  type StartSellerVnptKycSessionResult,
} from "../../../lib/kyc"
import { useMyVendor } from "../../../hooks/use-vendor"
import {
  useSellerKycStatus,
  useStartSellerVnptKycSession,
  useSubmitSellerVnptKycResult,
} from "../../../hooks/use-kyc"
import VnptEkycSdkModal from "./VnptEkycSdkModal"

function formatDate(value?: string | null) {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleString("vi-VN")
}

function kycStatusMessage(finalStatus: SellerKycStatus, sessionStatus: SellerKycStatus) {
  if (sessionStatus === "APPROVED" && finalStatus === "MANUAL_REVIEW") {
    return "IVS Trust eKYC đã xác minh - chờ admin duyệt"
  }

  switch (finalStatus) {
    case "APPROVED":
      return "Admin đã duyệt hồ sơ seller. Trạng thái này không được frontend tự đặt."
    case "MANUAL_REVIEW":
      return "Hồ sơ đang ở bước admin manual review. Chưa hiển thị là seller đã được duyệt."
    case "REJECTED":
      return "Hồ sơ eKYC hoặc hồ sơ seller chưa đạt yêu cầu."
    case "TECHNICAL_ERROR":
      return "Lỗi kỹ thuật khi tạo phiên eKYC"
    case "ERROR":
      return "Có lỗi trong quá trình xử lý eKYC."
    case "EXPIRED":
      return "Phiên eKYC đã hết hạn. Bạn có thể tạo phiên IVS Trust eKYC mới."
    case "REQUESTED":
    case "PROCESSING":
    case "AUTO_CHECKING":
      return "Phiên eKYC đang được xử lý. Trang sẽ tự làm mới trạng thái."
    case "NOT_SUBMITTED":
    default:
      return "Bạn chưa hoàn tất phiên IVS Trust eKYC cho hồ sơ seller này."
  }
}

function adminReviewLabel(vendorStatus?: string | null, manualReviewState?: string | null) {
  if (manualReviewState) return manualReviewState
  if (vendorStatus === "active") return "Admin đã duyệt seller"
  if (vendorStatus === "rejected") return "Admin đã từ chối hồ sơ"
  if (vendorStatus === "suspended") return "Seller đang bị tạm khoá"
  if (vendorStatus === "pending") return "Chờ admin duyệt seller"
  return "Chưa có trạng thái review"
}

export default function SellerKycScreen() {
  const user = useAuthStore((s) => s.user)
  const vendorQuery = useMyVendor()
  const vendor = vendorQuery.data?.vendor ?? null
  const kycStatusQuery = useSellerKycStatus()
  const startVnptSession = useStartSellerVnptKycSession()
  const submitVnptResult = useSubmitSellerVnptKycResult()
  const [sdkSession, setSdkSession] = useState<StartSellerVnptKycSessionResult | null>(null)

  const latestSession = useMemo(
    () => getLatestKycSession(kycStatusQuery.data),
    [kycStatusQuery.data]
  )
  const finalStatus = getSellerFinalKycStatus(kycStatusQuery.data, vendor?.kyc_status)
  const sessionStatus = getLatestVnptSessionStatus(kycStatusQuery.data)
  const finalStatusMeta = getKycStatusMeta(finalStatus)
  const sessionStatusMeta = getKycStatusMeta(sessionStatus)
  const providerLabel = getKycProviderLabel(latestSession?.provider ?? vendor?.kyc_provider ?? "vnpt")
  const levelLabel = getKycLevelLabel(vendor?.kyc_level)
  const manualReviewState = getManualReviewState(kycStatusQuery.data)
  const technicalError = getTechnicalErrorMessage(kycStatusQuery.data)
  const sdkUnavailableMessage = getVnptSdkUnavailableMessage(kycStatusQuery.data)
  const providerMessage = getProviderMessage(latestSession)

  const kycLoadErrorMessage = kycStatusQuery.isError
    ? sanitizeUserError(kycStatusQuery.error, "Không tải được trạng thái eKYC.")
    : null

  useEffect(() => {
    if (!vendorQuery.isError) return
    toast.error(sanitizeUserError(vendorQuery.error, "Không tải được hồ sơ seller."))
  }, [vendorQuery.error, vendorQuery.isError])

  async function refreshStatus() {
    await Promise.all([kycStatusQuery.refetch(), vendorQuery.refetch()])
  }

  async function handleStart() {
    if (!vendor) return

    try {
      const result = await startVnptSession.mutateAsync({
        returnUrl: `${window.location.origin}/seller/kyc`,
      })

      if (result.sdkAvailable && result.sdkConfig) {
        setSdkSession(result)
        return
      }

      const launchUrl = getSafeKycLaunchUrl(result)

      if (launchUrl) {
        window.location.assign(launchUrl)
        return
      }

      await refreshStatus()
      const safeUnavailableReason =
        result.sdkAvailable === false
          ? getVnptSdkUnavailableMessage({
              sdkAvailable: result.sdkAvailable,
              unavailableReason: result.unavailableReason,
            })
          : null
      if (safeUnavailableReason) {
        toast(safeUnavailableReason)
        return
      }
    } catch (err) {
      toast.error(
        sanitizeUserError(
          err,
          "Lỗi kỹ thuật khi tạo phiên eKYC"
        )
      )
    }
  }

  async function handleSdkResult(result: unknown) {
    if (!sdkSession?.sessionId) {
      toast.error("Thiếu mã phiên IVS Trust eKYC.")
      return
    }

    try {
      await submitVnptResult.mutateAsync({
        sessionId: sdkSession.sessionId,
        result,
      })
      setSdkSession(null)
      toast.success("Đã nhận kết quả xác minh. Hồ sơ đang chờ IVS kiểm duyệt.")
      await refreshStatus()
    } catch (err) {
      toast.error(sanitizeUserError(err, "Không gửi được kết quả IVS Trust eKYC."))
    }
  }

  function handleSdkError(error: Error) {
    setSdkSession(null)
    toast.error(sanitizeUserError(error, "Không mở được IVS Trust eKYC. Vui lòng thử lại."))
  }

  if (vendorQuery.isLoading) {
    return (
      <div className="p-4 lg:p-8">
        <Skeleton className="mb-4 h-10 w-1/2" />
        <Skeleton className="h-80 w-full" />
      </div>
    )
  }

  if (!vendor) {
    return (
      <div className="p-4 lg:p-8">
        <div className="card flex flex-col items-center justify-center gap-3 p-10 text-center">
          <AlertTriangle size={36} className="text-amber-500" />
          <h1 className="text-xl font-bold text-neutral-900">Chưa có hồ sơ seller</h1>
          <p className="max-w-lg text-sm text-neutral-600">
            Bạn cần hoàn tất đăng ký seller trước khi bắt đầu IVS Trust eKYC.
          </p>
          <Link to="/seller-register" className="btn-primary">
            Đi tới đăng ký seller
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-8">
      {sdkSession && (
        <VnptEkycSdkModal
          session={sdkSession}
          onClose={() => setSdkSession(null)}
          onResult={handleSdkResult}
          onError={handleSdkError}
        />
      )}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-red-50 px-3 py-1 text-xs font-semibold text-brand-red-700">
            <ShieldCheck size={12} />
            eKYC Seller
          </div>
          <h1 className="mt-3 text-2xl font-bold text-neutral-900 lg:text-3xl">
            Xác minh danh tính bằng IVS Trust eKYC
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-neutral-600">
            Seller Center chỉ đọc trạng thái từ backend. Frontend không tự đặt seller là verified
            và không hiển thị credential/provider token.
          </p>
        </div>
        <button
          type="button"
          onClick={handleStart}
          disabled={startVnptSession.isPending || submitVnptResult.isPending}
          className="btn-primary"
        >
          {startVnptSession.isPending || submitVnptResult.isPending ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <BadgeCheck size={14} />
          )}
          Xác minh với IVS Trust eKYC
        </button>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-5">
          <div className="card overflow-hidden border border-brand-red-100 bg-white p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-neutral-900">
                  {vendor.shop_name}
                </h2>
                <p className="mt-1 text-sm text-neutral-500">
                  Chủ shop: {vendor.owner_name}
                  {user?.email ? ` · ${user.email}` : ""}
                </p>
              </div>
              <div className={`rounded-full px-3 py-1 text-xs font-semibold ${finalStatusMeta.tone}`}>
                {finalStatusMeta.label}
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <InfoTile label="Nhà cung cấp" value={providerLabel} icon={Sparkles} />
              <InfoTile label="Mức KYC" value={levelLabel} icon={CheckCircle2} />
              <InfoTile label="Hồ sơ seller" value={vendor.status} icon={FileText} />
            </div>

            <div className="mt-4 rounded-xl bg-neutral-50 p-4 text-sm text-neutral-700">
              {kycStatusMessage(finalStatus, sessionStatus)}
            </div>

            {kycLoadErrorMessage && (
              <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold">Không tải được trạng thái eKYC</p>
                  <p className="mt-0.5 text-xs">{kycLoadErrorMessage}</p>
                </div>
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleStart}
                disabled={startVnptSession.isPending || submitVnptResult.isPending}
                className="btn-secondary"
              >
                {startVnptSession.isPending || submitVnptResult.isPending ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <BadgeCheck size={14} />
                )}
                Xác minh với IVS Trust eKYC
              </button>
              <button
                type="button"
                onClick={refreshStatus}
                disabled={kycStatusQuery.isFetching || vendorQuery.isFetching}
                className="btn-secondary"
              >
                <RefreshCw
                  size={14}
                  className={kycStatusQuery.isFetching || vendorQuery.isFetching ? "animate-spin" : ""}
                />
                Làm mới trạng thái
              </button>
              <Link to="/contact" className="btn-secondary">
                <ExternalLink size={14} />
                Cần hỗ trợ
              </Link>
            </div>
          </div>

          <StatusPanel
            title="Seller final KYC status"
            description="Trạng thái cuối cùng của seller do backend/admin quyết định."
            status={finalStatus}
            tone={finalStatusMeta.tone}
          >
            <StatusRow label="Trạng thái cuối" value={getKycStatusLabel(finalStatus)} tone={finalStatusMeta.tone} />
            <StatusRow label="Ý nghĩa" value={kycStatusMessage(finalStatus, sessionStatus)} />
            <StatusRow label="Seller record" value={vendor.status} />
          </StatusPanel>

          <StatusPanel
            title="Latest IVS Trust eKYC session status"
            description="Trạng thái phiên IVS Trust eKYC gần nhất, tách biệt với duyệt seller cuối cùng."
            status={sessionStatus}
            tone={sessionStatusMeta.tone}
          >
            <StatusRow label="Trạng thái phiên" value={getKycStatusLabel(sessionStatus)} tone={sessionStatusMeta.tone} />
            <StatusRow label="Provider" value={providerLabel} />
            <StatusRow label="Session ID" value={sessionId(latestSession)} mono />
            <StatusRow label="Tạo lúc" value={formatDate(latestSession?.createdAt)} />
            <StatusRow label="Cập nhật" value={formatDate(latestSession?.updatedAt)} />
            <StatusRow label="Hết hạn" value={formatDate(latestSession?.expiresAt)} />
            {providerMessage && <StatusRow label="Thông báo provider" value={providerMessage} />}
            {sdkUnavailableMessage && <StatusRow label="SDK-Web" value={sdkUnavailableMessage} />}
          </StatusPanel>
        </div>

        <div className="space-y-5">
          <StatusPanel
            title="Technical/provider error"
            description="Lỗi kỹ thuật được hiển thị riêng, không dùng làm kết luận duyệt seller."
            status={technicalError || sdkUnavailableMessage ? normalizeKycStatus("TECHNICAL_ERROR") : "NOT_SUBMITTED"}
            tone={technicalError || sdkUnavailableMessage ? "bg-orange-100 text-orange-700" : "bg-neutral-100 text-neutral-700"}
          >
            <StatusRow
              label="Tình trạng"
              value={technicalError || sdkUnavailableMessage ? "Lỗi kỹ thuật khi tạo phiên eKYC" : "Không có lỗi kỹ thuật hiện tại"}
              tone={technicalError || sdkUnavailableMessage ? "bg-orange-100 text-orange-700" : undefined}
            />
            {technicalError && <StatusRow label="Chi tiết an toàn" value={technicalError} />}
            {sdkUnavailableMessage && <StatusRow label="SDK-Web" value={sdkUnavailableMessage} />}
          </StatusPanel>

          <StatusPanel
            title="Admin manual review state"
            description="Bước kiểm duyệt nội bộ sau khi có kết quả eKYC."
            status={finalStatus === "MANUAL_REVIEW" ? "MANUAL_REVIEW" : normalizeKycStatus(vendor.kyc_status)}
            tone={finalStatus === "MANUAL_REVIEW" ? "bg-amber-100 text-amber-700" : getKycStatusMeta(vendor.kyc_status).tone}
          >
            <StatusRow
              label="Review state"
              value={adminReviewLabel(vendor.status, manualReviewState)}
              tone={vendor.status === "active" ? "bg-emerald-100 text-emerald-700" : undefined}
            />
            <StatusRow label="Admin approval" value={vendor.status === "active" ? "Đã duyệt" : "Chưa duyệt"} />
            <StatusRow label="Duyệt lúc" value={formatFirestoreDate(vendor.verified_at)} />
            <StatusRow label="Lý do từ chối" value={vendor.rejected_reason ?? "—"} />
          </StatusPanel>

          <div className="card p-6">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-brand-gold-100 p-2 text-brand-gold-700">
                <Clock3 size={18} />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-neutral-900">
                  Tự động làm mới
                </h3>
                <p className="mt-1 text-sm text-neutral-600">
                  Trang tự gọi lại <span className="font-mono">GET /v1/sellers/me/kyc/status</span> khi trạng thái
                  chưa terminal. Bạn cũng có thể bấm làm mới thủ công sau khi hoàn tất IVS Trust eKYC.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoTile({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: string
  icon: typeof Sparkles
}) {
  return (
    <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-4">
      <div className="flex items-center gap-2 text-xs text-neutral-500">
        <Icon size={12} className="text-brand-red-500" />
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold uppercase text-neutral-900">{value}</div>
    </div>
  )
}

function StatusPanel({
  title,
  description,
  status,
  tone,
  children,
}: {
  title: string
  description: string
  status: SellerKycStatus
  tone: string
  children: ReactNode
}) {
  return (
    <div className="card p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-neutral-900">{title}</h3>
          <p className="mt-1 text-xs text-neutral-500">{description}</p>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${tone}`}>
          {getKycStatusLabel(status)}
        </span>
      </div>
      <dl className="mt-4 space-y-2 text-sm">{children}</dl>
    </div>
  )
}

function StatusRow({
  label,
  value,
  tone,
  mono,
}: {
  label: string
  value: string
  tone?: string
  mono?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-neutral-50 px-3 py-2">
      <dt className="shrink-0 text-xs text-neutral-500">{label}</dt>
      <dd
        className={
          tone
            ? `rounded-full px-2 py-0.5 text-right text-[11px] font-semibold ${tone}`
            : `min-w-0 text-right text-xs font-semibold ${mono ? "font-mono" : ""} text-neutral-900`
        }
      >
        {value}
      </dd>
    </div>
  )
}

function sessionId(session: SellerKycSessionRecord | null | undefined) {
  return session?.sessionId ?? session?.id ?? session?.applicationId ?? "—"
}

function formatFirestoreDate(value?: { toDate?: () => Date } | string | null) {
  if (!value) return "—"
  if (typeof value === "string") return formatDate(value)
  return value.toDate?.().toLocaleString("vi-VN") ?? "—"
}
