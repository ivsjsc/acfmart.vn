import { Link } from "react-router-dom"
import { ShieldCheck, Heart } from "lucide-react"
import { formatCurrency } from "../lib/format"
import { useWishlistStore } from "../stores/wishlist-store"
import { cn } from "../lib/cn"
import { PLACEHOLDER_IMAGE } from "../lib/constants"
import type { MockProduct } from "../lib/mock-data"

// ... rest of the component remains the same
interface ProductCardProps {
  product: MockProduct
  variant?: "default" | "compact"
}

export function ProductCard({ product, variant = "default" }: ProductCardProps) {
  const inWishlist = useWishlistStore((s) => s.has(product.id))
  const addToWishlist = useWishlistStore((s) => s.add)
  const removeFromWishlist = useWishlistStore((s) => s.remove)

  const discount = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
      )
    : 0

  // Get the first image or fallback to a placeholder
  const firstImage = product.images && product.images.length > 0 ? product.images[0] : PLACEHOLDER_IMAGE

  function toggleWishlist(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (inWishlist) {
      removeFromWishlist(product.id)
    } else {
      addToWishlist({
        productId: product.id,
        handle: product.handle,
        title: product.title,
        thumbnail: firstImage,
        price: product.price,
        shopName: product.shopName,
      })
    }
  }

  return (
    <Link
      to={`/products/${product.handle}`}
      className="group card relative overflow-hidden transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-square overflow-hidden bg-neutral-100">
        <img
          src={firstImage}
          alt={product.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        {discount > 0 && (
          <span className="absolute left-2 top-2 rounded-md bg-brand-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
            -{discount}%
          </span>
        )}
        {product.verified && (
          <span className="absolute right-2 top-2 flex items-center gap-1 rounded-md bg-brand-gold-500/95 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
            <ShieldCheck size={10} /> Chính hãng
          </span>
        )}
        <button
          onClick={toggleWishlist}
          className={cn(
            "absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 shadow-md transition-colors",
            inWishlist
              ? "text-brand-red-500"
              : "text-neutral-400 hover:text-brand-red-500"
          )}
          aria-label={inWishlist ? "Bỏ yêu thích" : "Thêm yêu thích"}
        >
          <Heart size={16} fill={inWishlist ? "currentColor" : "none"} />
        </button>
      </div>

      <div className={cn("p-3", variant === "compact" && "p-2")}>
        <h3
          className={cn(
            "line-clamp-2 font-medium text-neutral-900 transition-colors group-hover:text-brand-red-600",
            variant === "compact" ? "text-xs" : "text-sm"
          )}
        >
          {product.title}
        </h3>

        <div className="mt-1.5 flex items-baseline gap-1.5">
          <span className="font-bold text-brand-red-600">
            {formatCurrency(product.price)}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-[10px] text-neutral-400 line-through">
              {formatCurrency(product.originalPrice)}
            </span>
          )}
        </div>

        <div className="mt-1.5 flex items-center justify-between text-[10px] text-neutral-500">
          <span className="flex items-center gap-0.5">
            ⭐ {product.rating}
            <span className="text-neutral-400">({product.reviewCount})</span>
          </span>
          <span>Đã bán {product.sold?.toLocaleString("vi-VN") ?? '0'}</span>
        </div>

        <div className="mt-1.5 truncate text-[10px] text-neutral-400">
          {product.shopName}
        </div>
      </div>
    </Link>
  )
}
