import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import {
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Package,
  ShoppingCart,
  TrendingUp,
  ShieldAlert,
  UserCog,
  FileText,
  ChevronRight,
  Wifi,
  Wallet,
  RotateCcw,
} from "lucide-react"
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  Unsubscribe,
} from "firebase/firestore"
import { firestore } from "../../../lib/firebase"
import { cn } from "../../../lib/cn"
import { formatCurrency } from "../../../lib/format"
import { useModerationVendors } from "../../../hooks/use-moderation"
import { useFirebaseAuthReady } from "../../../hooks/use-firebase-auth-ready"
import {
  summarizeCodOrders,
  type CodSettlementOrderRow,
} from "../../../lib/cod-reconciliation"

interface DashboardMetrics {
  users: number
  activeSellers: number
  pendingProducts: number
  approvedProducts: number
  rejectedProducts: number
  totalOrders: number
  pendingOrders: number
  completedOrders: number
  gmv: number
  codOrders: number
  codPendingReconciliation: number
  codReconciledAmount: number
  counterfeitReports: number
  pendingReports: number
  returnRequests: number
  pendingReturnRequests: number
  approvedReturnRequests: number
  refundedReturnRequests: number
}

interface ActivityItem {
  id: string
  action: string
  actor_email: string
  actor_role: string
  target_type: string
  target_id: string
  created_at?: { toDate?: () => Date }
}

const EMPTY_METRICS: DashboardMetrics = {
  users: 0,
  activeSellers: 0,
  pendingProducts: 0,
  approvedProducts: 0,
  rejectedProducts: 0,
  totalOrders: 0,
  pendingOrders: 0,
  completedOrders: 0,
  gmv: 0,
  codOrders: 0,
  codPendingReconciliation: 0,
  codReconciledAmount: 0,
  counterfeitReports: 0,
  pendingReports: 0,
  returnRequests: 0,
  pendingReturnRequests: 0,
  approvedReturnRequests: 0,
  refundedReturnRequests: 0,
}

const ACTION_LABELS: Record<string, string> = {
  vendor_register: "Đăng ký seller",
  vendor_approve: "Duyệt seller",
  vendor_reject: "Từ chối seller",
  vendor_kyc_start: "Bắt đầu eKYC",
  vendor_kyc_submit: "Gửi eKYC",
  vendor_kyc_status_change: "Cập nhật eKYC",
  product_submit: "Gửi sản phẩm",
  product_approve: "Duyệt sản phẩm",
  product_reject: "Từ chối sản phẩm",
  order_status_change: "Đổi trạng thái đơn",
  role_change: "Đổi role",
  settings_change: "Đổi cấu hình",
  login: "Đăng nhập",
}

