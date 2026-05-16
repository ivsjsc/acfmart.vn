import { useCallback, useEffect, useState } from "react"
import {
  ShieldAlert,
  Loader2,
  RefreshCw,
  ChevronDown,
  MessageSquare,
  Package,
  User,
  Clock,
  CheckCircle2,
  Eye,
} from "lucide-react"
import toast from "react-hot-toast"
import { cn } from "../../../lib/cn"
import { useAuthStore } from "../../../stores/auth-store"
import {
  listCounterfeitReports,
  updateCounterfeitReportStatus,
  type CounterfeitReportDoc,
  type CounterfeitReportStatus,
} from "../../../lib/counterfeit-report-service"

const STATUS_TABS: {
  value: CounterfeitReportStatus | "all"
  label: string
  color: string
}[] = [
  { value: "all", label: "Tất cả", color: "text-neutral-700" },
  { value: "pending", label: "Chờ xử lý", color: "text-amber-600" },
  { value: "reviewing", label: "Đang xem xét", color: "text-sky-600" },
  { value: "resolved", label: "Đã xử lý", color: "text-emerald-600" },
  { value: "rejected", label: "Từ chối", color: "text-rose-600" },
]

const STATUS_STYLE: Record<CounterfeitReportStatus, string> = {
  pending: "bg-amber-50 text-amber-800 ring-amber-200",
  reviewing: "bg-sky-50 text-sky-800 ring-sky-200",
  resolved: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  rejected: "bg-rose-50 text-rose-800 ring-rose-200",
}

function formatTime(ts: CounterfeitReportDoc["created_at"]) {
  if (!ts?.toDate) return "—"
  return ts.toDate().toLocaleString("vi-VN")
}

