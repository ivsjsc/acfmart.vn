import { Link } from "react-router-dom"
import { ArrowLeft, Clock, MapPin, ShieldCheck, Truck } from "lucide-react"
import { ACFMART_HOTLINE, ACFMART_SUPPORT_EMAIL } from "../lib/legal-profile"

const shippingRows = [
  {
    name: "GHTK",
    scope: "Đối tác mặc định giai đoạn đầu cho đơn hàng ACFMart",
    notes: "Hỗ trợ tạo đơn, in nhãn, webhook trạng thái và luồng COD/đối soát.",
  },
  {
    name: "Mở rộng carrier",
    scope: "Có thể bổ sung theo ngành hàng hoặc khu vực",
    notes: "Thiết kế hệ thống theo provider để sau này thay carrier không phải sửa logic nghiệp vụ.",
  },
]

const shippingRules = [
  "Địa chỉ giao hàng phải hoàn tất trong Sổ địa chỉ trước khi đặt hàng.",
  "Thời gian giao hiển thị trên checkout chỉ là ước tính; trạng thái thật được đồng bộ qua webhook của carrier.",
  "Nếu giao không thành công do sai địa chỉ, người mua vắng mặt hoặc từ chối nhận, đơn có thể bị hoàn về (RTO).",
  "Nếu hàng mất/hư hỏng trong vận chuyển, ACFMart sẽ hỗ trợ mở claim với carrier và tạm freeze payout liên quan.",
]

const claimSteps = [
  "Người mua chụp ảnh/video tình trạng kiện hàng và giữ nguyên bao bì.",
  "Gửi yêu cầu trong thời gian quy định sau khi nhận hàng.",
  "CSKH kiểm tra mã vận đơn, trạng thái carrier và mức độ tổn thất.",
  "Nếu xác nhận lỗi vận chuyển, ACFMart xử lý refund / thay thế và mở claim carrier.",
]

