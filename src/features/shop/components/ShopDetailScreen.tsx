import { useMemo, useState } from "react"
import { useNavigate, useParams, Link } from "react-router-dom"
import {
  ShieldCheck,
  Star,
  Users,
  Package,
  MessageSquare,
  Heart,
  Share2,
  TrendingUp,
  Clock,
  Award,
  Video,
  Loader2,
  AlertCircle,
} from "lucide-react"
import toast from "react-hot-toast"
import { ProductCard } from "../../../components/ProductCard"
import { ProductGridSkeleton } from "../../../components/Skeleton"
import { cn } from "../../../lib/cn"
import { sanitizeUserError } from "../../../lib/error-utils"
import { NotFound } from "../../../pages/NotFound"
import { useVendorById } from "../../../hooks/use-vendor"
import { useApprovedProducts } from "../../../hooks/use-products"
import { productDocToCardShape } from "../../../lib/product-service"
import type { VendorDoc } from "../../../lib/vendor-service"
import { chatService } from "../../../lib/firestore-chat"
import { useAuthStore } from "../../../stores/auth-store"

const TABS = [
  { id: "products", label: "Sản phẩm" },
  { id: "live", label: "Live" },
  { id: "reviews", label: "Đánh giá" },
  { id: "about", label: "Giới thiệu" },
] as const

type TabId = (typeof TABS)[number]["id"]

const CERT_BADGE: Record<VendorDoc["kyc_level"], { label: string; tone: string }> = {
  none: { label: "Chưa xác minh", tone: "bg-neutral-100 text-neutral-700 border-neutral-300" },
  basic: { label: "Xác minh cơ bản", tone: "bg-amber-100 text-amber-700 border-amber-300" },
  verified: { label: "Chứng nhận Bạc", tone: "bg-neutral-100 text-neutral-700 border-neutral-300" },
  premium: { label: "Chứng nhận Vàng", tone: "bg-brand-gold-100 text-brand-gold-700 border-brand-gold-300" },
}

