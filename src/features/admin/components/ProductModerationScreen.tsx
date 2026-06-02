import { useEffect, useMemo, useState } from "react"
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Store,
  Package,
  Tag,
  ShieldCheck,
  Image as ImageIcon,
  Wifi,
  ArrowLeft,
  ArrowUpDown,
  Eye,
} from "lucide-react"
import toast from "react-hot-toast"
import { cn } from "../../../lib/cn"
import { formatCurrency } from "../../../lib/format"
import { sanitizeUserError } from "../../../lib/error-utils"
import { useDebouncedValue } from "../../../hooks/use-debounced-value"
import { useApproveProduct, useRejectProduct } from "../../../hooks/use-products"
import {
  subscribeModerationProducts,
  subscribeModerationCounts,
  type ProductDoc,
  type ProductStatus,
} from "../../../lib/product-service"
import {
  AdminSearchInput,
  FilterTabs,
  WaitingBadge,
  BulkActionBar,
  AdminEmptyState,
  AdminErrorState,
  DetailEmptyHint,
  type FilterTab,
} from "./shared/admin-ui"

type StatusFilter = ProductStatus | undefined

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: "pending", label: "Chờ duyệt" },
  { value: "approved", label: "Đã duyệt" },
  { value: "rejected", label: "Đã từ chối" },
  { value: "draft", label: "Nháp" },
  { value: "archived", label: "Đã ẩn" },
  { value: undefined, label: "Tất cả" },
]

type SortKey = "newest" | "oldest" | "price_high" | "price_low"
const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "newest", label: "Mới gửi nhất" },
  { value: "oldest", label: "Chờ lâu nhất" },
  { value: "price_high", label: "Giá cao → thấp" },
  { value: "price_low", label: "Giá thấp → cao" },
]

const PAGE_SIZE = 20

function tsToDate(ts: ProductDoc["created_at"]): Date | null {
  return ts?.toDate?.() ?? null
}
function tsToMillis(ts: ProductDoc["created_at"]): number {
  return ts?.toMillis?.() ?? 0
}

