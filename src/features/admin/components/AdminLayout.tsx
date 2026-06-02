import { useEffect, useState } from "react"
import { NavLink, Outlet, Link, useNavigate } from "react-router-dom"
import {
  LayoutDashboard,
  Users,
  UserCog,
  ShieldCheck,
  FileText,
  ArrowLeft,
  Settings,
  ChevronRight,
  Image,
  Package,
  Menu,
  X,
  Bell,
  LogOut,
  Wifi,
  MessageSquare,
  Wallet,
  RotateCcw,
} from "lucide-react"
import {
  collection,
  onSnapshot,
  query,
  where,
  type Unsubscribe,
} from "firebase/firestore"
import { firestore } from "../../../lib/firebase"
import { cn } from "../../../lib/cn"
import { Logo } from "../../../components/Logo"
import { BuyerHomeLink } from "../../../components/BuyerHomeLink"
import { getBuyerHomeHref } from "../../../lib/domain"
import { isPendingCodReconciliation } from "../../../lib/cod-reconciliation"
import { useAuthStore } from "../../../stores/auth-store"
import { useLogout } from "../../../hooks/use-auth"
import { useFirebaseAuthReady } from "../../../hooks/use-firebase-auth-ready"

// Link cross-domain "Trở về acfmart.vn"
function BackToBuyer({ className }: { className?: string }) {
  const href = getBuyerHomeHref()
  const isExternal = href.startsWith("http")
  const content = (
    <>
      <ArrowLeft size={12} />
      <span>Trở về acfmart.vn</span>
    </>
  )
  if (isExternal) {
    return (
      <a href={href} className={className}>
        {content}
      </a>
    )
  }
  return (
    <Link to={href} className={className}>
      {content}
    </Link>
  )
}

interface NavItem {
  to: string
  label: string
  icon: typeof Users
  end?: boolean
  badgeKey?: "vendors" | "products" | "reports" | "cod" | "returns"
}

const NAV_ITEMS: NavItem[] = [
  { to: "/admin", label: "Tổng quan", icon: LayoutDashboard, end: true },
  { to: "/admin/vendors", label: "Duyệt Seller", icon: Users, badgeKey: "vendors" },
  { to: "/admin/products", label: "Duyệt Sản phẩm", icon: Package, badgeKey: "products" },
  { to: "/admin/cod-reconciliation", label: "Đối soát COD", icon: Wallet, badgeKey: "cod" },
  { to: "/admin/refund-disputes", label: "Trả hàng & hoàn tiền", icon: RotateCcw, badgeKey: "returns" },
  { to: "/admin/users", label: "Quản lý User", icon: UserCog },
  { to: "/admin/banners", label: "Banner Trang chủ", icon: Image },
  { to: "/admin/portal-images", label: "Hình ảnh Portal", icon: Image },
  { to: "/admin/reports", label: "Báo cáo hàng giả", icon: ShieldCheck, badgeKey: "reports" },
  { to: "/admin/support", label: "Hỗ trợ Chat", icon: MessageSquare },
  { to: "/admin/audit-logs", label: "Nhật ký hệ thống", icon: FileText },
  { to: "/admin/settings", label: "Cài đặt", icon: Settings },
]

