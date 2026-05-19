import { useEffect, useRef, useState } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { doc, getDoc } from "firebase/firestore"
import {
  Star,
  Loader2,
  UserCircle,
  MessageCircle,
  UserPlus,
  UserCheck,
  Share2,
  ChevronRight,
  Search,
  ShoppingCart,
  ShieldCheck,
  Gift,
  LayoutGrid,
  List,
  ArrowUp,
} from "lucide-react"
import toast from "react-hot-toast"
import { firestore } from "../../../lib/firebase"
import { useFirebaseAuthReady } from "../../../hooks/use-firebase-auth-ready"
import {
  listUserPublicReviews,
  type ReviewDoc,
} from "../../../lib/review-service"
import { cn } from "../../../lib/cn"
import { sanitizeUserError } from "../../../lib/error-utils"
import { useAuthStore } from "../../../stores/auth-store"
import {
  followUser,
  unfollowUser,
  subscribeFollowState,
  type FollowState,
} from "../../../lib/follow-service"
import {
  listPublicShowcaseLinks,
  type AffiliateLink,
} from "../../../lib/affiliate-service"
import { unwrapServiceResult } from "../../../lib/service-result"
import { formatCurrency } from "../../../lib/format"
import { getApprovedProductByHandle } from "../../../lib/product-service"
import { getShopProfile } from "../../../lib/shop-profile-service"
import { getVendorByFirebaseUid } from "../../../lib/vendor-service"

type ProfileTab = "home" | "products" | "reviews"
type ProductSort = "recommended" | "best_selling" | "newest" | "price_asc" | "price_desc"

interface PublicUser {
  id: string
  name: string
  avatar?: string
  bio?: string
  joinedAt?: Date
  tier?: string
  bannerUrl?: string
  totalSold?: number
}

async function resolveProductImages(links: AffiliateLink[]): Promise<AffiliateLink[]> {
  const needsImage = links.filter(
    (l) => !l.product_image && l.target_type === "product",
  )
  if (needsImage.length === 0) return links

  const imageMap = new Map<string, string>()

  const fetches = needsImage.map(async (l) => {
    try {
      if (l.target_id) {
        const snap = await getDoc(doc(firestore, "products", l.target_id))
        if (snap.exists()) {
          const d = snap.data() as Record<string, any>
          const img = d.thumbnail || (d.images as string[])?.[0]
          if (img) { imageMap.set(l.id, img); return }
        }
      }
      const match = l.target_url.match(/\/products\/([^/?#]+)/)
      if (match) {
        const product = await getApprovedProductByHandle(match[1])
        if (product) {
          const img = product.thumbnail || product.images[0]
          if (img) imageMap.set(l.id, img)
        }
      }
    } catch { /* skip unresolvable */ }
  })
  await Promise.all(fetches)

  if (imageMap.size === 0) return links
  return links.map((l) =>
    imageMap.has(l.id) ? { ...l, product_image: imageMap.get(l.id)! } : l,
  )
}

function formatCompactNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toString()
}

function StarRow({ rating, size = 12 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          className={cn(
            n <= Math.round(rating)
              ? "fill-amber-400 text-amber-400"
              : "text-neutral-300"
          )}
        />
      ))}
    </div>
  )
}

function affiliateUrl(link: AffiliateLink): string {
  return `${window.location.origin}/aff/${link.short_code}`
}

const SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: "recommended", label: "Đề xuất" },
  { value: "best_selling", label: "Bán chạy" },
  { value: "newest", label: "Mới nhất" },
  { value: "price_asc", label: "Giá thấp" },
  { value: "price_desc", label: "Giá cao" },
]

function sortLinks(links: AffiliateLink[], key: ProductSort): AffiliateLink[] {
  const sorted = [...links]
  switch (key) {
    case "best_selling":
      return sorted.sort((a, b) => b.clicks - a.clicks)
    case "newest":
      return sorted.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
    case "price_asc":
      return sorted.sort(
        (a, b) => (a.product_price ?? 0) - (b.product_price ?? 0)
      )
    case "price_desc":
      return sorted.sort(
        (a, b) => (b.product_price ?? 0) - (a.product_price ?? 0)
      )
    case "recommended":
    default:
      return sorted
  }
}

