import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import {
  BadgeCheck,
  BarChart3,
  Boxes,
  FileText,
  Store,
  Palette,
  Truck,
  ArrowRight,
  Loader2,
  ShieldCheck,
  Sparkles,
} from "lucide-react"
import { useAuthStore } from "../../../stores/auth-store"
import { useSellerProducts } from "../../../hooks/use-products"
import { useMyVendor } from "../../../hooks/use-vendor"
import {
  subscribeSellerOrders,
  type OrderDoc,
} from "../../../lib/order-service"

interface ChannelCard {
  title: string
  description: string
  to: string
  icon: typeof Boxes
  accent: string
  badge?: { value: number; label: string } | null
  loading?: boolean
}

/**
 * Live shipping-pending counter for the seller's outgoing orders.
 * Subscribes to Firestore directly because /seller-channel sits on the
 * public layout (outside SellerLayout) and we don't want to pull the
 * full orders table here — just the count of orders that still need to ship.
 */
function useShippingPendingCount(shopId: string | undefined): {
  count: number | null
  loading: boolean
} {
  const [count, setCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!shopId) {
      setCount(null)
      setLoading(false)
      return
    }
    setLoading(true)
    const unsubscribe = subscribeSellerOrders(
      { shopId },
      (orders: OrderDoc[]) => {
        // "Đơn cần đóng gói/giao đi" = chưa shipped, không tính cancelled / completed
        const pending = orders.filter((o) =>
          ["awaiting_confirm", "preparing", "ready_to_ship"].includes(o.status)
        ).length
        setCount(pending)
        setLoading(false)
      },
      (err) => {
        console.error("[useShippingPendingCount]", err)
        setCount(null)
        setLoading(false)
      }
    )
    return () => unsubscribe()
  }, [shopId])

  return { count, loading }
}