interface PendingCounts {
  vendors: number
  products: number
  reports: number
  cod: number
  returns: number
}

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [pending, setPending] = useState<PendingCounts>({
    vendors: 0,
    products: 0,
    reports: 0,
    cod: 0,
    returns: 0,
  })
  const user = useAuthStore((s) => s.user)
  const logoutMutation = useLogout()
  const navigate = useNavigate()
  const isManager = user?.role === "manager"
  const canModerate =
    user?.role === "owner" || user?.role === "admin" || user?.role === "moderator"
  // Defer the badge subscriptions until Firebase Auth has restored the
  // persisted session — otherwise the queries fire unauthenticated on
  // mobile cold reloads and the rules return Missing-or-insufficient.
  const authReady = useFirebaseAuthReady()

  useEffect(() => {
    if (!authReady || !canModerate) return
    const unsubs: Unsubscribe[] = []

    unsubs.push(
      onSnapshot(
        query(collection(firestore, "vendors"), where("status", "==", "pending")),
        (snap) => setPending((p) => ({ ...p, vendors: snap.size })),
        (err) => console.error("[AdminLayout] vendors badge error:", err)
      )
    )
    unsubs.push(
      onSnapshot(
        query(collection(firestore, "products"), where("status", "==", "pending")),
        (snap) => setPending((p) => ({ ...p, products: snap.size })),
        (err) => console.error("[AdminLayout] products badge error:", err)
      )
    )
    unsubs.push(
      onSnapshot(
        query(
          collection(firestore, "counterfeitReports"),
          where("status", "==", "pending")
        ),
        (snap) => setPending((p) => ({ ...p, reports: snap.size })),
        (err) => console.error("[AdminLayout] reports badge error:", err)
      )
    )
    unsubs.push(
      onSnapshot(
        collection(firestore, "orders"),
        (snap) => {
          const codPending = snap.docs.filter((d) =>
            isPendingCodReconciliation({
              paymentStatus: String(d.data().paymentStatus ?? ""),
              paymentMethod: String(d.data().paymentMethod ?? ""),
              shippingStatusCode:
                typeof d.data().shippingStatusCode === "number" ? d.data().shippingStatusCode : undefined,
            })
          ).length
          setPending((p) => ({ ...p, cod: codPending }))
        },
        (err) => console.error("[AdminLayout] cod badge error:", err)
      )
    )
    unsubs.push(
      onSnapshot(
        collection(firestore, "returnRequests"),
        (snap) => {
          const pendingReturns = snap.docs.filter((d) => {
            const status = String(d.data().status ?? "")
            const providerStatus = String(d.data().providerRefundStatus ?? "")
            return status === "pending" || status === "approved" || providerStatus === "pending_provider" || providerStatus === "processing_provider"
          }).length
          setPending((p) => ({ ...p, returns: pendingReturns }))
        },
        (err) => console.error("[AdminLayout] return badge error:", err)
      )
    )

    return () => {
      for (const u of unsubs) u()
    }
  }, [authReady, canModerate])

  const visibleNavItems = isManager
    ? NAV_ITEMS.filter((item) => item.to === "/admin/users")
    : NAV_ITEMS

  const totalPending = pending.vendors + pending.products + pending.reports + pending.cod + pending.returns

  async function handleLogout() {
    try {
      await logoutMutation.mutateAsync()
      navigate("/login/cloud", { replace: true })
    } catch (err) {
      console.error("[AdminLayout] logout failed:", err)
    }
  }

  return (
    <div className="flex min-h-screen bg-neutral-100">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-neutral-200 bg-white transition-transform duration-200 ease-in-out lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Sidebar header */}
        <div className="border-b border-neutral-100 p-4">
          <div className="flex items-center justify-between">
            <BackToBuyer className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-brand-red-600" />
            <button
              onClick={() => setSidebarOpen(false)}
              className="rounded-lg p-1 text-neutral-500 hover:bg-neutral-100 lg:hidden"
            >
              <X size={16} />
            </button>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <BuyerHomeLink aria-label="Trang chủ ACFMart" className="inline-flex">
              <Logo size="sm" />
            </BuyerHomeLink>
            <span
              className={cn(
                "rounded-md px-1.5 py-0.5 text-[10px] font-bold",
                isManager ? "bg-cyan-100 text-cyan-700" : "bg-rose-100 text-rose-700"
              )}
            >
              {isManager ? "MANAGER" : "ADMIN"}
            </span>
          </div>
        </div>

        {/* Live indicator */}
        <div className="mx-3 mt-3 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
          </span>
          <Wifi size={12} />
          <span className="font-medium">Đồng bộ realtime</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-2">
          {visibleNavItems.map((item) => {
            const badge = item.badgeKey ? pending[item.badgeKey] : 0
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "mb-0.5 flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-brand-red-50 font-semibold text-brand-red-700"
                      : "text-neutral-700 hover:bg-neutral-50"
                  )
                }
              >
                <item.icon size={16} />
                <span className="flex-1">{item.label}</span>
                {badge > 0 && (
                  <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white">
                    {badge > 99 ? "99+" : badge}
                  </span>
                )}
                <ChevronRight size={12} className="text-neutral-300 lg:hidden" />
              </NavLink>
            )
          })}
        </nav>

        {/* User info */}
        <div className="border-t border-neutral-100 p-3">
          {user && (
            <div className="mb-2 flex items-center gap-2 rounded-lg bg-neutral-50 p-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-red-100 text-xs font-bold text-brand-red-700">
                {user.avatar ? (
                  <img src={user.avatar} alt="" className="h-full w-full object-cover" />
                ) : (
                  (user.name || user.email || "?")[0].toUpperCase()
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-neutral-900">
                  {user.name || user.email}
                </p>
                <p className="truncate text-[10px] text-neutral-500">{user.role}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-neutral-200 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
          >
            <LogOut size={12} />
            {logoutMutation.isPending ? "Đang đăng xuất..." : "Đăng xuất"}
          </button>
          <p className="mt-3 text-center text-[10px] text-neutral-400">
            ACFMart · © {new Date().getFullYear()} IVS JSC
          </p>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top header — mobile có hamburger, desktop chỉ hiển thị nút "Trở về acfmart.vn" */}
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-neutral-200 bg-white px-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-neutral-600 hover:bg-neutral-100 lg:hidden"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-1.5 lg:hidden">
            <BuyerHomeLink aria-label="Trang chủ ACFMart" className="inline-flex">
              <Logo size="sm" />
            </BuyerHomeLink>
            <span
              className={cn(
                "rounded-md px-1.5 py-0.5 text-[10px] font-bold",
                isManager ? "bg-cyan-100 text-cyan-700" : "bg-rose-100 text-rose-700"
              )}
            >
              {isManager ? "MANAGER" : "ADMIN"}
            </span>
          </div>
          <div className="hidden text-sm font-semibold text-neutral-700 lg:block">
            Admin Console
          </div>
          <div className="flex items-center gap-2">
            <BackToBuyer className="flex items-center gap-1.5 rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 transition-colors hover:border-brand-red-300 hover:bg-brand-red-50 hover:text-brand-red-700" />
            <Link
              to="/account/notifications"
              className="relative rounded-lg p-2 text-neutral-600 hover:bg-neutral-100 lg:hidden"
            >
              <Bell size={18} />
              {totalPending > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                  {totalPending > 9 ? "9+" : totalPending}
                </span>
              )}
            </Link>
          </div>
        </header>

        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
