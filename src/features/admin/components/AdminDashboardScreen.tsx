import { Users, Clock, CheckCircle2, XCircle, AlertTriangle } from "lucide-react"
import { useModerationVendors } from "../../../hooks/use-moderation"
import { cn } from "../../../lib/cn"

export function AdminDashboardScreen() {
  const pending = useModerationVendors({ status: "pending" })
  const active = useModerationVendors({ status: "active" })
  const rejected = useModerationVendors({ status: "rejected" })
  const suspended = useModerationVendors({ status: "suspended" })

  const stats = [
    {
      label: "Chờ duyệt",
      value: pending.data?.count ?? 0,
      icon: Clock,
      color: "text-amber-600 bg-amber-50",
      urgent: true,
    },
    {
      label: "Đang hoạt động",
      value: active.data?.count ?? 0,
      icon: CheckCircle2,
      color: "text-emerald-600 bg-emerald-50",
    },
    {
      label: "Đã từ chối",
      value: rejected.data?.count ?? 0,
      icon: XCircle,
      color: "text-rose-600 bg-rose-50",
    },
    {
      label: "Tạm khoá",
      value: suspended.data?.count ?? 0,
      icon: AlertTriangle,
      color: "text-orange-600 bg-orange-50",
    },
  ]

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-neutral-900">Tổng quan Quản trị</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Quản lý seller, đơn hàng và tuân thủ nền tảng ACFMart
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={cn(
              "rounded-xl border bg-white p-5",
              stat.urgent && stat.value > 0
                ? "border-amber-200 ring-2 ring-amber-100"
                : "border-neutral-200"
            )}
          >
            <div className="flex items-center gap-3">
              <div className={cn("rounded-lg p-2", stat.color)}>
                <stat.icon size={20} />
              </div>
              <div>
                <div className="text-2xl font-bold text-neutral-900">{stat.value}</div>
                <div className="text-xs text-neutral-500">{stat.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {pending.data && pending.data.count > 0 && (
        <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex items-center gap-2">
            <Clock className="text-amber-600" size={20} />
            <h2 className="font-semibold text-amber-900">
              {pending.data.count} hồ sơ đang chờ duyệt
            </h2>
          </div>
          <p className="mt-1 text-sm text-amber-700">
            Vui lòng truy cập <strong>Duyệt Seller</strong> để xem xét và phê duyệt hồ sơ đăng ký.
            Thời gian duyệt cam kết: 24-48 giờ.
          </p>
        </div>
      )}
    </div>
  )
}
