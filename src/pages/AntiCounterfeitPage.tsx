import { Link } from "react-router-dom"
import {
  ArrowLeft,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  FileSearch,
  QrCode,
  Scale,
  ShieldCheck,
  Store,
  Wallet,
} from "lucide-react"
import bannerDesktop from "../assets/banner-desktop.png"

const pillars = [
  {
    icon: Store,
    title: "Duyệt seller trước khi bán",
    description:
      "Seller phải hoàn tất KYC, giấy phép kinh doanh và hồ sơ nguồn gốc hàng hóa trước khi được mở bán.",
  },
  {
    icon: QrCode,
    title: "Xác thực QR ACF",
    description:
      "Sản phẩm rủi ro cao được gắn mã xác thực để đối chiếu lô hàng, nhà cung cấp, chứng từ và lịch sử quét.",
  },
  {
    icon: Wallet,
    title: "Escrow giữ tiền",
    description:
      "Giao dịch được giữ trong quy trình kiểm soát. Khi có tranh chấp, ACFMart tạm dừng giải ngân để xác minh.",
  },
  {
    icon: Scale,
    title: "Bồi thường 200%",
    description:
      "Nếu xác minh là hàng giả, người mua được hoàn 100% đơn hàng và bồi thường thêm 100% theo chính sách ACF.",
  },
]

const process = [
  "Người mua quét QR hoặc gửi báo cáo kèm bằng chứng.",
  "ACFMart khóa trạng thái tranh chấp và tạm giữ giao dịch liên quan.",
  "Trung tâm kỹ thuật đối chiếu mã, lô hàng, chứng từ và dấu hiệu bất thường.",
  "Moderator kết luận: chính hãng, cần bổ sung hồ sơ, hoặc xác nhận hàng giả.",
  "Hệ thống hoàn tiền, bồi thường và áp dụng chế tài với seller vi phạm.",
]

const categories = [
  {
    level: "Cao",
    className: "bg-rose-50 text-rose-700",
    products: "Mỹ phẩm, thực phẩm chức năng, dược phẩm, thực phẩm",
    requirement: "Hồ sơ pháp lý, chứng từ nguồn gốc, tem QR và kiểm duyệt thủ công.",
  },
  {
    level: "Trung bình",
    className: "bg-amber-50 text-amber-700",
    products: "Điện tử, thời trang thương hiệu, phụ kiện, hàng nhập khẩu",
    requirement: "Hóa đơn nhập/sản xuất, chứng nhận phân phối hoặc ủy quyền thương hiệu.",
  },
  {
    level: "Tiêu chuẩn",
    className: "bg-emerald-50 text-emerald-700",
    products: "Gia dụng, sách, văn phòng phẩm, sản phẩm phổ thông",
    requirement: "Thông tin xuất xứ rõ ràng, nhãn hàng đúng quy định và hậu kiểm định kỳ.",
  },
]

