import { useEffect, useMemo } from "react"
import { Link } from "react-router-dom"
import {
  AlertTriangle,
  ArrowRight,
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
  isTerminalKycStatus,
  type KycApplicationRecord,
} from "../../../lib/kyc"
import { useMyVendor } from "../../../hooks/use-vendor"
import {
  useMyVendorKycApplications,
  useStartVendorKyc,
} from "../../../hooks/use-kyc"

function formatDate(value?: { toDate?: () => Date } | null) {
  if (!value?.toDate) return "—"
  return value.toDate().toLocaleString("vi-VN")
}

function badgeTone(status: string) {
  if (status === "approved") return "bg-emerald-100 text-emerald-700"
  if (status === "rejected" || status === "failed") return "bg-rose-100 text-rose-700"
  if (status === "expired") return "bg-amber-100 text-amber-700"
  if (status === "submitted" || status === "provider_pending") return "bg-blue-100 text-blue-700"
  return "bg-neutral-100 text-neutral-700"
}

export default function SellerKycScreen() {
  const user = useAuthStore((s) => s.user)
  const vendorQuery = useMyVendor()
  const vendor = vendorQuery.data?.vendor ?? null
  const kycQuery = useMyVendorKycApplications(vendor?.firebase_uid)
  const startKyc = useStartVendorKyc()

  const latestApplication = useMemo(() => {
    const apps = kycQuery.data ?? []
    return apps[0] ?? null
  }, [kycQuery.data])

  const currentStatus = latestApplication?.status ?? vendor?.kyc_status ?? "not_started"
  const statusMeta = getKycStatusMeta(currentStatus)
  const providerLabel = getKycProviderLabel(latestApplication?.provider ?? vendor?.kyc_provider)
  const levelLabel = getKycLevelLabel(vendor?.kyc_level)
  const canResume = latestApplication ? !isTerminalKycStatus(latestApplication.status) : false
  const kycErrorMessage = kycQuery.isError
    ? sanitizeUserError(kycQuery.error, "Không tải được lịch sử eKYC.")
    : null

  const ctaLabel = latestApplication
    ? canResume
      ? "Tiếp tục VNPT eKYC"
      : "Xác minh lại bằng VNPT"
    : "Bắt đầu VNPT eKYC"

  useEffect(() => {
    if (!vendorQuery.isError) return
    toast.error(sanitizeUserError(vendorQuery.error, "Không tải được hồ sơ seller."))
  }, [vendorQuery.error, vendorQuery.isError])

  async function handleStart() {
    if (!vendor) return

    try {
      const result = await startKyc.mutateAsync({
        vendorId: vendor.id,
        provider: "vnpt",
        requestedLevel: vendor.kyc_level === "none" ? "verified" : vendor.kyc_level,
        returnUrl: `${window.location.origin}/seller/kyc`,
      })

      if (result.launchUrl) {
        toast.success("Đang mở VNPT eKYC...")
        window.location.assign(result.launchUrl)
        return
      }

      toast.success(result.message ?? "Đã cập nhật trạng thái eKYC.")
    } catch (err) {
      toast.error(
        sanitizeUserError(
          err,
          "Chưa khởi tạo được phiên VNPT eKYC. Vui lòng thử lại sau."
        )
      )
    }
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
            Bạn cần hoàn tất đăng ký seller trước khi bắt đầu VNPT eKYC.
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
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-red-50 px-3 py-1 text-xs font-semibold text-brand-red-700">
            <ShieldCheck size={12} />
            eKYC Seller
          </div>
          <h1 className="mt-3 text-2xl font-bold text-neutral-900 lg:text-3xl">
            Xác minh danh tính bằng VNPT eKYC
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-neutral-600">
            Kết quả eKYC sẽ được lưu về Firestore để admin xem lại, trong khi seller có thể theo dõi
            trạng thái hồ sơ ngay tại đây.
          </p>
        </div>
        <button
          type="button"
          onClick={handleStart}
          disabled={startKyc.isPending}
          className="btn-primary"
        >
          {startKyc.isPending ? <Loader2 size={14} className="animate-spin" /> : <BadgeCheck size={14} />}
          {ctaLabel}
        </button>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
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
              <div className={`rounded-full px-3 py-1 text-xs font-semibold ${statusMeta.tone}`}>
                {statusMeta.label}
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <InfoTile label="Nhà cung cấp" value={providerLabel} icon={Sparkles} />
              <InfoTile label="Mức KYC" value={levelLabel} icon={CheckCircle2} />
              <InfoTile label="Hồ sơ seller" value={vendor.status} icon={FileText} />
            </div>

            <div className="mt-4 rounded-xl bg-neutral-50 p-4 text-sm text-neutral-700">
              {statusMeta.description}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleStart}
                disabled={startKyc.isPending}
                className="btn-secondary"
              >
                <ArrowRight size={14} />
                {ctaLabel}
              </button>
              <button
                type="button"
                onClick={() => kycQuery.refetch()}
                className="btn-secondary"
              >
                <RefreshCw size={14} />
                Làm mới trạng thái
              </button>
              <Link to="/contact" className="btn-secondary">
                <ExternalLink size={14} />
                Cần hỗ trợ
              </Link>
            </div>
          </div>

          <div className="card overflow-hidden p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-neutral-900">Lịch sử phiên eKYC</h3>
                <p className="text-xs text-neutral-500">
                  Theo dõi các lần tạo phiên, chờ xử lý và kết quả cuối cùng.
                </p>
              </div>
              <span className="text-xs text-neutral-400">
                {kycQuery.data?.length ?? 0} phiên
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {kycErrorMessage && (
                <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                  <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold">Không tải được lịch sử eKYC</p>
                    <p className="mt-0.5 text-xs">{kycErrorMessage}</p>
                    <button
                      type="button"
                      onClick={() => kycQuery.refetch()}
                      className="mt-2 inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                    >
                      <RefreshCw size={12} />
                      Thử lại
                    </button>
                  </div>
                </div>
              )}

              {kycQuery.isLoading && (
                <div className="flex items-center gap-2 text-sm text-neutral-500">
                  <Loader2 size={14} className="animate-spin text-brand-red-500" />
                  Đang tải lịch sử eKYC...
                </div>
              )}

              {!kycQuery.isLoading && (kycQuery.data?.length ?? 0) === 0 && (
                <div className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-500">
                  Chưa có phiên eKYC nào. Bấm nút bắt đầu để tạo phiên đầu tiên.
                </div>
              )}

              {kycQuery.data?.map((application) => (
                <ApplicationCard key={application.id} application={application} />
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="card p-6">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-brand-gold-100 p-2 text-brand-gold-700">
                <Clock3 size={18} />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-neutral-900">
                  Trạng thái hiện tại
                </h3>
                <p className="mt-1 text-sm text-neutral-600">
                  {currentStatus === "approved"
                    ? "VNPT đã xác minh thành công. Nếu hồ sơ seller vẫn chờ duyệt, admin sẽ xem lại ngay trên màn hình kiểm duyệt."
                    : currentStatus === "rejected"
                    ? "VNPT báo kết quả chưa đạt. Bạn có thể cập nhật thông tin và tạo lại phiên mới."
                    : currentStatus === "failed"
                    ? "Có lỗi trong quá trình tạo hoặc gửi phiên eKYC. Hãy thử lại."
                    : "Phiên eKYC đang mở hoặc đã được tạo. Hoàn tất tại VNPT để hệ thống nhận callback."}
                </p>
              </div>
            </div>

            <dl className="mt-4 space-y-2 text-sm">
              <StatusRow label="Trạng thái" value={getKycStatusLabel(currentStatus)} tone={statusMeta.tone} />
              <StatusRow label="Provider" value={providerLabel} />
              <StatusRow label="Application ID" value={latestApplication?.id ?? "—"} mono />
              <StatusRow
                label="Provider ref"
                value={latestApplication?.provider_application_id ?? latestApplication?.provider_reference_id ?? "—"}
                mono
              />
              <StatusRow label="Tạo lúc" value={formatDate(latestApplication?.created_at)} />
              <StatusRow label="Cập nhật" value={formatDate(latestApplication?.updated_at)} />
            </dl>
          </div>

          <div className="card p-6">
            <h3 className="text-sm font-bold text-neutral-900">Thông tin kết quả</h3>
            <p className="mt-1 text-xs text-neutral-500">
              Khi VNPT trả callback, các trường dưới đây sẽ được cập nhật tự động nếu có dữ liệu.
            </p>
            {latestApplication?.result ? (
              <dl className="mt-4 space-y-2 text-sm">
                <StatusRow label="Họ tên" value={latestApplication.result.full_name ?? "—"} />
                <StatusRow label="Số giấy tờ" value={latestApplication.result.id_number_masked ?? latestApplication.result.id_number ?? "—"} mono />
                <StatusRow
                  label="Face score"
                  value={
                    typeof latestApplication.result.face_match_score === "number"
                      ? `${Math.round(latestApplication.result.face_match_score)}%`
                      : "—"
                  }
                />
                <StatusRow
                  label="Liveness"
                  value={
                    typeof latestApplication.result.liveness_score === "number"
                      ? `${Math.round(latestApplication.result.liveness_score)}%`
                      : "—"
                  }
                />
              </dl>
            ) : (
              <div className="mt-4 rounded-xl border border-dashed border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-500">
                Chưa có dữ liệu kết quả. Trạng thái sẽ tự cập nhật sau khi webhook về.
              </div>
            )}
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
      <dt className="text-xs text-neutral-500">{label}</dt>
      <dd
        className={
          tone
            ? `rounded-full px-2 py-0.5 text-[11px] font-semibold ${tone}`
            : `text-xs font-semibold ${mono ? "font-mono" : "uppercase"} text-neutral-900`
        }
      >
        {value}
      </dd>
    </div>
  )
}

function ApplicationCard({
  application,
}: {
  application: KycApplicationRecord
}) {
  const meta = getKycStatusMeta(application.status)
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${badgeTone(application.status)}`}>
              {meta.label}
            </span>
            <span className="text-[11px] text-neutral-400">
              {getKycProviderLabel(application.provider)}
            </span>
          </div>
          <div className="mt-1 text-sm font-semibold text-neutral-900">
            {application.id}
          </div>
          <p className="mt-1 text-xs text-neutral-500">
            Tạo: {formatDate(application.created_at)} · Cập nhật: {formatDate(application.updated_at)}
          </p>
        </div>
        <div className="text-right text-xs text-neutral-500">
          <div>Mức yêu cầu</div>
          <div className="font-semibold text-neutral-900">
            {application.requested_level.toUpperCase()}
          </div>
        </div>
      </div>

      {application.provider_message && (
        <div className="mt-3 rounded-lg bg-neutral-50 px-3 py-2 text-xs text-neutral-600">
          {application.provider_message}
        </div>
      )}
    </div>
  )
}
