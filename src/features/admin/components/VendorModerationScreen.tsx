import { useState } from "react"
import {
  Search,
  CheckCircle2,
  XCircle,
  Ban,
  Eye,
  ChevronDown,
  Loader2,
  ExternalLink,
  FileText,
  User,
  Store,
  CreditCard,
  MapPin,
  AlertTriangle,
  RefreshCw,
} from "lucide-react"
import toast from "react-hot-toast"
import { cn } from "../../../lib/cn"
import {
  useModerationVendors,
  useApproveVendor,
  useRejectVendor,
  useSuspendVendor,
} from "../../../hooks/use-moderation"
import type { VendorDoc } from "../../../lib/vendor-service"

type StatusFilter = "pending" | "active" | "rejected" | "suspended" | undefined

const STATUS_TABS: { value: StatusFilter; label: string; color: string }[] = [
  { value: undefined, label: "Tất cả", color: "text-neutral-700" },
  { value: "pending", label: "Chờ duyệt", color: "text-amber-600" },
  { value: "active", label: "Hoạt động", color: "text-emerald-600" },
  { value: "rejected", label: "Đã từ chối", color: "text-rose-600" },
  { value: "suspended", label: "Tạm khoá", color: "text-orange-600" },
]

export function VendorModerationScreen() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending")
  const [search, setSearch] = useState("")
  const [selectedVendor, setSelectedVendor] = useState<VendorDoc | null>(null)
  const [rejectReason, setRejectReason] = useState("")
  const [suspendReason, setSuspendReason] = useState("")
  const [kycLevel, setKycLevel] = useState<"basic" | "verified" | "premium">("verified")
  const [approveNote, setApproveNote] = useState("")

  const vendors = useModerationVendors({
    status: statusFilter,
    q: search || undefined,
    limit: 50,
  })

  const approveVendor = useApproveVendor()
  const rejectVendorMutation = useRejectVendor()
  const suspendVendorMutation = useSuspendVendor()

  async function handleApprove(vendorId: string) {
    try {
      await approveVendor.mutateAsync({
        id: vendorId,
        note: approveNote || undefined,
        kyc_level: kycLevel,
      })
      toast.success("Đã phê duyệt seller thành công!")
      setSelectedVendor(null)
      setApproveNote("")
    } catch {
      toast.error("Phê duyệt thất bại")
    }
  }

  async function handleReject(vendorId: string) {
    if (!rejectReason.trim()) {
      toast.error("Vui lòng nhập lý do từ chối")
      return
    }
    try {
      await rejectVendorMutation.mutateAsync({
        id: vendorId,
        reason: rejectReason,
      })
      toast.success("Đã từ chối hồ sơ")
      setSelectedVendor(null)
      setRejectReason("")
    } catch {
      toast.error("Từ chối thất bại")
    }
  }

  async function handleSuspend(vendorId: string) {
    if (!suspendReason.trim()) {
      toast.error("Vui lòng nhập lý do tạm khoá")
      return
    }
    try {
      await suspendVendorMutation.mutateAsync({
        id: vendorId,
        reason: suspendReason,
      })
      toast.success("Đã tạm khoá shop")
      setSelectedVendor(null)
      setSuspendReason("")
    } catch {
      toast.error("Tạm khoá thất bại")
    }
  }

  const statusBadge = (status: VendorDoc["status"]) => {
    const map: Record<string, { text: string; cls: string }> = {
      pending: { text: "Chờ duyệt", cls: "bg-amber-100 text-amber-700" },
      active: { text: "Hoạt động", cls: "bg-emerald-100 text-emerald-700" },
      rejected: { text: "Từ chối", cls: "bg-rose-100 text-rose-700" },
      suspended: { text: "Tạm khoá", cls: "bg-orange-100 text-orange-700" },
    }
    const m = map[status] ?? { text: status, cls: "bg-neutral-100 text-neutral-600" }
    return (
      <span className={cn("inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold", m.cls)}>
        {m.text}
      </span>
    )
  }

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-neutral-900">Duyệt Seller</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Xem xét và phê duyệt hồ sơ đăng ký bán hàng
      </p>

      {/* Filters */}
      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1 overflow-x-auto">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.label}
              onClick={() => setStatusFilter(tab.value)}
              className={cn(
                "whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                statusFilter === tab.value
                  ? "bg-brand-red-50 text-brand-red-700"
                  : "text-neutral-600 hover:bg-neutral-100"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên shop, email..."
            className="rounded-lg border border-neutral-200 py-2 pl-9 pr-4 text-sm outline-none focus:border-brand-red-300 focus:ring-1 focus:ring-brand-red-200"
          />
        </div>
      </div>

      {/* Vendor list */}
      <div className="mt-6">
        {vendors.isLoading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="animate-spin text-brand-red-500" size={28} />
          </div>
        )}

        {vendors.isError && (
          <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4">
            <AlertTriangle className="mt-0.5 shrink-0 text-rose-600" size={18} />
            <div className="flex-1">
              <p className="text-sm font-semibold text-rose-900">
                Không thể tải hồ sơ seller
              </p>
              <p className="mt-1 text-xs text-rose-700">
                {vendors.error instanceof Error
                  ? vendors.error.message
                  : "Vui lòng kiểm tra quyền admin/moderator hoặc cấu hình Firestore."}
              </p>
              <button
                onClick={() => vendors.refetch()}
                className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-rose-300 bg-white px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-100"
              >
                <RefreshCw size={12} />
                Thử lại
              </button>
            </div>
          </div>
        )}

        {!vendors.isError && vendors.data && vendors.data.vendors.length === 0 && (
          <div className="rounded-xl border border-neutral-200 bg-white py-16 text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-neutral-100 flex items-center justify-center">
              <Store className="text-neutral-400" size={20} />
            </div>
            <p className="mt-3 text-sm text-neutral-500">Không có hồ sơ nào</p>
          </div>
        )}

        {vendors.data && vendors.data.vendors.length > 0 && (
          <div className="space-y-3">
            {vendors.data.vendors.map((v) => (
              <div
                key={v.id}
                className={cn(
                  "rounded-xl border bg-white p-4 transition-shadow hover:shadow-sm",
                  selectedVendor?.id === v.id
                    ? "border-brand-red-300 ring-2 ring-brand-red-100"
                    : "border-neutral-200"
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-neutral-900 truncate">
                        {v.shop_name}
                      </h3>
                      {statusBadge(v.status)}
                      <span className="text-[10px] text-neutral-400 bg-neutral-50 px-1.5 py-0.5 rounded">
                        {v.business_type === "individual"
                          ? "Cá nhân"
                          : v.business_type === "household"
                          ? "Hộ KD"
                          : "Doanh nghiệp"}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-neutral-500">
                      <span>{v.owner_name}</span>
                      <span>{v.owner_email}</span>
                      <span>{v.owner_phone}</span>
                      {v.created_at && (
                        <span>
                          Đăng ký:{" "}
                          {v.created_at.toDate
                            ? v.created_at.toDate().toLocaleDateString("vi-VN")
                            : ""}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      setSelectedVendor(selectedVendor?.id === v.id ? null : v)
                    }
                    className="flex items-center gap-1 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs text-neutral-600 hover:bg-neutral-50"
                  >
                    <Eye size={12} />
                    Chi tiết
                    <ChevronDown
                      size={12}
                      className={cn(
                        "transition-transform",
                        selectedVendor?.id === v.id && "rotate-180"
                      )}
                    />
                  </button>
                </div>

                {/* Expanded detail */}
                {selectedVendor?.id === v.id && (
                  <div className="mt-4 border-t border-neutral-100 pt-4">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      {/* Shop info */}
                      <div>
                        <h4 className="flex items-center gap-1.5 text-xs font-bold text-neutral-700 uppercase">
                          <Store size={12} /> Thông tin Shop
                        </h4>
                        <dl className="mt-2 space-y-1 text-sm">
                          <DetailRow label="Tên shop" value={v.shop_name} />
                          <DetailRow label="Slug" value={v.shop_slug || "—"} />
                          <DetailRow label="Mô tả" value={v.description || "—"} />
                        </dl>
                      </div>

                      {/* Owner info */}
                      <div>
                        <h4 className="flex items-center gap-1.5 text-xs font-bold text-neutral-700 uppercase">
                          <User size={12} /> Người đại diện
                        </h4>
                        <dl className="mt-2 space-y-1 text-sm">
                          <DetailRow label="Họ tên" value={v.owner_name} />
                          <DetailRow label="Email" value={v.owner_email} />
                          <DetailRow label="SĐT" value={v.owner_phone} />
                          <DetailRow label="CCCD" value={v.id_card_number || "—"} />
                          <DetailRow label="MST" value={v.tax_code || "—"} />
                        </dl>
                      </div>

                      {/* Address */}
                      <div>
                        <h4 className="flex items-center gap-1.5 text-xs font-bold text-neutral-700 uppercase">
                          <MapPin size={12} /> Địa chỉ lấy hàng
                        </h4>
                        <dl className="mt-2 space-y-1 text-sm">
                          <DetailRow
                            label="Địa chỉ"
                            value={v.pickup_address?.full_address || "—"}
                          />
                          <DetailRow label="Phường/Xã" value={v.pickup_address?.ward || "—"} />
                          <DetailRow label="Quận/Huyện" value={v.pickup_address?.district || "—"} />
                          <DetailRow label="Tỉnh/TP" value={v.pickup_address?.city || "—"} />
                        </dl>
                      </div>

                      {/* Bank */}
                      <div>
                        <h4 className="flex items-center gap-1.5 text-xs font-bold text-neutral-700 uppercase">
                          <CreditCard size={12} /> Tài khoản ngân hàng
                        </h4>
                        <dl className="mt-2 space-y-1 text-sm">
                          <DetailRow label="Ngân hàng" value={v.bank_name || "—"} />
                          <DetailRow label="Số TK" value={v.bank_account_number || "—"} />
                          <DetailRow label="Chủ TK" value={v.bank_account_holder || "—"} />
                        </dl>
                      </div>
                    </div>

                    {/* Documents */}
                    {v.documents && v.documents.length > 0 && (
                      <div className="mt-4">
                        <h4 className="flex items-center gap-1.5 text-xs font-bold text-neutral-700 uppercase">
                          <FileText size={12} /> Tài liệu đính kèm
                        </h4>
                        <div className="mt-2 flex flex-wrap gap-3">
                          {v.documents.map((doc, i) => (
                            <a
                              key={i}
                              href={doc.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-2 text-xs text-neutral-600 hover:border-brand-red-300 hover:text-brand-red-600"
                            >
                              <ExternalLink size={12} />
                              {doc.type === "id_card_front"
                                ? "CCCD mặt trước"
                                : doc.type === "id_card_back"
                                ? "CCCD mặt sau"
                                : doc.type === "business_license"
                                ? "Giấy phép KD"
                                : doc.file_name || doc.type}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    {v.status === "pending" && (
                      <div className="mt-6 space-y-4 rounded-lg border border-neutral-100 bg-neutral-50 p-4">
                        <h4 className="text-sm font-semibold text-neutral-900">
                          Hành động kiểm duyệt
                        </h4>

                        {/* Approve */}
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-end gap-3">
                            <div className="flex-1 min-w-[150px]">
                              <label className="text-xs text-neutral-500">Mức KYC</label>
                              <select
                                value={kycLevel}
                                onChange={(e) =>
                                  setKycLevel(
                                    e.target.value as "basic" | "verified" | "premium"
                                  )
                                }
                                className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-1.5 text-sm"
                              >
                                <option value="basic">Basic</option>
                                <option value="verified">Verified</option>
                                <option value="premium">Premium</option>
                              </select>
                            </div>
                            <div className="flex-[2] min-w-[200px]">
                              <label className="text-xs text-neutral-500">Ghi chú (tuỳ chọn)</label>
                              <input
                                type="text"
                                value={approveNote}
                                onChange={(e) => setApproveNote(e.target.value)}
                                placeholder="Ghi chú phê duyệt..."
                                className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-1.5 text-sm"
                              />
                            </div>
                            <button
                              onClick={() => handleApprove(v.id)}
                              disabled={approveVendor.isPending}
                              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                            >
                              {approveVendor.isPending ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <CheckCircle2 size={14} />
                              )}
                              Phê duyệt
                            </button>
                          </div>
                        </div>

                        <div className="border-t border-neutral-200" />

                        {/* Reject */}
                        <div className="flex flex-wrap items-end gap-3">
                          <div className="flex-1 min-w-[250px]">
                            <label className="text-xs text-neutral-500">
                              Lý do từ chối <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={rejectReason}
                              onChange={(e) => setRejectReason(e.target.value)}
                              placeholder="VD: Thiếu CCCD mặt sau, thông tin không trùng khớp..."
                              className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-1.5 text-sm"
                            />
                          </div>
                          <button
                            onClick={() => handleReject(v.id)}
                            disabled={rejectVendorMutation.isPending}
                            className="flex items-center gap-1.5 rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50"
                          >
                            {rejectVendorMutation.isPending ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <XCircle size={14} />
                            )}
                            Từ chối
                          </button>
                        </div>
                      </div>
                    )}

                    {v.status === "active" && (
                      <div className="mt-6 space-y-3 rounded-lg border border-orange-100 bg-orange-50 p-4">
                        <h4 className="text-sm font-semibold text-orange-900">Tạm khoá shop</h4>
                        <div className="flex flex-wrap items-end gap-3">
                          <div className="flex-1 min-w-[250px]">
                            <label className="text-xs text-neutral-500">
                              Lý do tạm khoá <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={suspendReason}
                              onChange={(e) => setSuspendReason(e.target.value)}
                              placeholder="VD: Vi phạm chính sách, bán hàng giả..."
                              className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-1.5 text-sm"
                            />
                          </div>
                          <button
                            onClick={() => handleSuspend(v.id)}
                            disabled={suspendVendorMutation.isPending}
                            className="flex items-center gap-1.5 rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-50"
                          >
                            {suspendVendorMutation.isPending ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <Ban size={14} />
                            )}
                            Tạm khoá
                          </button>
                        </div>
                      </div>
                    )}

                    {v.rejected_reason && (
                      <div className="mt-4 rounded-lg border border-rose-100 bg-rose-50 p-3">
                        <p className="text-xs font-semibold text-rose-700">Lý do từ chối/khoá:</p>
                        <p className="mt-0.5 text-sm text-rose-600">{v.rejected_reason}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <dt className="w-24 shrink-0 text-neutral-500">{label}</dt>
      <dd className="font-medium text-neutral-900 break-all">{value}</dd>
    </div>
  )
}
