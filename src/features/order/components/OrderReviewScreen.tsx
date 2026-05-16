import { useEffect, useMemo, useState } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import {
  Star,
  Upload,
  X,
  Loader2,
  Sparkles,
  ShieldCheck,
  Gift,
  Eye,
  EyeOff,
  AlertTriangle,
} from "lucide-react"
import toast from "react-hot-toast"
import { cn } from "../../../lib/cn"
import { useAuthStore } from "../../../stores/auth-store"
import { useFirebaseAuthReady } from "../../../hooks/use-firebase-auth-ready"
import {
  getBuyerOrderByCode,
  type OrderDoc,
} from "../../../lib/order-service"
import {
  createReview,
  getReviewForOrderItem,
  type ReviewVisibility,
} from "../../../lib/review-service"
import { NotFound } from "../../../pages/NotFound"

/**
 * Per-item review draft kept in component state. Persists to Firestore via
 * createReview() on submit.
 */
interface ItemReview {
  variantId: string
  rating: number
  comment: string
  photos: string[]
  anonymous: boolean
  visibility: ReviewVisibility
  alreadySubmitted: boolean
}

const RATING_LABELS = ["Tệ", "Không hài lòng", "Bình thường", "Hài lòng", "Tuyệt vời"]

const SUGGESTED_TAGS = [
  "Đúng mô tả",
  "Chất lượng tốt",
  "Đóng gói cẩn thận",
  "Giao nhanh",
  "Shop tư vấn nhiệt tình",
  "Giá hợp lý",
  "Mua lại lần sau",
]

const COMPLETED_STATUSES = new Set([
  "delivered",
  "completed",
])

