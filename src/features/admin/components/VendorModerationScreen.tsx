import { useEffect, useMemo, useState } from "react"
import {
  CheckCircle2,
  XCircle,
  Ban,
  Loader2,
  ExternalLink,
  FileText,
  User,
  Store,
  CreditCard,
  MapPin,
  ShieldCheck,
  ArrowLeft,
  ArrowUpDown,
  Users,
} from "lucide-react"
import toast from "react-hot-toast"
import { cn } from "../../../lib/cn"
import { sanitizeUserError } from "../../../lib/error-utils"
import { useDebouncedValue } from "../../../hooks/use-debounced-value"
import {
  useModerationVendors,
  useApproveVendor,
  useRejectVendor,
  useSuspendVendor,
} from "../../../hooks/use-moderation"
import type { VendorDoc } from "../../../lib/vendor-service"
import {
  getMissingVendorDocuments,
  getRequiredVendorDocumentTypes,
  getVendorDocumentLabel,
  hasVendorDocument,
  SPECIAL_GOODS_LABELS,
} from "../../../lib/vendor-documents"
import {
  getKycProviderLabel,
  getKycLevelLabel,
  getKycStatusLabel,
  getKycStatusMeta,
} from "../../../lib/kyc"
import {
  AdminSearchInput,
  FilterTabs,
  StatTile,
  WaitingBadge,
  BulkActionBar,
  AdminEmptyState,
  AdminErrorState,
  DetailEmptyHint,
  type FilterTab,
} from "./shared/admin-ui"

type StatusFilter = "pending" | "active" | "rejected" | "suspended" | undefined

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: undefined, label: "Tất cả" },
  { value: "pending", label: "Chờ duyệt" },
  { value: "active", label: "Hoạt động" },
  { value: "rejected", label: "Đã từ chối" },
  { value: "suspended", label: "Tạm khoá" },
]

type SortKey = "newest" | "oldest" | "name"
const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "newest", label: "Mới đăng ký" },
  { value: "oldest", label: "Chờ lâu nhất" },
  { value: "name", label: "Tên A → Z" },
]

const PAGE_SIZE = 20

function vendorDate(ts: VendorDoc["created_at"]): Date | null {
  return ts?.toDate?.() ?? null
}

function businessTypeLabel(t: VendorDoc["business_type"]): string {
  return t === "individual" ? "Cá nhân" : t === "household" ? "Hộ KD" : "Doanh nghiệp"
}

