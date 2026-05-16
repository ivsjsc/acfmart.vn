import { useEffect, useMemo, useState } from "react"
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  Loader2,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  XCircle,
  Wifi,
} from "lucide-react"
import toast from "react-hot-toast"
import { cn } from "../../../lib/cn"
import { formatDateTime } from "../../../lib/format"
import { writeAuditLog } from "../../../lib/audit-log"
import {
  subscribeCounterfeitReports,
  updateCounterfeitReportStatus,
  type CounterfeitReport,
  type CounterfeitReportStatus,
} from "../../../lib/counterfeit-report-service"
import { useAuthStore } from "../../../stores/auth-store"

const STATUS_TABS: Array<{ value: "all" | CounterfeitReportStatus; label: string }> = [
  { value: "pending", label: "Chờ xử lý" },
  { value: "investigating", label: "Đang xác minh" },
  { value: "verified_counterfeit", label: "Xác nhận giả" },
  { value: "false_alarm", label: "Không phải giả" },
  { value: "resolved", label: "Đã hoàn tất" },
  { value: "rejected", label: "Từ chối" },
  { value: "all", label: "Tất cả" },
]

const STATUS_META: Record<string, { label: string; className: string; icon: typeof Clock }> = {
  pending: {
    label: "Chờ xử lý",
    className: "bg-amber-50 text-amber-700 border-amber-200",
    icon: Clock,
  },
  investigating: {
    label: "Đang xác minh",
    className: "bg-blue-50 text-blue-700 border-blue-200",
    icon: Eye,
  },
  verified_counterfeit: {
    label: "Xác nhận hàng giả",
    className: "bg-rose-50 text-rose-700 border-rose-200",
    icon: ShieldAlert,
  },
  false_alarm: {
    label: "Không phải hàng giả",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: CheckCircle2,
  },
  resolved: {
    label: "Đã hoàn tất",
    className: "bg-neutral-100 text-neutral-700 border-neutral-200",
    icon: ShieldCheck,
  },
  rejected: {
    label: "Từ chối",
    className: "bg-neutral-100 text-neutral-700 border-neutral-200",
    icon: XCircle,
  },
}

const TERMINAL_STATUSES: CounterfeitReportStatus[] = [
  "verified_counterfeit",
  "false_alarm",
  "resolved",
  "rejected",
]

