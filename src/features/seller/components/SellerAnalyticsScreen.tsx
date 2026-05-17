import { useMemo, useState } from "react"
import {
  AlertCircle,
  BarChart3,
  Eye,
  Loader2,
  Package,
  ShoppingBag,
  Star,
  TrendingUp,
  Wallet,
} from "lucide-react"
import { cn } from "../../../lib/cn"
import { formatCurrency } from "../../../lib/format"
import { useMyVendor } from "../../../hooks/use-vendor"
import { useSellerProducts } from "../../../hooks/use-products"
import {
  deriveRevenueByDay,
  deriveSellerOrderCounts,
  useSellerOrders,
} from "../../../hooks/use-seller-orders"
import { RevenueBreakdownChart } from "./finance/RevenueBreakdownChart"
import type { ProductDoc } from "../../../lib/product-service"

const RANGE_OPTIONS = [
  { id: "30d", label: "30 ngày", days: 30 },
  { id: "90d", label: "90 ngày", days: 90 },
  { id: "365d", label: "12 tháng", days: 365 },
] as const

type RangeId = (typeof RANGE_OPTIONS)[number]["id"]

const LOW_STOCK_THRESHOLD = 5

export default function SellerAnalyticsScreen() {
  const [rangeId, setRangeId] = useState<RangeId>("30d")
  const rangeMeta = RANGE_OPTIONS.find((item) => item.id === rangeId) ?? RANGE_OPTIONS[0]
  const vendorQuery = useMyVendor()
  const vendor = vendorQuery.data?.vendor ?? null
  const shopId = vendor?.firebase_uid ?? null

  const ordersStream = useSellerOrders(shopId)
  const productsQuery = useSellerProducts({ limit: 500 })
  const products = productsQuery.data?.products ?? []
  const orders = ordersStream.orders
  const orderCounts = useMemo(() => deriveSellerOrderCounts(orders), [orders])
  const revenueByDay = useMemo(
    () => deriveRevenueByDay(orders, rangeMeta.days),
    [orders, rangeMeta.days]
  )

  const range = useMemo(() => {
    const to = new Date()
    const from = new Date()
    from.setDate(from.getDate() - rangeMeta.days)
    return { from, to }
  }, [rangeMeta.days])

  const stats = useMemo(() => {
    const totalRevenue = revenueByDay.reduce((sum, item) => sum + item.revenue, 0)
    const totalOrders = revenueByDay.reduce((sum, item) => sum + item.orders, 0)
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
    const totalViews = products.reduce((sum, product) => sum + product.views, 0)
    const totalSold = products.reduce((sum, product) => sum + product.totalSold, 0)
    const conversionRate = totalViews > 0 ? (totalSold / totalViews) * 100 : 0
    const approvedProducts = products.filter((product) => product.status === "approved")
    const lowStock = approvedProducts.filter(
      (product) => product.totalStock <= LOW_STOCK_THRESHOLD
    ).length

    return {
      totalRevenue,
      totalOrders,
      avgOrderValue,
      totalViews,
      conversionRate,
      approvedProducts: approvedProducts.length,
      lowStock,
    }
  }, [products, revenueByDay])

  const topProducts = useMemo(
    () =>
      [...products]
        .filter((product) => product.status === "approved")
        .sort((a, b) => b.totalSold - a.totalSold || b.views - a.views)
        .slice(0, 8),
    [products]
  )

  const needsAttention = useMemo(
    () =>
      [...products]
        .filter(
          (product) =>
            product.status === "approved" &&
            (product.totalStock <= LOW_STOCK_THRESHOLD || product.views > 0)
        )
        .sort((a, b) => {
          const aRate = a.views > 0 ? a.totalSold / a.views : 0
          const bRate = b.views > 0 ? b.totalSold / b.views : 0
          if (a.totalStock <= LOW_STOCK_THRESHOLD && b.totalStock > LOW_STOCK_THRESHOLD) return -1
          if (b.totalStock <= LOW_STOCK_THRESHOLD && a.totalStock > LOW_STOCK_THRESHOLD) return 1
          return aRate - bRate
        })
        .slice(0, 6),
    [products]
  )

  const loading = vendorQuery.isLoading || ordersStream.loading || productsQuery.isLoading
  const error =
    ordersStream.error ??
    (productsQuery.error instanceof Error ? productsQuery.error.message : null) ??
    (vendorQuery.error instanceof Error ? vendorQuery.error.message : null)

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 lg:text-3xl">
            Phân tích shop
          </h1>
          <p className="mt-1 text-sm text-neutral-600">
            Theo dõi doanh thu, đơn hàng, sản phẩm bán chạy và điểm cần xử lý.
          </p>
        </div>
        <div className="flex rounded-lg bg-white p-1 shadow-sm ring-1 ring-neutral-200">
          {RANGE_OPTIONS.map((range) => (
            <button
              key={range.id}
              onClick={() => setRangeId(range.id)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
                range.id === rangeId
                  ? "bg-brand-red-500 text-white"
                  : "text-neutral-600 hover:bg-neutral-50"
              )}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="card mb-5 flex items-start gap-3 border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">Một phần dữ liệu chưa tải được</p>
            <p className="mt-0.5 text-xs">{error}</p>
          </div>
        </div>
      )}

      <div className="mb-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={Wallet}
          label={`Doanh thu ${rangeMeta.label.toLowerCase()}`}
          value={loading ? "..." : formatCurrency(stats.totalRevenue)}
          tone="red"
        />
        <MetricCard
          icon={ShoppingBag}
          label="Đơn trong kỳ"
          value={loading ? "..." : stats.totalOrders.toLocaleString("vi-VN")}
          sublabel={`${orderCounts.awaitingConfirm + orderCounts.awaitingPack} đơn cần xử lý`}
          tone="blue"
        />
        <MetricCard
          icon={TrendingUp}
          label="Giá trị đơn TB"
          value={loading ? "..." : formatCurrency(stats.avgOrderValue)}
          tone="gold"
        />
        <MetricCard
          icon={Eye}
          label="CVR theo lượt xem SP"
          value={loading ? "..." : `${stats.conversionRate.toFixed(2)}%`}
          sublabel={`${stats.totalViews.toLocaleString("vi-VN")} lượt xem`}
          tone="emerald"
        />
      </div>

      <div className="mb-5">
        <RevenueBreakdownChart range={range} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <section className="card overflow-hidden">
          <div className="flex items-center gap-2 border-b border-neutral-100 p-4">
            <BarChart3 size={16} className="text-brand-red-500" />
            <h2 className="text-base font-bold text-neutral-900">Top sản phẩm</h2>
          </div>
          {loading ? (
            <div className="flex items-center justify-center gap-2 p-10 text-sm text-neutral-500">
              <Loader2 size={16} className="animate-spin" />
              Đang tải dữ liệu...
            </div>
          ) : topProducts.length === 0 ? (
            <EmptyState text="Chưa có sản phẩm được duyệt để phân tích." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-neutral-50 text-xs text-neutral-500">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Sản phẩm</th>
                    <th className="px-4 py-3 text-right font-medium">Đã bán</th>
                    <th className="px-4 py-3 text-right font-medium">Lượt xem</th>
                    <th className="px-4 py-3 text-right font-medium">Tồn kho</th>
                    <th className="px-4 py-3 text-right font-medium">Đánh giá</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {topProducts.map((product) => (
                    <ProductRow key={product.id} product={product} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <aside className="space-y-5">
          <section className="card p-5">
            <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-neutral-900">
              <Package size={16} className="text-brand-red-500" />
              Sức khoẻ sản phẩm
            </h2>
            <div className="grid grid-cols-2 gap-3 text-center">
              <MiniStat label="Đang bán" value={stats.approvedProducts.toLocaleString("vi-VN")} />
              <MiniStat label="Sắp hết hàng" value={stats.lowStock.toLocaleString("vi-VN")} tone="warn" />
              <MiniStat label="Đánh giá shop" value={vendor?.avg_rating ? vendor.avg_rating.toFixed(1) : "—"} />
              <MiniStat label="Followers" value={(vendor?.follower_count ?? 0).toLocaleString("vi-VN")} />
            </div>
          </section>

          <section className="card overflow-hidden">
            <div className="border-b border-neutral-100 p-4">
              <h2 className="text-base font-bold text-neutral-900">Cần chú ý</h2>
              <p className="text-xs text-neutral-500">
                Ưu tiên sản phẩm tồn thấp hoặc có lượt xem nhưng bán chậm.
              </p>
            </div>
            {loading ? (
              <div className="flex items-center justify-center gap-2 p-8 text-sm text-neutral-500">
                <Loader2 size={16} className="animate-spin" />
                Đang tải...
              </div>
            ) : needsAttention.length === 0 ? (
              <EmptyState text="Chưa có cảnh báo sản phẩm." />
            ) : (
              <div className="divide-y divide-neutral-100">
                {needsAttention.map((product) => (
                  <div key={product.id} className="p-3">
                    <div className="line-clamp-2 text-sm font-semibold text-neutral-900">
                      {product.title}
                    </div>
                    <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-neutral-500">
                      <span>{product.views} lượt xem</span>
                      <span>{product.totalSold} đã bán</span>
                      {product.totalStock <= LOW_STOCK_THRESHOLD && (
                        <span className="font-semibold text-amber-700">
                          Tồn kho {product.totalStock}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </aside>
      </div>
    </div>
  )
}

function MetricCard({
  icon: Icon,
  label,
  value,
  sublabel,
  tone,
}: {
  icon: typeof Wallet
  label: string
  value: string
  sublabel?: string
  tone: "red" | "blue" | "gold" | "emerald"
}) {
  const palette = {
    red: "bg-brand-red-50 text-brand-red-600",
    blue: "bg-blue-50 text-blue-600",
    gold: "bg-brand-gold-50 text-brand-gold-600",
    emerald: "bg-emerald-50 text-emerald-600",
  }[tone]
  return (
    <div className="card p-5">
      <div className={cn("mb-3 inline-flex rounded-lg p-2", palette)}>
        <Icon size={18} />
      </div>
      <div className="text-xs text-neutral-500">{label}</div>
      <div className="mt-1 text-2xl font-extrabold text-neutral-900">{value}</div>
      {sublabel && <div className="mt-1 text-xs text-neutral-500">{sublabel}</div>}
    </div>
  )
}

function ProductRow({ product }: { product: ProductDoc }) {
  return (
    <tr className="hover:bg-neutral-50">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 overflow-hidden rounded-lg bg-neutral-100">
            {product.thumbnail || product.images[0] ? (
              <img
                src={product.thumbnail || product.images[0]}
                alt={product.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-neutral-300">
                <Package size={16} />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <div className="line-clamp-1 font-semibold text-neutral-900">
              {product.title}
            </div>
            <div className="text-xs text-neutral-500">{formatCurrency(product.basePrice)}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-right font-semibold">{product.totalSold}</td>
      <td className="px-4 py-3 text-right">{product.views}</td>
      <td
        className={cn(
          "px-4 py-3 text-right font-semibold",
          product.totalStock <= LOW_STOCK_THRESHOLD && "text-amber-700"
        )}
      >
        {product.totalStock}
      </td>
      <td className="px-4 py-3 text-right">
        <span className="inline-flex items-center justify-end gap-1">
          <Star size={12} className="fill-brand-gold-400 text-brand-gold-400" />
          {product.rating ? product.rating.toFixed(1) : "—"}
        </span>
      </td>
    </tr>
  )
}

function MiniStat({
  label,
  value,
  tone = "default",
}: {
  label: string
  value: string
  tone?: "default" | "warn"
}) {
  return (
    <div className={cn("rounded-lg bg-neutral-50 p-3", tone === "warn" && "bg-amber-50")}>
      <div className={cn("text-xl font-extrabold text-neutral-900", tone === "warn" && "text-amber-700")}>
        {value}
      </div>
      <div className="text-xs text-neutral-500">{label}</div>
    </div>
  )
}

function EmptyState({ text }: { text: string }) {
  return <div className="p-8 text-center text-sm text-neutral-500">{text}</div>
}

