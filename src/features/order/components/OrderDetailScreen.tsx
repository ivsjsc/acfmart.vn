import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import {
  MapPin,
  Package,
  CheckCircle2,
  Copy,
  ShieldCheck,
  MessageSquare,
  RefreshCw,
  Star,
  XCircle,
  Loader2,
  AlertCircle,
} from "lucide-react"
import toast from "react-hot-toast"
import { formatCurrency, formatDateTime } from "../../../lib/format"
import { cn } from "../../../lib/cn"
import { NotFound } from "../../../pages/NotFound"
import { CancelOrderModal } from "./CancelOrderModal"
import { useAuthStore } from "../../../stores/auth-store"
import {
  getBuyerOrderByCode,
  orderDocToBuyerOrder,
  type OrderDoc,
} from "../../../lib/order-service"

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: "Chờ xác nhận", color: "bg-amber-100 text-amber-800" },
  confirmed: { label: "Đã xác nhận", color: "bg-blue-100 text-blue-800" },
  packed: { label: "Đã đóng gói", color: "bg-violet-100 text-violet-800" },
  shipping: { label: "Đang giao", color: "bg-cyan-100 text-cyan-800" },
  delivered: { label: "Đã giao", color: "bg-emerald-100 text-emerald-800" },
  cancelled: { label: "Đã huỷ", color: "bg-neutral-100 text-neutral-700" },
  returned: { label: "Đã trả hàng", color: "bg-rose-100 text-rose-800" },
}

