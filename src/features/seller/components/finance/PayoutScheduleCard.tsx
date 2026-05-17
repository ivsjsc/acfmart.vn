import { useState } from "react"
import { Wallet, Clock, AlertCircle, ArrowUpRight, Loader2 } from "lucide-react"
import toast from "react-hot-toast"
import { formatCurrency, formatDateTime } from "../../../../lib/format"
import { cn } from "../../../../lib/cn"
import {
  useNextPayout,
  useRequestEarlyPayout,
  useSellerBalance,
} from "../../../../hooks/use-seller-finance"

const CYCLE_LABEL: Record<string, string> = {
  weekly: "Hàng tuần",
  bi_weekly: "2 tuần/lần",
  monthly: "Hàng tháng",
}

const STATUS_LABEL: Record<string, { text: string; tone: "amber" | "blue" | "emerald" | "rose" }> = {
  scheduled: { text: "Đã lên lịch", tone: "amber" },
  processing: { text: "Đang xử lý", tone: "blue" },
  paid: { text: "Đã thanh toán", tone: "emerald" },
  failed: { text: "Thất bại", tone: "rose" },
  on_hold: { text: "Tạm giữ", tone: "rose" },
}

export function PayoutScheduleCard() {
  const balance = useSellerBalance()
  const nextPayout = useNextPayout()
  const earlyPayout = useRequestEarlyPayout()
  const [confirmEarly, setConfirmEarly] = useState(false)

  const balanceData = balance.data
  const payout = nextPayout.data

  const handleEarlyPayout = async () => {
    try {
      await earlyPayout.mutateAsync()
      toast.success("Đã gửi yêu cầu rút sớm. Đội ngũ ACF sẽ phản hồi trong 24h.")
      setConfirmEarly(false)
    } catch (err) {
      toast.error("Không gửi được yêu cầu. Vui lòng thử lại.")
      console.error(err)
    }
  }

  if (balance.isLoading || nextPayout.isLoading) {
    return (
      <div className="card p-5">
        <div className="h-32 animate-pulse rounded-lg bg-neutral-100" />
      </div>
    )
  }

  return (
    <div className="card overflow-hidden">
      {/* Hero — pending payout */}
      <div className="bg-gradient-to-br from-brand-red-500 to-brand-red-700 p-5 text-white">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-white/80">
              <Wallet size={12} />
              Sắp được chi trả
            </div>
            <div className="mt-1.5 text-3xl font-extrabold">
              {formatCurrency(balanceData?.pendingBalance ?? 0)}
            </div>
            {payout && (
              <div className="mt-1.5 flex items-center gap-1 text-xs text-white/90">
                <Clock size={12} />
                <span>
                  Dự kiến: <strong>{formatDateTime(payout.scheduledFor.toDate())}</strong>
                </span>
              </div>
            )}
          </div>
          <span
            className={cn(
              "rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider",
              payout && STATUS_LABEL[payout.status]?.tone === "amber"
                ? "bg-amber-100 text-amber-700"
                : "bg-white/15 text-white",
            )}
          >
            {payout ? STATUS_LABEL[payout.status]?.text : "Không có"}
          </span>
        </div>

        {/* Quick metrics */}
        <div className="mt-5 grid grid-cols-3 gap-3 border-t border-white/20 pt-4 text-xs">
          <div>
            <div className="text-white/70">Khả dụng</div>
            <div className="mt-0.5 font-bold">
              {formatCurrency(balanceData?.availableBalance ?? 0)}
            </div>
          </div>
          <div>
            <div className="text-white/70">Đang giữ</div>
            <div className="mt-0.5 font-bold">
              {formatCurrency(balanceData?.holdBalance ?? 0)}
            </div>
          </div>
          <div>
            <div className="text-white/70">Chu kỳ</div>
            <div className="mt-0.5 font-bold">
              {CYCLE_LABEL[balanceData?.payoutCycle ?? "weekly"]}
            </div>
          </div>
        </div>
      </div>

      {/* Detail + CTA */}
      <div className="p-5">
        {payout ? (
          <dl className="space-y-2.5 text-sm">
            <Row label="Kỳ thanh toán" value={`${formatDateTime(payout.periodStart.toDate())} – ${formatDateTime(payout.periodEnd.toDate())}`} />
            <Row label="Số đơn" value={`${payout.orderCount} đơn`} />
            <Row label="Doanh thu gộp" value={formatCurrency(payout.grossAmount)} />
            <Row label="Trừ phí" value={`- ${formatCurrency(payout.commissionFee + payout.paymentGatewayFee + payout.adsFee + payout.livestreamFee)}`} valueClass="text-rose-600" />
            {payout.adjustments !== 0 && (
              <Row label="Điều chỉnh" value={formatCurrency(payout.adjustments)} valueClass={payout.adjustments < 0 ? "text-rose-600" : "text-emerald-600"} />
            )}
            <Row
              label="Thực nhận"
              value={formatCurrency(payout.netAmount)}
              valueClass="text-lg font-extrabold text-brand-red-600"
              dividerAbove
            />
            <Row
              label="Tài khoản nhận"
              value={`${payout.bankAccount.bankName} · ${maskAccount(payout.bankAccount.accountNumber)}`}
              valueClass="text-xs"
            />
          </dl>
        ) : (
          <div className="rounded-lg bg-neutral-50 p-4 text-center text-sm text-neutral-600">
            <AlertCircle className="mx-auto mb-2 text-neutral-400" size={20} />
            Chưa có lịch chi trả tiếp theo
          </div>
        )}

        {!confirmEarly ? (
          <button
            onClick={() => setConfirmEarly(true)}
            disabled={(balanceData?.availableBalance ?? 0) <= 0}
            className="btn-primary mt-4 w-full justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Yêu cầu rút sớm <ArrowUpRight size={14} />
          </button>
        ) : (
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
            <div className="text-xs text-amber-800">
              Phí xử lý rút sớm là <strong>1.5%</strong> trên số dư khả dụng. Tiếp tục?
            </div>
            <div className="mt-2 flex gap-2">
              <button
                onClick={handleEarlyPayout}
                disabled={earlyPayout.isPending}
                className="btn-primary flex-1 justify-center text-xs"
              >
                {earlyPayout.isPending && <Loader2 size={12} className="animate-spin" />}
                Xác nhận
              </button>
              <button
                onClick={() => setConfirmEarly(false)}
                className="btn-secondary flex-1 justify-center text-xs"
              >
                Huỷ
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Row({
  label,
  value,
  valueClass,
  dividerAbove,
}: {
  label: string
  value: string
  valueClass?: string
  dividerAbove?: boolean
}) {
  return (
    <div className={cn("flex items-center justify-between gap-3", dividerAbove && "border-t border-neutral-100 pt-2.5")}>
      <dt className="text-neutral-500">{label}</dt>
      <dd className={cn("font-semibold text-neutral-900", valueClass)}>{value}</dd>
    </div>
  )
}

function maskAccount(account: string): string {
  if (account.length <= 4) return account
  return `••••${account.slice(-4)}`
}
