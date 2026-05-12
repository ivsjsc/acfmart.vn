import { useState, useMemo } from "react"
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
} from "lucide-react"
import { formatCurrency, formatRelativeTime } from "../../../lib/format"
import { cn } from "../../../lib/cn"
import {
  MOCK_REVENUE_LAST_30D,
  MOCK_SELLER_ORDERS,
  MOCK_SELLER_PROFILE,
  MOCK_SELLER_STATS,
} from "../mock-data"

const RANGE_OPTIONS = [
  { id: "today", label: "Hôm nay" },
  { id: "7d", label: "7 ngày" },
  { id: "30d", label: "30 ngày" },
] as const
type RangeId = (typeof RANGE_OPTIONS)[number]["id"]

export default function SellerDashboardScreen() {
  const stats = MOCK_SELLER_STATS
  const profile = MOCK_SELLER_PROFILE
  const [range, setRange] = useState<RangeId>("7d")

  const filteredData = useMemo(() => {
    if (range === "today") return MOCK_REVENUE_LAST_30D.slice(-1)
    if (range === "7d") return MOCK_REVENUE_LAST_30D.slice(-7)
    return MOCK_REVENUE_LAST_30D
  }, [range])

  const totalRevenue = filteredData.reduce((s, d) => s + d.revenue, 0)
  const totalOrders = filteredData.reduce((s, d) => s + d.orders, 0)
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

  const recentOrders = MOCK_SELLER_ORDERS.slice(0, 5)
  const pendingActions = [
    { count: stats.orders.awaitingConfirm, label: "Cần xác nhận", to: "/seller/orders?status=awaiting_confirm", color: "amber" },
    { count: stats.orders.awaitingPack, label: "Cần đóng gói", to: "/seller/orders?status=confirmed", color: "blue" },
    { count: stats.orders.returnRequests, label: "Yêu cầu trả hàng", to: "/seller/orders?status=return_requested", color: "rose" },
    { count: stats.products.lowStock, label: "SP sắp hết hàng", to: "/seller/products?filter=low-stock", color: "amber" },
  ]

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 lg:text-3xl">
            Chào, {profile.ownerName.split(" ").pop()}!
          </h1>
          <p className="mt-1 text-sm text-neutral-600">
            Tổng quan kinh doanh của <strong>{profile.shopName}</strong>
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

      {/* Hero stats */}
      <div className="mb-6 grid gap-3 md:grid-cols-3">
        <div className="card overflow-hidden">
          <div className="bg-gradient-to-br from-brand-red-500 to-brand-red-700 p-5 text-white">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs uppercase tracking-wider text-white/80">
                  Doanh thu {RANGE_OPTIONS.find((r) => r.id === range)?.label.toLowerCase()}
                </div>
                <div className="mt-1 text-3xl font-extrabold">
                  {formatCurrency(totalRevenue)}
                </div>
              </div>
              <ArrowUpRight size={20} className="text-white/50" />
            </div>
            <div className="mt-2 flex items-center gap-1 text-xs text-white/90">
              <TrendingUp size={12} />
              <span className="font-semibold">+12.5%</span>
              <span className="text-white/70">so với kỳ trước</span>
            </div>
          </div>
        </div>

        <DashboardStat
          icon={ShoppingBag}
          label="Đơn hàng"
          value={totalOrders.toLocaleString("vi-VN")}
          sublabel={`AOV: ${formatCurrency(avgOrderValue)}`}
          color="blue"
        />

        <DashboardStat
          icon={Wallet}
          label="Sắp chi trả"
          value={formatCurrency(stats.revenue.pendingPayout)}
          sublabel="Chu kỳ tới"
          color="gold"
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
                  {a.count}
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
            <h2 className="text-base font-bold text-neutral-900">
              Biểu đồ doanh thu
            </h2>
            <p className="text-xs text-neutral-500">
              {filteredData.length} ngày gần đây
            </p>
          </div>
          <div className="p-4">
            <SimpleBarChart data={filteredData} />
          </div>
        </div>

        {/* Recent orders */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-neutral-100 p-4">
            <h2 className="text-base font-bold text-neutral-900">Đơn mới</h2>
            <Link to="/seller/orders" className="text-xs font-semibold text-brand-red-600 hover:underline">
              Tất cả →
            </Link>
          </div>
          <div className="divide-y divide-neutral-100">
            {recentOrders.map((o) => (
              <Link
                key={o.id}
                to={`/seller/orders/${o.code}`}
                className="block p-3 hover:bg-neutral-50"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={o.items[0].image}
                    alt=""
                    className="h-10 w-10 shrink-0 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate text-xs font-semibold text-neutral-900">
                        {o.buyerName}
                      </span>
                      <span className="text-[10px] text-neutral-400">
                        {formatRelativeTime(o.createdAt)}
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
        </div>
      </div>

      {/* Performance */}
      <div className="mt-6 card p-5">
        <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-neutral-900">
          <Sparkles size={16} className="text-brand-gold-500" />
          Sức khoẻ shop
        </h2>
        <div className="grid gap-4 md:grid-cols-5">
          <PerformanceMetric
            icon={Clock}
            label="Giao đúng hạn"
            value={`${stats.performance.onTimeShippingRate}%`}
            tone="emerald"
          />
          <PerformanceMetric
            icon={AlertCircle}
            label="Tỷ lệ huỷ"
            value={`${stats.performance.cancelRate}%`}
            tone="emerald"
          />
          <PerformanceMetric
            icon={Clock}
            label="Phản hồi TB"
            value={`${stats.performance.avgResponseMinutes} phút`}
            tone="emerald"
          />
          <PerformanceMetric
            icon={Star}
            label="Đánh giá"
            value={stats.performance.customerRating.toFixed(1)}
            tone="gold"
          />
          <PerformanceMetric
            icon={Users}
            label="Followers"
            value={stats.performance.followerCount.toLocaleString("vi-VN")}
            tone="red"
          />
        </div>
      </div>

      {/* Aivy hint */}
      <Link
        to="/aivy"
        className="mt-5 card flex items-center justify-between p-4 hover:bg-neutral-50"
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
  color: "blue" | "gold" | "red"
}) {
  const palette = {
    blue: "bg-blue-50 text-blue-600",
    gold: "bg-brand-gold-50 text-brand-gold-600",
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

function SimpleBarChart({ data }: { data: { date: string; revenue: number; orders: number }[] }) {
  const max = Math.max(...data.map((d) => d.revenue))
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
