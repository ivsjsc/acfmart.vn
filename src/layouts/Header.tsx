import { Link, NavLink, useNavigate } from "react-router-dom"
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  QrCode,
  Bell,
  Menu,
  MessageCircle,
} from "lucide-react"
import { useState } from "react"
import { Logo } from "../components/Logo"
import { useCartStore } from "../stores/cart-store"
import { useAuthStore } from "../stores/auth-store"
import { cn } from "../lib/cn"

export function Header() {
  const navigate = useNavigate()
  const totalItems = useCartStore((s) => s.totalItems())
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const user = useAuthStore((s) => s.user)
  const [query, setQuery] = useState("")
  const [menuOpen, setMenuOpen] = useState(false)

  // Seller-only top bar applies when the user has the seller role
  // (admin/owner reach the seller portal via /admin, not the public header).
  const isSeller = user?.role === "seller"

  function onSearch(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  const navItems = [
    { label: "Trang chủ", to: "/" },
    { label: "Danh mục", to: "/categories" },
    { label: "Livestream", to: "/live" },
    { label: "Affiliate", to: "/affiliate" },
    { label: "Xác thực QR", to: "/qr-verify" },
    { label: "Aivy AI", to: "/aivy" },
  ]

  // Top-bar links switch based on whether the signed-in user is a seller.
  // - Buyer / guest: prompts to become seller, generic help, buyer order lookup.
  // - Seller: jumps to seller channel, help, shipping lookup for outgoing orders.
  // Lưu ý: "/seller" và "/seller-register" thuộc về portal acfmart.store.
  // DomainRedirect sẽ bật cross-domain sang acfmart.store khi click từ buyer domain.
  const topBarLinks = isSeller
    ? [
        { label: "Kênh người bán", to: "/seller" },
        { label: "Trợ giúp", to: "/help?audience=seller" },
        { label: "Tra cứu đơn hàng (Đơn bán)", to: "/seller/orders/track" },
      ]
    : [
        { label: "Trở thành Người bán", to: "/seller-channel" },
        { label: "Trợ giúp", to: "/help" },
        { label: "Tra cứu đơn hàng", to: "/account/track" },
      ]

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      {/* Top bar */}
      <div className="hidden border-b border-neutral-100 bg-neutral-50 lg:block">
        <div className="container-acf flex h-9 items-center justify-between text-xs text-neutral-600">
          <div className="flex items-center gap-1">
            <span className="badge-verified">✓ Xác thực bởi Quỹ Chống Hàng Giả VN</span>
          </div>
          <div className="flex items-center gap-4">
            {topBarLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="hover:text-brand-red-600"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Main bar */}
      <div className="container-acf flex h-7 items-center gap-4">
        <button
          className="lg:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Mở menu"
        >
          <Menu size={24} />
        </button>

        <Link to="/" aria-label="Trang chủ" className="shrink-0">
          <Logo size="lg" className="lg:h-20 lg:w-12" />
        </Link>

        <form
          onSubmit={onSearch}
          className="hidden flex-1 max-w-2xl md:flex"
          role="search"
        >
          <div className="relative w-full">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm sản phẩm chính hãng, shop, thương hiệu..."
              className="input pl-10 pr-24"
            />
            <button
              type="submit"
              className="absolute right-1 top-1/2 -translate-y-1/2 rounded-md bg-brand-red-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-red-600"
            >
              Tìm kiếm
            </button>
          </div>
        </form>

        <div className="ml-auto flex items-center gap-1">
          <Link
            to="/qr-verify"
            className="hidden items-center gap-1 rounded-lg p-2 text-neutral-700 hover:bg-neutral-100 md:flex"
            title="Quét QR xác thực"
          >
            <QrCode size={20} />
          </Link>
          <Link
            to="/wishlist"
            className="hidden items-center gap-1 rounded-lg p-2 text-neutral-700 hover:bg-neutral-100 md:flex"
            title="Yêu thích"
          >
            <Heart size={20} />
          </Link>
          <Link
            to="/account/chat"
            className="hidden items-center gap-1 rounded-lg p-2 text-neutral-700 hover:bg-neutral-100 md:flex"
            title="Tin nhắn"
          >
            <MessageCircle size={20} />
          </Link>
          <Link
            to="/notifications"
            className="hidden items-center gap-1 rounded-lg p-2 text-neutral-700 hover:bg-neutral-100 md:flex"
            title="Thông báo"
          >
            <Bell size={20} />
          </Link>
          <Link
            to="/cart"
            className="relative flex items-center gap-1 rounded-lg p-2 text-neutral-700 hover:bg-neutral-100"
            title="Giỏ hàng"
          >
            <ShoppingCart size={20} />
            {totalItems > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand-red-500 px-1 text-[10px] font-bold text-white">
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            )}
          </Link>
          {isAuthenticated ? (
            <Link
              to="/account"
              className="flex items-center gap-2 rounded-lg p-2 hover:bg-neutral-100"
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-7 w-7 rounded-full object-cover"
                />
              ) : (
                <User size={20} />
              )}
              <span className="hidden text-sm font-medium lg:inline">
                {user?.name}
              </span>
            </Link>
          ) : (
            <Link to="/login" className="btn-primary ml-2 hidden md:inline-flex">
              Đăng nhập
            </Link>
          )}
        </div>
      </div>

      {/* Nav links */}
      <nav className="hidden border-t border-neutral-100 lg:block">
        <div className="container-acf flex h-11 items-center gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-brand-red-50 text-brand-red-700"
                    : "text-neutral-700 hover:bg-neutral-100"
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-neutral-100 bg-white lg:hidden">
          <div className="container-acf flex flex-col gap-1 py-3">
            <form onSubmit={onSearch} role="search" className="mb-2 md:hidden">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Tìm sản phẩm..."
                  className="input pl-10"
                />
              </div>
            </form>
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "rounded-md px-3 py-2 text-sm font-medium",
                    isActive
                      ? "bg-brand-red-50 text-brand-red-700"
                      : "text-neutral-700 hover:bg-neutral-100"
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
            <div className="mt-2 flex flex-col gap-1 border-t border-neutral-100 pt-2">
              {topBarLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-md px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-100"
                >
                  {link.label}
                </Link>
              ))}
            </div>
            {!isAuthenticated && (
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="btn-primary mt-2"
              >
                Đăng nhập
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
