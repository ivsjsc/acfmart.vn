import { useState, useMemo } from "react"
import { useParams, Link } from "react-router-dom"
import { SlidersHorizontal, ShieldCheck, ChevronDown } from "lucide-react"
import {
  MOCK_CATEGORIES,
  MOCK_PRODUCTS,
  findCategoryBySlug,
} from "../../../lib/mock-data"
import { ProductCard } from "../../../components/ProductCard"
import { cn } from "../../../lib/cn"

type SortKey = "popular" | "newest" | "price-asc" | "price-desc" | "rating"

export default function CategoryListingScreen() {
  const { slug } = useParams<{ slug: string }>()
  const category = slug ? findCategoryBySlug(slug) : null

  const [sort, setSort] = useState<SortKey>("popular")
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000])
  const [showFilters, setShowFilters] = useState(false)

  const products = useMemo(() => {
    let list = slug
      ? MOCK_PRODUCTS.filter((p) => p.categorySlug === slug)
      : MOCK_PRODUCTS

    if (verifiedOnly) list = list.filter((p) => p.verified)
    list = list.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    )

    const sorted = [...list]
    switch (sort) {
      case "newest":
        sorted.reverse()
        break
      case "price-asc":
        sorted.sort((a, b) => a.price - b.price)
        break
      case "price-desc":
        sorted.sort((a, b) => b.price - a.price)
        break
      case "rating":
        sorted.sort((a, b) => b.rating - a.rating)
        break
      case "popular":
      default:
        sorted.sort((a, b) => b.sold - a.sold)
    }
    return sorted
  }, [slug, sort, verifiedOnly, priceRange])

  if (slug && !category) {
    return (
      <div className="container-acf py-12 text-center">
        <h1 className="text-2xl font-bold">Không tìm thấy danh mục</h1>
        <Link to="/" className="btn-primary mt-4 inline-flex">
          Về trang chủ
        </Link>
      </div>
    )
  }

  return (
    <div className="container-acf py-4 lg:py-6">
      {/* Header */}
      <nav className="mb-3 flex items-center gap-1 text-xs text-neutral-500">
        <Link to="/" className="hover:text-brand-red-600">Trang chủ</Link>
        <span>/</span>
        <Link to="/categories" className="hover:text-brand-red-600">Danh mục</Link>
        {category && (
          <>
            <span>/</span>
            <span className="text-neutral-700">{category.name}</span>
          </>
        )}
      </nav>

      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 lg:text-3xl">
            {category ? `${category.icon} ${category.name}` : "Tất cả sản phẩm"}
          </h1>
          <p className="mt-1 text-sm text-neutral-600">
            {products.length.toLocaleString("vi-VN")} sản phẩm
          </p>
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className="btn-secondary lg:hidden"
        >
          <SlidersHorizontal size={16} />
          Lọc
        </button>
      </div>

      {/* All categories chips (when no slug) */}
      {!slug && (
        <div className="mb-5 flex flex-wrap gap-2">
          {MOCK_CATEGORIES.map((c) => (
            <Link
              key={c.id}
              to={`/categories/${c.slug}`}
              className="flex items-center gap-1 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-sm hover:border-brand-red-300 hover:text-brand-red-600"
            >
              <span>{c.icon}</span>
              <span>{c.name}</span>
            </Link>
          ))}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
        {/* Sidebar filters */}
        <aside
          className={cn(
            "space-y-4",
            !showFilters && "hidden lg:block"
          )}
        >
          <div className="card p-4">
            <h3 className="mb-3 text-sm font-bold text-neutral-900">
              Bộ lọc
            </h3>

            <label className="mb-4 flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded text-brand-red-500 focus:ring-brand-red-500"
              />
              <span className="flex items-center gap-1 text-neutral-700">
                <ShieldCheck size={14} className="text-brand-gold-500" />
                Chỉ hàng đã xác thực ACF
              </span>
            </label>

            <div>
              <div className="mb-2 text-xs font-semibold text-neutral-700">
                Khoảng giá
              </div>
              <div className="space-y-2">
                {[
                  { label: "Dưới 200K", v: [0, 200000] },
                  { label: "200K - 500K", v: [200000, 500000] },
                  { label: "500K - 1tr", v: [500000, 1000000] },
                  { label: "1tr - 2tr", v: [1000000, 2000000] },
                  { label: "Trên 2tr", v: [2000000, 10000000] },
                ].map((r) => (
                  <button
                    key={r.label}
                    onClick={() => setPriceRange(r.v as [number, number])}
                    className={cn(
                      "block w-full rounded-md border px-3 py-1.5 text-left text-xs transition-colors",
                      priceRange[0] === r.v[0] && priceRange[1] === r.v[1]
                        ? "border-brand-red-500 bg-brand-red-50 text-brand-red-700"
                        : "border-neutral-200 hover:border-brand-red-300"
                    )}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Main grid */}
        <div>
          {/* Sort bar */}
          <div className="mb-4 flex items-center justify-between rounded-lg bg-neutral-100 px-3 py-2">
            <span className="text-sm text-neutral-600">Sắp xếp theo:</span>
            <div className="flex flex-wrap items-center gap-1">
              {(
                [
                  { v: "popular", label: "Phổ biến" },
                  { v: "newest", label: "Mới nhất" },
                  { v: "rating", label: "Đánh giá cao" },
                ] as const
              ).map((s) => (
                <button
                  key={s.v}
                  onClick={() => setSort(s.v)}
                  className={cn(
                    "rounded-md px-3 py-1 text-xs font-medium transition-colors",
                    sort === s.v
                      ? "bg-white text-brand-red-600 shadow-sm"
                      : "text-neutral-700 hover:text-neutral-900"
                  )}
                >
                  {s.label}
                </button>
              ))}

              <div className="relative">
                <select
                  value={
                    sort === "price-asc" || sort === "price-desc" ? sort : "price"
                  }
                  onChange={(e) =>
                    e.target.value === "price"
                      ? setSort("popular")
                      : setSort(e.target.value as SortKey)
                  }
                  className="appearance-none rounded-md bg-white px-3 py-1 pr-7 text-xs font-medium text-neutral-700 shadow-sm focus:outline-none"
                >
                  <option value="price">Giá</option>
                  <option value="price-asc">Giá thấp → cao</option>
                  <option value="price-desc">Giá cao → thấp</option>
                </select>
                <ChevronDown
                  size={12}
                  className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-neutral-500"
                />
              </div>
            </div>
          </div>

          {products.length === 0 ? (
            <div className="card p-12 text-center text-neutral-500">
              Không có sản phẩm nào khớp bộ lọc.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
