import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  MapPin,
  CreditCard,
  Truck,
  ShieldCheck,
  Loader2,
  Wallet,
  Banknote,
  Package,
} from "lucide-react"
import toast from "react-hot-toast"
import { useCartStore } from "../../../stores/cart-store"
import { useAuthStore } from "../../../stores/auth-store"
import { formatCurrency } from "../../../lib/format"
import { cn } from "../../../lib/cn"
import { PaymentService } from "../../../lib/payment-service"
import { ShippingService, type ShippingRate } from "../../../lib/shipping-service"
import { createMarketplaceOrders } from "../../../lib/order-service"
import { VoucherApply } from "./VoucherApply"
import type { VoucherDoc } from "../../../lib/voucher-service"

type PaymentMethod = "cod" | "vnpay" | "momo" | "zalopay" | "wallet"
type ShippingMethod = "standard" | "express" | "cod-ship"

const DEFAULT_SHIPPING_RATES: ShippingRate[] = [
  {
    serviceId: "standard",
    serviceName: "Giao hàng tiêu chuẩn",
    provider: "GHN",
    providerId: "ghn",
    serviceCode: "STANDARD",
    price: 30000,
    estimatedDays: 3,
    codFee: 5000
  },
  {
    serviceId: "express",
    serviceName: "Giao hàng nhanh",
    provider: "GHN",
    providerId: "ghn",
    serviceCode: "EXPRESS",
    price: 50000,
    estimatedDays: 1,
    codFee: 5000
  },
  {
    serviceId: "cod-ship",
    serviceName: "Thanh toán khi nhận hàng",
    provider: "GHTK",
    providerId: "ghtk",
    serviceCode: "STANDARD",
    price: 35000,
    estimatedDays: 2,
    codFee: 0
  }
]

const PAYMENT_OPTIONS = [
  { id: "vnpay" as const, label: "VNPay", icon: CreditCard, color: "text-blue-600" },
  { id: "momo" as const, label: "Momo", icon: Wallet, color: "text-pink-600" },
  { id: "zalopay" as const, label: "ZaloPay", icon: Wallet, color: "text-blue-500" },
  { id: "wallet" as const, label: "Ví mua sắm", icon: Wallet, color: "text-brand-gold-600" },
  { id: "cod" as const, label: "COD - Thanh toán khi nhận", icon: Banknote, color: "text-emerald-600" },
]

