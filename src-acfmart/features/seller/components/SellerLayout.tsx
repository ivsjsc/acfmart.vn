import { NavLink, Outlet, Link, useLocation } from "react-router-dom"
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Store,
  MessageSquare,
  Megaphone,
  TrendingUp,
  Settings,
  Wallet,
  ChevronRight,
  ArrowLeft,
  Sparkles,
} from "lucide-react"
import { cn } from "../../../lib/cn"
import { Logo } from "../../../components/Logo"
import { MOCK_SELLER_PROFILE, MOCK_SELLER_STATS } from "../mock-data"

const NAV_ITEMS = [
  { to: "/seller", label: "Tổng quan", icon: LayoutDashboard, end: true },
  {
    to: "/seller/orders",
    label: "Đơn hàng",
    icon: ShoppingBag,
    badge: MOCK_SELLER_STATS.orders.awaitingConfirm + MOCK_SELLER_STATS.orders.awaitingPack,
  },
  {
    to: "/seller/products",
    label: "Sản phẩm",
    icon: Package,
    badge: MOCK_SELLER_STATS.products.lowStock,
    badgeColor: "bg-amber-500",
  },
  {
    to: "/seller/chat",
    label: "Tin nhắn",
    icon: MessageSquare,
    badge: 5,
  },
  { to: "/seller/marketing", label: "Khuyến mãi", icon: Megaphone },
  { to: "/seller/analytics", label: "Phân tích", icon: TrendingUp },
  { to: "/seller/finance", label: "Tài chính", icon: Wallet },
  { to: "/seller/shop", label: "Quản lý shop", icon: Store },
  { to: "/seller/settings", label: "Cài đặt", icon: Settings },
]

export function SellerLayout() {
  const location = useLocation()
  const isRoot = location.pathname === "/seller"
  const profile = MOCK_SELLER_PROFILE

  return (
    <div className="flex min-h-screen flex-col bg-neutral-100 lg:flex-row">
      {/* Sidebar */}
      <aside
        className={cn(
          "border-r border-neutral-200 bg-white lg:flex lg:h-screen lg:w-64 lg:flex-col lg:sticky lg:top-0",
          isRoot ? "flex flex-col" : "hidden lg:flex"
        )}
      >
        {/* Header */}
        <div className="border-b border-neutral-100 p-4">
          <Link to="/" className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-brand-red-600">
            <ArrowLeft size={12} />
            Về trang chủ
          </Link>
          <div className="mt-2 flex items-center gap-2">
            <Logo size="sm" />
            <span className="rounded-md bg-brand-gold-100 px-1.5 py-0.5 text-[10px] font-bold text-brand-gold-700">
              SELLER
            </span>
          </div>
        </div>

        {/* Shop profile mini */}
        <div className="border-b border-neutral-100 p-4">
          <div className="flex items-center gap-3">
            <img
              src={profile.shopLogo}
              alt={profile.shopName}
              className="h-10 w-10 shrink-0 rounded-lg object-cover"
            />
            <div className="flex-1 min-w-0">
              <div className="truncate text-sm font-semibold text-neutral-900">
                {profile.shopName}
              </div>
              <div className="flex items-center gap-1 text-[10px] text-neutral-500">
                <Sparkles size={10} className="text-brand-gold-500" />
                <span className="font-semibold uppercase text-brand-gold-700">
                  {profile.kycLevel === "verified" ? "Verified" : profile.kycLevel}
                </span>
                <span>· ⭐ {MOCK_SELLER_STATS.performance.customerRating}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
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
              {typeof item.badge === "number" && item.badge > 0 && (
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px] font-bold text-white",
                    item.badgeColor ?? "bg-brand-red-500"
                  )}
                >
                  {item.badge > 99 ? "99+" : item.badge}
                </span>
              )}
              <ChevronRight size={12} className="text-neutral-300 lg:hidden" />
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-neutral-100 p-3 text-center text-[10px] text-neutral-400">
          Seller Center
          <br />
          © {new Date().getFullYear()} · Phát triển bởi{" "}
          <a
            href="https://ivsacademy.edu.vn"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-red-600 hover:underline"
          >
            IVS JSC
          </a>
        </div>
      </aside>

      {/* Main content */}
      <main className={cn("flex-1", isRoot && "hidden lg:block")}>
        <Outlet />
      </main>
    </div>
  )
}
