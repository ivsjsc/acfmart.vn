import { Logo } from "../../../components/Logo"
import { BuyerHomeLink } from "../../../components/BuyerHomeLink"
import { ArrowLeft, ShieldCheck } from "lucide-react"
import bannerDesktop from "../../../assets/banner-desktop.png"

interface AuthLayoutProps {
  title: string
  subtitle?: string
  children: React.ReactNode
  footer?: React.ReactNode
}

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="relative min-h-[calc(100vh-64px)] overflow-hidden bg-neutral-50 py-8">
      <img
        src={bannerDesktop}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full scale-105 object-cover opacity-20 blur-sm"
      />
      <div className="absolute inset-0 bg-white/80" />
      <div className="container-acf relative">
        <div className="mx-auto max-w-md">
          <div className="mb-4 flex justify-center">
            <a
              href="https://acfmart.vn"
              className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-4 py-2 text-xs font-semibold text-neutral-700 shadow-sm backdrop-blur transition-colors hover:border-brand-red-200 hover:text-brand-red-600"
            >
              <ArrowLeft size={14} />
              Trở lại Sàn (acfmart.vn)
            </a>
          </div>
          <div className="mb-6 flex justify-center">
            <BuyerHomeLink>
              <Logo size="lg" />
            </BuyerHomeLink>
          </div>

          <div className="card overflow-hidden bg-white/95 p-6 shadow-lg shadow-neutral-900/5 backdrop-blur md:p-8">
            <h1 className="text-2xl font-extrabold text-neutral-900">{title}</h1>
            {subtitle && (
              <p className="mt-1 text-sm text-neutral-600">{subtitle}</p>
            )}

            <div className="mt-6">{children}</div>
          </div>

          {footer && <div className="mt-4 text-center text-sm">{footer}</div>}

          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-neutral-500">
            <ShieldCheck size={14} className="text-brand-gold-500" />
            <span>Bảo mật bởi IVS & Quỹ Chống Hàng Giả VN</span>
          </div>
        </div>
      </div>
    </div>
  )
}