export default function OrderReviewScreen() {
  const { orderId } = useParams<{ orderId: string }>()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const authReady = useFirebaseAuthReady()

  const [order, setOrder] = useState<OrderDoc | null>(null)
  const [orderLoading, setOrderLoading] = useState(true)
  const [orderError, setOrderError] = useState<string | null>(null)
  const [reviews, setReviews] = useState<Record<string, ItemReview>>({})
  const [submitting, setSubmitting] = useState(false)

  // Load the order + pre-fill any existing reviews. Done after Firebase Auth
  // restores so the Firestore query has a non-null uid.
  useEffect(() => {
    if (!authReady) return
    if (!user?.id || !orderId) {
      setOrderLoading(false)
      return
    }
    let cancelled = false
    setOrderLoading(true)
    setOrderError(null)
    ;(async () => {
      try {
        const next = await getBuyerOrderByCode(orderId, user.id)
        if (cancelled) return
        if (!next) {
          setOrderError("Không tìm thấy đơn hàng — có thể bạn không phải người mua.")
          setOrderLoading(false)
          return
        }
        setOrder(next)

        // Hydrate review drafts from any reviews already saved for this order.
        const existing = await Promise.all(
          next.items.map((it) =>
            getReviewForOrderItem(next.id, it.variantId).then((rv) => ({
              variantId: it.variantId,
              review: rv,
            }))
          )
        )
        if (cancelled) return
        const drafts: Record<string, ItemReview> = {}
        for (const { variantId, review } of existing) {
          drafts[variantId] = {
            variantId,
            rating: review?.rating ?? 5,
            comment: review?.comment ?? "",
            photos: review?.photos ?? [],
            anonymous: review?.anonymous ?? false,
            visibility: review?.visibility ?? "public",
            alreadySubmitted: !!review,
          }
        }
        setReviews(drafts)
        setOrderLoading(false)
      } catch (err) {
        if (cancelled) return
        console.error("[OrderReviewScreen] load failed:", err)
        setOrderError(
          err instanceof Error ? err.message : "Không tải được đơn hàng"
        )
        setOrderLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [authReady, user?.id, orderId])

  const reviewableItems = useMemo(
    () => (order ? order.items.filter((it) => it.variantId) : []),
    [order]
  )

  const allSubmitted = useMemo(
    () =>
      reviewableItems.length > 0 &&
      reviewableItems.every((it) => reviews[it.variantId]?.alreadySubmitted),
    [reviewableItems, reviews]
  )

  function updateReview(variantId: string, patch: Partial<ItemReview>) {
    setReviews((prev) => ({
      ...prev,
      [variantId]: {
        ...(prev[variantId] ?? {
          variantId,
          rating: 5,
          comment: "",
          photos: [],
          anonymous: false,
          visibility: "public" as ReviewVisibility,
          alreadySubmitted: false,
        }),
        ...patch,
      },
    }))
  }

  function addTag(variantId: string, tag: string) {
    const current = reviews[variantId]
    const next = current?.comment
      ? current.comment + (current.comment.endsWith(" ") ? "" : " ") + `· ${tag}`
      : tag
    updateReview(variantId, { comment: next })
  }

  function handlePhotoUpload(
    variantId: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const files = e.target.files
    if (!files) return
    const current = reviews[variantId]
    const remaining = 5 - (current?.photos?.length ?? 0)
    const newPhotos = Array.from(files)
      .slice(0, remaining)
      .map((f) => URL.createObjectURL(f))
    updateReview(variantId, {
      photos: [...(current?.photos ?? []), ...newPhotos],
    })
  }

  async function submit() {
    if (!order || !user) return
    const drafts = reviewableItems
      .map((it) => reviews[it.variantId])
      .filter((r) => r && !r.alreadySubmitted)
    if (drafts.length === 0) {
      toast("Tất cả sản phẩm đã được đánh giá")
      return
    }
    const incomplete = drafts.find(
      (r) => r.rating < 1 || (r.rating <= 3 && !r.comment.trim())
    )
    if (incomplete) {
      toast.error(
        "Đánh giá dưới 3 sao cần kèm bình luận để giúp shop cải thiện"
      )
      return
    }

    setSubmitting(true)
    try {
      for (const it of reviewableItems) {
        const draft = reviews[it.variantId]
        if (!draft || draft.alreadySubmitted) continue
        await createReview({
          orderId: order.id,
          orderCode: order.code,
          variantId: it.variantId,
          productId: it.productId,
          productTitle: it.title,
          productThumbnail: it.image,
          shopId: order.shopId,
          shopName: order.shopName,
          rating: draft.rating,
          comment: draft.comment.trim(),
          photos: draft.photos,
          tags: [],
          visibility: draft.visibility,
          anonymous: draft.anonymous,
        })
      }
      toast.success(
        "Cảm ơn bạn đã đánh giá. Aivy sẽ kiểm duyệt trong 24h trước khi đăng công khai."
      )
      navigate(`/account/orders/${order.code}`)
    } catch (err) {
      console.error("[OrderReviewScreen] submit failed:", err)
      toast.error(
        err instanceof Error ? err.message : "Gửi đánh giá thất bại"
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (orderLoading) {
    return (
      <div className="container-acf flex items-center justify-center py-16 text-neutral-500">
        <Loader2 className="mr-2 animate-spin" size={18} /> Đang tải đơn hàng...
      </div>
    )
  }

  if (orderError) {
    return (
      <div className="container-acf py-12 text-center">
        <AlertTriangle className="mx-auto text-rose-500" size={32} />
        <h1 className="mt-3 text-xl font-bold text-neutral-900">
          Không tải được đơn hàng
        </h1>
        <p className="mt-1 text-sm text-neutral-600">{orderError}</p>
        <Link to="/account/orders" className="btn-primary mt-4 inline-flex">
          Về danh sách đơn hàng
        </Link>
      </div>
    )
  }

  if (!order) return <NotFound />

  if (!COMPLETED_STATUSES.has(order.status)) {
    return (
      <div className="container-acf py-12 text-center">
        <h1 className="text-2xl font-bold">Đơn hàng chưa được giao</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Bạn có thể đánh giá sản phẩm sau khi đơn hàng đã giao thành công.
        </p>
        <Link
          to={`/account/orders/${order.code}`}
          className="btn-primary mt-4 inline-flex"
        >
          Quay lại đơn hàng
        </Link>
      </div>
    )
  }

  return (
    <div className="container-acf py-4 lg:py-6">
      <nav className="mb-3 flex items-center gap-1 text-xs text-neutral-500">
        <Link to="/account/orders" className="hover:text-brand-red-600">
          Đơn hàng
        </Link>
        <span>/</span>
        <Link
          to={`/account/orders/${order.code}`}
          className="hover:text-brand-red-600"
        >
          {order.code}
        </Link>
        <span>/</span>
        <span className="text-neutral-700">Đánh giá</span>
      </nav>

      <h1 className="mb-1 text-2xl font-bold text-neutral-900">
        Đánh giá sản phẩm
      </h1>
      <p className="mb-5 text-sm text-neutral-600">
        Chia sẻ trải nghiệm của bạn để giúp shop và cộng đồng mua hàng chính
        hãng. Đánh giá <strong>Công khai</strong> sẽ hiện trên trang sản phẩm
        và trang cá nhân của bạn; <strong>Riêng tư</strong> chỉ shop và bạn
        thấy.
      </p>

      {allSubmitted && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
          Bạn đã đánh giá toàn bộ sản phẩm trong đơn này. Bạn có thể đổi
          chế độ Công khai / Riêng tư từ trang cá nhân.
        </div>
      )}

      <div className="space-y-5">
        {reviewableItems.map((item) => {
          const r =
            reviews[item.variantId] ?? {
              variantId: item.variantId,
              rating: 5,
              comment: "",
              photos: [],
              anonymous: false,
              visibility: "public" as ReviewVisibility,
              alreadySubmitted: false,
            }
          const disabled = r.alreadySubmitted
          return (
            <div key={item.variantId} className="card p-5">
              <div className="flex items-start gap-3">
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-16 w-16 shrink-0 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="line-clamp-2 text-sm font-semibold text-neutral-900">
                    {item.title}
                  </h3>
                  <div className="text-xs text-neutral-500">
                    {order.shopName}
                  </div>
                  {disabled && (
                    <span className="mt-1 inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                      Đã đánh giá
                    </span>
                  )}
                </div>
              </div>

              <div className="my-4 border-t border-neutral-100" />

              {/* Stars */}
              <div className="flex flex-col items-center gap-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      onClick={() =>
                        !disabled && updateReview(item.variantId, { rating: n })
                      }
                      disabled={disabled}
                      className="transition-transform hover:scale-110 disabled:hover:scale-100"
                      aria-label={`${n} sao`}
                    >
                      <Star
                        size={32}
                        className={cn(
                          n <= r.rating
                            ? "fill-brand-gold-400 text-brand-gold-400"
                            : "text-neutral-300"
                        )}
                      />
                    </button>
                  ))}
                </div>
                <div className="text-sm font-semibold text-brand-gold-600">
                  {RATING_LABELS[r.rating - 1]}
                </div>
              </div>

              {/* Visibility radios */}
              <div className="mt-4 grid grid-cols-2 gap-2">
                <label
                  className={cn(
                    "flex cursor-pointer items-start gap-2 rounded-lg border p-3 transition-colors",
                    r.visibility === "public"
                      ? "border-brand-red-300 bg-brand-red-50"
                      : "border-neutral-200 hover:border-neutral-300",
                    disabled && "cursor-not-allowed opacity-60"
                  )}
                >
                  <input
                    type="radio"
                    name={`visibility-${item.variantId}`}
                    value="public"
                    checked={r.visibility === "public"}
                    onChange={() =>
                      !disabled &&
                      updateReview(item.variantId, { visibility: "public" })
                    }
                    disabled={disabled}
                    className="mt-0.5"
                  />
                  <div>
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-neutral-900">
                      <Eye size={14} /> Công khai
                    </div>
                    <div className="mt-0.5 text-[11px] text-neutral-600">
                      Hiển thị trên trang sản phẩm và profile cá nhân của bạn.
                    </div>
                  </div>
                </label>
                <label
                  className={cn(
                    "flex cursor-pointer items-start gap-2 rounded-lg border p-3 transition-colors",
                    r.visibility === "private"
                      ? "border-neutral-700 bg-neutral-100"
                      : "border-neutral-200 hover:border-neutral-300",
                    disabled && "cursor-not-allowed opacity-60"
                  )}
                >
                  <input
                    type="radio"
                    name={`visibility-${item.variantId}`}
                    value="private"
                    checked={r.visibility === "private"}
                    onChange={() =>
                      !disabled &&
                      updateReview(item.variantId, { visibility: "private" })
                    }
                    disabled={disabled}
                    className="mt-0.5"
                  />
                  <div>
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-neutral-900">
                      <EyeOff size={14} /> Riêng tư
                    </div>
                    <div className="mt-0.5 text-[11px] text-neutral-600">
                      Chỉ shop và bạn thấy. Không lên trang sản phẩm.
                    </div>
                  </div>
                </label>
              </div>

              {/* Tags */}
              <div className="mt-4">
                <div className="mb-1.5 text-xs font-semibold text-neutral-600">
                  Tag gợi ý:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTED_TAGS.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => !disabled && addTag(item.variantId, tag)}
                      disabled={disabled}
                      className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs text-neutral-700 transition-colors hover:border-brand-red-300 hover:bg-brand-red-50 hover:text-brand-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment */}
              <textarea
                value={r.comment}
                onChange={(e) =>
                  !disabled &&
                  updateReview(item.variantId, { comment: e.target.value })
                }
                disabled={disabled}
                placeholder="Chia sẻ cảm nhận chi tiết về sản phẩm..."
                rows={3}
                className="input mt-3 resize-none"
                maxLength={500}
              />
              <div className="mt-1 text-right text-[10px] text-neutral-400">
                {r.comment.length}/500
              </div>

              {/* Photos */}
              <div className="mt-2">
                <div className="mb-1.5 text-xs font-semibold text-neutral-600">
                  Hình ảnh (tối đa 5):
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {r.photos.map((url, i) => (
                    <div
                      key={i}
                      className="relative aspect-square overflow-hidden rounded-lg bg-neutral-100"
                    >
                      <img
                        src={url}
                        alt={`Ảnh ${i + 1}`}
                        className="h-full w-full object-cover"
                      />
                      {!disabled && (
                        <button
                          onClick={() =>
                            updateReview(item.variantId, {
                              photos: r.photos.filter((_, idx) => idx !== i),
                            })
                          }
                          className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white"
                        >
                          <X size={10} />
                        </button>
                      )}
                    </div>
                  ))}
                  {!disabled && r.photos.length < 5 && (
                    <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-neutral-300 bg-neutral-50 text-xs text-neutral-500 hover:border-brand-red-400 hover:text-brand-red-600">
                      <Upload size={16} />
                      <span className="text-[10px]">Tải lên</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => handlePhotoUpload(item.variantId, e)}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Anonymous */}
              <label
                className={cn(
                  "mt-3 flex items-center gap-2 text-xs",
                  disabled
                    ? "cursor-not-allowed text-neutral-400"
                    : "text-neutral-600"
                )}
              >
                <input
                  type="checkbox"
                  checked={r.anonymous}
                  onChange={(e) =>
                    !disabled &&
                    updateReview(item.variantId, {
                      anonymous: e.target.checked,
                    })
                  }
                  disabled={disabled}
                  className="h-4 w-4 rounded text-brand-red-500"
                />
                Đánh giá ẩn danh (shop chỉ thấy "Khách hàng")
              </label>
            </div>
          )
        })}

        {/* Rewards (informational only — points are awarded server-side
            after the review is approved). */}
        <div className="card overflow-hidden bg-gradient-to-r from-brand-gold-50 to-brand-red-50 p-5">
          <div className="flex items-start gap-3">
            <Gift className="text-brand-gold-600" />
            <div className="flex-1">
              <h3 className="font-bold text-neutral-900">
                Sẽ được cộng{" "}
                <span className="text-brand-red-600">
                  +{50 * reviewableItems.length} điểm thưởng
                </span>{" "}
                khi đánh giá được duyệt
              </h3>
              <p className="mt-1 text-xs text-neutral-700">
                Đánh giá có hình ảnh & ≥ 50 ký tự được tặng thêm 30 điểm.
                Đánh giá Riêng tư vẫn được cộng điểm.
              </p>
            </div>
            <Sparkles className="hidden text-brand-gold-500 md:block" />
          </div>
        </div>

        <div className="flex gap-2">
          <Link
            to={`/account/orders/${order.code}`}
            className="btn-secondary flex-1 justify-center"
          >
            {allSubmitted ? "Xong" : "Bỏ qua"}
          </Link>
          {!allSubmitted && (
            <button
              onClick={submit}
              disabled={submitting}
              className="btn-primary flex-1 justify-center text-base"
            >
              {submitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Đang gửi...
                </>
              ) : (
                "Gửi đánh giá"
              )}
            </button>
          )}
        </div>

        <div className="flex items-center justify-center gap-2 text-[11px] text-neutral-500">
          <ShieldCheck size={12} className="text-emerald-500" />
          Đánh giá được Aivy kiểm duyệt trong 24h để đảm bảo trung thực,
          không spam.
        </div>
      </div>
    </div>
  )
}
