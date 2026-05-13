import { Link } from "react-router-dom"
import { ArrowLeft, Shield, CheckCircle, XCircle, Pause, Eye, FileText, Bell } from "lucide-react"

export default function GuideModeratorPage() {
  return (
    <div className="min-h-screen bg-neutral-50 py-10">
      <div className="container-acf max-w-3xl">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-brand-red-600"
        >
          <ArrowLeft size={14} /> Về trang chủ
        </Link>

        <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
          {/* Header */}
          <div className="mb-8 flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-100">
              <Shield size={24} className="text-sky-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">
                Hướng dẫn dành cho Kiểm duyệt viên
              </h1>
              <p className="mt-1 text-sm text-neutral-500">
                Quy trình phê duyệt, từ chối, tạm khóa tài khoản Nhà bán hàng
              </p>
            </div>
          </div>

          {/* Overview */}
          <section className="mb-8">
            <h2 className="mb-3 text-lg font-bold text-neutral-900">Tổng quan vai trò</h2>
            <p className="text-sm text-neutral-700 leading-relaxed">
              Kiểm duyệt viên (Moderator) là người xác minh và phê duyệt hồ sơ đăng ký bán hàng,
              giám sát hoạt động của Nhà bán, và xử lý báo cáo hàng giả. Bạn có quyền duyệt/từ chối/tạm khóa
              nhưng <strong>không thể xóa</strong> dữ liệu hay thay đổi role user (chỉ Admin).
            </p>
          </section>

          {/* Step 1: Access */}
          <section className="mb-8">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-neutral-900">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-600 text-xs font-bold text-white">
                1
              </span>
              Đăng nhập & Truy cập Admin Panel
            </h2>
            <div className="space-y-3 pl-9">
              <div className="rounded-lg border border-neutral-100 bg-neutral-50 p-4 text-sm">
                <p>1. Đăng nhập tại <code className="rounded bg-neutral-200 px-1.5 py-0.5">/login/cloud</code> (trang nội bộ Ban quản lý)</p>
                <p className="mt-1">2. Sau đăng nhập, vào <code className="rounded bg-neutral-200 px-1.5 py-0.5">/admin</code> → Dashboard tổng quan</p>
                <p className="mt-1">3. Menu trái: chọn <strong>"Duyệt Seller"</strong> để vào trang kiểm duyệt</p>
              </div>
            </div>
          </section>

          {/* Step 2: Review vendors */}
          <section className="mb-8">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-neutral-900">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-600 text-xs font-bold text-white">
                2
              </span>
              Phê duyệt / Từ chối Nhà bán hàng
            </h2>
            <div className="space-y-4 pl-9">
              <div className="rounded-lg border border-neutral-100 bg-neutral-50 p-4 text-sm">
                <p className="font-semibold text-neutral-800 mb-2">Tại trang Duyệt Seller (<code className="rounded bg-neutral-200 px-1.5 py-0.5">/admin/vendors</code>):</p>
                <ul className="space-y-1 text-neutral-700">
                  <li>• Tab <strong>"Chờ duyệt"</strong> — hiển thị hồ sơ mới cần xem xét</li>
                  <li>• Click vào tên seller để xem chi tiết hồ sơ</li>
                  <li>• Kiểm tra: CCCD, giấy phép KD, thông tin shop, địa chỉ lấy hàng</li>
                </ul>
              </div>

              {/* Actions */}
              <div className="grid gap-3 sm:grid-cols-3">
                <ActionCard
                  icon={<CheckCircle size={20} className="text-green-600" />}
                  title="Phê duyệt"
                  desc="Seller đủ điều kiện → cho phép bán hàng"
                  color="border-green-200 bg-green-50"
                />
                <ActionCard
                  icon={<XCircle size={20} className="text-red-600" />}
                  title="Từ chối"
                  desc="Hồ sơ không hợp lệ → yêu cầu bổ sung"
                  color="border-red-200 bg-red-50"
                />
                <ActionCard
                  icon={<Pause size={20} className="text-amber-600" />}
                  title="Tạm khóa"
                  desc="Vi phạm quy định → ngừng hoạt động"
                  color="border-amber-200 bg-amber-50"
                />
              </div>

              <div className="rounded-lg border border-neutral-100 bg-neutral-50 p-4 text-sm">
                <p className="font-semibold text-neutral-800 mb-2">Khi phê duyệt, bạn cần:</p>
                <ul className="space-y-1 text-neutral-700">
                  <li>• Chọn mức KYC: <strong>Basic</strong> / <strong>Verified</strong> / <strong>Premium</strong></li>
                  <li>• Basic = xác minh CCCD; Verified = có giấy phép KD; Premium = đối tác ưu tiên</li>
                </ul>
                <p className="font-semibold text-neutral-800 mb-2 mt-3">Khi từ chối / tạm khóa:</p>
                <ul className="space-y-1 text-neutral-700">
                  <li>• <strong>Bắt buộc</strong> nhập lý do (hiển thị cho seller)</li>
                  <li>• Seller sẽ nhận thông báo kèm lý do</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Step 3: Monitor */}
          <section className="mb-8">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-neutral-900">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-600 text-xs font-bold text-white">
                3
              </span>
              Giám sát & Xử lý báo cáo
            </h2>
            <div className="space-y-3 pl-9">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-neutral-200 p-4">
                  <Eye size={18} className="mb-2 text-neutral-500" />
                  <p className="text-sm font-semibold text-neutral-800">Báo cáo hàng giả</p>
                  <p className="mt-1 text-xs text-neutral-500">
                    <code>/admin/reports</code> — Xem báo cáo từ người mua, xác minh & xử lý
                  </p>
                </div>
                <div className="rounded-lg border border-neutral-200 p-4">
                  <FileText size={18} className="mb-2 text-neutral-500" />
                  <p className="text-sm font-semibold text-neutral-800">Nhật ký hệ thống</p>
                  <p className="mt-1 text-xs text-neutral-500">
                    <code>/admin/audit-logs</code> — Theo dõi mọi thao tác phê duyệt/từ chối
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Step 4: Notifications */}
          <section className="mb-8">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-neutral-900">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-600 text-xs font-bold text-white">
                4
              </span>
              Thông báo tự động
            </h2>
            <div className="pl-9">
              <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
                <Bell size={16} className="mb-1 inline text-blue-600" /> Hệ thống sẽ tự động gửi thông báo:
                <ul className="mt-2 space-y-1 list-inside list-disc">
                  <li>Khi có seller mới đăng ký → thông báo cho tất cả moderator</li>
                  <li>Khi bạn phê duyệt/từ chối → thông báo cho seller</li>
                  <li>Khi có báo cáo hàng giả mới → thông báo cho moderator</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Tips */}
          <section className="mb-6">
            <h2 className="mb-3 text-lg font-bold text-neutral-900">Lưu ý quan trọng</h2>
            <ul className="space-y-2 text-sm text-neutral-700">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-red-500" />
                Kiểm tra kỹ số CCCD/CMND trùng khớp với ảnh chụp
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-red-500" />
                Giấy phép kinh doanh phải còn hiệu lực (chưa hết hạn)
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-red-500" />
                Nếu nghi ngờ hồ sơ giả, liên hệ seller qua email/SDT trước khi từ chối
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-red-500" />
                Mọi thao tác được ghi nhật ký — không thể "undo", chỉ admin mới xóa được
              </li>
            </ul>
          </section>

          {/* Related */}
          <div className="border-t border-neutral-200 pt-6">
            <p className="mb-2 text-sm font-semibold text-neutral-600">Xem thêm:</p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/guide/create-moderator"
                className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
              >
                Cách tạo tài khoản Moderator →
              </Link>
              <Link
                to="/guide/seller"
                className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
              >
                Hướng dẫn Nhà bán hàng →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ActionCard({
  icon,
  title,
  desc,
  color,
}: {
  icon: React.ReactNode
  title: string
  desc: string
  color: string
}) {
  return (
    <div className={`rounded-lg border p-3 ${color}`}>
      {icon}
      <p className="mt-1.5 text-sm font-semibold text-neutral-800">{title}</p>
      <p className="mt-0.5 text-xs text-neutral-600">{desc}</p>
    </div>
  )
}
