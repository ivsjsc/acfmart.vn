import { useState } from "react"
import {
  ShieldCheck,
  ShieldAlert,
  ShieldOff,
  RefreshCcw,
  Search,
  ChevronDown,
  ChevronUp,
  Loader2,
  Monitor,
  Smartphone,
  Globe,
  AlertTriangle,
  X,
} from "lucide-react"
import { useAdminVerificationLogDetail, useAdminVerificationLogs } from "../../../hooks/use-ivs-admin-qr"
import type { IvsAdminVerificationLog } from "../../../lib/ivs-trust-api"
import { cn } from "../../../lib/cn"

const RESULT_OPTIONS = [
  { value: "", label: "Tất cả kết quả" },
  { value: "GENUINE", label: "Chính hãng" },
  { value: "INVALID", label: "Không hợp lệ" },
  { value: "SUSPECT", label: "Nghi vấn" },
  { value: "VOIDED", label: "Thu hồi" },
  { value: "EXPIRED", label: "Hết hạn" },
]

const PAGE_SIZE = 20

export function AdminQrVerificationLogsScreen() {
  const [page, setPage] = useState(1)
  const [result, setResult] = useState("")
  const [publicCodeInput, setPublicCodeInput] = useState("")
  const [publicCode, setPublicCode] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const logsQuery = useAdminVerificationLogs({
    page,
    limit: PAGE_SIZE,
    result: result || undefined,
    publicCode: publicCode || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo ? `${dateTo}T23:59:59Z` : undefined,
  })

  const totalPages = Math.ceil((logsQuery.data?.total ?? 0) / PAGE_SIZE)

  function applySearch() {
    setPublicCode(publicCodeInput.trim())
    setPage(1)
  }

  function resetFilters() {
    setResult("")
    setPublicCodeInput("")
    setPublicCode("")
    setDateFrom("")
    setDateTo("")
    setPage(1)
  }

  const hasFilters = result || publicCode || dateFrom || dateTo

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Lịch sử xác thực QR</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Toàn bộ lượt quét tem QR — kết quả, thiết bị, IP và cảnh báo rủi ro.
          </p>
        </div>
        <button
          type="button"
          onClick={() => logsQuery.refetch()}
          disabled={logsQuery.isFetching}
          className="btn-secondary"
        >
          {logsQuery.isFetching
            ? <Loader2 size={16} className="animate-spin" />
            : <RefreshCcw size={16} />}
          Làm mới
        </button>
      </div>

      {/* Filters */}
      <div className="mb-4 rounded-xl border border-neutral-200 bg-white p-4">
        <div className="flex flex-wrap gap-3">
          {/* Result filter */}
          <select
            value={result}
            onChange={(e) => { setResult(e.target.value); setPage(1) }}
            className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm"
          >
            {RESULT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          {/* Public code search */}
          <div className="flex min-w-0 flex-1 gap-2">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Tìm mã QR (publicCode)..."
                value={publicCodeInput}
                onChange={(e) => setPublicCodeInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && applySearch()}
                className="w-full rounded-lg border border-neutral-200 py-2 pl-8 pr-3 text-sm"
              />
            </div>
            <button
              type="button"
              onClick={applySearch}
              className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-700"
            >
              Tìm
            </button>
          </div>

          {/* Date range */}
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => { setDateFrom(e.target.value); setPage(1) }}
            className="rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-700"
          />
          <span className="self-center text-xs text-neutral-400">—</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => { setDateTo(e.target.value); setPage(1) }}
            className="rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-700"
          />

          {hasFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-50"
            >
              <X size={13} />
              Bỏ lọc
            </button>
          )}
        </div>
      </div>

      {/* Summary */}
      {logsQuery.data && (
        <p className="mb-3 text-xs text-neutral-500">
          {logsQuery.data.total.toLocaleString("vi-VN")} lượt quét
          {hasFilters ? " (đã lọc)" : ""}
        </p>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
        {logsQuery.isLoading ? (
          <div className="flex items-center justify-center py-20 text-sm text-neutral-500">
            <Loader2 size={20} className="mr-2 animate-spin text-brand-red-500" />
            Đang tải...
          </div>
        ) : logsQuery.error ? (
          <div className="py-16 text-center text-sm text-rose-600">
            Không tải được dữ liệu. Kiểm tra quyền admin.
          </div>
        ) : !logsQuery.data?.data.length ? (
          <div className="py-16 text-center text-sm text-neutral-500">
            Không có lượt quét nào{hasFilters ? " khớp bộ lọc" : ""}.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-neutral-100 bg-neutral-50 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                <tr>
                  <th className="px-4 py-3">Thời gian</th>
                  <th className="px-4 py-3">Mã QR</th>
                  <th className="px-4 py-3">Kết quả</th>
                  <th className="px-4 py-3">Sản phẩm</th>
                  <th className="px-4 py-3">Seller</th>
                  <th className="px-4 py-3">IP</th>
                  <th className="px-4 py-3">Thiết bị</th>
                  <th className="px-4 py-3 w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {logsQuery.data.data.map((log) => (
                  <>
                    <tr
                      key={log.id}
                      onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                      className="cursor-pointer transition-colors hover:bg-neutral-50"
                    >
                      <td className="whitespace-nowrap px-4 py-3 text-xs text-neutral-500">
                        {formatDate(log.createdAt)}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-neutral-700">
                        {log.publicCode
                          ? <span className="max-w-[120px] block truncate" title={log.publicCode}>{log.publicCode}</span>
                          : <span className="text-neutral-400">—</span>
                        }
                      </td>
                      <td className="px-4 py-3">
                        <ResultBadge result={log.result} />
                      </td>
                      <td className="px-4 py-3">
                        {log.productName
                          ? <span className="max-w-[160px] block truncate text-xs font-medium text-neutral-800" title={log.productName}>{log.productName}</span>
                          : <span className="text-xs text-neutral-400">—</span>
                        }
                      </td>
                      <td className="px-4 py-3">
                        {log.sellerName
                          ? <span className="max-w-[120px] block truncate text-xs text-neutral-600" title={log.sellerName}>{log.sellerName}</span>
                          : <span className="text-xs text-neutral-400">—</span>
                        }
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-neutral-600">
                        {log.ipAddress ?? <span className="text-neutral-400">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <DeviceLabel ua={log.userAgent} />
                      </td>
                      <td className="px-4 py-3 text-neutral-400">
                        {expandedId === log.id
                          ? <ChevronUp size={14} />
                          : <ChevronDown size={14} />}
                      </td>
                    </tr>
                    {expandedId === log.id && (
                      <tr key={`${log.id}-detail`}>
                        <td colSpan={8} className="bg-neutral-50 px-4 py-0">
                          <DetailPanel id={log.id} log={log} />
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-xs text-neutral-500">
            Trang {page} / {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-40"
            >
              Trước
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-40"
            >
              Sau
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Detail panel — loads full detail on expand
// ---------------------------------------------------------------------------

function DetailPanel({ id, log }: { id: string; log: IvsAdminVerificationLog }) {
  const detailQuery = useAdminVerificationLogDetail(id)
  const detail = detailQuery.data

  return (
    <div className="py-4">
      {detailQuery.isLoading && (
        <div className="flex items-center gap-2 py-2 text-xs text-neutral-500">
          <Loader2 size={13} className="animate-spin" /> Đang tải chi tiết...
        </div>
      )}

      {detail && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Device */}
          <InfoCard title="Thiết bị & Mạng">
            <InfoRow label="IP" value={detail.ipAddress ?? "—"} mono />
            <InfoRow label="IP Hash" value={detail.ipHash} mono truncate />
            <InfoRow label="Device Hash" value={detail.deviceFingerprintHash ?? "—"} mono truncate />
            <InfoRow label="User Agent" value={detail.userAgent ?? "—"} truncate />
          </InfoCard>

          {/* QR & Scan context */}
          <InfoCard title="Thông tin quét">
            <InfoRow label="Mã QR" value={detail.publicCode ?? "—"} mono />
            <InfoRow label="Trạng thái QR" value={detail.qrStatus ?? "—"} />
            <InfoRow label="Risk score" value={detail.riskScore != null ? String(detail.riskScore) : "—"} />
            {detail.qrCode && (
              <>
                <InfoRow label="Serial No" value={detail.qrCode.serialNo} mono />
                <InfoRow label="Batch ID" value={detail.qrCode.batchId ?? "—"} mono truncate />
              </>
            )}
            {detail.userId && <InfoRow label="User ID" value={detail.userId} mono truncate />}
          </InfoCard>

          {/* Product & Seller */}
          <InfoCard title="Sản phẩm & Seller">
            <InfoRow label="Sản phẩm" value={detail.product?.name ?? detail.productName ?? "—"} />
            {detail.product?.brand && <InfoRow label="Thương hiệu" value={detail.product.brand} />}
            {detail.product?.publicRef && <InfoRow label="Ref" value={detail.product.publicRef} mono />}
            <InfoRow label="Seller" value={detail.seller?.displayName ?? detail.sellerName ?? "—"} />
            {detail.seller?.code && <InfoRow label="Mã seller" value={detail.seller.code} mono />}
          </InfoCard>
        </div>
      )}

      {/* Risk Events */}
      {detail && detail.riskEvents.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Cảnh báo rủi ro ({detail.riskEvents.length})
          </p>
          <div className="space-y-2">
            {detail.riskEvents.map((event) => (
              <div
                key={event.id}
                className={cn(
                  "flex items-start gap-3 rounded-lg border p-3",
                  event.severity === "HIGH"
                    ? "border-red-200 bg-red-50"
                    : event.severity === "MEDIUM"
                      ? "border-amber-200 bg-amber-50"
                      : "border-neutral-200 bg-neutral-50"
                )}
              >
                <AlertTriangle
                  size={14}
                  className={cn(
                    "mt-0.5 shrink-0",
                    event.severity === "HIGH" ? "text-red-600" : event.severity === "MEDIUM" ? "text-amber-600" : "text-neutral-500"
                  )}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-neutral-900">{event.ruleCode}</span>
                    <SeverityBadge severity={event.severity} />
                    <StatusBadge status={event.status} />
                  </div>
                  <p className="mt-0.5 text-xs text-neutral-700">{event.message}</p>
                  <p className="mt-0.5 text-[10px] text-neutral-400">{formatDate(event.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {detail && detail.riskEvents.length === 0 && (
        <p className="mt-3 text-xs text-neutral-400">Không có cảnh báo rủi ro cho lượt quét này.</p>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Small UI pieces
// ---------------------------------------------------------------------------

function ResultBadge({ result }: { result: string }) {
  const normalized = result.toUpperCase()
  if (normalized === "GENUINE") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
        <ShieldCheck size={11} /> Chính hãng
      </span>
    )
  }
  if (normalized === "SUSPECT") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
        <ShieldAlert size={11} /> Nghi vấn
      </span>
    )
  }
  if (normalized === "INVALID") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-semibold text-neutral-600">
        <ShieldOff size={11} /> Không hợp lệ
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-700">
      <ShieldOff size={11} /> {result}
    </span>
  )
}

function DeviceLabel({ ua }: { ua?: string | null }) {
  if (!ua) return <span className="text-xs text-neutral-400">—</span>
  const isMobile = /iphone|android|mobile/i.test(ua)
  const isTablet = /ipad|tablet/i.test(ua)
  const label = parseUaShort(ua)
  const Icon = isMobile || isTablet ? Smartphone : Monitor
  return (
    <span className="inline-flex max-w-[140px] items-center gap-1 truncate text-xs text-neutral-600" title={ua}>
      <Icon size={12} className="shrink-0 text-neutral-400" />
      {label}
    </span>
  )
}

function parseUaShort(ua: string): string {
  if (/iphone/i.test(ua)) return "iPhone"
  if (/ipad/i.test(ua)) return "iPad"
  if (/android/i.test(ua)) {
    const match = ua.match(/Android[\s/]([\d.]+)/)
    return match ? `Android ${match[1]}` : "Android"
  }
  if (/windows/i.test(ua)) return "Windows"
  if (/macintosh|mac os/i.test(ua)) return "macOS"
  if (/linux/i.test(ua)) return "Linux"
  if (/bot|crawler|spider/i.test(ua)) return "Bot"
  return "Unknown"
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-3">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-neutral-400">{title}</p>
      <div className="space-y-1.5">{children}</div>
    </div>
  )
}

function InfoRow({
  label,
  value,
  mono,
  truncate,
}: {
  label: string
  value: string
  mono?: boolean
  truncate?: boolean
}) {
  return (
    <div className="flex items-start justify-between gap-2">
      <span className="shrink-0 text-[11px] text-neutral-500">{label}</span>
      <span
        className={cn(
          "text-right text-[11px] text-neutral-900",
          mono && "font-mono",
          truncate && "max-w-[180px] truncate"
        )}
        title={value}
      >
        {value}
      </span>
    </div>
  )
}

function SeverityBadge({ severity }: { severity: string }) {
  const map: Record<string, string> = {
    HIGH: "bg-red-100 text-red-700",
    MEDIUM: "bg-amber-100 text-amber-700",
    LOW: "bg-neutral-100 text-neutral-600",
  }
  return (
    <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-bold", map[severity] ?? map.LOW)}>
      {severity}
    </span>
  )
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "rounded px-1.5 py-0.5 text-[10px] font-medium",
        status === "OPEN" ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"
      )}
    >
      {status === "OPEN" ? "Chưa xử lý" : "Đã xử lý"}
    </span>
  )
}

function formatDate(value: string): string {
  const d = new Date(value)
  return Number.isNaN(d.getTime())
    ? value
    : d.toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "medium" })
}
