import { useState } from "react"
import { Link } from "react-router-dom"
import {
  Ticket,
  Copy,
  Clock,
  Sparkles,
  Plus,
  Store,
  AlertCircle,
} from "lucide-react"
import toast from "react-hot-toast"
import { formatCurrency } from "../../../lib/format"
import { cn } from "../../../lib/cn"
import { useAvailableVouchers } from "../../../hooks/use-vouchers"
import {
  type VoucherDoc,
  validateVoucherCode,
} from "../../../lib/voucher-service"
import { VoucherListSkeleton } from "../../../components/Skeleton"

const TABS = [
  { id: "available", label: "Khả dụng" },
  { id: "expired", label: "Đã kết thúc" },
] as const

type TabId = (typeof TABS)[number]["id"]

export default function VoucherScreen() {
  const [tab, setTab] = useState<TabId>("available")
  const [showRedeem, setShowRedeem] = useState(false)
  const { data: vouchers, isLoading, isError, error, refetch } = useAvailableVouchers()

  function getDiscountLabel(v: VoucherDoc) {
    if (v.discountType === "fixed") return `-${formatCurrency(v.value)}`
    if (v.discountType === "percent") return `-${v.value}%`
    return "FREESHIP"
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code)
    toast.success(`Đã sao chép mã ${code}`)
  }

  function describeExpiry(v: VoucherDoc) {
    const ms = v.endDate?.toMillis?.() ?? 0
    const diff = ms - Date.now()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    if (days < 0) return "Đã hết hạn"
    if (days === 0) return "Hết hạn hôm nay"
    if (days <= 7) return `Còn ${days} ngày`
    return `HSD ${new Date(ms).toLocaleDateString("vi-VN")}`
  }

  const list = vouchers ?? []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">Voucher của tôi</h1>
        <button onClick={() => setShowRedeem(true)} className="btn-primary">
          <Plus size={14} /> Nhập mã
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

      {isLoading ? (
        <VoucherListSkeleton count={4} />
      ) : isError ? (
        <div className="card flex items-start gap-3 border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold">Không tải được voucher</p>
            <p className="mt-0.5 text-xs">
              {error instanceof Error ? error.message : "Có lỗi xảy ra"}
            </p>
            <button onClick={() => refetch()} className="btn-secondary mt-3 text-xs">
              Thử lại
            </button>
          </div>
        </div>
      ) : tab === "available" ? (
        list.length === 0 ? (
          <EmptyState
            icon={<Ticket size={48} className="text-neutral-300" />}
            title="Chưa có voucher khả dụng"
            description="Theo dõi các shop yêu thích hoặc xem livestream để nhận voucher mới."
            cta={
              <Link to="/" className="btn-primary mt-4">
                Khám phá shop
              </Link>
            }
          />
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {list.map((v) => (
              <VoucherCard
                key={v.id}
                voucher={v}
                onCopy={copyCode}
                getDiscountLabel={getDiscountLabel}
                describeExpiry={describeExpiry}
              />
            ))}
          </div>
        )
      ) : (
        <EmptyState
          icon={<Clock size={48} className="text-neutral-300" />}
          title="Chưa có voucher hết hạn"
          description="Các voucher đã sử dụng hoặc hết hạn sẽ hiển thị tại đây."
        />
      )}

      {showRedeem && <RedeemModal onClose={() => setShowRedeem(false)} />}
    </div>
  )
}

function EmptyState({
  icon,
  title,
  description,
  cta,
}: {
  icon: React.ReactNode
  title: string
  description: string
  cta?: React.ReactNode
}) {
  return (
    <div className="card flex flex-col items-center justify-center py-16 text-center">
      {icon}
      <h2 className="mt-3 text-lg font-semibold">{title}</h2>
      <p className="mt-1 max-w-sm text-sm text-neutral-500">{description}</p>
      {cta}
    </div>
  )
}

