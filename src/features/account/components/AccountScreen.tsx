import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import {
  Package,
  Truck,
  CheckCircle2,
  RefreshCw,
  Wallet,
  Ticket,
  ShieldCheck,
  Sparkles,
} from "lucide-react"
import { useAuthStore } from "../../../stores/auth-store"
import { formatCurrency } from "../../../lib/format"
import {
  orderDocToBuyerOrder,
  subscribeBuyerOrders,
  type OrderDoc,
} from "../../../lib/order-service"
import { QRVerificationService } from "../../qr-verify/qr-service"

export default function AccountScreen() {
  const user = useAuthStore((s) => s.user)
  const [orders, setOrders] = useState<OrderDoc[]>([])
  const [cabinetCount, setCabinetCount] = useState(0)

  useEffect(() => {
    if (!user?.id) {
      setOrders([])
      return
    }
    return subscribeBuyerOrders(
      { customerId: user.id },
      setOrders,
      () => setOrders([])
    )
  }, [user?.id])

  useEffect(() => {
    setCabinetCount(QRVerificationService.getCabinetItems().length)
  }, [])

  const orderCounts = useMemo(() => {
    const result = {
      pending: 0,
      packed: 0,
      shipping: 0,
      delivered: 0,
      returned: 0,
    }
    for (const order of orders.map(orderDocToBuyerOrder)) {
      if (order.status === "pending" || order.status === "confirmed") {
        result.pending += 1
      } else if (order.status === "packed") {
        result.packed += 1
      } else if (order.status === "shipping") {
        result.shipping += 1
      } else if (order.status === "delivered") {
        result.delivered += 1
      } else if (order.status === "cancelled" || order.status === "returned") {
        result.returned += 1
      }
    }
    return result
  }, [orders])

  const ORDER_STAGES = [
    { to: "/account/orders?status=pending", icon: Package, label: "Chờ xác nhận", count: orderCounts.pending },
    { to: "/account/orders?status=packed", icon: Package, label: "Chờ lấy hàng", count: orderCounts.packed },
    { to: "/account/orders?status=shipping", icon: Truck, label: "Đang giao", count: orderCounts.shipping },
    { to: "/account/orders?status=delivered", icon: CheckCircle2, label: "Đã giao", count: orderCounts.delivered },
    { to: "/account/orders?status=returned", icon: RefreshCw, label: "Huỷ/Trả", count: orderCounts.returned },
  ]

  return (
    <div className="space-y-5">
      {/* Welcome */}
      <div className="card overflow-hidden">
        <div className="bg-gradient-to-r from-brand-red-500 to-brand-red-700 p-6 text-white">
          <h1 className="text-2xl font-extrabold">
            Xin chào, {user?.name ?? "bạn"}!
          </h1>
          <p className="mt-1 text-sm text-white/90">
            Quản lý tài khoản, đơn hàng và ưu đãi của bạn tại đây.
          </p>
        </div>
      </div>

      {/* Order shortcuts */}
      <div className="card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-neutral-900">Đơn hàng</h2>
          <Link
            to="/account/orders"
            className="text-xs font-semibold text-brand-red-600 hover:underline"
          >
            Xem tất cả →
          </Link>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {ORDER_STAGES.map((s) => (
            <Link
              key={s.label}
              to={s.to}
              className="group relative flex flex-col items-center gap-1 rounded-lg p-2 text-center hover:bg-neutral-50"
            >
              <div className="relative">
                <s.icon size={24} className="text-neutral-600 group-hover:text-brand-red-600" />
                {s.count > 0 && (
                  <span className="absolute -right-2 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand-red-500 px-1 text-[9px] font-bold text-white">
                    {s.count}
                  </span>
                )}
              </div>
              <span className="text-[10px] leading-tight text-neutral-600 group-hover:text-brand-red-600">
                {s.label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <Link to="/account/wallet" className="card group p-4 hover:shadow-md">
          <div className="flex items-center gap-2 text-neutral-500">
            <Wallet size={16} />
            <span className="text-xs">Ví của tôi</span>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-brand-red-600">
            {formatCurrency(0)}
          </div>
          <div className="text-xs text-neutral-500 group-hover:text-brand-red-600">
            Chưa có giao dịch ví →
          </div>
        </Link>

        <Link to="/account/vouchers" className="card group p-4 hover:shadow-md">
          <div className="flex items-center gap-2 text-neutral-500">
            <Ticket size={16} />
            <span className="text-xs">Voucher khả dụng</span>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-brand-gold-600">
            0
          </div>
          <div className="text-xs text-neutral-500 group-hover:text-brand-red-600">
            Sử dụng ngay →
          </div>
        </Link>

        <Link to="/qr-verify/cabinet" className="card group p-4 hover:shadow-md">
          <div className="flex items-center gap-2 text-neutral-500">
            <ShieldCheck size={16} />
            <span className="text-xs">Đã xác thực</span>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-emerald-600">
            {cabinetCount} SP
          </div>
          <div className="text-xs text-neutral-500 group-hover:text-brand-red-600">
            Xem tủ xác thực →
          </div>
        </Link>
      </div>

      {/* Personal timeline + public profile shortcut */}
      <div className="card p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-neutral-900">
              Trang cá nhân của bạn
            </h3>
            <p className="mt-1 text-sm text-neutral-600">
              Quản lý đánh giá Công khai / Riêng tư, xem timeline đơn hàng
              và sản phẩm đã đánh giá.
            </p>
          </div>
          <Link to="/account/timeline" className="btn-secondary text-xs">
            Mở timeline
          </Link>
        </div>
      </div>

      {/* Aivy hint */}
      <div className="card overflow-hidden bg-gradient-to-r from-brand-gold-50 to-brand-red-50 p-5">
        <div className="flex items-start gap-3">
          <Sparkles className="text-brand-gold-500" />
          <div className="flex-1">
            <h3 className="font-bold text-neutral-900">Aivy có thể giúp gì?</h3>
            <p className="mt-1 text-sm text-neutral-700">
              Tra cứu đơn hàng, hỏi về chính sách đổi trả, hoặc đề xuất sản phẩm hợp với bạn.
            </p>
          </div>
          <Link to="/aivy" className="btn-primary text-xs">
            Hỏi Aivy
          </Link>
        </div>
      </div>
    </div>
  )
}
