import { useState } from "react"
import {
  AlertCircle,
  Check,
  ChevronDown,
  Globe,
  Loader2,
  Megaphone,
  Percent,
  Plus,
  Target,
  Trash2,
  Users,
  X,
} from "lucide-react"
import toast from "react-hot-toast"
import { cn } from "../../../lib/cn"
import { formatCurrency } from "../../../lib/format"
import { sanitizeUserError } from "../../../lib/error-utils"
import { useMyVendor } from "../../../hooks/use-vendor"
import { useSellerProducts } from "../../../hooks/use-products"
import {
  useShopAffiliatePlans,
  useCreateAffiliatePlan,
  useUpdateAffiliatePlan,
  useDeleteAffiliatePlan,
  usePlanApplications,
  useReviewApplication,
  type AffiliatePlan,
} from "../../../hooks/use-affiliate-plans"
import type { CreatePlanInput, AffiliatePlanProductSnapshot } from "../../../lib/affiliate-plan-service"

const PLAN_STATUS_BADGE: Record<string, { label: string; color: string }> = {
  active: { label: "Hoạt động", color: "bg-emerald-100 text-emerald-700" },
  paused: { label: "Tạm dừng", color: "bg-neutral-100 text-neutral-600" },
  expired: { label: "Hết hạn", color: "bg-rose-100 text-rose-700" },
  draft: { label: "Bản nháp", color: "bg-amber-100 text-amber-700" },
}

export default function SellerAffiliatePlansScreen() {
  const vendorQuery = useMyVendor()
  const vendor = vendorQuery.data?.vendor ?? null
  const shopId = vendor?.firebase_uid ?? null
  const plansQuery = useShopAffiliatePlans(shopId)
  const plans = plansQuery.data?.plans ?? []
  const [showCreate, setShowCreate] = useState(false)
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)

  if (vendorQuery.isLoading || plansQuery.isLoading) {
    return (
      <div className="flex items-center justify-center p-12 text-sm text-neutral-500">
        <Loader2 size={16} className="mr-2 animate-spin" />
        Đang tải kế hoạch affiliate...
      </div>
    )
  }

  if (!vendor || !shopId) {
    return (
      <div className="p-4 lg:p-8">
        <div className="card flex flex-col items-center py-16 text-center">
          <AlertCircle size={48} className="text-amber-500" />
          <h2 className="mt-3 text-lg font-bold">Chưa có hồ sơ shop</h2>
          <p className="mt-1 max-w-md text-sm text-neutral-500">
            Vui lòng hoàn tất đăng ký seller trước.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-red-600">
            Affiliate Marketing
          </p>
          <h1 className="mt-1 text-2xl font-bold text-neutral-900 lg:text-3xl">
            Kế hoạch Affiliate
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Tạo kế hoạch để Creator quảng bá sản phẩm của bạn, giống TikTok Shop Affiliate.
          </p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary">
          <Plus size={16} /> Tạo kế hoạch
        </button>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatBox label="Tổng kế hoạch" value={plans.length} icon={Megaphone} />
        <StatBox
          label="Đang hoạt động"
          value={plans.filter((p) => p.status === "active").length}
          icon={Check}
          color="emerald"
        />
        <StatBox
          label="Tổng Creator"
          value={plans.reduce((s, p) => s + p.approvedCount, 0)}
          icon={Users}
          color="blue"
        />
        <StatBox
          label="Tổng hoa hồng đã chi"
          value={formatCurrency(plans.reduce((s, p) => s + p.totalCommission, 0))}
          icon={Percent}
          color="gold"
        />
      </div>

      {/* Plans list */}
      {plans.length === 0 ? (
        <div className="card flex flex-col items-center py-16 text-center">
          <Megaphone size={48} className="text-neutral-300" />
          <h3 className="mt-3 text-base font-bold text-neutral-900">
            Chưa có kế hoạch affiliate
          </h3>
          <p className="mt-1 max-w-md text-sm text-neutral-500">
            Tạo kế hoạch Open (mọi Creator đều có thể tham gia) hoặc Targeted (chỉ mời Creator cụ thể).
          </p>
          <button onClick={() => setShowCreate(true)} className="btn-primary mt-5">
            <Plus size={16} /> Tạo kế hoạch đầu tiên
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isSelected={selectedPlanId === plan.id}
              onSelect={() => setSelectedPlanId(selectedPlanId === plan.id ? null : plan.id)}
            />
          ))}
        </div>
      )}

      {/* Applications panel */}
      {selectedPlanId && (
        <ApplicationsPanel
          planId={selectedPlanId}
          onClose={() => setSelectedPlanId(null)}
        />
      )}

      {/* Create modal */}
      {showCreate && vendor && shopId && (
        <CreatePlanModal
          shopId={shopId}
          shopName={vendor.shop_name}
          shopLogo={vendor.shop_logo}
          onClose={() => setShowCreate(false)}
        />
      )}
    </div>
  )
}

