import { Link } from "react-router-dom"
import { Package } from "lucide-react"

export function CompareScreen() {
  return (
    <div className="container-acf py-16">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-gold-100 text-brand-gold-600">
          <Package size={28} />
        </div>
        <h1 className="text-2xl font-bold text-neutral-900">So sánh sản phẩm</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Bạn chưa chọn sản phẩm nào để so sánh. Sản phẩm được thêm từ hành động
          thật của người dùng sẽ hiển thị tại đây.
        </p>
        <Link to="/categories" className="btn-primary mt-5">
          Khám phá sản phẩm
        </Link>
      </div>
    </div>
  )
}
