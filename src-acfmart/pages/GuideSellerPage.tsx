import { Link } from "react-router-dom"
import { ArrowLeft, Store, Package, Upload, ClipboardCheck, TrendingUp, CreditCard } from "lucide-react"

export default function GuideSellerPage() {
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
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-100">
              <Store size={24} className="text-orange-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">
                Hướng dẫn dành cho Nhà bán hàng
              </h1>
              <p className="mt-1 text-sm text-neutral-500">
                Từ đăng ký → tạo Shop → thêm sản phẩm → kiểm duyệt → bắt đầu bán
              </p>
            </div>
          </div>

          {/* Timeline overview */}
          <div className="mb-8 overflow-x-auto">
            <div className="flex items-center gap-2 min-w-[500px]">
              <TimelineStep label="Đăng ký" active />
              <TimelineArrow />
              <TimelineStep label="Upload giấy tờ" active />
              <TimelineArrow />
              <TimelineStep label="Chờ duyệt" />
              <TimelineArrow />
              <TimelineStep label="Tạo sản phẩm" />
              <TimelineArrow />
              <TimelineStep label="Bán hàng!" />
            </div>
          </div>

          {/* Step 1 */}
          <section className="mb-8">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-neutral-900">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-600 text-xs font-bold text-white">
                1
              </span>
              Đăng ký trở thành Nhà bán hàng
            </h2>
            <div className="space-y-3 pl-9">
              <div className="rounded-lg border border-neutral-100 bg-neutral-50 p-4 text-sm space-y-2">
                <p><strong>Bước 1:</strong> Đăng nhập tài khoản ACFMart (hoặc đăng ký mới)</p>
                <p><strong>Bước 2:</strong> Truy cập <code className="rounded bg-neutral-200 px-1.5 py-0.5">/seller-register</code> hoặc bấm "Bán hàng cùng ACFMart"</p>
                <p><strong>Bước 3:</strong> Điền thông tin:</p>
                <ul className="ml-4 list-disc text-neutral-600 space-y-1">
                  <li>Tên Shop (sẽ hiển thị cho người mua)</li>
                  <li>Loại hình: Cá nhân / Hộ kinh doanh / Doanh nghiệp</li>
                  <li>Họ tên chủ shop, email, số điện thoại</li>
                  <li>Mã số thuế (nếu có)</li>
                  <li>Số CCCD/CMND</li>
                  <li>Địa chỉ lấy hàng</li>
                  <li>Thông tin ngân hàng (nhận thanh toán)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Step 2 */}
          <section className="mb-8">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-neutral-900">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-600 text-xs font-bold text-white">
                2
              </span>
              Upload giấy tờ xác minh
            </h2>
            <div className="space-y-3 pl-9">
              <div className="rounded-lg border border-neutral-100 bg-neutral-50 p-4 text-sm space-y-2">
                <p className="font-semibold text-neutral-800">Tài liệu cần nộp:</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  <DocCard icon={<Upload size={16} />} title="CCCD mặt trước" required />
                  <DocCard icon={<Upload size={16} />} title="CCCD mặt sau" required />
                  <DocCard icon={<Upload size={16} />} title="Giấy phép kinh doanh" required={false} />
                </div>
                <p className="text-neutral-500 text-xs mt-2">
                  Chấp nhận: ảnh chụp (JPG, PNG) hoặc PDF. Dung lượng tối đa 10MB/file.
                </p>
              </div>
            </div>
          </section>

          {/* Step 3 */}
          <section className="mb-8">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-neutral-900">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-600 text-xs font-bold text-white">
                3
              </span>
              Chờ kiểm duyệt
            </h2>
            <div className="space-y-3 pl-9">
              <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
                <ClipboardCheck size={16} className="mb-1 inline text-blue-600" />{" "}
                Sau khi gửi hồ sơ, Kiểm duyệt viên sẽ xem xét trong vòng <strong>1-3 ngày làm việc</strong>.
                <ul className="mt-2 space-y-1 list-inside list-disc">
                  <li><strong>Phê duyệt:</strong> Bạn nhận thông báo và có thể bắt đầu đăng sản phẩm</li>
                  <li><strong>Yêu cầu bổ sung:</strong> Bạn sẽ nhận lý do và cần cập nhật hồ sơ</li>
                  <li><strong>Từ chối:</strong> Hồ sơ không đạt — xem lý do và nộp lại</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Step 4 */}
          <section className="mb-8">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-neutral-900">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-600 text-xs font-bold text-white">
                4
              </span>
              Thêm sản phẩm & Bắt đầu bán
            </h2>
            <div className="space-y-3 pl-9">
              <div className="rounded-lg border border-neutral-100 bg-neutral-50 p-4 text-sm space-y-2">
                <p className="font-semibold text-neutral-800">Sau khi được duyệt, truy cập Seller Center:</p>
                <p>Vào <code className="rounded bg-neutral-200 px-1.5 py-0.5">/seller</code> hoặc <code className="rounded bg-neutral-200 px-1.5 py-0.5">/login/store</code></p>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <FeatureCard
                    icon={<Package size={18} className="text-orange-600" />}
                    title="Thêm sản phẩm"
                    desc="Seller Center → Sản phẩm → Thêm mới. Nhập tên, giá, ảnh, mô tả, danh mục."
                  />
                  <FeatureCard
                    icon={<TrendingUp size={18} className="text-green-600" />}
                    title="Theo dõi đơn hàng"
                    desc="Dashboard hiển thị đơn mới, doanh thu, đánh giá."
                  />
                  <FeatureCard
                    icon={<CreditCard size={18} className="text-blue-600" />}
                    title="Nhận thanh toán"
                    desc="Tiền tự động chuyển về ngân hàng sau khi người mua xác nhận."
                  />
                  <FeatureCard
                    icon={<Store size={18} className="text-purple-600" />}
                    title="Trang trưng bày"
                    desc="Sản phẩm xuất hiện trên sàn ACFMart ngay sau khi đăng."
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Tips */}
          <section className="mb-6">
            <h2 className="mb-3 text-lg font-bold text-neutral-900">Mẹo bán hàng hiệu quả</h2>
            <ul className="space-y-2 text-sm text-neutral-700">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500" />
                Chụp ảnh sản phẩm rõ nét, nền trắng, nhiều góc
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500" />
                Viết mô tả chi tiết: chất liệu, kích thước, xuất xứ, hạn sử dụng
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500" />
                Đặt giá cạnh tranh — kiểm tra sản phẩm tương tự trên sàn
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500" />
                Phản hồi chat nhanh — seller phản hồi nhanh được ưu tiên hiển thị
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500" />
                Tạo video ngắn giới thiệu sản phẩm tại <Link to="/guide/social" className="text-orange-600 underline">acfmart.online</Link> để tăng lượt xem
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
                to="/guide/moderator"
                className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
              >
                Hướng dẫn Kiểm duyệt viên →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function TimelineStep({ label, active }: { label: string; active?: boolean }) {
  return (
    <div className={`rounded-lg px-3 py-2 text-center text-xs font-medium ${
      active ? "bg-orange-100 text-orange-700 border border-orange-200" : "bg-neutral-100 text-neutral-600 border border-neutral-200"
    }`}>
      {label}
    </div>
  )
}

function TimelineArrow() {
  return <div className="h-px w-6 shrink-0 bg-neutral-300" />
}

function DocCard({ icon, title, required }: { icon: React.ReactNode; title: string; required: boolean }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white p-2.5">
      <span className="text-neutral-400">{icon}</span>
      <span className="text-xs font-medium text-neutral-700">{title}</span>
      {required && <span className="ml-auto text-[10px] font-bold text-red-500">*BẮT BUỘC</span>}
    </div>
  )
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="rounded-lg border border-neutral-200 p-3">
      {icon}
      <p className="mt-1.5 text-sm font-semibold text-neutral-800">{title}</p>
      <p className="mt-0.5 text-xs text-neutral-500">{desc}</p>
    </div>
  )
}
