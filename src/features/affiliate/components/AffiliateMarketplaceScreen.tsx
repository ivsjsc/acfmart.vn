import { useState } from "react"
import { Link } from "react-router-dom"
import {
  Check,
  Globe,
  Loader2,
  Megaphone,
  Percent,
  Search,
  ShoppingBag,
  Sparkles,
  Store,
  Target,
} from "lucide-react"
import toast from "react-hot-toast"
import { cn } from "../../../lib/cn"
import { formatCurrency } from "../../../lib/format"
import { sanitizeUserError } from "../../../lib/error-utils"
import { useAuthStore } from "../../../stores/auth-store"
import {
  useAffiliateMarketplace,
  useApplyToPlan,
  useMyAffiliateApplications,
  type AffiliatePlan,
} from "../../../hooks/use-affiliate-plans"
import {
  useCreateAffiliateLink,
} from "../../../hooks/use-affiliate-fs"

export default function AffiliateMarketplaceScreen() {
  const user = useAuthStore((s) => s.user)
  const plansQuery = useAffiliateMarketplace()
  const myAppsQuery = useMyAffiliateApplications()
  const plans = plansQuery.data?.plans ?? []
  const myApps = myAppsQuery.data?.applications ?? []
  const [search, setSearch] = useState("")

  const filteredPlans = plans.filter((p) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      p.title.toLowerCase().includes(q) ||
      p.shopName.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q)
    )
  })

  // Map planId -> application status
  const appStatusMap = new Map(myApps.map((a) => [a.planId, a.status]))

  if (!user) {
    return (
      <div className="container-acf py-8">
        <div className="card flex flex-col items-center py-16 text-center">
          <Megaphone size={48} className="text-neutral-300" />
          <h2 className="mt-3 text-lg font-bold">Đăng nhập để xem Affiliate Marketplace</h2>
          <Link to="/login" className="btn-primary mt-4">Đăng nhập</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container-acf py-4 lg:py-6">
      {/* Header */}
      <div className="mb-6 overflow-hidden rounded-lg bg-gradient-to-br from-brand-red-600 via-brand-red-500 to-brand-gold-500 p-6 text-white">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-brand-gold-200" />
          <span className="text-xs font-medium uppercase tracking-wider text-white/80">
            Affiliate Marketplace
          </span>
        </div>
        <h1 className="mt-1 text-3xl font-extrabold lg:text-4xl">
          Chọn sản phẩm, kiếm hoa hồng
        </h1>
        <p className="mt-1 text-sm text-white/90">
          Duyệt kế hoạch từ các Shop, đăng ký quảng bá và nhận hoa hồng trên mỗi đơn hàng.
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm kế hoạch, shop..."
          className="input pl-9"
        />
      </div>

      {/* My applications summary */}
      {myApps.length > 0 && (
        <div className="mb-5 flex flex-wrap gap-3">
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
            <Check size={12} className="mr-1 inline" />
            {myApps.filter((a) => a.status === "approved").length} đã duyệt
          </div>
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
            {myApps.filter((a) => a.status === "pending").length} chờ duyệt
          </div>
          <Link
            to="/affiliate"
            className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-brand-red-600 hover:bg-neutral-50"
          >
            Dashboard Affiliate
          </Link>
        </div>
      )}

      {/* Plans grid */}
      {plansQuery.isLoading ? (
        <div className="card flex items-center justify-center gap-2 p-8 text-sm text-neutral-500">
          <Loader2 size={16} className="animate-spin" />
          Đang tải marketplace...
        </div>
      ) : filteredPlans.length === 0 ? (
        <div className="card flex flex-col items-center py-16 text-center">
          <ShoppingBag size={48} className="text-neutral-300" />
          <h3 className="mt-3 text-base font-bold text-neutral-900">
            {search ? "Không tìm thấy kế hoạch phù hợp" : "Chưa có kế hoạch affiliate nào"}
          </h3>
          <p className="mt-1 max-w-md text-sm text-neutral-500">
            {search
              ? "Thử từ khóa khác."
              : "Khi Shop tạo kế hoạch affiliate, chúng sẽ xuất hiện tại đây."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPlans.map((plan) => (
            <MarketplacePlanCard
              key={plan.id}
              plan={plan}
              applicationStatus={appStatusMap.get(plan.id) ?? null}
              userName={user.name || user.email || "Creator"}
              userAvatar={user.avatar}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function MarketplacePlanCard({
  plan,
  applicationStatus,
  userName,
  userAvatar,
}: {
  plan: AffiliatePlan
  applicationStatus: "pending" | "approved" | "rejected" | null
  userName: string
  userAvatar?: string
}) {
  const applyToPlan = useApplyToPlan()
  const createLink = useCreateAffiliateLink()
  const [applying, setApplying] = useState(false)

  async function handleApply() {
    setApplying(true)
    try {
      await applyToPlan.mutateAsync({
        planId: plan.id,
        creatorName: userName,
        creatorAvatar: userAvatar,
      })
      toast.success(
        plan.type === "open"
          ? "Đã tham gia! Bạn có thể tạo link ngay."
          : "Đã gửi đơn đăng ký. Chờ Shop duyệt."
      )
    } catch (err) {
      toast.error(sanitizeUserError(err, "Không thể đăng ký"))
    } finally {
      setApplying(false)
    }
  }

  async function handleCreateLink() {
    if (plan.productSnapshots.length === 0) {
      toast("Kế hoạch chưa có sản phẩm cụ thể. Vào Dashboard để tạo link thủ công.")
      return
    }
    const firstProduct = plan.productSnapshots[0]
    try {
      await createLink.mutateAsync({
        target_url: `${window.location.origin}/products/${firstProduct.id}`,
        target_type: "product",
        target_id: firstProduct.id,
        title: firstProduct.name,
        shop_id: plan.shopId,
        shop_name: plan.shopName,
        plan_id: plan.id,
        commission_bps: plan.commissionBps,
        product_image: firstProduct.thumbnail,
        product_price: firstProduct.price,
      })
      toast.success("Đã tạo link affiliate!")
    } catch (err) {
      toast.error(sanitizeUserError(err, "Không thể tạo link"))
    }
  }

  const isApproved = applicationStatus === "approved"
  const isPending = applicationStatus === "pending"
  const isRejected = applicationStatus === "rejected"

  return (
    <div className="card overflow-hidden transition-shadow hover:shadow-md">
      {/* Shop header */}
      <div className="flex items-center gap-3 border-b border-neutral-100 bg-neutral-50 px-4 py-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-red-100 text-sm font-bold text-brand-red-700">
          {plan.shopLogo ? (
            <img src={plan.shopLogo} alt="" className="h-full w-full rounded-full object-cover" />
          ) : (
            <Store size={18} />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-neutral-900">{plan.shopName}</div>
          <div className="flex items-center gap-1 text-[10px] text-neutral-500">
            {plan.type === "open" ? <Globe size={10} /> : <Target size={10} />}
            {plan.type === "open" ? "Open Plan" : "Targeted Plan"}
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-lg font-extrabold text-brand-red-600">
            {(plan.commissionBps / 100).toFixed(1)}%
          </span>
          <span className="text-[10px] text-neutral-500">hoa hồng</span>
        </div>
      </div>

      {/* Plan info */}
      <div className="p-4">
        <h3 className="text-base font-bold text-neutral-900">{plan.title}</h3>
        {plan.description && (
          <p className="mt-1 text-sm text-neutral-500 line-clamp-2">{plan.description}</p>
        )}

        {/* Product previews */}
        {plan.productSnapshots.length > 0 && (
          <div className="mt-3 flex gap-1.5 overflow-x-auto">
            {plan.productSnapshots.slice(0, 4).map((p) => (
              <div key={p.id} className="shrink-0">
                <img
                  src={p.thumbnail}
                  alt={p.name}
                  className="h-16 w-16 rounded-lg border border-neutral-200 object-cover"
                />
                <div className="mt-0.5 text-center text-[10px] font-medium text-neutral-500">
                  {formatCurrency(p.price)}
                </div>
              </div>
            ))}
            {plan.productIds.length > 4 && (
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50 text-xs text-neutral-400">
                +{plan.productIds.length - 4}
              </div>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="mt-3 flex gap-4 text-xs text-neutral-500">
          <span>{plan.approvedCount} Creator</span>
          <span>{plan.totalConversions} đơn</span>
        </div>
      </div>

      {/* Action */}
      <div className="border-t border-neutral-100 px-4 py-3">
        {isApproved ? (
          <button
            onClick={handleCreateLink}
            disabled={createLink.isPending}
            className="btn-primary w-full justify-center"
          >
            {createLink.isPending ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Megaphone size={14} />
            )}
            Tạo link Affiliate
          </button>
        ) : isPending ? (
          <div className="w-full rounded-lg bg-amber-50 py-2 text-center text-sm font-semibold text-amber-700">
            Đang chờ Shop duyệt...
          </div>
        ) : isRejected ? (
          <div className="w-full rounded-lg bg-rose-50 py-2 text-center text-sm font-semibold text-rose-700">
            Đã bị từ chối
          </div>
        ) : (
          <button
            onClick={handleApply}
            disabled={applying}
            className="btn-primary w-full justify-center"
          >
            {applying ? (
              <Loader2 size={14} className="animate-spin" />
            ) : plan.type === "open" ? (
              <Check size={14} />
            ) : (
              <Target size={14} />
            )}
            {plan.type === "open" ? "Tham gia ngay" : "Đăng ký quảng bá"}
          </button>
        )}
      </div>
    </div>
  )
}
