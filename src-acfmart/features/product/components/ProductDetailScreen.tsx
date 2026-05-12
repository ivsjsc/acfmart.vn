import { useState } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
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
} from "lucide-react"
import toast from "react-hot-toast"
import { findProductByHandle, findShopById } from "../../../lib/mock-data"
import { formatCurrency } from "../../../lib/format"
import { useCartStore } from "../../../stores/cart-store"
import { useWishlistStore } from "../../../stores/wishlist-store"
import { ProductCard } from "../../../components/ProductCard"
import { MOCK_PRODUCTS } from "../../../lib/mock-data"
import { cn } from "../../../lib/cn"
import { NotFound } from "../../../pages/NotFound"

export default function ProductDetailScreen() {
  const { id: handle } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const product = handle ? findProductByHandle(handle) : null
  const shop = product ? findShopById(product.shopId) : null

  const addToCart = useCartStore((s) => s.addItem)
  const inWishlist = useWishlistStore((s) => product ? s.has(product.id) : false)
  const addToWishlist = useWishlistStore((s) => s.add)
  const removeFromWishlist = useWishlistStore((s) => s.remove)

  const [activeImage, setActiveImage] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState(
    product?.variants?.[0]?.id ?? null
  )
  const [quantity, setQuantity] = useState(1)
  const [tab, setTab] = useState<"description" | "reviews" | "specs">("description")

  if (!product) return <NotFound />

  const variant = product.variants?.find((v) => v.id === selectedVariant)
  const stock = variant?.stock ?? 99
  const discount = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
      )
    : 0

  function handleAddToCart() {
    if (!product || !variant) return
    addToCart({
      id: `${product.id}_${variant.id}`,
      productId: product.id,
      variantId: variant.id,
      title: `${product.title} - ${variant.title}`,
      thumbnail: product.images[0],
      price: variant.price,
      shopId: product.shopId,
      shopName: product.shopName,
      isVerified: product.verified,
      quantity,
    })
    toast.success("Đã thêm vào giỏ hàng")
  }

  function handleBuyNow() {
    handleAddToCart()
    navigate("/cart")
  }

  function toggleWishlist() {
    if (!product) return
    if (inWishlist) {
      removeFromWishlist(product.id)
      toast("Đã bỏ khỏi yêu thích")
    } else {
      addToWishlist({
        productId: product.id,
        title: product.title,
        thumbnail: product.images[0],
        price: product.price,
        shopName: product.shopName,
      })
      toast.success("Đã thêm vào yêu thích")
    }
  }

  const relatedProducts = MOCK_PRODUCTS.filter(
    (p) => p.categorySlug === product.categorySlug && p.id !== product.id
  ).slice(0, 6)

  return (
    <div className="container-acf py-4 lg:py-6">
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-1 text-xs text-neutral-500">
        <Link to="/" className="hover:text-brand-red-600">
          Trang chủ
        </Link>
        <span>/</span>
        <Link
          to={`/categories/${product.categorySlug}`}
          className="hover:text-brand-red-600"
        >
          {product.categorySlug}
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
                    activeImage === i
                      ? "border-brand-red-500"
                      : "border-transparent"
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
              <strong className="text-neutral-900">{product.rating}</strong>
              <span>({product.reviewCount} đánh giá)</span>
            </span>
            <span className="h-3 w-px bg-neutral-300" />
            <span>Đã bán {product.sold.toLocaleString("vi-VN")}</span>
            <span className="h-3 w-px bg-neutral-300" />
            <span className="text-neutral-400">Brand: <strong className="text-neutral-700">{product.brand}</strong></span>
          </div>

          {/* Price */}
          <div className="mt-4 rounded-xl bg-gradient-to-r from-brand-red-50 to-white p-4">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-brand-red-600">
                {formatCurrency(variant?.price ?? product.price)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-base text-neutral-400 line-through">
                  {formatCurrency(product.originalPrice)}
                </span>
              )}
            </div>
          </div>

          {/* Variants */}
          {product.variants && product.variants.length > 1 && (
            <div className="mt-5">
              {Object.keys(product.variants[0].options).map((optKey) => {
                const values = Array.from(
                  new Set(product.variants!.map((v) => v.options[optKey]))
                )
                return (
                  <div key={optKey} className="mb-3">
                    <div className="mb-2 text-sm font-semibold text-neutral-700">
                      {optKey}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {values.map((val) => {
                        const variantsWithVal = product.variants!.filter(
                          (v) => v.options[optKey] === val
                        )
                        const isSelected = variant?.options[optKey] === val
                        return (
                          <button
                            key={val}
                            onClick={() => {
                              const found = variantsWithVal[0]
                              if (found) setSelectedVariant(found.id)
                            }}
                            className={cn(
                              "min-w-[80px] rounded-lg border px-3 py-1.5 text-sm transition-colors",
                              isSelected
                                ? "border-brand-red-500 bg-brand-red-50 font-semibold text-brand-red-700"
                                : "border-neutral-300 bg-white text-neutral-700 hover:border-brand-red-300"
                            )}
                          >
                            {val}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
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
                  setQuantity(Math.max(1, Math.min(stock, parseInt(e.target.value) || 1)))
                }
                className="w-12 border-0 bg-transparent text-center text-sm focus:outline-none"
                min={1}
                max={stock}
              />
              <button
                onClick={() => setQuantity(Math.min(stock, quantity + 1))}
                className="flex h-9 w-9 items-center justify-center text-neutral-700 hover:bg-neutral-50"
                aria-label="Tăng"
              >
                <Plus size={14} />
              </button>
            </div>
            <span className="text-xs text-neutral-500">Còn {stock} sản phẩm</span>
          </div>

          {/* CTA */}
          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              onClick={handleAddToCart}
              className="btn-secondary justify-center"
            >
              <ShoppingCart size={18} />
              Thêm giỏ hàng
            </button>
            <button
              onClick={handleBuyNow}
              className="btn-primary justify-center"
            >
              <Zap size={18} />
              Mua ngay
            </button>
          </div>

          <div className="mt-3 flex gap-2">
            <button onClick={toggleWishlist} className="btn-secondary flex-1 justify-center">
              <Heart size={16} fill={inWishlist ? "currentColor" : "none"} className={inWishlist ? "text-brand-red-500" : ""} />
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
              <div key={f.label} className="flex flex-col items-center gap-1 text-center text-neutral-600">
                <f.icon size={18} className="text-brand-red-500" />
                <span>{f.label}</span>
              </div>
            ))}
          </div>

          {/* Shop card */}
          {shop && (
            <Link
              to={`/shops/${shop.id}`}
              className="mt-5 flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-3 hover:border-brand-red-300"
            >
              <img
                src={shop.logo}
                alt={shop.name}
                className="h-12 w-12 rounded-lg object-cover"
              />
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-neutral-900">{shop.name}</span>
                  {shop.verified && (
                    <span className="badge-verified text-[10px]">
                      <ShieldCheck size={10} /> {shop.certificationLevel}
                    </span>
                  )}
                </div>
                <div className="text-xs text-neutral-500">
                  ⭐ {shop.rating} · {shop.followerCount.toLocaleString("vi-VN")} người theo dõi · Phản hồi {shop.responseTime}
                </div>
              </div>
              <button className="btn-secondary" onClick={(e) => { e.preventDefault(); }}>
                <Store size={14} /> Xem shop
              </button>
              <button className="btn-primary" onClick={(e) => { e.preventDefault(); }}>
                <MessageSquare size={14} /> Chat
              </button>
            </Link>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-8 card overflow-hidden">
        <div className="flex border-b border-neutral-200">
          {(["description", "specs", "reviews"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "flex-1 px-4 py-3 text-sm font-semibold transition-colors",
                tab === t
                  ? "border-b-2 border-brand-red-500 text-brand-red-600"
                  : "text-neutral-600 hover:text-neutral-900"
              )}
            >
              {t === "description" && "Mô tả sản phẩm"}
              {t === "specs" && "Thông số"}
              {t === "reviews" && `Đánh giá (${product.reviewCount})`}
            </button>
          ))}
        </div>

        <div className="p-5">
          {tab === "description" && (
            <p className="whitespace-pre-line text-sm leading-relaxed text-neutral-700">
              {product.description}
            </p>
          )}
          {tab === "specs" && (
            <div className="divide-y divide-neutral-100">
              {(product.specs ?? []).map((s) => (
                <div key={s.label} className="grid grid-cols-3 py-2 text-sm">
                  <span className="text-neutral-500">{s.label}</span>
                  <span className="col-span-2 text-neutral-900">{s.value}</span>
                </div>
              ))}
              {(!product.specs || product.specs.length === 0) && (
                <div className="py-4 text-center text-sm text-neutral-500">
                  Chưa có thông số chi tiết.
                </div>
              )}
            </div>
          )}
          {tab === "reviews" && (
            <div className="py-4 text-center text-sm text-neutral-500">
              📝 Tính năng đánh giá đang được phát triển ở Phase 3.
              <br />
              Hiện có {product.reviewCount} đánh giá với điểm trung bình ⭐ {product.rating}.
            </div>
          )}
        </div>
      </div>

      {/* Related */}
      {relatedProducts.length > 0 && (
        <div className="mt-10">
          <h2 className="mb-4 text-xl font-bold text-neutral-900">
            Sản phẩm liên quan
          </h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
