import { Link } from "react-router-dom";

export function NotFound() {
  return (
    <div className="container-acf py-16">
      <div className="mx-auto max-w-md text-center">
        <h1 className="text-4xl font-bold text-red-600 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-neutral-900 mb-4">Trang không tồn tại</h2>
        <p className="text-neutral-600 mb-6">
          Rất tiếc, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
        </p>
        <Link to="/" className="btn-primary">
          Quay về trang chủ
        </Link>
      </div>
    </div>
  );
}