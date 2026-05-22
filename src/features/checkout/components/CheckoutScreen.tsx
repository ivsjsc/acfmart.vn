import { useState, useEffect, useMemo, useRef } from "react"
import { Link, useNavigate } from "react-router-dom"
import { doc, getDoc } from "firebase/firestore"
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
import { useAddresses, type UserAddress } from "../../../hooks/use-addresses"
import { formatCurrency } from "../../../lib/format"
import { cn } from "../../../lib/cn"
import { sanitizeUserError } from "../../../lib/error-utils"
import { PaymentService } from "../../../lib/payment-service"
import { ShippingService, type ShippingAddress, type ShippingRate } from "../../../lib/shipping-service"
import { registerShipment } from "../../../lib/shipment-sync"
import { createMarketplaceOrders } from "../../../lib/order-service"
import { firestore } from "../../../lib/firebase"
import { getVendorByFirebaseUid } from "../../../lib/vendor-service"
import { VoucherApply } from "./VoucherApply"
import type { VoucherDoc } from "../../../lib/voucher-service"
import {
  buildShippingOriginPayload,
  normalizeWarehouseList,
  selectBestWarehouse,
  vendorPickupWarehouses,
  type ShippingOriginPayload,
} from "../../../lib/warehouse-routing"

type PaymentMethod = "cod" | "vnpay" | "momo" | "zalopay" | "wallet"
type ShippingMethod = "standard" | "express" | "cod-ship"

