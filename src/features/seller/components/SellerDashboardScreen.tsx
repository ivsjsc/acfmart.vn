import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import {
  TrendingUp,
  ShoppingBag,
  Package,
  Star,
  AlertCircle,
  ArrowUpRight,
  Wallet,
  Users,
  Clock,
  ChevronRight,
  Sparkles,
  Inbox,
  ShieldCheck,
} from "lucide-react"
import { formatCurrency, formatRelativeTime } from "../../../lib/format"
import { cn } from "../../../lib/cn"
import { Skeleton } from "../../../components/Skeleton"
import { usePortalConfig } from "../../../hooks/use-portal-config"
import { useMyVendor } from "../../../hooks/use-vendor"
import { useSellerProducts } from "../../../hooks/use-products"
import {
  deriveSellerOrderCounts,
  deriveRevenueByDay,
  useSellerOrders,
} from "../../../hooks/use-seller-orders"
import { useIvsSellerQrDashboard } from "../../../hooks/use-ivs-seller-qr"

const RANGE_OPTIONS = [
  { id: "today", label: "Hôm nay", days: 1 },
  { id: "7d", label: "7 ngày", days: 7 },
  { id: "30d", label: "30 ngày", days: 30 },
] as const
type RangeId = (typeof RANGE_OPTIONS)[number]["id"]

const LOW_STOCK_THRESHOLD = 5

