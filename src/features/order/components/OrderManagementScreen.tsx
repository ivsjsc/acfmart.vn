import { useState } from "react"
import { Link } from "react-router-dom"
import { Package, Navigation, ChevronRight, Search } from "lucide-react"
import { MOCK_ORDERS } from "../../../lib/mock-data"
import { formatCurrency, formatDateTime } from "../../../lib/format"
import { cn } from "../../../lib/cn"

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: "Chờ xác nhận", color: "bg-amber-100 text-amber-800" },
  confirmed: { label: "Đã xác nhận", color: "bg-blue-100 text-blue-800" },
  packed: { label: "Đã đóng gói", color: "bg-violet-100 text-violet-800" },
  shipping: { label: "Đang giao", color: "bg-cyan-100 text-cyan-800" },
  delivered: { label: "Đã giao", color: "bg-emerald-100 text-emerald-800" },
  cancelled: { label: "Đã huỷ", color: "bg-neutral-100 text-neutral-700" },
  returned: { label: "Đã trả hàng", color: "bg-rose-100 text-rose-800" },
}

const TABS = [
  { id: "all", label: "Tất cả" },
  { id: "pending", label: "Chờ xác nhận" },
  { id: "shipping", label: "Đang giao" },
  { id: "delivered", label: "Đã giao" },
  { id: "cancelled", label: "Huỷ/Trả" },
] as const

type TabId = (typeof TABS)[number]["id"]

export default function OrderManagementScreen() {
  const [tab, setTab] = useState<TabId>("all")
  const [search, setSearch] = useState("")

  const filtered = MOCK_ORDERS.filter((o) => {
    if (tab === "all") return true
    if (tab === "cancelled") return o.status === "cancelled" || o.status === "returned"
    return o.status === tab
  }).filter((o) =>
    search ? o.code.toLowerCase().includes(search.toLowerCase()) : true
  )

  return (
    <div className="container-acf py-4 lg:py-6">
      <h1 className="mb-4 text-2xl font-bold text-neutral-900">Đơn hàng của tôi</h1>

      {/* Search */}
      <div className="relative mb-4">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
        />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo mã đơn hàng..."
          className="input pl-10"
        />
      </div>

      {/* Tabs */}
      <div className="mb-4 flex overflow-x-auto border-b border-neutral-200">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
              tab === t.id
                ? "border-brand-red-500 text-brand-red-600"
                : "border-transparent text-neutral-600 hover:text-neutral-900"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Orders list */}
      {filtered.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <Package size={48} className="text-neutral-300" />
          <h2 className="mt-3 text-lg font-semibold text-neutral-900">
            Chưa có đơn hàng
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            Bạn chưa có đơn hàng nào trong mục này.
          </p>
          <Link to="/" className="btn-primary mt-4">
            Mua sắm ngay
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => {
            const status = STATUS_LABELS[order.status]
            return (
              <Link
                key={order.id}
                to={`/orders/${order.code}`}
                className="card block overflow-hidden transition-shadow hover:shadow-md"
              >
                <div className="flex items-center justify-between border-b border-neutral-100 bg-neutral-50 px-4 py-2.5">
                  <div className="flex items-center gap-3 text-sm">
                    <span className="font-mono font-semibold text-neutral-900">
                      {order.code}
                    </span>
                    <span className="text-neutral-400">·</span>
                    <span className="text-neutral-500">
                      {formatDateTime(order.createdAt)}
                    </span>
                  </div>
                  <span
                    className={cn(
                      "rounded-md px-2 py-0.5 text-xs font-semibold",
                      status.color
                    )}
                  >
                    {status.label}
                  </span>
                </div>

                <div className="divide-y divide-neutral-100 p-4">
                  {order.items.slice(0, 2).map((item) => (
                    <div key={item.variantId} className="flex gap-3 py-2 first:pt-0 last:pb-0">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="h-16 w-16 shrink-0 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="line-clamp-2 text-sm font-medium text-neutral-900">
                          {item.title}
                        </div>
                        <div className="mt-0.5 text-xs text-neutral-500">
                          {item.shopName} · SL: {item.quantity}
                        </div>
                      </div>
                      <div className="text-sm font-semibold text-brand-red-600">
                        {formatCurrency(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                  {order.items.length > 2 && (
                    <div className="pt-2 text-xs text-neutral-500">
                      và {order.items.length - 2} sản phẩm khác...
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between border-t border-neutral-100 bg-neutral-50 px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-neutral-600">
                      Tổng:{" "}
                      <strong className="text-lg text-brand-red-600">
                        {formatCurrency(order.total)}
                      </strong>
                    </span>
                    {order.trackingNumber && (
                      <Link 
                        to={`/track-order?tracking=${order.trackingNumber}`}
                        className="flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 hover:bg-blue-100"
                      >
                        <Navigation size={12} />
                        <span>#{order.trackingNumber.substring(0, 8)}...</span>
                      </Link>
                    )}
                  </div>
                  <span className="flex items-center gap-1 text-sm font-semibold text-brand-red-600">
                    Chi tiết <ChevronRight size={14} />
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}