export function ProductModerationScreen() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending")
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebouncedValue(search, 300)
  const [sortBy, setSortBy] = useState<SortKey>("newest")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [rejectReason, setRejectReason] = useState("")
  const [approveNote, setApproveNote] = useState("")
  const [bulkRejectOpen, setBulkRejectOpen] = useState(false)
  const [bulkReason, setBulkReason] = useState("")
  const [bulkRunning, setBulkRunning] = useState(false)

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
    const unsub = subscribeModerationProducts(
      { status: statusFilter, q: debouncedSearch || undefined, limitCount: 200 },
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
    return () => unsub()
  }, [statusFilter, debouncedSearch, retryToken])

  useEffect(() => {
    const unsub = subscribeModerationCounts(
      (data) => setCounts(data),
      (err) => console.error("[ProductModeration] counts error:", err)
    )
    return () => unsub()
  }, [])

  // Reset paging + bulk selection khi đổi bộ lọc
  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
    setSelectedIds(new Set())
  }, [statusFilter, debouncedSearch])

  // Reset form khi đổi sản phẩm đang xem
  useEffect(() => {
    setApproveNote("")
    setRejectReason("")
  }, [selectedId])

  const sorted = useMemo(() => {
    const arr = [...products]
    switch (sortBy) {
      case "oldest":
        arr.sort((a, b) => tsToMillis(a.created_at) - tsToMillis(b.created_at))
        break
      case "price_high":
        arr.sort((a, b) => b.basePrice - a.basePrice)
        break
      case "price_low":
        arr.sort((a, b) => a.basePrice - b.basePrice)
        break
      default:
        arr.sort((a, b) => tsToMillis(b.created_at) - tsToMillis(a.created_at))
    }
    return arr
  }, [products, sortBy])

  const visibleProducts = sorted.slice(0, visibleCount)
  const selected = useMemo(
    () => products.find((p) => p.id === selectedId) ?? null,
    [products, selectedId]
  )

  const pendingMode = statusFilter === "pending"
  const selectableVisible = pendingMode ? visibleProducts : []
  const allSelected =
    selectableVisible.length > 0 && selectableVisible.every((p) => selectedIds.has(p.id))

  function toggleOne(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }
  function toggleSelectAll() {
    setSelectedIds((prev) => {
      if (allSelected) return new Set()
      const next = new Set(prev)
      for (const p of selectableVisible) next.add(p.id)
      return next
    })
  }

  async function handleApprove(id: string) {
    try {
      await approveProductM.mutateAsync({ id, note: approveNote || undefined })
      toast.success("Đã duyệt sản phẩm — đang hiển thị cho buyer")
      setSelectedId(null)
    } catch (err) {
      toast.error(sanitizeUserError(err, "Duyệt thất bại. Vui lòng thử lại sau."))
    }
  }

  async function handleReject(id: string) {
    if (rejectReason.trim().length < 10) {
      toast.error("Lý do từ chối tối thiểu 10 ký tự")
      return
    }
    try {
      await rejectProductM.mutateAsync({ id, reason: rejectReason })
      toast.success("Đã từ chối sản phẩm — seller có thể chỉnh sửa lại")
      setSelectedId(null)
    } catch (err) {
      toast.error(sanitizeUserError(err, "Từ chối thất bại. Vui lòng thử lại sau."))
    }
  }

  async function handleBulkApprove() {
    const ids = Array.from(selectedIds)
    if (ids.length === 0) return
    setBulkRunning(true)
    let ok = 0
    for (const id of ids) {
      try {
        await approveProductM.mutateAsync({ id })
        ok++
      } catch (err) {
        console.error("[ProductModeration] bulk approve failed:", id, err)
      }
    }
    setBulkRunning(false)
    setSelectedIds(new Set())
    toast.success(`Đã duyệt ${ok}/${ids.length} sản phẩm`)
  }

  async function handleBulkReject() {
    const ids = Array.from(selectedIds)
    if (ids.length === 0) return
    if (bulkReason.trim().length < 10) {
      toast.error("Lý do từ chối tối thiểu 10 ký tự")
      return
    }
    setBulkRunning(true)
    let ok = 0
    for (const id of ids) {
      try {
        await rejectProductM.mutateAsync({ id, reason: bulkReason })
        ok++
      } catch (err) {
        console.error("[ProductModeration] bulk reject failed:", id, err)
      }
    }
    setBulkRunning(false)
    setSelectedIds(new Set())
    setBulkRejectOpen(false)
    setBulkReason("")
    toast.success(`Đã từ chối ${ok}/${ids.length} sản phẩm`)
  }

  const tabs: FilterTab<StatusFilter>[] = STATUS_TABS.map((t) => ({
    value: t.value,
    label: t.label,
    count: t.value === undefined ? undefined : counts[t.value] ?? 0,
  }))

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

      {/* Toolbar */}
      <div className="mt-6 flex flex-col gap-3">
        <FilterTabs tabs={tabs} value={statusFilter} onChange={setStatusFilter} />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <AdminSearchInput
            value={search}
            onChange={setSearch}
            placeholder="Tìm sản phẩm, shop, brand..."
            className="sm:max-w-xs"
          />
          <div className="relative inline-flex items-center">
            <ArrowUpDown
              size={14}
              className="pointer-events-none absolute left-3 text-neutral-400"
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortKey)}
              className="appearance-none rounded-lg border border-neutral-200 py-2 pl-9 pr-8 text-sm outline-none focus:border-brand-red-300"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <span className="text-xs text-neutral-400 sm:ml-auto">
            {sorted.length} sản phẩm
          </span>
        </div>
      </div>

      {error && !loading && (
        <div className="mt-6">
          <AdminErrorState
            title="Không thể tải danh sách sản phẩm"
            message={error}
            onRetry={() => setRetryToken((n) => n + 1)}
          />
        </div>
      )}

      {/* Master-detail */}
      <div className="mt-6 lg:flex lg:items-start lg:gap-5">
        {/* List */}
        <div className="lg:w-[42%] lg:shrink-0 xl:w-2/5">
          {loading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="animate-spin text-brand-red-500" size={28} />
            </div>
          )}

          {!loading && !error && sorted.length === 0 && (
            <AdminEmptyState
              icon={Package}
              title="Không có sản phẩm nào trong trạng thái này"
            />
          )}

          {!loading && sorted.length > 0 && (
            <>
              {pendingMode && (
                <label className="mb-2 flex cursor-pointer items-center gap-2 px-1 text-xs text-neutral-500">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    className="accent-brand-red-600"
                  />
                  Chọn tất cả ({selectableVisible.length})
                </label>
              )}
              <div className="space-y-2">
                {visibleProducts.map((p) => (
                  <ProductRow
                    key={p.id}
                    product={p}
                    active={selectedId === p.id}
                    selectable={pendingMode}
                    checked={selectedIds.has(p.id)}
                    onCheck={() => toggleOne(p.id)}
                    onClick={() => setSelectedId(p.id)}
                  />
                ))}
              </div>
              {visibleCount < sorted.length && (
                <button
                  onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
                  className="mt-3 w-full rounded-lg border border-neutral-200 bg-white py-2.5 text-sm font-medium text-neutral-600 hover:bg-neutral-50"
                >
                  Tải thêm ({sorted.length - visibleCount} còn lại)
                </button>
              )}
            </>
          )}

          <BulkActionBar count={selectedIds.size} onClear={() => setSelectedIds(new Set())}>
            <button
              onClick={handleBulkApprove}
              disabled={bulkRunning}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {bulkRunning ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
              Duyệt tất cả
            </button>
            <button
              onClick={() => setBulkRejectOpen(true)}
              disabled={bulkRunning}
              className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-700 disabled:opacity-50"
            >
              <XCircle size={13} />
              Từ chối tất cả
            </button>
          </BulkActionBar>
        </div>

        {/* Detail */}
        <div
          className={cn(
            "lg:flex-1 lg:sticky lg:top-[72px]",
            selected
              ? "fixed inset-0 z-40 overflow-y-auto bg-neutral-100 p-4 lg:static lg:z-auto lg:bg-transparent lg:p-0"
              : "hidden lg:block"
          )}
        >
          {selected ? (
            <ProductDetailPanel
              product={selected}
              onClose={() => setSelectedId(null)}
              approveNote={approveNote}
              onApproveNoteChange={setApproveNote}
              rejectReason={rejectReason}
              onRejectReasonChange={setRejectReason}
              onApprove={() => handleApprove(selected.id)}
              onReject={() => handleReject(selected.id)}
              approving={approveProductM.isPending}
              rejecting={rejectProductM.isPending}
            />
          ) : (
            <DetailEmptyHint
              icon={Eye}
              text="Chọn một sản phẩm bên trái để xem chi tiết và kiểm duyệt"
            />
          )}
        </div>
      </div>

      {/* Bulk reject modal */}
      {bulkRejectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="font-bold text-neutral-900">
              Từ chối {selectedIds.size} sản phẩm
            </h2>
            <p className="mt-1 text-xs text-neutral-500">
              Lý do sẽ áp dụng cho tất cả sản phẩm đã chọn.
            </p>
            <textarea
              value={bulkReason}
              onChange={(e) => setBulkReason(e.target.value)}
              rows={3}
              placeholder="VD: Ảnh không rõ nét, thiếu thông tin nguồn gốc..."
              className="mt-4 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-brand-red-300"
            />
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => {
                  setBulkRejectOpen(false)
                  setBulkReason("")
                }}
                className="flex-1 rounded-lg border border-neutral-200 py-2.5 text-sm font-medium text-neutral-600 hover:bg-neutral-50"
              >
                Huỷ
              </button>
              <button
                onClick={handleBulkReject}
                disabled={bulkRunning}
                className="flex-1 rounded-lg bg-rose-600 py-2.5 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50"
              >
                {bulkRunning ? (
                  <Loader2 size={14} className="mx-auto animate-spin" />
                ) : (
                  "Xác nhận từ chối"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ProductRow({
  product: p,
  active,
  selectable,
  checked,
  onCheck,
  onClick,
}: {
  product: ProductDoc
  active: boolean
  selectable: boolean
  checked: boolean
  onCheck: () => void
  onClick: () => void
}) {
  const thumbnail = p.thumbnail || (p.images ?? [])[0]
  return (
    <div
      onClick={onClick}
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-xl border bg-white p-3 transition-all hover:shadow-sm",
        active
          ? "border-brand-red-300 ring-2 ring-brand-red-100"
          : "border-neutral-200"
      )}
    >
      {selectable && (
        <input
          type="checkbox"
          checked={checked}
          onChange={onCheck}
          onClick={(e) => e.stopPropagation()}
          className="mt-1 shrink-0 accent-brand-red-600"
        />
      )}
      {thumbnail ? (
        <img
          src={thumbnail}
          alt={p.title}
          className="h-14 w-14 shrink-0 rounded-lg object-cover"
        />
      ) : (
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-400">
          <ImageIcon size={20} />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate text-sm font-semibold text-neutral-900">{p.title}</h3>
          <StatusBadge status={p.status} />
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-neutral-500">
          <span className="inline-flex items-center gap-1">
            <Store size={11} />
            {p.shopName}
          </span>
          <span className="font-semibold text-neutral-700">
            {formatCurrency(p.basePrice)}
          </span>
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          {p.status === "pending" && <WaitingBadge since={tsToDate(p.created_at)} />}
          {p.acfVerifyStatus && p.acfVerifyStatus !== "none" && (
            <span className="inline-flex items-center gap-0.5 rounded bg-brand-gold-100 px-1.5 py-0.5 text-[10px] font-semibold text-brand-gold-800">
              <ShieldCheck size={10} />
              ACF {p.acfVerifyStatus}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

function ProductDetailPanel({
  product: p,
  onClose,
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
  onClose: () => void
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

  return (
    <div className="rounded-xl border border-neutral-200 bg-white">
      {/* Panel header */}
      <div className="flex items-center justify-between gap-3 border-b border-neutral-100 p-4">
        <div className="flex min-w-0 items-center gap-2">
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-neutral-500 hover:bg-neutral-100 lg:hidden"
            aria-label="Quay lại"
          >
            <ArrowLeft size={18} />
          </button>
          <h3 className="truncate font-semibold text-neutral-900">{p.title}</h3>
          <StatusBadge status={p.status} />
        </div>
        <button
          onClick={onClose}
          className="hidden rounded-lg p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 lg:block"
          aria-label="Đóng"
        >
          <XCircle size={18} />
        </button>
      </div>

      <div className="p-4">
        {/* Gallery */}
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
                  className="h-full w-full object-cover transition-transform hover:scale-105"
                />
              </a>
            ))}
          </div>
        </div>

        {/* Detail grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <DetailBlock title="Thông tin sản phẩm">
            <DetailRow label="Tên" value={p.title} />
            <DetailRow label="Handle" value={p.handle} />
            <DetailRow label="Danh mục" value={p.category} />
            <DetailRow label="Thương hiệu" value={p.brand} />
            <DetailRow label="Giá cơ bản" value={formatCurrency(p.basePrice)} />
            <DetailRow label="Kho" value={String(p.totalStock)} />
          </DetailBlock>

          <DetailBlock title="Shop">
            <DetailRow label="Tên shop" value={p.shopName} />
            <DetailRow label="Slug" value={p.shopSlug} />
            <DetailRow label="Shop ID" value={p.shopId} mono />
            <DetailRow label="Vendor ID" value={p.vendorId} mono />
          </DetailBlock>

          {p.description && (
            <div className="sm:col-span-2">
              <h4 className="mb-1 text-xs font-bold uppercase text-neutral-700">Mô tả</h4>
              <p className="whitespace-pre-wrap rounded-lg bg-neutral-50 p-3 text-sm text-neutral-700">
                {p.description}
              </p>
            </div>
          )}

          {variants.length > 0 && (
            <div className="sm:col-span-2">
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
                      <td className="py-1 text-right">{formatCurrency(v.price)}</td>
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
            <p className="text-xs font-semibold text-rose-700">Lý do từ chối lần trước:</p>
            <p className="mt-0.5 text-sm text-rose-600">{p.rejectedReason}</p>
          </div>
        )}

        {/* Actions — chỉ cho pending */}
        {p.status === "pending" && (
          <div className="mt-6 space-y-4 rounded-lg border border-neutral-100 bg-neutral-50 p-4">
            <h4 className="text-sm font-semibold text-neutral-900">Hành động kiểm duyệt</h4>

            <div>
              <label className="text-xs text-neutral-500">Ghi chú duyệt (tuỳ chọn)</label>
              <input
                type="text"
                value={approveNote}
                onChange={(e) => onApproveNoteChange(e.target.value)}
                placeholder="Ghi chú cho audit log..."
                className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-1.5 text-sm"
              />
              <button
                onClick={onApprove}
                disabled={approving || rejecting}
                className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                {approving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                Duyệt sản phẩm
              </button>
            </div>

            <div className="border-t border-neutral-200" />

            <div>
              <label className="text-xs text-neutral-500">
                Lý do từ chối <span className="text-rose-500">* (tối thiểu 10 ký tự)</span>
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => onRejectReasonChange(e.target.value)}
                rows={2}
                placeholder="VD: Ảnh không rõ nét, thiếu thông tin nguồn gốc..."
                className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-1.5 text-sm"
              />
              <button
                onClick={onReject}
                disabled={approving || rejecting}
                className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50"
              >
                {rejecting ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                Từ chối
              </button>
            </div>
          </div>
        )}
      </div>
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
        "inline-flex shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold",
        m.cls
      )}
    >
      {m.text}
    </span>
  )
}

function DetailBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="mb-1 text-xs font-bold uppercase text-neutral-700">{title}</h4>
      <dl className="space-y-1 text-sm">{children}</dl>
    </div>
  )
}

function DetailRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex gap-2">
      <dt className="w-28 shrink-0 text-neutral-500">{label}</dt>
      <dd className={cn("break-all font-medium text-neutral-900", mono && "font-mono text-xs")}>
        {value}
      </dd>
    </div>
  )
}
