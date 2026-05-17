import { useMemo } from "react"
import { Loader2, PieChart, BarChart3 } from "lucide-react"
import { formatCurrency } from "../../../../lib/format"
import { cn } from "../../../../lib/cn"
import { useRevenueBreakdown } from "../../../../hooks/use-seller-finance"
import type { RevenueBreakdownSummary } from "../../finance-types"

const SLICE_COLORS = [
  "#dc2626", // brand-red-600
  "#f59e0b", // brand-gold-500
  "#0ea5e9", // sky-500
  "#10b981", // emerald-500
  "#a855f7", // purple-500
  "#ec4899", // pink-500
  "#64748b", // slate-500
]

const CHANNEL_LABEL: Record<string, string> = {
  online: "Online",
  store: "Cửa hàng",
  cloud: "Cloud",
  live: "Livestream",
}

export function RevenueBreakdownChart({ range }: { range: { from: Date; to: Date } }) {
  const breakdown = useRevenueBreakdown(range)
  const data = breakdown.data

  if (breakdown.isLoading) {
    return (
      <div className="card flex h-64 items-center justify-center p-5">
        <Loader2 className="animate-spin text-neutral-400" />
      </div>
    )
  }

  if (!data || data.totalRevenue === 0) {
    return (
      <div className="card p-5 text-center text-sm text-neutral-500">
        Chưa có dữ liệu doanh thu trong khoảng thời gian này.
      </div>
    )
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <CategoryPieCard data={data} />
      <MonthBarCard data={data} />
    </div>
  )
}