export function VendorModerationScreen() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending")
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebouncedValue(search, 250)
  const [sortBy, setSortBy] = useState<SortKey>("newest")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const [rejectReason, setRejectReason] = useState("")
  const [suspendReason, setSuspendReason] = useState("")
  const [kycLevel, setKycLevel] = useState<"basic" | "verified" | "premium">("verified")
  const [approveNote, setApproveNote] = useState("")
  const [bulkRejectOpen, setBulkRejectOpen] = useState(false)
  const [bulkReason, setBulkReason] = useState("")
  const [bulkRunning, setBulkRunning] = useState(false)

  // Vendor số lượng nhỏ → lấy toàn bộ rồi lọc/đếm/sort client-side để
  // search bao phủ tất cả và có count cho từng trạng thái.
  const vendorsQuery = useModerationVendors({ limit: 500 })
  const all = vendorsQuery.data?.vendors ?? []

  const approveVendor = useApproveVendor()
  const rejectVendorMutation = useRejectVendor()
  const suspendVendorMutation = useSuspendVendor()

  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
    setSelectedIds(new Set())
  }, [statusFilter, debouncedSearch])

  useEffect(() => {
    setApproveNote("")
    setRejectReason("")
    setSuspendReason("")
    setKycLevel("verified")
  }, [selectedId])

  const stats = useMemo(() => {
    const c = { all: all.length, pending: 0, active: 0, suspended: 0, rejected: 0 }
    for (const v of all) {
      if (v.status === "pending") c.pending++
      else if (v.status === "active") c.active++
      else if (v.status === "suspended") c.suspended++
      else if (v.status === "rejected") c.rejected++
    }
    return c
  }, [all])

  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase()
    let arr = all.filter((v) => (statusFilter ? v.status === statusFilter : true))
    if (q) {
      arr = arr.filter(
        (v) =>
          v.shop_name?.toLowerCase().includes(q) ||
          v.owner_name?.toLowerCase().includes(q) ||
          v.owner_email?.toLowerCase().includes(q) ||
          v.owner_phone?.toLowerCase().includes(q)
      )
    }
    arr = [...arr]
    switch (sortBy) {
      case "oldest":
        arr.sort((a, b) => (vendorDate(a.created_at)?.getTime() ?? 0) - (vendorDate(b.created_at)?.getTime() ?? 0))
        break
      case "name":
        arr.sort((a, b) => (a.shop_name ?? "").localeCompare(b.shop_name ?? "", "vi"))
        break
      default:
        arr.sort((a, b) => (vendorDate(b.created_at)?.getTime() ?? 0) - (vendorDate(a.created_at)?.getTime() ?? 0))
    }
    return arr
  }, [all, statusFilter, debouncedSearch, sortBy])

  const visibleVendors = filtered.slice(0, visibleCount)
  const selected = useMemo(() => all.find((v) => v.id === selectedId) ?? null, [all, selectedId])

  const pendingMode = statusFilter === "pending"
  const selectableVisible = pendingMode ? visibleVendors : []
  const allSelected =
    selectableVisible.length > 0 && selectableVisible.every((v) => selectedIds.has(v.id))

  function toggleOne(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }
  function toggleSelectAll() {
    setSelectedIds(() => {
      if (allSelected) return new Set()
      return new Set(selectableVisible.map((v) => v.id))
    })
  }

  async function handleApprove(vendorId: string) {
    try {
      await approveVendor.mutateAsync({ id: vendorId, note: approveNote || undefined, kyc_level: kycLevel })
      toast.success("Đã phê duyệt seller thành công!")
      setSelectedId(null)
    } catch (err) {
      toast.error(sanitizeUserError(err, "Vui lòng thử lại sau.", { action: "phê duyệt seller" }))
    }
  }

  async function handleReject(vendorId: string) {
    if (!rejectReason.trim()) {
      toast.error("Vui lòng nhập lý do từ chối")
      return
    }
    try {
      await rejectVendorMutation.mutateAsync({ id: vendorId, reason: rejectReason })
      toast.success("Đã từ chối hồ sơ")
      setSelectedId(null)
    } catch (err) {
      toast.error(sanitizeUserError(err, "Vui lòng thử lại sau.", { action: "từ chối hồ sơ" }))
    }
  }

  async function handleSuspend(vendorId: string) {
    if (!suspendReason.trim()) {
      toast.error("Vui lòng nhập lý do tạm khoá")
      return
    }
    try {
      await suspendVendorMutation.mutateAsync({ id: vendorId, reason: suspendReason })
      toast.success("Đã tạm khoá shop")
      setSelectedId(null)
    } catch (err) {
      toast.error(sanitizeUserError(err, "Vui lòng thử lại sau.", { action: "tạm khoá shop" }))
    }
  }

  async function handleBulkApprove() {
    const eligible = all.filter(
      (v) => selectedIds.has(v.id) && getMissingVendorDocuments(v).length === 0
    )
    const skipped = selectedIds.size - eligible.length
    if (eligible.length === 0) {
      toast.error("Tất cả hồ sơ đã chọn đều còn thiếu giấy tờ, không thể duyệt")
      return
    }
    setBulkRunning(true)
    let ok = 0
    for (const v of eligible) {
      try {
        await approveVendor.mutateAsync({ id: v.id, kyc_level: "verified" })
        ok++
      } catch (err) {
        console.error("[VendorModeration] bulk approve failed:", v.id, err)
      }
    }
    setBulkRunning(false)
    setSelectedIds(new Set())
    toast.success(
      `Đã duyệt ${ok}/${eligible.length} seller` +
        (skipped > 0 ? ` · bỏ qua ${skipped} hồ sơ thiếu giấy tờ` : "")
    )
  }

  async function handleBulkReject() {
    const ids = Array.from(selectedIds)
    if (ids.length === 0) return
    if (!bulkReason.trim()) {
      toast.error("Vui lòng nhập lý do từ chối")
      return
    }
    setBulkRunning(true)
    let ok = 0
    for (const id of ids) {
      try {
        await rejectVendorMutation.mutateAsync({ id, reason: bulkReason })
        ok++
      } catch (err) {
        console.error("[VendorModeration] bulk reject failed:", id, err)
      }
    }
    setBulkRunning(false)
    setSelectedIds(new Set())
    setBulkRejectOpen(false)
    setBulkReason("")
    toast.success(`Đã từ chối ${ok}/${ids.length} hồ sơ`)
  }

  const tabs: FilterTab<StatusFilter>[] = STATUS_TABS.map((t) => ({
    value: t.value,
    label: t.label,
    count:
      t.value === undefined
        ? undefined
        : t.value === "pending"
        ? stats.pending
        : t.value === "active"
        ? stats.active
        : t.value === "rejected"
        ? stats.rejected
        : stats.suspended,
  }))

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-neutral-900">Duyệt Seller</h1>
      <p className="mt-1 text-sm text-neutral-500">Xem xét và phê duyệt hồ sơ đăng ký bán hàng</p>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile
          label="Tổng seller"
          value={stats.all}
          color="bg-blue-50 text-blue-700"
          icon={Users}
          onClick={() => setStatusFilter(undefined)}
          active={statusFilter === undefined}
        />
        <StatTile
          label="Chờ duyệt"
          value={stats.pending}
          color="bg-amber-50 text-amber-700"
          icon={FileText}
          onClick={() => setStatusFilter("pending")}
          active={statusFilter === "pending"}
        />
        <StatTile
          label="Hoạt động"
          value={stats.active}
          color="bg-emerald-50 text-emerald-700"
          icon={CheckCircle2}
          onClick={() => setStatusFilter("active")}
          active={statusFilter === "active"}
        />
        <StatTile
          label="Tạm khoá"
          value={stats.suspended}
          color="bg-orange-50 text-orange-700"
          icon={Ban}
          onClick={() => setStatusFilter("suspended")}
          active={statusFilter === "suspended"}
        />
      </div>

      {/* Toolbar */}
      <div className="mt-6 flex flex-col gap-3">
        <FilterTabs tabs={tabs} value={statusFilter} onChange={setStatusFilter} />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <AdminSearchInput
            value={search}
            onChange={setSearch}
            placeholder="Tìm theo tên shop, người đại diện, email, SĐT..."
            className="sm:max-w-xs"
          />
          <div className="relative inline-flex items-center">
            <ArrowUpDown size={14} className="pointer-events-none absolute left-3 text-neutral-400" />
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
          <span className="text-xs text-neutral-400 sm:ml-auto">{filtered.length} hồ sơ</span>
        </div>
      </div>

      {vendorsQuery.isError && (
        <div className="mt-6">
          <AdminErrorState
            title="Không thể tải hồ sơ seller"
            message="Hệ thống đang gặp trục trặc khi tải danh sách. Vui lòng thử lại sau ít phút."
            onRetry={() => vendorsQuery.refetch()}
          />
        </div>
      )}

      {/* Master-detail */}
      <div className="mt-6 lg:flex lg:items-start lg:gap-5">
        {/* List */}
        <div className="lg:w-[42%] lg:shrink-0 xl:w-2/5">
          {vendorsQuery.isLoading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="animate-spin text-brand-red-500" size={28} />
            </div>
          )}

          {!vendorsQuery.isLoading && !vendorsQuery.isError && filtered.length === 0 && (
            <AdminEmptyState icon={Store} title="Không có hồ sơ nào" />
          )}

          {!vendorsQuery.isLoading && filtered.length > 0 && (
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
                {visibleVendors.map((v) => (
                  <VendorRow
                    key={v.id}
                    vendor={v}
                    active={selectedId === v.id}
                    selectable={pendingMode}
                    checked={selectedIds.has(v.id)}
                    onCheck={() => toggleOne(v.id)}
                    onClick={() => setSelectedId(v.id)}
                  />
                ))}
              </div>
              {visibleCount < filtered.length && (
                <button
                  onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
                  className="mt-3 w-full rounded-lg border border-neutral-200 bg-white py-2.5 text-sm font-medium text-neutral-600 hover:bg-neutral-50"
                >
                  Tải thêm ({filtered.length - visibleCount} còn lại)
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
              Duyệt đủ hồ sơ
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
            <VendorDetailPanel
              vendor={selected}
              onClose={() => setSelectedId(null)}
              kycLevel={kycLevel}
              onKycLevelChange={setKycLevel}
              approveNote={approveNote}
              onApproveNoteChange={setApproveNote}
              rejectReason={rejectReason}
              onRejectReasonChange={setRejectReason}
              suspendReason={suspendReason}
              onSuspendReasonChange={setSuspendReason}
              onApprove={() => handleApprove(selected.id)}
              onReject={() => handleReject(selected.id)}
              onSuspend={() => handleSuspend(selected.id)}
              approving={approveVendor.isPending}
              rejecting={rejectVendorMutation.isPending}
              suspending={suspendVendorMutation.isPending}
            />
          ) : (
            <DetailEmptyHint icon={Store} text="Chọn một hồ sơ bên trái để xem chi tiết và kiểm duyệt" />
          )}
        </div>
      </div>

      {/* Bulk reject modal */}
      {bulkRejectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="font-bold text-neutral-900">Từ chối {selectedIds.size} hồ sơ</h2>
            <p className="mt-1 text-xs text-neutral-500">Lý do sẽ áp dụng cho tất cả hồ sơ đã chọn.</p>
            <textarea
              value={bulkReason}
              onChange={(e) => setBulkReason(e.target.value)}
              rows={3}
              placeholder="VD: Thiếu CCCD mặt sau, thông tin không trùng khớp..."
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
                {bulkRunning ? <Loader2 size={14} className="mx-auto animate-spin" /> : "Xác nhận từ chối"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function VendorRow({
  vendor: v,
  active,
  selectable,
  checked,
  onCheck,
  onClick,
}: {
  vendor: VendorDoc
  active: boolean
  selectable: boolean
  checked: boolean
  onCheck: () => void
  onClick: () => void
}) {
  const missing = getMissingVendorDocuments(v)
  const kycMeta = getKycStatusMeta(v.kyc_status)
  return (
    <div
      onClick={onClick}
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-xl border bg-white p-3 transition-all hover:shadow-sm",
        active ? "border-brand-red-300 ring-2 ring-brand-red-100" : "border-neutral-200"
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
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate text-sm font-semibold text-neutral-900">{v.shop_name}</h3>
          <StatusBadge status={v.status} />
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-neutral-500">
          <span className="truncate">{v.owner_name}</span>
          <span className="rounded bg-neutral-50 px-1.5 py-0.5 text-[10px] text-neutral-400">
            {businessTypeLabel(v.business_type)}
          </span>
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          {v.status === "pending" && <WaitingBadge since={vendorDate(v.created_at)} />}
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
              kycMeta.tone
            )}
          >
            <ShieldCheck size={10} />
            KYC: {getKycStatusLabel(v.kyc_status)}
          </span>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-semibold",
              missing.length === 0
                ? "bg-emerald-50 text-emerald-700"
                : "bg-amber-50 text-amber-700"
            )}
          >
            {missing.length === 0 ? "Đủ hồ sơ" : `Thiếu ${missing.length} mục`}
          </span>
        </div>
      </div>
    </div>
  )
}

