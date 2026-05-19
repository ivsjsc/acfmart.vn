import { NavLink } from "react-router-dom"
import { Home, Users, QrCode, ShoppingBag, User } from "lucide-react"
import { cn } from "../lib/cn"
import { useCartStore } from "../stores/cart-store"
import { isSocialDomain, isKnownProductionDomain, getCanonicalOrigin } from "../lib/domain"

interface BottomNavItem {
  to: string
  label: string
  icon: typeof Home
  end?: boolean
  primary?: boolean
  external?: boolean
}

function useBottomNavItems(): BottomNavItem[] {
  const onSocial = isSocialDomain() && isKnownProductionDomain()
  const buyerOrigin = getCanonicalOrigin("buyer")

  function buyerHref(path: string) {
    return onSocial ? buyerOrigin + path : path
  }

  return [
    { to: buyerHref("/"), label: "Trang chủ", icon: Home, end: true, external: onSocial },
    { to: "/social", label: "Cộng đồng", icon: Users },
    { to: buyerHref("/qr-verify"), label: "Quét QR", icon: QrCode, primary: true, external: onSocial },
    { to: buyerHref("/account/orders"), label: "Đơn hàng", icon: ShoppingBag, external: onSocial },
    { to: buyerHref("/account"), label: "Tài khoản", icon: User, external: onSocial },
  ]
}

export function BottomNav() {
  const totalItems = useCartStore((s) => s.totalItems())
  const items = useBottomNavItems()

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-neutral-200 bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_12px_rgba(0,0,0,0.04)] lg:hidden"
      aria-label="Điều hướng chính"
    >
      <div className="mx-auto grid max-w-md grid-cols-5">
        {items.map((item) => {
          const baseClass =
            "relative flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition-colors"

          const content = (
            <>
              {item.primary ? (
                <div className="-mt-6 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-brand-red-500 to-brand-red-700 text-white shadow-lg">
                  <item.icon size={22} />
                </div>
              ) : (
                <item.icon size={20} />
              )}
              <span className={item.primary ? "mt-0" : ""}>{item.label}</span>
              {item.to.endsWith("/account/orders") && totalItems > 0 && (
                <span className="absolute right-3 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand-red-500 px-1 text-[9px] font-bold text-white">
                  {totalItems > 9 ? "9+" : totalItems}
                </span>
              )}
            </>
          )

          if (item.external) {
            return (
              <a
                key={item.to}
                href={item.to}
                className={cn(baseClass, "text-neutral-500 hover:text-neutral-700")}
              >
                {content}
              </a>
            )
          }

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  baseClass,
                  isActive
                    ? "text-brand-red-600"
                    : "text-neutral-500 hover:text-neutral-700"
                )
              }
            >
              {content}
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
