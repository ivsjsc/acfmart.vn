import { useEffect, useState } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import {
  RefreshCw,
  Upload,
  X,
  AlertCircle,
  ShieldCheck,
  Loader2,
  Wallet,
  CreditCard,
  Banknote,
} from "lucide-react"
import toast from "react-hot-toast"
import { formatCurrency } from "../../../lib/format"
import { cn } from "../../../lib/cn"
import { sanitizeUserError } from "../../../lib/error-utils"
import { NotFound } from "../../../pages/NotFound"
import { useAuthStore } from "../../../stores/auth-store"
import {
  createReturnRequest,
  getBuyerOrderByCode,
  orderDocToBuyerOrder,
  type OrderDoc,
  type ReturnRefundMethod,
} from "../../../lib/order-service"
import { uploadSellerDocument } from "../../../lib/upload"

const RETURN_REASONS = [
  { id: "wrong-item", label: "Sản phẩm khác mô tả", refundType: "full" },
  { id: "defective", label: "Sản phẩm bị lỗi / hư hỏng", refundType: "full" },
  { id: "counterfeit", label: "Nghi ngờ hàng giả / hàng nhái", refundType: "full" },
  { id: "wrong-quantity", label: "Thiếu hàng / sai số lượng", refundType: "partial" },
  { id: "damaged-package", label: "Bao bì rách / móp méo", refundType: "partial" },
  { id: "change-mind", label: "Đổi ý không muốn dùng", refundType: "partial" },
] as const

const REFUND_METHODS = [
  { id: "wallet", label: "Hoàn vào ví mua sắm", icon: Wallet, note: "Ngay sau khi duyệt" },
  { id: "bank", label: "Hoàn về ngân hàng/thẻ gốc", icon: CreditCard, note: "3-5 ngày làm việc" },
  { id: "exchange", label: "Đổi sản phẩm khác", icon: RefreshCw, note: "Theo lịch shop" },
] as const

type ReturnPhoto = { file: File; url: string }