export function AdminDashboardScreen() {
  const [metrics, setMetrics] = useState<DashboardMetrics>(EMPTY_METRICS)
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const pending = useModerationVendors({ status: "pending" })
  // Wait until Firebase Auth has restored the persisted session before
  // subscribing — otherwise rules deny the queries on a cold mobile reload
  // and every metric stays at 0.
  const authReady = useFirebaseAuthReady()

  useEffect(() => {
    if (!authReady) return
    const unsubs: Unsubscribe[] = []
    const failureMessages = new Set<string>()

    const guard = (label: string) => (err: Error) => {
      console.error(`[AdminDashboard] ${label} subscription error:`, err)
      failureMessages.add(`${label}: ${err.message}`)
      setErrors(Array.from(failureMessages))
    }

    // Users
    unsubs.push(
      onSnapshot(
        collection(firestore, "users"),
        (snap) => {
          setMetrics((prev) => ({ ...prev, users: snap.size }))
        },
        guard("users")
      )
    )

    // Active sellers
    unsubs.push(
      onSnapshot(
        query(collection(firestore, "users"), where("role", "==", "seller")),
        (snap) => {
          const active = snap.docs.filter((d) => !d.data().disabled).length
          setMetrics((prev) => ({ ...prev, activeSellers: active }))
        },
        guard("active sellers")
      )
    )

    // Products by status
    unsubs.push(
      onSnapshot(
        collection(firestore, "products"),
        (snap) => {
          let pendingCount = 0
          let approvedCount = 0
          let rejectedCount = 0
          for (const d of snap.docs) {
            const status = d.data().status
            if (status === "pending") pendingCount++
            else if (status === "approved") approvedCount++
            else if (status === "rejected") rejectedCount++
          }
          setMetrics((prev) => ({
            ...prev,
            pendingProducts: pendingCount,
            approvedProducts: approvedCount,
            rejectedProducts: rejectedCount,
          }))
        },
        guard("products")
      )
    )

    // Orders + GMV
    unsubs.push(
      onSnapshot(
        collection(firestore, "orders"),
        (snap) => {
          let pendingOrdersCount = 0
          let completedOrdersCount = 0
          let totalGmv = 0
          const codRows: CodSettlementOrderRow[] = []
          for (const d of snap.docs) {
            const data = d.data()
            const status = data.status
            if (status === "pending" || status === "confirmed") pendingOrdersCount++
            if (status === "delivered" || status === "completed") completedOrdersCount++
            const amount = Number(data.totalAmount ?? data.total ?? 0)
            if (!Number.isNaN(amount)) totalGmv += amount

            const isCod = String(data.paymentStatus ?? "").toLowerCase() === "cod" ||
              String(data.paymentMethod ?? "").toLowerCase() === "cod"
            if (isCod) {
              codRows.push({
                id: d.id,
                code: String(data.code ?? d.id),
                shopName: String(data.shopName ?? "Shop"),
                customerName: String(data.customerName ?? data.shippingAddress?.name ?? "Khách hàng"),
                paymentStatus: String(data.paymentStatus ?? ""),
                paymentMethod: String(data.paymentMethod ?? ""),
                shippingStatusCode:
                  typeof data.shippingStatusCode === "number" ? data.shippingStatusCode : undefined,
                shippingStatusText:
                  typeof data.shippingStatusText === "string" ? data.shippingStatusText : undefined,
                shippingPickMoney: Number(data.shippingPickMoney ?? data.codFee ?? data.total ?? 0),
                shippingProviderName:
                  typeof data.shippingProviderName === "string" ? data.shippingProviderName : undefined,
                shippingProviderId:
                  typeof data.shippingProviderId === "string" ? data.shippingProviderId : undefined,
                trackingNumber:
                  typeof data.trackingNumber === "string" ? data.trackingNumber : undefined,
                status: String(data.status ?? ""),
                updatedAt: data.updated_at as any,
                createdAt: data.created_at as any,
              })
            }
          }
          const codSummary = summarizeCodOrders(codRows)
          setMetrics((prev) => ({
            ...prev,
            totalOrders: snap.size,
            pendingOrders: pendingOrdersCount,
            completedOrders: completedOrdersCount,
            gmv: totalGmv,
            codOrders: codSummary.totalOrders,
            codPendingReconciliation: codSummary.pendingOrders,
            codReconciledAmount: codSummary.reconciledAmount,
          }))
        },
        guard("orders")
      )
    )

    // Counterfeit reports
    unsubs.push(
      onSnapshot(
        collection(firestore, "counterfeitReports"),
        (snap) => {
          const pendingReportsCount = snap.docs.filter(
            (d) => d.data().status === "pending" || !d.data().status
          ).length
          setMetrics((prev) => ({
            ...prev,
            counterfeitReports: snap.size,
            pendingReports: pendingReportsCount,
          }))
        },
        guard("counterfeit reports")
      )
    )

    // Return / refund requests
    unsubs.push(
      onSnapshot(
        collection(firestore, "returnRequests"),
        (snap) => {
          let pendingReturnRequests = 0
          let approvedReturnRequests = 0
          let refundedReturnRequests = 0
          for (const d of snap.docs) {
            const data = d.data()
            const status = String(data.status ?? "")
            const providerStatus = String(data.providerRefundStatus ?? "")
            if (status === "pending") pendingReturnRequests++
            else if (status === "approved" || providerStatus === "pending_provider" || providerStatus === "processing_provider") approvedReturnRequests++
            else if (status === "refunded" || providerStatus === "completed") refundedReturnRequests++
          }
          setMetrics((prev) => ({
            ...prev,
            returnRequests: snap.size,
            pendingReturnRequests,
            approvedReturnRequests,
            refundedReturnRequests,
          }))
        },
        guard("return requests")
      )
    )

    // Recent activities (audit log stream)
    unsubs.push(
      onSnapshot(
        query(
          collection(firestore, "auditLogs"),
          orderBy("created_at", "desc"),
          limit(8)
        ),
        (snap) => {
          setActivities(
            snap.docs.map((d) => ({ id: d.id, ...(d.data() as ActivityItem) }))
          )
        },
        guard("audit logs")
      )
    )

    return () => {
      for (const unsub of unsubs) unsub()
    }
  }, [authReady])

  const stats = useMemo(
    () => [
      {
        label: "Người dùng",
        value: metrics.users,
        icon: Users,
        color: "text-blue-600 bg-blue-50",
        href: "/admin/users",
        sub: `${metrics.activeSellers} seller đang hoạt động`,
      },
      {
        label: "Seller chờ duyệt",
        value: pending.data?.count ?? 0,
        icon: Clock,
        color: "text-amber-600 bg-amber-50",
        href: "/admin/vendors",
        urgent: (pending.data?.count ?? 0) > 0,
        sub: "SLA 24–48 giờ",
      },
      {
        label: "Sản phẩm chờ duyệt",
        value: metrics.pendingProducts,
        icon: Package,
        color: "text-orange-600 bg-orange-50",
        href: "/admin/products",
        urgent: metrics.pendingProducts > 10,
        sub: `${metrics.approvedProducts} đã duyệt · ${metrics.rejectedProducts} từ chối`,
      },
      {
        label: "Đơn hàng",
        value: metrics.totalOrders,
        icon: ShoppingCart,
        color: "text-purple-600 bg-purple-50",
        href: "#",
        sub: `${metrics.pendingOrders} đang xử lý · ${metrics.completedOrders} hoàn tất · ${metrics.codPendingReconciliation} COD chờ đối soát`,
      },
      {
        label: "COD đối soát",
        value: metrics.codOrders,
        icon: Wallet,
        color: "text-emerald-600 bg-emerald-50",
        href: "/admin/cod-reconciliation",
        urgent: metrics.codPendingReconciliation > 0,
        sub: `${formatCurrency(metrics.codReconciledAmount)} đã ghi nhận`,
      },
      {
        label: "Tổng GMV",
        value: undefined,
        formatted: formatCurrency(metrics.gmv),
        icon: TrendingUp,
        color: "text-emerald-600 bg-emerald-50",
        href: "#",
        sub: "Tổng giá trị giao dịch",
      },
      {
        label: "Báo cáo hàng giả",
        value: metrics.counterfeitReports,
        icon: ShieldAlert,
        color: "text-rose-600 bg-rose-50",
        href: "/admin/reports",
        urgent: metrics.pendingReports > 0,
        sub: `${metrics.pendingReports} chờ xử lý`,
      },
      {
        label: "Trả hàng / hoàn tiền",
        value: metrics.pendingReturnRequests,
        icon: RotateCcw,
        color: "text-blue-600 bg-blue-50",
        href: "/admin/refund-disputes",
        urgent: metrics.pendingReturnRequests > 0,
        sub: `${metrics.returnRequests} yêu cầu · ${metrics.refundedReturnRequests} đã hoàn`,
      },
    ],
    [metrics, pending.data?.count]
  )

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Tổng quan Quản trị</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Quản lý ACFMart — Sàn TMĐT chống hàng giả của Quỹ Chống Hàng Giả VN
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
          </span>
          <Wifi size={12} /> Đồng bộ realtime
        </div>
      </div>

      {/* Error banner */}
      {errors.length > 0 && (
        <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 shrink-0 text-rose-600" size={18} />
            <div className="flex-1">
              <p className="text-sm font-semibold text-rose-900">
                Một vài metric không tải được
              </p>
              <ul className="mt-1 list-inside list-disc text-xs text-rose-700">
                {errors.map((err) => (
                  <li key={err}>{err}</li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-rose-600">
                Kiểm tra Firestore security rules cho phép moderator/admin
                <code className="mx-1 rounded bg-rose-100 px-1.5 py-0.5 font-mono">list</code>
                các collection trên.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Metrics */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            to={stat.href}
            className={cn(
              "group rounded-xl border bg-white p-5 transition-all hover:-translate-y-0.5 hover:shadow-md",
              stat.urgent
                ? "border-amber-200 ring-2 ring-amber-100"
                : "border-neutral-200"
            )}
          >
            <div className="flex items-center justify-between">
              <div className={cn("rounded-lg p-2", stat.color)}>
                <stat.icon size={20} />
              </div>
              <ChevronRight
                size={16}
                className="text-neutral-300 transition-transform group-hover:translate-x-1 group-hover:text-neutral-500"
              />
            </div>
            <div className="mt-3">
              <p className="text-xs text-neutral-500">{stat.label}</p>
              <p className="mt-0.5 text-2xl font-bold text-neutral-900">
                {stat.formatted ?? stat.value?.toLocaleString("vi-VN") ?? 0}
              </p>
              {stat.sub && (
                <p className="mt-1 text-xs text-neutral-500">{stat.sub}</p>
              )}
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Pending vendor banner */}
        <div className="lg:col-span-2 space-y-4">
          {(pending.data?.count ?? 0) > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
              <div className="flex items-center gap-2">
                <Clock className="text-amber-600" size={20} />
                <h2 className="font-semibold text-amber-900">
                  {pending.data?.count ?? 0} hồ sơ seller đang chờ duyệt
                </h2>
              </div>
              <p className="mt-1 text-sm text-amber-700">
                Vui lòng truy cập <strong>Duyệt Seller</strong> để xem xét và phê duyệt hồ sơ đăng ký.
                Thời gian duyệt cam kết: 24-48 giờ.
              </p>
              <Link
                to="/admin/vendors"
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700"
              >
                Đi tới duyệt seller
                <ChevronRight size={12} />
              </Link>
            </div>
          )}

          {/* Quick actions */}
          <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-neutral-900">Tác vụ nhanh</h2>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
              <QuickAction to="/admin/users" icon={UserCog} label="Quản lý User" />
              <QuickAction to="/admin/products" icon={Package} label="Duyệt SP" badge={metrics.pendingProducts} />
              <QuickAction to="/admin/vendors" icon={Users} label="Duyệt Seller" badge={pending.data?.count ?? 0} />
              <QuickAction to="/admin/cod-reconciliation" icon={Wallet} label="Đối soát COD" badge={metrics.codPendingReconciliation} />
              <QuickAction to="/admin/banners" icon={CheckCircle2} label="Banner" />
              <QuickAction to="/admin/audit-logs" icon={FileText} label="Audit Log" />
              <QuickAction
                to="/admin/reports"
                icon={ShieldAlert}
                label="Báo cáo"
                badge={metrics.pendingReports}
              />
              <QuickAction
                to="/admin/refund-disputes"
                icon={RotateCcw}
                label="Trả hàng"
                badge={metrics.pendingReturnRequests}
              />
            </div>
          </div>
        </div>

        {/* Recent activity */}
        <div className="rounded-xl border border-neutral-200 bg-white">
          <div className="border-b border-neutral-100 p-4">
            <h2 className="text-sm font-semibold text-neutral-900">Hoạt động gần đây</h2>
            <p className="text-xs text-neutral-500">Audit log mới nhất</p>
          </div>
          <div className="max-h-[400px] overflow-y-auto p-2">
            {activities.length === 0 ? (
              <p className="px-3 py-8 text-center text-xs text-neutral-400">
                Chưa có hoạt động nào
              </p>
            ) : (
              activities.map((activity) => (
                <ActivityRow key={activity.id} activity={activity} />
              ))
            )}
          </div>
          <div className="border-t border-neutral-100 p-3">
            <Link
              to="/admin/audit-logs"
              className="inline-flex items-center gap-1 text-xs font-medium text-brand-red-600 hover:text-brand-red-700"
            >
              Xem tất cả nhật ký
              <ChevronRight size={12} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function QuickAction({
  to,
  icon: Icon,
  label,
  badge,
}: {
  to: string
  icon: typeof Users
  label: string
  badge?: number
}) {
  return (
    <Link
      to={to}
      className="relative flex flex-col items-center justify-center gap-1 rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-center transition-colors hover:border-brand-red-200 hover:bg-brand-red-50"
    >
      {badge !== undefined && badge > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
      <Icon size={18} className="text-neutral-600" />
      <span className="text-[11px] font-medium text-neutral-700">{label}</span>
    </Link>
  )
}

function ActivityRow({ activity }: { activity: ActivityItem }) {
  const label = ACTION_LABELS[activity.action] ?? activity.action
  const ts = activity.created_at?.toDate?.()
  const tsLabel = ts ? formatRelativeTime(ts) : ""

  return (
    <div className="flex items-start gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-neutral-50">
      <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand-red-400" />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-neutral-900">{label}</p>
        <p className="truncate text-[11px] text-neutral-500">
          {activity.actor_email || "Hệ thống"}
          {activity.target_type && ` · ${activity.target_type}`}
        </p>
      </div>
      <p className="shrink-0 text-[10px] text-neutral-400">{tsLabel}</p>
    </div>
  )
}

function formatRelativeTime(date: Date): string {
  const diff = Date.now() - date.getTime()
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  if (diff < minute) return "vừa xong"
  if (diff < hour) return `${Math.floor(diff / minute)} phút`
  if (diff < day) return `${Math.floor(diff / hour)} giờ`
  if (diff < 7 * day) return `${Math.floor(diff / day)} ngày`
  return date.toLocaleDateString("vi-VN")
}
