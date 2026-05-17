import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Ticket, X, Check, ChevronDown, Sparkles, Loader2 } from "lucide-react"
import toast from "react-hot-toast"
import { cn } from "../../../lib/cn"
import { formatCurrency } from "../../../lib/format"
import { validateVoucher, getAvailableVouchers } from "../voucher-utils"
import type { VoucherDoc } from "../../../lib/voucher-service"

interface VoucherApplyProps {
  shopId: string
  subtotal: number
  shippingFee: number
  appliedCode: string | null
  onApply: (
    voucher: VoucherDoc,
    discount: number,
    shippingDiscount: number
  ) => void
  onRemove: () => void
}

export function VoucherApply({
  shopId,
  subtotal,
  shippingFee,
  appliedCode,
  onApply,
  onRemove,
}: VoucherApplyProps) {
  const [input, setInput] = useState("")
  const [showList, setShowList] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const availableQuery = useQuery({
    queryKey: ["voucher-apply", "available", shopId, subtotal],
    enabled: !!shopId && subtotal > 0,
    queryFn: () => getAvailableVouchers(shopId, subtotal),
    staleTime: 30_000,
  })
  const available = availableQuery.data ?? []

  async function handleApply(code: string) {
    if (!shopId) {
      toast.error("Giỏ hàng đang trống, không thể áp mã")
      return
    }
    setSubmitting(true)
    try {
      const r = await validateVoucher(code, subtotal, shippingFee, shopId)
      if ("error" in r) {
        toast.error(r.error)
        return
      }
      onApply(r.voucher, r.result.discount, r.result.shippingDiscount)
      toast.success(`Đã áp dụng mã ${r.voucher.code}`)
      setInput("")
      setShowList(false)
    } finally {
      setSubmitting(false)
    }
  }

  function discountLabel(v: VoucherDoc): string {
    if (v.discountType === "fixed") return `-${formatCurrency(v.value)}`
    if (v.discountType === "percent") return `-${v.value}%`
    return "FREESHIP"
  }

  return (
    <section className="card p-5">
      <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-neutral-900">
        <Ticket size={18} className="text-brand-red-500" />
        Mã giảm giá
      </h2>

      {appliedCode ? (
        <div className="flex items-center justify-between gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
          <div className="flex items-center gap-2">
            <Check size={16} className="text-emerald-600" />
            <span className="font-mono text-sm font-bold text-emerald-700">
              {appliedCode}
            </span>
            <span className="text-xs text-emerald-700">đã được áp dụng</span>
          </div>
          <button
            onClick={onRemove}
            className="rounded-full p-1 text-emerald-700 hover:bg-emerald-100"
            aria-label="Bỏ mã"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <>
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value.toUpperCase())}
              placeholder="Nhập mã giảm giá"
              className="input flex-1 uppercase"
              disabled={submitting}
            />
            <button
              onClick={() => handleApply(input)}
              disabled={!input || submitting}
              className="btn-primary"
            >
              {submitting ? <Loader2 size={14} className="animate-spin" /> : "Áp dụng"}
            </button>
          </div>

          {availableQuery.isLoading && (
            <div className="mt-3 flex items-center gap-2 text-xs text-neutral-500">
              <Loader2 size={12} className="animate-spin" />
              Đang tải mã khả dụng...
            </div>
          )}

          {!availableQuery.isLoading && available.length > 0 && (
            <>
              <button
                onClick={() => setShowList(!showList)}
                className="mt-3 flex w-full items-center justify-between rounded-lg border border-dashed border-brand-gold-300 bg-brand-gold-50 p-2.5 text-sm transition-colors hover:bg-brand-gold-100"
              >
                <span className="flex items-center gap-2 font-semibold text-brand-gold-800">
                  <Sparkles size={14} />
                  {available.length} mã có thể dùng cho đơn này
                </span>
                <ChevronDown
                  size={14}
                  className={cn(
                    "text-brand-gold-700 transition-transform",
                    showList && "rotate-180"
                  )}
                />
              </button>

              {showList && (
                <div className="mt-2 max-h-64 space-y-2 overflow-y-auto">
                  {available.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => handleApply(v.code)}
                      disabled={submitting}
                      className="flex w-full items-center gap-3 rounded-lg border border-neutral-200 p-3 text-left hover:border-brand-red-300 hover:bg-brand-red-50 disabled:opacity-60"
                    >
                      <div
                        className={cn(
                          "flex h-12 w-14 shrink-0 items-center justify-center rounded-md text-xs font-extrabold text-white",
                          v.discountType === "shipping"
                            ? "bg-emerald-500"
                            : "bg-brand-red-500"
                        )}
                      >
                        {discountLabel(v)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-neutral-900">
                          {v.title}
                        </div>
                        <div className="text-[11px] text-neutral-500">
                          Đơn từ {formatCurrency(v.minOrderValue)} · Mã:{" "}
                          <code className="font-mono font-bold">{v.code}</code>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}
    </section>
  )
}
