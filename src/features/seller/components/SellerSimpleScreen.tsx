import { Link } from "react-router-dom"
import { ArrowRight, Sparkles, type LucideIcon } from "lucide-react"

interface SimpleScreenProps {
  icon: LucideIcon
  title: string
  description: string
  highlight?: { label: string; value: string }
  cta?: string
  comingSoon?: string[]
}

export function SellerSimpleScreen({
  icon: Icon,
  title,
  description,
  highlight,
  cta,
  comingSoon,
}: SimpleScreenProps) {
  return (
    <div className="p-4 lg:p-6">
      <h1 className="mb-1 text-2xl font-bold text-neutral-900 lg:text-3xl">
        {title}
      </h1>
      <p className="mb-6 text-sm text-neutral-600">{description}</p>

      {highlight && (
        <div className="card mb-5 overflow-hidden">
          <div className="bg-gradient-to-br from-brand-red-500 to-brand-red-700 p-6 text-white">
            <div className="text-xs uppercase tracking-wider text-white/80">
              {highlight.label}
            </div>
            <div className="mt-2 text-4xl font-extrabold">{highlight.value}</div>
            {cta && (
              <button className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-bold text-brand-red-600 hover:scale-105">
                {cta} <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>
      )}

      {comingSoon && (
        <div className="card p-6">
          <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-neutral-900">
            <Sparkles size={16} className="text-brand-gold-500" />
            Tính năng đang phát triển
          </h2>
          <ul className="space-y-2">
            {comingSoon.map((feature) => (
              <li
                key={feature}
                className="flex items-start gap-2 text-sm text-neutral-700"
              >
                <Icon size={14} className="mt-0.5 shrink-0 text-brand-red-500" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      )}

      <Link
        to="/aivy"
        className="card mt-5 flex items-center justify-between p-4 hover:bg-neutral-50"
      >
        <div className="flex items-center gap-3">
          <Sparkles className="text-brand-gold-500" />
          <div>
            <div className="font-semibold text-neutral-900">Aivy có thể hỗ trợ</div>
            <div className="text-xs text-neutral-500">
              Hỏi Aivy về tính năng này
            </div>
          </div>
        </div>
        <ArrowRight size={16} className="text-neutral-400" />
      </Link>
    </div>
  )
}
