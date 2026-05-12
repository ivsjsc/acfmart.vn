import { Link } from "react-router-dom"
import { Logo } from "../../../components/Logo"
import { ShieldCheck } from "lucide-react"

interface AuthLayoutProps {
  title: string
  subtitle?: string
  children: React.ReactNode
  footer?: React.ReactNode
}

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-brand-red-50 via-white to-brand-gold-50 py-8">
      <div className="container-acf">
        <div className="mx-auto max-w-md">
          <div className="mb-6 flex justify-center">
            <Link to="/">
              <Logo size="lg" />
            </Link>
          </div>

          <div className="card overflow-hidden p-6 md:p-8">
            <h1 className="text-2xl font-extrabold text-neutral-900">{title}</h1>
            {subtitle && (
              <p className="mt-1 text-sm text-neutral-600">{subtitle}</p>
            )}

            <div className="mt-6">{children}</div>
          </div>

          {footer && <div className="mt-4 text-center text-sm">{footer}</div>}

          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-neutral-500">
            <ShieldCheck size={14} className="text-brand-gold-500" />
            <span>Bảo mật bởi ACFMart · Quỹ Chống Hàng Giả</span>
          </div>
        </div>
      </div>
    </div>
  )
}
