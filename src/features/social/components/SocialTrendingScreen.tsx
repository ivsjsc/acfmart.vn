import { useMemo } from "react"
import { Link } from "react-router-dom"
import { TrendingUp, Loader2, PackageSearch } from "lucide-react"
import { useApprovedProducts } from "../../../hooks/use-products"
import { formatCurrency } from "../../../lib/format"
import { PLACEHOLDER_IMAGE } from "../../../lib/constants"

export function SocialTrendingScreen() {
  const { data: products = [], isLoading } = useApprovedProducts({ limit: 50 })

  const trendingProducts = useMemo(
    () => products.slice(0, 20),
    [products]
  )

  return (
    <div className="p-4 lg:p-8 animate-fade-in">
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <TrendingUp size={24} className="text-amber-500" />
          <h1 className="text-2xl font-bold text-neutral-900">Xu hướng</h1>
        </div>
        <p className="mt-1 text-sm text-neutral-500">
          Sản phẩm hot và nội dung nổi bật trên cộng đồng ACFMart.
        </p>
      </div>

      <section className="rounded-xl border border-neutral-200 bg-white">
        <div className="border-b border-neutral-100 p-4">
          <h2 className="text-base font-bold text-neutral-900">Sản phẩm đang trending</h2>
          <p className="text-xs text-neutral-500">Được cộng đồng quan tâm nhiều nhất</p>
        </div>
        <div className="p-4">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-neutral-500">
              <Loader2 size={16} className="animate-spin" /> Đang tải...
            </div>
          ) : trendingProducts.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-center">
              <PackageSearch size={36} className="text-neutral-300" />
              <p className="mt-2 text-sm text-neutral-500">Chưa có sản phẩm nào.</p>
            </div>
          ) : (
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
              {trendingProducts.map((product, index) => (
                <Link
                  key={product.id}
                  to={`/products/${product.handle}`}
                  className="group overflow-hidden rounded-xl border border-neutral-200 transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="relative aspect-square overflow-hidden bg-neutral-100">
                    <img
                      src={product.thumbnail || product.images[0] || PLACEHOLDER_IMAGE}
                      alt={product.title}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                    <span className="absolute left-2 top-2 rounded-md bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                      #{index + 1}
                    </span>
                  </div>
                  <div className="p-3">
                    <h3 className="line-clamp-2 text-xs font-semibold text-neutral-900 group-hover:text-violet-600">
                      {product.title}
                    </h3>
                    <p className="mt-1 text-sm font-bold text-violet-600">
                      {formatCurrency(product.basePrice)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
