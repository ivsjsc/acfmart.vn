import { Link } from "react-router-dom"
import { ArrowLeft, ArrowRight, Banknote, CreditCard, ShieldCheck, Wallet } from "lucide-react"
import { ACFMART_HOTLINE, ACFMART_LEGAL_DISPLAY, ACFMART_SUPPORT_EMAIL } from "../lib/legal-profile"

const moneyFlowRows = [
  {
    flow: "Thanh toán online",
    route: "Người mua → đối tác thanh toán được cấp phép → ledger ACFMart → giải ngân cho seller",
    note: "Giải ngân sau khi đơn giao thành công và qua cửa sổ khiếu nại hoặc có kết luận tranh chấp.",
  },
  {
    flow: "Thanh toán COD",
    route: "Người mua → đơn vị vận chuyển → tài khoản đối soát thu hộ → ledger ACFMart",
    note: "ACFMart chỉ ghi nhận và đối soát theo chính sách, không cầm tiền mặt như quầy thu ngân.",
  },
  {
    flow: "Hoàn tiền / bồi thường",
    route: "Freeze số dư → xác minh → refund / claim carrier / trừ payout seller",
    note: "Nếu có tranh chấp, hệ thống tạm giữ giải ngân cho tới khi chốt kết quả xử lý.",
  },
]

const controlPoints = [
  "ACFMart điều khiển quy tắc giải ngân, không vận hành như ngân hàng lưu ký tiền của bên bán.",
  "Tiền online chỉ được mở khóa khi giao thành công, không có khiếu nại còn hiệu lực, hoặc đã có kết luận xử lý.",
  "COD và online payment đi qua hai luồng nghiệp vụ khác nhau nhưng cùng về chung một ledger đối soát.",
  "Nếu đơn bị trả hàng, bồi thường hoặc claim vận chuyển, payout seller sẽ bị khóa tương ứng.",
]

const sellerStates = [
  {
    status: "Chờ đối soát",
    detail: "Đơn đã giao xong nhưng vẫn còn trong thời gian chờ khiếu nại.",
  },
  {
    status: "Khả dụng",
    detail: "Hết cửa sổ tranh chấp, số dư có thể rút theo chu kỳ thanh toán.",
  },
  {
    status: "Bị giữ",
    detail: "Đơn đang khiếu nại, đổi trả, claim vận chuyển hoặc nghi ngờ gian lận.",
  },
  {
    status: "Điều chỉnh",
    detail: "Refund, bồi thường, phí hoàn hoặc khấu trừ đã được chốt vào số dư.",
  },
]

