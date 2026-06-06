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

function formatVendorStatus(status: string | null | undefined): string {
  if (!status) return "Chưa xác thực"
  switch (status.toLowerCase()) {
    case "active":
      return "Đã xác thực"
    case "pending":
      return "Đang chờ xử lý"
    case "rejected":
      return "Cần bổ sung thông tin"
    case "suspended":
      return "Tạm khóa"
    default:
      return "Chưa xác thực"
  }
}

function kycStatusMessage(finalStatus: SellerKycStatus, sessionStatus: SellerKycStatus) {
  if (sessionStatus === "APPROVED" && finalStatus === "MANUAL_REVIEW") {
    return "Đã xác minh danh tính - hồ sơ đang được kiểm tra"
  }

  switch (finalStatus) {
    case "APPROVED":
      return "Hồ sơ gian hàng đã được xác thực thành công"
    case "MANUAL_REVIEW":
      return "Hồ sơ đang được kiểm tra và xác minh"
    case "REJECTED":
      return "Hồ sơ chưa đạt yêu cầu. Vui lòng bổ sung thông tin."
    case "TECHNICAL_ERROR":
      return "Chưa thể mở phiên xác thực"
    case "ERROR":
      return "Có lỗi trong quá trình xử lý. Vui lòng thử lại."
    case "EXPIRED":
      return "Phiên xác thực đã hết hạn. Bạn có thể bắt đầu phiên mới."
    case "REQUESTED":
    case "PROCESSING":
    case "AUTO_CHECKING":
      return "Phiên xác thực đang được xử lý. Trang sẽ tự cập nhật trạng thái."
    case "NOT_SUBMITTED":
    default:
      return "Bạn chưa hoàn tất xác thực danh tính cho gian hàng này."
  }
}

