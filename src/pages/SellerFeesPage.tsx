import { Link } from "react-router-dom"
import { ArrowLeft, Wallet, Percent, ShieldCheck, Clock3 } from "lucide-react"
import { ACFMART_LEGAL_DISPLAY, ACFMART_SUPPORT_EMAIL } from "../lib/legal-profile"

const commissionRows = [
  ["Thời trang", "5%", "Tính trên giá bán thực tế"],
  ["Mỹ phẩm / Sức khoẻ", "6%", "Bao gồm phí xác minh nguồn gốc"],
  ["Điện tử / Công nghệ", "3%", "—"],
  ["Gia dụng / Đời sống", "5%", "—"],
  ["Thực phẩm / Đồ uống", "4%", "Yêu cầu giấy ATTP"],
  ["Sách / Văn phòng phẩm", "2%", "—"],
  ["Mẹ & Bé", "5%", "—"],
]

const payoutStates = [
  {
    title: "Chờ đối soát",
    desc: "Đơn đã giao nhưng chưa mở khóa vì còn cửa sổ khiếu nại hoặc đang chờ carrier settle COD.",
  },
  {
    title: "Khả dụng",
    desc: "Số dư có thể rút theo chu kỳ thanh toán nếu không có tranh chấp tồn đọng.",
  },
  {
    title: "Bị giữ",
    desc: "Đơn đang trả hàng, claim vận chuyển, hoặc có dấu hiệu vi phạm chính sách.",
  },
  {
    title: "Điều chỉnh",
    desc: "Đã trừ refund, phí hoàn, bồi thường hoặc claim vào số dư seller.",
  },
]