export default function SellerChannelLanding() {
  const user = useAuthStore((s) => s.user)
  const vendor = useMyVendor()
  const isSeller =
    user?.role === "seller" || vendor.data?.vendor?.status === "active"

  // Sản phẩm chờ duyệt (kho nháp / chờ admin xét)
  const draftQuery = useSellerProducts({ status: "draft" })
  const pendingQuery = useSellerProducts({ status: "pending" })
  const approvedQuery = useSellerProducts({ status: "approved" })
  const shipping = useShippingPendingCount(user?.id)

  const inventoryCount =
    (draftQuery.data?.count ?? 0) + (pendingQuery.data?.count ?? 0)
  const inventoryLoading = draftQuery.isLoading || pendingQuery.isLoading

  const showcaseCount = approvedQuery.data?.count ?? 0
  const showcaseLoading = approvedQuery.isLoading
  const registrationTo = user ? "/seller-register" : "/login/store"
  const registrationState = user ? undefined : { from: "/seller-register" }

  const cards: ChannelCard[] = [
    {
      title: "Quản lý kho",
      description:
        "Sản phẩm nháp và đang chờ kiểm duyệt. Bổ sung ảnh, mô tả và gửi duyệt.",
      to: "/seller/products?status=pending",
      icon: Boxes,
      accent: "from-brand-red-500 to-brand-red-700",
      badge: inventoryLoading
        ? null
        : { value: inventoryCount, label: "đang chờ duyệt" },
      loading: inventoryLoading,
    },
    {
      title: "Shop — Trang trưng bày",
      description:
        "Sản phẩm đã được kiểm duyệt, sắp xếp theo danh mục, chính hãng 100%.",
      to: "/seller/shop",
      icon: Store,
      accent: "from-brand-gold-500 to-brand-gold-700",
      badge: showcaseLoading
        ? null
        : { value: showcaseCount, label: "đang trưng bày" },
      loading: showcaseLoading,
    },
    {
      title: "Trang trí trang trưng bày",
      description:
        "Đổi ảnh bìa, sắp xếp lại hàng hoá, cấu hình khuyến mãi và combo.",
      to: "/seller/shop/customize",
      icon: Palette,
      accent: "from-emerald-500 to-emerald-700",
    },
    {
      title: "Tra cứu đơn hàng (Đơn bán)",
      description:
        "Tra mã vận chuyển, xem lịch trình giao của đơn bán đã xuất.",
      to: "/seller/orders/track",
      icon: Truck,
      accent: "from-sky-500 to-sky-700",
      badge: shipping.loading
        ? null
        : shipping.count == null
        ? null
        : { value: shipping.count, label: "đơn cần xử lý" },
      loading: shipping.loading,
    },
  ]

  return (
    <div className="container-acf py-6 lg:py-10">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-red-600">
            Seller Portal
          </p>
          <h1 className="mt-1 text-2xl font-bold text-neutral-900 lg:text-3xl">
            {isSeller
              ? `Xin chào${user?.name ? `, ${user.name}` : ""}`
              : "Cổng người bán ACFMart"}
          </h1>
          <p className="mt-1 text-sm text-neutral-600">
            {isSeller
              ? "Quản lý kho, trang trưng bày và đơn bán của shop ở một chỗ."
              : "Đăng ký, xác minh hồ sơ và vận hành gian hàng chính hãng trên ACFMart."}
          </p>
        </div>
        {isSeller && (
          <Link
            to="/seller"
            className="btn-secondary inline-flex items-center gap-1 self-start sm:self-auto"
          >
            Mở Seller Center
            <ArrowRight size={14} />
          </Link>
        )}
      </div>

      {!isSeller && (
        <>
          <div className="mb-6 overflow-hidden rounded-2xl border border-brand-red-100 bg-white">
            <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="p-6 md:p-8">
                <div className="inline-flex items-center gap-2 rounded-full bg-brand-red-50 px-3 py-1 text-xs font-semibold text-brand-red-700">
                  <BadgeCheck size={13} />
                  Dành cho cá nhân, hộ kinh doanh và doanh nghiệp
                </div>
                <h2 className="mt-4 max-w-2xl text-2xl font-extrabold leading-tight text-neutral-900 md:text-4xl">
                  Bán hàng chính hãng trên ACFMart với hồ sơ pháp lý rõ ràng
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600">
                  Seller Portal giúp người bán đăng ký hồ sơ, tải hợp đồng đã tự điền,
                  quản lý sản phẩm, voucher, đơn hàng, tài chính và trang trưng bày sau
                  khi được duyệt.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    to={registrationTo}
                    state={registrationState}
                    className="btn-primary inline-flex items-center gap-1"
                  >
                    {user ? "Bắt đầu đăng ký Seller" : "Đăng nhập để đăng ký"}
                    <ArrowRight size={14} />
                  </Link>
                  <Link to="/guide/seller" className="btn-secondary">
                    Xem hướng dẫn người bán
                  </Link>
                </div>
              </div>
              <div className="border-t border-brand-red-100 bg-gradient-to-br from-brand-red-50 to-brand-gold-50 p-6 lg:border-l lg:border-t-0">
                <div className="grid gap-3">
                  {[
                    {
                      icon: FileText,
                      title: "Hồ sơ tự điền",
                      desc: "Đơn đăng ký và hợp đồng Word tự lấy thông tin đã nhập.",
                    },
                    {
                      icon: ShieldCheck,
                      title: "Kiểm duyệt pháp lý",
                      desc: "Yêu cầu GP ĐKKD và giấy phép con cho hàng đặc thù.",
                    },
                    {
                      icon: Store,
                      title: "Trang trưng bày",
                      desc: "Sắp xếp Bán chạy, Flash Sale, danh mục, ảnh bìa và logo.",
                    },
                    {
                      icon: BarChart3,
                      title: "Vận hành shop",
                      desc: "Theo dõi sản phẩm, đơn hàng, voucher, tài chính và phân tích.",
                    },
                  ].map((item) => (
                    <div key={item.title} className="flex items-start gap-3 rounded-xl bg-white/80 p-3 ring-1 ring-white">
                      <div className="rounded-lg bg-brand-red-100 p-2 text-brand-red-700">
                        <item.icon size={16} />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-neutral-900">{item.title}</div>
                        <div className="mt-0.5 text-xs leading-5 text-neutral-600">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6 grid gap-3 md:grid-cols-3">
            {[
              {
                step: "1",
                title: "Đăng nhập tài khoản",
                desc: "Dùng email hoặc Google để vào luồng đăng ký Seller.",
              },
              {
                step: "2",
                title: "Hoàn thiện hồ sơ",
                desc: "Nhập thông tin shop, pháp lý, ngân hàng và tải tài liệu đã ký.",
              },
              {
                step: "3",
                title: "Chờ duyệt và bán hàng",
                desc: "Sau khi duyệt, Seller Center mở đầy đủ công cụ vận hành.",
              },
            ].map((item) => (
              <div key={item.step} className="rounded-xl border border-neutral-200 bg-white p-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-red-600 text-sm font-bold text-white">
                  {item.step}
                </div>
                <div className="mt-3 text-sm font-bold text-neutral-900">{item.title}</div>
                <div className="mt-1 text-xs leading-5 text-neutral-600">{item.desc}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {isSeller && (
        <div className="grid gap-4 md:grid-cols-2">
          {cards.map((card) => {
            const Icon = card.icon
            return (
              <Link
                key={card.to}
                to={card.to}
                className="card group flex h-full flex-col gap-3 overflow-hidden p-5 transition-shadow hover:shadow-lg"
              >
                <div
                  className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white ${card.accent}`}
                >
                  <Icon size={22} />
                </div>
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-lg font-bold text-neutral-900 group-hover:text-brand-red-700">
                    {card.title}
                  </h3>
                  {card.loading ? (
                    <Loader2
                      size={16}
                      className="mt-1 animate-spin text-neutral-400"
                    />
                  ) : card.badge ? (
                    <span className="rounded-full bg-brand-red-50 px-2.5 py-1 text-xs font-semibold text-brand-red-700">
                      {card.badge.value} {card.badge.label}
                    </span>
                  ) : null}
                </div>
                <p className="text-sm text-neutral-600">{card.description}</p>
                <div className="mt-auto flex items-center gap-1 pt-2 text-sm font-semibold text-brand-red-600 group-hover:gap-2 transition-all">
                  Mở
                  <ArrowRight size={14} />
                </div>
              </Link>
            )
          })}
        </div>
      )}

      <div className="mt-6 rounded-2xl border border-brand-red-100 bg-gradient-to-br from-brand-red-50 to-brand-gold-50 p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-white p-2 text-brand-gold-600 shadow-sm">
            <Sparkles size={18} />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-neutral-900">
              Aivy có thể giúp gì cho shop?
            </h3>
            <p className="mt-1 text-xs text-neutral-700">
              Hỏi Aivy về cách viết mô tả sản phẩm, gợi ý ảnh bìa, mẹo tối ưu
              gian hàng và hướng dẫn xử lý đơn theo quy chuẩn sàn ACFMart.
            </p>
            <Link
              to="/aivy?topic=seller"
              className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand-red-700 hover:underline"
            >
              Chat với Aivy <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