function VendorDetailPanel({
  vendor: v,
  onClose,
  kycLevel,
  onKycLevelChange,
  approveNote,
  onApproveNoteChange,
  rejectReason,
  onRejectReasonChange,
  suspendReason,
  onSuspendReasonChange,
  onApprove,
  onReject,
  onSuspend,
  approving,
  rejecting,
  suspending,
}: {
  vendor: VendorDoc
  onClose: () => void
  kycLevel: "basic" | "verified" | "premium"
  onKycLevelChange: (v: "basic" | "verified" | "premium") => void
  approveNote: string
  onApproveNoteChange: (v: string) => void
  rejectReason: string
  onRejectReasonChange: (v: string) => void
  suspendReason: string
  onSuspendReasonChange: (v: string) => void
  onApprove: () => void
  onReject: () => void
  onSuspend: () => void
  approving: boolean
  rejecting: boolean
  suspending: boolean
}) {
  const missing = getMissingVendorDocuments(v)
  return (
    <div className="rounded-xl border border-neutral-200 bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-neutral-100 p-4">
        <div className="flex min-w-0 items-center gap-2">
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-neutral-500 hover:bg-neutral-100 lg:hidden"
            aria-label="Quay lại"
          >
            <ArrowLeft size={18} />
          </button>
          <h3 className="truncate font-semibold text-neutral-900">{v.shop_name}</h3>
          <StatusBadge status={v.status} />
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
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <SectionTitle icon={Store}>Thông tin Shop</SectionTitle>
            <dl className="mt-2 space-y-1 text-sm">
              <DetailRow label="Tên shop" value={v.shop_name} />
              <DetailRow label="Tên pháp lý" value={v.legal_name || "—"} />
              <DetailRow label="Slug" value={v.shop_slug || "—"} />
              <DetailRow label="Mô tả" value={v.description || "—"} />
            </dl>
          </div>

          <div>
            <SectionTitle icon={User}>Người đại diện</SectionTitle>
            <dl className="mt-2 space-y-1 text-sm">
              <DetailRow label="Họ tên" value={v.owner_name} />
              <DetailRow label="Email" value={v.owner_email} />
              <DetailRow label="SĐT" value={v.owner_phone} />
              <DetailRow label="CCCD" value={v.id_card_number || "—"} />
              <DetailRow label="MST" value={v.tax_code || "—"} />
            </dl>
          </div>

          <div>
            <SectionTitle icon={MapPin}>Địa chỉ lấy hàng</SectionTitle>
            <dl className="mt-2 space-y-1 text-sm">
              <DetailRow label="Địa chỉ" value={v.pickup_address?.full_address || "—"} />
              <DetailRow label="Phường/Xã" value={v.pickup_address?.ward || "—"} />
              <DetailRow label="Quận/Huyện" value={v.pickup_address?.district || "—"} />
              <DetailRow label="Tỉnh/TP" value={v.pickup_address?.city || "—"} />
            </dl>
          </div>

          <div>
            <SectionTitle icon={CreditCard}>Tài khoản ngân hàng</SectionTitle>
            <dl className="mt-2 space-y-1 text-sm">
              <DetailRow label="Ngân hàng" value={v.bank_name || "—"} />
              <DetailRow label="Số TK" value={v.bank_account_number || "—"} />
              <DetailRow label="Chủ TK" value={v.bank_account_holder || "—"} />
            </dl>
          </div>

          <div>
            <SectionTitle icon={ShieldCheck}>eKYC</SectionTitle>
            <dl className="mt-2 space-y-1 text-sm">
              <DetailRow label="Trạng thái" value={getKycStatusLabel(v.kyc_status)} />
              <DetailRow label="Provider" value={getKycProviderLabel(v.kyc_provider)} />
              <DetailRow label="Mức KYC" value={getKycLevelLabel(v.kyc_level)} />
              <DetailRow label="Application" value={v.kyc_application_id || "—"} />
              <DetailRow
                label="Xác minh eKYC"
                value={v.kyc_verified_at?.toDate ? v.kyc_verified_at.toDate().toLocaleDateString("vi-VN") : "—"}
              />
            </dl>
            <div className={cn("mt-3 rounded-lg px-3 py-2 text-xs", getKycStatusMeta(v.kyc_status).tone)}>
              {getKycStatusMeta(v.kyc_status).description}
            </div>
          </div>
        </div>

        <VendorLegalChecklist vendor={v} />
        <VendorDocumentLinks vendor={v} />

        {/* Actions */}
        {v.status === "pending" && (
          <div className="mt-6 space-y-4 rounded-lg border border-neutral-100 bg-neutral-50 p-4">
            <h4 className="text-sm font-semibold text-neutral-900">Hành động kiểm duyệt</h4>
            {missing.length > 0 && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                Chưa thể phê duyệt vì còn thiếu:{" "}
                <span className="font-semibold">
                  {missing.map((type) => getVendorDocumentLabel(type)).join(", ")}
                </span>
              </div>
            )}

            <div className="flex flex-wrap items-end gap-3">
              <div className="min-w-[150px] flex-1">
                <label className="text-xs text-neutral-500">Mức KYC</label>
                <select
                  value={kycLevel}
                  onChange={(e) => onKycLevelChange(e.target.value as "basic" | "verified" | "premium")}
                  className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-1.5 text-sm"
                >
                  <option value="basic">Basic</option>
                  <option value="verified">Verified</option>
                  <option value="premium">Premium</option>
                </select>
              </div>
              <div className="min-w-[200px] flex-[2]">
                <label className="text-xs text-neutral-500">Ghi chú (tuỳ chọn)</label>
                <input
                  type="text"
                  value={approveNote}
                  onChange={(e) => onApproveNoteChange(e.target.value)}
                  placeholder="Ghi chú phê duyệt..."
                  className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-1.5 text-sm"
                />
              </div>
              <button
                onClick={onApprove}
                disabled={approving || missing.length > 0}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                {approving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                Phê duyệt
              </button>
            </div>

            <div className="border-t border-neutral-200" />

            <div>
              <label className="text-xs text-neutral-500">
                Lý do từ chối <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => onRejectReasonChange(e.target.value)}
                rows={2}
                placeholder="VD: Thiếu CCCD mặt sau, thông tin không trùng khớp..."
                className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-1.5 text-sm"
              />
              <button
                onClick={onReject}
                disabled={rejecting}
                className="mt-2 flex items-center gap-1.5 rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50"
              >
                {rejecting ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                Từ chối
              </button>
            </div>
          </div>
        )}

        {v.status === "active" && (
          <div className="mt-6 space-y-3 rounded-lg border border-orange-100 bg-orange-50 p-4">
            <h4 className="text-sm font-semibold text-orange-900">Tạm khoá shop</h4>
            <label className="text-xs text-neutral-500">
              Lý do tạm khoá <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={suspendReason}
              onChange={(e) => onSuspendReasonChange(e.target.value)}
              rows={2}
              placeholder="VD: Vi phạm chính sách, bán hàng giả..."
              className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-1.5 text-sm"
            />
            <button
              onClick={onSuspend}
              disabled={suspending}
              className="flex items-center gap-1.5 rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-50"
            >
              {suspending ? <Loader2 size={14} className="animate-spin" /> : <Ban size={14} />}
              Tạm khoá
            </button>
          </div>
        )}

        {v.rejected_reason && (
          <div className="mt-4 rounded-lg border border-rose-100 bg-rose-50 p-3">
            <p className="text-xs font-semibold text-rose-700">Lý do từ chối/khoá:</p>
            <p className="mt-0.5 text-sm text-rose-600">{v.rejected_reason}</p>
          </div>
        )}
      </div>
    </div>
  )
}

