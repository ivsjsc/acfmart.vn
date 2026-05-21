import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import {
  Search,
  Truck,
  Loader2,
  Package,
  CheckCircle2,
  Clock,
  XCircle,
  Copy,
  Navigation,
} from "lucide-react"
import toast from "react-hot-toast"
import { useAuthStore } from "../../../stores/auth-store"
import { sanitizeUserError } from "../../../lib/error-utils"
import {
  subscribeSellerOrders,
  type OrderDoc,
} from "../../../lib/order-service"
import { formatDateTime } from "../../../lib/format"

const STATUS_LABEL: Record<string, string> = {
  payment_pending: "Chờ thanh toán",
  awaiting_confirm: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  packed: "Đã đóng gói",
  ready_pickup: "Chờ lấy hàng",
  shipping: "Đang giao",
  delivered: "Đã giao",
  completed: "Hoàn thành",
  cancelled: "Đã huỷ",
  return_requested: "Yêu cầu trả",
  returned: "Đã trả",
  refunded: "Đã hoàn tiền",
}

const STATUS_TONE: Record<string, string> = {
  payment_pending: "bg-slate-50 text-slate-700",
  awaiting_confirm: "bg-amber-50 text-amber-700",
  confirmed: "bg-blue-50 text-blue-700",
  packed: "bg-violet-50 text-violet-700",
  ready_pickup: "bg-cyan-50 text-cyan-700",
  shipping: "bg-sky-50 text-sky-700",
  delivered: "bg-emerald-50 text-emerald-700",
  completed: "bg-emerald-50 text-emerald-700",
  cancelled: "bg-rose-50 text-rose-700",
  return_requested: "bg-orange-50 text-orange-700",
  returned: "bg-orange-50 text-orange-700",
  refunded: "bg-neutral-100 text-neutral-700",
}

function statusIcon(status: string) {
  switch (status) {
    case "delivered":
    case "completed":
      return <CheckCircle2 size={14} className="text-emerald-600" />
    case "shipping":
      return <Truck size={14} className="text-sky-600" />
    case "ready_pickup":
      return <Package size={14} className="text-violet-600" />
    case "packed":
    case "confirmed":
      return <Package size={14} className="text-blue-600" />
    case "awaiting_confirm":
    case "payment_pending":
      return <Clock size={14} className="text-amber-600" />
    case "cancelled":
    case "returned":
    case "return_requested":
      return <XCircle size={14} className="text-rose-600" />
    default:
      return <Clock size={14} className="text-neutral-500" />
  }
}

