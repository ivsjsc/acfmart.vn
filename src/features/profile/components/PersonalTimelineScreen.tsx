import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import {
  Star,
  Loader2,
  Eye,
  EyeOff,
  Package,
  ExternalLink,
  AlertTriangle,
  Edit,
} from "lucide-react"
import toast from "react-hot-toast"
import { useAuthStore } from "../../../stores/auth-store"
import { sanitizeUserError } from "../../../lib/error-utils"
import { useFirebaseAuthReady } from "../../../hooks/use-firebase-auth-ready"
import {
  subscribeUserReviews,
  setReviewVisibility,
  type ReviewDoc,
  type ReviewVisibility,
} from "../../../lib/review-service"
import {
  subscribeBuyerOrders,
  orderDocToBuyerOrder,
  type OrderDoc,
} from "../../../lib/order-service"
import { cn } from "../../../lib/cn"

const STATUS_BADGE: Record<string, { label: string; tone: string }> = {
  pending: { label: "Chờ duyệt", tone: "bg-amber-50 text-amber-700" },
  approved: { label: "Đã duyệt", tone: "bg-emerald-50 text-emerald-700" },
  rejected: { label: "Bị từ chối", tone: "bg-rose-50 text-rose-700" },
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={12}
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
 * Buyer's own timeline at /account/timeline. Shows:
 *   - All reviews (public + private + pending) with toggle visibility
 *   - Recent completed orders awaiting review
 *
 * Different from /u/:userId in two ways:
 *   1. Includes private reviews (rules allow because we read by userId == auth uid).
 *   2. Lets the user toggle Công khai / Riêng tư on an existing review.
 */
export default function PersonalTimelineScreen() {
  const user = useAuthStore((s) => s.user)
  const authReady = useFirebaseAuthReady()

  const [reviews, setReviews] = useState<ReviewDoc[]>([])
  const [orders, setOrders] = useState<OrderDoc[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [reviewsError, setReviewsError] = useState<string | null>(null)
  const [ordersError, setOrdersError] = useState<string | null>(null)
  const [savingVisibility, setSavingVisibility] = useState<string | null>(null)
  const [tab, setTab] = useState<"reviews" | "orders">("reviews")

  useEffect(() => {
    if (!authReady || !user?.id) return
    setReviewsLoading(true)
    setReviewsError(null)
    const unsub = subscribeUserReviews(
      user.id,
      (data) => {
        setReviews(data)
        setReviewsLoading(false)
      },
      (err) => {
        setReviewsError(err.message)
        setReviewsLoading(false)
      }
    )
    return () => unsub()
  }, [authReady, user?.id])

  useEffect(() => {
    if (!authReady || !user?.id) return
    setOrdersLoading(true)
    setOrdersError(null)
    const unsub = subscribeBuyerOrders(
      { customerId: user.id },
      (data) => {
        setOrders(data)
        setOrdersLoading(false)
      },
      (err) => {
        setOrdersError(err.message)
        setOrdersLoading(false)
      }
    )
    return () => unsub()
  }, [authReady, user?.id])

  const reviewedOrderItems = useMemo(() => {
    const set = new Set<string>()
    for (const r of reviews) set.add(`${r.orderId}_${r.variantId}`)
    return set
  }, [reviews])

  const ordersAwaitingReview = useMemo(() => {
    return orders.filter(
      (o) =>
        (o.status === "delivered" || o.status === "completed") &&
        o.items.some(
          (it) => !reviewedOrderItems.has(`${o.id}_${it.variantId}`)
        )
    )
  }, [orders, reviewedOrderItems])

  async function toggleVisibility(review: ReviewDoc) {
    const next: ReviewVisibility =
      review.visibility === "public" ? "private" : "public"
    setSavingVisibility(review.id)
    try {
      await setReviewVisibility(review.id, next)
      toast.success(
        next === "public"
          ? "Đánh giá đã đặt thành Công khai"
          : "Đánh giá đã đặt thành Riêng tư"
      )
    } catch (err) {
      toast.error(sanitizeUserError(err, "Không thể đổi chế độ. Vui lòng thử lại sau."))
    } finally {
      setSavingVisibility(null)
    }
  }

  if (!user?.id) {
    return (
      <div className="container-acf py-12 text-center">
        <h1 className="text-xl font-bold">Đăng nhập để xem trang cá nhân</h1>
        <Link to="/login" className="btn-primary mt-4 inline-flex">
          Đăng nhập
        </Link>
      </div>
    )
  }

  return (
    <div className="container-acf py-6 lg:py-8">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">
            Trang cá nhân
          </h1>
          <p className="mt-1 text-sm text-neutral-600">
            Đánh giá và đơn hàng của bạn — riêng bạn thấy được nội dung
            riêng tư.
          </p>
        </div>
        <Link
          to={`/u/${user.id}`}
          className="btn-secondary inline-flex items-center gap-1 self-start sm:self-auto"
        >
          Xem trang công khai <ExternalLink size={14} />
        </Link>
      </div>

      <div className="mb-4 flex gap-2 border-b border-neutral-200">
        <button
          onClick={() => setTab("reviews")}
          className={cn(
            "px-4 py-2 text-sm font-semibold",
            tab === "reviews"
              ? "border-b-2 border-brand-red-600 text-brand-red-700"
              : "text-neutral-500 hover:text-neutral-800"
          )}
        >
          Đánh giá của tôi ({reviews.length})
        </button>
        <button
          onClick={() => setTab("orders")}
          className={cn(
            "px-4 py-2 text-sm font-semibold",
            tab === "orders"
              ? "border-b-2 border-brand-red-600 text-brand-red-700"
              : "text-neutral-500 hover:text-neutral-800"
          )}
        >
          Chờ đánh giá ({ordersAwaitingReview.length})
        </button>
      </div>

      {tab === "reviews" ? (
        reviewsLoading ? (
          <div className="flex items-center justify-center py-12 text-neutral-500">
            <Loader2 className="mr-2 animate-spin" size={18} /> Đang tải...
          </div>
        ) : reviewsError ? (
          <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4">
            <AlertTriangle className="mt-0.5 shrink-0 text-rose-600" size={18} />
            <div>
              <p className="text-sm font-semibold text-rose-900">
                Không tải được đánh giá
              </p>
              <p className="mt-1 text-xs text-rose-700">{reviewsError}</p>
            </div>
          </div>
        ) : reviews.length === 0 ? (
          <div className="card p-10 text-center">
            <Star size={36} className="mx-auto text-neutral-300" />
            <h3 className="mt-3 text-base font-semibold text-neutral-900">
              Bạn chưa có đánh giá nào
            </h3>
            <p className="mt-1 text-sm text-neutral-600">
              Sau khi đơn hàng giao thành công, bạn có thể đánh giá sản
              phẩm để nhận điểm thưởng.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {reviews.map((r) => {
              const badge = STATUS_BADGE[r.status]
              const isPublic = r.visibility === "public"
              return (
                <li key={r.id} className="card p-4">
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
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <Link
                          to={`/products/${r.productId}`}
                          className="line-clamp-1 text-sm font-semibold text-neutral-900 hover:text-brand-red-700"
                        >
                          {r.productTitle}
                        </Link>
                        <div className="flex items-center gap-1.5">
                          {badge && (
                            <span
                              className={cn(
                                "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                                badge.tone
                              )}
                            >
                              {badge.label}
                            </span>
                          )}
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                              isPublic
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-neutral-200 text-neutral-700"
                            )}
                          >
                            {isPublic ? (
                              <>
                                <Eye size={10} /> Công khai
                              </>
                            ) : (
                              <>
                                <EyeOff size={10} /> Riêng tư
                              </>
                            )}
                          </span>
                        </div>
                      </div>
                      <div className="mt-0.5 text-xs text-neutral-500">
                        Đơn{" "}
                        <Link
                          to={`/account/orders/${r.orderCode}`}
                          className="font-medium text-neutral-700 hover:text-brand-red-700"
                        >
                          {r.orderCode}
                        </Link>{" "}
                        · Shop {r.shopName}
                      </div>
                      <div className="mt-1.5">
                        <StarRow rating={r.rating} />
                      </div>
                      {r.comment && (
                        <p className="mt-1.5 text-sm text-neutral-700">
                          {r.comment}
                        </p>
                      )}
                      {r.rejectedReason && (
                        <p className="mt-1.5 text-xs text-rose-600">
                          Lý do từ chối: {r.rejectedReason}
                        </p>
                      )}
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                        <button
                          type="button"
                          onClick={() => toggleVisibility(r)}
                          disabled={
                            savingVisibility === r.id || r.status === "rejected"
                          }
                          className="inline-flex items-center gap-1 rounded-md border border-neutral-200 bg-white px-2 py-1 text-neutral-700 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {savingVisibility === r.id ? (
                            <Loader2 size={11} className="animate-spin" />
                          ) : isPublic ? (
                            <EyeOff size={11} />
                          ) : (
                            <Eye size={11} />
                          )}
                          {isPublic ? "Đặt riêng tư" : "Đặt công khai"}
                        </button>
                        <Link
                          to={`/account/orders/${r.orderCode}/review`}
                          className="inline-flex items-center gap-1 rounded-md border border-neutral-200 bg-white px-2 py-1 text-neutral-700 hover:bg-neutral-50"
                        >
                          <Edit size={11} /> Sửa
                        </Link>
                      </div>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )
      ) : ordersLoading ? (
        <div className="flex items-center justify-center py-12 text-neutral-500">
          <Loader2 className="mr-2 animate-spin" size={18} /> Đang tải...
        </div>
      ) : ordersError ? (
        <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4">
          <AlertTriangle className="mt-0.5 shrink-0 text-rose-600" size={18} />
          <div>
            <p className="text-sm font-semibold text-rose-900">
              Không tải được đơn hàng
            </p>
            <p className="mt-1 text-xs text-rose-700">{ordersError}</p>
          </div>
        </div>
      ) : ordersAwaitingReview.length === 0 ? (
        <div className="card p-10 text-center">
          <Package size={36} className="mx-auto text-neutral-300" />
          <h3 className="mt-3 text-base font-semibold text-neutral-900">
            Không còn đơn nào chờ đánh giá
          </h3>
          <p className="mt-1 text-sm text-neutral-600">
            Bạn đã đánh giá toàn bộ sản phẩm trong các đơn hàng đã giao.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {ordersAwaitingReview.map((o) => {
            const buyer = orderDocToBuyerOrder(o)
            const notYet = o.items.filter(
              (it) => !reviewedOrderItems.has(`${o.id}_${it.variantId}`)
            )
            return (
              <li key={o.id} className="card p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="text-sm font-semibold text-neutral-900">
                      Đơn {o.code}
                    </div>
                    <div className="text-xs text-neutral-500">
                      Shop {o.shopName} · Giao{" "}
                      {buyer.timeline?.[buyer.timeline.length - 1]?.timestamp
                        ? new Date(
                            buyer.timeline[
                              buyer.timeline.length - 1
                            ].timestamp
                          ).toLocaleDateString("vi-VN")
                        : ""}
                    </div>
                  </div>
                  <Link
                    to={`/account/orders/${o.code}/review`}
                    className="btn-primary text-xs"
                  >
                    Đánh giá ({notYet.length})
                  </Link>
                </div>
                <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {notYet.slice(0, 4).map((it) => (
                    <li
                      key={it.variantId}
                      className="flex items-center gap-2 rounded-md bg-neutral-50 p-2"
                    >
                      {it.image && (
                        <img
                          src={it.image}
                          alt={it.title}
                          className="h-8 w-8 rounded object-cover"
                        />
                      )}
                      <span className="line-clamp-2 text-[11px] text-neutral-700">
                        {it.title}
                      </span>
                    </li>
                  ))}
                </ul>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
