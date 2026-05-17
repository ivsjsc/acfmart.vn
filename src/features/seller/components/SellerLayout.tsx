import { NavLink, Outlet, Link, useLocation } from "react-router-dom"
import { useMemo } from "react"
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Store,
  MessageSquare,
  Megaphone,
  TrendingUp,
  Settings,
  Ticket,
  Wallet,
  ChevronRight,
  ArrowLeft,
  Sparkles,
} from "lucide-react"
import { cn } from "../../../lib/cn"
import { Logo } from "../../../components/Logo"
import { useMyVendor } from "../../../hooks/use-vendor"
import { useSellerProducts } from "../../../hooks/use-products"
import {
  deriveSellerOrderCounts,
  useSellerOrders,
} from "../../../hooks/use-seller-orders"

const LOW_STOCK_THRESHOLD = 5

export function SellerLayout() {
  const location = useLocation()
  const isRoot = location.pathname === "/seller"

  const vendorQuery = useMyVendor()
  const vendor = vendorQuery.data?.vendor ?? null
  const shopId = vendor?.firebase_uid ?? null

  const ordersStream = useSellerOrders(shopId)
  const orderCounts = useMemo(
    () => deriveSellerOrderCounts(ordersStream.orders),
    [ordersStream.orders]
  )

  const productsQuery = useSellerProducts({ limit: 500 })
  const lowStockCount = useMemo(() => {
    const products = productsQuery.data?.products ?? []
    return products.filter(
      (p) => p.status === "approved" && p.totalStock <= LOW_STOCK_THRESHOLD
    ).length
  }, [productsQuery.data])

  const navItems = [
    { to: "/seller", label: "Tổng quan", icon: LayoutDashboard, end: true, badge: 0 },
    {
      to: "/seller/orders",
      label: "Đơn hàng",
      icon: ShoppingBag,
      badge: orderCounts.awaitingConfirm + orderCounts.awaitingPack,
      badgeColor: undefined as string | undefined,
    },
    {
      to: "/seller/products",
      label: "Sản phẩm",
      icon: Package,
      badge: lowStockCount,
      badgeColor: "bg-amber-500",
    },
    { to: "/seller/chat", label: "Tin nhắn", icon: MessageSquare, badge: 0 },
    { to: "/seller/marketing", label: "Khuyến mãi", icon: Megaphone, badge: 0 },
    { to: "/seller/vouchers", label: "Voucher", icon: Ticket, badge: 0 },
    { to: "/seller/analytics", label: "Phân tích", icon: TrendingUp, badge: 0 },
    { to: "/seller/finance", label: "Tài chính", icon: Wallet, badge: 0 },
    { to: "/seller/shop", label: "Quản lý shop", icon: Store, badge: 0 },
    { to: "/seller/settings", label: "Cài đặt", icon: Settings, badge: 0 },
  ]

  const shopName = vendor?.shop_name ?? "Shop của bạn"
  const shopLogo = vendor?.shop_logo
  const kycLevel = vendor?.kyc_level ?? "none"

  return (
    <div className="flex min-h-screen flex-col bg-neutral-100 lg:flex-row">
      {/* Sidebar */}
      <aside
        className={cn(
          "border-r border-neutral-200 bg-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-64 lg:flex-col",
          isRoot ? "flex flex-col" : "hidden lg:flex"
        )}
      >
        {/* Header */}
        <div className="border-b border-neutral-100 p-4">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-brand-red-600"
          >
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
          {vendorQuery.isLoading ? (
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 shrink-0 animate-pulse rounded-lg bg-neutral-200" />
              <div className="flex-1 space-y-1">
                <div className="h-3 w-3/4 animate-pulse rounded bg-neutral-200" />
                <div className="h-2 w-1/2 animate-pulse rounded bg-neutral-200" />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              {shopLogo ? (
                <img
                  src={shopLogo}
                  alt={shopName}
                  className="h-10 w-10 shrink-0 rounded-lg object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-red-100 text-sm font-bold text-brand-red-700">
                  {shopName[0]?.toUpperCase() ?? "?"}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-neutral-900">
                  {shopName}
                </div>
                <div className="flex items-center gap-1 text-[10px] text-neutral-500">
                  <Sparkles size={10} className="text-brand-gold-500" />
                  <span className="font-semibold uppercase text-brand-gold-700">
                    {kycLevel}
                  </span>
                  {vendor && vendor.avg_rating > 0 && (
                    <span>· ⭐ {vendor.avg_rating.toFixed(1)}</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-2">
          {navItems.map((item) => (
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
              {item.badge > 0 && (
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
          <br />© {new Date().getFullYear()} · Phát triển bởi{" "}
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
