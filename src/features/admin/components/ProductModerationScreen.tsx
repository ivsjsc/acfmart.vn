import { useEffect, useState } from "react"
import {
  Search,
  CheckCircle2,
  XCircle,
  Eye,
  ChevronDown,
  Loader2,
  Store,
  Package,
  Tag,
  ShieldCheck,
  Image as ImageIcon,
  AlertTriangle,
  Wifi,
  RefreshCw,
} from "lucide-react"
import toast from "react-hot-toast"
import { cn } from "../../../lib/cn"
import { formatCurrency } from "../../../lib/format"
import { sanitizeUserError } from "../../../lib/error-utils"
import { useApproveProduct, useRejectProduct } from "../../../hooks/use-products"
import {
  subscribeModerationProducts,
  subscribeModerationCounts,
  type ProductDoc,
  type ProductStatus,
} from "../../../lib/product-service"

type StatusFilter = ProductStatus | undefined

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: "pending", label: "Chờ duyệt" },
  { value: "approved", label: "Đã duyệt" },
  { value: "rejected", label: "Đã từ chối" },
  { value: "draft", label: "Nháp" },
  { value: "archived", label: "Đã ẩn" },
  { value: undefined, label: "Tất cả" },
]

export function ProductModerationScreen() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending")
  const [search, setSearch] = useState("")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState("")
  const [approveNote, setApproveNote] = useState("")

  const [products, setProducts] = useState<ProductDoc[]>([])
  const [counts, setCounts] = useState<Record<ProductStatus, number>>({
    draft: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    archived: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryToken, setRetryToken] = useState(0)

  const approveProductM = useApproveProduct()
  const rejectProductM = useRejectProduct()

  useEffect(() => {
    setLoading(true)
    setError(null)
    const unsubProducts = subscribeModerationProducts(
      { status: statusFilter, q: search || undefined, limitCount: 100 },
      ({ products: data }) => {
        setProducts(data)
        setLoading(false)
      },
      (err) => {
        const message = sanitizeUserError(err, "Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.")
        setError(message)
        setLoading(false)
        toast.error(message, { duration: 6000 })
      }
    )
    return () => unsubProducts()
  }, [statusFilter, search, retryToken])

  useEffect(() => {
    const unsubCounts = subscribeModerationCounts(
      (data) => setCounts(data),
      (err) => console.error("[ProductModeration] counts error:", err)
    )
    return () => unsubCounts()
  }, [])

  async function handleApprove(id: string) {
    try {
      await approveProductM.mutateAsync({
        id,
        note: approveNote || undefined,
      })
      toast.success("Đã duyệt sản phẩm — đang hiển thị cho buyer")
      setSelectedId(null)
      setApproveNote("")
    } catch (err) {
      toast.error(sanitizeUserError(err, "Duyệt thất bại. Vui lòng thử lại sau."))
    }
  }

  async function handleReject(id: string) {
    if (!rejectReason.trim() || rejectReason.trim().length < 10) {
      toast.error("Lý do từ chối tối thiểu 10 ký tự")
      return
    }
    try {
      await rejectProductM.mutateAsync({ id, reason: rejectReason })
      toast.success("Đã từ chối sản phẩm — seller có thể chỉnh sửa lại")
      setSelectedId(null)
      setRejectReason("")
    } catch (err) {
      toast.error(sanitizeUserError(err, "Từ chối thất bại. Vui lòng thử lại sau."))
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Duyệt sản phẩm</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Xem xét và phê duyệt sản phẩm seller gửi lên — đồng bộ tức thời
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
          </span>
          <Wifi size={12} /> Realtime
        </div>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1 overflow-x-auto">
          {STATUS_TABS.map((tab) => {
            const count =
              tab.value === undefined ? undefined : counts[tab.value] ?? 0
            return (
              <button
                key={tab.label}
                onClick={() => setStatusFilter(tab.value)}
                className={cn(
                  "flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                  statusFilter === tab.value
                    ? "bg-brand-red-50 text-brand-red-700"
                    : "text-neutral-600 hover:bg-neutral-100"
                )}
              >
                {tab.label}
                {count !== undefined && count > 0 && (
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                      statusFilter === tab.value
                        ? "bg-brand-red-200 text-brand-red-800"
                        : "bg-neutral-200 text-neutral-700"
                    )}
                  >
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm sản phẩm, shop, brand..."
            className="rounded-lg border border-neutral-200 py-2 pl-9 pr-4 text-sm outline-none focus:border-brand-red-300 focus:ring-1 focus:ring-brand-red-200"
          />
        </div>
      </div>

      {/* Error banner */}
      {error && !loading && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4">
          <AlertTriangle className="mt-0.5 shrink-0 text-rose-600" size={18} />
          <div className="flex-1">
            <p className="text-sm font-semibold text-rose-900">
              Không thể tải danh sách sản phẩm
            </p>
            <p className="mt-1 text-xs text-rose-700">{error}</p>
            <button
              onClick={() => setRetryToken((n) => n + 1)}
              className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-rose-300 bg-white px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-100"
            >
              <RefreshCw size={12} />
              Thử lại
            </button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="mt-6">
        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="animate-spin text-brand-red-500" size={28} />
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="rounded-xl border border-neutral-200 bg-white py-16 text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-neutral-100 flex items-center justify-center">
              <Package className="text-neutral-400" size={20} />
            </div>
            <p className="mt-3 text-sm text-neutral-500">
              Không có sản phẩm nào trong trạng thái này
            </p>
          </div>
        )}

        {products.length > 0 && (
          <div className="space-y-3">
            {products.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                expanded={selectedId === p.id}
                onToggle={() =>
                  setSelectedId(selectedId === p.id ? null : p.id)
                }
                approveNote={approveNote}
                onApproveNoteChange={setApproveNote}
                rejectReason={rejectReason}
                onRejectReasonChange={setRejectReason}
                onApprove={() => handleApprove(p.id)}
                onReject={() => handleReject(p.id)}
                approving={approveProductM.isPending}
                rejecting={rejectProductM.isPending}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ProductCard({
  product: p,
  expanded,
  onToggle,
  approveNote,
  onApproveNoteChange,
  rejectReason,
  onRejectReasonChange,
  onApprove,
  onReject,
  approving,
  rejecting,
}: {
  product: ProductDoc
  expanded: boolean
  onToggle: () => void
  approveNote: string
  onApproveNoteChange: (v: string) => void
  rejectReason: string
  onRejectReasonChange: (v: string) => void
  onApprove: () => void
  onReject: () => void
  approving: boolean
  rejecting: boolean
}) {
  const images = p.images ?? []
  const variants = p.variants ?? []
  const thumbnail = p.thumbnail || images[0]

  return (
    <div
      className={cn(
        "rounded-xl border bg-white transition-shadow hover:shadow-sm",
        expanded
          ? "border-brand-red-300 ring-2 ring-brand-red-100"
          : "border-neutral-200"
      )}
    >
      {/* Header row */}
      <div className="flex flex-wrap items-start gap-3 p-4">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={p.title}
            className="h-16 w-16 shrink-0 rounded-lg object-cover"
          />
        ) : (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-400">
            <ImageIcon size={22} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-neutral-900">{p.title}</h3>
            <StatusBadge status={p.status} />
            {p.acfVerifyStatus !== "none" && (
              <span className="inline-flex items-center gap-0.5 rounded bg-brand-gold-100 px-1.5 py-0.5 text-[10px] font-semibold text-brand-gold-800">
                <ShieldCheck size={10} />
                ACF {p.acfVerifyStatus}
              </span>
            )}
          </div>
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-neutral-500">
            <span className="inline-flex items-center gap-1">
              <Store size={11} />
              {p.shopName}
            </span>
            <span className="inline-flex items-center gap-1">
              <Tag size={11} />
              {p.brand}
            </span>
            <span>{p.category}</span>
            <span>{variants.length > 0 ? `${variants.length} mẫu` : "Không phân loại"}</span>
            <span className="font-semibold text-neutral-700">
              {formatCurrency(p.basePrice)}
            </span>
          </div>
        </div>
        <button
          onClick={onToggle}
          className="flex items-center gap-1 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs text-neutral-600 hover:bg-neutral-50"
        >
          <Eye size={12} />
          Chi tiết
          <ChevronDown
            size={12}
            className={cn("transition-transform", expanded && "rotate-180")}
          />
        </button>
      </div>

      {/* Expanded */}
      {expanded && (
        <div className="border-t border-neutral-100 p-4">
          {/* Image gallery */}
          <div className="mb-4">
            <h4 className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase text-neutral-700">
              <ImageIcon size={12} />
              Hình ảnh ({images.length})
            </h4>
            <div className="flex gap-2 overflow-x-auto">
              {images.length === 0 && (
                <div className="flex h-24 min-w-[160px] items-center justify-center rounded-lg border border-dashed border-neutral-200 bg-neutral-50 text-xs text-neutral-400">
                  Chưa có hình ảnh
                </div>
              )}
              {images.map((url, i) => (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100"
                >
                  <img
                    src={url}
                    alt={`Ảnh ${i + 1}`}
                    className="h-full w-full object-cover hover:scale-105 transition-transform"
                  />
                </a>
              ))}
            </div>
          </div>

          {/* Detail grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <DetailBlock title="Thông tin sản phẩm">
              <DetailRow label="Tên" value={p.title} />
              <DetailRow label="Handle" value={p.handle} />
              <DetailRow label="Danh mục" value={p.category} />
              <DetailRow label="Thương hiệu" value={p.brand} />
              <DetailRow
                label="Giá cơ bản"
                value={formatCurrency(p.basePrice)}
              />
              <DetailRow label="Kho" value={String(p.totalStock)} />
            </DetailBlock>

            <DetailBlock title="Shop">
              <DetailRow label="Tên shop" value={p.shopName} />
              <DetailRow label="Slug" value={p.shopSlug} />
              <DetailRow label="Shop ID" value={p.shopId} mono />
              <DetailRow label="Vendor ID" value={p.vendorId} mono />
            </DetailBlock>

            {p.description && (
              <div className="md:col-span-2">
                <h4 className="mb-1 text-xs font-bold uppercase text-neutral-700">
                  Mô tả
                </h4>
                <p className="whitespace-pre-wrap rounded-lg bg-neutral-50 p-3 text-sm text-neutral-700">
                  {p.description}
                </p>
              </div>
            )}

            {variants.length > 0 && (
              <div className="md:col-span-2">
                <h4 className="mb-2 text-xs font-bold uppercase text-neutral-700">
                  Phân loại ({variants.length})
                </h4>
                <table className="w-full text-sm">
                  <thead className="text-left text-[10px] uppercase text-neutral-500">
                    <tr>
                      <th className="pb-1">Tên</th>
                      <th className="pb-1">SKU</th>
                      <th className="pb-1 text-right">Giá</th>
                      <th className="pb-1 text-right">Kho</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {variants.map((v) => (
                      <tr key={v.id}>
                        <td className="py-1">{v.title}</td>
                        <td className="py-1 font-mono text-xs">{v.sku}</td>
                        <td className="py-1 text-right">
                          {formatCurrency(v.price)}
                        </td>
                        <td className="py-1 text-right">{v.stock}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {p.rejectedReason && (
            <div className="mt-4 rounded-lg border border-rose-100 bg-rose-50 p-3">
              <p className="text-xs font-semibold text-rose-700">
                Lý do từ chối lần trước:
              </p>
              <p className="mt-0.5 text-sm text-rose-600">{p.rejectedReason}</p>
            </div>
          )}

          {/* Moderation actions — only for pending */}
          {p.status === "pending" && (
            <div className="mt-6 space-y-4 rounded-lg border border-neutral-100 bg-neutral-50 p-4">
              <h4 className="text-sm font-semibold text-neutral-900">
                Hành động kiểm duyệt
              </h4>

              {/* Approve */}
              <div className="flex flex-wrap items-end gap-3">
                <div className="flex-1 min-w-[200px]">
                  <label className="text-xs text-neutral-500">
                    Ghi chú duyệt (tuỳ chọn)
                  </label>
                  <input
                    type="text"
                    value={approveNote}
                    onChange={(e) => onApproveNoteChange(e.target.value)}
                    placeholder="Ghi chú cho audit log..."
                    className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-1.5 text-sm"
                  />
                </div>
                <button
                  onClick={onApprove}
                  disabled={approving || rejecting}
                  className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  {approving ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <CheckCircle2 size={14} />
                  )}
                  Duyệt sản phẩm
                </button>
              </div>

              <div className="border-t border-neutral-200" />

              {/* Reject */}
              <div className="flex flex-wrap items-end gap-3">
                <div className="flex-1 min-w-[250px]">
                  <label className="text-xs text-neutral-500">
                    Lý do từ chối{" "}
                    <span className="text-rose-500">* (tối thiểu 10 ký tự)</span>
                  </label>
                  <input
                    type="text"
                    value={rejectReason}
                    onChange={(e) => onRejectReasonChange(e.target.value)}
                    placeholder="VD: Ảnh không rõ nét, thiếu thông tin nguồn gốc..."
                    className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-1.5 text-sm"
                  />
                </div>
                <button
                  onClick={onReject}
                  disabled={approving || rejecting}
                  className="flex items-center gap-1.5 rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50"
                >
                  {rejecting ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <XCircle size={14} />
                  )}
                  Từ chối
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: ProductStatus }) {
  const map: Record<ProductStatus, { text: string; cls: string }> = {
    draft: { text: "Nháp", cls: "bg-neutral-100 text-neutral-700" },
    pending: { text: "Chờ duyệt", cls: "bg-amber-100 text-amber-700" },
    approved: { text: "Đã duyệt", cls: "bg-emerald-100 text-emerald-700" },
    rejected: { text: "Từ chối", cls: "bg-rose-100 text-rose-700" },
    archived: { text: "Đã ẩn", cls: "bg-neutral-200 text-neutral-600" },
  }
  const m = map[status]
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold",
        m.cls
      )}
    >
      {m.text}
    </span>
  )
}

function DetailBlock({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div>
      <h4 className="mb-1 text-xs font-bold uppercase text-neutral-700">
        {title}
      </h4>
      <dl className="space-y-1 text-sm">{children}</dl>
    </div>
  )
}

function DetailRow({
  label,
  value,
  mono,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="flex gap-2">
      <dt className="w-28 shrink-0 text-neutral-500">{label}</dt>
      <dd
        className={cn(
          "break-all font-medium text-neutral-900",
          mono && "font-mono text-xs"
        )}
      >
        {value}
      </dd>
    </div>
  )
}
