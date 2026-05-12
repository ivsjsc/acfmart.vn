import { useState } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import {
  Star,
  Upload,
  X,
  Loader2,
  Sparkles,
  ShieldCheck,
  Gift,
} from "lucide-react"
import toast from "react-hot-toast"
import { findOrderByCode } from "../../../lib/mock-data"
import { cn } from "../../../lib/cn"
import { NotFound } from "../../../pages/NotFound"

interface ItemReview {
  variantId: string
  rating: number
  comment: string
  photos: string[]
  anonymous: boolean
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

export default function OrderReviewScreen() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const order = id ? findOrderByCode(id) : null

  const [reviews, setReviews] = useState<Record<string, ItemReview>>(
    () =>
      Object.fromEntries(
        (order?.items ?? []).map((it) => [
          it.variantId,
          {
            variantId: it.variantId,
            rating: 5,
            comment: "",
            photos: [],
            anonymous: false,
          },
        ])
      )
  )
  const [loading, setLoading] = useState(false)

  if (!order) return <NotFound />
  if (order.status !== "delivered") {
    return (
      <div className="container-acf py-12 text-center">
        <h1 className="text-2xl font-bold">Đơn hàng chưa được giao</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Bạn có thể đánh giá sản phẩm sau khi đơn hàng đã giao thành công.
        </p>
        <Link to={`/orders/${order.code}`} className="btn-primary mt-4">
          Quay lại đơn hàng
        </Link>
      </div>
    )
  }

  function updateReview(variantId: string, patch: Partial<ItemReview>) {
    setReviews((prev) => ({
      ...prev,
      [variantId]: { ...prev[variantId], ...patch },
    }))
  }

  function addTag(variantId: string, tag: string) {
    const current = reviews[variantId]
    const next = current.comment
      ? current.comment + (current.comment.endsWith(" ") ? "" : " ") + `· ${tag}`
      : tag
    updateReview(variantId, { comment: next })
  }

  function handlePhotoUpload(variantId: string, e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files) return
    const current = reviews[variantId]
    const remaining = 5 - current.photos.length
    const newPhotos = Array.from(files)
      .slice(0, remaining)
      .map((f) => URL.createObjectURL(f))
    updateReview(variantId, { photos: [...current.photos, ...newPhotos] })
  }

  async function submit() {
    const incomplete = Object.values(reviews).find(
      (r) => r.rating < 1 || (r.rating <= 3 && !r.comment.trim())
    )
    if (incomplete) {
      toast.error(
        "Đánh giá dưới 3 sao cần kèm bình luận để giúp shop cải thiện"
      )
      return
    }
    setLoading(true)
    try {
      await new Promise((r) => setTimeout(r, 1100))
      toast.success("Cảm ơn bạn đã đánh giá! +50 điểm thưởng đã cộng vào tài khoản")
      navigate(`/orders/${order.code}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gửi đánh giá thất bại")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container-acf py-4 lg:py-6">
      <nav className="mb-3 flex items-center gap-1 text-xs text-neutral-500">
        <Link to="/orders" className="hover:text-brand-red-600">Đơn hàng</Link>
        <span>/</span>
        <Link to={`/orders/${order.code}`} className="hover:text-brand-red-600">{order.code}</Link>
        <span>/</span>
        <span className="text-neutral-700">Đánh giá</span>
      </nav>

      <h1 className="mb-1 text-2xl font-bold text-neutral-900">
        Đánh giá sản phẩm
      </h1>
      <p className="mb-5 text-sm text-neutral-600">
        Chia sẻ trải nghiệm của bạn để giúp shop & cộng đồng ACFMart. Mỗi đánh
        giá <strong>+50 điểm thưởng</strong>.
      </p>

      <div className="space-y-5">
        {order.items.map((item) => {
          const r = reviews[item.variantId]
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
                  <div className="text-xs text-neutral-500">{item.shopName}</div>
                </div>
              </div>

              <div className="my-4 border-t border-neutral-100" />

              {/* Stars */}
              <div className="flex flex-col items-center gap-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      onClick={() => updateReview(item.variantId, { rating: n })}
                      className="transition-transform hover:scale-110"
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

              {/* Tags */}
              <div className="mt-4">
                <div className="mb-1.5 text-xs font-semibold text-neutral-600">
                  Tag gợi ý:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTED_TAGS.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => addTag(item.variantId, tag)}
                      className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs text-neutral-700 transition-colors hover:border-brand-red-300 hover:bg-brand-red-50 hover:text-brand-red-700"
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
                  updateReview(item.variantId, { comment: e.target.value })
                }
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
                      <img src={url} alt={`Ảnh ${i + 1}`} className="h-full w-full object-cover" />
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
                    </div>
                  ))}
                  {r.photos.length < 5 && (
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
              <label className="mt-3 flex items-center gap-2 text-xs text-neutral-600">
                <input
                  type="checkbox"
                  checked={r.anonymous}
                  onChange={(e) =>
                    updateReview(item.variantId, { anonymous: e.target.checked })
                  }
                  className="h-4 w-4 rounded text-brand-red-500"
                />
                Đánh giá ẩn danh (shop chỉ thấy "Khách hàng ACFMart")
              </label>
            </div>
          )
        })}

        {/* Rewards */}
        <div className="card overflow-hidden bg-gradient-to-r from-brand-gold-50 to-brand-red-50 p-5">
          <div className="flex items-start gap-3">
            <Gift className="text-brand-gold-600" />
            <div className="flex-1">
              <h3 className="font-bold text-neutral-900">
                Bạn sẽ nhận được{" "}
                <span className="text-brand-red-600">
                  +{50 * order.items.length} điểm thưởng
                </span>
              </h3>
              <p className="mt-1 text-xs text-neutral-700">
                Tích điểm để đổi voucher giảm giá. Đánh giá có hình ảnh & ≥ 50 ký tự
                được tặng thêm 30 điểm.
              </p>
            </div>
            <Sparkles className="hidden text-brand-gold-500 md:block" />
          </div>
        </div>

        <div className="flex gap-2">
          <Link to={`/orders/${order.code}`} className="btn-secondary flex-1 justify-center">
            Bỏ qua
          </Link>
          <button
            onClick={submit}
            disabled={loading}
            className="btn-primary flex-1 justify-center text-base"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Đang gửi...
              </>
            ) : (
              "Gửi đánh giá"
            )}
          </button>
        </div>

        <div className="flex items-center justify-center gap-2 text-[11px] text-neutral-500">
          <ShieldCheck size={12} className="text-emerald-500" />
          Đánh giá được duyệt trong 24h để đảm bảo trung thực, không spam.
        </div>
      </div>
    </div>
  )
}