function CategoryPieCard({ data }: { data: RevenueBreakdownSummary }) {
  const slices = useMemo(() => {
    const top = data.byCategory.slice(0, 6)
    const rest = data.byCategory.slice(6)
    const restSum = rest.reduce((s, c) => s + c.revenue, 0)
    const arr = [...top]
    if (restSum > 0) arr.push({ category: "Khác", revenue: restSum, orderCount: rest.reduce((s, c) => s + c.orderCount, 0) })
    return arr
  }, [data])

  const totalChannelRevenue = data.byChannel.reduce((s, c) => s + c.revenue, 0)

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center gap-2 border-b border-neutral-100 p-4 text-base font-bold text-neutral-900">
        <PieChart size={16} className="text-brand-red-500" />
        Doanh thu theo danh mục
      </div>
      <div className="grid gap-4 p-5 md:grid-cols-[180px_1fr]">
        <DonutSvg slices={slices} total={data.totalRevenue} />
        <ul className="space-y-2 text-sm">
          {slices.map((s, i) => {
            const pct = data.totalRevenue > 0 ? (s.revenue / data.totalRevenue) * 100 : 0
            return (
              <li key={s.category} className="flex items-center gap-2">
                <span
                  className="h-3 w-3 shrink-0 rounded-sm"
                  style={{ backgroundColor: SLICE_COLORS[i % SLICE_COLORS.length] }}
                />
                <span className="flex-1 truncate text-neutral-700">{s.category}</span>
                <span className="text-xs font-semibold text-neutral-500">{pct.toFixed(1)}%</span>
                <span className="w-24 text-right font-bold text-neutral-900">
                  {formatCurrency(s.revenue)}
                </span>
              </li>
            )
          })}
        </ul>
      </div>

      {/* Channel split */}
      {data.byChannel.length > 0 && (
        <div className="border-t border-neutral-100 p-4">
          <div className="mb-2 text-xs font-bold uppercase tracking-wider text-neutral-500">
            Theo kênh bán
          </div>
          <div className="flex h-2.5 overflow-hidden rounded-full bg-neutral-100">
            {data.byChannel.map((c, i) => {
              const pct = totalChannelRevenue > 0 ? (c.revenue / totalChannelRevenue) * 100 : 0
              return (
                <div
                  key={c.channel}
                  style={{
                    width: `${pct}%`,
                    backgroundColor: SLICE_COLORS[i % SLICE_COLORS.length],
                  }}
                  title={`${CHANNEL_LABEL[c.channel]}: ${pct.toFixed(1)}%`}
                />
              )
            })}
          </div>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
            {data.byChannel.map((c, i) => (
              <div key={c.channel} className="flex items-center gap-1.5">
                <span
                  className="h-2 w-2 rounded-sm"
                  style={{ backgroundColor: SLICE_COLORS[i % SLICE_COLORS.length] }}
                />
                <span className="text-neutral-600">{CHANNEL_LABEL[c.channel] ?? c.channel}</span>
                <span className="font-semibold text-neutral-900">{formatCurrency(c.revenue)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function MonthBarCard({ data }: { data: RevenueBreakdownSummary }) {
  const max = Math.max(1, ...data.byMonth.map((m) => m.revenue))
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center gap-2 border-b border-neutral-100 p-4 text-base font-bold text-neutral-900">
        <BarChart3 size={16} className="text-brand-red-500" />
        Doanh thu theo tháng
      </div>
      <div className="p-5">
        {data.byMonth.length === 0 ? (
          <div className="py-6 text-center text-sm text-neutral-500">
            Chưa có dữ liệu theo tháng.
          </div>
        ) : (
          <>
            <div className="flex h-48 items-end gap-2">
              {data.byMonth.map((m) => {
                const h = (m.revenue / max) * 100
                return (
                  <div
                    key={m.month}
                    className="group flex flex-1 flex-col items-center justify-end"
                    title={`${formatMonth(m.month)}: ${formatCurrency(m.revenue)} (${m.orderCount} đơn)`}
                  >
                    <div className="mb-1 text-[10px] font-semibold text-neutral-700 opacity-0 group-hover:opacity-100">
                      {formatCurrencyShort(m.revenue)}
                    </div>
                    <div
                      className={cn(
                        "w-full rounded-t bg-gradient-to-t from-brand-red-500 to-brand-red-300",
                        "transition-all hover:from-brand-red-600 hover:to-brand-red-400",
                      )}
                      style={{ height: `${h}%` }}
                    />
                    <div className="mt-1 text-[10px] text-neutral-500">{formatMonth(m.month)}</div>
                  </div>
                )
              })}
            </div>
            <div className="mt-4 flex justify-between border-t border-neutral-100 pt-3 text-xs text-neutral-500">
              <span>Tổng đơn: <strong className="text-neutral-900">{data.totalOrders}</strong></span>
              <span>Tổng doanh thu: <strong className="text-brand-red-600">{formatCurrency(data.totalRevenue)}</strong></span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function DonutSvg({
  slices,
  total,
}: {
  slices: Array<{ category: string; revenue: number }>
  total: number
}) {
  const size = 160
  const r = 64
  const stroke = 28
  const cx = size / 2
  const cy = size / 2
  const circumference = 2 * Math.PI * r

  let offset = 0
  const arcs = slices.map((s, i) => {
    const pct = total > 0 ? s.revenue / total : 0
    const len = pct * circumference
    const arc = (
      <circle
        key={s.category}
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={SLICE_COLORS[i % SLICE_COLORS.length]}
        strokeWidth={stroke}
        strokeDasharray={`${len} ${circumference - len}`}
        strokeDashoffset={-offset}
        transform={`rotate(-90 ${cx} ${cy})`}
      />
    )
    offset += len
    return arc
  })

  return (
    <div className="relative flex h-40 w-40 items-center justify-center">
      <svg width={size} height={size}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f3f4f6" strokeWidth={stroke} />
        {arcs}
      </svg>
      <div className="absolute text-center">
        <div className="text-[10px] uppercase tracking-wider text-neutral-500">Tổng</div>
        <div className="text-sm font-extrabold text-neutral-900">{formatCurrencyShort(total)}</div>
      </div>
    </div>
  )
}

function formatMonth(monthKey: string): string {
  const [, mm] = monthKey.split("-")
  return `T${parseInt(mm, 10)}`
}

function formatCurrencyShort(v: number): string {
  if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}B`
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`
  return v.toString()
}
