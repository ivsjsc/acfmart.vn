import { useMemo, useState } from "react"
import {
  Plus,
  Ticket,
  Edit3,
  Trash2,
  Power,
  Sparkles,
  X,
  AlertCircle,
} from "lucide-react"
import toast from "react-hot-toast"
import { cn } from "../../../lib/cn"
import { formatCurrency, formatDateTime } from "../../../lib/format"
import { sanitizeUserError } from "../../../lib/error-utils"
import { useMyVendor } from "../../../hooks/use-vendor"
import {
  useShopVouchers,
  useCreateVoucher,
  useUpdateVoucher,
  useDeleteVoucher,
  useToggleVoucherActive,
} from "../../../hooks/use-vouchers"
import {
  getVoucherStatus,
  suggestVoucherCode,
  type VoucherDoc,
  type VoucherDiscountType,
  type VoucherStatus,
} from "../../../lib/voucher-service"
import { RowSkeleton } from "../../../components/Skeleton"

const STATUS_LABEL: Record<VoucherStatus, { label: string; tone: string }> = {
  active: { label: "Đang chạy", tone: "bg-emerald-100 text-emerald-700" },
  scheduled: { label: "Đã lên lịch", tone: "bg-blue-100 text-blue-700" },
  expired: { label: "Hết hạn", tone: "bg-neutral-200 text-neutral-700" },
  used_up: { label: "Hết lượt", tone: "bg-amber-100 text-amber-800" },
  inactive: { label: "Đã tắt", tone: "bg-neutral-100 text-neutral-500" },
}

const DISCOUNT_OPTIONS: { value: VoucherDiscountType; label: string; hint: string }[] = [
  { value: "percent", label: "Theo %", hint: "Giảm theo phần trăm đơn hàng" },
  { value: "fixed", label: "Số tiền cố định", hint: "Giảm số VND cố định" },
  { value: "shipping", label: "Free ship", hint: "Miễn phí vận chuyển" },
]