export default function OrderDetailScreen() {
  const { id } = useParams<{ id: string }>()
  const currentUser = useAuthStore((s) => s.user)
  const [orderDoc, setOrderDoc] = useState<OrderDoc | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCancel, setShowCancel] = useState(false)

  useEffect(() => {
    if (!id || !currentUser?.id) return
    let cancelled = false
    setLoading(true)
    setError(null)
    getBuyerOrderByCode(id, currentUser.id)
      .then((data) => {
        if (!cancelled) setOrderDoc(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Không tải được đơn hàng")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [currentUser?.id, id])

  if (loading) {
    return (
      <div className="container-acf flex min-h-[50vh] items-center justify-center">
        <Loader2 className="animate-spin text-brand-red-500" size={28} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container-acf py-6">
        <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      </div>
    )
  }

  const order = orderDoc ? orderDocToBuyerOrder(orderDoc) : null

  if (!order) return <NotFound />

  const status = STATUS_LABELS[order.status]
  const subtotal = order.items.reduce((s, i) => s + i.price * i.quantity, 0)

  const canCancel = order.status === "pending" || order.status === "confirmed"
  const canReturn = order.status === "delivered" || order.status === "shipping"
  const canReview = order.status === "delivered"

  async function handleCancel(reason: string) {
    // TODO: gọi API Medusa cancelOrderWorkflow khi có backend
    await new Promise((r) => setTimeout(r, 700))
    console.info("Cancelled order", order!.code, "reason:", reason)
  }

  function copyCode() {
    navigator.clipboard.writeText(order.code)
    toast.success("Đã sao chép mã đơn hàng")
  }

  function copyTracking() {
    if (!order.trackingNumber) return
    navigator.clipboard.writeText(order.trackingNumber)
    toast.success("Đã sao chép mã vận đơn")
  }

  return (
    <div className="container-acf py-4 lg:py-6">
      {/* Breadcrumb */}
      <nav className="mb-3 flex items-center gap-1 text-xs text-neutral-500">
        <Link to="/account/orders" className="hover:text-brand-red-600">
          Đơn hàng
        </Link>
        <span>/</span>
        <span className="text-neutral-700">{order.code}</span>
      </nav>

      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          {/* Status header */}
          <div className="card overflow-hidden">
            <div className="bg-gradient-to-r from-brand-red-500 to-brand-red-600 p-5 text-white">
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={cn(
                    "rounded-md px-2.5 py-0.5 text-xs font-bold",
                    status.color
                  )}
                >
                  {status.label}
                </span>
                <span className="text-sm text-white/90">
                  Đặt lúc {formatDateTime(order.createdAt)}
                </span>
              </div>
              <div className="mt-3 flex items-center gap-2 text-2xl font-bold">
                {order.code}
                <button
                  onClick={copyCode}
                  className="rounded-md p-1 hover:bg-white/10"
                  aria-label="Sao chép"
                >
                  <Copy size={16} />
                </button>
              </div>
              {order.trackingNumber && (
                <div className="mt-2 flex items-center gap-2 text-sm text-white/90">
                  Mã vận đơn:{" "}
                  <strong className="font-mono">{order.trackingNumber}</strong>
                  <button
                    onClick={copyTracking}
                    className="rounded-md p-1 hover:bg-white/10"
                  >
                    <Copy size={12} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="card p-5">
            <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-neutral-900">
              <Package size={18} className="text-brand-red-500" />
              Trạng thái đơn hàng
            </h2>
            <div className="relative space-y-5">
              <div className="absolute left-[11px] top-1 h-[calc(100%-2rem)] w-0.5 bg-neutral-200" />
              {order.timeline.map((step, i) => {
                const isLast = i === order.timeline.length - 1
                return (
                  <div key={i} className="relative flex gap-3">
                    <div
                      className={cn(
                        "relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                        isLast
                          ? "bg-brand-red-500 text-white ring-4 ring-brand-red-100"
                          : "bg-emerald-500 text-white"
                      )}
                    >
                      <CheckCircle2 size={14} />
                    </div>
                    <div className="flex-1">
                      <div
                        className={cn(
                          "text-sm font-semibold",
                          isLast ? "text-brand-red-700" : "text-neutral-900"
                        )}
                      >
                        {step.status}
                      </div>
                      <div className="text-xs text-neutral-500">
                        {formatDateTime(step.timestamp)}
                      </div>
                      {step.note && (
                        <div className="mt-0.5 text-xs text-neutral-600">
                          {step.note}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Shipping address */}
          <div className="card p-5">
            <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-neutral-900">
              <MapPin size={18} className="text-brand-red-500" />
              Địa chỉ nhận hàng
            </h2>
            <div className="text-sm leading-relaxed">
              <div className="font-semibold text-neutral-900">
                {order.shippingAddress.name}
              </div>
              <div className="text-neutral-600">{order.shippingAddress.phone}</div>
              <div className="mt-1 text-neutral-700">
                {order.shippingAddress.address}, {order.shippingAddress.ward},{" "}
                {order.shippingAddress.district}, {order.shippingAddress.city}
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="card p-5">
            <h2 className="mb-3 text-base font-bold text-neutral-900">
              Sản phẩm ({order.items.length})
            </h2>
            <div className="divide-y divide-neutral-100">
              {order.items.map((item) => (
                <div key={item.variantId} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-20 w-20 shrink-0 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/products/${item.productId}`}
                      className="line-clamp-2 text-sm font-medium text-neutral-900 hover:text-brand-red-600"
                    >
                      {item.title}
                    </Link>
                    <div className="mt-0.5 text-xs text-neutral-500">
                      {item.shopName}
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-xs text-neutral-600">
                        x{item.quantity}
                      </span>
                      <span className="text-sm font-semibold text-brand-red-600">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          {/* Summary */}
          <div className="card p-5">
            <h2 className="mb-3 text-base font-bold text-neutral-900">
              Thanh toán
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-600">Tạm tính</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Vận chuyển</span>
                <span>{formatCurrency(order.shippingFee)}</span>
              </div>
              <div className="my-2 border-t border-neutral-200" />
              <div className="flex items-baseline justify-between">
                <span className="font-semibold">Tổng</span>
                <span className="text-xl font-extrabold text-brand-red-600">
                  {formatCurrency(order.total)}
                </span>
              </div>
              <div className="text-xs text-neutral-500">
                Đã thanh toán qua{" "}
                <strong className="text-neutral-700">
                  {order.paymentMethod}
                </strong>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="card p-5">
            <h2 className="mb-3 text-base font-bold text-neutral-900">
              Hành động
            </h2>
            <div className="space-y-2">
              <Link
                to="/qr-verify"
                className="btn-primary w-full justify-center"
              >
                <ShieldCheck size={16} />
                Quét QR xác thực
              </Link>
              {canReview && (
                <Link
                  to={`/account/orders/${order.code}/review`}
                  className="btn-secondary w-full justify-center"
                >
                  <Star size={16} />
                  Đánh giá sản phẩm
                </Link>
              )}
              <button className="btn-secondary w-full justify-center">
                <MessageSquare size={16} />
                Chat với shop
              </button>
              {canReturn && (
                <Link
                  to={`/account/orders/${order.code}/return`}
                  className="btn-secondary w-full justify-center text-brand-red-600"
                >
                  <RefreshCw size={16} />
                  Yêu cầu trả hàng / hoàn tiền
                </Link>
              )}
              {canCancel && (
                <button
                  onClick={() => setShowCancel(true)}
                  className="btn-secondary w-full justify-center text-rose-600 hover:bg-rose-50"
                >
                  <XCircle size={16} />
                  Huỷ đơn
                </button>
              )}
            </div>
          </div>

          {/* Aivy hint */}
          <div className="rounded-lg bg-brand-gold-50 p-4 text-xs text-brand-gold-800">
            💡 Cần hỗ trợ? Hỏi{" "}
            <Link to="/aivy" className="font-bold underline">
              Aivy
            </Link>{" "}
            về tình trạng đơn hàng, đổi trả hoặc thanh toán.
          </div>
        </aside>
      </div>

      {showCancel && (
        <CancelOrderModal
          orderCode={order.code}
          onClose={() => setShowCancel(false)}
          onConfirm={handleCancel}
        />
      )}
    </div>
  )
}
