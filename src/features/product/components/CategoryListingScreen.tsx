import { useState, useMemo } from "react"
import { useParams, Link } from "react-router-dom"
import {
  SlidersHorizontal,
  ShieldCheck,
  ChevronDown,
  Package,
  AlertCircle,
} from "lucide-react"
import { ProductCard } from "../../../components/ProductCard"
import { ProductGridSkeleton } from "../../../components/Skeleton"
import { cn } from "../../../lib/cn"
import { useApprovedProducts } from "../../../hooks/use-products"
import {
  productDocToCardShape,
  type ProductDoc,
} from "../../../lib/product-service"

type SortKey = "popular" | "newest" | "price-asc" | "price-desc" | "rating"

const PRICE_RANGES: { label: string; v: readonly [number, number] }[] = [
  { label: "Dưới 200K", v: [0, 200_000] as const },
  { label: "200K - 500K", v: [200_000, 500_000] as const },
  { label: "500K - 1tr", v: [500_000, 1_000_000] as const },
  { label: "1tr - 2tr", v: [1_000_000, 2_000_000] as const },
  { label: "Trên 2tr", v: [2_000_000, 10_000_000] as const },
]

const CATEGORY_EMOJI: Record<string, string> = {
  "Mỹ phẩm": "💄",
  "Thời trang nữ": "👗",
  "Thời trang nam": "👔",
  "Điện tử": "📱",
  "Nhà cửa": "🏠",
  "Đồ gia dụng": "🍳",
  "Thực phẩm": "🍎",
  "Mẹ và bé": "👶",
  "Sức khỏe": "💊",
  "Sách": "📚",
  "Thể thao": "⚽",
  "Đồ chơi": "🧸",
}

function categoryEmoji(name: string): string {
  return CATEGORY_EMOJI[name] ?? "🛍️"
}