export function AntiCounterfeitPage() {
  return (
    <div className="bg-white">
      <section className="container-acf py-8 lg:py-12">
        <Link
          to="/"
          className="mb-4 inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-brand-red-600"
        >
          <ArrowLeft size={12} />
          Về trang chủ
        </Link>

        <div className="grid gap-8 lg:grid-cols-[1fr_520px] lg:items-center">
          <div>
            <span className="badge-verified px-3 py-1 text-xs">
              <ShieldCheck size={14} />
              Chương trình chống hàng giả ACFMart
            </span>
            <h1 className="mt-5 text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl">
              Mua sắm minh bạch, xác thực được nguồn gốc.
            </h1>
            <p className="mt-5 text-base leading-7 text-neutral-600">
              ACFMart kết hợp kiểm duyệt seller, xác thực QR, Escrow giữ tiền và đội
              ngũ kỹ thuật chống hàng giả để bảo vệ người tiêu dùng Việt Nam trong
              toàn bộ hành trình mua sắm.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/qr-verify" className="btn-primary">
                <QrCode size={16} />
                Quét QR xác thực
              </Link>
              <Link to="/report-counterfeit" className="btn-secondary">
                <AlertTriangle size={16} />
                Báo cáo hàng giả
              </Link>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100 shadow-sm">
            <img
              src={bannerDesktop}
              alt="ACFMart - Sàn thương mại điện tử chống hàng giả"
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {[
            ["100%", "seller phải xác minh"],
            ["24-48h", "SLA xử lý báo cáo"],
            ["200%", "bồi thường khi xác minh hàng giả"],
          ].map(([value, label]) => (
            <div key={label} className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
              <p className="text-2xl font-bold text-brand-red-600">{value}</p>
              <p className="mt-1 text-xs font-medium text-neutral-600">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-neutral-100 bg-neutral-50 py-12">
        <div className="container-acf">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold text-neutral-900">4 lớp bảo vệ chính</h2>
            <p className="mt-2 text-sm text-neutral-600">
              Mỗi lớp xử lý một rủi ro khác nhau: người bán, sản phẩm, giao dịch và
              khiếu nại sau mua.
            </p>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {pillars.map((item) => {
              const Icon = item.icon
              return (
                <div key={item.title} className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-red-50 text-brand-red-600">
                    <Icon size={22} />
                  </div>
                  <h3 className="mt-4 font-semibold text-neutral-900">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-neutral-600">{item.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="container-acf py-12">
        <div className="grid gap-8 lg:grid-cols-[420px_1fr]">
          <div>
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-gold-100 text-brand-gold-700">
              <FileSearch size={24} />
            </div>
            <h2 className="mt-4 text-2xl font-bold text-neutral-900">Quy trình xử lý báo cáo</h2>
            <p className="mt-3 text-sm leading-6 text-neutral-600">
              Báo cáo hàng giả không chỉ là form phản ánh. Đây là quy trình kiểm tra
              có trạng thái, có bằng chứng và có nhật ký xử lý cho moderator.
            </p>
          </div>
          <ol className="space-y-3">
            {process.map((step, index) => (
              <li
                key={step}
                className="flex gap-4 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-red-600 text-sm font-bold text-white">
                  {index + 1}
                </span>
                <p className="pt-1 text-sm text-neutral-700">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="container-acf pb-12">
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
          <div className="border-b border-neutral-100 bg-neutral-50 px-5 py-4">
            <h2 className="font-semibold text-neutral-900">Mức độ kiểm duyệt theo ngành hàng</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-white text-xs text-neutral-500">
                <tr>
                  <th className="px-5 py-3 text-left font-semibold">Mức độ</th>
                  <th className="px-5 py-3 text-left font-semibold">Ngành hàng</th>
                  <th className="px-5 py-3 text-left font-semibold">Yêu cầu kiểm duyệt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {categories.map((item) => (
                  <tr key={item.level}>
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${item.className}`}>
                        {item.level}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-neutral-800">{item.products}</td>
                    <td className="px-5 py-4 text-neutral-600">{item.requirement}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="container-acf pb-14">
        <div className="rounded-2xl bg-neutral-900 p-6 text-white sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <h2 className="text-2xl font-bold">Nghi ngờ sản phẩm không chính hãng?</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-300">
                Gửi báo cáo kèm mã QR, hình ảnh và mô tả dấu hiệu bất thường. Đội
                kiểm định sẽ tiếp nhận trong 24-48 giờ làm việc.
              </p>
              <div className="mt-4 grid gap-2 text-sm text-neutral-200 sm:grid-cols-2">
                {[
                  "Hoàn tiền qua Escrow khi đủ điều kiện",
                  "Bồi thường 200% khi xác minh hàng giả",
                  "Khóa seller vi phạm và chuyển hồ sơ",
                  "Audit log cho toàn bộ thao tác xử lý",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-brand-gold-400" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <Link to="/report-counterfeit" className="btn-gold">
              Gửi báo cáo
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
