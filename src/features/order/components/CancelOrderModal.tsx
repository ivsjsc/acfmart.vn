import { useState } from "react"
import { XCircle, Loader2 } from "lucide-react"
import toast from "react-hot-toast"
import { cn } from "../../../lib/cn"

const CANCEL_REASONS = [
  "Tôi đổi ý không muốn mua nữa",
  "Tìm được nơi khác giá tốt hơn",
  "Đặt nhầm sản phẩm",
  "Thông tin vận chuyển không đúng",
  "Thời gian giao hàng quá lâu",
  "Lý do khác",
] as const

interface CancelOrderModalProps {
  orderCode: string
  onClose: () => void
  onConfirm: (reason: string) => void | Promise<void>
}

export function CancelOrderModal({ orderCode, onClose, onConfirm }: CancelOrderModalProps) {
  const [reason, setReason] = useState<string>(CANCEL_REASONS[0])
  const [otherText, setOtherText] = useState("")
  const [loading, setLoading] = useState(false)

  async function submit() {
    const final = reason === "Lý do khác" ? otherText.trim() : reason
    if (!final) {
      toast.error("Vui lòng nhập lý do huỷ")
      return
    }
    setLoading(true)
    try {
      await onConfirm(final)
      toast.success("Đã gửi yêu cầu huỷ đơn")
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Huỷ đơn thất bại")
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
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-600">
            <XCircle size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-neutral-900">Huỷ đơn hàng</h3>
            <p className="text-xs text-neutral-500">
              Mã đơn:{" "}
              <code className="font-mono font-semibold">{orderCode}</code>
            </p>
          </div>
        </div>

        <p className="mt-3 text-sm text-neutral-700">
          Vui lòng cho biết lý do để cải thiện dịch vụ tốt hơn.
        </p>

        <div className="mt-4 space-y-2">
          {CANCEL_REASONS.map((r) => (
            <label
              key={r}
              className={cn(
                "flex cursor-pointer items-center gap-2.5 rounded-lg border p-2.5 transition-colors",
                reason === r
                  ? "border-brand-red-500 bg-brand-red-50"
                  : "border-neutral-200 hover:border-brand-red-300"
              )}
            >
              <input
                type="radio"
                name="cancel-reason"
                value={r}
                checked={reason === r}
                onChange={(e) => setReason(e.target.value)}
                className="h-4 w-4 text-brand-red-500"
              />
              <span className="text-sm text-neutral-800">{r}</span>
            </label>
          ))}
        </div>

        {reason === "Lý do khác" && (
          <textarea
            value={otherText}
            onChange={(e) => setOtherText(e.target.value)}
            placeholder="Mô tả lý do của bạn..."
            rows={3}
            className="input mt-3 resize-none"
          />
        )}

        <div className="mt-5 flex gap-2">
          <button onClick={onClose} className="btn-secondary flex-1 justify-center">
            Không huỷ
          </button>
          <button
            onClick={submit}
            disabled={loading}
            className="btn-primary flex-1 justify-center bg-rose-600 hover:bg-rose-700"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Đang xử lý
              </>
            ) : (
              "Xác nhận huỷ"
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