export function ShippingPolicyPage() {
  return (
    <div className="container-acf py-8 lg:py-12">
      <div className="mx-auto max-w-5xl">
        <Link
          to="/legal"
          className="mb-4 inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-brand-red-600"
        >
          <ArrowLeft size={12} />
          Trung tâm chính sách
        </Link>

        <section className="overflow-hidden rounded-3xl border border-neutral-200 bg-gradient-to-br from-sky-50 via-white to-brand-gold-50 p-6 shadow-sm lg:p-8">
          <div className="max-w-3xl">
            <span className="badge-verified inline-flex items-center gap-2 px-3 py-1 text-xs">
              <Truck size={14} />
              Chính sách Vận chuyển
            </span>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-neutral-900 lg:text-4xl">
              Vận chuyển là lớp giao nhận, không phải lớp giữ tiền. Hai luồng này phải tách bạch.
            </h1>
            <p className="mt-4 text-sm leading-6 text-neutral-600 lg:text-base">
              ACFMart thiết kế vận chuyển theo mô hình provider-first: tracking, in nhãn, webhook và đối soát COD đều được gom về cùng một hệ thống nghiệp vụ.
            </p>
          </div>

          <div className="mt-8 grid gap-3 md:grid-cols-3">
            {[
              {
                icon: Clock,
                title: "Thời gian là ước tính",
                text: "Mốc giao hàng hiển thị trên trang thanh toán và chi tiết đơn chỉ mang tính tham khảo.",
              },
              {
                icon: MapPin,
                title: "Địa chỉ đầy đủ",
                text: "Thiếu phường/xã, quận/huyện hoặc tỉnh/thành sẽ làm đơn khó tạo nhãn và dễ fail delivery.",
              },
              {
                icon: ShieldCheck,
                title: "Claim rõ ràng",
                text: "Mất hàng, hư hỏng hoặc sai kiện hàng đều đi qua ảnh/video, mã vận đơn và trạng thái carrier.",
              },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div key={item.title} className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-sky-50 p-2 text-sky-600">
                      <Icon size={18} />
                    </div>
                    <h2 className="text-sm font-semibold text-neutral-900">{item.title}</h2>
                  </div>
                  <p className="mt-3 text-xs leading-5 text-neutral-600">{item.text}</p>
                </div>
              )
            })}
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.35fr_0.95fr]">
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-neutral-900">1. Carrier mặc định và khả năng mở rộng</h2>
            <p className="mt-2 text-sm leading-6 text-neutral-600">
              Giai đoạn đầu, ACFMart ưu tiên <strong>GHTK</strong> cho các luồng tạo đơn, in nhãn, webhook và COD. Kiến trúc hiện tại vẫn mở để bổ sung carrier khác khi cần.
            </p>

            <div className="mt-5 overflow-hidden rounded-2xl border border-neutral-200">
              <table className="min-w-full text-sm">
                <thead className="bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Carrier</th>
                    <th className="px-4 py-3 text-left font-semibold">Phạm vi</th>
                    <th className="px-4 py-3 text-left font-semibold">Ghi chú</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 bg-white">
                  {shippingRows.map((row) => (
                    <tr key={row.name}>
                      <td className="px-4 py-4 font-medium text-neutral-900">{row.name}</td>
                      <td className="px-4 py-4 text-neutral-700">{row.scope}</td>
                      <td className="px-4 py-4 text-neutral-600">{row.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <aside className="rounded-2xl border border-neutral-200 bg-neutral-900 p-6 text-white shadow-sm">
            <h2 className="text-lg font-semibold">2. Quy tắc giao nhận</h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-white/85">
              {shippingRules.map((item) => (
                <li key={item} className="rounded-xl border border-white/10 bg-white/5 p-3">
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-6 rounded-2xl bg-white/10 p-4 text-sm leading-6 text-white/80">
              Khi đơn bị hoàn về, hệ thống sẽ cập nhật trạng thái vận đơn, giữ lịch sử xử lý và chuyển sang luồng đổi trả nếu khách tạo yêu cầu.
            </div>
          </aside>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.35fr]">
          <aside className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-neutral-900">3. Khi hàng bị lỗi trong vận chuyển</h2>
            <ol className="mt-4 space-y-3">
              {claimSteps.map((step, index) => (
                <li key={step} className="flex gap-4 rounded-xl border border-neutral-100 bg-neutral-50 p-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-red-600 text-sm font-bold text-white">
                    {index + 1}
                  </span>
                  <p className="pt-1 text-sm leading-6 text-neutral-700">{step}</p>
                </li>
              ))}
            </ol>
          </aside>

          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-neutral-900">4. COD, RTO và tracking</h2>
            <p className="mt-2 text-sm leading-6 text-neutral-600">
              COD được xem là một phần của nghiệp vụ vận chuyển và đối soát. Nếu giao không thành công, carrier có thể thực hiện giao lại hoặc trả về. Tracking trạng thái luôn được đồng bộ về hệ thống để buyer và seller cùng xem một nguồn dữ liệu.
            </p>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl bg-sky-50 p-4">
                <div className="text-sm font-semibold text-neutral-900">Giao không thành công</div>
                <p className="mt-2 text-sm leading-6 text-neutral-700">
                  Có thể do sai địa chỉ, người nhận không liên lạc được hoặc từ chối nhận.
                </p>
              </div>
              <div className="rounded-2xl bg-brand-gold-50 p-4">
                <div className="text-sm font-semibold text-neutral-900">Hàng hư hỏng</div>
                <p className="mt-2 text-sm leading-6 text-neutral-700">
                  Cần gửi ảnh/video ngay để ACFMart mở luồng hỗ trợ và claim carrier nếu lỗi thuộc vận chuyển.
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm leading-6 text-neutral-700">
              Liên hệ hỗ trợ vận chuyển:{" "}
              <Link to="/contact" className="font-semibold text-brand-red-700 underline underline-offset-4">
                Trung tâm Hỗ trợ
              </Link>{" "}
              · Email <a href={`mailto:${ACFMART_SUPPORT_EMAIL}`} className="font-semibold text-brand-red-700 underline underline-offset-4">{ACFMART_SUPPORT_EMAIL}</a>
              · Hotline <strong>{ACFMART_HOTLINE}</strong>.
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">Bạn cần xem phần còn lại của quy trình?</h2>
              <p className="mt-1 text-sm text-neutral-600">
                Vận chuyển luôn đi cùng thanh toán và đổi trả, nên xem đủ bộ để không bị lệch luồng khi xử lý đơn.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/legal/payment" className="btn-secondary inline-flex items-center gap-2">
                Thanh toán
              </Link>
              <Link to="/legal/return" className="btn-secondary inline-flex items-center gap-2">
                Đổi trả
              </Link>
              <Link to="/legal" className="btn-primary inline-flex items-center gap-2">
                Trung tâm chính sách
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