export default function SellerDashboardScreen() {
  const vendorQuery = useMyVendor()
  const vendor = vendorQuery.data?.vendor ?? null
  const shopId = vendor?.firebase_uid ?? null
  const shopName = vendor?.shop_name ?? "shop của bạn"
  const ownerName = vendor?.owner_name ?? ""

  const [range, setRange] = useState<RangeId>("7d")
  const rangeMeta =
    RANGE_OPTIONS.find((r) => r.id === range) ?? RANGE_OPTIONS[1]

  const ordersStream = useSellerOrders(shopId)
  const orders = ordersStream.orders
  const orderCounts = useMemo(() => deriveSellerOrderCounts(orders), [orders])

  const revenueByDay = useMemo(
    () => deriveRevenueByDay(orders, rangeMeta.days),
    [orders, rangeMeta.days]
  )
  const totalRevenue = revenueByDay.reduce((s, d) => s + d.revenue, 0)
  const totalOrders = revenueByDay.reduce((s, d) => s + d.orders, 0)
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

  const productsQuery = useSellerProducts({ limit: 500 })
  const products = productsQuery.data?.products ?? []
  const qrDashboardQuery = useIvsSellerQrDashboard()
  const qrDashboard = qrDashboardQuery.data
  const lowStockCount = useMemo(
    () =>
      products.filter(
        (p) => p.status === "approved" && p.totalStock <= LOW_STOCK_THRESHOLD
      ).length,
    [products]
  )

  const recentOrders = useMemo(() => orders.slice(0, 5), [orders])
  const { images: sellerImages } = usePortalConfig("seller")

  const pendingActions = [
    {
      count: orderCounts.awaitingConfirm,
      label: "Cần xác nhận",
      to: "/seller/orders?status=awaiting_confirm",
    },
    {
      count: orderCounts.awaitingPack,
      label: "Cần đóng gói",
      to: "/seller/orders?status=confirmed",
    },
    {
      count: orderCounts.returnRequests,
      label: "Yêu cầu trả hàng",
      to: "/seller/orders?status=return_requested",
    },
    {
      count: lowStockCount,
      label: "SP sắp hết hàng",
      to: "/seller/products?filter=low-stock",
    },
  ]

  const greetingName = ownerName ? ownerName.split(" ").pop() : "bạn"

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 lg:text-3xl">
            Chào, {greetingName}!
          </h1>
          <p className="mt-1 text-sm text-neutral-600">
            Tổng quan kinh doanh của <strong>{shopName}</strong>
          </p>
        </div>
        <div className="flex rounded-lg bg-white p-1 shadow-sm ring-1 ring-neutral-200">
          {RANGE_OPTIONS.map((r) => (
            <button
              key={r.id}
              onClick={() => setRange(r.id)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
                range === r.id
                  ? "bg-brand-red-500 text-white"
                  : "text-neutral-600 hover:bg-neutral-50"
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Configurable hero banner — managed from Admin Console */}
      {sellerImages["hero_banner"]?.image_url && (
        <div className="mb-6">
          {sellerImages["hero_banner"].link_url ? (
            <a
              href={sellerImages["hero_banner"].link_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src={sellerImages["hero_banner"].image_url}
                alt={sellerImages["hero_banner"].alt || "Seller Center"}
                className="w-full rounded-2xl object-cover shadow-sm"
              />
            </a>
          ) : (
            <img
              src={sellerImages["hero_banner"].image_url}
              alt={sellerImages["hero_banner"].alt || "Seller Center"}
              className="w-full rounded-2xl object-cover shadow-sm"
            />
          )}
        </div>
      )}

      {/* Configurable promo banner */}
      {sellerImages["promo_banner"]?.image_url && (
        <div className="mb-6">
          {sellerImages["promo_banner"].link_url ? (
            <a
              href={sellerImages["promo_banner"].link_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src={sellerImages["promo_banner"].image_url}
                alt={sellerImages["promo_banner"].alt || "Thông báo"}
                className="w-full rounded-2xl object-cover shadow-sm"
              />
            </a>
          ) : (
            <img
              src={sellerImages["promo_banner"].image_url}
              alt={sellerImages["promo_banner"].alt || "Thông báo"}
              className="w-full rounded-2xl object-cover shadow-sm"
            />
          )}
        </div>
      )}

      {/* Hero stats */}
      <div className="mb-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="card overflow-hidden">
          <div className="bg-gradient-to-br from-brand-red-500 to-brand-red-700 p-5 text-white">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs uppercase tracking-wider text-white/80">
                  Doanh thu {rangeMeta.label.toLowerCase()}
                </div>
                <div className="mt-1 text-3xl font-extrabold">
                  {ordersStream.loading ? "..." : formatCurrency(totalRevenue)}
                </div>
              </div>
              <ArrowUpRight size={20} className="text-white/50" />
            </div>
            <div className="mt-2 flex items-center gap-1 text-xs text-white/90">
              <TrendingUp size={12} />
              <span className="text-white/70">
                Tính từ đơn đã hoàn tất trong kỳ
              </span>
            </div>
          </div>
        </div>

        <DashboardStat
          icon={ShoppingBag}
          label="Đơn hàng"
          value={
            ordersStream.loading
              ? "..."
              : totalOrders.toLocaleString("vi-VN")
          }
          sublabel={`AOV: ${formatCurrency(avgOrderValue)}`}
          color="blue"
        />

        <DashboardStat
          icon={Wallet}
          label="Tổng đơn shop"
          value={
            ordersStream.loading
              ? "..."
              : orderCounts.total.toLocaleString("vi-VN")
          }
          sublabel={`${orderCounts.completed} đã hoàn tất`}
          color="gold"
        />

        <DashboardStat
          icon={ShieldCheck}
          label="QRVerified"
          value={
            qrDashboardQuery.isLoading
              ? "..."
              : (qrDashboard?.totalQrCodes ?? 0).toLocaleString("vi-VN")
          }
          sublabel={`${(qrDashboard?.totalQrBatches ?? 0).toLocaleString("vi-VN")} batch đã tạo`}
          color="green"
        />
      </div>

      {/* Pending actions */}
      <div className="mb-6">
        <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-neutral-900">
          <AlertCircle size={18} className="text-brand-red-500" />
          Cần xử lý ngay
        </h2>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {pendingActions.map((a) => (
            <Link
              key={a.label}
              to={a.to}
              className={cn(
                "group card flex items-center justify-between p-4 transition-colors hover:shadow-md",
                a.count === 0 && "opacity-60"
              )}
            >
              <div>
                <div className="text-3xl font-extrabold text-neutral-900">
                  {ordersStream.loading || productsQuery.isLoading ? "..." : a.count}
                </div>
                <div className="text-xs text-neutral-500">{a.label}</div>
              </div>
              <ChevronRight
                size={16}
                className="text-neutral-300 group-hover:text-brand-red-500"
              />
            </Link>
          ))}
        </div>
      </div>

      {/* Chart + Recent orders */}
      <div className="grid gap-5 lg:grid-cols-3">
        {/* Revenue chart */}
        <div className="card overflow-hidden lg:col-span-2">
          <div className="border-b border-neutral-100 p-4">
            <h2 className="text-base font-bold text-neutral-900">Biểu đồ doanh thu</h2>
            <p className="text-xs text-neutral-500">
              {revenueByDay.length} ngày gần đây
            </p>
          </div>
          <div className="p-4">
            {ordersStream.loading ? (
              <Skeleton className="h-48 w-full" />
            ) : revenueByDay.every((d) => d.revenue === 0) ? (
              <div className="flex h-48 flex-col items-center justify-center text-center text-sm text-neutral-500">
                <Inbox size={32} className="text-neutral-300" />
                <p className="mt-2">Chưa có doanh thu trong kỳ này</p>
              </div>
            ) : (
              <SimpleBarChart data={revenueByDay} />
            )}
          </div>
        </div>

        {/* Recent orders */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-neutral-100 p-4">
            <h2 className="text-base font-bold text-neutral-900">Đơn mới</h2>
            <Link
              to="/seller/orders"
              className="text-xs font-semibold text-brand-red-600 hover:underline"
            >
              Tất cả →
            </Link>
          </div>
          {ordersStream.loading ? (
            <div className="space-y-2 p-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
              <Inbox size={32} className="text-neutral-300" />
              <p className="mt-2 text-xs text-neutral-500">
                Chưa có đơn hàng nào.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {recentOrders.map((o) => (
                <Link
                  key={o.id}
                  to={`/seller/orders/${o.code}`}
                  className="block p-3 hover:bg-neutral-50"
                >
                  <div className="flex items-center gap-3">
                    {o.items[0]?.image ? (
                      <img
                        src={o.items[0].image}
                        alt=""
                        className="h-10 w-10 shrink-0 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 shrink-0 rounded-lg bg-neutral-100" />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-xs font-semibold text-neutral-900">
                          {o.customerName}
                        </span>
                        <span className="text-[10px] text-neutral-400">
                          {o.created_at
                            ? formatRelativeTime(o.created_at.toDate())
                            : ""}
                        </span>
                      </div>
                      <div className="text-[11px] text-neutral-500">
                        <code className="font-mono">{o.code}</code> ·{" "}
                        {o.items.length} SP
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-brand-red-600">
                        {formatCurrency(o.total)}
                      </div>
                      {o.status === "awaiting_confirm" && (
                        <div className="text-[9px] font-bold uppercase text-amber-600">
                          Cần xác nhận
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Performance — sourced from vendor stats. Empty/zero values render as "—". */}
      <div className="card mt-6 p-5">
        <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-neutral-900">
          <Sparkles size={16} className="text-brand-gold-500" />
          Sức khoẻ shop
        </h2>
        <div className="grid gap-4 md:grid-cols-4">
          <PerformanceMetric
            icon={Clock}
            label="Giao đúng hạn"
            value={
              vendor?.on_time_shipping_rate
                ? `${vendor.on_time_shipping_rate}%`
                : "Đang đồng bộ"
            }
            tone="emerald"
          />
          <PerformanceMetric
            icon={Star}
            label="Đánh giá"
            value={vendor?.avg_rating ? vendor.avg_rating.toFixed(1) : "—"}
            tone="gold"
          />
          <PerformanceMetric
            icon={Users}
            label="Followers"
            value={
              vendor?.follower_count
                ? vendor.follower_count.toLocaleString("vi-VN")
                : "0"
            }
            tone="red"
          />
          <PerformanceMetric
            icon={Package}
            label="Tổng sản phẩm"
            value={
              productsQuery.isLoading
                ? "..."
                : products.length.toLocaleString("vi-VN")
            }
            tone="emerald"
          />
        </div>
      </div>

      {/* Aivy hint */}
      <Link
        to="/aivy"
        className="card mt-5 flex items-center justify-between p-4 hover:bg-neutral-50"
      >
        <div className="flex items-center gap-3">
          <Sparkles className="text-brand-gold-500" />
          <div>
            <div className="font-semibold text-neutral-900">
              Aivy có thể giúp tối ưu shop
            </div>
            <div className="text-xs text-neutral-500">
              Hỏi Aivy gợi ý cách tăng đơn, cải thiện rating
            </div>
          </div>
        </div>
        <ChevronRight size={16} className="text-neutral-400" />
      </Link>
    </div>
  )
}

function DashboardStat({
  icon: Icon,
  label,
  value,
  sublabel,
  color,
}: {
  icon: typeof TrendingUp
  label: string
  value: string
  sublabel?: string
  color: "blue" | "gold" | "green" | "red"
}) {
  const palette = {
    blue: "bg-blue-50 text-blue-600",
    gold: "bg-brand-gold-50 text-brand-gold-600",
    green: "bg-emerald-50 text-emerald-600",
    red: "bg-brand-red-50 text-brand-red-600",
  }[color]

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

function PerformanceMetric({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof TrendingUp
  label: string
  value: string
  tone: "emerald" | "gold" | "red"
}) {
  const colors = {
    emerald: "text-emerald-600",
    gold: "text-brand-gold-600",
    red: "text-brand-red-600",
  }[tone]
  return (
    <div className="text-center">
      <Icon size={20} className={cn("mx-auto", colors)} />
      <div className="mt-1.5 text-lg font-extrabold text-neutral-900">{value}</div>
      <div className="text-xs text-neutral-500">{label}</div>
    </div>
  )
}

function SimpleBarChart({
  data,
}: {
  data: { date: string; revenue: number; orders: number }[]
}) {
  const max = Math.max(...data.map((d) => d.revenue), 1)
  return (
    <div className="flex h-48 items-end gap-1">
      {data.map((d) => {
        const h = (d.revenue / max) * 100
        return (
          <div
            key={d.date}
            className="group flex flex-1 flex-col items-center justify-end"
            title={`${d.date}: ${formatCurrency(d.revenue)} (${d.orders} đơn)`}
          >
            <div
              className="w-full rounded-t bg-gradient-to-t from-brand-red-500 to-brand-red-300 transition-all hover:from-brand-red-600 hover:to-brand-red-400"
              style={{ height: `${h}%` }}
            />
            <div className="mt-1 text-[8px] text-neutral-400 group-hover:font-semibold group-hover:text-neutral-700">
              {new Date(d.date).getDate()}
            </div>
          </div>
        )
      })}
    </div>
  )
}
