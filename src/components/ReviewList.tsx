import { Star, User, Calendar, ThumbsUp, MessageSquare } from "lucide-react"
import { cn } from "../lib/cn"
import type { ReviewDoc } from "../lib/review-service"
import { formatRelativeTime } from "../lib/format"

interface ReviewListProps {
  reviews: ReviewDoc[]
  isLoading?: boolean
}

export function ReviewList({ reviews, isLoading }: ReviewListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3 rounded-lg border border-neutral-100 p-4">
            <div className="h-10 w-10 animate-pulse rounded-full bg-neutral-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 animate-pulse rounded bg-neutral-200" />
              <div className="h-3 w-24 animate-pulse rounded bg-neutral-200" />
              <div className="h-16 w-full animate-pulse rounded bg-neutral-200" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (reviews.length === 0) {
    return (
      <div className="flex flex-col items-center py-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
          <MessageSquare size={28} className="text-neutral-300" />
        </div>
        <p className="mt-3 text-sm font-medium text-neutral-500">
          Chưa có đánh giá nào cho sản phẩm này.
        </p>
        <p className="mt-1 text-xs text-neutral-400">
          Hãy là người đầu tiên đánh giá sau khi mua hàng.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </div>
  )
}

interface ReviewCardProps {
  review: ReviewDoc
}

function ReviewCard({ review }: ReviewCardProps) {
  const createdAt = review.createdAt?.toDate?.() ?? new Date()
  
  return (
    <div className="rounded-lg border border-neutral-100 p-4 transition-colors hover:bg-neutral-50">
      {/* Header */}
      <div className="flex items-start gap-3">
        {/* Avatar */}
        {review.anonymous ? (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-neutral-500">
            <User size={18} />
          </div>
        ) : review.userAvatar ? (
          <img
            src={review.userAvatar}
            alt={review.userName}
            className="h-10 w-10 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-red-100 text-sm font-bold text-brand-red-700">
            {review.userName[0]?.toUpperCase() ?? "?"}
          </div>
        )}

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-900">
              {review.anonymous ? "Người dùng ẩn danh" : review.userName}
            </span>
            {review.status === "approved" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                Đã xác minh mua hàng
              </span>
            )}
          </div>

          {/* Rating */}
          <div className="mt-1 flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <Star
                key={n}
                size={14}
                className={cn(
                  n <= review.rating
                    ? "fill-brand-gold-400 text-brand-gold-400"
                    : "text-neutral-200"
                )}
              />
            ))}
          </div>

          {/* Date */}
          <div className="mt-1 flex items-center gap-1 text-xs text-neutral-500">
            <Calendar size={12} />
            <span>{formatRelativeTime(createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Comment */}
      {review.comment && (
        <div className="mt-3 whitespace-pre-line text-sm leading-relaxed text-neutral-700">
          {review.comment}
        </div>
      )}

      {/* Photos */}
      {review.photos && review.photos.length > 0 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
          {review.photos.map((photo, i) => (
            <img
              key={i}
              src={photo}
              alt={`Ảnh đánh giá ${i + 1}`}
              className="h-20 w-20 shrink-0 rounded-lg object-cover"
            />
          ))}
        </div>
      )}

      {/* Tags */}
      {review.tags && review.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {review.tags.map((tag, i) => (
            <span
              key={i}
              className="rounded-full bg-neutral-100 px-2.5 py-1 text-[10px] font-medium text-neutral-600"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Helpful button (placeholder) */}
      <div className="mt-3 flex items-center gap-2">
        <button className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 px-3 py-1 text-xs text-neutral-600 transition-colors hover:border-neutral-300 hover:bg-neutral-50">
          <ThumbsUp size={12} />
          Hữu ích
        </button>
      </div>
    </div>
  )
}
