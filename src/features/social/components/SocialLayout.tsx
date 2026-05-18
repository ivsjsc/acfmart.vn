import { useState } from "react"
import { NavLink, Outlet, Link, useNavigate } from "react-router-dom"
import {
  LayoutDashboard,
  MessageCircle,
  Users,
  TrendingUp,
  Video,
  Share2,
  Sparkles,
  Settings,
  ChevronRight,
  ArrowLeft,
  Menu,
  X,
  Bell,
  LogOut,
  UserRound,
} from "lucide-react"
import { cn } from "../../../lib/cn"
import { Logo } from "../../../components/Logo"
import { getBuyerHomeHref } from "../../../lib/domain"
import { useAuthStore } from "../../../stores/auth-store"
import { useLogout } from "../../../hooks/use-auth"

function BackToBuyer({ className }: { className?: string }) {
  const href = getBuyerHomeHref()
  const isExternal = href.startsWith("http")
  const content = (
    <>
      <ArrowLeft size={14} />
      <span className="hidden sm:inline">Trở về</span>
      <span className="font-semibold">acfmart.vn</span>
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

const NAV_ITEMS = [
  { to: "/social", label: "Tổng quan", icon: LayoutDashboard, end: true },
  { to: "/social/feed", label: "Bảng tin", icon: MessageCircle },
  { to: "/social/community", label: "Cộng đồng", icon: Users },
  { to: "/social/affiliate", label: "Affiliate", icon: Share2 },
  { to: "/social/live", label: "Live Commerce", icon: Video },
  { to: "/social/trending", label: "Xu hướng", icon: TrendingUp },
  { to: "/social/aivy", label: "Aivy AI", icon: Sparkles },
  { to: "/social/profile", label: "Hồ sơ cá nhân", icon: UserRound },
  { to: "/social/settings", label: "Cài đặt", icon: Settings },
]

export function SocialLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const user = useAuthStore((s) => s.user)
  const logoutMutation = useLogout()
  const navigate = useNavigate()

  async function handleLogout() {
    try {
      await logoutMutation.mutateAsync()
      navigate("/login/online", { replace: true })
    } catch (err) {
      console.error("[SocialLayout] logout failed:", err)
    }
  }

  return (
    <div className="flex min-h-screen bg-neutral-50">
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
            <BackToBuyer className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-violet-600" />
            <button
              onClick={() => setSidebarOpen(false)}
              className="rounded-lg p-1 text-neutral-500 hover:bg-neutral-100 lg:hidden"
            >
              <X size={16} />
            </button>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <Logo size="sm" />
            <span className="rounded-md bg-violet-100 px-1.5 py-0.5 text-[10px] font-bold text-violet-700">
              SOCIAL
            </span>
          </div>
        </div>

        {/* User profile mini */}
        {user && (
          <div className="border-b border-neutral-100 p-4">
            <div className="flex items-center gap-3">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-10 w-10 shrink-0 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700">
                  {(user.name || user.email || "?")[0].toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-neutral-900">
                  {user.name || "Người dùng"}
                </div>
                <div className="truncate text-[10px] text-neutral-500">
                  {user.email}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-2">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                cn(
                  "mb-0.5 flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-violet-50 font-semibold text-violet-700"
                    : "text-neutral-700 hover:bg-neutral-50"
                )
              }
            >
              <item.icon size={16} />
              <span className="flex-1">{item.label}</span>
              <ChevronRight size={12} className="text-neutral-300 lg:hidden" />
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-neutral-100 p-3">
          <button
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-neutral-200 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
          >
            <LogOut size={12} />
            {logoutMutation.isPending ? "Đang đăng xuất..." : "Đăng xuất"}
          </button>
          <p className="mt-3 text-center text-[10px] text-neutral-400">
            ACFMart Social · © {new Date().getFullYear()} IVS JSC
          </p>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-neutral-200 bg-white px-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-neutral-600 hover:bg-neutral-100 lg:hidden"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-1.5 lg:hidden">
            <Logo size="sm" />
            <span className="rounded-md bg-violet-100 px-1.5 py-0.5 text-[10px] font-bold text-violet-700">
              SOCIAL
            </span>
          </div>
          <div className="hidden text-sm font-semibold text-neutral-700 lg:block">
            ACFMart Social
          </div>
          <div className="flex items-center gap-2">
            <BackToBuyer className="flex items-center gap-1.5 rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 transition-colors hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700" />
            <Link
              to="/social/notifications"
              className="relative rounded-lg p-2 text-neutral-600 hover:bg-neutral-100"
            >
              <Bell size={18} />
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
