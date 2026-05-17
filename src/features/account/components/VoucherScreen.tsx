import { useState } from "react"
import { Ticket, Copy, Clock, CheckCircle2, XCircle, Sparkles, Plus } from "lucide-react"
import toast from "react-hot-toast"
import { formatCurrency } from "../../../lib/format"
import { cn } from "../../../lib/cn"

type Voucher = {
  id: string
  code: string
  title: string
  description: string
  discountType: "fixed" | "percent" | "shipping"
  discountValue: number
  maxDiscount?: number
  minOrder: number
  appliesTo?: string
  expiresAt: string
  status: "available" | "used" | "expired"
}

const TABS = [
  { id: "available", label: "Khả dụng" },
  { id: "used", label: "Đã dùng" },
  { id: "expired", label: "Hết hạn" },
] as const

type TabId = (typeof TABS)[number]["id"]

export default function VoucherScreen() {
  const [tab, setTab] = useState<TabId>("available")
  const [showRedeem, setShowRedeem] = useState(false)
  const vouchers: Voucher[] = []
  const filtered = vouchers.filter((v) => v.status === tab)

  function getDiscountLabel(v: Voucher) {
    if (v.discountType === "fixed") return `-${formatCurrency(v.discountValue)}`
    if (v.discountType === "percent") return `-${v.discountValue}%`
    return "FREESHIP"
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code)
    toast.success(`Đã sao chép mã ${code}`)
  }

  function daysUntilExpire(date: string) {
    const diff = new Date(date).getTime() - Date.now()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    if (days < 0) return "Đã hết hạn"
    if (days === 0) return "Hết hạn hôm nay"
    if (days <= 7) return `Còn ${days} ngày`
    return `Hết hạn ${new Date(date).toLocaleDateString("vi-VN")}`
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">Voucher của tôi</h1>
        <button
          onClick={() => setShowRedeem(true)}
          className="btn-primary"
        >
          <Plus size={14} /> Đổi mã
        </button>
      </div>

      <div className="flex border-b border-neutral-200">
        {TABS.map((t) => (
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

      {filtered.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <Ticket size={48} className="text-neutral-300" />
          <h2 className="mt-3 text-lg font-semibold">Chưa có voucher nào</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Săn voucher mới tại trang chủ hoặc đổi mã ngay!
          </p>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {filtered.map((v) => (
            <VoucherCard
              key={v.id}
              voucher={v}
              onCopy={copyCode}
              getDiscountLabel={getDiscountLabel}
              daysUntilExpire={daysUntilExpire}
            />
          ))}
        </div>
      )}

      {showRedeem && <RedeemModal onClose={() => setShowRedeem(false)} />}
    </div>
  )
}

function VoucherCard({
  voucher,
  onCopy,
  getDiscountLabel,
  daysUntilExpire,
}: {
  voucher: Voucher
  onCopy: (code: string) => void
  getDiscountLabel: (v: Voucher) => string
  daysUntilExpire: (d: string) => string
}) {
  const isShipping = voucher.discountType === "shipping"
  const isExpired = voucher.status === "expired"
  const isUsed = voucher.status === "used"

  return (
    <div
      className={cn(
        "relative flex overflow-hidden rounded-xl border bg-white shadow-sm",
        isExpired || isUsed
          ? "border-neutral-200 opacity-70 grayscale"
          : "border-neutral-200 hover:shadow-md"
      )}
    >
      {/* Left: discount */}
      <div
        className={cn(
          "flex w-28 shrink-0 flex-col items-center justify-center p-3 text-white",
          isShipping
            ? "bg-gradient-to-br from-emerald-500 to-emerald-700"
            : "bg-gradient-to-br from-brand-red-500 to-brand-red-700"
        )}
      >
        <Ticket size={20} className="text-white/80" />
        <div className="mt-1 text-center text-lg font-extrabold leading-tight">
          {getDiscountLabel(voucher)}
        </div>
        {voucher.maxDiscount && (
          <div className="mt-0.5 text-[9px] text-white/80">
            Tối đa {formatCurrency(voucher.maxDiscount)}
          </div>
        )}
      </div>

      {/* Right: detail */}
      <div className="flex-1 p-3">
        <h3 className="text-sm font-bold text-neutral-900">{voucher.title}</h3>
        <p className="text-xs text-neutral-600">{voucher.description}</p>
        <div className="mt-1 text-[11px] text-neutral-500">
          Đơn tối thiểu: {formatCurrency(voucher.minOrder)}
        </div>
        {voucher.appliesTo && (
          <div className="text-[11px] text-neutral-500">{voucher.appliesTo}</div>
        )}

        <div className="mt-2 flex items-center justify-between">
          <div className="text-[10px] text-neutral-500">
            {isUsed ? (
              <span className="flex items-center gap-0.5">
                <CheckCircle2 size={10} className="text-emerald-600" /> Đã dùng
              </span>
            ) : isExpired ? (
              <span className="flex items-center gap-0.5">
                <XCircle size={10} className="text-rose-600" /> Hết hạn
              </span>
            ) : (
              <span className="flex items-center gap-0.5">
                <Clock size={10} className="text-amber-600" />
                {daysUntilExpire(voucher.expiresAt)}
              </span>
            )}
          </div>

          {voucher.status === "available" && (
            <button
              onClick={() => onCopy(voucher.code)}
              className="flex items-center gap-1 rounded-md bg-brand-red-50 px-2 py-1 text-[11px] font-bold text-brand-red-600 hover:bg-brand-red-100"
            >
              <Copy size={10} />
              {voucher.code}
            </button>
          )}
        </div>
      </div>

      {/* Cut-out */}
      <div className="absolute left-28 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-neutral-50" />
    </div>
  )
}

function RedeemModal({ onClose }: { onClose: () => void }) {
  const [code, setCode] = useState("")
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 md:items-center" onClick={onClose}>
      <div
        className="w-full max-w-md animate-slide-up rounded-2xl bg-white p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="text-brand-gold-500" />
          <h3 className="text-lg font-bold text-neutral-900">Đổi mã voucher</h3>
        </div>
        <p className="text-sm text-neutral-600">
          Nhập mã được tặng (từ Aivy, livestream, hoặc bạn bè) để thêm voucher vào tài khoản.
        </p>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="VD: ACFMOI50K"
          className="input mt-4 uppercase"
          autoFocus
        />
        <div className="mt-4 flex gap-2">
          <button onClick={onClose} className="btn-secondary flex-1 justify-center">
            Huỷ
          </button>
          <button
            onClick={() => {
              if (!code) {
                toast.error("Vui lòng nhập mã")
                return
              }
              toast("Mã voucher sẽ được kiểm tra khi hệ thống voucher được kết nối")
              onClose()
            }}
            className="btn-primary flex-1 justify-center"
          >
            Đổi
          </button>
        </div>
      </div>
    </div>
  )
}