function extractDisplayTitle(link: AffiliateLink): string {
  if (link.title && link.title !== link.target_url) return link.title
  try {
    const url = new URL(link.target_url)
    const segments = url.pathname.split("/").filter(Boolean)
    if (segments.length > 0) {
      return decodeURIComponent(segments[segments.length - 1])
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase())
    }
    return url.hostname
  } catch {
    return link.target_url.slice(0, 60)
  }
}

export default function PublicProfileScreen() {
  const { userId } = useParams<{ userId: string }>()
  const navigate = useNavigate()
  const authReady = useFirebaseAuthReady()
  const currentUser = useAuthStore((s) => s.user)

  const [profile, setProfile] = useState<PublicUser | null>(null)
  const [reviews, setReviews] = useState<ReviewDoc[]>([])
  const [links, setLinks] = useState<AffiliateLink[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<ProfileTab>("home")
  const [productSort, setProductSort] = useState<ProductSort>("recommended")
  const [priceDir, setPriceDir] = useState<"asc" | "desc">("asc")
  const [searchQuery, setSearchQuery] = useState("")
  const [showSearch, setShowSearch] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showStickyHeader, setShowStickyHeader] = useState(false)
  const [showBackToTop, setShowBackToTop] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)

  const [followState, setFollowState] = useState<FollowState>({
    followersCount: 0,
    followingCount: 0,
    isFollowing: false,
    followsMe: false,
    isMutual: false,
  })
  const [followLoading, setFollowLoading] = useState(false)

  useEffect(() => {
    if (!authReady || !userId) return
    let cancelled = false
    setLoading(true)
    setError(null)
    ;(async () => {
      try {
        const [userSnap, shopProfile] = await Promise.all([
          getDoc(doc(firestore, "users", userId)),
          getShopProfile(userId).catch(() => null),
        ])
        // Add fallback to fetch from vendors collection if user doc is missing shop_logo/shop_banner and current user is admin/moderator
        let vendorData = null;
        if (
          (!data.shop_logo || !data.shop_banner) &&
          currentUser &&
          (currentUser.role === 'admin' || currentUser.role === 'moderator')
        ) {
          try {
            vendorData = await getVendorByFirebaseUid(userId);
          } catch (err) {
            console.error("[PublicProfile] Failed to fetch vendor data:", err);
          }
        }
        if (cancelled) return
        if (!userSnap.exists()) {
          setError("Người dùng này không tồn tại hoặc đã ẩn hồ sơ.")
          setLoading(false)
          return
        }
        const data = userSnap.data() as Record<string, any>
        setProfile({
          id: userSnap.id,
          name: data.shop_name ?? shopProfile?.shopName ?? data.name ?? data.displayName ?? "Khách hàng ACFMart",
          avatar: data.shop_logo ?? vendorData?.shop_logo ?? shopProfile?.logoUrl ?? data.avatar ?? data.photoURL,
          bio: data.bio ?? undefined,
          joinedAt: data.created_at?.toDate?.() ?? undefined,
          tier: data.tier,
          bannerUrl: data.shop_banner ?? vendorData?.shop_banner ?? shopProfile?.bannerUrl ?? data.bannerUrl ?? data.banner_url ?? undefined,
          totalSold: data.total_sold ?? 0,
        })
        setLoading(false)

        const [reviewResult, linksResult] = await Promise.allSettled([
          listUserPublicReviews({ userId, limitCount: 50 }),
          listPublicShowcaseLinks(userId, 100),
        ])
        if (cancelled) return
        if (reviewResult.status === "fulfilled") setReviews(reviewResult.value)
        if (linksResult.status === "fulfilled") {
          try {
            const linkData = unwrapServiceResult(linksResult.value)
            const enriched = await resolveProductImages(linkData.links)
            if (!cancelled) setLinks(enriched)
          } catch {
            setLinks([])
          }
        }
      } catch (err) {
        if (cancelled) return
        console.error("[PublicProfile] load failed:", err)
        setError(sanitizeUserError(err, "Không tải được trang cá nhân."))
        setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [authReady, userId])

  useEffect(() => {
    if (!userId) return
    try {
      return subscribeFollowState(userId, currentUser?.id, setFollowState)
    } catch {
      // Silently ignore if follow state can't be loaded
    }
  }, [userId, currentUser?.id])

  useEffect(() => {
    function handleScroll() {
      const heroBottom = heroRef.current?.getBoundingClientRect().bottom ?? 0
      setShowStickyHeader(heroBottom < 0)
      setShowBackToTop(window.scrollY > 600)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleFollow = async () => {
    if (!currentUser) {
      navigate("/login/store")
      return
    }
    if (!userId || followLoading) return
    setFollowLoading(true)
    try {
      if (followState.isFollowing) {
        await unfollowUser(currentUser.id, userId)
      } else {
        await followUser(currentUser.id, userId)
      }
    } catch (err: any) {
      toast.error(err?.message ?? "Có lỗi xảy ra")
    } finally {
      setFollowLoading(false)
    }
  }

  const handleShare = async () => {
    const url = window.location.href
    try {
      if (navigator.share) {
        await navigator.share({ title: profile?.name ?? "ACFMart", url })
      } else {
        await navigator.clipboard.writeText(url)
        toast.success("Đã sao chép liên kết")
      }
    } catch {}
  }

  const handleMessage = () => {
    if (!currentUser) {
      navigate("/login/store")
      return
    }
    navigate(`/account/messages?to=${userId}`)
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto animate-spin text-brand-red-500" size={32} />
          <p className="mt-3 text-sm text-neutral-500">Đang tải trang trưng bày...</p>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
        <UserCircle className="text-neutral-300" size={56} />
        <h1 className="mt-4 text-xl font-bold text-neutral-900">
          Không tìm thấy người dùng
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          {error ?? "Trang cá nhân không tồn tại hoặc đã bị ẩn."}
        </p>
        <Link to="/" className="btn-primary mt-5 inline-flex">
          Về trang chủ
        </Link>
      </div>
    )
  }

  const ratingCount = reviews.length
  const avgRating =
    ratingCount === 0
      ? 0
      : reviews.reduce((sum, r) => sum + r.rating, 0) / ratingCount
  const totalClicks = links.reduce((sum, l) => sum + l.clicks, 0)
  const isSelf = currentUser?.id === profile.id

  const filteredLinks = searchQuery
    ? links.filter((l) =>
        extractDisplayTitle(l).toLowerCase().includes(searchQuery.toLowerCase())
      )
    : links
  const sortedLinks = sortLinks(
    filteredLinks,
    productSort === "price_asc" && priceDir === "desc" ? "price_desc" : productSort
  )

  const topProducts = [...links].sort((a, b) => b.clicks - a.clicks).slice(0, 8)
  const newProducts = [...links]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, 8)

  return (
    <div className="min-h-screen bg-neutral-50 pb-16 md:pb-0">
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
          {profile.avatar ? (
            <img src={profile.avatar} alt="" className="h-7 w-7 rounded-full object-cover" />
          ) : (
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-100 text-neutral-300">
              <UserCircle size={18} />
            </div>
          )}
          <span className="truncate text-sm font-bold text-neutral-900">{profile.name}</span>
          {profile.tier && <ShieldCheck size={14} className="shrink-0 text-brand-gold-500" />}
          <div className="ml-auto flex items-center gap-2">
            {!isSelf && (
              <button
                onClick={handleFollow}
                disabled={followLoading}
                className={cn(
                  "rounded-full px-4 py-1.5 text-xs font-bold transition-colors",
                  followState.isFollowing
                    ? "bg-neutral-100 text-neutral-600"
                    : "bg-brand-red-500 text-white"
                )}
              >
                {followState.isFollowing ? "Đang theo dõi" : "Theo dõi"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Hero section */}
      <div ref={heroRef} className="relative">
        {/* Banner */}
        <div className="relative h-36 overflow-hidden sm:h-44 md:h-52 lg:h-60">
          {profile.bannerUrl ? (
            <img
              src={profile.bannerUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-brand-red-600 via-brand-red-500 to-brand-gold-400" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

          {/* Banner overlay controls */}
          <div className="absolute left-0 right-0 top-0 flex items-center justify-between px-4 pt-3">
            {showSearch ? (
              <div className="flex flex-1 items-center gap-2">
                <div className="flex flex-1 items-center rounded-full bg-white/90 px-3 py-1.5 backdrop-blur-sm">
                  <Search size={14} className="mr-2 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Tìm sản phẩm..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent text-sm text-neutral-900 outline-none placeholder:text-neutral-400"
                    autoFocus
                  />
                </div>
                <button
                  onClick={() => {
                    setShowSearch(false)
                    setSearchQuery("")
                  }}
                  className="text-xs font-medium text-white"
                >
                  Huỷ
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setShowSearch(true)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-black/25 text-white backdrop-blur-sm transition hover:bg-black/40"
                >
                  <Search size={16} />
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={handleShare}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-black/25 text-white backdrop-blur-sm transition hover:bg-black/40"
                  >
                    <Share2 size={16} />
                  </button>
                  <Link
                    to="/cart"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-black/25 text-white backdrop-blur-sm transition hover:bg-black/40"
                  >
                    <ShoppingCart size={16} />
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Profile info overlapping banner */}
        <div className="container-acf relative -mt-16 sm:-mt-20">
          <div className="flex items-end gap-3 sm:gap-4">
            {/* Avatar */}
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full border-[3px] border-white bg-white shadow-lg sm:h-24 sm:w-24 md:h-28 md:w-28 md:border-4">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-neutral-100 text-neutral-300">
                  <UserCircle size={44} />
                </div>
              )}
            </div>

            {/* Name + follower info on banner overlay */}
            <div className="mb-1 min-w-0 flex-1 sm:mb-2">
              <div className="flex items-center gap-1.5">
                <h1 className="truncate text-lg font-extrabold text-white drop-shadow-sm sm:text-xl md:text-2xl">
                  {profile.name}
                </h1>
                <ChevronRight size={16} className="shrink-0 text-white/70" />
              </div>
              <div className="mt-0.5 flex items-center gap-3 text-xs text-white/90 sm:text-sm">
                <span className="font-semibold">
                  {formatCompactNumber(followState.followersCount)}{" "}
                  <span className="font-normal opacity-80">Người theo dõi</span>
                </span>
                <span className="text-white/40">|</span>
                <span className="font-semibold">
                  {links.length}{" "}
                  <span className="font-normal opacity-80">Sản phẩm</span>
                </span>
              </div>
            </div>

            {/* Follow button (desktop only, in banner) */}
            {!isSelf && (
              <div className="mb-2 hidden shrink-0 md:block">
                <button
                  onClick={handleFollow}
                  disabled={followLoading}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-6 py-2.5 text-sm font-bold transition-all",
                    followState.isFollowing
                      ? "border-2 border-white/40 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
                      : "bg-brand-red-500 text-white shadow-lg hover:bg-brand-red-600"
                  )}
                >
                  {followState.isFollowing ? (
                    <>
                      <UserCheck size={16} /> Đang theo dõi
                    </>
                  ) : (
                    <>
                      <UserPlus size={16} /> Theo dõi
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile card */}
      <div className="container-acf mt-3">
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          {/* Badges row */}
          <div className="flex flex-wrap items-center gap-2">
            {profile.tier && (
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-gold-50 px-2.5 py-1 text-xs font-bold text-brand-gold-700">
                <ShieldCheck size={12} />
                {profile.tier.charAt(0).toUpperCase() + profile.tier.slice(1)}
              </span>
            )}
            {avgRating > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
                <Star size={12} className="fill-amber-400 text-amber-400" />
                {avgRating.toFixed(1)}
              </span>
            )}
            {totalClicks + (profile.totalSold ?? 0) > 50 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-red-50 px-2.5 py-1 text-xs font-bold text-brand-red-700">
                <ShoppingCart size={12} />
                Bán chạy
              </span>
            )}
          </div>

          {/* Stats row */}
          <div className="mt-3 grid grid-cols-3 divide-x divide-neutral-100 text-center">
            <div className="px-2">
              <div className="text-base font-bold text-neutral-900 sm:text-lg">
                {formatCompactNumber(totalClicks + (profile.totalSold ?? 0))}
              </div>
              <div className="text-[10px] text-neutral-500 sm:text-xs">Đã bán</div>
            </div>
            <div className="px-2">
              <div className="text-base font-bold text-neutral-900 sm:text-lg">
                {avgRating > 0 ? avgRating.toFixed(1) : "—"}
              </div>
              <div className="text-[10px] text-neutral-500 sm:text-xs">Đánh giá</div>
            </div>
            <div className="px-2">
              <div className="text-base font-bold text-neutral-900 sm:text-lg">
                {formatCompactNumber(followState.followersCount)}
              </div>
              <div className="text-[10px] text-neutral-500 sm:text-xs">Theo dõi</div>
            </div>
          </div>

          {/* Bio */}
          {profile.bio && (
            <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-neutral-500">
              {profile.bio}
            </p>
          )}

          {/* Action buttons (mobile) */}
          {!isSelf && (
            <div className="mt-3 flex items-center gap-2 md:hidden">
              <button
                onClick={handleFollow}
                disabled={followLoading}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 rounded-full py-2.5 text-sm font-bold transition-all",
                  followState.isFollowing
                    ? "border border-neutral-200 bg-neutral-50 text-neutral-700"
                    : "bg-brand-red-500 text-white shadow-sm"
                )}
              >
                {followState.isFollowing ? (
                  <>
                    <UserCheck size={14} /> Đang theo dõi
                  </>
                ) : (
                  <>
                    <UserPlus size={14} /> Theo dõi
                  </>
                )}
              </button>
              <button
                onClick={handleMessage}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-neutral-200 bg-white py-2.5 text-sm font-bold text-neutral-700 transition-colors hover:bg-neutral-50"
              >
                <MessageCircle size={14} /> Tin nhắn
              </button>
            </div>
          )}

          {/* Desktop action buttons */}
          {!isSelf && (
            <div className="mt-3 hidden md:block">
              <button
                onClick={handleMessage}
                className="flex items-center justify-center gap-1.5 rounded-full border border-neutral-200 bg-white px-6 py-2.5 text-sm font-bold text-neutral-700 transition-colors hover:bg-neutral-50"
              >
                <MessageCircle size={14} /> Nhắn tin
              </button>
            </div>
          )}
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

      {/* Tab bar */}
      <div className="container-acf mt-3">
        <div className="rounded-xl bg-white shadow-sm">
          <div className="flex border-b border-neutral-100">
            {(
              [
                { key: "home", label: "Trang chủ" },
                { key: "products", label: "Sản phẩm" },
                { key: "reviews", label: "Đánh giá" },
              ] as const
            ).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={cn(
                  "relative flex-1 py-3 text-center text-sm font-semibold transition-colors",
                  tab === key
                    ? "text-brand-red-600"
                    : "text-neutral-500 hover:text-neutral-700"
                )}
              >
                {label}
                {key === "reviews" && ratingCount > 0 && (
                  <span className="ml-1 text-xs opacity-60">({ratingCount})</span>
                )}
                {key === "products" && links.length > 0 && (
                  <span className="ml-1 text-xs opacity-60">({links.length})</span>
                )}
                {tab === key && (
                  <span className="absolute bottom-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-brand-red-500" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div className="container-acf mt-3">
        {tab === "home" && (
          <HomeTab
            links={links}
            topProducts={topProducts}
            newProducts={newProducts}
            profileName={profile.name}
            onViewAll={() => setTab("products")}
          />
        )}
        {tab === "products" && (
          <ProductsTab
            links={sortedLinks}
            sort={productSort}
            priceDir={priceDir}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onSortChange={(s) => {
              if (s === "price_asc") {
                if (productSort === "price_asc") {
                  setPriceDir((d) => (d === "asc" ? "desc" : "asc"))
                } else {
                  setProductSort(s)
                  setPriceDir("asc")
                }
              } else {
                setProductSort(s)
              }
            }}
            searchQuery={searchQuery}
          />
        )}
        {tab === "reviews" && (
          <ReviewsTab
            reviews={reviews}
            avgRating={avgRating}
            profileName={profile.name}
          />
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

/* ================================================================
   HOME TAB
   ================================================================ */
function HomeTab({
  links,
  topProducts,
  newProducts,
  profileName,
  onViewAll,
}: {
  links: AffiliateLink[]
  topProducts: AffiliateLink[]
  newProducts: AffiliateLink[]
  profileName: string
  onViewAll: () => void
}) {
  if (links.length === 0) {
    return (
      <div className="rounded-xl bg-white p-12 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
          <ShoppingCart size={28} className="text-neutral-300" />
        </div>
        <h3 className="mt-4 text-base font-bold text-neutral-900">
          Chưa có sản phẩm trưng bày
        </h3>
        <p className="mt-2 text-sm text-neutral-500">
          Khi {profileName.split(" ").slice(-1)} chia sẻ sản phẩm, chúng sẽ hiện ở đây.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Top products */}
      {topProducts.length > 0 && (
        <section className="rounded-xl bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-neutral-900">Sản phẩm hàng đầu</h2>
            <button
              onClick={onViewAll}
              className="flex items-center gap-0.5 text-xs font-semibold text-brand-red-600 transition-colors hover:text-brand-red-700"
            >
              Xem thêm <ChevronRight size={14} />
            </button>
          </div>
          <div className="mt-3 flex gap-3 overflow-x-auto pb-2 scrollbar-hide md:grid md:grid-cols-4 md:overflow-visible">
            {topProducts.map((link, idx) => (
              <div key={link.id} className="relative w-36 shrink-0 sm:w-40 md:w-auto">
                <TopProductCard link={link} rank={idx + 1} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* New products */}
      {newProducts.length > 0 && (
        <section className="rounded-xl bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-neutral-900">Mới ra</h2>
            <button
              onClick={onViewAll}
              className="flex items-center gap-0.5 text-xs font-semibold text-brand-red-600 transition-colors hover:text-brand-red-700"
            >
              Xem thêm <ChevronRight size={14} />
            </button>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4">
            {newProducts.map((link) => (
              <ProductCardCompact key={link.id} link={link} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

/* ================================================================
   PRODUCTS TAB
   ================================================================ */
function ProductsTab({
  links,
  sort,
  priceDir,
  viewMode,
  onViewModeChange,
  onSortChange,
  searchQuery,
}: {
  links: AffiliateLink[]
  sort: ProductSort
  priceDir: "asc" | "desc"
  viewMode: "grid" | "list"
  onViewModeChange: (m: "grid" | "list") => void
  onSortChange: (s: ProductSort) => void
  searchQuery: string
}) {
  return (
    <div>
      {/* Sort + view controls */}
      <div className="rounded-xl bg-white p-3 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="flex flex-1 gap-1 overflow-x-auto scrollbar-hide">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onSortChange(opt.value)}
                className={cn(
                  "whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                  sort === opt.value
                    ? "bg-brand-red-500 text-white"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                )}
              >
                {opt.label}
                {opt.value === "price_asc" && sort === "price_asc" && (
                  <span className="ml-0.5">{priceDir === "asc" ? "↑" : "↓"}</span>
                )}
              </button>
            ))}
          </div>
          <div className="flex shrink-0 items-center gap-1 border-l border-neutral-100 pl-2">
            <button
              onClick={() => onViewModeChange("grid")}
              className={cn(
                "rounded-md p-1.5 transition-colors",
                viewMode === "grid" ? "bg-brand-red-50 text-brand-red-500" : "text-neutral-400 hover:text-neutral-600"
              )}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => onViewModeChange("list")}
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

      {/* Product grid / list */}
      <div className="mt-3">
        {links.length === 0 ? (
          <div className="rounded-xl bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
              <Search size={28} className="text-neutral-300" />
            </div>
            <p className="mt-4 text-sm font-semibold text-neutral-700">
              {searchQuery
                ? `Không tìm thấy sản phẩm nào cho "${searchQuery}"`
                : "Chưa có sản phẩm nào"}
            </p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 lg:grid-cols-4">
            {links.map((link) => (
              <ProductCardCompact key={link.id} link={link} showBadges />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {links.map((link) => (
              <ProductCardList key={link.id} link={link} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* ================================================================
   REVIEWS TAB
   ================================================================ */
function ReviewsTab({
  reviews,
  avgRating,
  profileName,
}: {
  reviews: ReviewDoc[]
  avgRating: number
  profileName: string
}) {
  if (reviews.length === 0) {
    return (
      <div className="rounded-xl bg-white p-12 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-50">
          <Star size={28} className="text-amber-300" />
        </div>
        <h3 className="mt-4 text-base font-bold text-neutral-900">
          Chưa có đánh giá nào
        </h3>
        <p className="mt-2 text-sm text-neutral-500">
          Khi {profileName.split(" ").slice(-1)} chia sẻ đánh giá công khai, chúng sẽ hiện ở đây.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Rating summary */}
      <div className="rounded-xl bg-white p-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-neutral-900">
              {avgRating.toFixed(1)}
            </p>
            <p className="text-xs text-neutral-400">/5</p>
          </div>
          <div>
            <StarRow rating={avgRating} size={16} />
            <p className="mt-1 text-xs text-neutral-500">
              {reviews.length} đánh giá
            </p>
          </div>
        </div>
      </div>

      {/* Reviews list */}
      <div className="divide-y divide-neutral-50 rounded-xl bg-white shadow-sm">
        {reviews.map((r) => (
          <div key={r.id} className="p-4">
            <div className="flex items-start gap-3">
              {r.productThumbnail && (
                <Link
                  to={`/products/${r.productId}`}
                  className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-neutral-100"
                >
                  <img
                    src={r.productThumbnail}
                    alt={r.productTitle}
                    className="h-full w-full object-cover"
                  />
                </Link>
              )}
              <div className="min-w-0 flex-1">
                <Link
                  to={`/products/${r.productId}`}
                  className="line-clamp-1 text-xs font-medium text-neutral-700 hover:text-brand-red-600"
                >
                  {r.productTitle}
                </Link>
                <div className="mt-1">
                  <StarRow rating={r.rating} size={11} />
                </div>
                {r.comment && (
                  <p className="mt-1.5 text-sm leading-relaxed text-neutral-800">
                    {r.comment}
                  </p>
                )}
                {r.photos.length > 0 && (
                  <div className="mt-2 flex gap-1.5">
                    {r.photos.slice(0, 4).map((url, i) => (
                      <img
                        key={i}
                        src={url}
                        alt={`Ảnh ${i + 1}`}
                        className="h-16 w-16 rounded-lg object-cover"
                      />
                    ))}
                  </div>
                )}
                <div className="mt-2 flex items-center gap-2 text-[10px] text-neutral-400">
                  {r.createdAt && (
                    <span>
                      {r.createdAt.toDate().toLocaleDateString("vi-VN")}
                    </span>
                  )}
                  <span>
                    Mua tại{" "}
                    <Link
                      to={`/shops/${r.shopId}`}
                      className="font-medium text-neutral-500 hover:text-brand-red-600"
                    >
                      {r.shopName}
                    </Link>
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ================================================================
   PRODUCT CARD COMPONENTS
   ================================================================ */

function TopProductCard({
  link,
  rank,
}: {
  link: AffiliateLink
  rank: number
}) {
  const title = extractDisplayTitle(link)
  const imgUrl = link.product_image

  return (
    <a href={affiliateUrl(link)} className="group block">
      <div className="relative aspect-square overflow-hidden rounded-xl bg-neutral-100">
        {imgUrl ? (
          <img
            src={imgUrl}
            alt={title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-neutral-300">
            <ShoppingCart size={28} />
          </div>
        )}
        {rank <= 3 && (
          <span
            className={cn(
              "absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white shadow-sm",
              rank === 1
                ? "bg-brand-red-500"
                : rank === 2
                  ? "bg-orange-500"
                  : "bg-neutral-500"
            )}
          >
            {rank}
          </span>
        )}
      </div>
      <div className="mt-2">
        <p className="line-clamp-2 text-xs font-medium text-neutral-800 group-hover:text-brand-red-600">
          {title}
        </p>
        {link.product_price != null && (
          <p className="mt-1 text-sm font-bold text-brand-red-600">
            {formatCurrency(link.product_price)}
          </p>
        )}
        <p className="mt-0.5 text-[10px] text-neutral-400">
          Đã bán {formatCompactNumber(link.clicks)}
        </p>
      </div>
    </a>
  )
}

function ProductCardCompact({ link, showBadges }: { link: AffiliateLink; showBadges?: boolean }) {
  const title = extractDisplayTitle(link)
  const imgUrl = link.product_image

  return (
    <a href={affiliateUrl(link)} className="group block rounded-xl bg-white shadow-sm transition-shadow hover:shadow-md overflow-hidden">
      <div className="relative aspect-square overflow-hidden bg-neutral-100">
        {imgUrl ? (
          <img
            src={imgUrl}
            alt={title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-neutral-300">
            <ShoppingCart size={24} />
          </div>
        )}
        {showBadges && (
          <div className="absolute left-1.5 top-1.5 flex flex-col gap-1">
            <span className="rounded bg-brand-red-500/90 px-1.5 py-0.5 text-[8px] font-bold text-white">
              Chính hãng
            </span>
          </div>
        )}
      </div>
      <div className="p-2.5">
        <p className="line-clamp-2 text-xs font-medium text-neutral-800 group-hover:text-brand-red-600">
          {title}
        </p>
        {link.product_price != null && (
          <p className="mt-1 text-sm font-bold text-brand-red-600">
            {formatCurrency(link.product_price)}
          </p>
        )}
        {link.clicks > 0 && (
          <p className="mt-0.5 text-[10px] text-neutral-400">
            Đã bán {formatCompactNumber(link.clicks)}
          </p>
        )}
      </div>
    </a>
  )
}

function ProductCardList({ link }: { link: AffiliateLink }) {
  const title = extractDisplayTitle(link)
  const imgUrl = link.product_image
  const url = affiliateUrl(link)

  return (
    <a
      href={url}
      className="group flex gap-3 rounded-xl bg-white p-3 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-lg bg-neutral-100 sm:h-32 sm:w-32">
        {imgUrl ? (
          <img
            src={imgUrl}
            alt={title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-neutral-300">
            <ShoppingCart size={28} />
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 flex gap-0.5 px-1 pb-1">
          <span className="rounded bg-brand-red-500/90 px-1.5 py-0.5 text-[8px] font-bold text-white">
            Chính hãng
          </span>
          <span className="rounded bg-teal-500/90 px-1.5 py-0.5 text-[8px] font-bold text-white">
            Freeship
          </span>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
        <div>
          <h3 className="line-clamp-2 text-sm font-medium text-neutral-900 group-hover:text-brand-red-600">
            {title}
          </h3>
          <div className="mt-1.5 flex items-center gap-1.5">
            {link.clicks > 0 && (
              <>
                <div className="flex items-center gap-0.5">
                  <Star size={10} className="fill-amber-400 text-amber-400" />
                  <span className="text-[10px] text-neutral-600">4.5</span>
                </div>
                <span className="text-[10px] text-neutral-400">
                  Đã bán {formatCompactNumber(link.clicks)}
                </span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-end justify-between">
          <div>
            {link.product_price != null && (
              <p className="text-base font-bold text-brand-red-600">
                {formatCurrency(link.product_price)}
              </p>
            )}
          </div>
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              window.open(url, "_blank")
            }}
            className="flex items-center gap-1 rounded-full bg-brand-red-500 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-brand-red-600"
          >
            <ShoppingCart size={12} />
            Mua
          </button>
        </div>
      </div>
    </a>
  )
}
