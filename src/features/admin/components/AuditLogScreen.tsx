import { useEffect, useMemo, useState } from "react"
import {
  FileText,
  Loader2,
  AlertTriangle,
  Wifi,
  Search,
  RefreshCw,
} from "lucide-react"
import { cn } from "../../../lib/cn"
import { sanitizeUserError } from "../../../lib/error-utils"
import { subscribeAuditLogs, type AuditAction } from "../../../lib/audit-log"

interface AuditRow {
  id: string
  action: AuditAction
  actor_id: string
  actor_email: string
  actor_role: string
  target_type: string
  target_id: string
  details: Record<string, unknown>
  created_at?: { toDate?: () => Date }
}

const ACTION_LABELS: Record<string, string> = {
  vendor_register: "Đăng ký seller",
  vendor_approve: "Phê duyệt seller",
  vendor_reject: "Từ chối seller",
  vendor_suspend: "Tạm khoá seller",
  product_create: "Tạo sản phẩm",
  product_update: "Sửa sản phẩm",
  product_delete: "Xoá sản phẩm",
  product_submit: "Gửi duyệt sản phẩm",
  product_approve: "Duyệt sản phẩm",
  product_reject: "Từ chối sản phẩm",
  order_status_change: "Đổi trạng thái đơn",
  document_upload: "Upload tài liệu",
  login: "Đăng nhập",
  logout: "Đăng xuất",
  role_change: "Đổi quyền",
  report_submit: "Gửi báo cáo",
  report_resolve: "Xử lý báo cáo",
  settings_change: "Thay đổi cài đặt",
}

function actionColor(action: string): string {
  if (action.includes("approve") || action.includes("login")) {
    return "bg-emerald-100 text-emerald-700"
  }
  if (action.includes("reject") || action.includes("suspend") || action.includes("delete")) {
    return "bg-rose-100 text-rose-700"
  }
  if (action.includes("create") || action.includes("submit") || action.includes("register")) {
    return "bg-blue-100 text-blue-700"
  }
  if (action.includes("update") || action.includes("change") || action.includes("settings")) {
    return "bg-amber-100 text-amber-700"
  }
  return "bg-neutral-100 text-neutral-700"
}

const LIMIT_OPTIONS = [50, 100, 200, 500] as const

export function AuditLogScreen() {
  const [logs, setLogs] = useState<AuditRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [limit, setLimit] = useState<number>(50)
  const [search, setSearch] = useState("")
  const [actionFilter, setActionFilter] = useState<string>("all")
  const [retryToken, setRetryToken] = useState(0)

  useEffect(() => {
    setLoading(true)
    setError(null)
    const unsub = subscribeAuditLogs(
      { limit },
      (data) => {
        setLogs(data as unknown as AuditRow[])
        setLoading(false)
      },
      (err) => {
        setError(sanitizeUserError(err, "Không tải được nhật ký kiểm toán."))
        setLogs([])
        setLoading(false)
      }
    )
    return () => unsub()
  }, [limit, retryToken])

  const filtered = useMemo(() => {
    let rows = logs
    if (actionFilter !== "all") {
      rows = rows.filter((r) => r.action === actionFilter)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      rows = rows.filter(
        (r) =>
          r.actor_email?.toLowerCase().includes(q) ||
          r.actor_id?.toLowerCase().includes(q) ||
          r.target_id?.toLowerCase().includes(q) ||
          r.target_type?.toLowerCase().includes(q)
      )
    }
    return rows
  }, [logs, search, actionFilter])

  const uniqueActions = useMemo(() => {
    return Array.from(new Set(logs.map((l) => l.action))).sort()
  }, [logs])

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Nhật ký Hệ thống</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Audit log — lưu giữ tối thiểu 24 tháng (NĐ 85/2021) · đồng bộ tức thời
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

      {/* Toolbar */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActionFilter("all")}
            className={cn(
              "whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium",
              actionFilter === "all"
                ? "bg-brand-red-50 text-brand-red-700"
                : "text-neutral-600 hover:bg-neutral-100"
            )}
          >
            Tất cả ({logs.length})
          </button>
          {uniqueActions.map((act) => (
            <button
              key={act}
              onClick={() => setActionFilter(act)}
              className={cn(
                "whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium",
                actionFilter === act
                  ? "bg-brand-red-50 text-brand-red-700"
                  : "text-neutral-600 hover:bg-neutral-100"
              )}
            >
              {ACTION_LABELS[act] || act}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo user / target..."
              className="rounded-lg border border-neutral-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-brand-red-300 focus:ring-1 focus:ring-brand-red-200"
            />
          </div>
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="rounded-lg border border-neutral-200 px-2 py-2 text-xs"
          >
            {LIMIT_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n} dòng
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error */}
      {error && !loading && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4">
          <AlertTriangle className="mt-0.5 shrink-0 text-rose-600" size={18} />
          <div className="flex-1">
            <p className="text-sm font-semibold text-rose-900">Không thể tải nhật ký</p>
            <p className="mt-1 text-xs text-rose-700">{error}</p>
            <button
              onClick={() => setRetryToken((n) => n + 1)}
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

        {!loading && !error && filtered.length === 0 && (
          <div className="rounded-xl border border-neutral-200 bg-white py-16 text-center">
            <FileText className="mx-auto text-neutral-300" size={32} />
            <p className="mt-3 text-sm text-neutral-500">
              {logs.length === 0
                ? "Chưa có log nào. Log sẽ xuất hiện khi có hoạt động trong hệ thống."
                : "Không có log nào khớp với bộ lọc"}
            </p>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
            <table className="min-w-full text-sm">
              <thead className="border-b border-neutral-100 bg-neutral-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500">
                    Thời gian
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500">
                    Hành động
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500">
                    Người thực hiện
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500">
                    Đối tượng
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500">
                    Chi tiết
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-2.5 text-xs text-neutral-500 whitespace-nowrap">
                      {log.created_at?.toDate
                        ? log.created_at.toDate().toLocaleString("vi-VN")
                        : "—"}
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[11px] font-medium",
                          actionColor(log.action)
                        )}
                      >
                        {ACTION_LABELS[log.action] || log.action}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-neutral-600">
                      <div>{log.actor_email}</div>
                      <div className="text-[10px] text-neutral-400">{log.actor_role}</div>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-neutral-600">
                      <div>{log.target_type}</div>
                      <div className="font-mono text-[10px] text-neutral-400 truncate max-w-[120px]">
                        {log.target_id}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-neutral-500 max-w-[300px]">
                      <details className="cursor-pointer">
                        <summary className="truncate">
                          {JSON.stringify(log.details).slice(0, 80)}
                          {JSON.stringify(log.details).length > 80 ? "..." : ""}
                        </summary>
                        <pre className="mt-1 overflow-auto rounded bg-neutral-100 p-2 text-[10px] text-neutral-700">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </details>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
