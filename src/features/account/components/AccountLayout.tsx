import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom"
import {
  User,
  Wallet,
  Ticket,
  Settings,
  MessageSquare,
  MapPin,
  Package,
  Heart,
  ShieldCheck,
  LogOut,
  ChevronRight,
  Crown,
  type LucideIcon,
} from "lucide-react"
import toast from "react-hot-toast"
import { useAuthStore } from "../../../stores/auth-store"
import { useWishlistStore } from "../../../stores/wishlist-store"
import { useLogout } from "../../../hooks/use-auth"
import { useConversations } from "../../../hooks/use-chat-realtime"
import { cn } from "../../../lib/cn"

type SidebarItem = {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
  badgeKey?: "wishlist" | "chat"
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  { to: "/account", label: "Tài khoản của tôi", icon: User, end: true },
  { to: "/account/orders", label: "Đơn hàng", icon: Package },
  { to: "/account/wallet", label: "Ví của tôi", icon: Wallet },
  { to: "/account/loyalty", label: "Điểm thưởng", icon: Crown },
  { to: "/account/vouchers", label: "Voucher", icon: Ticket },
  { to: "/account/wishlist", label: "Yêu thích", icon: Heart, badgeKey: "wishlist" },
  { to: "/account/addresses", label: "Sổ địa chỉ", icon: MapPin },
  { to: "/account/chat", label: "Tin nhắn", icon: MessageSquare, badgeKey: "chat" },
  { to: "/qr-verify/cabinet", label: "Tủ xác thực", icon: ShieldCheck },
  { to: "/account/settings", label: "Cài đặt", icon: Settings },
]

export function AccountLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAuthStore((s) => s.user)
  const wishlistCount = useWishlistStore((s) => s.items.length)
  const { conversations } = useConversations()
  const logout = useLogout()
  const unreadConversations = conversations.reduce(
    (sum, conversation) => sum + conversation.unreadCount,
    0
  )

  function itemBadge(item: SidebarItem) {
    if (item.badgeKey === "wishlist" && wishlistCount > 0) {
      return String(wishlistCount)
    }
    if (item.badgeKey === "chat" && unreadConversations > 0) {
      return String(unreadConversations)
    }
    return null
  }

  async function handleLogout() {
    if (!confirm("Đăng xuất khỏi tài khoản?")) return
    try {
      await logout.mutateAsync()
      toast("Đã đăng xuất")
      navigate("/")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Đăng xuất thất bại")
    }
  }

  // Mobile: show sidebar only on /account exactly, else show child
  const isAccountRoot = location.pathname === "/account"

  return (
    <div className="container-acf py-4 lg:py-6">
      <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
        <aside
          className={cn(
            "lg:block",
            isAccountRoot ? "block" : "hidden lg:block"
          )}
        >
          {/* User card */}
          <div className="card mb-4 p-4">
            <div className="flex items-center gap-3">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-12 w-12 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-brand-red-500 to-brand-red-700 text-lg font-bold text-white">
                  {(user?.name ?? "K")[0].toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <div className="truncate font-semibold text-neutral-900">
                    {user?.name ?? "Khách"}
                  </div>
                  {user?.isVerified && (
                    <ShieldCheck size={14} className="shrink-0 text-brand-gold-500" />
                  )}
                </div>
                <div className="truncate text-xs text-neutral-500">
                  {user?.email ?? "Chưa đăng nhập"}
                </div>
              </div>
            </div>
            {!user && (
              <button
                onClick={() => navigate("/login")}
                className="btn-primary mt-3 w-full justify-center text-xs"
              >
                Đăng nhập / Đăng ký
              </button>
            )}
          </div>

          {/* Menu */}
          <nav className="card overflow-hidden">
            {SIDEBAR_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 border-b border-neutral-100 px-4 py-3 text-sm transition-colors last:border-0",
                    isActive
                      ? "bg-brand-red-50 font-semibold text-brand-red-700"
                      : "text-neutral-700 hover:bg-neutral-50"
                  )
                }
              >
                <item.icon size={18} />
                <span className="flex-1">{item.label}</span>
                {itemBadge(item) && (
                  <span className="rounded-full bg-brand-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
                    {itemBadge(item)}
                  </span>
                )}
                <ChevronRight size={14} className="text-neutral-400 lg:hidden" />
              </NavLink>
            ))}
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-4 py-3 text-sm text-rose-600 hover:bg-rose-50"
            >
              <LogOut size={18} />
              <span className="flex-1 text-left">Đăng xuất</span>
            </button>
          </nav>
        </aside>

        <div className={cn(isAccountRoot && "hidden lg:block")}>
          <Outlet />
        </div>
      </div>
    </div>
  )
}
