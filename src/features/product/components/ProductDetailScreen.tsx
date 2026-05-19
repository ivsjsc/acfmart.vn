import { useEffect, useMemo, useState } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import {
  ShieldCheck,
  Heart,
  Share2,
  Minus,
  Plus,
  ShoppingCart,
  Zap,
  Star,
  Truck,
  Award,
  MessageSquare,
  Store,
  QrCode,
  Loader2,
  AlertCircle,
  Copy,
  X,
  ExternalLink,
} from "lucide-react"
import toast from "react-hot-toast"
import { formatCurrency } from "../../../lib/format"
import { useCartStore } from "../../../stores/cart-store"
import { useWishlistStore } from "../../../stores/wishlist-store"
import { useAuthStore } from "../../../stores/auth-store"
import { ProductCard } from "../../../components/ProductCard"
import { cn } from "../../../lib/cn"
import { NotFound } from "../../../pages/NotFound"
import { useApprovedProductByHandle } from "../../../hooks/use-products"
import {
  listApprovedProducts,
  productDocToCardShape,
  type ProductDoc,
  type ProductVariantInput,
} from "../../../lib/product-service"
import {
  createAffiliateLink,
  type AffiliateLink,
} from "../../../lib/affiliate-service"
import { unwrapServiceResult } from "../../../lib/service-result"
import { sanitizeUserError } from "../../../lib/error-utils"

interface VariantView {
  id: string
  title: string
  price: number
  stock: number
}

interface DetailView {
  id: string
  handle: string
  title: string
  description: string
  price: number
  originalPrice: number | null
  images: string[]
  thumbnail: string
  variants: VariantView[]
  rating: number
  reviewCount: number
  sold: number
  shopId: string
  shopName: string
  brand: string
  verified: boolean
  category: string
  categorySlug: string
  inventory: number
  specs: { name: string; value: string }[]
}

