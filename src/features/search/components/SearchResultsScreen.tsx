import { useState, useMemo, useEffect } from "react"
import { useSearchParams, Link } from "react-router-dom"
import {
  Search,
  ShieldCheck,
  SlidersHorizontal,
  X,
  ChevronDown,
  Star,
} from "lucide-react"
import { MOCK_CATEGORIES, MOCK_PRODUCTS, MOCK_SHOPS } from "../../../lib/mock-data"
import { ProductCard } from "../../../components/ProductCard"
import { cn } from "../../../lib/cn"
import { formatCurrency } from "../../../lib/format"

type SortKey = "relevance" | "popular" | "newest" | "price-asc" | "price-desc" | "rating"

const SORT_OPTIONS: { v: SortKey; label: string }[] = [
  { v: "relevance", label: "Liên quan" },
  { v: "popular", label: "Bán chạy" },
  { v: "newest", label: "Mới nhất" },
  { v: "rating", label: "Đánh giá cao" },
]

const PRICE_RANGES = [
  { label: "Dưới 200K", v: [0, 200000] },
  { label: "200K – 500K", v: [200000, 500000] },
  { label: "500K – 1tr", v: [500000, 1000000] },
  { label: "1tr – 2tr", v: [1000000, 2000000] },
  { label: "Trên 2tr", v: [2000000, 100000000] },
] as const

