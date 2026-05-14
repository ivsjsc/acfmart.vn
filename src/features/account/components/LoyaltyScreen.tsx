import { useState } from "react"
import { Link } from "react-router-dom"
import {
  Sparkles,
  Star,
  Gift,
  Crown,
  TrendingUp,
  Clock,
  Check,
  ChevronRight,
  AlertCircle,
} from "lucide-react"
import toast from "react-hot-toast"
import {
  MOCK_LOYALTY_STATE,
  MOCK_POINT_TRANSACTIONS,
  REDEEM_OPTIONS,
  TIERS,
  getTierMeta,
  getTierProgress,
  type LoyaltyPointTransaction,
} from "../loyalty-data"
import { formatCurrency, formatDateTime, formatRelativeTime } from "../../../lib/format"
import { cn } from "../../../lib/cn"

const TAB_LIST = [
  { id: "overview", label: "Tổng quan" },
  { id: "redeem", label: "Đổi điểm" },
  { id: "history", label: "Lịch sử" },
  { id: "tiers", label: "Hạng thẻ" },
] as const

type TabId = (typeof TAB_LIST)[number]["id"]

const TXN_META: Record<LoyaltyPointTransaction["type"], { color: string; icon: typeof Star }> = {
  earn: { color: "text-emerald-600 bg-emerald-50", icon: TrendingUp },
  redeem: { color: "text-brand-red-600 bg-brand-red-50", icon: Gift },
  expire: { color: "text-rose-600 bg-rose-50", icon: Clock },
  adjust: { color: "text-blue-600 bg-blue-50", icon: AlertCircle },
}

