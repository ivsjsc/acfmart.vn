import { useState } from "react"
import { Link } from "react-router-dom"
import { Check, ChevronRight, Clock, Crown, Gift, Sparkles, Star } from "lucide-react"
import toast from "react-hot-toast"
import { cn } from "../../../lib/cn"
import { formatCurrency } from "../../../lib/format"
import { REDEEM_OPTIONS, TIERS, getTierMeta, getTierProgress } from "../loyalty-data"

const TAB_LIST = [
  { id: "overview", label: "Tổng quan" },
  { id: "redeem", label: "Đổi điểm" },
  { id: "history", label: "Lịch sử" },
  { id: "tiers", label: "Hạng thẻ" },
] as const

type TabId = (typeof TAB_LIST)[number]["id"]

export default function LoyaltyScreen() {
  const [tab, setTab] = useState<TabId>("overview")
  const points = 0
  const totalEarned = 0
  const totalSpent = 0
  const tier = "silver" as const
  const nextTier = "gold" as const
  const tierMeta = getTierMeta(tier)
  const progress = getTierProgress(totalSpent, tier, nextTier)

  function handleRedeem() {
    toast("Điểm thưởng sẽ đổi được khi hệ thống loyalty có dữ liệu thật")
  }

  return (
    <div className="space-y-5">
      <div className="card overflow-hidden">
        <div className={cn("bg-gradient-to-br p-6 text-white", tierMeta.bgGradient)}>
          <div className="flex items-start justify-between gap-4">
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
            </div>
            <Sparkles size={32} className="text-white/30" />
          </div>

          <div className="mt-5">
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span>
                Cách hạng <strong>{progress.nextTierLabel}</strong>:
              </span>
              <strong>{formatCurrency(progress.remaining)}</strong>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-white transition-all"
                style={{ width: `${progress.progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex overflow-x-auto border-b border-neutral-200">
        {TAB_LIST.map((item) => (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            className={cn(
              "whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
              tab === item.id
                ? "border-brand-red-500 text-brand-red-600"
                : "border-transparent text-neutral-600 hover:text-neutral-900"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="card p-4">
              <div className="text-xs text-neutral-500">Tổng tích lũy</div>
              <div className="mt-1 text-2xl font-extrabold text-brand-red-600">
                {totalEarned.toLocaleString("vi-VN")} điểm
              </div>
            </div>
            <div className="card p-4">
              <div className="text-xs text-neutral-500">Đã chi tiêu</div>
              <div className="mt-1 text-2xl font-extrabold text-brand-gold-600">
                {formatCurrency(totalSpent)}
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
              {tierMeta.perks.map((perk) => (
                <li key={perk} className="flex items-start gap-2 text-sm text-neutral-700">
                  <Check size={14} className="mt-0.5 shrink-0 text-emerald-600" />
                  <span>{perk}</span>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      {tab === "redeem" && (
        <div className="grid gap-3 md:grid-cols-2">
          {REDEEM_OPTIONS.map((option) => (
            <div key={option.id} className="card flex flex-col p-5 opacity-75">
              <div className="flex items-center gap-2">
                <Gift size={22} className="text-brand-red-500" />
                <span className="rounded-md bg-brand-red-50 px-2 py-0.5 text-[10px] font-bold uppercase text-brand-red-700">
                  {option.type === "voucher"
                    ? "Voucher"
                    : option.type === "freeship"
                      ? "Freeship"
                      : "Cashback"}
                </span>
              </div>
              <h3 className="mt-3 text-lg font-bold text-neutral-900">
                {option.title}
              </h3>
              <p className="text-sm text-neutral-600">{option.description}</p>
              <div className="my-3 flex items-baseline gap-1">
                <span className="text-2xl font-extrabold text-brand-gold-600">
                  {option.pointsCost.toLocaleString("vi-VN")}
                </span>
                <span className="text-sm text-neutral-500">điểm</span>
              </div>
              <button onClick={handleRedeem} className="btn-secondary justify-center">
                Chưa đủ điểm
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === "history" && (
        <div className="card flex flex-col items-center justify-center py-14 text-center">
          <Clock size={44} className="text-neutral-300" />
          <h2 className="mt-3 text-lg font-bold text-neutral-900">
            Chưa có lịch sử điểm
          </h2>
          <p className="mt-1 max-w-md text-sm text-neutral-500">
            Điểm phát sinh từ đơn hàng, đánh giá sản phẩm hoặc điều chỉnh hệ thống
            sẽ hiển thị tại đây.
          </p>
        </div>
      )}

      {tab === "tiers" && (
        <div className="space-y-3">
          {TIERS.map((item) => {
            const isCurrent = item.id === tier
            return (
              <div key={item.id} className={cn("card overflow-hidden", isCurrent && "ring-2 ring-brand-red-500")}>
                <div className={cn("bg-gradient-to-r p-4 text-white", item.bgGradient)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Crown size={20} />
                      <div>
                        <div className="text-lg font-bold">Hạng {item.label}</div>
                        <div className="text-xs text-white/80">
                          {item.minSpend === 0
                            ? "Mặc định"
                            : `Chi tiêu >= ${formatCurrency(item.minSpend)}`}
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
                  {item.perks.map((perk) => (
                    <li key={perk} className="flex items-start gap-2">
                      <Check size={14} className="mt-0.5 shrink-0 text-emerald-600" />
                      <span>{perk}</span>
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
          <Star className="text-brand-gold-500" />
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
