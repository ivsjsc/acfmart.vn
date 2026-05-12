import { Link, useLocation, useParams } from "react-router-dom"
import {
  CheckCircle2,
  Package,
  Home,
  FileText,
  ShieldCheck,
  Truck,
  Navigation,
} from "lucide-react"
import { formatCurrency } from "../../../lib/format"

interface LocationState {
  orderCode?: string
  total?: number
  paymentMethod?: string
  shippingMethod?: string
  trackingNumber?: string
}

export default function OrderSuccessScreen() {
  const { id } = useParams<{ id: string }>()
  const { state } = useLocation() as { state: LocationState | null }
  const code = id ?? state?.orderCode ?? "ACFXXXXXXXXXX"

  // Determine payment method display text
  const getPaymentMethodDisplay = (method?: string) => {
    switch(method) {
      case 'vnpay': return 'VNPay';
      case 'momo': return 'MoMo';
      case 'zalopay': return 'ZaloPay';
      case 'cod': return 'Thanh toán khi nhận hàng';
      case 'wallet': return 'Ví ACFMart';
      default: return method || 'Không xác định';
    }
  }

  return (
    <div className="container-acf py-8 lg:py-12">
      <div className="mx-auto max-w-2xl">
        {/* Success header */}
        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 size={48} className="text-emerald-600" />
          </div>
          <h1 className="mt-4 text-3xl font-extrabold text-neutral-900">
            Đặt hàng thành công!
          </h1>
          <p className="mt-2 text-base text-neutral-600">
            Cảm ơn bạn đã tin tưởng ACFMart. Đơn hàng của bạn đang được xử lý.
          </p>
        </div>

        {/* Order info */}
        <div className="card mt-6 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <div className="text-xs text-neutral-500">Mã đơn hàng</div>
              <div className="mt-1 text-lg font-bold text-brand-red-600">
                {code}
              </div>
            </div>
            {state?.total && (
              <div>
                <div className="text-xs text-neutral-500">Tổng thanh toán</div>
                <div className="mt-1 text-lg font-bold text-neutral-900">
                  {formatCurrency(state.total)}
                </div>
              </div>
            )}
            {state?.paymentMethod && (
              <div>
                <div className="text-xs text-neutral-500">Phương thức</div>
                <div className="mt-1 text-sm font-medium uppercase text-neutral-900">
                  {getPaymentMethodDisplay(state.paymentMethod)}
                </div>
              </div>
            )}
            {state?.shippingMethod && (
              <div>
                <div className="text-xs text-neutral-500">Vận chuyển</div>
                <div className="mt-1 text-sm font-medium text-neutral-900">
                  {state.shippingMethod}
                </div>
              </div>
            )}
            {state?.trackingNumber && (
              <div>
                <div className="text-xs text-neutral-500">Mã vận đơn</div>
                <div className="mt-1 text-sm font-mono font-bold text-neutral-900">
                  {state.trackingNumber}
                </div>
              </div>
            )}
            <div>
              <div className="text-xs text-neutral-500">Ngày đặt</div>
              <div className="mt-1 text-sm font-medium text-neutral-900">
                {new Date().toLocaleString("vi-VN")}
              </div>
            </div>
          </div>

          <div className="my-4 border-t border-neutral-200" />

          <div className="space-y-3">
            {[
              {
                icon: Package,
                title: "Đang xác nhận đơn",
                desc: "Shop sẽ xác nhận đơn hàng trong vòng 24h",
              },
              {
                icon: Truck,
                title: "Giao trong 2-4 ngày",
                desc: "Bạn sẽ nhận được thông báo khi đơn hàng được giao",
              },
              {
                icon: Navigation,
                title: "Theo dõi đơn hàng",
                desc: `Mã vận đơn: ${state?.trackingNumber || 'Đang cập nhật'}`,
              },
              {
                icon: ShieldCheck,
                title: "Quét QR khi nhận hàng",
                desc: "Mở app, quét mã QR trên bao bì để xác thực chính hãng",
              },
            ].map((step) => (
              <div key={step.title} className="flex items-start gap-3">
                <div className="rounded-lg bg-brand-red-50 p-2 text-brand-red-600">
                  <step.icon size={18} />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-neutral-900">
                    {step.title}
                  </div>
                  <div className="text-xs text-neutral-500">{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link to={`/orders/${code}`} className="btn-primary justify-center">
            <FileText size={16} />
            Xem chi tiết đơn hàng
          </Link>
          {state?.trackingNumber && (
            <Link 
              to={`/track-order?tracking=${state.trackingNumber}`} 
              className="btn-secondary justify-center"
            >
              <Navigation size={16} />
              Theo dõi đơn hàng
            </Link>
          )}
          <Link to="/" className="btn-secondary justify-center">
            <Home size={16} />
            Tiếp tục mua sắm
          </Link>
        </div>

        <div className="mt-6 rounded-lg bg-brand-gold-50 p-4 text-center text-xs text-brand-gold-800">
          💡 <strong>Mẹo:</strong> Hỏi <Link to="/aivy" className="font-bold underline">Aivy</Link> nếu bạn cần hỗ trợ về đơn hàng, vận chuyển hoặc đổi trả.
        </div>
      </div>
    </div>
  )
}