import { Link } from "react-router-dom"
import { Construction } from "lucide-react"

interface PlaceholderProps {
  title: string
  description?: string
}

export function Placeholder({ title, description }: PlaceholderProps) {
  return (
    <div className="container-acf py-16">
      <div className="mx-auto max-w-md rounded-2xl border border-dashed border-neutral-300 bg-white p-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-gold-100 text-brand-gold-600">
          <Construction size={28} />
        </div>
        <h1 className="text-2xl font-bold text-neutral-900">{title}</h1>
        <p className="mt-2 text-sm text-neutral-600">
          {description ??
            "Màn hình này đang được phát triển trong Phase 2. Spec đã có sẵn trong git history."}
        </p>
        <Link to="/" className="btn-primary mt-6">
          Về trang chủ
        </Link>
      </div>
    </div>
  )
}