export default function SellerOrderTrackScreen() {
  const shopId = useAuthStore((s) => s.user?.id)
  const [orders, setOrders] = useState<OrderDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [trackingOnly, setTrackingOnly] = useState(true)

  useEffect(() => {
    if (!shopId) {
      setLoading(false)
      return
    }
    setLoading(true)
    const unsubscribe = subscribeSellerOrders(
      { shopId },
      (next) => {
        setOrders(next)
        setLoading(false)
      },
      (err) => {
        console.error("[SellerOrderTrack] subscribe error:", err)
        setError(sanitizeUserError(err, "Không tải được tiến trình giao hàng."))
        setLoading(false)
      }
    )
    return () => unsubscribe()
  }, [shopId])

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase()
    return orders.filter((order) => {
      if (statusFilter !== "all" && order.status !== statusFilter) return false
      if (trackingOnly && !order.trackingNumber) return false
      if (!q) return true
      return (
        order.code.toLowerCase().includes(q) ||
        (order.trackingNumber?.toLowerCase().includes(q) ?? false) ||
        order.customerName.toLowerCase().includes(q) ||
        (order.shippingProviderName?.toLowerCase().includes(q) ?? false) ||
        (order.shippingStatusText?.toLowerCase().includes(q) ?? false)
      )
    }).filter(Boolean)
  }, [orders, filter, statusFilter, trackingOnly])

  const totalsByStatus = useMemo(() => {
    const map: Record<string, number> = {}
    for (const o of orders) map[o.status] = (map[o.status] ?? 0) + 1
    return map
  }, [orders])

  function copy(text: string) {
    navigator.clipboard
      .writeText(text)
      .then(() => toast.success("Đã sao chép"))
      .catch(() => toast.error("Không thể sao chép"))
  }

  if (!shopId) {
    return (
      <div className="container-acf py-8 text-center text-neutral-600">
        Vui lòng đăng nhập tài khoản người bán để tra cứu đơn vận chuyển đi.
      </div>
    )
  }

  return (
    <div className="container-acf py-6 lg:py-8">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-red-600">
            Vận đơn
          </p>
          <h1 className="mt-1 text-2xl font-bold text-neutral-900 lg:text-3xl">
            Quản lý vận đơn
          </h1>
          <p className="mt-1 text-sm text-neutral-600">
            Theo dõi đơn đã có vận đơn, tra cứu theo mã đơn, mã vận đơn, trạng
            thái GHTK hoặc tên khách.
          </p>
        </div>
        <Link to="/seller/orders" className="btn-secondary self-start sm:self-auto">
          Quản lý đơn bán
        </Link>
      </div>

      <div className="card mb-4 p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
            />
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Mã đơn, mã vận đơn, tên khách..."
              className="input pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input sm:w-56"
            >
              <option value="all">Tất cả trạng thái</option>
              {Object.entries(STATUS_LABEL).map(([key, label]) => (
                <option key={key} value={key}>
                  {label} ({totalsByStatus[key] ?? 0})
                </option>
              ))}
            </select>
            <label className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-600">
              <input
                type="checkbox"
                checked={trackingOnly}
                onChange={(e) => setTrackingOnly(e.target.checked)}
                className="h-4 w-4 text-brand-red-500 focus:ring-brand-red-500"
              />
              Có vận đơn
            </label>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-neutral-500">
          <Loader2 className="mr-2 animate-spin" size={18} /> Đang tải danh
          sách đơn...
        </div>
      ) : error ? (
        <div className="card p-6 text-sm text-rose-600">
          Không tải được danh sách đơn: {error}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card flex flex-col items-center justify-center p-10 text-center">
          <Truck size={42} className="text-neutral-300" />
          <h3 className="mt-3 text-base font-semibold text-neutral-900">
            Chưa có đơn phù hợp
          </h3>
          <p className="mt-1 text-sm text-neutral-600">
            Sau khi GHTK tạo mã, vận đơn sẽ hiện ở đây để bạn theo dõi.
          </p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-left text-xs uppercase tracking-wide text-neutral-500">
              <tr>
                <th className="px-4 py-3">Mã đơn</th>
                <th className="px-4 py-3">Khách</th>
                <th className="px-4 py-3">Trạng thái đơn</th>
                <th className="px-4 py-3">Mã vận đơn</th>
                <th className="px-4 py-3">ĐVVC</th>
                <th className="px-4 py-3">Trạng thái GHTK</th>
                <th className="px-4 py-3">Cập nhật</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filtered.map((order) => (
                <tr key={order.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3 font-mono text-xs">
                    <Link
                      to={`/seller/orders/${order.id}`}
                      className="text-brand-red-700 hover:underline"
                    >
                      {order.code}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-neutral-800">
                      {order.customerName}
                    </div>
                    <div className="text-xs text-neutral-500">
                      {order.customerPhone}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                        STATUS_TONE[order.status] ??
                        "bg-neutral-100 text-neutral-700"
                      }`}
                    >
                      {statusIcon(order.status)}
                      {STATUS_LABEL[order.status] ?? order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {order.trackingNumber ? (
                      <div className="space-y-1">
                        <button
                          type="button"
                          onClick={() => copy(order.trackingNumber!)}
                          className="inline-flex items-center gap-1 rounded-md px-2 py-1 font-mono text-xs hover:bg-neutral-100"
                          title="Sao chép mã vận đơn"
                        >
                          {order.trackingNumber}
                          <Copy size={12} />
                        </button>
                        {order.shippingLabelUrl && (
                          <a
                            href={order.shippingLabelUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="block text-[11px] text-brand-red-700 hover:underline"
                          >
                            Mở nhãn đơn
                          </a>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-neutral-400">
                        Chưa có
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-neutral-700">
                    <div className="font-medium">
                      {order.shippingProviderName ?? order.shippingProviderId ?? "—"}
                    </div>
                    <div className="text-neutral-500">
                      {order.shippingServiceCode ?? order.shippingMethod}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {order.shippingStatusText ? (
                      <span className="inline-flex rounded-full bg-sky-50 px-2 py-0.5 font-semibold text-sky-700">
                        {order.shippingStatusText}
                      </span>
                    ) : (
                      <span className="text-neutral-400">Chưa đồng bộ</span>
                    )}
                    {order.shippingReason && (
                      <div className="mt-1 max-w-[240px] text-[11px] text-neutral-500">
                        {order.shippingReason}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-neutral-500">
                    {order.updated_at
                      ? formatDateTime(order.updated_at.toDate().toISOString())
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex flex-wrap justify-end gap-2">
                      {order.trackingNumber && (
                        <Link
                          to={`/account/track?tracking=${encodeURIComponent(order.trackingNumber)}${order.shippingProviderId ? `&provider=${encodeURIComponent(order.shippingProviderId)}` : ""}`}
                          className="inline-flex items-center gap-1 rounded-md border border-neutral-200 px-2 py-1 text-xs font-semibold text-neutral-700 hover:border-brand-red-300 hover:text-brand-red-700"
                        >
                          <Navigation size={12} />
                          Theo dõi
                        </Link>
                      )}
                      <Link
                        to={`/seller/orders/${order.id}`}
                        className="text-xs font-semibold text-brand-red-700 hover:underline"
                      >
                        Chi tiết
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