export default function SellerVouchersScreen() {
  const { data: vendorData, isLoading: vendorLoading } = useMyVendor()
  const vendor = vendorData?.vendor ?? null
  const shopId = vendor?.firebase_uid ?? null
  const shopName = vendor?.shop_name ?? ""
  const shopSlug = vendor?.shop_slug ?? ""

  const { vouchers, loading, error } = useShopVouchers(shopId)
  const [editorOpen, setEditorOpen] = useState(false)
  const [editing, setEditing] = useState<VoucherDoc | null>(null)

  const deleteVoucherMut = useDeleteVoucher(shopId ?? "")
  const toggleMut = useToggleVoucherActive(shopId ?? "")

  const counts = useMemo(() => {
    const acc: Record<VoucherStatus, number> = {
      active: 0,
      scheduled: 0,
      expired: 0,
      used_up: 0,
      inactive: 0,
    }
    for (const v of vouchers) acc[getVoucherStatus(v)]++
    return acc
  }, [vouchers])

  function openCreate() {
    setEditing(null)
    setEditorOpen(true)
  }

  function openEdit(v: VoucherDoc) {
    setEditing(v)
    setEditorOpen(true)
  }

  async function handleDelete(v: VoucherDoc) {
    if (!confirm(`Xoá voucher "${v.code}"?`)) return
    try {
      await deleteVoucherMut.mutateAsync(v.id)
      toast.success(`Đã xoá voucher ${v.code}`)
    } catch (err) {
      toast.error(sanitizeUserError(err, "Không xoá được voucher. Vui lòng thử lại sau."))
    }
  }

  async function handleToggleActive(v: VoucherDoc) {
    try {
      await toggleMut.mutateAsync({ voucherId: v.id, isActive: !v.isActive })
      toast.success(v.isActive ? "Đã tạm dừng voucher" : "Đã bật lại voucher")
    } catch (err) {
      toast.error(sanitizeUserError(err, "Không cập nhật được. Vui lòng thử lại sau."))
    }
  }

  if (vendorLoading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="space-y-3">
          <RowSkeleton />
          <RowSkeleton />
        </div>
      </div>
    )
  }

  if (!vendor || vendor.status !== "active") {
    return (
      <div className="p-6 lg:p-8">
        <div className="card flex flex-col items-center py-16 text-center">
          <AlertCircle size={48} className="text-amber-500" />
          <h2 className="mt-3 text-lg font-bold">Shop chưa được duyệt</h2>
          <p className="mt-1 max-w-md text-sm text-neutral-500">
            Bạn cần hoàn tất hồ sơ và được duyệt KYC trước khi tạo voucher cho shop.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-8">
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Voucher của shop</h1>
          <p className="mt-0.5 text-sm text-neutral-500">
            Tạo mã giảm giá để thu hút khách mua sắm tại {shopName}.
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus size={16} /> Tạo voucher
        </button>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-5">
        {(["active", "scheduled", "used_up", "expired", "inactive"] as VoucherStatus[]).map(
          (s) => (
            <div key={s} className="card p-3">
              <div className="text-xs uppercase text-neutral-500">{STATUS_LABEL[s].label}</div>
              <div className="mt-1 text-2xl font-bold">{counts[s]}</div>
            </div>
          )
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          <RowSkeleton />
          <RowSkeleton />
          <RowSkeleton />
        </div>
      ) : error ? (
        <div className="card flex items-start gap-3 border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">Không tải được voucher</p>
            <p className="mt-0.5 text-xs">{error}</p>
          </div>
        </div>
      ) : vouchers.length === 0 ? (
        <div className="card flex flex-col items-center py-16 text-center">
          <Ticket size={48} className="text-neutral-300" />
          <h3 className="mt-3 text-base font-semibold">Chưa có voucher nào</h3>
          <p className="mt-1 max-w-sm text-sm text-neutral-500">
            Tạo voucher đầu tiên để giảm giá đơn hàng hoặc miễn phí vận chuyển cho khách.
          </p>
          <button onClick={openCreate} className="btn-primary mt-4">
            <Plus size={14} /> Tạo voucher đầu tiên
          </button>
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="space-y-3 lg:hidden">
            {vouchers.map((v) => (
              <VoucherMobileCard
                key={v.id}
                voucher={v}
                onEdit={() => openEdit(v)}
                onDelete={() => handleDelete(v)}
                onToggle={() => handleToggleActive(v)}
              />
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden lg:block">
            <div className="card overflow-hidden">
              <table className="w-full">
                <thead className="border-b border-neutral-200 bg-neutral-50 text-left text-xs uppercase text-neutral-500">
                  <tr>
                    <th className="px-4 py-3">Mã & tên</th>
                    <th className="px-4 py-3">Giảm giá</th>
                    <th className="px-4 py-3">Đơn tối thiểu</th>
                    <th className="px-4 py-3">Thời hạn</th>
                    <th className="px-4 py-3">Đã dùng</th>
                    <th className="px-4 py-3">Trạng thái</th>
                    <th className="px-4 py-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {vouchers.map((v) => {
                    const status = getVoucherStatus(v)
                    return (
                      <tr key={v.id} className="hover:bg-neutral-50">
                        <td className="px-4 py-3">
                          <div className="font-mono text-sm font-semibold text-brand-red-600">
                            {v.code}
                          </div>
                          <div className="text-xs text-neutral-600">{v.title}</div>
                        </td>
                        <td className="px-4 py-3 text-sm">{formatDiscount(v)}</td>
                        <td className="px-4 py-3 text-sm">
                          {v.minOrderValue > 0 ? formatCurrency(v.minOrderValue) : "—"}
                        </td>
                        <td className="px-4 py-3 text-xs text-neutral-600">
                          {formatDateTime(v.startDate.toDate())}
                          <br />
                          → {formatDateTime(v.endDate.toDate())}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {v.usageLimit > 0 ? `${v.usedCount}/${v.usageLimit}` : v.usedCount}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              "rounded-md px-2 py-0.5 text-xs font-semibold",
                              STATUS_LABEL[status].tone
                            )}
                          >
                            {STATUS_LABEL[status].label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-1">
                            <IconButton onClick={() => handleToggleActive(v)} title={v.isActive ? "Tạm dừng" : "Bật lại"}>
                              <Power size={14} />
                            </IconButton>
                            <IconButton onClick={() => openEdit(v)} title="Sửa">
                              <Edit3 size={14} />
                            </IconButton>
                            <IconButton onClick={() => handleDelete(v)} title="Xoá" tone="danger">
                              <Trash2 size={14} />
                            </IconButton>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {editorOpen && shopId && (
        <VoucherEditor
          mode={editing ? "edit" : "create"}
          shopId={shopId}
          shopName={shopName}
          shopSlug={shopSlug}
          voucher={editing}
          onClose={() => setEditorOpen(false)}
        />
      )}
    </div>
  )
}

function IconButton({
  children,
  onClick,
  title,
  tone = "default",
}: {
  children: React.ReactNode
  onClick: () => void
  title: string
  tone?: "default" | "danger"
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      aria-label={title}
      className={cn(
        "rounded-md p-2 transition-colors",
        tone === "danger"
          ? "text-rose-600 hover:bg-rose-50"
          : "text-neutral-600 hover:bg-neutral-100"
      )}
    >
      {children}
    </button>
  )
}

function VoucherMobileCard({
  voucher,
  onEdit,
  onDelete,
  onToggle,
}: {
  voucher: VoucherDoc
  onEdit: () => void
  onDelete: () => void
  onToggle: () => void
}) {
  const status = getVoucherStatus(voucher)
  return (
    <div className="card p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-brand-red-600">{voucher.code}</span>
            <span
              className={cn(
                "rounded-md px-1.5 py-0.5 text-[10px] font-semibold",
                STATUS_LABEL[status].tone
              )}
            >
              {STATUS_LABEL[status].label}
            </span>
          </div>
          <p className="mt-0.5 text-sm font-medium text-neutral-900">{voucher.title}</p>
        </div>
        <div className="flex gap-1">
          <IconButton onClick={onToggle} title={voucher.isActive ? "Tạm dừng" : "Bật"}>
            <Power size={14} />
          </IconButton>
          <IconButton onClick={onEdit} title="Sửa">
            <Edit3 size={14} />
          </IconButton>
          <IconButton onClick={onDelete} title="Xoá" tone="danger">
            <Trash2 size={14} />
          </IconButton>
        </div>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-neutral-600">
        <div>Giảm: <strong>{formatDiscount(voucher)}</strong></div>
        <div>
          Đơn tối thiểu:{" "}
          <strong>
            {voucher.minOrderValue > 0 ? formatCurrency(voucher.minOrderValue) : "—"}
          </strong>
        </div>
        <div>
          Đã dùng:{" "}
          <strong>
            {voucher.usageLimit > 0
              ? `${voucher.usedCount}/${voucher.usageLimit}`
              : voucher.usedCount}
          </strong>
        </div>
        <div>
          HSD:{" "}
          <strong>{new Date(voucher.endDate.toMillis()).toLocaleDateString("vi-VN")}</strong>
        </div>
      </div>
    </div>
  )
}

function formatDiscount(v: VoucherDoc): string {
  if (v.discountType === "fixed") return `-${formatCurrency(v.value)}`
  if (v.discountType === "percent") {
    return v.maxDiscount
      ? `-${v.value}% (tối đa ${formatCurrency(v.maxDiscount)})`
      : `-${v.value}%`
  }
  return "Free ship"
}

function toLocalInput(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function VoucherEditor({
  mode,
  shopId,
  shopName,
  shopSlug,
  voucher,
  onClose,
}: {
  mode: "create" | "edit"
  shopId: string
  shopName: string
  shopSlug: string
  voucher: VoucherDoc | null
  onClose: () => void
}) {
  const createMut = useCreateVoucher(shopId)
  const updateMut = useUpdateVoucher(shopId)

  const [code, setCode] = useState(voucher?.code ?? suggestVoucherCode(shopSlug))
  const [title, setTitle] = useState(voucher?.title ?? "")
  const [description, setDescription] = useState(voucher?.description ?? "")
  const [discountType, setDiscountType] = useState<VoucherDiscountType>(
    voucher?.discountType ?? "percent"
  )
  const [value, setValue] = useState<number>(voucher?.value ?? 10)
  const [maxDiscount, setMaxDiscount] = useState<number>(voucher?.maxDiscount ?? 0)
  const [minOrderValue, setMinOrderValue] = useState<number>(voucher?.minOrderValue ?? 0)
  const [usageLimit, setUsageLimit] = useState<number>(voucher?.usageLimit ?? 100)
  const defaultStart = voucher?.startDate.toDate() ?? new Date()
  const defaultEnd =
    voucher?.endDate.toDate() ??
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  const [startDate, setStartDate] = useState(toLocalInput(defaultStart))
  const [endDate, setEndDate] = useState(toLocalInput(defaultEnd))
  const [isActive, setIsActive] = useState(voucher?.isActive ?? true)

  const isSaving = createMut.isPending || updateMut.isPending

  async function handleSave() {
    const startObj = new Date(startDate)
    const endObj = new Date(endDate)

    if (mode === "create" && !code.trim()) return toast.error("Mã không được trống")
    if (!title.trim()) return toast.error("Tên voucher không được trống")
    if (value <= 0) return toast.error("Giá trị phải lớn hơn 0")
    if (discountType === "percent" && value > 100)
      return toast.error("Phần trăm tối đa 100")
    if (endObj.getTime() <= startObj.getTime())
      return toast.error("Ngày kết thúc phải sau ngày bắt đầu")
    if (minOrderValue < 0) return toast.error("Đơn tối thiểu không được âm")
    if (usageLimit < 0) return toast.error("Số lượt dùng không được âm")

    try {
      if (mode === "create") {
        await createMut.mutateAsync({
          shopId,
          shopName,
          code,
          title,
          description,
          discountType,
          value,
          maxDiscount: discountType === "percent" && maxDiscount > 0 ? maxDiscount : null,
          minOrderValue,
          startDate: startObj,
          endDate: endObj,
          isActive,
          usageLimit,
        })
        toast.success("Đã tạo voucher")
      } else if (voucher) {
        await updateMut.mutateAsync({
          voucherId: voucher.id,
          patch: {
            title,
            description,
            discountType,
            value,
            maxDiscount: discountType === "percent" && maxDiscount > 0 ? maxDiscount : null,
            minOrderValue,
            startDate: startObj,
            endDate: endObj,
            isActive,
            usageLimit,
          },
        })
        toast.success("Đã cập nhật voucher")
      }
      onClose()
    } catch (err) {
      toast.error(sanitizeUserError(err, "Lưu thất bại. Vui lòng thử lại sau."))
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 md:items-center md:p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl bg-white p-5 shadow-2xl md:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="text-brand-gold-500" />
            <h3 className="text-lg font-bold text-neutral-900">
              {mode === "create" ? "Tạo voucher mới" : `Sửa voucher ${voucher?.code}`}
            </h3>
          </div>
          <button onClick={onClose} className="rounded p-1 hover:bg-neutral-100" aria-label="Đóng">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Mã voucher" required>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                disabled={mode === "edit"}
                className="input uppercase disabled:bg-neutral-100"
                placeholder="ACFMOI50"
              />
              {mode === "create" && (
                <button
                  type="button"
                  onClick={() => setCode(suggestVoucherCode(shopSlug))}
                  className="mt-1 text-xs text-brand-red-600 hover:underline"
                >
                  Tạo mã tự động
                </button>
              )}
            </Field>
            <Field label="Tên voucher" required>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input"
                placeholder="Giảm 50K cho đơn từ 500K"
              />
            </Field>
          </div>

          <Field label="Mô tả">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="input resize-none"
              placeholder="Điều kiện áp dụng, ngày khuyến mãi, v.v."
            />
          </Field>

          <Field label="Loại giảm giá" required>
            <div className="grid grid-cols-3 gap-2">
              {DISCOUNT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setDiscountType(opt.value)}
                  className={cn(
                    "rounded-lg border p-3 text-left text-xs transition-colors",
                    discountType === opt.value
                      ? "border-brand-red-500 bg-brand-red-50 text-brand-red-700"
                      : "border-neutral-200 hover:border-brand-red-300"
                  )}
                >
                  <div className="font-semibold">{opt.label}</div>
                  <div className="mt-0.5 text-[10px] text-neutral-500">{opt.hint}</div>
                </button>
              ))}
            </div>
          </Field>

          {discountType !== "shipping" && (
            <div className="grid gap-3 md:grid-cols-2">
              <Field label={discountType === "percent" ? "Phần trăm (%)" : "Số tiền giảm (VND)"} required>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                    className="input pr-10"
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400">
                    {discountType === "percent" ? "%" : "đ"}
                  </span>
                </div>
              </Field>
              {discountType === "percent" && (
                <Field label="Giảm tối đa (VND, tuỳ chọn)">
                  <input
                    type="number"
                    min={0}
                    value={maxDiscount}
                    onChange={(e) => setMaxDiscount(Number(e.target.value))}
                    className="input"
                    placeholder="0 = không giới hạn"
                  />
                </Field>
              )}
            </div>
          )}

          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Đơn tối thiểu (VND)">
              <input
                type="number"
                min={0}
                value={minOrderValue}
                onChange={(e) => setMinOrderValue(Number(e.target.value))}
                className="input"
              />
            </Field>
            <Field label="Số lượt dùng (0 = không giới hạn)">
              <input
                type="number"
                min={0}
                value={usageLimit}
                onChange={(e) => setUsageLimit(Number(e.target.value))}
                className="input"
              />
            </Field>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Bắt đầu" required>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input"
              />
            </Field>
            <Field label="Kết thúc" required>
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input"
              />
            </Field>
          </div>

          <label className="flex items-center gap-2 rounded-lg border border-neutral-200 p-3 text-sm">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded text-brand-red-500"
            />
            <span className="flex-1">
              <strong>Kích hoạt ngay</strong>
              <span className="ml-2 text-xs text-neutral-500">
                Khách có thể nhìn thấy và áp dụng voucher
              </span>
            </span>
          </label>
        </div>

        <div className="mt-5 flex gap-2 border-t border-neutral-200 pt-4">
          <button onClick={onClose} className="btn-secondary flex-1 justify-center">
            Huỷ
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="btn-primary flex-1 justify-center"
          >
            {isSaving ? "Đang lưu..." : mode === "create" ? "Tạo voucher" : "Lưu thay đổi"}
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-neutral-700">
        {label}
        {required && <span className="text-brand-red-500"> *</span>}
      </span>
      {children}
    </label>
  )
}