export function CounterfeitReportsScreen() {
  const user = useAuthStore((state) => state.user)
  const [reports, setReports] = useState<CounterfeitReport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<"all" | CounterfeitReportStatus>("pending")
  const [search, setSearch] = useState("")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [moderatorNote, setModeratorNote] = useState("")
  const [updatingStatus, setUpdatingStatus] = useState<CounterfeitReportStatus | null>(null)
  const [retryToken, setRetryToken] = useState(0)

  useEffect(() => {
    setLoading(true)
    setError(null)
    const unsub = subscribeCounterfeitReports(
      (data) => {
        setReports(data.sort((a, b) => getTime(b.createdAt) - getTime(a.createdAt)))
        setLoading(false)
      },
      (err) => {
        setReports([])
        setError(err.message)
        setLoading(false)
      }
    )
    return () => unsub()
  }, [retryToken])

  const selectedReport = useMemo(
    () => reports.find((report) => report.id === selectedId) ?? null,
    [reports, selectedId]
  )

  useEffect(() => {
    setModeratorNote(selectedReport?.moderatorNote ?? selectedReport?.resolutionNote ?? "")
  }, [selectedReport?.id])

  const statusCounts = useMemo(() => {
    return reports.reduce<Record<string, number>>((acc, report) => {
      const status = report.status || "pending"
      acc[status] = (acc[status] ?? 0) + 1
      acc.all = (acc.all ?? 0) + 1
      return acc
    }, { all: 0 })
  }, [reports])

  const filteredReports = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()
    return reports.filter((report) => {
      if (statusFilter !== "all" && report.status !== statusFilter) return false
      if (!normalizedSearch) return true

      const haystack = [
        report.title,
        report.description,
        report.reporterName,
        report.reporterEmail,
        report.reporterPhone,
        report.productName,
        report.productId,
        report.vendorId,
        report.orderId,
        report.qrCode,
        report.verificationCodeId,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()

      return haystack.includes(normalizedSearch)
    })
  }, [reports, statusFilter, search])

  const metrics = useMemo(() => {
    const pending = statusCounts.pending ?? 0
    const investigating = statusCounts.investigating ?? 0
    const verified = statusCounts.verified_counterfeit ?? 0
    const closed =
      (statusCounts.false_alarm ?? 0) +
      (statusCounts.resolved ?? 0) +
      (statusCounts.rejected ?? 0) +
      verified

    return [
      {
        label: "Chờ xử lý",
        value: pending,
        icon: Clock,
        color: "bg-amber-50 text-amber-700",
      },
      {
        label: "Đang xác minh",
        value: investigating,
        icon: Eye,
        color: "bg-blue-50 text-blue-700",
      },
      {
        label: "Xác nhận giả",
        value: verified,
        icon: ShieldAlert,
        color: "bg-rose-50 text-rose-700",
      },
      {
        label: "Đã đóng",
        value: closed,
        icon: CheckCircle2,
        color: "bg-emerald-50 text-emerald-700",
      },
    ]
  }, [statusCounts])

  async function handleStatusUpdate(report: CounterfeitReport, status: CounterfeitReportStatus) {
    const note = moderatorNote.trim()
    if (TERMINAL_STATUSES.includes(status) && note.length < 10) {
      toast.error("Vui lòng nhập ghi chú xử lý tối thiểu 10 ký tự")
      return
    }

    setUpdatingStatus(status)
    try {
      await updateCounterfeitReportStatus(report.id, {
        status,
        moderatorNote: note || undefined,
      })

      await writeAuditLog({
        action: "report_resolve",
        actor_id: user?.id ?? "unknown",
        actor_email: user?.email ?? "unknown",
        actor_role: user?.role ?? "moderator",
        target_type: "counterfeitReport",
        target_id: report.id,
        details: {
          status,
          previous_status: report.status,
          product_id: report.productId,
          qr_code: report.qrCode ?? report.verificationCodeId,
        },
      })

      toast.success("Đã cập nhật trạng thái báo cáo")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Cập nhật thất bại"
      toast.error(message)
    } finally {
      setUpdatingStatus(null)
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Báo cáo hàng giả</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Tiếp nhận, xác minh và kết luận các báo cáo nghi vấn hàng giả từ người mua
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
          </span>
          <Wifi size={12} /> Realtime
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
            <div className={cn("inline-flex rounded-lg p-2", metric.color)}>
              <metric.icon size={20} />
            </div>
            <p className="mt-3 text-xs text-neutral-500">{metric.label}</p>
            <p className="mt-1 text-2xl font-bold text-neutral-900">
              {metric.value.toLocaleString("vi-VN")}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex gap-1 overflow-x-auto">
          {STATUS_TABS.map((tab) => {
            const count = statusCounts[tab.value] ?? 0
            return (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={cn(
                  "flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                  statusFilter === tab.value
                    ? "bg-brand-red-50 text-brand-red-700"
                    : "text-neutral-600 hover:bg-neutral-100"
                )}
              >
                {tab.label}
                {count > 0 && (
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                      statusFilter === tab.value
                        ? "bg-brand-red-200 text-brand-red-800"
                        : "bg-neutral-200 text-neutral-700"
                    )}
                  >
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        <div className="relative w-full max-w-sm">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
          />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm QR, sản phẩm, người báo cáo..."
            className="w-full rounded-lg border border-neutral-200 py-2 pl-9 pr-4 text-sm outline-none focus:border-brand-red-300 focus:ring-1 focus:ring-brand-red-200"
          />
        </div>
      </div>

      {error && !loading && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4">
          <AlertTriangle className="mt-0.5 shrink-0 text-rose-600" size={18} />
          <div className="flex-1">
            <p className="text-sm font-semibold text-rose-900">Không thể tải báo cáo hàng giả</p>
            <p className="mt-1 text-xs text-rose-700">{error}</p>
            <button
              onClick={() => setRetryToken((value) => value + 1)}
              className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-rose-300 bg-white px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-100"
            >
              <RefreshCw size={12} />
              Thử lại
            </button>
          </div>
        </div>
      )}

      <div className="mt-6">
        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="animate-spin text-brand-red-500" size={28} />
          </div>
        )}

        {!loading && !error && filteredReports.length === 0 && (
          <div className="rounded-xl border border-neutral-200 bg-white py-16 text-center">
            <ShieldCheck className="mx-auto text-neutral-300" size={34} />
            <p className="mt-3 text-sm text-neutral-500">
              {reports.length === 0
                ? "Chưa có báo cáo hàng giả nào"
                : "Không có báo cáo nào khớp bộ lọc"}
            </p>
          </div>
        )}

        {!loading && filteredReports.length > 0 && (
          <div className="space-y-3">
            {filteredReports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                expanded={selectedId === report.id}
                moderatorNote={moderatorNote}
                updatingStatus={updatingStatus}
                onToggle={() => setSelectedId(selectedId === report.id ? null : report.id)}
                onNoteChange={setModeratorNote}
                onStatusUpdate={(status) => handleStatusUpdate(report, status)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ReportCard({
  report,
  expanded,
  moderatorNote,
  updatingStatus,
  onToggle,
  onNoteChange,
  onStatusUpdate,
}: {
  report: CounterfeitReport
  expanded: boolean
  moderatorNote: string
  updatingStatus: CounterfeitReportStatus | null
  onToggle: () => void
  onNoteChange: (value: string) => void
  onStatusUpdate: (status: CounterfeitReportStatus) => void
}) {
  const meta = STATUS_META[report.status] ?? {
    label: report.status || "Chờ xử lý",
    className: "bg-neutral-100 text-neutral-700 border-neutral-200",
    icon: FileText,
  }
  const StatusIcon = meta.icon
  const qrCode = report.qrCode ?? report.verificationCodeId

  return (
    <div className="rounded-xl border border-neutral-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full flex-col gap-4 p-4 text-left transition-colors hover:bg-neutral-50 lg:flex-row lg:items-center"
      >
        <div className={cn("inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold", meta.className)}>
          <StatusIcon size={13} />
          {meta.label}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
            <span>{formatMaybeDate(report.createdAt)}</span>
            {qrCode && (
              <>
                <span>·</span>
                <span className="font-mono">{qrCode}</span>
              </>
            )}
          </div>
          <h2 className="mt-1 truncate text-sm font-semibold text-neutral-900">
            {report.productName || report.title}
          </h2>
          <p className="mt-1 line-clamp-1 text-xs text-neutral-500">
            {report.description || "Chưa có mô tả chi tiết"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-neutral-500 lg:justify-end">
          {report.orderId && <InfoPill label="Đơn" value={report.orderId} />}
          {report.productId && <InfoPill label="SP" value={report.productId} />}
          {report.reporterName && <InfoPill label="Người báo" value={report.reporterName} />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-neutral-100 p-4">
          <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
            <div className="space-y-4">
              <section className="rounded-lg bg-neutral-50 p-4">
                <h3 className="text-sm font-semibold text-neutral-900">Nội dung báo cáo</h3>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-neutral-700">
                  {report.description || "Không có mô tả."}
                </p>
              </section>

              <div className="grid gap-3 sm:grid-cols-2">
                <DetailItem label="Người báo cáo" value={report.reporterName || report.reporterId} />
                <DetailItem label="Liên hệ" value={report.reporterEmail || report.reporterPhone} />
                <DetailItem label="Sản phẩm" value={report.productName || report.productId} />
                <DetailItem label="Seller / Vendor" value={report.vendorId} />
                <DetailItem label="Mã QR / Verification" value={qrCode} />
                <DetailItem label="Nơi mua" value={report.purchaseLocation} />
              </div>

              {report.evidenceUrls.length > 0 && (
                <section>
                  <h3 className="mb-3 text-sm font-semibold text-neutral-900">Bằng chứng đính kèm</h3>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {report.evidenceUrls.map((url) => (
                      <a
                        key={url}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="block overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100"
                      >
                        <img src={url} alt="Bằng chứng báo cáo hàng giả" className="h-28 w-full object-cover" />
                      </a>
                    ))}
                  </div>
                </section>
              )}
            </div>

            <aside className="rounded-lg border border-neutral-200 bg-white p-4">
              <h3 className="text-sm font-semibold text-neutral-900">Xử lý của moderator</h3>
              <p className="mt-1 text-xs leading-5 text-neutral-500">
                Ghi chú sẽ lưu vào báo cáo và audit log. Với trạng thái kết luận, ghi chú là bắt buộc.
              </p>
              <textarea
                value={moderatorNote}
                onChange={(event) => onNoteChange(event.target.value)}
                rows={5}
                placeholder="Nhập kết quả xác minh, bằng chứng đã đối chiếu, hoặc lý do từ chối..."
                className="mt-3 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-brand-red-300 focus:ring-1 focus:ring-brand-red-200"
              />

              <div className="mt-4 grid gap-2">
                <StatusButton
                  status="investigating"
                  label="Chuyển sang đang xác minh"
                  loading={updatingStatus === "investigating"}
                  onClick={onStatusUpdate}
                />
                <StatusButton
                  status="verified_counterfeit"
                  label="Xác nhận hàng giả"
                  danger
                  loading={updatingStatus === "verified_counterfeit"}
                  onClick={onStatusUpdate}
                />
                <StatusButton
                  status="false_alarm"
                  label="Kết luận không phải hàng giả"
                  loading={updatingStatus === "false_alarm"}
                  onClick={onStatusUpdate}
                />
                <StatusButton
                  status="resolved"
                  label="Đánh dấu đã hoàn tất"
                  loading={updatingStatus === "resolved"}
                  onClick={onStatusUpdate}
                />
                <StatusButton
                  status="rejected"
                  label="Từ chối báo cáo"
                  loading={updatingStatus === "rejected"}
                  onClick={onStatusUpdate}
                />
              </div>
            </aside>
          </div>
        </div>
      )}
    </div>
  )
}

function StatusButton({
  status,
  label,
  danger,
  loading,
  onClick,
}: {
  status: CounterfeitReportStatus
  label: string
  danger?: boolean
  loading: boolean
  onClick: (status: CounterfeitReportStatus) => void
}) {
  return (
    <button
      type="button"
      disabled={loading}
      onClick={() => onClick(status)}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60",
        danger
          ? "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
          : "border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100"
      )}
    >
      {loading && <Loader2 size={13} className="animate-spin" />}
      {label}
    </button>
  )
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <span className="rounded-full bg-neutral-100 px-2 py-1">
      {label}: <span className="font-medium text-neutral-700">{value}</span>
    </span>
  )
}

function DetailItem({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-3">
      <p className="text-[11px] font-medium uppercase text-neutral-400">{label}</p>
      <p className="mt-1 break-words text-sm text-neutral-800">{value || "Chưa có dữ liệu"}</p>
    </div>
  )
}

function formatMaybeDate(value: unknown): string {
  const date = toDate(value)
  return date ? formatDateTime(date) : "Chưa có thời gian"
}

function getTime(value: unknown): number {
  return toDate(value)?.getTime() ?? 0
}

function toDate(value: unknown): Date | null {
  if (!value) return null
  if (value instanceof Date) return value
  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? null : date
  }
  if (typeof value === "object" && "toDate" in value && typeof value.toDate === "function") {
    return value.toDate()
  }
  return null
}