function VoucherCard({
  voucher,
  onCopy,
  getDiscountLabel,
  describeExpiry,
}: {
  voucher: VoucherDoc
  onCopy: (code: string) => void
  getDiscountLabel: (v: VoucherDoc) => string
  describeExpiry: (v: VoucherDoc) => string
}) {
  const isShipping = voucher.discountType === "shipping"
  const usagePercent =
    voucher.usageLimit > 0
      ? Math.min(100, Math.round((voucher.usedCount / voucher.usageLimit) * 100))
      : 0

  return (
    <div className="relative flex overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition-shadow hover:shadow-md">
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
        {voucher.maxDiscount && voucher.discountType === "percent" && (
          <div className="mt-0.5 text-[9px] text-white/80">
            Tối đa {formatCurrency(voucher.maxDiscount)}
          </div>
        )}
      </div>

      <div className="flex-1 p-3">
        <h3 className="text-sm font-bold text-neutral-900">{voucher.title}</h3>
        {voucher.description && (
          <p className="text-xs text-neutral-600">{voucher.description}</p>
        )}
        <div className="mt-1 flex items-center gap-1 text-[11px] text-neutral-500">
          <Store size={10} />
          <span className="truncate">{voucher.shopName}</span>
        </div>
        <div className="mt-0.5 text-[11px] text-neutral-500">
          Đơn tối thiểu: {formatCurrency(voucher.minOrderValue)}
        </div>

        {voucher.usageLimit > 0 && (
          <div className="mt-2">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
              <div
                className="h-full bg-brand-red-500"
                style={{ width: `${usagePercent}%` }}
              />
            </div>
            <div className="mt-0.5 text-[10px] text-neutral-500">
              Đã dùng {usagePercent}%
            </div>
          </div>
        )}

        <div className="mt-2 flex items-center justify-between">
          <span className="flex items-center gap-1 text-[10px] text-amber-700">
            <Clock size={10} /> {describeExpiry(voucher)}
          </span>

          <button
            onClick={() => onCopy(voucher.code)}
            className="flex items-center gap-1 rounded-md bg-brand-red-50 px-2 py-1 text-[11px] font-bold text-brand-red-600 hover:bg-brand-red-100"
          >
            <Copy size={10} />
            {voucher.code}
          </button>
        </div>
      </div>

      <div className="absolute left-28 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-neutral-50" />
    </div>
  )
}

function RedeemModal({ onClose }: { onClose: () => void }) {
  const [code, setCode] = useState("")
  const [shopId, setShopId] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleValidate() {
    const trimmedCode = code.trim()
    const trimmedShop = shopId.trim()
    if (!trimmedCode || !trimmedShop) {
      toast.error("Vui lòng nhập đủ mã và ID shop")
      return
    }
    setLoading(true)
    try {
      const result = await validateVoucherCode({
        shopId: trimmedShop,
        code: trimmedCode,
        subtotal: 0,
        shippingFee: 0,
      })
      if (result.ok) {
        toast.success(`Voucher hợp lệ — áp dụng ở bước thanh toán shop ${trimmedShop}`)
        onClose()
        return
      }
      const reason = "reason" in result ? result.reason : "Mã không hợp lệ"
      toast.error(reason)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không kiểm tra được mã")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 md:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md animate-slide-up rounded-2xl bg-white p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="text-brand-gold-500" />
          <h3 className="text-lg font-bold text-neutral-900">Kiểm tra mã voucher</h3>
        </div>
        <p className="text-sm text-neutral-600">
          Voucher gắn với từng shop. Nhập ID shop và mã để kiểm tra tính hợp lệ.
        </p>
        <input
          type="text"
          value={shopId}
          onChange={(e) => setShopId(e.target.value)}
          placeholder="ID shop (lấy từ trang shop)"
          className="input mt-3"
        />
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="VD: ACFMOI50"
          className="input mt-3 uppercase"
        />
        <div className="mt-4 flex gap-2">
          <button onClick={onClose} className="btn-secondary flex-1 justify-center">
            Huỷ
          </button>
          <button
            onClick={handleValidate}
            disabled={loading}
            className="btn-primary flex-1 justify-center"
          >
            {loading ? "Đang kiểm tra..." : "Kiểm tra"}
          </button>
        </div>
      </div>
    </div>
  )
}
