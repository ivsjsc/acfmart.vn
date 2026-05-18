import { useEffect, useState } from "react"
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
  { value: "newest", label: "Hàng mới ra mắt" },
  { value: "price_asc", label: "Giá" },
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

  // Follow state
  const [followState, setFollowState] = useState<FollowState>({
    followersCount: 0,
    followingCount: 0,
    isFollowing: false,
    followsMe: false,
    isMutual: false,
  })
  const [followLoading, setFollowLoading] = useState(false)

  // Load profile, reviews, and links
  useEffect(() => {
    if (!authReady || !userId) return
    let cancelled = false
    setLoading(true)
    setError(null)
    ;(async () => {
      try {
        const userSnap = await getDoc(doc(firestore, "users", userId))
        if (cancelled) return
        if (!userSnap.exists()) {
          setError("Người dùng này không tồn tại hoặc đã ẩn hồ sơ.")
          setLoading(false)
          return
        }
        const data = userSnap.data() as Record<string, any>
        setProfile({
          id: userSnap.id,
          name: data.name ?? data.displayName ?? "Khách hàng ACFMart",
          avatar: data.avatar ?? data.photoURL,
          bio: data.bio ?? undefined,
          joinedAt: data.created_at?.toDate?.() ?? undefined,
          tier: data.tier,
          bannerUrl: data.bannerUrl ?? data.banner_url ?? undefined,
          totalSold: data.total_sold ?? 0,
        })
        setLoading(false)

        // Load reviews and links separately — don't block profile render
        const [reviewResult, linksResult] = await Promise.allSettled([
          listUserPublicReviews({ userId, limitCount: 50 }),
          listPublicShowcaseLinks(userId, 100),
        ])
        if (cancelled) return
        if (reviewResult.status === "fulfilled") setReviews(reviewResult.value)
        if (linksResult.status === "fulfilled") {
          try {
            const linkData = unwrapServiceResult(linksResult.value)
            setLinks(linkData.links)
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

  // Subscribe to follow state (may fail if userFollows rules require auth)
  useEffect(() => {
    if (!userId) return
    try {
      return subscribeFollowState(userId, currentUser?.id, setFollowState)
    } catch {
      // Silently ignore if follow state can't be loaded
    }
  }, [userId, currentUser?.id])

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
      <div className="flex min-h-[60vh] items-center justify-center text-neutral-500">
        <Loader2 className="mr-2 animate-spin" size={20} />
        <span className="text-sm">Đang tải...</span>
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

  // Filter & sort links for products tab
  const filteredLinks = searchQuery
    ? links.filter((l) =>
        extractDisplayTitle(l).toLowerCase().includes(searchQuery.toLowerCase())
      )
    : links
  const sortedLinks = sortLinks(
    filteredLinks,
    productSort === "price_asc" && priceDir === "desc" ? "price_desc" : productSort
  )

  // Top products for Home tab (sorted by clicks)
  const topProducts = [...links].sort((a, b) => b.clicks - a.clicks).slice(0, 6)
  const newProducts = [...links]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, 6)

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* ===== PROFILE HEADER (TikTok Shop style) ===== */}
      <div className="bg-white">
        {/* Banner */}
        <div className="relative h-28 bg-gradient-to-r from-brand-red-500 via-brand-red-400 to-brand-gold-400 sm:h-36">
          {profile.bannerUrl && (
            <img
              src={profile.bannerUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          )}
          {/* Search + Share overlay */}
          <div className="absolute left-0 right-0 top-0 flex items-center justify-between px-4 pt-3">
            {showSearch ? (
              <div className="flex flex-1 items-center gap-2">
                <div className="flex flex-1 items-center rounded-full bg-white/90 px-3 py-1.5 backdrop-blur-sm">
                  <Search size={14} className="mr-2 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm"
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
                  className="rounded-full bg-black/20 p-2 backdrop-blur-sm transition hover:bg-black/30"
                >
                  <Search size={16} className="text-white" />
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={handleShare}
                    className="rounded-full bg-black/20 p-2 backdrop-blur-sm transition hover:bg-black/30"
                  >
                    <Share2 size={16} className="text-white" />
                  </button>
                  <Link
                    to="/cart"
                    className="rounded-full bg-black/20 p-2 backdrop-blur-sm transition hover:bg-black/30"
                  >
                    <ShoppingCart size={16} className="text-white" />
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Profile info */}
        <div className="px-4 pb-4">
          <div className="flex items-start gap-4">
            {/* Avatar - overlapping banner */}
            <div className="-mt-10 h-20 w-20 shrink-0 overflow-hidden rounded-full border-[3px] border-white bg-white shadow-md sm:h-24 sm:w-24">
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

            {/* Name + Action buttons */}
            <div className="flex flex-1 items-start justify-between pt-2">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h1 className="truncate text-lg font-bold text-neutral-900 sm:text-xl">
                    {profile.name}
                  </h1>
                  <ChevronRight size={16} className="shrink-0 text-neutral-400" />
                </div>
                {profile.tier && (
                  <span className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-brand-gold-50 px-2 py-0.5 text-[10px] font-semibold text-brand-gold-700">
                    <ShieldCheck size={10} />
                    {profile.tier.charAt(0).toUpperCase() + profile.tier.slice(1)}
                  </span>
                )}
              </div>

              {/* Action buttons */}
              {!isSelf && (
                <div className="flex shrink-0 gap-2">
                  <button
                    onClick={handleFollow}
                    disabled={followLoading}
                    className={cn(
                      "flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold transition",
                      followState.isFollowing
                        ? "border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50"
                        : "bg-brand-red-500 text-white hover:bg-brand-red-600"
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
                    className="flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-4 py-2 text-xs font-bold text-neutral-700 transition hover:bg-neutral-50"
                  >
                    <MessageCircle size={14} /> Tin nhắn
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Stats row */}
          <div className="mt-3 flex items-center gap-1.5 text-xs text-neutral-600">
            <div className="flex items-center gap-1">
              <Star size={13} className="fill-amber-400 text-amber-400" />
              <span className="font-bold text-neutral-900">
                {avgRating.toFixed(1)}
              </span>
            </div>
            <span className="text-neutral-300">|</span>
            <span>
              {formatCompactNumber(totalClicks + (profile.totalSold ?? 0))} đã bán
            </span>
            <span className="text-neutral-300">|</span>
            <span>
              {formatCompactNumber(followState.followersCount)} người theo dõi
            </span>
          </div>

          {/* Bio */}
          {profile.bio && (
            <p className="mt-2 line-clamp-2 text-xs text-neutral-500">
              {profile.bio}
            </p>
          )}

          {/* Voucher banner */}
          <div className="mt-3 flex items-center justify-between rounded-lg bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-100 px-3 py-2.5">
            <div>
              <p className="text-xs font-bold text-teal-800">
                Voucher vận chuyển
              </p>
              <p className="text-[10px] text-teal-600">
                Giảm phí vận chuyển cho đơn hàng đầu tiên
              </p>
            </div>
            <button className="rounded-lg bg-teal-500 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-teal-600">
              Nhận
            </button>
          </div>
        </div>

        {/* ===== TAB BAR (TikTok style: Trang chủ | Sản phẩm | Đánh giá) ===== */}
        <div className="flex border-t border-neutral-100">
          {(
            [
              { key: "home", label: "Trang chủ" },
              { key: "products", label: "Sản phẩm" },
              { key: "reviews", label: `Đánh giá` },
            ] as const
          ).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={cn(
                "relative flex-1 py-3 text-center text-sm font-medium transition-colors",
                tab === key
                  ? "text-neutral-900"
                  : "text-neutral-500 hover:text-neutral-700"
              )}
            >
              {label}
              {key === "reviews" && ratingCount > 0 && (
                <span className="ml-1 text-xs text-neutral-400">
                  ({ratingCount})
                </span>
              )}
              {tab === key && (
                <span className="absolute bottom-0 left-1/2 h-[2px] w-10 -translate-x-1/2 rounded-full bg-neutral-900" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ===== TAB CONTENT ===== */}
      <div className="pb-8">
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
            onSearchChange={setSearchQuery}
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
    </div>
  )
}

/* ================================================================
   HOME TAB - "Trang chủ" giống TikTok Shop
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
      <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
        <ShoppingCart size={40} className="text-neutral-200" />
        <h3 className="mt-3 text-sm font-semibold text-neutral-700">
          Chưa có sản phẩm trưng bày
        </h3>
        <p className="mt-1 text-xs text-neutral-500">
          Khi {profileName.split(" ").slice(-1)} chia sẻ sản phẩm, chúng sẽ hiện
          ở đây.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3 pt-3">
      {/* Sản phẩm hàng đầu */}
      {topProducts.length > 0 && (
        <section className="bg-white px-4 py-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-neutral-900">
              Sản phẩm hàng đầu
            </h2>
            <button
              onClick={onViewAll}
              className="flex items-center gap-0.5 text-xs text-neutral-500 hover:text-neutral-700"
            >
              Xem thêm <ChevronRight size={14} />
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {topProducts.map((link, idx) => (
              <TopProductCard key={link.id} link={link} rank={idx + 1} />
            ))}
          </div>
        </section>
      )}

      {/* Mới ra */}
      {newProducts.length > 0 && (
        <section className="bg-white px-4 py-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-neutral-900">Mới ra</h2>
            <button
              onClick={onViewAll}
              className="flex items-center gap-0.5 text-xs text-neutral-500 hover:text-neutral-700"
            >
              Xem thêm <ChevronRight size={14} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
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
   PRODUCTS TAB - "Sản phẩm" với filter chips giống TikTok Shop
   ================================================================ */
function ProductsTab({
  links,
  sort,
  priceDir,
  onSortChange,
  searchQuery,
  onSearchChange,
}: {
  links: AffiliateLink[]
  sort: ProductSort
  priceDir: "asc" | "desc"
  onSortChange: (s: ProductSort) => void
  searchQuery: string
  onSearchChange: (q: string) => void
}) {
  return (
    <div className="bg-white">
      {/* Filter chips - TikTok style */}
      <div className="sticky top-0 z-10 flex items-center gap-0.5 border-b border-neutral-100 bg-white px-4 py-2">
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onSortChange(opt.value)}
            className={cn(
              "whitespace-nowrap px-3 py-1.5 text-xs font-medium transition-colors",
              sort === opt.value
                ? "text-neutral-900 font-bold"
                : "text-neutral-500 hover:text-neutral-700"
            )}
          >
            {opt.label}
            {opt.value === "price_asc" && sort === "price_asc" && (
              <span className="ml-0.5 text-[10px]">
                {priceDir === "asc" ? "↑" : "↓"}
              </span>
            )}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2 border-l border-neutral-200 pl-2">
          <button className="p-1 text-neutral-400 hover:text-neutral-600">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className="text-current"
            >
              <rect
                x="1"
                y="1"
                width="6"
                height="6"
                rx="1"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <rect
                x="9"
                y="1"
                width="6"
                height="6"
                rx="1"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <rect
                x="1"
                y="9"
                width="6"
                height="6"
                rx="1"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <rect
                x="9"
                y="9"
                width="6"
                height="6"
                rx="1"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Product grid - TikTok list style */}
      {links.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Search size={32} className="text-neutral-200" />
          <p className="mt-2 text-sm text-neutral-500">
            {searchQuery
              ? `Không tìm thấy sản phẩm nào cho "${searchQuery}"`
              : "Chưa có sản phẩm nào"}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-neutral-50">
          {links.map((link) => (
            <ProductCardList key={link.id} link={link} />
          ))}
        </div>
      )}
    </div>
  )
}

/* ================================================================
   REVIEWS TAB - "Đánh giá" với layout TikTok-style
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
      <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
        <Star size={40} className="text-neutral-200" />
        <h3 className="mt-3 text-sm font-semibold text-neutral-700">
          Chưa có đánh giá nào
        </h3>
        <p className="mt-1 text-xs text-neutral-500">
          Khi {profileName.split(" ").slice(-1)} chia sẻ đánh giá công khai,
          chúng sẽ hiện ở đây.
        </p>
      </div>
    )
  }

  return (
    <div className="pt-3">
      {/* Rating summary */}
      <div className="bg-white px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="text-center">
            <p className="text-3xl font-bold text-neutral-900">
              {avgRating.toFixed(1)}
            </p>
            <p className="text-[10px] text-neutral-400">/5</p>
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
      <div className="mt-2 bg-white divide-y divide-neutral-50">
        {reviews.map((r) => (
          <div key={r.id} className="px-4 py-4">
            <div className="flex items-start gap-3">
              {r.productThumbnail && (
                <Link
                  to={`/products/${r.productId}`}
                  className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-neutral-100"
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
                        className="h-16 w-16 rounded-md object-cover"
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

// Card cho "Sản phẩm hàng đầu" - horizontal scroll (TikTok Home tab style)
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
    <a
      href={affiliateUrl(link)}
      className="block w-36 shrink-0 sm:w-40"
    >
      <div className="relative aspect-square overflow-hidden rounded-lg bg-neutral-100">
        {imgUrl ? (
          <img
            src={imgUrl}
            alt={title}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-neutral-300">
            <ShoppingCart size={28} />
          </div>
        )}
        {/* Rank badge */}
        <span
          className={cn(
            "absolute left-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold text-white",
            rank === 1
              ? "bg-brand-red-500"
              : rank === 2
                ? "bg-orange-500"
                : "bg-neutral-600"
          )}
        >
          {rank}
        </span>
      </div>
      <div className="mt-1.5">
        <p className="line-clamp-2 text-xs text-neutral-800">{title}</p>
        {link.product_price != null && (
          <p className="mt-0.5 text-xs font-bold text-brand-red-600">
            {formatCurrency(link.product_price)}
          </p>
        )}
        <p className="text-[10px] text-neutral-400">
          Đã bán {formatCompactNumber(link.clicks)}
        </p>
      </div>
    </a>
  )
}

// Card nhỏ cho "Mới ra" section - grid 2-3 columns (TikTok Home style)
function ProductCardCompact({ link }: { link: AffiliateLink }) {
  const title = extractDisplayTitle(link)
  const imgUrl = link.product_image

  return (
    <a href={affiliateUrl(link)} className="block">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-neutral-100">
        {imgUrl ? (
          <img
            src={imgUrl}
            alt={title}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-neutral-300">
            <ShoppingCart size={24} />
          </div>
        )}
      </div>
      <div className="mt-1.5">
        <p className="line-clamp-2 text-xs text-neutral-800">{title}</p>
        {link.product_price != null && (
          <p className="mt-0.5 text-xs font-bold text-brand-red-600">
            {formatCurrency(link.product_price)}
          </p>
        )}
      </div>
    </a>
  )
}

// Card kiểu list cho Products tab (TikTok "Sản phẩm" tab style)
function ProductCardList({ link }: { link: AffiliateLink }) {
  const title = extractDisplayTitle(link)
  const imgUrl = link.product_image
  const url = affiliateUrl(link)

  return (
    <a
      href={url}
      className="flex gap-3 px-4 py-3 transition hover:bg-neutral-50"
    >
      {/* Image */}
      <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-lg bg-neutral-100 sm:h-32 sm:w-32">
        {imgUrl ? (
          <img
            src={imgUrl}
            alt={title}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-neutral-300">
            <ShoppingCart size={28} />
          </div>
        )}
        {/* Badges */}
        <div className="absolute bottom-0 left-0 right-0 flex gap-0.5 px-1 pb-1">
          <span className="rounded bg-brand-red-500 px-1.5 py-0.5 text-[8px] font-bold text-white">
            Chính hãng
          </span>
          <span className="rounded bg-teal-500 px-1.5 py-0.5 text-[8px] font-bold text-white">
            Freeship
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
        <div>
          <h3 className="line-clamp-2 text-sm font-medium text-neutral-900">
            {title}
          </h3>
          <div className="mt-1.5 flex items-center gap-1.5">
            {link.clicks > 0 && (
              <>
                <div className="flex items-center gap-0.5">
                  <Star
                    size={10}
                    className="fill-amber-400 text-amber-400"
                  />
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
            className="flex items-center gap-1 rounded-lg bg-brand-red-500 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-brand-red-600"
          >
            <ShoppingCart size={12} />
            Mua
          </button>
        </div>
      </div>
    </a>
  )
}