export default function LoyaltyScreen() {
  const [tab, setTab] = useState<TabId>("overview")
  const [points, setPoints] = useState(MOCK_LOYALTY_STATE.currentPoints)
  const state = MOCK_LOYALTY_STATE
  const tierMeta = getTierMeta(state.tier)
  const progress = getTierProgress(state.totalSpent, state.tier, state.nextTier)

  function handleRedeem(opt: (typeof REDEEM_OPTIONS)[number]) {
    if (points < opt.pointsCost) {
      toast.error("Bạn không đủ điểm")
      return
    }
    if (!confirm(`Đổi ${opt.pointsCost.toLocaleString("vi-VN")} điểm lấy "${opt.title}"?`)) return
    setPoints(points - opt.pointsCost)
    toast.success(`Đã đổi thành công! Mã: ${opt.voucherCode}`)
  }

  return (
    <div className="space-y-5">
      {/* Hero card */}
      <div className="card overflow-hidden">
        <div
          className={cn(
            "relative p-6 text-white bg-gradient-to-br",
            tierMeta.bgGradient
          )}
        >
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-4 -left-4 h-32 w-32 rounded-full bg-white/10 blur-2xl" />

          <div className="relative flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-white/80">
                <Crown size={14} />
                <span className="font-medium uppercase tracking-wider">
                  Hạng {tierMeta.label}
                </span>
              </div>
              <div className="mt-1 text-xs text-white/70">Điểm khả dụng</div>
              <div className="mt-1 flex items-baseline gap-1">
                <div className="text-4xl font-extrabold">
                  {points.toLocaleString("vi-VN")}
                </div>
                <div className="text-sm font-semibold text-white/90">điểm</div>
              </div>
              {state.pointsExpiringSoon > 0 && (
                <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-0.5 text-xs backdrop-blur">
                  <Clock size={11} />
                  <span>
                    {state.pointsExpiringSoon.toLocaleString("vi-VN")} điểm hết
                    hạn {new Date(state.expireDate).toLocaleDateString("vi-VN")}
                  </span>
                </div>
              )}
            </div>
            <Sparkles size={32} className="text-white/30" />
          </div>

          {/* Tier progress */}
          {progress.remaining > 0 && (
            <div className="relative mt-5">
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span>
                  Cách hạng{" "}
                  <strong className="font-bold">{progress.nextTierLabel}</strong>:
                </span>
                <strong className="font-bold">
                  {formatCurrency(progress.remaining)}
                </strong>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-white transition-all"
                  style={{ width: `${progress.progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-200">
        {TAB_LIST.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
              tab === t.id
                ? "border-brand-red-500 text-brand-red-600"
                : "border-transparent text-neutral-600 hover:text-neutral-900"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === "overview" && (
        <>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="card p-4">
              <div className="text-xs text-neutral-500">Tổng tích lũy</div>
              <div className="mt-1 text-2xl font-extrabold text-brand-red-600">
                {state.totalEarned.toLocaleString("vi-VN")} điểm
              </div>
            </div>
            <div className="card p-4">
              <div className="text-xs text-neutral-500">Đã chi tiêu</div>
              <div className="mt-1 text-2xl font-extrabold text-brand-gold-600">
                {formatCurrency(state.totalSpent)}
              </div>
            </div>
            <div className="card p-4">
              <div className="text-xs text-neutral-500">Đặc quyền</div>
              <div className="mt-1 text-2xl font-extrabold text-violet-600">
                {tierMeta.perks.length}
              </div>
            </div>
          </div>

          <div className="card p-5">
            <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-neutral-900">
              <Crown size={16} className={tierMeta.color} />
              Đặc quyền hạng {tierMeta.label}
            </h2>
            <ul className="space-y-2">
              {tierMeta.perks.map((p) => (
                <li key={p} className="flex items-start gap-2 text-sm text-neutral-700">
                  <Check size={14} className="mt-0.5 shrink-0 text-emerald-600" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="card p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-bold text-neutral-900">Đổi nhanh</h2>
              <button
                onClick={() => setTab("redeem")}
                className="text-xs font-semibold text-brand-red-600 hover:underline"
              >
                Xem tất cả →
              </button>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {REDEEM_OPTIONS.slice(0, 3).map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleRedeem(opt)}
                  disabled={points < opt.pointsCost}
                  className="flex flex-col items-start gap-2 rounded-xl border border-neutral-200 p-3 text-left transition-colors hover:border-brand-red-300 hover:bg-brand-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Gift size={20} className="text-brand-red-500" />
                  <div className="text-sm font-bold text-neutral-900">
                    {opt.title}
                  </div>
                  <div className="text-xs text-neutral-500">{opt.description}</div>
                  <div className="mt-auto text-sm font-extrabold text-brand-gold-600">
                    {opt.pointsCost.toLocaleString("vi-VN")} điểm
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Redeem */}
      {tab === "redeem" && (
        <div className="grid gap-3 md:grid-cols-2">
          {REDEEM_OPTIONS.map((opt) => {
            const enough = points >= opt.pointsCost
            return (
              <div key={opt.id} className="card flex flex-col p-5">
                <div className="flex items-center gap-2">
                  <Gift size={22} className="text-brand-red-500" />
                  <span className="rounded-md bg-brand-red-50 px-2 py-0.5 text-[10px] font-bold uppercase text-brand-red-700">
                    {opt.type === "voucher" ? "Voucher" : opt.type === "freeship" ? "Freeship" : "Cashback"}
                  </span>
                </div>
                <h3 className="mt-3 text-lg font-bold text-neutral-900">
                  {opt.title}
                </h3>
                <p className="text-sm text-neutral-600">{opt.description}</p>
                <div className="my-3 flex items-baseline gap-1">
                  <span className="text-2xl font-extrabold text-brand-gold-600">
                    {opt.pointsCost.toLocaleString("vi-VN")}
                  </span>
                  <span className="text-sm text-neutral-500">điểm</span>
                </div>
                <button
                  onClick={() => handleRedeem(opt)}
                  disabled={!enough}
                  className={cn(
                    "btn-primary justify-center",
                    !enough && "cursor-not-allowed opacity-50"
                  )}
                >
                  {enough ? "Đổi ngay" : `Cần thêm ${(opt.pointsCost - points).toLocaleString("vi-VN")} điểm`}
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* History */}
      {tab === "history" && (
        <div className="card overflow-hidden">
          <div className="divide-y divide-neutral-100">
            {MOCK_POINT_TRANSACTIONS.map((tx) => {
              const meta = TXN_META[tx.type]
              return (
                <div key={tx.id} className="flex items-center gap-3 p-4">
                  <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", meta.color)}>
                    <meta.icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-neutral-900">
                      {tx.description}
                    </div>
                    <div className="text-[11px] text-neutral-500">
                      {formatDateTime(tx.date)} · {formatRelativeTime(tx.date)}
                    </div>
                  </div>
                  <div className={cn(
                    "text-base font-bold",
                    tx.points > 0 ? "text-emerald-600" : "text-rose-600"
                  )}>
                    {tx.points > 0 ? "+" : ""}
                    {tx.points.toLocaleString("vi-VN")}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Tiers */}
      {tab === "tiers" && (
        <div className="space-y-3">
          {TIERS.map((t) => {
            const isCurrent = t.id === state.tier
            return (
              <div
                key={t.id}
                className={cn(
                  "card overflow-hidden",
                  isCurrent && "ring-2 ring-brand-red-500"
                )}
              >
                <div className={cn("bg-gradient-to-r p-4 text-white", t.bgGradient)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Crown size={20} />
                      <div>
                        <div className="text-lg font-bold">Hạng {t.label}</div>
                        <div className="text-xs text-white/80">
                          {t.minSpend === 0
                            ? "Mặc định"
                            : `Chi tiêu ≥ ${formatCurrency(t.minSpend)}`}
                        </div>
                      </div>
                    </div>
                    {isCurrent && (
                      <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-bold backdrop-blur">
                        Hiện tại
                      </span>
                    )}
                  </div>
                </div>
                <ul className="space-y-1.5 p-4 text-sm">
                  {t.perks.map((p) => (
                    <li key={p} className="flex items-start gap-2">
                      <Check size={14} className="mt-0.5 shrink-0 text-emerald-600" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      )}

      <Link to="/aivy" className="card flex items-center justify-between p-4 hover:bg-neutral-50">
        <div className="flex items-center gap-3">
          <Sparkles className="text-brand-gold-500" />
          <div>
            <div className="font-semibold text-neutral-900">
              Aivy có thể tư vấn cách lên hạng nhanh
            </div>
            <div className="text-xs text-neutral-500">
              Hỏi Aivy để được gợi ý ưu đãi phù hợp
            </div>
          </div>
        </div>
        <ChevronRight size={16} className="text-neutral-400" />
      </Link>
    </div>
  )
}
