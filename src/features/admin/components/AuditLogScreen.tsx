import { useState, useEffect } from "react"
import { FileText, Loader2, RefreshCw } from "lucide-react"
import { getAuditLogs, type AuditAction } from "../../../lib/audit-log"

interface AuditRow {
  id: string
  action: AuditAction
  actor_id: string
  actor_email: string
  actor_role: string
  target_type: string
  target_id: string
  details: Record<string, unknown>
  created_at: { toDate?: () => Date }
}

const ACTION_LABELS: Record<string, string> = {
  vendor_register: "Đăng ký seller",
  vendor_approve: "Phê duyệt seller",
  vendor_reject: "Từ chối seller",
  vendor_suspend: "Tạm khoá seller",
  product_create: "Tạo sản phẩm",
  product_update: "Sửa sản phẩm",
  product_delete: "Xoá sản phẩm",
  order_status_change: "Đổi trạng thái đơn",
  document_upload: "Upload tài liệu",
  login: "Đăng nhập",
  logout: "Đăng xuất",
  role_change: "Đổi quyền",
  report_submit: "Gửi báo cáo",
  report_resolve: "Xử lý báo cáo",
  settings_change: "Thay đổi cài đặt",
}

export function AuditLogScreen() {
  const [logs, setLogs] = useState<AuditRow[]>([])
  const [loading, setLoading] = useState(true)
  const [limit, setLimit] = useState(50)

  async function fetchLogs() {
    setLoading(true)
    try {
      const data = await getAuditLogs({ limit })
      setLogs(data as AuditRow[])
    } catch {
      // Firestore may not have the collection yet
      setLogs([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [limit])

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Nhật ký Hệ thống</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Audit log — lưu giữ tối thiểu 24 tháng (NĐ 85/2021)
          </p>
        </div>
        <button
          onClick={fetchLogs}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-2 text-xs text-neutral-600 hover:bg-neutral-50"
        >
          <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
          Làm mới
        </button>
      </div>

      <div className="mt-6">
        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="animate-spin text-brand-red-500" size={28} />
          </div>
        )}

        {!loading && logs.length === 0 && (
          <div className="rounded-xl border border-neutral-200 bg-white py-16 text-center">
            <FileText className="mx-auto text-neutral-300" size={32} />
            <p className="mt-3 text-sm text-neutral-500">
              Chưa có log nào. Log sẽ xuất hiện khi có hoạt động trong hệ thống.
            </p>
          </div>
        )}

        {!loading && logs.length > 0 && (
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
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-2.5 text-xs text-neutral-500 whitespace-nowrap">
                      {log.created_at?.toDate
                        ? log.created_at.toDate().toLocaleString("vi-VN")
                        : "—"}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-700">
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
                    <td className="px-4 py-2.5 text-xs text-neutral-500 max-w-[200px] truncate">
                      {JSON.stringify(log.details)}
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
