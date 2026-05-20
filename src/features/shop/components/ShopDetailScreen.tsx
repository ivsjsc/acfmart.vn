import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useNavigate, useParams, Link } from "react-router-dom"
import {
  ShieldCheck,
  Star,
  Package,
  MessageSquare,
  Heart,
  Share2,
  TrendingUp,
  Clock,
  Award,
  Loader2,
  AlertCircle,
  ChevronRight,
  Search,
  ShoppingCart,
  Gift,
  LayoutGrid,
  List,
  Filter,
  Store,
  MapPin,
  ArrowUp,
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
import { followUser, unfollowUser, subscribeFollowState, type FollowState } from "../../../lib/follow-service"
import { useAuthStore } from "../../../stores/auth-store"
import type { ProductCardProduct } from "../../../components/ProductCard"

const TABS = [
  { id: "home", label: "Trang chủ", icon: Store },
  { id: "products", label: "Sản phẩm", icon: Package },
  { id: "reviews", label: "Đánh giá", icon: Star },
] as const

type TabId = (typeof TABS)[number]["id"]

type SortOption = "recommended" | "best_selling" | "newest" | "price_asc" | "price_desc"

const SORT_OPTIONS: Array<{ value: SortOption; label: string }> = [
  { value: "recommended", label: "Đề xuất" },
  { value: "best_selling", label: "Bán chạy" },
  { value: "newest", label: "Mới nhất" },
  { value: "price_asc", label: "Giá thấp" },
  { value: "price_desc", label: "Giá cao" },
]

const CERT_BADGE: Record<VendorDoc["kyc_level"], { label: string; tone: string }> = {
  none: { label: "Chưa xác minh", tone: "bg-neutral-100/80 text-neutral-600 border-neutral-300/50" },
  basic: { label: "Xác minh cơ bản", tone: "bg-amber-100/80 text-amber-700 border-amber-300/50" },
  verified: { label: "Chứng nhận Bạc", tone: "bg-white/80 text-neutral-700 border-white/50" },
  premium: { label: "Chứng nhận Vàng", tone: "bg-brand-gold-100/80 text-brand-gold-700 border-brand-gold-300/50" },
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

  const [tab, setTab] = useState<TabId>("home")
  const [followState, setFollowState] = useState<FollowState>({
    followersCount: 0, followingCount: 0, isFollowing: false, followsMe: false, isMutual: false,
  })
  const [followLoading, setFollowLoading] = useState(false)
  const [showStickyHeader, setShowStickyHeader] = useState(false)
  const [sortBy, setSortBy] = useState<SortOption>("recommended")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showBackToTop, setShowBackToTop] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)

  const sortedProducts = useMemo(() => {
    const items = [...productCards]
    switch (sortBy) {
      case "best_selling":
        return items.sort((a, b) => (b.sold ?? 0) - (a.sold ?? 0))
      case "newest":
        return items
      case "price_asc":
        return items.sort((a, b) => a.price - b.price)
      case "price_desc":
        return items.sort((a, b) => b.price - a.price)
      default:
        return items
    }
  }, [productCards, sortBy])

  const bestSellers = useMemo(
    () =>
      [...productCards]
        .sort((a, b) => (b.sold ?? 0) - (a.sold ?? 0))
        .slice(0, 8),
    [productCards]
  )

  const newArrivals = useMemo(
    () => productCards.slice(0, 8),
    [productCards]
  )

  useEffect(() => {
    function handleScroll() {
      const heroBottom = heroRef.current?.getBoundingClientRect().bottom ?? 0
      setShowStickyHeader(heroBottom < 0)
      setShowBackToTop(window.scrollY > 600)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    if (!vendor?.firebase_uid) return
    return subscribeFollowState(vendor.firebase_uid, user?.id, setFollowState)
  }, [vendor?.firebase_uid, user?.id])

  if (vendorQuery.isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto animate-spin text-brand-red-500" size={32} />
          <p className="mt-3 text-sm text-neutral-500">Đang tải shop...</p>
        </div>
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

  const toggleFollow = useCallback(async () => {
    if (!vendor) return
    if (!user) {
      navigate("/login", { state: { from: `/shops/${vendor.id}` } })
      return
    }
    if (followLoading) return
    setFollowLoading(true)
    try {
      if (followState.isFollowing) {
        await unfollowUser(user.id, vendor.firebase_uid)
        toast.success("Đã bỏ theo dõi shop")
      } else {
        await followUser(user.id, vendor.firebase_uid)
        toast.success("Đã theo dõi shop")
      }
    } catch (err) {
      toast.error("Không thể thực hiện. Vui lòng thử lại.")
    } finally {
      setFollowLoading(false)
    }
  }, [vendor, user, followState.isFollowing, followLoading, navigate])

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
  const followerCount = followState.followersCount || vendor.follower_count || 0

  return (
    <div className="animate-fade-in bg-neutral-50 pb-16 md:pb-0">
      {/* Sticky mini-header khi scroll */}
      <div
        className={cn(
          "fixed inset-x-0 top-0 z-50 border-b bg-white/95 backdrop-blur-sm transition-all duration-300",
          showStickyHeader
            ? "translate-y-0 opacity-100"
            : "-translate-y-full opacity-0 pointer-events-none"
        )}
      >
        <div className="container-acf flex h-12 items-center gap-3">
          {vendor.shop_logo ? (
            <img src={vendor.shop_logo} alt="" className="h-7 w-7 rounded-full object-cover" />
          ) : (
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-red-100 text-xs font-bold text-brand-red-700">
              {vendor.shop_name[0]?.toUpperCase()}
            </div>
          )}
          <span className="truncate text-sm font-bold text-neutral-900">{vendor.shop_name}</span>
          {isVerified && <ShieldCheck size={14} className="shrink-0 text-brand-gold-500" />}
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={toggleFollow}
              className={cn(
                "rounded-full px-4 py-1.5 text-xs font-bold transition-colors",
                followState.isFollowing
                  ? "bg-neutral-100 text-neutral-600"
                  : "bg-brand-red-500 text-white"
              )}
            >
              {followState.isFollowing ? "Đang theo dõi" : "Theo dõi"}
            </button>
          </div>
        </div>
      </div>

      {/* Hero section */}
      <div ref={heroRef} className="relative">
        {/* Banner */}
        <div className="relative h-36 overflow-hidden sm:h-48 md:h-56 lg:h-64">
          {vendor.shop_banner ? (
            <img
              src={vendor.shop_banner}
              alt={vendor.shop_name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-brand-red-600 via-brand-red-500 to-brand-gold-400" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

          {/* Top-right actions on banner */}
          <div className="absolute right-3 top-3 flex items-center gap-2 sm:right-4 sm:top-4">
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href)
                toast.success("Đã sao chép link shop")
              }}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition-colors hover:bg-black/50"
            >
              <Share2 size={16} />
            </button>
            <button
              onClick={() => navigate("/cart")}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition-colors hover:bg-black/50"
            >
              <ShoppingCart size={16} />
            </button>
          </div>

          {/* Search bar on banner */}
          <div className="absolute left-3 top-3 sm:left-4 sm:top-4">
            <button
              onClick={() => navigate(`/search?shop=${vendor?.id}`)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition-colors hover:bg-black/50"
            >
              <Search size={16} />
            </button>
          </div>
        </div>

        {/* Shop info overlay */}
        <div className="container-acf relative -mt-20 sm:-mt-24 md:-mt-28">
          <div className="flex items-end gap-3 px-1 sm:gap-4">
            {/* Avatar */}
            {vendor.shop_logo ? (
              <img
                src={vendor.shop_logo}
                alt={vendor.shop_name}
                className="h-20 w-20 shrink-0 rounded-full border-[3px] border-white object-cover shadow-lg sm:h-24 sm:w-24 md:h-28 md:w-28 md:border-4"
              />
            ) : (
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-[3px] border-white bg-brand-red-500 text-2xl font-extrabold text-white shadow-lg sm:h-24 sm:w-24 sm:text-3xl md:h-28 md:w-28 md:border-4 md:text-4xl">
                {vendor.shop_name[0]?.toUpperCase() ?? "?"}
              </div>
            )}

            {/* Name + stats in hero */}
            <div className="mb-1 min-w-0 flex-1 sm:mb-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-xl font-extrabold text-white drop-shadow-sm sm:text-2xl md:text-3xl">
                  {vendor.shop_name}
                </h1>
                <ChevronRight size={18} className="text-white/70" />
              </div>
              <div className="mt-1 flex items-center gap-3 text-xs text-white/90 sm:gap-4 sm:text-sm">
                <span className="font-semibold">
                  {followerCount.toLocaleString("vi-VN")}{" "}
                  <span className="font-normal opacity-80">Người theo dõi</span>
                </span>
                <span className="text-white/50">|</span>
                <span className="font-semibold">
                  {productsQuery.isLoading ? "..." : productCards.length}{" "}
                  <span className="font-normal opacity-80">Sản phẩm</span>
                </span>
              </div>
            </div>

            {/* Follow button in hero (desktop) */}
            <div className="mb-2 hidden shrink-0 md:block">
              <button
                onClick={toggleFollow}
                className={cn(
                  "rounded-full px-6 py-2 text-sm font-bold transition-all",
                  followState.isFollowing
                    ? "border-2 border-white/50 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
                    : "bg-brand-red-500 text-white shadow-lg hover:bg-brand-red-600"
                )}
              >
                {followState.isFollowing ? "Đang theo dõi" : "Theo dõi"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Shop info card */}
      <div className="container-acf mt-3">
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          {/* Badges + cert */}
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold",
                cert.tone
              )}
            >
              <ShieldCheck size={12} />
              {cert.label}
            </span>
            {rating > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-gold-50 px-2.5 py-1 text-xs font-bold text-brand-gold-700">
                <Star size={12} className="fill-brand-gold-400 text-brand-gold-400" />
                {rating.toFixed(1)}
              </span>
            )}
            {onTimeRate >= 90 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                <Clock size={12} />
                Giao đúng hạn {onTimeRate}%
              </span>
            )}
            {vendor.total_orders > 100 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-red-50 px-2.5 py-1 text-xs font-bold text-brand-red-700">
                <TrendingUp size={12} />
                Bán chạy
              </span>
            )}
          </div>

          {/* Stats row */}
          <div className="mt-3 grid grid-cols-3 divide-x divide-neutral-100 text-center">
            <div className="px-2">
              <div className="text-base font-bold text-neutral-900 sm:text-lg">
                {vendor.total_orders.toLocaleString("vi-VN")}
              </div>
              <div className="text-[10px] text-neutral-500 sm:text-xs">Đã bán</div>
            </div>
            <div className="px-2">
              <div className="text-base font-bold text-neutral-900 sm:text-lg">
                {rating > 0 ? rating.toFixed(1) : "—"}
              </div>
              <div className="text-[10px] text-neutral-500 sm:text-xs">Đánh giá</div>
            </div>
            <div className="px-2">
              <div className="text-base font-bold text-neutral-900 sm:text-lg">
                {joinedAt.toLocaleDateString("vi-VN", { month: "short", year: "numeric" })}
              </div>
              <div className="text-[10px] text-neutral-500 sm:text-xs">Tham gia</div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={toggleFollow}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-full py-2.5 text-sm font-bold transition-all md:hidden",
                followState.isFollowing
                  ? "border border-neutral-200 bg-neutral-50 text-neutral-700"
                  : "bg-brand-red-500 text-white shadow-sm"
              )}
            >
              <Heart size={14} fill={followState.isFollowing ? "currentColor" : "none"} />
              {followState.isFollowing ? "Đang theo dõi" : "Theo dõi"}
            </button>
            <button
              onClick={openShopChat}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-neutral-200 bg-white py-2.5 text-sm font-bold text-neutral-700 transition-colors hover:bg-neutral-50"
            >
              <MessageSquare size={14} />
              Chat
            </button>
          </div>
        </div>
      </div>

      {/* Voucher banner */}
      <div className="container-acf mt-3">
        <div className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 px-4 py-3">
          <Gift size={20} className="shrink-0 text-emerald-600" />
          <div className="min-w-0 flex-1">
            <div className="text-sm font-bold text-emerald-800">Voucher vận chuyển</div>
            <div className="text-xs text-emerald-600">Giảm phí vận chuyển cho đơn hàng đầu tiên</div>
          </div>
          <button className="shrink-0 rounded-full bg-brand-red-500 px-4 py-1.5 text-xs font-bold text-white transition-colors hover:bg-brand-red-600">
            Nhận
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="container-acf mt-3">
        <div className="rounded-xl bg-white shadow-sm">
          <div className="flex border-b border-neutral-100">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "relative flex flex-1 items-center justify-center gap-1.5 py-3 text-sm font-semibold transition-colors",
                  tab === t.id
                    ? "text-brand-red-600"
                    : "text-neutral-500 hover:text-neutral-700"
                )}
              >
                {t.label}
                {t.id === "products" && !productsQuery.isLoading && (
                  <span className="text-xs opacity-60">({productCards.length})</span>
                )}
                {tab === t.id && (
                  <span className="absolute bottom-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-brand-red-500" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div className="container-acf mt-3">
        {/* HOME TAB */}
        {tab === "home" && (
          <div className="space-y-4">
            {/* "San pham hang dau" section */}
            {bestSellers.length > 0 && (
              <section className="rounded-xl bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-neutral-900">
                    San phẩm hàng đầu
                  </h2>
                  <button
                    onClick={() => {
                      setTab("products")
                      setSortBy("best_selling")
                    }}
                    className="flex items-center gap-0.5 text-xs font-semibold text-brand-red-600 transition-colors hover:text-brand-red-700"
                  >
                    Xem thêm <ChevronRight size={14} />
                  </button>
                </div>
                <div className="mt-3">
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide md:grid md:grid-cols-4 md:overflow-visible">
                    {bestSellers.map((p, i) => (
                      <div
                        key={p.id}
                        className="relative w-36 shrink-0 md:w-auto"
                      >
                        {i < 3 && (
                          <span className="absolute left-2 top-2 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-brand-red-500 text-[10px] font-bold text-white shadow-sm">
                            {i + 1}
                          </span>
                        )}
                        <ProductCard product={p} variant="compact" />
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* "Moi ra" section */}
            {newArrivals.length > 0 && (
              <section className="rounded-xl bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-neutral-900">
                    Mới ra
                  </h2>
                  <button
                    onClick={() => {
                      setTab("products")
                      setSortBy("newest")
                    }}
                    className="flex items-center gap-0.5 text-xs font-semibold text-brand-red-600 transition-colors hover:text-brand-red-700"
                  >
                    Xem thêm <ChevronRight size={14} />
                  </button>
                </div>
                <div className="mt-3">
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide md:grid md:grid-cols-4 md:overflow-visible">
                    {newArrivals.map((p) => (
                      <div key={p.id} className="w-36 shrink-0 md:w-auto">
                        <ProductCard product={p} variant="compact" />
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Highlights / trust signals */}
            <section className="rounded-xl bg-white p-4 shadow-sm">
              <h2 className="text-base font-bold text-neutral-900">Cam kết của Shop</h2>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <TrustBadge
                  icon={ShieldCheck}
                  label="Cam kết chính hãng"
                  desc="100% sản phẩm xác thực"
                  color="text-emerald-600 bg-emerald-50"
                />
                {isVerified && (
                  <TrustBadge
                    icon={Award}
                    label="Đã xác minh ACF"
                    desc="Quỹ Chống Hàng Giả"
                    color="text-brand-gold-600 bg-brand-gold-50"
                  />
                )}
                {onTimeRate >= 90 && (
                  <TrustBadge
                    icon={Clock}
                    label={`Đúng hạn ${onTimeRate}%`}
                    desc="Giao hàng nhanh chóng"
                    color="text-blue-600 bg-blue-50"
                  />
                )}
                {vendor.total_orders > 0 && (
                  <TrustBadge
                    icon={TrendingUp}
                    label={`${vendor.total_orders.toLocaleString("vi-VN")} đơn`}
                    desc="Đã bán thành công"
                    color="text-brand-red-600 bg-brand-red-50"
                  />
                )}
              </div>
            </section>

            {/* About mini */}
            <section className="rounded-xl bg-white p-4 shadow-sm">
              <h2 className="text-base font-bold text-neutral-900">Giới thiệu</h2>
              <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-neutral-600">
                {vendor.description ||
                  `${vendor.shop_name} cam kết cung cấp sản phẩm chính hãng có xác thực bởi Quỹ Chống Hàng Giả Việt Nam.`}
              </p>
              <div className="mt-3 flex items-center gap-2 text-xs text-neutral-500">
                <MapPin size={12} />
                <span>
                  {vendor.pickup_address.district}, {vendor.pickup_address.city}
                </span>
              </div>
            </section>

            {productsQuery.isLoading && <ProductGridSkeleton count={4} />}
            {!productsQuery.isLoading && productCards.length === 0 && (
              <EmptyProducts />
            )}
          </div>
        )}

        {/* PRODUCTS TAB */}
        {tab === "products" && (
          <div>
            {/* Sort + view controls */}
            <div className="rounded-xl bg-white p-3 shadow-sm">
              <div className="flex items-center gap-2">
                <Filter size={14} className="shrink-0 text-neutral-400" />
                <div className="flex flex-1 gap-1 overflow-x-auto scrollbar-hide">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setSortBy(opt.value)}
                      className={cn(
                        "whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                        sortBy === opt.value
                          ? "bg-brand-red-500 text-white"
                          : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <div className="flex shrink-0 items-center gap-1 border-l border-neutral-100 pl-2">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={cn(
                      "rounded-md p-1.5 transition-colors",
                      viewMode === "grid" ? "bg-brand-red-50 text-brand-red-500" : "text-neutral-400 hover:text-neutral-600"
                    )}
                  >
                    <LayoutGrid size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={cn(
                      "rounded-md p-1.5 transition-colors",
                      viewMode === "list" ? "bg-brand-red-50 text-brand-red-500" : "text-neutral-400 hover:text-neutral-600"
                    )}
                  >
                    <List size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Product grid/list */}
            <div className="mt-3">
              {productsQuery.isLoading ? (
                <ProductGridSkeleton count={8} />
              ) : sortedProducts.length === 0 ? (
                <EmptyProducts />
              ) : viewMode === "grid" ? (
                <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 lg:grid-cols-4">
                  {sortedProducts.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {sortedProducts.map((p) => (
                    <ProductListItem key={p.id} product={p} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* REVIEWS TAB */}
        {tab === "reviews" && (
          <div className="rounded-xl bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-gold-50">
              <Star size={28} className="text-brand-gold-400" />
            </div>
            <h3 className="mt-4 text-base font-bold text-neutral-900">Chưa có đánh giá</h3>
            <p className="mt-2 text-sm text-neutral-500">
              Đánh giá từ khách mua sẽ hiển thị tại đây.
            </p>
          </div>
        )}
      </div>

      {/* Back to top */}
      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-20 right-4 z-40 flex h-10 w-10 items-center justify-center rounded-full bg-white text-neutral-600 shadow-lg transition-all hover:bg-neutral-50 md:bottom-6"
        >
          <ArrowUp size={18} />
        </button>
      )}
    </div>
  )
}

function TrustBadge({
  icon: Icon,
  label,
  desc,
  color,
}: {
  icon: typeof Award
  label: string
  desc: string
  color: string
}) {
  return (
    <div className="rounded-xl border border-neutral-100 p-3 transition-shadow hover:shadow-sm">
      <div className={cn("mb-2 inline-flex rounded-lg p-2", color)}>
        <Icon size={16} />
      </div>
      <div className="text-xs font-bold text-neutral-800">{label}</div>
      <div className="mt-0.5 text-[10px] text-neutral-500">{desc}</div>
    </div>
  )
}

function EmptyProducts() {
  return (
    <div className="rounded-xl bg-white p-12 text-center shadow-sm">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
        <Package size={28} className="text-neutral-300" />
      </div>
      <h3 className="mt-4 text-base font-bold text-neutral-900">Shop chưa có sản phẩm</h3>
      <p className="mt-2 text-sm text-neutral-500">
        Bấm "Theo dõi" để nhận thông báo khi shop có sản phẩm mới.
      </p>
    </div>
  )
}

function ProductListItem({ product }: { product: ProductCardProduct }) {
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0
  const firstImage = product.images?.[0] || "https://placehold.co/400x400/cccccc/999999?text=No+Image"

  return (
    <Link
      to={`/products/${product.handle}`}
      className="group flex gap-3 rounded-xl bg-white p-3 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-lg bg-neutral-100 sm:h-32 sm:w-32">
        <img
          src={firstImage}
          alt={product.title}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
          loading="lazy"
        />
        {discount > 0 && (
          <span className="absolute left-1.5 top-1.5 rounded bg-brand-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
            -{discount}%
          </span>
        )}
        {product.verified && (
          <span className="absolute right-1.5 top-1.5 flex items-center gap-0.5 rounded bg-brand-gold-500 px-1 py-0.5 text-[10px] font-bold text-white">
            <ShieldCheck size={10} />
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
        <div>
          <h3 className="line-clamp-2 text-sm font-medium text-neutral-900 group-hover:text-brand-red-600">
            {product.title}
          </h3>
          <div className="mt-1.5 flex items-center gap-2">
            {product.rating > 0 && (
              <span className="flex items-center gap-0.5 text-xs text-neutral-500">
                <Star size={10} className="fill-brand-gold-400 text-brand-gold-400" />
                {product.rating}
              </span>
            )}
            {(product.sold ?? 0) > 0 && (
              <span className="text-xs text-neutral-400">
                Đã bán {product.sold?.toLocaleString("vi-VN")}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <span className="text-base font-bold text-brand-red-600">
              {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="ml-1.5 text-xs text-neutral-400 line-through">
                {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(product.originalPrice)}
              </span>
            )}
          </div>
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-brand-red-200 text-brand-red-500 transition-colors hover:bg-brand-red-50"
          >
            <ShoppingCart size={14} />
          </button>
        </div>
      </div>
    </Link>
  )
}