function categoryToSlug(category: string): string {
  return category
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

function buildVariants(p: ProductDoc): VariantView[] {
  if (p.variants.length === 0) {
    return [
      {
        id: "default",
        title: "Mặc định",
        price: p.basePrice,
        stock: p.totalStock || 0,
      },
    ]
  }
  return p.variants.map((variant: ProductVariantInput) => ({
    id: variant.id,
    title: variant.title || variant.sku || "Phân loại",
    price: variant.price || p.basePrice,
    stock: variant.stock,
  }))
}

function buildSpecs(p: ProductDoc): { name: string; value: string }[] {
  const specs: { name: string; value: string }[] = []
  if (p.weightGrams) specs.push({ name: "Khối lượng", value: `${p.weightGrams}g` })
  if (p.dimensions) {
    specs.push({
      name: "Kích thước",
      value: `${p.dimensions.length} × ${p.dimensions.width} × ${p.dimensions.height} cm`,
    })
  }
  specs.push({ name: "Gian hàng", value: p.shopName })
  specs.push({
    name: "Trạng thái",
    value: p.acfVerified ? "Đã xác thực ACF" : "Đã kiểm duyệt",
  })
  return specs
}

function productDocToDetail(p: ProductDoc): DetailView {
  const fallback = "https://placehold.co/800x800/f5f5f5/a3a3a3?text=ACFMart"
  const images = p.images.length > 0 ? p.images : [p.thumbnail || fallback]
  return {
    id: p.id,
    handle: p.handle,
    title: p.title,
    description: p.description ?? "",
    price: p.basePrice,
    originalPrice: null,
    images,
    thumbnail: p.thumbnail || images[0],
    variants: buildVariants(p),
    rating: p.rating,
    reviewCount: p.reviewCount,
    sold: p.totalSold,
    shopId: p.shopId,
    shopName: p.shopName,
    brand: p.brand,
    verified: p.acfVerified || p.acfVerifyStatus === "approved",
    category: p.category,
    categorySlug: categoryToSlug(p.category),
    inventory: p.totalStock,
    specs: buildSpecs(p),
  }
}

export default function ProductDetailScreen() {
  const { id: handle } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const approvedProduct = useApprovedProductByHandle(handle)

  const product = useMemo<DetailView | null>(
    () => (approvedProduct.data ? productDocToDetail(approvedProduct.data) : null),
    [approvedProduct.data]
  )

  // Related products from same category, excluding current item
  const related = useQuery({
    queryKey: ["product", "related", product?.category],
    enabled: !!product?.category,
    queryFn: () => listApprovedProducts({ category: product!.category, limitCount: 12 }),
    staleTime: 60_000,
  })
  const relatedCards = useMemo(() => {
    if (!related.data || !product) return []
    return related.data
      .filter((p) => p.id !== product.id)
      .slice(0, 6)
      .map(productDocToCardShape)
  }, [related.data, product])

  const addToCart = useCartStore((s) => s.addItem)
  const inWishlist = useWishlistStore((s) => (product ? s.has(product.id) : false))
  const addToWishlist = useWishlistStore((s) => s.add)
  const removeFromWishlist = useWishlistStore((s) => s.remove)

  const [activeImage, setActiveImage] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState<string | null>(
    product?.variants[0]?.id ?? null
  )
  const [quantity, setQuantity] = useState(1)
  const [tab, setTab] = useState<"description" | "reviews" | "specs">("description")
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [shareLink, setShareLink] = useState<AffiliateLink | null>(null)
  const [creatingShare, setCreatingShare] = useState(false)

  const currentUser = useAuthStore((s) => s.user)

  useEffect(() => {
    setActiveImage(0)
    setSelectedVariant(product?.variants[0]?.id ?? null)
    setQuantity(1)
  }, [product?.id])

  if (approvedProduct.isLoading) {
    return (
      <div className="container-acf flex min-h-[50vh] items-center justify-center">
        <Loader2 className="animate-spin text-brand-red-500" size={30} />
      </div>
    )
  }

  if (approvedProduct.isError) {
    return (
      <div className="container-acf py-12">
        <div className="card flex items-start gap-3 border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold">Không tải được sản phẩm</p>
            <p className="mt-0.5 text-xs">
              {approvedProduct.error instanceof Error
                ? approvedProduct.error.message
                : "Có lỗi xảy ra"}
            </p>
            <button
              onClick={() => approvedProduct.refetch()}
              className="btn-secondary mt-3 text-xs"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!product) return <NotFound />

  const variant = product.variants.find((v) => v.id === selectedVariant) ?? product.variants[0]
  const stock = variant?.stock ?? product.inventory ?? 0
  const displayPrice = variant?.price ?? product.price
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  function handleAddToCart() {
    if (!product || !variant) return false
    const result = addToCart({
      id: `${product.id}_${variant.id}`,
      productId: product.id,
      variantId: variant.id,
      title: variant.id === "default" ? product.title : `${product.title} - ${variant.title}`,
      thumbnail: product.images[0],
      price: variant.price,
      shopId: product.shopId,
      shopName: product.shopName,
      isVerified: product.verified,
      quantity,
    })
    if (!result.ok) {
      toast.error(result.message ?? "Không thể thêm vào giỏ hàng")
      return false
    }
    toast.success("Đã thêm vào giỏ hàng")
    return true
  }

  function handleBuyNow() {
    if (handleAddToCart()) {
      navigate("/cart")
    }
  }

  function toggleWishlist() {
    if (!product) return
    if (inWishlist) {
      removeFromWishlist(product.id)
      toast("Đã bỏ khỏi yêu thích")
    } else {
      addToWishlist({
        productId: product.id,
        handle: product.handle,
        title: product.title,
        thumbnail: product.images[0],
        price: product.price,
        shopName: product.shopName,
      })
      toast.success("Đã thêm vào yêu thích")
    }
  }

  return (
    <div className="container-acf py-4 lg:py-6">
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-1 text-xs text-neutral-500">
        <Link to="/" className="hover:text-brand-red-600">
          Trang chủ
        </Link>
        <span>/</span>
        <Link
          to={`/categories/${encodeURIComponent(product.category)}`}
          className="hover:text-brand-red-600"
        >
          {product.category}
        </Link>
        <span>/</span>
        <span className="truncate text-neutral-700">{product.title}</span>
      </nav>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Image gallery */}
        <div>
          <div className="card overflow-hidden">
            <div className="relative aspect-square bg-neutral-100">
              <img
                src={product.images[activeImage]}
                alt={product.title}
                className="h-full w-full object-cover"
              />
              {discount > 0 && (
                <span className="absolute left-3 top-3 rounded-md bg-brand-red-500 px-2 py-0.5 text-xs font-bold text-white">
                  -{discount}%
                </span>
              )}
            </div>
          </div>
          {product.images.length > 1 && (
            <div className="mt-3 grid grid-cols-5 gap-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={cn(
                    "aspect-square overflow-hidden rounded-lg border-2 bg-neutral-100",
                    activeImage === i ? "border-brand-red-500" : "border-transparent"
                  )}
                >
                  <img
                    src={img}
                    alt={`${product.title} ${i + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          {product.verified && (
            <div className="mb-3 inline-flex items-center gap-2 rounded-lg border border-brand-gold-200 bg-brand-gold-50 px-3 py-1.5 text-xs font-medium text-brand-gold-800">
              <ShieldCheck size={14} />
              <span>Đã được Quỹ Chống Hàng Giả Việt Nam xác thực</span>
            </div>
          )}

          <h1 className="text-2xl font-bold leading-tight text-neutral-900 lg:text-3xl">
            {product.title}
          </h1>

          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-neutral-600">
            <span className="flex items-center gap-1">
              <Star size={14} className="fill-brand-gold-400 text-brand-gold-400" />
              <strong className="text-neutral-900">{product.rating || "—"}</strong>
              <span>({product.reviewCount} đánh giá)</span>
            </span>
            <span className="h-3 w-px bg-neutral-300" />
            <span>Đã bán {product.sold.toLocaleString("vi-VN")}</span>
            <span className="h-3 w-px bg-neutral-300" />
            <span className="text-neutral-400">
              Brand: <strong className="text-neutral-700">{product.brand}</strong>
            </span>
          </div>

          {/* Price */}
          <div className="mt-4 rounded-xl bg-gradient-to-r from-brand-red-50 to-white p-4">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-brand-red-600">
                {formatCurrency(displayPrice)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-base text-neutral-400 line-through">
                  {formatCurrency(product.originalPrice)}
                </span>
              )}
            </div>
          </div>

          {/* Variants */}
          {product.variants.length > 1 && (
            <div className="mt-5">
              <div className="mb-2 text-sm font-semibold text-neutral-700">Phân loại</div>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => {
                  const isSelected = variant?.id === v.id
                  const outOfStock = v.stock <= 0
                  return (
                    <button
                      key={v.id}
                      onClick={() => !outOfStock && setSelectedVariant(v.id)}
                      disabled={outOfStock}
                      className={cn(
                        "min-w-[80px] rounded-lg border px-3 py-1.5 text-sm transition-colors",
                        outOfStock && "cursor-not-allowed opacity-40",
                        isSelected
                          ? "border-brand-red-500 bg-brand-red-50 font-semibold text-brand-red-700"
                          : "border-neutral-300 bg-white text-neutral-700 hover:border-brand-red-300"
                      )}
                    >
                      {v.title}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="mt-5 flex items-center gap-4">
            <div className="text-sm font-semibold text-neutral-700">Số lượng</div>
            <div className="flex items-center gap-0 rounded-lg border border-neutral-300">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="flex h-9 w-9 items-center justify-center text-neutral-700 hover:bg-neutral-50"
                aria-label="Giảm"
              >
                <Minus size={14} />
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) =>
                  setQuantity(
                    Math.max(1, Math.min(stock || 1, parseInt(e.target.value) || 1))
                  )
                }
                className="w-12 border-0 bg-transparent text-center text-sm focus:outline-none"
                min={1}
                max={stock || 1}
              />
              <button
                onClick={() => setQuantity(Math.min(stock || 1, quantity + 1))}
                className="flex h-9 w-9 items-center justify-center text-neutral-700 hover:bg-neutral-50"
                aria-label="Tăng"
              >
                <Plus size={14} />
              </button>
            </div>
            <span className="text-xs text-neutral-500">
              {stock > 0 ? `Còn ${stock} sản phẩm` : "Hết hàng"}
            </span>
          </div>

          {/* CTA */}
          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              onClick={handleAddToCart}
              disabled={stock <= 0}
              className="btn-secondary justify-center disabled:opacity-50"
            >
              <ShoppingCart size={18} />
              Thêm giỏ hàng
            </button>
            <button
              onClick={handleBuyNow}
              disabled={stock <= 0}
              className="btn-primary justify-center disabled:opacity-50"
            >
              <Zap size={18} />
              Mua ngay
            </button>
          </div>

          <div className="mt-3 flex gap-2">
            <button onClick={toggleWishlist} className="btn-secondary flex-1 justify-center">
              <Heart
                size={16}
                fill={inWishlist ? "currentColor" : "none"}
                className={inWishlist ? "text-brand-red-500" : ""}
              />
              {inWishlist ? "Đã yêu thích" : "Yêu thích"}
            </button>
            <button className="btn-secondary flex-1 justify-center">
              <Share2 size={16} />
              Chia sẻ
            </button>
            <Link to="/qr-verify" className="btn-secondary flex-1 justify-center">
              <QrCode size={16} />
              Quét QR
            </Link>
          </div>

          {/* Trust */}
          <div className="mt-5 grid grid-cols-3 gap-3 rounded-xl bg-neutral-50 p-3 text-xs">
            {[
              { icon: Truck, label: "Giao 2-4 ngày" },
              { icon: Award, label: "Đổi trả 7 ngày" },
              { icon: ShieldCheck, label: "Chính hãng 100%" },
            ].map((f) => (
              <div
                key={f.label}
                className="flex flex-col items-center gap-1 text-center text-neutral-600"
              >
                <f.icon size={18} className="text-brand-red-500" />
                <span>{f.label}</span>
              </div>
            ))}
          </div>

          {/* Shop card */}
          <div className="mt-5 overflow-hidden rounded-xl border border-neutral-200 bg-white">
            <Link
              to={`/u/${product.shopId}`}
              className="flex items-center gap-3 p-4 transition-colors hover:bg-neutral-50"
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-red-100 text-lg font-extrabold text-brand-red-700">
                {product.shopName[0]?.toUpperCase() ?? "?"}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-base font-bold text-neutral-900">
                    {product.shopName}
                  </span>
                  {product.verified && (
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-brand-gold-50 px-2 py-0.5 text-[10px] font-bold text-brand-gold-700">
                      <ShieldCheck size={10} /> Xác thực ACF
                    </span>
                  )}
                </div>
                <div className="mt-0.5 text-xs text-neutral-500">
                  Xem thông tin shop & sản phẩm khác
                </div>
              </div>
            </Link>
            <div className="flex border-t border-neutral-100">
              <Link
                to={`/u/${product.shopId}`}
                className="flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-neutral-700 transition-colors hover:bg-neutral-50 hover:text-brand-red-600"
              >
                <Store size={14} /> Xem shop
              </Link>
              <div className="w-px bg-neutral-100" />
              <Link
                to="/account/chat"
                className="flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-brand-red-600 transition-colors hover:bg-brand-red-50"
              >
                <MessageSquare size={14} /> Chat ngay
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-8 overflow-hidden rounded-xl border border-neutral-200 bg-white">
        <div className="flex border-b border-neutral-200">
          {(["description", "specs", "reviews"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "relative flex-1 px-4 py-3.5 text-sm font-semibold transition-colors",
                tab === t
                  ? "text-brand-red-600"
                  : "text-neutral-500 hover:text-neutral-900"
              )}
            >
              {t === "description" && "Mô tả sản phẩm"}
              {t === "specs" && "Thông số"}
              {t === "reviews" && `Đánh giá (${product.reviewCount})`}
              {tab === t && (
                <span className="absolute bottom-0 left-1/2 h-0.5 w-12 -translate-x-1/2 rounded-full bg-brand-red-500" />
              )}
            </button>
          ))}
        </div>

        <div className="p-5">
          {tab === "description" && (
            <div>
              {product.description ? (
                <div className="whitespace-pre-line text-sm leading-relaxed text-neutral-700">
                  {product.description}
                </div>
              ) : (
                <div className="flex flex-col items-center py-8 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100">
                    <AlertCircle size={20} className="text-neutral-300" />
                  </div>
                  <p className="mt-3 text-sm font-medium text-neutral-500">
                    Shop chưa cập nhật mô tả sản phẩm.
                  </p>
                </div>
              )}
              {/* Category + Brand info */}
              <div className="mt-5 rounded-lg bg-neutral-50 p-4">
                <div className="grid gap-3 text-sm sm:grid-cols-2">
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-500">Danh mục:</span>
                    <Link
                      to={`/categories/${encodeURIComponent(product.category)}`}
                      className="font-medium text-brand-red-600 hover:underline"
                    >
                      {product.category}
                    </Link>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-500">Thương hiệu:</span>
                    <span className="font-medium text-neutral-900">{product.brand}</span>
                  </div>
                  {product.verified && (
                    <div className="flex items-center gap-2 sm:col-span-2">
                      <span className="text-neutral-500">Xác thực:</span>
                      <span className="inline-flex items-center gap-1 font-medium text-brand-gold-700">
                        <ShieldCheck size={14} className="text-brand-gold-500" />
                        Quỹ Chống Hàng Giả Việt Nam
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          {tab === "specs" && (
            <div>
              {product.specs.length > 0 ? (
                <div className="overflow-hidden rounded-lg border border-neutral-100">
                  {product.specs.map((s, i) => (
                    <div
                      key={s.name}
                      className={cn(
                        "grid grid-cols-3 gap-4 px-4 py-3 text-sm",
                        i % 2 === 0 ? "bg-neutral-50" : "bg-white"
                      )}
                    >
                      <span className="font-medium text-neutral-500">{s.name}</span>
                      <span className="col-span-2 text-neutral-900">{s.value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center py-8 text-center">
                  <p className="text-sm text-neutral-500">Chưa có thông số kỹ thuật.</p>
                </div>
              )}
            </div>
          )}
          {tab === "reviews" && (
            <div className="flex flex-col items-center py-8 text-center">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    size={20}
                    className={cn(
                      n <= Math.round(product.rating)
                        ? "fill-brand-gold-400 text-brand-gold-400"
                        : "text-neutral-200"
                    )}
                  />
                ))}
              </div>
              <p className="mt-2 text-2xl font-bold text-neutral-900">
                {product.rating > 0 ? product.rating.toFixed(1) : "—"}
              </p>
              <p className="mt-1 text-sm text-neutral-500">
                {product.reviewCount} đánh giá
              </p>
              <p className="mt-4 text-xs text-neutral-400">
                Tính năng đánh giá chi tiết đang phát triển.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Related */}
      {relatedCards.length > 0 && (
        <div className="mt-10">
          <h2 className="mb-4 text-xl font-bold text-neutral-900">Sản phẩm liên quan</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
            {relatedCards.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
