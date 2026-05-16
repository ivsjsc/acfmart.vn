import { useEffect, useMemo, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import {
  Search,
  Printer,
  Package,
  ChevronRight,
  AlertCircle,
  Download,
  Loader2,
} from "lucide-react"
import { formatCurrency, formatRelativeTime } from "../../../lib/format"
import { cn } from "../../../lib/cn"
import type { SellerOrderStatus } from "../types"
import { useMyVendor } from "../../../hooks/use-vendor"
import {
  orderDocToSellerOrder,
  subscribeSellerOrders,
} from "../../../lib/order-service"
import type { SellerOrder } from "../types"

const TABS = [
  { id: "all", label: "Tất cả" },
  { id: "payment_pending", label: "Chờ thanh toán" },
  { id: "awaiting_confirm", label: "Cần xác nhận" },
  { id: "confirmed", label: "Cần đóng gói" },
  { id: "packed", label: "Chờ lấy hàng" },
  { id: "shipping", label: "Đang giao" },
  { id: "delivered", label: "Đã giao" },
  { id: "return_requested", label: "Trả hàng" },
  { id: "cancelled", label: "Huỷ" },
] as const

type TabId = (typeof TABS)[number]["id"]

const STATUS_BADGE: Record<SellerOrderStatus, { label: string; color: string }> = {
  payment_pending: { label: "Chờ thanh toán", color: "bg-slate-100 text-slate-700" },
  awaiting_confirm: { label: "Cần xác nhận", color: "bg-amber-100 text-amber-700" },
  confirmed: { label: "Đã xác nhận", color: "bg-blue-100 text-blue-700" },
  packed: { label: "Đã đóng gói", color: "bg-violet-100 text-violet-700" },
  ready_pickup: { label: "Chờ lấy hàng", color: "bg-cyan-100 text-cyan-700" },
  shipping: { label: "Đang giao", color: "bg-cyan-100 text-cyan-700" },
  delivered: { label: "Đã giao", color: "bg-emerald-100 text-emerald-700" },
  completed: { label: "Hoàn thành", color: "bg-emerald-100 text-emerald-700" },
  cancelled: { label: "Đã huỷ", color: "bg-neutral-100 text-neutral-700" },
  return_requested: { label: "Yêu cầu trả", color: "bg-rose-100 text-rose-700" },
  returned: { label: "Đã trả", color: "bg-rose-100 text-rose-700" },
  refunded: { label: "Đã hoàn tiền", color: "bg-rose-100 text-rose-700" },
}

export default function SellerOrdersScreen() {
  const vendor = useMyVendor()
  const [params, setParams] = useSearchParams()
  const initialStatus = (params.get("status") as TabId) ?? "all"
  const [tab, setTab] = useState<TabId>(initialStatus)
  const [search, setSearch] = useState("")
  const [orders, setOrders] = useState<SellerOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const shopId = vendor.data?.vendor?.firebase_uid

  useEffect(() => {
    if (!shopId) return
    setLoading(true)
    setError(null)
    const unsubscribe = subscribeSellerOrders(
      { shopId },
      (data) => {
        setOrders(data.map(orderDocToSellerOrder))
        setLoading(false)
      },
      (err) => {
        setError(err.message)
        setLoading(false)
      }
    )
    return () => unsubscribe()
  }, [shopId])

  const filtered = useMemo(() => {
    let list = orders
    if (tab !== "all") list = list.filter((o) => o.status === tab)
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(
        (o) =>
          o.code.toLowerCase().includes(q) ||
          o.buyerName.toLowerCase().includes(q) ||
          o.items.some((i) => i.title.toLowerCase().includes(q))
      )
    }
    return list
  }, [orders, tab, search])

  function switchTab(id: TabId) {
    setTab(id)
    if (id === "all") setParams({})
    else setParams({ status: id })
  }

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 lg:text-3xl">
            Đơn hàng
          </h1>
          <p className="mt-1 text-sm text-neutral-600">
            Quản lý đơn của khách hàng
          </p>
        </div>
        <button className="btn-secondary">
          <Download size={14} />
          Xuất Excel
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-4 flex overflow-x-auto border-b border-neutral-200">
        {TABS.map((t) => {
          const count = t.id === "all"
            ? orders.length
            : orders.filter((o) => o.status === t.id).length
          return (
            <button
              key={t.id}
              onClick={() => switchTab(t.id)}
              className={cn(
                "whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
                tab === t.id
                  ? "border-brand-red-500 text-brand-red-600"
                  : "border-transparent text-neutral-600 hover:text-neutral-900"
              )}
            >
              {t.label}
              {count > 0 && (
                <span className={cn(
                  "ml-1 text-xs",
                  tab === t.id ? "text-brand-red-600" : "text-neutral-400"
                )}>
                  ({count})
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Search */}
      <div className="mb-4 relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
        />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo mã đơn, tên khách, sản phẩm..."
          className="input pl-9"
        />
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="animate-spin text-brand-red-500" size={28} />
        </div>
      )}

      {error && !loading && (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">Không thể tải đơn hàng</p>
            <p className="mt-0.5 text-xs">{error}</p>
          </div>
        </div>
      )}

      {/* Orders list */}
      {!loading && !error && filtered.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <Package size={40} className="text-neutral-300" />
          <h2 className="mt-3 text-lg font-semibold">Không có đơn hàng</h2>
          <p className="mt-1 text-sm text-neutral-500">
            {search ? "Thử từ khoá khác" : "Đơn mới sẽ xuất hiện ở đây"}
          </p>
        </div>
      ) : !loading && !error ? (
        <div className="space-y-3">
          {filtered.map((o) => {
            const status = STATUS_BADGE[o.status]
            return (
              <div key={o.id} className="card overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-100 bg-neutral-50 px-4 py-2.5 text-xs">
                  <div className="flex items-center gap-3">
                    <Link
                      to={`/seller/orders/${o.code}`}
                      className="font-mono font-bold text-neutral-900 hover:text-brand-red-600"
                    >
                      {o.code}
                    </Link>
                    <span className="text-neutral-400">·</span>
                    <span className="text-neutral-500">
                      {o.buyerName} ({o.buyerPhone})
                    </span>
                    <span className="text-neutral-400">·</span>
                    <span className="text-neutral-500">
                      {formatRelativeTime(o.createdAt)}
                    </span>
                  </div>
                  <span className={cn("rounded-md px-2 py-0.5 font-semibold", status.color)}>
                    {status.label}
                  </span>
                </div>

                <div className="grid gap-4 p-4 md:grid-cols-[1fr_240px]">
                  <div className="divide-y divide-neutral-100">
                    {o.items.map((item) => (
                      <div key={item.variantId} className="flex gap-3 py-2 first:pt-0 last:pb-0">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="h-14 w-14 shrink-0 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="line-clamp-1 text-sm font-medium text-neutral-900">
                            {item.title}
                          </div>
                          <div className="text-[11px] text-neutral-500">
                            SKU: <code className="font-mono">{item.sku}</code> · SL:{" "}
                            <strong className="text-neutral-700">{item.quantity}</strong>
                          </div>
                        </div>
                        <div className="text-sm font-semibold text-brand-red-600">
                          {formatCurrency(item.price * item.quantity)}
                        </div>
                      </div>
                    ))}
                    {o.customerNote && (
                      <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-2 text-xs text-amber-800">
                        <AlertCircle size={12} className="mt-0.5 shrink-0" />
                        <span>Ghi chú khách: {o.customerNote}</span>
                      </div>
                    )}
                  </div>

                  <div className="rounded-lg bg-neutral-50 p-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-500">Phương thức</span>
                      <span className="font-medium">{o.paymentMethod}</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-neutral-500">Vận chuyển</span>
                      <span className="font-medium">{o.shippingMethod}</span>
                    </div>
                    <div className="my-2 border-t border-neutral-200" />
                    <div className="flex items-baseline justify-between">
                      <span className="text-neutral-500">Tổng</span>
                      <span className="text-base font-extrabold text-brand-red-600">
                        {formatCurrency(o.total)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2 border-t border-neutral-100 bg-neutral-50 px-4 py-2.5">
                  <button className="btn-secondary text-xs">
                    <Printer size={12} />
                    In phiếu
                  </button>
                  <Link to={`/seller/orders/${o.code}`} className="btn-primary text-xs">
                    {o.status === "payment_pending" && "Chi tiết"}
                    {o.status === "awaiting_confirm" && "Xử lý ngay"}
                    {o.status === "confirmed" && "Đóng gói"}
                    {o.status === "packed" && "Bàn giao"}
                    {!["awaiting_confirm", "confirmed", "packed"].includes(o.status) && "Chi tiết"}
                    <ChevronRight size={12} />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
