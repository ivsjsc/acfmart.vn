import { Link } from "react-router-dom"
import { ArrowLeft, BadgeAlert, CreditCard, Package, RotateCcw, ShieldCheck, Truck } from "lucide-react"
import { ACFMART_LEGAL_DISPLAY, ACFMART_SUPPORT_EMAIL } from "../lib/legal-profile"

const returnRules = [
  {
    case: "Đổi ý cá nhân",
    window: "7 ngày",
    whoPays: "Người mua chịu phí trả hàng, trừ khi shop có chương trình miễn phí.",
    note: "Sản phẩm phải còn nguyên tem, bao bì, phụ kiện và chưa qua sử dụng.",
  },
  {
    case: "Sai mô tả / lỗi kỹ thuật / giao nhầm",
    window: "15 ngày",
    whoPays: "Người bán chịu phí hai chiều và phí xử lý liên quan.",
    note: "Hệ thống sẽ freeze payout cho đến khi hoàn tất xác minh.",
  },
  {
    case: "Hàng giả / hàng nhái / sai nguồn gốc",
    window: "Không giới hạn",
    whoPays: "Seller bị khóa payout, người mua được hỗ trợ refund và chương trình bồi thường theo policy ACF.",
    note: "Áp dụng sau khi có xác minh nội bộ hoặc kết luận từ đơn vị giám định.",
  },
  {
    case: "Hư hỏng do vận chuyển",
    window: "24 giờ sau khi nhận hàng",
    whoPays: "Carrier claim là chính; ACFMart refund trước rồi truy hoàn theo kết quả claim.",
    note: "Cần ảnh/video hiện trạng kiện hàng và mã vận đơn.",
  },
]

const flowSteps = [
  "Người mua tạo yêu cầu đổi/trả từ tài khoản hoặc liên hệ CSKH.",
  "Hệ thống tạm giữ giải ngân của đơn liên quan để tránh payout sai thời điểm.",
  "Seller, CSKH hoặc moderator xác minh hồ sơ và chứng cứ.",
  "Nếu hợp lệ, hệ thống phát hành hướng dẫn trả hàng và mã xử lý.",
  "Sau khi hàng hoàn về hoặc kết luận xử lý xong, hệ thống refund / bồi thường / mở khóa số dư.",
]