// ─── Sub-components ──────────────────────────────────────────────────

function StatBox({
  label,
  value,
  icon: Icon,
  color = "red",
}: {
  label: string
  value: string | number
  icon: any
  color?: string
}) {
  const colors: Record<string, string> = {
    red: "bg-brand-red-50 text-brand-red-700",
    emerald: "bg-emerald-50 text-emerald-700",
    blue: "bg-blue-50 text-blue-700",
    gold: "bg-brand-gold-50 text-brand-gold-700",
  }
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4">
      <div className={cn("mb-2 inline-flex rounded-lg p-2", colors[color])}>
        <Icon size={18} />
      </div>
      <div className="text-2xl font-bold text-neutral-900">{value}</div>
      <div className="text-xs text-neutral-500">{label}</div>
    </div>
  )
}

function PlanCard({
  plan,
  isSelected,
  onSelect,
}: {
  plan: AffiliatePlan
  isSelected: boolean
  onSelect: () => void
}) {
  const updatePlan = useUpdateAffiliatePlan()
  const deletePlan = useDeleteAffiliatePlan()
  const badge = PLAN_STATUS_BADGE[plan.status] ?? PLAN_STATUS_BADGE.draft

  async function toggleStatus() {
    const newStatus = plan.status === "active" ? "paused" : "active"
    try {
      await updatePlan.mutateAsync({ planId: plan.id, status: newStatus })
      toast.success(newStatus === "active" ? "Đã kích hoạt" : "Đã tạm dừng")
    } catch (err) {
      toast.error(sanitizeUserError(err, "Không thể cập nhật"))
    }
  }

  async function handleDelete() {
    if (!confirm("Bạn chắc chắn muốn xóa kế hoạch này?")) return
    try {
      await deletePlan.mutateAsync(plan.id)
      toast.success("Đã xóa kế hoạch")
    } catch (err) {
      toast.error(sanitizeUserError(err, "Không thể xóa"))
    }
  }

  return (
    <div className={cn("card overflow-hidden transition-shadow", isSelected && "ring-2 ring-brand-red-400")}>
      <div className="flex flex-wrap items-start justify-between gap-3 p-4">
        <div className="flex items-start gap-3">
          <div className={cn(
            "rounded-lg p-2",
            plan.type === "open" ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700"
          )}>
            {plan.type === "open" ? <Globe size={20} /> : <Target size={20} />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-neutral-900">{plan.title}</h3>
              <span className={cn("rounded-md px-1.5 py-0.5 text-[10px] font-semibold", badge.color)}>
                {badge.label}
              </span>
              <span className="rounded-md bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-neutral-600">
                {plan.type === "open" ? "Open" : "Targeted"}
              </span>
            </div>
            {plan.description && (
              <p className="mt-1 text-sm text-neutral-500 line-clamp-1">{plan.description}</p>
            )}
            <div className="mt-2 flex flex-wrap gap-3 text-xs text-neutral-500">
              <span className="font-semibold text-brand-red-600">
                {(plan.commissionBps / 100).toFixed(1)}% hoa hồng
              </span>
              <span>{plan.applicantCount} đăng ký</span>
              <span>{plan.approvedCount} Creator</span>
              <span>{plan.totalClicks} clicks</span>
              <span>{plan.totalConversions} đơn</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleStatus}
            disabled={updatePlan.isPending}
            className="btn-secondary text-xs"
          >
            {plan.status === "active" ? "Tạm dừng" : "Kích hoạt"}
          </button>
          <button
            onClick={onSelect}
            className="btn-secondary text-xs"
          >
            <Users size={14} /> Đơn đăng ký
            <ChevronDown size={12} className={cn("transition-transform", isSelected && "rotate-180")} />
          </button>
          <button
            onClick={handleDelete}
            disabled={deletePlan.isPending}
            className="rounded p-1.5 text-neutral-400 hover:bg-rose-50 hover:text-rose-600"
            aria-label="Xóa"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Product snapshots */}
      {plan.productSnapshots.length > 0 && (
        <div className="flex gap-2 overflow-x-auto border-t border-neutral-100 bg-neutral-50 px-4 py-3">
          {plan.productSnapshots.map((p) => (
            <div key={p.id} className="flex shrink-0 items-center gap-2 rounded-lg border border-neutral-200 bg-white px-2 py-1.5">
              <img src={p.thumbnail} alt="" className="h-8 w-8 rounded object-cover" />
              <div className="min-w-0">
                <div className="truncate text-xs font-medium text-neutral-900" style={{ maxWidth: 120 }}>{p.name}</div>
                <div className="text-[10px] text-neutral-500">{formatCurrency(p.price)}</div>
              </div>
            </div>
          ))}
          {plan.productIds.length > plan.productSnapshots.length && (
            <div className="flex shrink-0 items-center text-xs text-neutral-400">
              +{plan.productIds.length - plan.productSnapshots.length} SP
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ApplicationsPanel({ planId, onClose }: { planId: string; onClose: () => void }) {
  const appsQuery = usePlanApplications(planId)
  const reviewApp = useReviewApplication()
  const apps = appsQuery.data?.applications ?? []

  async function handleReview(appId: string, decision: "approved" | "rejected") {
    try {
      await reviewApp.mutateAsync({ applicationId: appId, decision })
      toast.success(decision === "approved" ? "Đã duyệt Creator" : "Đã từ chối")
    } catch (err) {
      toast.error(sanitizeUserError(err, "Không thể xử lý"))
    }
  }

  return (
    <div className="card mt-3 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-neutral-900">
          Đơn đăng ký Creator ({apps.length})
        </h3>
        <button onClick={onClose} className="rounded p-1 hover:bg-neutral-100">
          <X size={16} />
        </button>
      </div>

      {appsQuery.isLoading ? (
        <div className="flex items-center gap-2 py-6 text-sm text-neutral-500">
          <Loader2 size={14} className="animate-spin" /> Đang tải...
        </div>
      ) : apps.length === 0 ? (
        <div className="py-6 text-center text-sm text-neutral-500">
          Chưa có Creator nào đăng ký kế hoạch này.
        </div>
      ) : (
        <div className="divide-y divide-neutral-100">
          {apps.map((app) => (
            <div key={app.id} className="flex items-center justify-between gap-3 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-red-100 text-sm font-bold text-brand-red-700">
                  {app.creatorAvatar ? (
                    <img src={app.creatorAvatar} alt="" className="h-full w-full rounded-full object-cover" />
                  ) : (
                    app.creatorName[0]?.toUpperCase() ?? "C"
                  )}
                </div>
                <div>
                  <div className="text-sm font-semibold text-neutral-900">{app.creatorName}</div>
                  {app.note && <div className="text-xs text-neutral-500">{app.note}</div>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {app.status === "pending" ? (
                  <>
                    <button
                      onClick={() => handleReview(app.id, "approved")}
                      disabled={reviewApp.isPending}
                      className="rounded-lg bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-200"
                    >
                      <Check size={12} className="mr-1 inline" /> Duyệt
                    </button>
                    <button
                      onClick={() => handleReview(app.id, "rejected")}
                      disabled={reviewApp.isPending}
                      className="rounded-lg bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-200"
                    >
                      <X size={12} className="mr-1 inline" /> Từ chối
                    </button>
                  </>
                ) : (
                  <span className={cn(
                    "rounded-md px-2 py-0.5 text-[10px] font-semibold",
                    app.status === "approved"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-rose-100 text-rose-700"
                  )}>
                    {app.status === "approved" ? "Đã duyệt" : "Đã từ chối"}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function CreatePlanModal({
  shopId,
  shopName,
  shopLogo,
  onClose,
}: {
  shopId: string
  shopName: string
  shopLogo?: string
  onClose: () => void
}) {
  const createPlan = useCreateAffiliatePlan()
  const approvedProducts = useSellerProducts({ status: "approved", limit: 100 })
  const products = approvedProducts.data?.products ?? []

  const [type, setType] = useState<"open" | "targeted">("open")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [commissionPercent, setCommissionPercent] = useState(5)
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set())

  function toggleProduct(id: string) {
    setSelectedProductIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function handleCreate() {
    if (!title.trim()) {
      toast.error("Vui lòng nhập tên kế hoạch")
      return
    }

    const productIds = Array.from(selectedProductIds)
    const snapshots: AffiliatePlanProductSnapshot[] = products
      .filter((p) => productIds.includes(p.id))
      .slice(0, 8)
      .map((p) => ({
        id: p.id,
        name: p.title || "",
        thumbnail: p.thumbnail || p.images?.[0] || "",
        price: p.basePrice || 0,
      }))

    const input: CreatePlanInput = {
      shopId,
      shopName,
      shopLogo,
      type,
      commissionBps: Math.round(commissionPercent * 100),
      title: title.trim(),
      description: description.trim() || undefined,
      productIds,
      productSnapshots: snapshots,
    }

    try {
      await createPlan.mutateAsync(input)
      toast.success("Đã tạo kế hoạch affiliate")
      onClose()
    } catch (err) {
      toast.error(sanitizeUserError(err, "Không thể tạo kế hoạch"))
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 md:items-center" onClick={onClose}>
      <div
        className="w-full max-w-lg animate-slide-up rounded-lg bg-white shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-neutral-200 p-5">
          <h3 className="text-lg font-bold text-neutral-900">Tạo kế hoạch Affiliate</h3>
          <p className="mt-1 text-sm text-neutral-500">
            Giống TikTok Shop — Creator sẽ quảng bá sản phẩm của bạn và nhận hoa hồng.
          </p>
        </div>

        <div className="space-y-5 p-5">
          {/* Plan type */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-neutral-900">Loại kế hoạch</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setType("open")}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-lg border-2 p-3 text-center transition-colors",
                  type === "open"
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-neutral-200 hover:border-neutral-300"
                )}
              >
                <Globe size={20} className={type === "open" ? "text-emerald-600" : "text-neutral-400"} />
                <span className="text-sm font-semibold">Open</span>
                <span className="text-[10px] text-neutral-500">Mọi Creator tham gia</span>
              </button>
              <button
                onClick={() => setType("targeted")}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-lg border-2 p-3 text-center transition-colors",
                  type === "targeted"
                    ? "border-blue-500 bg-blue-50"
                    : "border-neutral-200 hover:border-neutral-300"
                )}
              >
                <Target size={20} className={type === "targeted" ? "text-blue-600" : "text-neutral-400"} />
                <span className="text-sm font-semibold">Targeted</span>
                <span className="text-[10px] text-neutral-500">Chờ Shop duyệt</span>
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="mb-1 block text-sm font-semibold text-neutral-900">Tên kế hoạch</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: Hoa hồng 10% - Mỹ phẩm chính hãng"
              className="input"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-1 block text-sm font-semibold text-neutral-900">Mô tả (tuỳ chọn)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Điều kiện, yêu cầu cho Creator..."
              className="input min-h-[60px] resize-none"
              rows={2}
            />
          </div>

          {/* Commission */}
          <div>
            <label className="mb-1 block text-sm font-semibold text-neutral-900">
              Hoa hồng cho Creator
            </label>
            <div className="flex items-end gap-2">
              <input
                type="number"
                min={0}
                max={50}
                step={0.5}
                value={commissionPercent}
                onChange={(e) => setCommissionPercent(Math.max(0, Math.min(50, Number(e.target.value))))}
                className="input w-24 text-lg font-bold"
              />
              <span className="pb-2 text-sm font-semibold text-neutral-500">%</span>
            </div>
            <input
              type="range"
              min={0}
              max={50}
              step={0.5}
              value={commissionPercent}
              onChange={(e) => setCommissionPercent(Number(e.target.value))}
              className="mt-2 w-full accent-red-600"
            />
          </div>

          {/* Product selection */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-neutral-900">
              Chọn sản phẩm ({selectedProductIds.size} đã chọn)
            </label>
            <p className="mb-2 text-xs text-neutral-500">
              Để trống = tất cả sản phẩm đã duyệt của shop.
            </p>
            <div className="max-h-48 overflow-y-auto rounded-lg border border-neutral-200">
              {products.length === 0 ? (
                <div className="p-4 text-center text-xs text-neutral-500">
                  Chưa có sản phẩm đã duyệt
                </div>
              ) : (
                products.map((p) => {
                  const checked = selectedProductIds.has(p.id)
                  return (
                    <button
                      key={p.id}
                      onClick={() => toggleProduct(p.id)}
                      className={cn(
                        "flex w-full items-center gap-3 border-b border-neutral-100 px-3 py-2 text-left last:border-0 hover:bg-neutral-50",
                        checked && "bg-brand-red-50"
                      )}
                    >
                      <div className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded border-2",
                        checked ? "border-brand-red-500 bg-brand-red-500" : "border-neutral-300"
                      )}>
                        {checked && <Check size={12} className="text-white" />}
                      </div>
                      <img
                        src={p.thumbnail || p.images?.[0] || ""}
                        alt=""
                        className="h-8 w-8 rounded object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium text-neutral-900">
                          {p.title}
                        </div>
                        <div className="text-xs text-neutral-500">{formatCurrency(p.basePrice)}</div>
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2 border-t border-neutral-200 p-5">
          <button onClick={onClose} className="btn-secondary flex-1 justify-center">
            Huỷ
          </button>
          <button
            onClick={handleCreate}
            disabled={createPlan.isPending}
            className="btn-primary flex-1 justify-center"
          >
            {createPlan.isPending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            Tạo kế hoạch
          </button>
        </div>
      </div>
    </div>
  )
}