export default function ShopDetailScreen() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const vendorQuery = useVendorById(id)
  const vendor = vendorQuery.data

  const productsQuery = useApprovedProducts({
    shopId: vendor?.firebase_uid,
    limit: 60,
  })
  const productCards = useMemo(
    () => (productsQuery.data ?? []).map(productDocToCardShape),
    [productsQuery.data]
  )

  const [tab, setTab] = useState<TabId>("products")
  const [following, setFollowing] = useState(false)

  if (vendorQuery.isLoading) {
    return (
      <div className="container-acf flex min-h-[40vh] items-center justify-center">
        <Loader2 className="animate-spin text-brand-red-500" size={28} />
      </div>
    )
  }

  if (vendorQuery.isError) {
    return (
      <div className="container-acf py-12">
        <div className="card flex items-start gap-3 border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold">Không tải được shop</p>
            <p className="mt-0.5 text-xs">
              {vendorQuery.error instanceof Error
                ? vendorQuery.error.message
                : "Có lỗi xảy ra"}
            </p>
            <button onClick={() => vendorQuery.refetch()} className="btn-secondary mt-3 text-xs">
              Thử lại
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!vendor) return <NotFound />

  function toggleFollow() {
    setFollowing((prev) => !prev)
    toast.success(following ? "Đã bỏ theo dõi shop" : "Đã theo dõi shop")
  }

  async function openShopChat() {
    if (!vendor) return
    if (!user) {
      navigate("/login", { state: { from: `/shops/${vendor.id}` } })
      return
    }
    if (user.id === vendor.firebase_uid) {
      navigate("/seller/chat")
      return
    }
    try {
      const conversationId = await chatService.getOrCreateConversation({
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar,
        partyId: vendor.firebase_uid,
        type: "shop",
        partyName: vendor.shop_name,
        partyAvatar: vendor.shop_logo ?? undefined,
      })
      navigate(`/account/chat?conversation=${encodeURIComponent(conversationId)}`)
    } catch (err) {
      toast.error(sanitizeUserError(err, "Không mở được hội thoại. Vui lòng thử lại sau."))
    }
  }

  const cert = CERT_BADGE[vendor.kyc_level]
  const isVerified = vendor.kyc_level === "verified" || vendor.kyc_level === "premium"
  const joinedAt = vendor.created_at?.toDate?.() ?? new Date()
  const onTimeRate = vendor.on_time_shipping_rate || 0
  const rating = vendor.avg_rating || 0
  const followerCount = vendor.follower_count || 0

  return (
    <div className="animate-fade-in">
      {/* Cover */}
      <div className="relative h-32 overflow-hidden bg-gradient-to-r from-brand-red-500 via-brand-red-600 to-brand-gold-500 md:h-48">
        {vendor.shop_banner && (
          <img
            src={vendor.shop_banner}
            alt={vendor.shop_name}
            className="h-full w-full object-cover"
          />
        )}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white blur-3xl" />
        </div>
      </div>

      <div className="container-acf -mt-12 md:-mt-16">
        <div className="card flex flex-col gap-4 p-5 md:flex-row md:items-start">
          {vendor.shop_logo ? (
            <img
              src={vendor.shop_logo}
              alt={vendor.shop_name}
              className="h-24 w-24 shrink-0 rounded-2xl border-4 border-white object-cover shadow-md md:h-32 md:w-32"
            />
          ) : (
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border-4 border-white bg-brand-red-100 text-3xl font-extrabold text-brand-red-700 shadow-md md:h-32 md:w-32 md:text-4xl">
              {vendor.shop_name[0]?.toUpperCase() ?? "?"}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-extrabold text-neutral-900 md:text-3xl">
                {vendor.shop_name}
              </h1>
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-bold",
                  cert.tone
                )}
              >
                <ShieldCheck size={12} />
                {cert.label}
              </span>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-neutral-600">
              <span className="flex items-center gap-1">
                <Star size={12} className="fill-brand-gold-400 text-brand-gold-400" />
                <strong className="text-neutral-900">{rating > 0 ? rating.toFixed(1) : "—"}</strong>
                <span className="text-neutral-400">đánh giá</span>
              </span>
              <span className="text-neutral-300">·</span>
              <span className="flex items-center gap-1">
                <Users size={12} />
                <strong className="text-neutral-900">
                  {followerCount.toLocaleString("vi-VN")}
                </strong>
                <span className="text-neutral-400">người theo dõi</span>
              </span>
              <span className="text-neutral-300">·</span>
              <span className="flex items-center gap-1">
                <Package size={12} />
                <strong className="text-neutral-900">
                  {productsQuery.isLoading ? "..." : productCards.length}
                </strong>
                <span className="text-neutral-400">sản phẩm</span>
              </span>
            </div>

            <div className="mt-2 grid grid-cols-2 gap-2 text-xs md:grid-cols-3">
              <div className="rounded-lg bg-neutral-50 p-2">
                <div className="text-neutral-500">Tổng đơn</div>
                <div className="font-semibold text-neutral-900">
                  {vendor.total_orders.toLocaleString("vi-VN")}
                </div>
              </div>
              <div className="rounded-lg bg-neutral-50 p-2">
                <div className="text-neutral-500">Tham gia</div>
                <div className="font-semibold text-neutral-900">
                  {joinedAt.toLocaleDateString("vi-VN", { month: "short", year: "numeric" })}
                </div>
              </div>
              <div className="rounded-lg bg-emerald-50 p-2 text-emerald-700">
                <div className="text-[10px]">Tỷ lệ giao đúng hạn</div>
                <div className="font-semibold">
                  {onTimeRate > 0 ? `${onTimeRate}%` : "—"}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 md:w-44">
            <button
              onClick={toggleFollow}
              className={cn(
                "btn-primary justify-center",
                following && "bg-neutral-200 text-neutral-700 hover:bg-neutral-300"
              )}
            >
              <Heart size={14} fill={following ? "currentColor" : "none"} />
              {following ? "Đang theo dõi" : "Theo dõi"}
            </button>
            <button onClick={openShopChat} className="btn-secondary justify-center">
              <MessageSquare size={14} />
              Chat
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href)
                toast.success("Đã sao chép link shop")
              }}
              className="btn-secondary justify-center"
            >
              <Share2 size={14} />
              Chia sẻ
            </button>
          </div>
        </div>

        {/* Highlights — chỉ hiển thị khi có data thật */}
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          {isVerified && (
            <Highlight icon={Award} label="Đã xác minh ACF" color="text-brand-gold-600 bg-brand-gold-50" />
          )}
          {vendor.total_orders > 100 && (
            <Highlight icon={TrendingUp} label="Shop bán chạy" color="text-brand-red-600 bg-brand-red-50" />
          )}
          {onTimeRate >= 95 && (
            <Highlight icon={Clock} label={`Giao đúng hạn ${onTimeRate}%`} color="text-blue-600 bg-blue-50" />
          )}
          <Highlight icon={ShieldCheck} label="Cam kết chính hãng" color="text-emerald-600 bg-emerald-50" />
        </div>

        {/* Tabs */}
        <div className="mt-6 flex overflow-x-auto border-b border-neutral-200">
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
              {t.id === "products" && !productsQuery.isLoading && (
                <span className="ml-1 text-xs text-neutral-400">({productCards.length})</span>
              )}
            </button>
          ))}
        </div>

        <div className="py-5">
          {tab === "products" &&
            (productsQuery.isLoading ? (
              <ProductGridSkeleton count={8} />
            ) : productCards.length === 0 ? (
              <div className="card p-12 text-center text-neutral-500">
                Shop chưa có sản phẩm nào được duyệt
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                {productCards.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            ))}

          {tab === "live" && (
            <div className="card p-8 text-center">
              <Video size={32} className="mx-auto text-neutral-300" />
              <h3 className="mt-3 text-base font-semibold">Shop chưa có Livestream</h3>
              <p className="mt-1 text-sm text-neutral-500">
                Bấm "Theo dõi" để nhận thông báo khi shop lên sóng.
              </p>
            </div>
          )}

          {tab === "reviews" && (
            <div className="card p-8 text-center">
              <Star size={32} className="mx-auto text-neutral-300" />
              <h3 className="mt-3 text-base font-semibold">Chưa có đánh giá</h3>
              <p className="mt-1 text-sm text-neutral-500">
                Đánh giá từ khách mua sẽ hiển thị tại đây khi tính năng review release.
              </p>
            </div>
          )}

          {tab === "about" && (
            <div className="card space-y-4 p-5">
              <div>
                <h3 className="font-bold text-neutral-900">Giới thiệu shop</h3>
                <p className="mt-1 whitespace-pre-line text-sm text-neutral-700">
                  {vendor.description ||
                    `${vendor.shop_name} cam kết cung cấp sản phẩm chính hãng có xác thực bởi Quỹ Chống Hàng Giả Việt Nam.`}
                </p>
              </div>
              <div>
                <h3 className="font-bold text-neutral-900">Địa chỉ lấy hàng</h3>
                <p className="mt-1 text-sm text-neutral-700">
                  {vendor.pickup_address.full_address}, {vendor.pickup_address.ward},{" "}
                  {vendor.pickup_address.district}, {vendor.pickup_address.city}
                </p>
              </div>
              <div>
                <h3 className="font-bold text-neutral-900">Liên hệ</h3>
                <p className="mt-1 text-sm text-neutral-700">{vendor.owner_phone}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Highlight({
  icon: Icon,
  label,
  color,
}: {
  icon: typeof Award
  label: string
  color: string
}) {
  return (
    <div className="card flex items-center gap-2 p-3">
      <div className={cn("rounded-lg p-2", color)}>
        <Icon size={14} />
      </div>
      <span className="text-xs font-semibold text-neutral-700">{label}</span>
    </div>
  )
}