export function ReturnPolicyPage() {
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

        <section className="overflow-hidden rounded-3xl border border-neutral-200 bg-gradient-to-br from-emerald-50 via-white to-brand-gold-50 p-6 shadow-sm lg:p-8">
          <div className="max-w-3xl">
            <span className="badge-verified inline-flex items-center gap-2 px-3 py-1 text-xs">
              <RotateCcw size={14} />
              Chính sách Đổi trả & Hoàn tiền
            </span>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-neutral-900 lg:text-4xl">
              Khi có đổi trả, hoàn tiền hoặc bồi thường, hệ thống phải freeze giải ngân trước.
            </h1>
            <p className="mt-4 text-sm leading-6 text-neutral-600 lg:text-base">
              Chính sách này áp dụng cho mọi đơn hàng trên hệ sinh thái ACFMart do{" "}
              <strong>{ACFMART_LEGAL_DISPLAY}</strong> công bố.
            </p>
          </div>

          <div className="mt-8 grid gap-3 md:grid-cols-3">
            {[
              {
                icon: Package,
                title: "7 ngày đổi ý",
                text: "Dành cho sản phẩm còn nguyên trạng, chưa sử dụng và còn đầy đủ phụ kiện.",
              },
              {
                icon: ShieldCheck,
                title: "15 ngày lỗi/sai mô tả",
                text: "Seller chịu trách nhiệm phí hai chiều, đồng thời payout bị giữ cho tới khi chốt xử lý.",
              },
              {
                icon: BadgeAlert,
                title: "Hàng giả = chương trình riêng",
                text: "Nếu xác minh hàng giả hoặc sai nguồn gốc, ACFMart áp dụng cơ chế hoàn tiền và bồi thường theo policy ACF.",
              },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div key={item.title} className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600">
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
            <h2 className="text-lg font-semibold text-neutral-900">1. Các trường hợp được áp dụng</h2>
            <p className="mt-2 text-sm leading-6 text-neutral-600">
              Bảng dưới đây là khung xử lý chuẩn. Từng ngành hàng có thể có ngoại lệ riêng nếu được nêu rõ ở trang sản phẩm hoặc điều kiện bán hàng.
            </p>

            <div className="mt-5 overflow-hidden rounded-2xl border border-neutral-200">
              <table className="min-w-full text-sm">
                <thead className="bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Trường hợp</th>
                    <th className="px-4 py-3 text-left font-semibold">Thời hạn</th>
                    <th className="px-4 py-3 text-left font-semibold">Ai chịu phí</th>
                    <th className="px-4 py-3 text-left font-semibold">Ghi chú</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 bg-white">
                  {returnRules.map((rule) => (
                    <tr key={rule.case}>
                      <td className="px-4 py-4 font-medium text-neutral-900">{rule.case}</td>
                      <td className="px-4 py-4 text-neutral-700">{rule.window}</td>
                      <td className="px-4 py-4 text-neutral-700">{rule.whoPays}</td>
                      <td className="px-4 py-4 text-neutral-600">{rule.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <aside className="rounded-2xl border border-neutral-200 bg-neutral-900 p-6 text-white shadow-sm">
            <h2 className="text-lg font-semibold">2. Quy trình xử lý</h2>
            <ol className="mt-4 space-y-3">
              {flowSteps.map((step, index) => (
                <li key={step} className="flex gap-4 rounded-xl border border-white/10 bg-white/5 p-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-neutral-900">
                    {index + 1}
                  </span>
                  <p className="pt-1 text-sm leading-6 text-white/85">{step}</p>
                </li>
              ))}
            </ol>

            <div className="mt-6 rounded-2xl bg-white/10 p-4 text-sm leading-6 text-white/80">
              Trong thời gian tranh chấp, đơn hàng sẽ bị giữ trạng thái payout. Điều này giúp ACFMart không giải ngân sai cho seller trước khi có kết luận.
            </div>
          </aside>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.35fr]">
          <aside className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-neutral-900">3. Refund theo phương thức thanh toán</h2>
            <div className="mt-4 space-y-3 text-sm leading-6 text-neutral-700">
              <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-4">
                <div className="font-semibold text-neutral-900">Online payment</div>
                <p className="mt-1">Hoàn về phương thức gốc nếu cổng thanh toán cho phép, hoặc chuyển khoản theo hướng dẫn của CSKH.</p>
              </div>
              <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-4">
                <div className="font-semibold text-neutral-900">COD</div>
                <p className="mt-1">Không hoàn ngược bằng tiền mặt; refund thường đi qua chuyển khoản ngân hàng hoặc trừ vào số dư seller.</p>
              </div>
              <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-4">
                <div className="font-semibold text-neutral-900">Claim vận chuyển</div>
                <p className="mt-1">ACFMart có thể refund trước cho khách rồi làm việc với carrier để truy hoàn nếu lỗi do vận chuyển.</p>
              </div>
            </div>
          </aside>

          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-neutral-900">4. Điều kiện chứng cứ</h2>
            <p className="mt-2 text-sm leading-6 text-neutral-600">
              Khi gửi yêu cầu đổi trả, vui lòng chuẩn bị ảnh, video mở hộp, mã vận đơn, ảnh kiện hàng, ảnh tem/serial và mô tả chi tiết vấn đề để CSKH xử lý nhanh hơn.
            </p>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl bg-brand-red-50 p-4">
                <div className="text-sm font-semibold text-neutral-900">Đủ điều kiện</div>
                <p className="mt-2 text-sm leading-6 text-neutral-700">
                  Hệ thống freeze payout, phát mã trả hàng và điều phối refund / đổi mới / bồi thường.
                </p>
              </div>
              <div className="rounded-2xl bg-brand-gold-50 p-4">
                <div className="text-sm font-semibold text-neutral-900">Không đủ điều kiện</div>
                <p className="mt-2 text-sm leading-6 text-neutral-700">
                  ACFMart từ chối yêu cầu nhưng vẫn lưu log để người mua và seller đối chiếu.
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm leading-6 text-neutral-700">
              Nếu bạn cần trao đổi nhanh, hãy liên hệ{" "}
              <Link to="/contact" className="font-semibold text-brand-red-700 underline underline-offset-4">
                Trung tâm Hỗ trợ
              </Link>{" "}
              hoặc email{" "}
              <a
                href={`mailto:${ACFMART_SUPPORT_EMAIL}`}
                className="font-semibold text-brand-red-700 underline underline-offset-4"
              >
                {ACFMART_SUPPORT_EMAIL}
              </a>.
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">Bạn cần xem thêm phần liên quan?</h2>
              <p className="mt-1 text-sm text-neutral-600">
                Đổi trả luôn đi cùng thanh toán và vận chuyển, nên xem đủ bộ để tránh hiểu sai quy trình.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/legal/payment" className="btn-secondary inline-flex items-center gap-2">
                Thanh toán
                <CreditCard size={14} />
              </Link>
              <Link to="/legal/shipping" className="btn-secondary inline-flex items-center gap-2">
                Vận chuyển
                <Truck size={14} />
              </Link>
              <Link to="/legal" className="btn-primary">
                Trung tâm chính sách
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
