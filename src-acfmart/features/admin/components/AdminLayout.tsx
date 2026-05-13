import { NavLink, Outlet, Link } from "react-router-dom"
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  FileText,
  ArrowLeft,
  Settings,
  ChevronRight,
} from "lucide-react"
import { cn } from "../../../lib/cn"
import { Logo } from "../../../components/Logo"

const NAV_ITEMS = [
  { to: "/admin", label: "Tổng quan", icon: LayoutDashboard, end: true },
  { to: "/admin/vendors", label: "Duyệt Seller", icon: Users },
  { to: "/admin/reports", label: "Báo cáo hàng giả", icon: ShieldCheck },
  { to: "/admin/audit-logs", label: "Nhật ký hệ thống", icon: FileText },
  { to: "/admin/settings", label: "Cài đặt", icon: Settings },
]

export function AdminLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-100 lg:flex-row">
      <aside className="border-r border-neutral-200 bg-white lg:flex lg:h-screen lg:w-64 lg:flex-col lg:sticky lg:top-0">
        <div className="border-b border-neutral-100 p-4">
          <Link to="/" className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-brand-red-600">
            <ArrowLeft size={12} />
            Về trang chủ
          </Link>
          <div className="mt-2 flex items-center gap-2">
            <Logo size="sm" />
            <span className="rounded-md bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold text-rose-700">
              ADMIN
            </span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-2">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
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
              <ChevronRight size={12} className="text-neutral-300 lg:hidden" />
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-neutral-100 p-3 text-center text-[10px] text-neutral-400">
          Admin Panel · © {new Date().getFullYear()} ACFMart
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  )
}
