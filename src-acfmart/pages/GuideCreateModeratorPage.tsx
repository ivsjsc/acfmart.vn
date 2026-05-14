import { Link } from "react-router-dom"
import { ArrowLeft, Shield, UserCog, CheckCircle, AlertTriangle } from "lucide-react"

export default function GuideCreateModeratorPage() {
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
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-rose-100">
              <Shield size={24} className="text-rose-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">
                Hướng dẫn tạo tài khoản Kiểm duyệt viên
              </h1>
              <p className="mt-1 text-sm text-neutral-500">
                Dành cho Admin — Gán quyền moderator cho nhân sự
              </p>
            </div>
          </div>

          {/* Prerequisites */}
          <div className="mb-8 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-600" />
              <div>
                <p className="font-semibold text-amber-800">Điều kiện tiên quyết</p>
                <ul className="mt-1 list-inside list-disc text-sm text-amber-700">
                  <li>Bạn phải có tài khoản với role <strong>admin</strong></li>
                  <li>Người được gán role phải đã đăng ký tài khoản trên hệ thống</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Method 1: Admin Panel */}
          <section className="mb-8">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-neutral-900">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-red-600 text-xs font-bold text-white">
                1
              </span>
              Cách 1: Qua Admin Panel (Khuyến nghị)
            </h2>

            <div className="space-y-4 pl-9">
              <Step number="1.1" title="Đăng nhập với tài khoản Admin">
                <p>Truy cập <code className="rounded bg-neutral-100 px-2 py-0.5 text-sm">/login/cloud</code> hoặc <code className="rounded bg-neutral-100 px-2 py-0.5 text-sm">/login</code></p>
                <p className="text-neutral-500">Đăng nhập bằng email có role admin.</p>
              </Step>

              <Step number="1.2" title="Vào trang Quản lý User">
                <p>Đi đến <code className="rounded bg-neutral-100 px-2 py-0.5 text-sm">/admin/users</code></p>
                <p className="text-neutral-500">Hoặc từ Admin Panel → menu "Quản lý User"</p>
              </Step>

              <Step number="1.3" title="Tìm tài khoản cần gán role">
                <p>Sử dụng bộ lọc hoặc tìm theo email/tên.</p>
              </Step>

              <Step number="1.4" title="Gán role Moderator">
                <p>Bấm nút <strong>"Đổi Role"</strong> → chọn <strong>"moderator"</strong> → Xác nhận.</p>
                <p className="text-neutral-500">Hệ thống sẽ ghi nhật ký thay đổi vào Audit Log.</p>
              </Step>

              <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                <p className="flex items-center gap-2 text-sm font-medium text-green-800">
                  <CheckCircle size={14} /> Hoàn tất! Người đó giờ có quyền kiểm duyệt viên.
                </p>
              </div>
            </div>
          </section>

          {/* Method 2: Firebase Console */}
          <section className="mb-8">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-neutral-900">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-700 text-xs font-bold text-white">
                2
              </span>
              Cách 2: Qua Firebase Console (Lần đầu setup)
            </h2>

            <div className="space-y-4 pl-9">
              <Step number="2.1" title="Mở Firebase Console">
                <p>
                  Truy cập:{" "}
                  <a
                    href="https://console.firebase.google.com/project/ecommerce-acf/firestore/data/users"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-blue-600 underline"
                  >
                    Firebase Console → Firestore → users
                  </a>
                </p>
              </Step>

              <Step number="2.2" title="Tìm document của user">
                <p>Mỗi document có ID = UID của user (lấy từ tab Authentication).</p>
              </Step>

              <Step number="2.3" title="Sửa field role">
                <p>Click vào document → <strong>Edit</strong> → field <code className="rounded bg-neutral-100 px-2 py-0.5 text-sm">role</code> → đổi giá trị thành <code className="rounded bg-neutral-100 px-2 py-0.5 text-sm">"moderator"</code></p>
              </Step>

              <Step number="2.4" title="(Tùy chọn) Set Custom Claims">
                <p className="text-neutral-500">
                  Để Firestore rules nhận diện role, chạy lệnh trong Firebase Cloud Shell:
                </p>
                <pre className="mt-2 overflow-x-auto rounded-lg bg-neutral-900 p-3 text-xs text-green-400">
{`const admin = require('firebase-admin');
admin.initializeApp();
await admin.auth().setCustomUserClaims('UID_CUA_USER', { role: 'moderator' });`}
                </pre>
              </Step>
            </div>
          </section>

          {/* Roles explained */}
          <section className="mb-6">
            <h2 className="mb-3 text-lg font-bold text-neutral-900">
              <UserCog size={18} className="mr-2 inline text-neutral-600" />
              Bảng quyền theo Role
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 text-neutral-600">
                    <th className="py-2 pr-4">Chức năng</th>
                    <th className="py-2 px-3 text-center">Customer</th>
                    <th className="py-2 px-3 text-center">Seller</th>
                    <th className="py-2 px-3 text-center">Moderator</th>
                    <th className="py-2 px-3 text-center">Admin</th>
                  </tr>
                </thead>
                <tbody className="text-neutral-700">
                  <Row label="Mua hàng" perms={[true, true, true, true]} />
                  <Row label="Tạo Shop & bán hàng" perms={[false, true, false, true]} />
                  <Row label="Duyệt/khóa seller" perms={[false, false, true, true]} />
                  <Row label="Xem Audit Log" perms={[false, false, true, true]} />
                  <Row label="Quản lý User & Role" perms={[false, false, false, true]} />
                  <Row label="Xóa dữ liệu" perms={[false, false, false, true]} />
                </tbody>
              </table>
            </div>
          </section>

          {/* Related links */}
          <div className="border-t border-neutral-200 pt-6">
            <p className="mb-2 text-sm font-semibold text-neutral-600">Xem thêm:</p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/guide/moderator"
                className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
              >
                Hướng dẫn Kiểm duyệt viên →
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

function Step({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-neutral-100 bg-neutral-50 p-4">
      <p className="mb-1 text-sm font-bold text-neutral-800">
        <span className="mr-2 text-brand-red-600">{number}</span>
        {title}
      </p>
      <div className="text-sm text-neutral-700 space-y-1">{children}</div>
    </div>
  )
}

function Row({ label, perms }: { label: string; perms: boolean[] }) {
  return (
    <tr className="border-b border-neutral-100">
      <td className="py-2 pr-4">{label}</td>
      {perms.map((p, i) => (
        <td key={i} className="py-2 px-3 text-center">
          {p ? (
            <span className="text-green-600">●</span>
          ) : (
            <span className="text-neutral-300">—</span>
          )}
        </td>
      ))}
    </tr>
  )
}