function VendorLegalChecklist({ vendor }: { vendor: VendorDoc }) {
  const requiredDocuments = getRequiredVendorDocumentTypes(vendor)
  const missingDocuments = getMissingVendorDocuments(vendor)
  return (
    <div className="mt-4 rounded-lg border border-neutral-200 bg-neutral-50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <SectionTitle icon={FileText}>Checklist hồ sơ pháp lý</SectionTitle>
        {missingDocuments.length === 0 ? (
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
            Đủ hồ sơ
          </span>
        ) : (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
            Thiếu {missingDocuments.length} mục
          </span>
        )}
      </div>
      <dl className="mt-2 text-sm">
        <DetailRow label="Hàng đặc thù" value={formatSpecialGoods(vendor)} />
      </dl>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {requiredDocuments.map((type) => {
          const uploaded = hasVendorDocument(vendor.documents, type)
          return (
            <div
              key={type}
              className={cn(
                "flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-xs",
                uploaded
                  ? "border-emerald-200 bg-white text-emerald-700"
                  : "border-amber-200 bg-amber-50 text-amber-800"
              )}
            >
              <span className="font-medium">{getVendorDocumentLabel(type)}</span>
              <span className="shrink-0 text-[10px] font-semibold">{uploaded ? "Đã có" : "Thiếu"}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function VendorDocumentLinks({ vendor }: { vendor: VendorDoc }) {
  const documents = vendor.documents ?? []
  return (
    <div className="mt-4">
      <SectionTitle icon={FileText}>Tài liệu đính kèm</SectionTitle>
      {documents.length === 0 ? (
        <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Chưa có file tài liệu trong hồ sơ.
        </p>
      ) : (
        <div className="mt-2 flex flex-wrap gap-3">
          {documents.map((doc, i) => (
            <a
              key={`${doc.type}-${doc.file_url}-${i}`}
              href={doc.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex max-w-xs items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-2 text-xs text-neutral-600 hover:border-brand-red-300 hover:text-brand-red-600"
            >
              <ExternalLink size={12} className="shrink-0" />
              <span className="truncate">
                {getVendorDocumentLabel(doc.type)}
                {doc.file_name ? ` - ${doc.file_name}` : ""}
              </span>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

function formatSpecialGoods(vendor: VendorDoc) {
  if (!vendor.requires_special_license) return "Không khai báo"
  const labels = (vendor.special_goods_types ?? []).map((type) => SPECIAL_GOODS_LABELS[type] ?? type)
  const goods = labels.length > 0 ? labels.join(", ") : "Có hàng cần giấy phép con"
  return vendor.special_goods_note ? `${goods} - ${vendor.special_goods_note}` : goods
}

function StatusBadge({ status }: { status: VendorDoc["status"] }) {
  const map: Record<string, { text: string; cls: string }> = {
    pending: { text: "Chờ duyệt", cls: "bg-amber-100 text-amber-700" },
    active: { text: "Hoạt động", cls: "bg-emerald-100 text-emerald-700" },
    rejected: { text: "Từ chối", cls: "bg-rose-100 text-rose-700" },
    suspended: { text: "Tạm khoá", cls: "bg-orange-100 text-orange-700" },
  }
  const m = map[status] ?? { text: status, cls: "bg-neutral-100 text-neutral-600" }
  return (
    <span className={cn("inline-flex shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold", m.cls)}>
      {m.text}
    </span>
  )
}

function SectionTitle({ icon: Icon, children }: { icon: typeof Store; children: React.ReactNode }) {
  return (
    <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase text-neutral-700">
      <Icon size={12} /> {children}
    </h4>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <dt className="w-24 shrink-0 text-neutral-500">{label}</dt>
      <dd className="break-all font-medium text-neutral-900">{value}</dd>
    </div>
  )
}