export function CounterfeitReportsScreen() {
  const currentUser = useAuthStore((s) => s.user)
  const [tab, setTab] = useState<CounterfeitReportStatus | "all">("pending")
  const [reports, setReports] = useState<CounterfeitReportDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<CounterfeitReportDoc | null>(null)
  const [nextStatus, setNextStatus] = useState<CounterfeitReportStatus>("reviewing")
  const [resolutionNote, setResolutionNote] = useState("")
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      if (tab === "all") {
        const list = await listCounterfeitReports({})
        setReports(list)
      } else {
        const list = await listCounterfeitReports({ status: tab })
        setReports(list)
      }
    } catch {
      toast.error("Không thể tải báo cáo (kiểm tra quyền & index Firestore)")
      setReports([])
    } finally {
      setLoading(false)
    }
  }, [tab])

  useEffect(() => {
    load()
  }, [load])

  async function handleUpdate() {
    if (!selected || !currentUser) return
    setSaving(true)
    try {
      await updateCounterfeitReportStatus(selected.id, {
        status: nextStatus,
        resolution_note: resolutionNote,
        actor: {
          id: currentUser.id,
          email: currentUser.email,
          role: currentUser.role,
        },
      })
      toast.success("Đã cập nhật trạng thái báo cáo")
      setSelected(null)
      setResolutionNote("")
      await load()
    } catch {
      toast.error("Cập nhật thất bại")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-neutral-900">
            <ShieldAlert className="text-brand-red-600" size={26} />
            Báo cáo hàng giả
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Tiếp nhận từ người dùng (Firestore{" "}
            <code className="rounded bg-neutral-100 px-1">counterfeitReports</code>). Cập nhật
            trạng thái sẽ ghi{" "}
            <code className="rounded bg-neutral-100 px-1">auditLogs</code>.
          </p>
        </div>
        <button
          type="button"
          onClick={() => load()}
          className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Làm mới
        </button>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {STATUS_TABS.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setTab(t.value)}
            className={cn(
              "rounded-full px-4 py-1.5 text-xs font-semibold ring-1 ring-inset transition-colors",
              tab === t.value
                ? "bg-brand-red-600 text-white ring-brand-red-600"
                : "bg-white text-neutral-600 ring-neutral-200 hover:bg-neutral-50",
            )}
          >
            <span className={tab === t.value ? "" : t.color}>{t.label}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16 text-neutral-500">
          <Loader2 className="animate-spin" size={28} />
        </div>
      ) : reports.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-200 bg-white py-14 text-center text-sm text-neutral-500">
          Không có báo cáo trong nhóm này.
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((r) => {
            const st = r.status ?? "pending"
            return (
            <button
              key={r.id}
              type="button"
              onClick={() => {
                setSelected(r)
                setNextStatus(st === "pending" ? "reviewing" : st)
                setResolutionNote(r.resolution_note ?? "")
              }}
              className="flex w-full flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-4 text-left shadow-sm transition-colors hover:border-brand-red-200 sm:flex-row sm:items-start sm:justify-between"
            >
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[11px] font-bold uppercase ring-1 ring-inset",
                      STATUS_STYLE[st],
                    )}
                  >
                    {st}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-neutral-400">
                    <Clock size={12} /> {formatTime(r.created_at)}
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-neutral-700">
                  <span className="inline-flex items-center gap-1">
                    <Package size={14} className="text-neutral-400" />
                    SP: {r.productId}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <User size={14} className="text-neutral-400" />
                    Reporter: {r.reporterId.slice(0, 8)}…
                  </span>
                </div>
                <p className="line-clamp-2 text-sm text-neutral-600">{r.description}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1 text-xs font-semibold text-brand-red-600">
                <Eye size={14} />
                Chi tiết
              </div>
            </button>
            )
          })}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-start justify-between gap-3">
              <h2 className="text-lg font-bold text-neutral-900">Chi tiết báo cáo</h2>
              <button
                type="button"
                className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
                onClick={() => setSelected(null)}
              >
                ✕
              </button>
            </div>

            <dl className="space-y-2 text-sm">
              <div className="flex gap-2">
                <dt className="w-28 shrink-0 text-neutral-500">ID</dt>
                <dd className="font-mono text-xs">{selected.id}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-28 shrink-0 text-neutral-500">Trạng thái</dt>
                <dd className="font-semibold">{selected.status}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-28 shrink-0 text-neutral-500">Sản phẩm</dt>
                <dd>{selected.productId}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-28 shrink-0 text-neutral-500">Người báo</dt>
                <dd className="font-mono text-xs">{selected.reporterId}</dd>
              </div>
              {selected.qrCode && (
                <div className="flex gap-2">
                  <dt className="w-28 shrink-0 text-neutral-500">Mã QR</dt>
                  <dd className="break-all">{selected.qrCode}</dd>
                </div>
              )}
            </dl>

            <div className="mt-4 rounded-lg bg-neutral-50 p-3">
              <div className="mb-1 flex items-center gap-1 text-xs font-semibold uppercase text-neutral-500">
                <MessageSquare size={14} /> Nội dung
              </div>
              <p className="text-sm text-neutral-800">{selected.description}</p>
            </div>

            <div className="mt-5 space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-neutral-600">
                  Trạng thái mới
                </label>
                <div className="relative">
                  <select
                    value={nextStatus}
                    onChange={(e) =>
                      setNextStatus(e.target.value as CounterfeitReportStatus)
                    }
                    className="w-full appearance-none rounded-lg border border-neutral-200 bg-white py-2.5 pl-3 pr-10 text-sm outline-none focus:border-brand-red-400 focus:ring-2 focus:ring-brand-red-100"
                  >
                    <option value="pending">pending — Chờ xử lý</option>
                    <option value="reviewing">reviewing — Đang xem xét</option>
                    <option value="resolved">resolved — Đã xử lý</option>
                    <option value="rejected">rejected — Từ chối</option>
                  </select>
                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-neutral-600">
                  Ghi chú xử lý (tuỳ chọn)
                </label>
                <textarea
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-neutral-200 p-3 text-sm outline-none focus:border-brand-red-400 focus:ring-2 focus:ring-brand-red-100"
                  placeholder="Kết luận, hành động đã thực hiện…"
                />
              </div>
              <button
                type="button"
                disabled={saving}
                onClick={handleUpdate}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-red-600 py-3 text-sm font-semibold text-white hover:bg-brand-red-700 disabled:opacity-60"
              >
                {saving ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <CheckCircle2 size={18} />
                )}
                Lưu cập nhật
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