export function PaymentPolicyPage() {
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

        <section className="overflow-hidden rounded-3xl border border-neutral-200 bg-gradient-to-br from-brand-red-50 via-white to-brand-gold-50 p-6 shadow-sm lg:p-8">
          <div className="max-w-3xl">
            <span className="badge-verified inline-flex items-center gap-2 px-3 py-1 text-xs">
              <CreditCard size={14} />
              Chính sách Thanh toán & Giải ngân
            </span>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-neutral-900 lg:text-4xl">
              Dòng tiền được kiểm soát rõ ràng, không để lẫn giữa thanh toán, COD và payout seller.
            </h1>
            <p className="mt-4 text-sm leading-6 text-neutral-600 lg:text-base">
              Chính sách này áp dụng cho mọi giao dịch trên hệ sinh thái ACFMart do{" "}
              <strong>{ACFMART_LEGAL_DISPLAY}</strong> công bố.
            </p>
          </div>

          <div className="mt-8 grid gap-3 md:grid-cols-3">
            {[
              {
                icon: ShieldCheck,
                title: "Không giữ tiền như ngân hàng",
                text: "ACFMart điều phối quy tắc giải ngân và ledger, không thay thế vai trò của ngân hàng/đối tác thanh toán được cấp phép.",
              },
              {
                icon: Banknote,
                title: "COD là dòng tiền riêng",
                text: "Khách trả tiền cho đơn vị vận chuyển khi nhận hàng; phần đối soát đi theo quy trình carrier settlement.",
              },
              {
                icon: Wallet,
                title: "Freeze khi có tranh chấp",
                text: "Nếu đơn bị đổi trả, khiếu nại hoặc claim vận chuyển, hệ thống tạm giữ payout cho đến khi có kết luận.",
              },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div key={item.title} className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-brand-red-50 p-2 text-brand-red-600">
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
            <h2 className="text-lg font-semibold text-neutral-900">1. Luồng tiền thực tế</h2>
            <p className="mt-2 text-sm leading-6 text-neutral-600">
              ACFMart phân tách rõ giữa thanh toán online, COD và quy trình hoàn tiền/bồi thường để không làm mờ trách nhiệm của từng bên.
            </p>

            <div className="mt-5 overflow-hidden rounded-2xl border border-neutral-200">
              <table className="min-w-full text-sm">
                <thead className="bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Luồng</th>
                    <th className="px-4 py-3 text-left font-semibold">Đi qua</th>
                    <th className="px-4 py-3 text-left font-semibold">Ý nghĩa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 bg-white">
                  {moneyFlowRows.map((row) => (
                    <tr key={row.flow}>
                      <td className="px-4 py-4 font-medium text-neutral-900">{row.flow}</td>
                      <td className="px-4 py-4 text-neutral-700">{row.route}</td>
                      <td className="px-4 py-4 text-neutral-600">{row.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <aside className="rounded-2xl border border-neutral-200 bg-neutral-900 p-6 text-white shadow-sm">
            <h2 className="text-lg font-semibold">2. Điều kiện mở khóa số dư</h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-white/85">
              {controlPoints.map((point) => (
                <li key={point} className="rounded-xl border border-white/10 bg-white/5 p-3">
                  {point}
                </li>
              ))}
            </ul>

            <div className="mt-6 rounded-2xl bg-white/10 p-4 text-sm leading-6 text-white/80">
              <strong className="text-white">Gợi ý đọc nhanh:</strong> Nếu bạn muốn hiểu toàn bộ
              vòng đời đơn hàng, hãy xem thêm{" "}
              <Link to="/legal/return" className="font-semibold text-brand-gold-300 underline underline-offset-4">
                Chính sách Đổi trả
              </Link>{" "}
              và{" "}
              <Link to="/legal/shipping" className="font-semibold text-brand-gold-300 underline underline-offset-4">
                Chính sách Vận chuyển
              </Link>.
            </div>
          </aside>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.35fr]">
          <aside className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-neutral-900">3. Trạng thái số dư người bán</h2>
            <div className="mt-4 space-y-3">
              {sellerStates.map((item) => (
                <div key={item.status} className="rounded-xl border border-neutral-100 bg-neutral-50 p-4">
                  <div className="text-sm font-semibold text-neutral-900">{item.status}</div>
                  <p className="mt-1 text-sm leading-6 text-neutral-600">{item.detail}</p>
                </div>
              ))}
            </div>
          </aside>

          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-neutral-900">4. Hoàn tiền và hỗ trợ</h2>
            <p className="mt-2 text-sm leading-6 text-neutral-600">
              Hoàn tiền sẽ quay về phương thức gốc nếu đối tác thanh toán cho phép. Với COD, hoàn tiền thường đi qua chuyển khoản ngân hàng hoặc trừ vào số dư khả dụng của seller theo kết quả xử lý.
            </p>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl bg-brand-red-50 p-4">
                <div className="text-sm font-semibold text-neutral-900">Khiếu nại đang mở</div>
                <p className="mt-2 text-sm leading-6 text-neutral-700">
                  Số dư bị khóa cho tới khi ACFMart xác minh xong hoặc carrier/seller hoàn tất phản hồi.
                </p>
              </div>
              <div className="rounded-2xl bg-brand-gold-50 p-4">
                <div className="text-sm font-semibold text-neutral-900">Đơn đã chốt</div>
                <p className="mt-2 text-sm leading-6 text-neutral-700">
                  Sau khi hết thời gian chờ khiếu nại, hệ thống mới cho phép giải ngân theo chu kỳ payout.
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm leading-6 text-neutral-700">
              Nếu bạn cần trao đổi về hoàn tiền hoặc thanh toán, liên hệ{" "}
              <Link to="/contact" className="font-semibold text-brand-red-700 underline underline-offset-4">
                Trung tâm Hỗ trợ
              </Link>{" "}
              hoặc email <a href={`mailto:${ACFMART_SUPPORT_EMAIL}`} className="font-semibold text-brand-red-700 underline underline-offset-4">{ACFMART_SUPPORT_EMAIL}</a>.
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">Bạn cần xem thêm tài liệu liên quan?</h2>
              <p className="mt-1 text-sm text-neutral-600">
                Trung tâm chính sách gom toàn bộ điều khoản vận hành để buyer, seller và CSKH đối chiếu nhanh.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/legal/return" className="btn-secondary inline-flex items-center gap-2">
                Đổi trả
                <ArrowRight size={14} />
              </Link>
              <Link to="/legal/shipping" className="btn-secondary inline-flex items-center gap-2">
                Vận chuyển
                <ArrowRight size={14} />
              </Link>
              <Link to="/legal/seller-fees" className="btn-primary inline-flex items-center gap-2">
                Phí người bán
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
          <div className="mt-4 text-xs text-neutral-500">
            Hotline: <strong>{ACFMART_HOTLINE}</strong> · Email: <strong>{ACFMART_SUPPORT_EMAIL}</strong>
          </div>
        </section>
      </div>
    </div>
  )
}
