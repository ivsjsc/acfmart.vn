import { Link } from "react-router-dom"

export function NotFound() {
  return (
    <div className="container-acf flex min-h-[60vh] items-center justify-center py-16">
      <div className="text-center">
        <p className="text-sm font-semibold text-brand-red-600">404</p>
        <h1 className="mt-2 text-4xl font-bold text-neutral-900">
          Không tìm thấy trang
        </h1>
        <p className="mt-4 text-sm text-neutral-600">
          Trang bạn tìm không tồn tại hoặc đã được di chuyển.
        </p>
        <Link to="/" className="btn-primary mt-6">
          Về trang chủ
        </Link>
      </div>
    </div>
  )
}