export default function CheckoutScreen() {
  const navigate = useNavigate()
  const items = useCartStore((s) => s.items)
  const subtotal = useCartStore((s) => s.subtotal())
  const clearCart = useCartStore((s) => s.clear)
  const currentUser = useAuthStore((s) => s.user)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  const [shipping, setShipping] = useState<ShippingMethod>("standard")
  const [payment, setPayment] = useState<PaymentMethod>("cod")
  const [loading, setLoading] = useState(false)
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>(DEFAULT_SHIPPING_RATES)
  const [selectedRate, setSelectedRate] = useState<ShippingRate>(DEFAULT_SHIPPING_RATES[0])

  // Voucher — 1 voucher per checkout. For multi-shop carts the voucher applies
  // to the dominant shop (first item's shopId). Multi-voucher support is a
  // post-MVP enhancement.
  const [appliedVoucher, setAppliedVoucher] = useState<VoucherDoc | null>(null)
  const [voucherDiscount, setVoucherDiscount] = useState(0)
  const [voucherShippingDiscount, setVoucherShippingDiscount] = useState(0)
  const voucherShopId = items[0]?.shopId ?? ""

  // Address form
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [ward, setWard] = useState("")
  const [district, setDistrict] = useState("")
  const [city, setCity] = useState("")
  const [note, setNote] = useState("")

  // Calculate total weight for shipping
  const totalWeight = items.reduce((weight, item) => {
    // Assuming average weight of 200g per item as default
    // In real app, this would come from product data
    return weight + (item.quantity * 200)
  }, 0)

  useEffect(() => {
    const rate = shippingRates.find(r => r.serviceId === shipping) || shippingRates[0]
    if (rate) {
      setSelectedRate(rate)
    }
  }, [shipping, shippingRates])

  useEffect(() => {
    if (!address || !ward || !district || !city || items.length === 0) {
      return
    }

    let cancelled = false
    ShippingService.calculateRates({
      from: {
        name: "Kho xác thực",
        phone: "19001234",
        address: "Kho xác thực",
        ward: "Phuong 12",
        district: "Tan Binh",
        city: "TP. Ho Chi Minh",
      },
      to: { name: name || "Khach hang", phone: phone || "0000000000", address, ward, district, city },
      weight: Math.max(totalWeight, 200),
      value: subtotal,
      serviceType: payment === "cod" ? "cod" : shipping === "express" ? "express" : "standard",
    })
      .then((rates) => {
        if (!cancelled && rates.length > 0) {
          setShippingRates(rates)
          setSelectedRate(rates[0])
        }
      })
      .catch(() => {
        // Keep configured fallback rates visible; order creation still goes through backend.
      })

    return () => {
      cancelled = true
    }
  }, [address, ward, district, city, items.length, totalWeight, subtotal, payment, shipping, name, phone])

  const shippingFee = selectedRate.price
  const codFee = payment === 'cod' ? (selectedRate.codFee || 0) : 0
  const effectiveShipping = Math.max(0, shippingFee - voucherShippingDiscount)
  const total = subtotal + effectiveShipping + codFee - voucherDiscount

  async function handlePlaceOrder() {
    if (!name || !phone || !address || !city) {
      toast.error("Vui lòng điền đầy đủ địa chỉ nhận hàng")
      return
    }
    if (items.length === 0) {
      toast.error("Giỏ hàng đang trống")
      return
    }
    if (!isAuthenticated || !currentUser) {
      toast.error("Vui lòng đăng nhập trước khi đặt hàng")
      navigate("/login", { state: { from: "/checkout" } })
      return
    }

    setLoading(true)
    try {
      const orderCode = `ACF${Date.now().toString().slice(-10)}`
      const shippingAddress = {
        name,
        phone,
        address,
        ward,
        district,
        city,
      }

      // Handle payment processing
      if (payment !== "cod") {
        localStorage.setItem(
          `pendingCheckout:${orderCode}`,
          JSON.stringify({
            items,
            subtotal,
            total,
            selectedRate,
            address: shippingAddress,
            createdAt: new Date().toISOString(),
          })
        )

        const paymentResult = await PaymentService.processPayment({
          amount: total,
          currency: "VND",
          payment_method: payment,
          return_url: `${window.location.origin}/checkout/success/${orderCode}`,
          cancel_url: `${window.location.origin}/cart`,
          metadata: {
            orderCode,
            orderInfo: `Thanh toan don hang ${orderCode}`,
            buyerEmail: currentUser.email,
            buyerPhone: phone,
          },
        });

        if (!paymentResult.success || paymentResult.error) {
          throw new Error(paymentResult.error || "Thanh toán thất bại");
        }

        if (paymentResult.redirect_url) {
          await createMarketplaceOrders({
            orderCode,
            customerId: currentUser.id,
            customerEmail: currentUser.email,
            customerName: name,
            customerPhone: phone,
            items,
            shippingAddress,
            paymentMethod: payment,
            paymentStatus: "pending",
            shippingMethod: selectedRate.serviceName,
            shippingFee: effectiveShipping,
            codFee: 0,
            discountTotal: voucherDiscount,
            customerNote: note,
          })

          // Redirect to payment gateway
          window.location.href = paymentResult.redirect_url;
          return;
        }
      }

      // Create shipping order
      const shippingResult = await ShippingService.createShippingOrder(
        selectedRate,
        {
          name: "Kho xác thực",
          phone: "19001234",
          address: "Kho xác thực",
          ward: "Phuong 12",
          district: "Tan Binh",
          city: "TP. Ho Chi Minh"
        },
        shippingAddress,
        items.map(item => ({
          name: item.title,
          weight: 200, // default weight
          value: item.price,
          quantity: item.quantity
        })),
        payment === 'cod',
        note
      );

      if (!shippingResult.success) {
        throw new Error(shippingResult.error || "Tạo đơn vận chuyển thất bại");
      }

      await createMarketplaceOrders({
        orderCode,
        customerId: currentUser.id,
        customerEmail: currentUser.email,
        customerName: name,
        customerPhone: phone,
        items,
        shippingAddress,
        paymentMethod: payment,
        paymentStatus: payment === "cod" ? "cod" : "paid",
        shippingMethod: selectedRate.serviceName,
        shippingFee: effectiveShipping,
        codFee,
        discountTotal: voucherDiscount,
        customerNote: note,
        trackingNumber: shippingResult.trackingNumber,
      })

      await new Promise((r) => setTimeout(r, 1200))
      clearCart()
      toast.success("Đặt hàng thành công!")
      navigate(`/checkout/success/${orderCode}`, {
        state: { 
          orderCode, 
          total, 
          paymentMethod: payment,
          shippingMethod: selectedRate.serviceName,
          trackingNumber: shippingResult.trackingNumber
        },
      })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Đặt hàng thất bại")
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="container-acf py-12 text-center">
        <h1 className="text-2xl font-bold">Giỏ hàng đang trống</h1>
        <button onClick={() => navigate("/")} className="btn-primary mt-4">
          Về trang chủ
        </button>
      </div>
    )
  }

  return (
    <div className="container-acf py-4 lg:py-6">
      <h1 className="mb-5 text-2xl font-bold text-neutral-900">Thanh toán</h1>

      <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
        <div className="space-y-5">
          {/* Shipping address */}
          <section className="card p-5">
            <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-neutral-900">
              <MapPin size={18} className="text-brand-red-500" />
              Địa chỉ nhận hàng
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Họ và tên *"
                className="input"
                required
              />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Số điện thoại *"
                className="input"
                pattern="[0-9]{10,11}"
                required
              />
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Địa chỉ (số nhà, tên đường) *"
                className="input sm:col-span-2"
                required
              />
              <input
                type="text"
                value={ward}
                onChange={(e) => setWard(e.target.value)}
                placeholder="Phường/Xã *"
                className="input"
                required
              />
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="Quận/Huyện *"
                className="input"
              />
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Tỉnh/Thành phố *"
                className="input sm:col-span-2"
                required
              />
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ghi chú cho người giao hàng (tuỳ chọn)"
                rows={2}
                className="input sm:col-span-2"
              />
            </div>
          </section>

          {/* Items */}
          <section className="card p-5">
            <h2 className="mb-3 text-base font-bold text-neutral-900">
              Sản phẩm ({items.length})
            </h2>
            <div className="divide-y divide-neutral-100">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 py-3">
                  <img
                    src={item.thumbnail}
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
            </div>
          </section>

          {/* Shipping method */}
          <section className="card p-5">
            <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-neutral-900">
              <Truck size={18} className="text-brand-red-500" />
              Phương thức vận chuyển
            </h2>
            <div className="space-y-2">
              {shippingRates.map((opt) => (
                <label
                  key={opt.serviceId}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors",
                    selectedRate.serviceId === opt.serviceId
                      ? "border-brand-red-500 bg-brand-red-50"
                      : "border-neutral-200 hover:border-brand-red-300"
                  )}
                >
                  <input
                    type="radio"
                    name="shipping"
                    value={opt.serviceId}
                    checked={selectedRate.serviceId === opt.serviceId}
                    onChange={() => setSelectedRate(opt)}
                    className="h-4 w-4 text-brand-red-500 focus:ring-brand-red-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold text-neutral-900">
                        {opt.serviceName}
                      </div>
                      <div className="text-sm font-bold text-brand-red-600">
                        {formatCurrency(opt.price)}
                      </div>
                    </div>
                    <div className="text-xs text-neutral-500">
                      {opt.provider} · Giao trong {opt.estimatedDays} ngày
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </section>

          {/* Payment method */}
          <section className="card p-5">
            <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-neutral-900">
              <CreditCard size={18} className="text-brand-red-500" />
              Phương thức thanh toán
            </h2>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {PAYMENT_OPTIONS.map((opt) => (
                <label
                  key={opt.id}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors",
                    payment === opt.id
                      ? "border-brand-red-500 bg-brand-red-50"
                      : "border-neutral-200 hover:border-brand-red-300"
                  )}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={opt.id}
                    checked={payment === opt.id}
                    onChange={() => setPayment(opt.id)}
                    className="h-4 w-4 text-brand-red-500 focus:ring-brand-red-500"
                  />
                  <opt.icon size={18} className={opt.color} />
                  <span className="text-sm font-medium text-neutral-900">
                    {opt.label}
                  </span>
                </label>
              ))}
            </div>
            <p className="mt-2 text-xs text-neutral-500">
              Thanh toán trực tuyến được ký và xác nhận qua backend bảo mật.
            </p>
          </section>

          {/* Voucher */}
          <VoucherApply
            shopId={voucherShopId}
            subtotal={subtotal}
            shippingFee={shippingFee}
            appliedCode={appliedVoucher?.code ?? null}
            onApply={(v, d, sd) => {
              setAppliedVoucher(v)
              setVoucherDiscount(d)
              setVoucherShippingDiscount(sd)
            }}
            onRemove={() => {
              setAppliedVoucher(null)
              setVoucherDiscount(0)
              setVoucherShippingDiscount(0)
            }}
          />
        </div>

        {/* Summary */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card p-5">
            <h2 className="mb-4 text-lg font-bold text-neutral-900">
              Tổng kết
            </h2>

            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-600">Tạm tính</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Phí vận chuyển</span>
                <span className={voucherShippingDiscount > 0 ? "text-neutral-400 line-through" : ""}>
                  {formatCurrency(shippingFee)}
                </span>
              </div>
              {voucherShippingDiscount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Giảm phí ship (voucher)</span>
                  <span>-{formatCurrency(voucherShippingDiscount)}</span>
                </div>
              )}
              {voucherDiscount > 0 && appliedVoucher && (
                <div className="flex justify-between text-emerald-600">
                  <span>
                    Voucher{" "}
                    <code className="font-mono text-[10px]">{appliedVoucher.code}</code>
                  </span>
                  <span>-{formatCurrency(voucherDiscount)}</span>
                </div>
              )}
              {codFee > 0 && (
                <div className="flex justify-between">
                  <span className="text-neutral-600">Phí thu hộ (COD)</span>
                  <span>{formatCurrency(codFee)}</span>
                </div>
              )}
              <div className="my-2 border-t border-neutral-200" />
              <div className="flex items-baseline justify-between">
                <span className="font-semibold">Tổng thanh toán</span>
                <span className="text-2xl font-extrabold text-brand-red-600">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={loading}
              className="btn-primary mt-5 w-full justify-center text-base"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Đang xử lý...
                </>
              ) : (
                "Đặt hàng ngay"
              )}
            </button>

            <div className="mt-4 space-y-2 text-xs text-neutral-600">
              <div className="flex items-center gap-2">
                <Package size={14} className="text-brand-gold-500" />
                <span>Giao hàng toàn quốc từ 1-3 ngày</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-emerald-500" />
                <span>Đổi trả 7 ngày miễn phí với hàng lỗi</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
