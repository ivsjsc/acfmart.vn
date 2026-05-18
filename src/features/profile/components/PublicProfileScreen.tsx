import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { doc, getDoc } from "firebase/firestore"
import {
  Star,
  Loader2,
  ShoppingBag,
  Calendar,
  UserCircle,
  Link2,
} from "lucide-react"
import { firestore } from "../../../lib/firebase"
import { useFirebaseAuthReady } from "../../../hooks/use-firebase-auth-ready"
import {
  listUserPublicReviews,
  type ReviewDoc,
} from "../../../lib/review-service"
import { cn } from "../../../lib/cn"
import { sanitizeUserError } from "../../../lib/error-utils"
import AffiliateShowcaseSection from "./AffiliateShowcaseSection"

type ProfileTab = "showcase" | "reviews"

interface PublicUser {
  id: string
  name: string
  avatar?: string
  bio?: string
  joinedAt?: Date
  tier?: string
}

function formatJoinedDate(date?: Date): string {
  if (!date) return "Thành viên ACFMart"
  return `Tham gia từ ${date.toLocaleDateString("vi-VN", {
    month: "short",
    year: "numeric",
  })}`
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={14}
          className={cn(
            n <= rating
              ? "fill-brand-gold-400 text-brand-gold-400"
              : "text-neutral-300"
          )}
        />
      ))}
    </div>
  )
}

/**
 * Public profile page at /u/:userId.
 *
 * Anyone (signed in or not) can visit, but only public + approved reviews
 * appear. Used to build trust around shoppers and let affiliate links
 * point at a personal showcase later (phase A).
 */
export default function PublicProfileScreen() {
  const { userId } = useParams<{ userId: string }>()
  const authReady = useFirebaseAuthReady()
  const [profile, setProfile] = useState<PublicUser | null>(null)
  const [reviews, setReviews] = useState<ReviewDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<ProfileTab>("showcase")

  useEffect(() => {
    if (!authReady || !userId) return
    let cancelled = false
    setLoading(true)
    setError(null)
    ;(async () => {
      try {
        const [userSnap, list] = await Promise.all([
          getDoc(doc(firestore, "users", userId)),
          listUserPublicReviews({ userId, limitCount: 50 }),
        ])
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
        })
        setReviews(list)
        setLoading(false)
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

  if (loading) {
    return (
      <div className="container-acf flex items-center justify-center py-16 text-neutral-500">
        <Loader2 className="mr-2 animate-spin" size={18} /> Đang tải trang cá nhân...
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="container-acf py-12 text-center">
        <UserCircle className="mx-auto text-neutral-300" size={48} />
        <h1 className="mt-3 text-xl font-bold text-neutral-900">
          Không tìm thấy người dùng
        </h1>
        <p className="mt-1 text-sm text-neutral-600">
          {error ?? "Trang cá nhân không tồn tại hoặc đã bị ẩn."}
        </p>
        <Link to="/" className="btn-primary mt-4 inline-flex">
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

  return (
    <div className="container-acf py-6 lg:py-10">
      {/* Header */}
      <div className="card flex flex-col items-center gap-4 p-6 sm:flex-row sm:items-start sm:gap-6">
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full bg-neutral-100">
          {profile.avatar ? (
            <img
              src={profile.avatar}
              alt={profile.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-neutral-300">
              <UserCircle size={48} />
            </div>
          )}
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-2xl font-bold text-neutral-900">
            {profile.name}
          </h1>
          {profile.bio && (
            <p className="mt-1 text-sm text-neutral-600">{profile.bio}</p>
          )}
          <p className="mt-1 flex items-center justify-center gap-1 text-xs text-neutral-500 sm:justify-start">
            <Calendar size={12} /> {formatJoinedDate(profile.joinedAt)}
          </p>
          {profile.tier && (
            <span className="mt-2 inline-block rounded-full bg-brand-gold-100 px-2.5 py-0.5 text-xs font-semibold text-brand-gold-700">
              {profile.tier}
            </span>
          )}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-xs sm:justify-start">
            <div className="flex items-center gap-1.5">
              <Star size={14} className="fill-brand-gold-400 text-brand-gold-400" />
              <strong>{avgRating.toFixed(1)}</strong>
              <span className="text-neutral-500">điểm trung bình</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShoppingBag size={14} className="text-neutral-500" />
              <strong>{ratingCount}</strong>
              <span className="text-neutral-500">đánh giá công khai</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="mt-8 mb-4 flex border-b border-neutral-200">
        <button
          onClick={() => setTab("showcase")}
          className={cn(
            "flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
            tab === "showcase"
              ? "border-brand-red-500 text-brand-red-600"
              : "border-transparent text-neutral-600 hover:text-neutral-900"
          )}
        >
          <Link2 size={14} /> Trưng bày
        </button>
        <button
          onClick={() => setTab("reviews")}
          className={cn(
            "flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
            tab === "reviews"
              ? "border-brand-red-500 text-brand-red-600"
              : "border-transparent text-neutral-600 hover:text-neutral-900"
          )}
        >
          <Star size={14} /> Đánh giá ({ratingCount})
        </button>
      </div>

      {/* Tab content */}
      {tab === "showcase" ? (
        <AffiliateShowcaseSection userId={profile.id} userName={profile.name} />
      ) : ratingCount === 0 ? (
        <div className="card flex flex-col items-center justify-center p-10 text-center">
          <Star size={36} className="text-neutral-300" />
          <h3 className="mt-3 text-base font-semibold text-neutral-900">
            Chưa có đánh giá nào
          </h3>
          <p className="mt-1 text-sm text-neutral-600">
            Khi {profile.name.split(" ").slice(-1)} chia sẻ đánh giá công
            khai, chúng sẽ hiện ở đây.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {reviews.map((r) => (
            <li key={r.id} className="card overflow-hidden p-5">
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
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/products/${r.productId}`}
                    className="line-clamp-1 text-sm font-semibold text-neutral-900 hover:text-brand-red-700"
                  >
                    {r.productTitle}
                  </Link>
                  <div className="mt-0.5 text-xs text-neutral-500">
                    Mua tại{" "}
                    <Link
                      to={`/shops/${r.shopId}`}
                      className="font-medium text-neutral-700 hover:text-brand-red-700"
                    >
                      {r.shopName}
                    </Link>
                  </div>
                  <div className="mt-1.5">
                    <StarRow rating={r.rating} />
                  </div>
                  {r.comment && (
                    <p className="mt-2 text-sm text-neutral-700">{r.comment}</p>
                  )}
                  {r.photos.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
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
                  {r.createdAt && (
                    <p className="mt-2 text-[11px] text-neutral-400">
                      {r.createdAt.toDate().toLocaleDateString("vi-VN")}
                    </p>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
