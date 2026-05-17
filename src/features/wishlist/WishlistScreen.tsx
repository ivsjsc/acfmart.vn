import { useMemo } from "react"
import { Link } from "react-router-dom"
import { Heart, Loader2, Trash2 } from "lucide-react"
import { ProductCard } from "../../components/ProductCard"
import { PLACEHOLDER_IMAGE } from "../../lib/constants"
import { formatCurrency } from "../../lib/format"
import { productDocToCardShape } from "../../lib/product-service"
import { useApprovedProducts } from "../../hooks/use-products"
import { useWishlistStore } from "../../stores/wishlist-store"

export function WishlistScreen() {
  const items = useWishlistStore((state) => state.items)
  const remove = useWishlistStore((state) => state.remove)
  const { data: products = [], isLoading } = useApprovedProducts({ limit: 8 })

  const suggestions = useMemo(() => {
    const savedIds = new Set(items.map((item) => item.productId))
    return products
      .filter((product) => !savedIds.has(product.id))
      .slice(0, 4)
      .map(productDocToCardShape)
  }, [items, products])

  return (
    <div className="container-acf py-6 lg:py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900">Danh sách yêu thích</h1>
        <p className="text-neutral-600">Những sản phẩm bạn đã lưu để mua sau</p>
      </div>

      {items.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-full bg-brand-red-50 p-4 text-brand-red-600">
            <Heart size={48} />
          </div>
          <h3 className="mt-4 text-xl font-bold text-neutral-900">
            Danh sách yêu thích trống
          </h3>
          <p className="mt-2 text-neutral-600">
            Sản phẩm bạn bấm tim sẽ xuất hiện ở đây.
          </p>
          <Link to="/categories" className="btn-primary mt-5">
            Khám phá sản phẩm
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <article
              key={item.productId}
              className="card group overflow-hidden transition-shadow hover:shadow-md"
            >
              <Link to={`/products/${item.handle ?? item.productId}`}>
                <div className="relative aspect-square bg-neutral-100">
                  <img
                    src={item.thumbnail || PLACEHOLDER_IMAGE}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="p-3">
                  <h2 className="line-clamp-2 text-sm font-semibold text-neutral-900 group-hover:text-brand-red-600">
                    {item.title}
                  </h2>
                  <div className="mt-2 text-base font-bold text-brand-red-600">
                    {formatCurrency(item.price)}
                  </div>
                  <div className="mt-1 truncate text-xs text-neutral-500">
                    {item.shopName}
                  </div>
                </div>
              </Link>
              <button
                onClick={() => remove(item.productId)}
                className="mx-3 mb-3 inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-2 text-xs font-semibold text-neutral-600 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
              >
                <Trash2 size={14} />
                Bỏ yêu thích
              </button>
            </article>
          ))}
        </div>
      )}

      <section className="mt-12 rounded-lg border border-neutral-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-neutral-900">Gợi ý cho bạn</h2>
          <Link to="/categories" className="text-xs font-semibold text-brand-red-600">
            Xem thêm
          </Link>
        </div>

        {isLoading ? (
          <div className="mt-4 flex items-center gap-2 text-sm text-neutral-500">
            <Loader2 size={16} className="animate-spin" />
            Đang tải sản phẩm...
          </div>
        ) : suggestions.length === 0 ? (
          <p className="mt-4 text-sm text-neutral-500">
            Chưa có sản phẩm đã duyệt để gợi ý.
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {suggestions.map((product) => (
              <ProductCard key={product.id} product={product as any} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