export default function SearchResultsScreen() {
  const [params, setParams] = useSearchParams()
  const initialQuery = params.get("q") ?? ""

  const [query, setQuery] = useState(initialQuery)
  const [sort, setSort] = useState<SortKey>("relevance")
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [priceRange, setPriceRange] = useState<[number, number] | null>(null)
  const [minRating, setMinRating] = useState(0)
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set())
  const [selectedBrands, setSelectedBrands] = useState<Set<string>>(new Set())
  const [selectedShops, setSelectedShops] = useState<Set<string>>(new Set())
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    setQuery(initialQuery)
  }, [initialQuery])

  // Derive available brands from products
  const allBrands = useMemo(
    () => Array.from(new Set(MOCK_PRODUCTS.map((p) => p.brand))).sort(),
    []
  )

  // Match products
  const matched = useMemo(() => {
    let list = MOCK_PRODUCTS

    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.shopName.toLowerCase().includes(q)
      )
    }

    if (verifiedOnly) list = list.filter((p) => p.verified)
    if (priceRange) {
      list = list.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1])
    }
    if (minRating > 0) list = list.filter((p) => p.rating >= minRating)
    if (selectedCategories.size > 0) {
      list = list.filter((p) => selectedCategories.has(p.categorySlug))
    }
    if (selectedBrands.size > 0) {
      list = list.filter((p) => selectedBrands.has(p.brand))
    }
    if (selectedShops.size > 0) {
      list = list.filter((p) => selectedShops.has(p.shopId))
    }

    const sorted = [...list]
    switch (sort) {
      case "popular":
        sorted.sort((a, b) => b.sold - a.sold)
        break
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
      case "relevance":
      default:
        // Mock: keep current order
        break
    }
    return sorted
  }, [query, verifiedOnly, priceRange, minRating, selectedCategories, selectedBrands, selectedShops, sort])

  // Matched shops for "shop results" section
  const matchedShops = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    return MOCK_SHOPS.filter((s) => s.name.toLowerCase().includes(q))
  }, [query])

  function onSearch(e: React.FormEvent) {
    e.preventDefault()
    setParams({ q: query.trim() })
  }

  function toggleSet(set: Set<string>, value: string): Set<string> {
    const next = new Set(set)
    if (next.has(value)) next.delete(value)
    else next.add(value)
    return next
  }

  function clearAllFilters() {
    setVerifiedOnly(false)
    setPriceRange(null)
    setMinRating(0)
    setSelectedCategories(new Set())
    setSelectedBrands(new Set())
    setSelectedShops(new Set())
  }

  const activeFilterCount =
    (verifiedOnly ? 1 : 0) +
    (priceRange ? 1 : 0) +
    (minRating > 0 ? 1 : 0) +
    selectedCategories.size +
    selectedBrands.size +
    selectedShops.size

  return (
    <div className="container-acf py-4 lg:py-6">
      {/* Search bar */}
      <form onSubmit={onSearch} className="mb-4" role="search">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm sản phẩm, thương hiệu, shop..."
            className="input pl-10 pr-24"
            autoFocus
          />
          <button
            type="submit"
            className="absolute right-1 top-1/2 -translate-y-1/2 rounded-md bg-brand-red-500 px-3 py-1.5 text-xs font-semibold text-white"
          >
            Tìm
          </button>
        </div>
      </form>

      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">
            {initialQuery ? (
              <>
                Kết quả cho "<span className="text-brand-red-600">{initialQuery}</span>"
              </>
            ) : (
              "Khám phá sản phẩm"
            )}
          </h1>
          <p className="text-sm text-neutral-500">
            {matched.length.toLocaleString("vi-VN")} sản phẩm
            {matchedShops.length > 0 && ` · ${matchedShops.length} shop`}
          </p>
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className="btn-secondary lg:hidden relative"
        >
          <SlidersHorizontal size={14} />
          Lọc
          {activeFilterCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand-red-500 px-1 text-[10px] font-bold text-white">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
        {/* Sidebar filters */}
        <aside className={cn("space-y-4", !showFilters && "hidden lg:block")}>
          {activeFilterCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="flex w-full items-center justify-center gap-1 text-xs font-semibold text-brand-red-600 hover:underline"
            >
              <X size={12} />
              Xoá {activeFilterCount} bộ lọc
            </button>
          )}

          <FilterSection title="Xác thực">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
                className="h-4 w-4 rounded text-brand-red-500"
              />
              <ShieldCheck size={14} className="text-brand-gold-500" />
              Chỉ hàng đã xác thực ACF
            </label>
          </FilterSection>

          <FilterSection title="Đánh giá">
            <div className="space-y-1.5">
              {[5, 4, 3, 0].map((s) => (
                <button
                  key={s}
                  onClick={() => setMinRating(s)}
                  className={cn(
                    "flex w-full items-center gap-1 rounded px-2 py-1 text-left text-sm transition-colors",
                    minRating === s
                      ? "bg-brand-red-50 font-semibold text-brand-red-700"
                      : "hover:bg-neutral-50"
                  )}
                >
                  {s === 0 ? (
                    "Tất cả"
                  ) : (
                    <>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star
                          key={n}
                          size={12}
                          className={cn(
                            n <= s
                              ? "fill-brand-gold-400 text-brand-gold-400"
                              : "text-neutral-300"
                          )}
                        />
                      ))}
                      <span className="ml-1 text-xs text-neutral-500">trở lên</span>
                    </>
                  )}
                </button>
              ))}
            </div>
          </FilterSection>

          <FilterSection title="Khoảng giá">
            <div className="space-y-1.5">
              <button
                onClick={() => setPriceRange(null)}
                className={cn(
                  "block w-full rounded border px-3 py-1.5 text-left text-xs transition-colors",
                  !priceRange
                    ? "border-brand-red-500 bg-brand-red-50 font-semibold text-brand-red-700"
                    : "border-neutral-200 hover:border-brand-red-300"
                )}
              >
                Tất cả giá
              </button>
              {PRICE_RANGES.map((r) => (
                <button
                  key={r.label}
                  onClick={() => setPriceRange(r.v as [number, number])}
                  className={cn(
                    "block w-full rounded border px-3 py-1.5 text-left text-xs transition-colors",
                    priceRange?.[0] === r.v[0] && priceRange?.[1] === r.v[1]
                      ? "border-brand-red-500 bg-brand-red-50 font-semibold text-brand-red-700"
                      : "border-neutral-200 hover:border-brand-red-300"
                  )}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </FilterSection>

          <FilterSection title="Danh mục" defaultOpen={false}>
            <div className="space-y-1.5">
              {MOCK_CATEGORIES.map((c) => (
                <label key={c.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedCategories.has(c.slug)}
                    onChange={() =>
                      setSelectedCategories(toggleSet(selectedCategories, c.slug))
                    }
                    className="h-4 w-4 rounded text-brand-red-500"
                  />
                  <span>{c.icon} {c.name}</span>
                </label>
              ))}
            </div>
          </FilterSection>

          <FilterSection title="Thương hiệu" defaultOpen={false}>
            <div className="space-y-1.5 max-h-60 overflow-y-auto">
              {allBrands.map((b) => (
                <label key={b} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedBrands.has(b)}
                    onChange={() => setSelectedBrands(toggleSet(selectedBrands, b))}
                    className="h-4 w-4 rounded text-brand-red-500"
                  />
                  <span>{b}</span>
                </label>
              ))}
            </div>
          </FilterSection>

          <FilterSection title="Shop" defaultOpen={false}>
            <div className="space-y-1.5">
              {MOCK_SHOPS.map((s) => (
                <label key={s.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedShops.has(s.id)}
                    onChange={() => setSelectedShops(toggleSet(selectedShops, s.id))}
                    className="h-4 w-4 rounded text-brand-red-500"
                  />
                  <span className="truncate">{s.name}</span>
                  {s.verified && <ShieldCheck size={10} className="text-brand-gold-500" />}
                </label>
              ))}
            </div>
          </FilterSection>
        </aside>

        {/* Results */}
        <div className="space-y-4">
          {/* Sort bar */}
          <div className="flex items-center justify-between rounded-lg bg-neutral-100 px-3 py-2">
            <span className="text-sm text-neutral-600">Sắp xếp:</span>
            <div className="flex flex-wrap items-center gap-1">
              {SORT_OPTIONS.map((s) => (
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
                      ? setSort("relevance")
                      : setSort(e.target.value as SortKey)
                  }
                  className="appearance-none rounded-md bg-white px-3 py-1 pr-7 text-xs font-medium text-neutral-700 shadow-sm focus:outline-none"
                >
                  <option value="price">Giá</option>
                  <option value="price-asc">Thấp → cao</option>
                  <option value="price-desc">Cao → thấp</option>
                </select>
                <ChevronDown size={12} className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-neutral-500" />
              </div>
            </div>
          </div>

          {/* Matched shops (if query matches) */}
          {matchedShops.length > 0 && (
            <div className="card p-4">
              <h2 className="mb-3 text-sm font-bold text-neutral-900">
                Shop liên quan ({matchedShops.length})
              </h2>
              <div className="flex flex-wrap gap-2">
                {matchedShops.map((s) => (
                  <Link
                    key={s.id}
                    to={`/shops/${s.id}`}
                    className="flex items-center gap-2 rounded-lg border border-neutral-200 p-2 transition-colors hover:border-brand-red-300 hover:bg-brand-red-50"
                  >
                    <img src={s.logo} alt={s.name} className="h-8 w-8 rounded-full object-cover" />
                    <div className="text-xs">
                      <div className="flex items-center gap-1 font-semibold text-neutral-900">
                        {s.name}
                        {s.verified && <ShieldCheck size={10} className="text-brand-gold-500" />}
                      </div>
                      <div className="text-neutral-500">
                        ⭐ {s.rating} · {s.productCount} SP
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Products */}
          {matched.length === 0 ? (
            <div className="card p-12 text-center">
              <Search size={32} className="mx-auto text-neutral-300" />
              <h3 className="mt-3 text-base font-semibold text-neutral-900">
                Không tìm thấy sản phẩm
              </h3>
              <p className="mt-1 text-sm text-neutral-500">
                Thử bỏ bớt bộ lọc hoặc tìm với từ khoá khác
              </p>
              {activeFilterCount > 0 && (
                <button onClick={clearAllFilters} className="btn-secondary mt-4">
                  Xoá tất cả bộ lọc
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
              {matched.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function FilterSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="card p-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between"
      >
        <h3 className="text-sm font-bold text-neutral-900">{title}</h3>
        <ChevronDown
          size={14}
          className={cn("text-neutral-400 transition-transform", open && "rotate-180")}
        />
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  )
}