export function SellerFeesPage() {
  return (
    <div className="container-acf py-8 lg:py-12">
      <div className="mx-auto max-w-5xl">
        <Link
          to="/seller-register"
          className="mb-4 inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-brand-red-600"
        >
          <ArrowLeft size={12} />
          Quay lại đăng ký
        </Link>

        <section className="overflow-hidden rounded-3xl border border-neutral-200 bg-gradient-to-br from-brand-gold-50 via-white to-brand-red-50 p-6 shadow-sm lg:p-8">
          <div className="max-w-3xl">
            <span className="badge-verified inline-flex items-center gap-2 px-3 py-1 text-xs">
              <Wallet size={14} />
              Chính sách Phí & Payout người bán
            </span>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-neutral-900 lg:text-4xl">
              Phí minh bạch, số dư rõ ràng, giải ngân chỉ mở khi đơn đã an toàn.
            </h1>
            <p className="mt-4 text-sm leading-6 text-neutral-600 lg:text-base">
              Chính sách này do <strong>{ACFMART_LEGAL_DISPLAY}</strong> công bố cho seller trên nền tảng ACFMart.
            </p>
          </div>

          <div className="mt-8 grid gap-3 md:grid-cols-3">
            {[
              {
                icon: Percent,
                title: "Phí mở shop miễn phí",
                text: "Không thu phí đăng ký gian hàng; phí chỉ phát sinh theo giao dịch hoặc dịch vụ bổ sung.",
              },
              {
                icon: Clock3,
                title: "Giải ngân theo chu kỳ",
                text: "Đơn giao xong nhưng còn cửa sổ khiếu nại sẽ nằm ở trạng thái chờ đối soát.",
              },
              {
                icon: ShieldCheck,
                title: "Khóa payout khi có tranh chấp",
                text: "Đơn trả hàng, claim vận chuyển hoặc vi phạm chính sách sẽ làm số dư bị giữ lại.",
              },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div key={item.title} className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-brand-gold-100 p-2 text-brand-gold-700">
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
            <h2 className="text-lg font-semibold text-neutral-900">1. Biểu phí giao dịch</h2>
            <p className="mt-2 text-sm leading-6 text-neutral-600">
              Bảng dưới đây là khung phí công khai cho seller. Một số ngành hàng có thể có điều chỉnh riêng trong hợp đồng hoặc chiến dịch bán hàng.
            </p>

            <div className="mt-5 overflow-hidden rounded-2xl border border-neutral-200">
              <table className="min-w-full text-sm">
                <thead className="bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Ngành hàng</th>
                    <th className="px-4 py-3 text-left font-semibold">Phí hoa hồng</th>
                    <th className="px-4 py-3 text-left font-semibold">Ghi chú</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 bg-white">
                  {commissionRows.map(([category, fee, note]) => (
                    <tr key={category}>
                      <td className="px-4 py-4 font-medium text-neutral-900">{category}</td>
                      <td className="px-4 py-4 text-neutral-700">{fee}</td>
                      <td className="px-4 py-4 text-neutral-600">{note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <aside className="rounded-2xl border border-neutral-200 bg-neutral-900 p-6 text-white shadow-sm">
            <h2 className="text-lg font-semibold">2. Trạng thái số dư</h2>
            <div className="mt-4 space-y-3">
              {payoutStates.map((item) => (
                <div key={item.title} className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="text-sm font-semibold text-white">{item.title}</div>
                  <p className="mt-1 text-sm leading-6 text-white/75">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl bg-white/10 p-4 text-sm leading-6 text-white/80">
              Khi cần kiểm tra số dư hoặc payout, seller có thể xem tại trang tài chính hoặc liên hệ CSKH để đối chiếu ledger.
            </div>
          </aside>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.35fr]">
          <aside className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-neutral-900">3. Phí và dịch vụ bổ sung</h2>
            <div className="mt-4 space-y-3 text-sm leading-6 text-neutral-700">
              <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-4">
                <div className="font-semibold text-neutral-900">Tem QR / chống hàng giả</div>
                <p className="mt-1">Tính theo số lượng tem hoặc chiến dịch xác thực sản phẩm.</p>
              </div>
              <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-4">
                <div className="font-semibold text-neutral-900">Quảng cáo / vị trí hiển thị</div>
                <p className="mt-1">Áp dụng theo gói truyền thông hoặc chiến dịch của nền tảng.</p>
              </div>
              <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-4">
                <div className="font-semibold text-neutral-900">Xác minh nâng cao</div>
                <p className="mt-1">Hồ sơ seller, tài khoản, giấy tờ và kiểm duyệt ngành hàng đặc thù.</p>
              </div>
            </div>
          </aside>

          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-neutral-900">4. Nguyên tắc minh bạch</h2>
            <p className="mt-2 text-sm leading-6 text-neutral-600">
              Mọi khoản phí, khấu trừ hoặc thay đổi cơ chế payout sẽ được hiển thị trong ledger của seller và thông báo trước khi áp dụng nếu đó là thay đổi hệ thống.
            </p>

            <div className="mt-5 rounded-2xl border border-brand-red-100 bg-brand-red-50 p-4 text-sm leading-6 text-neutral-700">
              Tiền chỉ được mở khóa khi đơn đã an toàn theo chính sách thanh toán, đổi trả và vận chuyển. Nếu bạn cần tra soát, hãy xem{" "}
              <Link to="/legal/payment" className="font-semibold text-brand-red-700 underline underline-offset-4">
                Chính sách Thanh toán
              </Link>{" "}
              hoặc liên hệ{" "}
              <a
                href={`mailto:${ACFMART_SUPPORT_EMAIL}`}
                className="font-semibold text-brand-red-700 underline underline-offset-4"
              >
                {ACFMART_SUPPORT_EMAIL}
              </a>.
            </div>

            <div className="mt-5 rounded-2xl bg-brand-gold-50 p-4 text-sm leading-6 text-neutral-700">
              Gợi ý: seller nên mở mục{" "}
              <Link to="/legal" className="font-semibold text-brand-red-700 underline underline-offset-4">
                Trung tâm chính sách
              </Link>{" "}
              để xem cùng lúc các quy tắc về giải ngân, đổi trả và vận chuyển.
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