const DEFAULT_SHIPPING_RATES: ShippingRate[] = [
  {
    serviceId: "standard",
    serviceName: "Giao hàng tiêu chuẩn",
    provider: "GHTK",
    providerId: "ghtk",
    serviceCode: "STANDARD",
    price: 30000,
    estimatedDays: 3,
    codFee: 5000
  },
  {
    serviceId: "express",
    serviceName: "Giao hàng nhanh",
    provider: "GHTK",
    providerId: "ghtk",
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

const FALLBACK_PICKUP_ADDRESS = {
  name: "Kho xác thực",
  phone: "19001234",
  address: "Kho xác thực",
  ward: "Phuong 12",
  district: "Tan Binh",
  city: "TP. Ho Chi Minh",
}

const PAYMENT_OPTIONS = [
  { id: "vnpay" as const, label: "VNPay", icon: CreditCard, color: "text-blue-600" },
  { id: "momo" as const, label: "Momo", icon: Wallet, color: "text-pink-600" },
  { id: "zalopay" as const, label: "ZaloPay", icon: Wallet, color: "text-blue-500" },
  { id: "wallet" as const, label: "Ví mua sắm", icon: Wallet, color: "text-brand-gold-600" },
  { id: "cod" as const, label: "COD - Thanh toán khi nhận", icon: Banknote, color: "text-emerald-600" },
]

function areShippingRatesEqual(left: ShippingRate[], right: ShippingRate[]) {
  if (left.length !== right.length) return false
  return left.every((rate, index) => {
    const next = right[index]
    return (
      !!next &&
      rate.serviceId === next.serviceId &&
      rate.serviceName === next.serviceName &&
      rate.provider === next.provider &&
      rate.price === next.price &&
      rate.estimatedDays === next.estimatedDays &&
      rate.insuranceFee === next.insuranceFee &&
      rate.codFee === next.codFee
    )
  })
}

function isCompleteAddress(address: Pick<UserAddress, "name" | "phone" | "address" | "ward" | "district" | "city">) {
  return [
    address.name,
    address.phone,
    address.address,
    address.ward,
    address.district,
    address.city,
  ].every((value) => value.trim().length > 0)
}

function buildFallbackShippingOrigin(): ShippingOriginPayload {
  return {
    warehouseId: "fallback",
    warehouseName: "Kho xác thực",
    contactName: FALLBACK_PICKUP_ADDRESS.name,
    contactPhone: FALLBACK_PICKUP_ADDRESS.phone,
    fullAddress: FALLBACK_PICKUP_ADDRESS.address,
    ward: FALLBACK_PICKUP_ADDRESS.ward,
    district: FALLBACK_PICKUP_ADDRESS.district,
    city: FALLBACK_PICKUP_ADDRESS.city,
    latitude: null,
    longitude: null,
    routeLabel: "Kho xác thực · Tan Binh, TP. Ho Chi Minh",
    distanceKm: null,
    selectionReason: "default",
  }
}

function shippingOriginToAddress(origin: ShippingOriginPayload): ShippingAddress {
  return {
    name: origin.contactName,
    phone: origin.contactPhone,
    address: origin.fullAddress,
    ward: origin.ward,
    district: origin.district,
    city: origin.city,
    latitude: origin.latitude ?? undefined,
    longitude: origin.longitude ?? undefined,
  }
}

export default function CheckoutScreen() {
  const navigate = useNavigate()
  const cartItems = useCartStore((s) => s.items)
  const selectedIds = useCartStore((s) => s.selectedIds)
  const clearPurchasedItems = useCartStore((s) => s.clearPurchasedItems)
  const currentUser = useAuthStore((s) => s.user)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const addressesQuery = useAddresses()

  const items = useMemo(() => {
    const selected = new Set(selectedIds)
    return cartItems.filter((item) => selected.has(item.id))
  }, [cartItems, selectedIds])

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  )

  const [shipping, setShipping] = useState<ShippingMethod>("standard")
  const [payment, setPayment] = useState<PaymentMethod>("cod")
  const [loading, setLoading] = useState(false)
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>(DEFAULT_SHIPPING_RATES)
  const [selectedRateId, setSelectedRateId] = useState<string>(DEFAULT_SHIPPING_RATES[0].serviceId)
  const selectedRateIdRef = useRef(selectedRateId)
  const [shippingOrigin, setShippingOrigin] = useState<ShippingOriginPayload | null>(null)
  const [loadingOrigin, setLoadingOrigin] = useState(false)

  const selectedRate = useMemo(() => {
    return (
      shippingRates.find((rate) => rate.serviceId === selectedRateId) ??
      shippingRates[0] ??
      DEFAULT_SHIPPING_RATES[0]
    )
  }, [shippingRates, selectedRateId])

  useEffect(() => {
    selectedRateIdRef.current = selectedRateId
  }, [selectedRateId])

  // Voucher — 1 voucher per checkout. For multi-shop carts the voucher applies
  // to the dominant shop (first item's shopId). Multi-voucher support is a
  // post-MVP enhancement.
  const [appliedVoucher, setAppliedVoucher] = useState<VoucherDoc | null>(null)
  const [voucherDiscount, setVoucherDiscount] = useState(0)
  const [voucherShippingDiscount, setVoucherShippingDiscount] = useState(0)
  const voucherShopId = items[0]?.shopId ?? ""

  const savedAddresses = addressesQuery.data?.addresses ?? []
  const primarySavedAddress = useMemo(() => {
    const completeAddresses = savedAddresses.filter(isCompleteAddress)
    return (
      completeAddresses.find((addr) => addr.isDefault) ??
      completeAddresses[0] ??
      null
    )
  }, [savedAddresses])
  const hasCompleteAddressBook = !!primarySavedAddress

  const [addressPrefilledFromBook, setAddressPrefilledFromBook] = useState(false)

  // Address form
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [ward, setWard] = useState("")
  const [district, setDistrict] = useState("")
  const [city, setCity] = useState("")
  const [note, setNote] = useState("")

  useEffect(() => {
    if (!primarySavedAddress || addressPrefilledFromBook) return
    if (
      name.trim() ||
      phone.trim() ||
      address.trim() ||
      ward.trim() ||
      district.trim() ||
      city.trim()
    ) {
      return
    }

    setName(primarySavedAddress.name)
    setPhone(primarySavedAddress.phone)
    setAddress(primarySavedAddress.address)
    setWard(primarySavedAddress.ward)
    setDistrict(primarySavedAddress.district)
    setCity(primarySavedAddress.city)
    setAddressPrefilledFromBook(true)
  }, [
    address,
    addressPrefilledFromBook,
    city,
    district,
    name,
    phone,
    primarySavedAddress,
    ward,
  ])

  // Calculate total weight for shipping
  const totalWeight = items.reduce((weight, item) => {
    // Assuming average weight of 200g per item as default
    // In real app, this would come from product data
    return weight + (item.quantity * 200)
  }, 0)

  useEffect(() => {
    if (!address || !ward || !district || !city || items.length === 0) {
      setShippingOrigin(null)
      setLoadingOrigin(false)
      return
    }

    let cancelled = false
    async function resolveShippingOrigin() {
      setLoadingOrigin(true)
      try {
        const primaryItem = items[0]
        const [productSnap, vendor] = await Promise.all([
          getDoc(doc(firestore, "products", primaryItem.productId)),
          getVendorByFirebaseUid(primaryItem.shopId).catch(() => null),
        ])

        if (cancelled) return

        const productWarehouses = productSnap.exists()
          ? normalizeWarehouseList((productSnap.data() as Record<string, unknown>).warehouses)
          : []
        const vendorWarehouses = vendor ? vendorPickupWarehouses(vendor) : []
        const candidates =
          productWarehouses.length > 0
            ? productWarehouses
            : vendorWarehouses

        const destination = { ward, district, city }
        const selection = selectBestWarehouse(candidates, destination)
        setShippingOrigin(
          selection ? buildShippingOriginPayload(selection) : buildFallbackShippingOrigin()
        )
      } catch (err) {
        if (!cancelled) {
          setShippingOrigin(buildFallbackShippingOrigin())
        }
      } finally {
        if (!cancelled) {
          setLoadingOrigin(false)
        }
      }
    }

    void resolveShippingOrigin()

    return () => {
      cancelled = true
    }
  }, [address, ward, district, city, items])

  useEffect(() => {
    if (
      !address ||
      !ward ||
      !district ||
      !city ||
      items.length === 0 ||
      loadingOrigin ||
      !shippingOrigin
    ) {
      return
    }

    let cancelled = false
    ShippingService.calculateRates({
      from: shippingOriginToAddress(shippingOrigin),
      to: { name: name || "Khach hang", phone: phone || "0000000000", address, ward, district, city },
      weight: Math.max(totalWeight, 200),
      value: subtotal,
      serviceType: payment === "cod" ? "cod" : shipping === "express" ? "express" : "standard",
    })
      .then((rates) => {
        if (cancelled) return

        const nextRates = rates.length > 0 ? rates : DEFAULT_SHIPPING_RATES
        setShippingRates((currentRates) =>
          areShippingRatesEqual(currentRates, nextRates) ? currentRates : nextRates
        )

        if (rates.length > 0) {
          const currentSelectedRateId = selectedRateIdRef.current
          const nextSelectedRateId =
            rates.some((rate) => rate.serviceId === currentSelectedRateId)
              ? currentSelectedRateId
              : rates[0].serviceId

          if (nextSelectedRateId !== currentSelectedRateId) {
            setSelectedRateId(nextSelectedRateId)
          }
        }
      })
      .catch(() => {
        // Keep configured fallback rates visible; order creation still goes through backend.
      })

    return () => {
      cancelled = true
    }
  }, [address, ward, district, city, items.length, totalWeight, subtotal, payment, shipping, name, phone, loadingOrigin, shippingOrigin])

  const shippingFee = selectedRate.price
  const codFee = payment === 'cod' ? (selectedRate.codFee || 0) : 0
  const effectiveShipping = Math.max(0, shippingFee - voucherShippingDiscount)
  const total = subtotal + effectiveShipping + codFee - voucherDiscount

  async function handlePlaceOrder() {
    if (!hasCompleteAddressBook) {
      toast.error("Bạn cần hoàn tất Sổ địa chỉ trước khi đặt hàng")
      navigate("/account/addresses")
      return
    }
    if (!name || !phone || !address || !city) {
      toast.error("Vui lòng điền đầy đủ địa chỉ nhận hàng")
      return
    }
    if (!ward || !district) {
      toast.error("Vui lòng điền đầy đủ phường/xã và quận/huyện")
      return
    }
    if (items.length === 0) {
      toast.error("Vui lòng chọn sản phẩm trong giỏ hàng trước khi thanh toán")
      navigate("/cart")
      return
    }
    if (loadingOrigin) {
      toast.error("Đang chọn kho lấy hàng gần nhất, vui lòng đợi")
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
      const origin = shippingOrigin ?? buildFallbackShippingOrigin()
      const originAddress = shippingOriginToAddress(origin)
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
            orderCode,
            items,
            subtotal,
            total,
            paymentMethod: payment,
            name,
            phone,
            note,
            selectedRate,
            shippingProviderId: selectedRate.providerId,
            shippingProviderName: selectedRate.provider,
            shippingServiceCode: selectedRate.serviceCode,
            address: shippingAddress,
            shippingOrigin: origin,
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
            shippingProviderId: selectedRate.providerId,
            shippingProviderName: selectedRate.provider,
            shippingServiceCode: selectedRate.serviceCode,
            shippingFee: effectiveShipping,
            codFee: 0,
            discountTotal: voucherDiscount,
            customerNote: note,
            shippingOrigin: origin,
          })

          // Redirect to payment gateway
          window.location.href = paymentResult.redirect_url;
          return;
        }
      }

      let shippingResult: { success: boolean; trackingNumber?: string; error?: string } | null = null
      try {
        shippingResult = await ShippingService.createShippingOrder(
          selectedRate,
          originAddress,
          shippingAddress,
          items.map(item => ({
            name: item.title,
            weight: 200, // default weight
            value: item.price,
            quantity: item.quantity
          })),
          payment === 'cod',
          note
        )
      } catch (shippingError) {
        shippingResult = {
          success: false,
          error: shippingError instanceof Error ? shippingError.message : "Tạo vận đơn thất bại",
        }
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
        paymentStatus: payment === "cod" ? "cod" : "pending",
        shippingMethod: selectedRate.serviceName,
        shippingProviderId: selectedRate.providerId,
        shippingProviderName: selectedRate.provider,
        shippingServiceCode: selectedRate.serviceCode,
        shippingFee: effectiveShipping,
        codFee,
        discountTotal: voucherDiscount,
        customerNote: note,
        shippingOrigin: origin,
        trackingNumber: shippingResult?.trackingNumber,
      })

      if (shippingResult?.success && shippingResult.trackingNumber) {
        try {
        await registerShipment({
          orderCode,
          trackingNumber: shippingResult.trackingNumber,
          providerId: selectedRate.providerId ?? "ghtk",
          providerName: selectedRate.provider,
          serviceCode: selectedRate.serviceCode,
          fee: shippingFee,
          pickupDate: undefined,
          estimatedDeliveryDate: undefined,
          labelUrl: undefined,
          paymentStatus: payment === "cod" ? "cod" : "paid",
          statusCode: 2,
          statusText: "Đã tạo vận đơn",
          note,
        })
        } catch (syncError) {
          console.warn("[Checkout] Failed to sync shipment metadata:", syncError)
        }
      } else if (shippingResult?.error) {
        console.warn("[Checkout] Shipping order deferred:", shippingResult.error)
      }

      clearPurchasedItems()
      toast.success(
        shippingResult?.success
          ? "Đặt hàng thành công!"
          : "Đã tạo đơn hàng. Vận đơn sẽ được tạo sau khi hệ thống vận chuyển sẵn sàng."
      )
      navigate(`/checkout/success/${orderCode}`, {
        state: { 
          orderCode, 
          total, 
          paymentMethod: payment,
          shippingMethod: selectedRate.serviceName,
          trackingNumber: shippingResult?.trackingNumber,
          shippingProviderId: selectedRate.providerId,
        },
      })
    } catch (err) {
      toast.error(sanitizeUserError(err, "Đặt hàng thất bại. Vui lòng thử lại sau."))
    } finally {
      setLoading(false)
    }
  }

  if (cartItems.length === 0 || items.length === 0) {
    return (
      <div className="container-acf py-12 text-center">
        <h1 className="text-2xl font-bold">
          {cartItems.length === 0 ? "Giỏ hàng đang trống" : "Chưa chọn sản phẩm để thanh toán"}
        </h1>
        <button
          onClick={() => navigate(cartItems.length === 0 ? "/" : "/cart")}
          className="btn-primary mt-4"
        >
          {cartItems.length === 0 ? "Về trang chủ" : "Quay lại giỏ hàng"}
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
            {hasCompleteAddressBook ? (
              <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-emerald-800">
                      Địa chỉ đã lưu trong Sổ địa chỉ
                    </div>
                    <div className="mt-1 text-sm text-emerald-700">
                      {primarySavedAddress?.name} · {primarySavedAddress?.phone}
                    </div>
                    <div className="mt-0.5 text-sm text-emerald-700">
                      {primarySavedAddress?.address}, {primarySavedAddress?.ward},{" "}
                      {primarySavedAddress?.district}, {primarySavedAddress?.city}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate("/account/addresses")}
                    className="btn-secondary shrink-0 justify-center text-xs"
                  >
                    Mở Sổ địa chỉ
                  </button>
                </div>
              </div>
            ) : (
              <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
                <div className="text-sm font-semibold text-amber-800">
                  Sổ địa chỉ chưa hoàn tất
                </div>
                <p className="mt-1 text-sm text-amber-700">
                  Bạn cần lưu ít nhất một địa chỉ đầy đủ trong Sổ địa chỉ trước khi đặt
                  hàng.
                </p>
                <button
                  type="button"
                  onClick={() => navigate("/account/addresses")}
                  className="btn-secondary mt-3 justify-center text-xs"
                >
                  Hoàn tất Sổ địa chỉ
                </button>
              </div>
            )}
            <div className="mb-4 rounded-lg border border-sky-200 bg-sky-50 p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-sky-800">
                    Kho lấy hàng
                  </div>
                  {loadingOrigin ? (
                    <div className="mt-1 flex items-center gap-2 text-sm text-sky-700">
                      <Loader2 size={14} className="animate-spin" />
                      Đang chọn kho gần nhất theo tuyến giao...
                    </div>
                  ) : (
                    <>
                      <div className="mt-1 text-sm text-sky-700">
                        {shippingOrigin?.warehouseName ?? "Kho xác thực"}
                      </div>
                      <div className="mt-0.5 text-sm text-sky-700">
                        {shippingOrigin?.routeLabel ?? "Chưa xác định tuyến giao"}
                      </div>
                      <div className="mt-1 text-xs text-sky-600">
                        {shippingOrigin?.distanceKm != null
                          ? `Khoảng cách ước tính: ${shippingOrigin.distanceKm.toFixed(1)} km`
                          : shippingOrigin?.selectionReason === "address-match"
                            ? "Ưu tiên kho theo khu vực giao hàng"
                            : "Dùng kho mặc định nếu chưa có dữ liệu tuyến chính xác"}
                      </div>
                    </>
                  )}
                </div>
                <div className="rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-sky-700">
                  {shippingOrigin?.selectionReason === "nearest"
                    ? "Nearest"
                    : shippingOrigin?.selectionReason === "address-match"
                      ? "Address match"
                      : "Default"}
                </div>
              </div>
            </div>
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
                required
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
                  checked={selectedRateId === opt.serviceId}
                  onChange={() => setSelectedRateId(opt.serviceId)}
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

          <section className="rounded-2xl border border-brand-red-100 bg-brand-red-50/70 p-5">
            <div className="flex items-start gap-3">
              <ShieldCheck size={18} className="mt-0.5 shrink-0 text-brand-red-600" />
              <div className="min-w-0">
                <h2 className="text-base font-bold text-neutral-900">
                  Quy tắc giao dịch cần biết trước khi đặt hàng
                </h2>
                <p className="mt-1 text-sm leading-6 text-neutral-600">
                  Địa chỉ trong Sổ địa chỉ phải hoàn tất trước khi đặt đơn. Tiền online được kiểm soát theo cơ chế giải ngân, COD đi qua đối soát carrier và đơn có tranh chấp sẽ bị giữ payout cho đến khi có kết luận.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    to="/legal"
                    className="rounded-full border border-brand-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-brand-red-700 transition-colors hover:bg-brand-red-50"
                  >
                    Trung tâm chính sách
                  </Link>
                  <Link
                    to="/legal/payment"
                    className="rounded-full border border-brand-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-brand-red-700 transition-colors hover:bg-brand-red-50"
                  >
                    Thanh toán
                  </Link>
                  <Link
                    to="/legal/return"
                    className="rounded-full border border-brand-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-brand-red-700 transition-colors hover:bg-brand-red-50"
                  >
                    Đổi trả
                  </Link>
                  <Link
                    to="/legal/shipping"
                    className="rounded-full border border-brand-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-brand-red-700 transition-colors hover:bg-brand-red-50"
                  >
                    Vận chuyển
                  </Link>
                </div>
              </div>
            </div>
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
              type="button"
              onClick={handlePlaceOrder}
              disabled={loading || !hasCompleteAddressBook}
              className="btn-primary mt-5 w-full justify-center text-base"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Đang xử lý...
                </>
              ) : !hasCompleteAddressBook ? (
                <>
                  <MapPin size={16} /> Hoàn tất Sổ địa chỉ trước
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
                <span>Đổi trả 7 ngày đổi ý, 15 ngày lỗi/sai mô tả</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