function adminReviewLabel(vendorStatus?: string | null, manualReviewState?: string | null) {
  if (manualReviewState) return manualReviewState
  if (vendorStatus === "active") return "Đã xác thực"
  if (vendorStatus === "rejected") return "Cần bổ sung thông tin"
  if (vendorStatus === "suspended") return "Tạm khóa"
  if (vendorStatus === "pending") return "Đang chờ xử lý"
  return "Chưa có trạng thái"
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
          "Chưa thể mở phiên xác thực"
        )
      )
    }
  }

  async function handleSdkResult(result: unknown) {
    if (!sdkSession?.sessionId) {
      toast.error("Thiếu thông tin phiên xác thực.")
      return
    }

    try {
      await submitVnptResult.mutateAsync({
        sessionId: sdkSession.sessionId,
        result,
      })
      setSdkSession(null)
      toast.success("Đã nhận kết quả xác minh. Hồ sơ đang được kiểm duyệt.")
      await refreshStatus()
    } catch (err) {
      toast.error(sanitizeUserError(err, "Không gửi được kết quả xác minh."))
    }
  }

  function handleSdkError(error: Error) {
    setSdkSession(null)
    toast.error(sanitizeUserError(error, "Không mở được phiên xác thực. Vui lòng thử lại."))
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
          <h1 className="text-xl font-bold text-neutral-900">Chưa có hồ sơ gian hàng</h1>
          <p className="max-w-lg text-sm text-neutral-600">
            Bạn cần hoàn tất đăng ký seller trước khi bắt đầu xác thực danh tính.
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
            Xác thực gian hàng
          </div>
          <h1 className="mt-3 text-2xl font-bold text-neutral-900 lg:text-3xl">
            Xác thực danh tính gian hàng
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-neutral-600">
            ACFMart sử dụng IVS Trust eKYC hợp tác cùng Tập đoàn Bưu chính Viễn thông Việt Nam VNPT để hỗ trợ xác thực danh tính hợp pháp, bảo vệ dữ liệu người dùng và nâng cao mức độ tin cậy của gian hàng.
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
          Bắt đầu xác thực eKYC
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
              <InfoTile label="Đối tác xác thực" value="IVS Trust eKYC x VNPT" icon={Sparkles} />
              <InfoTile label="Mức xác thực" value="Xác thực danh tính hợp pháp" icon={CheckCircle2} />
              <InfoTile label="Trạng thái hồ sơ" value={formatVendorStatus(vendor.status)} icon={FileText} />
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
                Bắt đầu xác thực eKYC
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
                Cập nhật trạng thái
              </button>
              <Link to="/contact" className="btn-secondary">
                <ExternalLink size={14} />
                Liên hệ hỗ trợ
              </Link>
            </div>
          </div>

          <StatusPanel
            title="Kết quả xác thực gian hàng"
            description="Trạng thái xác thực cuối cùng được dùng để đánh giá mức độ tin cậy của gian hàng trên ACFMart."
            status={finalStatus}
            tone={finalStatusMeta.tone}
          >
            <StatusRow label="Trạng thái cuối" value={getKycStatusLabel(finalStatus)} tone={finalStatusMeta.tone} />
            <StatusRow label="Ý nghĩa" value={kycStatusMessage(finalStatus, sessionStatus)} />
            <StatusRow label="Hồ sơ gian hàng" value={formatVendorStatus(vendor.status)} />
          </StatusPanel>

          <StatusPanel
            title="Phiên xác thực gần nhất"
            description="Theo dõi trạng thái phiên xác thực eKYC gần nhất của gian hàng."
            status={sessionStatus}
            tone={sessionStatusMeta.tone}
          >
            <StatusRow label="Trạng thái phiên" value={getKycStatusLabel(sessionStatus)} tone={sessionStatusMeta.tone} />
            <StatusRow label="Thời gian bắt đầu" value={formatDate(latestSession?.createdAt)} />
            <StatusRow label="Thời gian cập nhật" value={formatDate(latestSession?.updatedAt)} />
            <StatusRow label="Hết hạn" value={formatDate(latestSession?.expiresAt)} />
            {providerMessage && <StatusRow label="Ghi chú" value={providerMessage} />}
            {sdkUnavailableMessage && import.meta.env.DEV && <StatusRow label="SDK-Web" value={sdkUnavailableMessage} />}
          </StatusPanel>
        </div>

        <div className="space-y-5">
          <StatusPanel
            title="Hỗ trợ xác thực"
            description="Nếu quá trình xác thực chưa hoàn tất, vui lòng thử lại hoặc liên hệ ACFMart để được hỗ trợ."
            status={technicalError || sdkUnavailableMessage ? normalizeKycStatus("TECHNICAL_ERROR") : "NOT_SUBMITTED"}
            tone={technicalError || sdkUnavailableMessage ? "bg-orange-100 text-orange-700" : "bg-neutral-100 text-neutral-700"}
          >
            <StatusRow
              label="Tình trạng"
              value={technicalError || sdkUnavailableMessage ? "Hệ thống chưa thể xử lý yêu cầu. Vui lòng thử lại sau." : "Không có thông báo cần xử lý"}
              tone={technicalError || sdkUnavailableMessage ? "bg-orange-100 text-orange-700" : undefined}
            />
            {technicalError && import.meta.env.DEV && <StatusRow label="Chi tiết" value={technicalError} />}
            {sdkUnavailableMessage && import.meta.env.DEV && <StatusRow label="SDK-Web" value={sdkUnavailableMessage} />}
          </StatusPanel>

          <StatusPanel
            title="Trạng thái xét duyệt"
            description="Hồ sơ xác thực của gian hàng sẽ được hệ thống và bộ phận phụ trách kiểm tra trước khi cập nhật trạng thái chính thức."
            status={finalStatus === "MANUAL_REVIEW" ? "MANUAL_REVIEW" : normalizeKycStatus(vendor.kyc_status)}
            tone={finalStatus === "MANUAL_REVIEW" ? "bg-amber-100 text-amber-700" : getKycStatusMeta(vendor.kyc_status).tone}
          >
            <StatusRow
              label="Tình trạng xét duyệt"
              value={adminReviewLabel(vendor.status, manualReviewState)}
              tone={vendor.status === "active" ? "bg-emerald-100 text-emerald-700" : undefined}
            />
            <StatusRow label="Kết quả" value={vendor.status === "active" ? "Đã xác thực" : "Chưa hoàn tất"} />
            <StatusRow label="Thời gian cập nhật" value={formatFirestoreDate(vendor.verified_at)} />
            <StatusRow label="Ghi chú" value={vendor.rejected_reason ?? "—"} />
          </StatusPanel>

          <div className="card p-6">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-brand-gold-100 p-2 text-brand-gold-700">
                <Clock3 size={18} />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-neutral-900">
                  Tự động cập nhật
                </h3>
                <p className="mt-1 text-sm text-neutral-600">
                  Trang sẽ tự động cập nhật trạng thái khi quá trình xác thực đang được xử lý. Bạn cũng có thể bấm cập nhật thủ công sau khi hoàn tất xác thực eKYC.
                </p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-brand-red-100 p-2 text-brand-red-700">
                <ShieldCheck size={18} />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-neutral-900">
                  Bảo vệ và tin cậy
                </h3>
                <p className="mt-1 text-sm text-neutral-600">
                  Quy trình xác thực được thực hiện nhằm bảo vệ người dùng, phòng chống gian lận và nâng cao độ tin cậy giao dịch trên ACFMart.
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
