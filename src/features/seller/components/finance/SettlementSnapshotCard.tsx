import { useMemo } from "react"
import { Download, CalendarRange, Layers3, Wallet, Clock3, BadgePercent, ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react"
import toast from "react-hot-toast"
import { formatCurrency, formatDateTime } from "../../../../lib/format"
import { useSellerBalance, useTransactionHistory } from "../../../../hooks/use-seller-finance"
import {
  buildSettlementSnapshotSummary,
  settlementSnapshotToCsv,
} from "../../../../lib/settlement-report"
import { cn } from "../../../../lib/cn"

export function SettlementSnapshotCard(props: { from: Date; to: Date }) {
  const balance = useSellerBalance()
  const filters = useMemo(
    () => ({
      from: props.from,
      to: props.to,
      limit: 5000,
    }),
    [props.from.getTime(), props.to.getTime()],
  )
  const txs = useTransactionHistory(filters)

  const summary = useMemo(
    () =>
      buildSettlementSnapshotSummary({
        from: props.from,
        to: props.to,
        transactions: txs.data ?? [],
        balance: balance.data,
      }),
    [props.from.getTime(), props.to.getTime(), txs.data, balance.data],
  )

  const loading = balance.isLoading || txs.isLoading

  const handleExport = () => {
    if (!summary) return
    const csv = settlementSnapshotToCsv(summary)
    const filename = `settlement-snapshot-${props.from.toISOString().slice(0, 10)}_${props.to.toISOString().slice(0, 10)}.csv`
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success("Đã xuất snapshot settlement")
  }

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-neutral-100 p-4">
        <div>
          <div className="flex items-center gap-2 text-base font-bold text-neutral-900">
            <CalendarRange size={16} className="text-brand-red-500" />
            Snapshot settlement theo kỳ
          </div>
          <p className="mt-1 text-xs text-neutral-500">
            Dữ liệu được tính từ sellerTransactions + sellerBalances hiện tại.
          </p>
        </div>
        <button onClick={handleExport} className="btn-secondary text-xs">
          <Download size={14} />
          Xuất CSV
        </button>
      </div>

      {loading ? (
        <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="h-20 animate-pulse rounded-xl bg-neutral-100" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 p-4 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <MetricCard
                label="Số dư đầu kỳ"
                value={formatCurrency(summary.openingNetBalance)}
                icon={Layers3}
              />
              <MetricCard
                label="Doanh thu phát sinh"
                value={formatCurrency(summary.revenue)}
                icon={ArrowDownRight}
                tone="emerald"
              />
              <MetricCard
                label="Phí + hoàn tiền"
                value={formatCurrency(summary.commissionFee + summary.paymentGatewayFee + summary.adsFee + summary.livestreamFee + summary.refunds)}
                icon={BadgePercent}
                tone="rose"
              />
              <MetricCard
                label="Payout trong kỳ"
                value={formatCurrency(summary.payouts)}
                icon={ArrowUpRight}
                tone="blue"
              />
              <MetricCard
                label="Hold đã giải phóng"
                value={formatCurrency(summary.holdReleased)}
                icon={Clock3}
                tone="amber"
              />
              <MetricCard
                label="Dòng ròng kỳ này"
                value={formatCurrency(summary.netMovement)}
                icon={Wallet}
                tone="neutral"
              />
            </div>

            <div className="rounded-xl border border-neutral-200 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-neutral-900">Kỳ báo cáo</h3>
                  <p className="text-xs text-neutral-500">
                    {formatDateTime(summary.periodStart)} - {formatDateTime(summary.periodEnd)}
                  </p>
                </div>
                <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-600">
                  {summary.transactionCount} giao dịch
                </span>
              </div>

              <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                <Row label="Số dư ròng cuối kỳ" value={formatCurrency(summary.closingNetBalance)} valueClass="font-extrabold text-brand-red-600" />
                <Row label="Khả dụng hiện tại" value={formatCurrency(summary.balance.availableBalance)} />
                <Row label="Đang chờ" value={formatCurrency(summary.balance.pendingBalance)} />
                <Row label="Đang giữ" value={formatCurrency(summary.balance.holdBalance)} />
                <Row label="Nghĩa vụ hoàn tiền" value={formatCurrency(summary.balance.refundLiabilityBalance)} />
                <Row label="Điều chỉnh thủ công" value={formatCurrency(summary.manualAdjustments)} />
              </dl>
            </div>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-4">
            <h3 className="text-sm font-semibold text-neutral-900">Tóm tắt kỳ</h3>
            <div className="mt-3 overflow-hidden rounded-xl border border-neutral-100">
              <table className="min-w-full divide-y divide-neutral-100 text-sm">
                <tbody className="divide-y divide-neutral-100">
                  <SnapshotRow label="Doanh thu phát sinh" value={summary.revenue} tone="emerald" />
                  <SnapshotRow label="Phí hoa hồng" value={summary.commissionFee} tone="rose" />
                  <SnapshotRow label="Phí cổng thanh toán" value={summary.paymentGatewayFee} tone="rose" />
                  <SnapshotRow label="Phí quảng cáo" value={summary.adsFee} tone="rose" />
                  <SnapshotRow label="Phí livestream" value={summary.livestreamFee} tone="rose" />
                  <SnapshotRow label="Hoàn tiền" value={summary.refunds} tone="rose" />
                  <SnapshotRow label="Chi trả seller" value={summary.payouts} tone="blue" />
                  <SnapshotRow label="Giải phóng hold" value={summary.holdReleased} tone="amber" />
                  <SnapshotRow label="Điều chỉnh thủ công" value={summary.manualAdjustments} tone="neutral" />
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-neutral-500">
              Snapshot này dùng để đối soát nội bộ. Khi cần gửi đối tác, hãy xuất CSV và đính kèm cùng kỳ thanh toán.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

function MetricCard({
  label,
  value,
  icon: Icon,
  tone = "neutral",
}: {
  label: string
  value: string
  icon: LucideIcon
  tone?: "neutral" | "emerald" | "rose" | "blue" | "amber"
}) {
  const tones: Record<"neutral" | "emerald" | "rose" | "blue" | "amber", string> = {
    neutral: "bg-neutral-100 text-neutral-600",
    emerald: "bg-emerald-50 text-emerald-600",
    rose: "bg-rose-50 text-rose-600",
    blue: "bg-blue-50 text-blue-600",
    amber: "bg-amber-50 text-amber-600",
  }

  return (
    <div className="rounded-xl border border-neutral-100 bg-white p-3 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-wider text-neutral-500">{label}</p>
          <p className="mt-1 text-lg font-bold text-neutral-900">{value}</p>
        </div>
        <div className={cn("rounded-lg p-2", tones[tone])}>
          <Icon size={16} />
        </div>
      </div>
    </div>
  )
}

function SnapshotRow({
  label,
  value,
  tone = "neutral",
}: {
  label: string
  value: number
  tone: "neutral" | "emerald" | "rose" | "blue" | "amber"
}) {
  const classes: Record<"neutral" | "emerald" | "rose" | "blue" | "amber", string> = {
    neutral: "text-neutral-900",
    emerald: "text-emerald-600",
    rose: "text-rose-600",
    blue: "text-blue-600",
    amber: "text-amber-600",
  }

  return (
    <tr>
      <td className="px-3 py-2 text-xs text-neutral-600">{label}</td>
      <td className={cn("px-3 py-2 text-right text-xs font-semibold", classes[tone])}>
        {formatCurrency(value)}
      </td>
    </tr>
  )
}

function Row({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-neutral-50 px-3 py-2">
      <dt className="text-xs text-neutral-500">{label}</dt>
      <dd className={cn("text-sm font-semibold text-neutral-900", valueClass)}>{value}</dd>
    </div>
  )
}