export default function CategoryListingScreen() {
  const { slug } = useParams<{ slug: string }>()
  const decodedCategory = slug ? decodeURIComponent(slug) : undefined

  const [sort, setSort] = useState<SortKey>("popular")
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [priceRange, setPriceRange] = useState<readonly [number, number]>([0, 10_000_000])
  const [showFilters, setShowFilters] = useState(false)
  const [showExpanded, setShowExpanded] = useState(false)

  // When a category is provided, query products of that category from Firestore.
  // When not, fetch a broader sample to derive the chips bar.
  const approved = useApprovedProducts({
    category: decodedCategory,
    limit: decodedCategory ? 120 : 240,
  })

  // For the chips bar (when on /categories root), fetch top categories across
  // all approved products in one go.
  const chipsQuery = useApprovedProducts({ limit: 240 })

  const cards = useMemo(() => {
    const list = (approved.data ?? []).map(productDocToCardShape)
    const filtered = list.filter((p) => {
      if (verifiedOnly && !p.verified) return false
      if (p.price < priceRange[0] || p.price > priceRange[1]) return false
      return true
    })
    const sorted = [...filtered]
    switch (sort) {
      case "newest":
        // Sort using the original ProductDoc order (already newest-first from service)
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
        sorted.sort((a, b) => (b.sold ?? 0) - (a.sold ?? 0))
    }
    return sorted
  }, [approved.data, sort, verifiedOnly, priceRange])

  const chipCategories = useMemo(() => {
    const products: ProductDoc[] = chipsQuery.data ?? []
    const counts = new Map<string, number>()
    for (const p of products) {
      if (!p.category) continue
      counts.set(p.category, (counts.get(p.category) ?? 0) + 1)
    }
    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
  }, [chipsQuery.data])

  return (
    <div className="container-acf py-4 lg:py-6">
      {/* Breadcrumb */}
      <nav className="mb-3 flex items-center gap-1 text-xs text-neutral-500">
        <Link to="/" className="hover:text-brand-red-600">
          Trang chủ
        </Link>
        <span>/</span>
        <Link to="/categories" className="hover:text-brand-red-600">
          Danh mục
        </Link>
        {decodedCategory && (
          <>
            <span>/</span>
            <span className="text-neutral-700">{decodedCategory}</span>
          </>
        )}
      </nav>

      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 lg:text-3xl">
            {decodedCategory
              ? `${categoryEmoji(decodedCategory)} ${decodedCategory}`
              : "Tất cả sản phẩm"}
          </h1>
          <p className="mt-1 text-sm text-neutral-600">
            {approved.isLoading
              ? "Đang tải..."
              : `${cards.length.toLocaleString("vi-VN")} sản phẩm`}
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

      {/* Chips bar — only when no slug */}
      {!decodedCategory && (
        <div className="mb-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold text-neutral-800">Danh mục sản phẩm</h2>
            {chipCategories.length > 8 && (
              <button
                onClick={() => setShowExpanded(!showExpanded)}
                className="flex items-center text-sm text-brand-red-600 hover:text-brand-red-700"
              >
                {showExpanded ? "Ẩn bớt" : "Xem tất cả"}
              </button>
            )}
          </div>

          {chipsQuery.isLoading ? (
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-8 w-24 animate-pulse rounded-full bg-neutral-200"
                />
              ))}
            </div>
          ) : chipCategories.length === 0 ? (
            <p className="text-sm text-neutral-500">
              Chưa có danh mục nào — chờ shop thêm sản phẩm.
            </p>
          ) : (
            <>
              <div
                className={
                  showExpanded
                    ? "flex flex-wrap gap-2"
                    : "flex max-h-24 flex-wrap gap-2 overflow-hidden"
                }
              >
                {chipCategories.map((c) => (
                  <Link
                    key={c.name}
                    to={`/categories/${encodeURIComponent(c.name)}`}
                    className="flex items-center gap-1 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-sm hover:border-brand-red-300 hover:text-brand-red-600"
                  >
                    <span>{categoryEmoji(c.name)}</span>
                    <span>{c.name}</span>
                    <span className="text-[10px] text-neutral-400">({c.count})</span>
                  </Link>
                ))}
              </div>
              {!showExpanded && chipCategories.length > 8 && (
                <div className="mt-2 text-center">
                  <button
                    onClick={() => setShowExpanded(true)}
                    className="mx-auto flex items-center text-sm text-brand-red-600 hover:text-brand-red-700"
                  >
                    Xem tất cả {chipCategories.length} danh mục
                    <ChevronDown size={14} className="ml-1 transition-transform" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
        {/* Sidebar filters */}
        <aside className={cn("space-y-4", !showFilters && "hidden lg:block")}>
          <div className="card p-4">
            <h3 className="mb-3 text-sm font-bold text-neutral-900">Bộ lọc</h3>

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
                {PRICE_RANGES.map((r) => (
                  <button
                    key={r.label}
                    onClick={() => setPriceRange(r.v)}
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

          {approved.isLoading ? (
            <ProductGridSkeleton count={12} />
          ) : approved.isError ? (
            <div className="card flex items-start gap-3 border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="font-semibold">Không tải được sản phẩm</p>
                <p className="mt-0.5 text-xs">
                  {approved.error instanceof Error
                    ? approved.error.message
                    : "Có lỗi xảy ra"}
                </p>
                <button
                  onClick={() => approved.refetch()}
                  className="btn-secondary mt-3 text-xs"
                >
                  Thử lại
                </button>
              </div>
            </div>
          ) : cards.length === 0 ? (
            <div className="card flex flex-col items-center py-16 text-center">
              <Package size={48} className="text-neutral-300" />
              <h3 className="mt-3 text-base font-semibold text-neutral-900">
                Không có sản phẩm phù hợp
              </h3>
              <p className="mt-1 max-w-sm text-sm text-neutral-500">
                {decodedCategory
                  ? "Danh mục này chưa có sản phẩm hoặc bộ lọc đang quá hẹp."
                  : "Bỏ bớt bộ lọc để xem thêm sản phẩm."}
              </p>
              <Link to="/" className="btn-primary mt-4">
                Về trang chủ
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
              {cards.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