export default function ReturnRequestScreen() {
  const { orderId } = useParams<{ orderId: string }>()
  const navigate = useNavigate()
  const currentUser = useAuthStore((s) => s.user)
  const [orderDoc, setOrderDoc] = useState<OrderDoc | null>(null)
  const [loadingOrder, setLoadingOrder] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [reason, setReason] = useState<string>(RETURN_REASONS[0].id)
  const [description, setDescription] = useState("")
  const [photos, setPhotos] = useState<ReturnPhoto[]>([])
  const [refundMethod, setRefundMethod] = useState<ReturnRefundMethod>("wallet")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!orderId || !currentUser?.id) return
    let cancelled = false
    setLoadingOrder(true)
    setLoadError(null)
    getBuyerOrderByCode(orderId, currentUser.id)
      .then((data) => {
        if (!cancelled) setOrderDoc(data)
      })
      .catch((err) => {
        if (!cancelled) {
          setLoadError(sanitizeUserError(err, "Không tải được đơn hàng."))
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingOrder(false)
      })
    return () => {
      cancelled = true
    }
  }, [currentUser?.id, orderId])

  if (loadingOrder) {
    return (
      <div className="container-acf flex min-h-[50vh] items-center justify-center">
        <Loader2 className="animate-spin text-brand-red-500" size={28} />
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="container-acf py-6">
        <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <span>{loadError}</span>
        </div>
      </div>
    )
  }

  if (!orderDoc || !currentUser?.id) return <NotFound />

  const order = orderDocToBuyerOrder(orderDoc)

  const eligibleItems = order.items
  const reasonMeta = RETURN_REASONS.find((r) => r.id === reason)!
  const selectedItemList = eligibleItems.filter((it) =>
    selectedItems.has(it.variantId)
  )
  const refundAmount = selectedItemList.reduce(
    (sum, it) => sum + it.price * it.quantity,
    0
  )

  function toggleItem(variantId: string) {
    setSelectedItems((prev) => {
      const next = new Set(prev)
      if (next.has(variantId)) next.delete(variantId)
      else next.add(variantId)
      return next
    })
  }

  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files) return
    const newPhotos: ReturnPhoto[] = []
    Array.from(files)
      .slice(0, 6 - photos.length)
      .forEach((f) => {
        if (!f.type.startsWith("image/")) return
        if (f.size > 5 * 1024 * 1024) {
          toast.error(`${f.name} vượt quá 5MB`)
          return
        }
        newPhotos.push({ file: f, url: URL.createObjectURL(f) })
      })
    setPhotos([...photos, ...newPhotos])
  }

  async function submit() {
    if (selectedItems.size === 0) {
      toast.error("Vui lòng chọn ít nhất 1 sản phẩm muốn trả")
      return
    }
    if (reasonMeta.id !== "change-mind" && photos.length === 0) {
      toast.error("Vui lòng tải lên ảnh minh chứng (tối thiểu 1 ảnh)")
      return
    }

    setSubmitting(true)
    try {
      const photoUrls = await Promise.all(
        photos.map((photo) =>
          uploadSellerDocument(photo.file, currentUser.id, "return-evidence")
        )
      )
      await createReturnRequest({
        order: orderDoc,
        customerId: currentUser.id,
        customerEmail: currentUser.email,
        reason,
        reasonLabel: reasonMeta.label,
        refundMethod,
        selectedVariantIds: Array.from(selectedItems),
        description,
        photoUrls,
      })
      toast.success("Đã gửi yêu cầu trả hàng / hoàn tiền")
      navigate(`/account/orders/${order.code}`)
    } catch (err) {
      toast.error(sanitizeUserError(err, "Gửi yêu cầu thất bại. Vui lòng thử lại sau."))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container-acf py-4 lg:py-6">
      <nav className="mb-3 flex items-center gap-1 text-xs text-neutral-500">
        <Link to="/account/orders" className="hover:text-brand-red-600">
          Đơn hàng
        </Link>
        <span>/</span>
        <Link to={`/account/orders/${order.code}`} className="hover:text-brand-red-600">
          {order.code}
        </Link>
        <span>/</span>
        <span className="text-neutral-700">Trả hàng / Hoàn tiền</span>
      </nav>

      <h1 className="mb-1 text-2xl font-bold text-neutral-900">
        Yêu cầu trả hàng / hoàn tiền
      </h1>
      <p className="mb-5 text-sm text-neutral-600">
        Chọn sản phẩm cần trả và cung cấp minh chứng để đội hỗ trợ xử lý nhanh.
      </p>

      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          {/* Items */}
          <section className="card p-5">
            <h2 className="mb-3 text-base font-bold">Sản phẩm cần trả</h2>
            <div className="divide-y divide-neutral-100">
              {eligibleItems.map((item) => {
                const selected = selectedItems.has(item.variantId)
                return (
                  <label
                    key={item.variantId}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 py-3 transition-colors first:pt-0 last:pb-0",
                      selected && "bg-brand-red-50/30 rounded-lg px-2 -mx-2"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => toggleItem(item.variantId)}
                      className="h-5 w-5 rounded text-brand-red-500"
                    />
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-16 w-16 shrink-0 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="line-clamp-2 text-sm font-medium text-neutral-900">
                        {item.title}
                      </div>
                      <div className="text-xs text-neutral-500">
                        SL: {item.quantity} · {item.shopName}
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-brand-red-600">
                      {formatCurrency(item.price * item.quantity)}
                    </div>
                  </label>
                )
              })}
            </div>
          </section>

          {/* Reason */}
          <section className="card p-5">
            <h2 className="mb-3 text-base font-bold">Lý do trả hàng</h2>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {RETURN_REASONS.map((r) => (
                <label
                  key={r.id}
                  className={cn(
                    "flex cursor-pointer items-start gap-2 rounded-lg border p-3 transition-colors",
                    reason === r.id
                      ? "border-brand-red-500 bg-brand-red-50"
                      : "border-neutral-200 hover:border-brand-red-300"
                  )}
                >
                  <input
                    type="radio"
                    name="return-reason"
                    value={r.id}
                    checked={reason === r.id}
                    onChange={() => setReason(r.id)}
                    className="mt-0.5 h-4 w-4 text-brand-red-500"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-neutral-900">{r.label}</div>
                    {r.refundType === "full" && (
                      <div className="text-[10px] font-semibold text-emerald-600">
                        Hoàn 100% + miễn phí ship trả
                      </div>
                    )}
                  </div>
                </label>
              ))}
            </div>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả chi tiết sự cố (tuỳ chọn) — giúp đội hỗ trợ xử lý nhanh hơn"
              rows={3}
              className="input mt-3 resize-none"
            />
          </section>

          {/* Photos */}
          <section className="card p-5">
            <h2 className="mb-1 flex items-center gap-2 text-base font-bold">
              Ảnh minh chứng
              {reasonMeta.id !== "change-mind" && (
                <span className="text-xs font-normal text-rose-600">*</span>
              )}
            </h2>
            <p className="mb-3 text-xs text-neutral-500">
              Tối đa 6 ảnh. Hỗ trợ JPG, PNG dưới 5MB/ảnh.
              {reason === "counterfeit" && (
                <strong className="ml-1 text-rose-600">
                  Với hàng nghi giả, vui lòng chụp rõ mã QR + bao bì.
                </strong>
              )}
            </p>

            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              {photos.map((photo, i) => (
                <div key={i} className="relative aspect-square overflow-hidden rounded-lg bg-neutral-100">
                  <img src={photo.url} alt={`Ảnh ${i + 1}`} className="h-full w-full object-cover" />
                  <button
                    onClick={() => {
                      URL.revokeObjectURL(photo.url)
                      setPhotos(photos.filter((_, idx) => idx !== i))
                    }}
                    className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                    aria-label="Xoá ảnh"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
              {photos.length < 6 && (
                <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-neutral-300 bg-neutral-50 text-xs text-neutral-500 transition-colors hover:border-brand-red-400 hover:text-brand-red-600">
                  <Upload size={20} />
                  <span>Tải lên</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </section>

          {/* Refund method */}
          <section className="card p-5">
            <h2 className="mb-3 text-base font-bold">Hình thức hoàn tiền</h2>
            <div className="space-y-2">
              {REFUND_METHODS.map((m) => (
                <label
                  key={m.id}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors",
                    refundMethod === m.id
                      ? "border-brand-red-500 bg-brand-red-50"
                      : "border-neutral-200 hover:border-brand-red-300"
                  )}
                >
                  <input
                    type="radio"
                    name="refund-method"
                    value={m.id}
                    checked={refundMethod === m.id}
                    onChange={() => setRefundMethod(m.id as ReturnRefundMethod)}
                    className="h-4 w-4 text-brand-red-500"
                  />
                  <m.icon size={18} className="text-neutral-600" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">{m.label}</div>
                    <div className="text-[11px] text-neutral-500">{m.note}</div>
                  </div>
                </label>
              ))}
            </div>
          </section>
        </div>

        {/* Summary */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card p-5">
            <h2 className="mb-3 text-base font-bold">Tóm tắt</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-600">Sản phẩm</span>
                <span>{selectedItems.size} / {eligibleItems.length}</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="font-semibold">Hoàn tiền dự kiến</span>
                <span className="text-xl font-extrabold text-brand-red-600">
                  {formatCurrency(refundAmount)}
                </span>
              </div>
            </div>

            <div className="my-4 rounded-lg bg-brand-gold-50 p-3 text-xs text-brand-gold-800">
              <div className="flex items-start gap-2">
                <AlertCircle size={14} className="mt-0.5 shrink-0" />
                <div>
                  <strong>Lưu ý:</strong> Yêu cầu sẽ được xử lý trong 1-2 ngày
                  làm việc. Vui lòng giữ sản phẩm + bao bì trong tình trạng ban
                  đầu cho đến khi bên giao nhận lấy hàng.
                </div>
              </div>
            </div>

            <button
              onClick={submit}
              disabled={submitting || selectedItems.size === 0}
              className="btn-primary w-full justify-center text-base"
            >
              {submitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Đang gửi...
                </>
              ) : (
                "Gửi yêu cầu"
              )}
            </button>

            <div className="mt-3 flex items-center gap-2 text-[11px] text-neutral-500">
              <ShieldCheck size={12} className="text-emerald-500" />
              <span>Bảo vệ bởi Quỹ Chống Hàng Giả Việt Nam</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
