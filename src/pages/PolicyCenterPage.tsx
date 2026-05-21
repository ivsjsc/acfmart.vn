import { Link } from "react-router-dom"
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  CreditCard,
  FileText,
  RotateCcw,
  Scale,
  ShieldCheck,
  Truck,
  Wallet,
} from "lucide-react"
import { ACFMART_LEGAL_DISPLAY, ACFMART_HOTLINE, ACFMART_SUPPORT_EMAIL } from "../lib/legal-profile"

const policyCards = [
  {
    href: "/legal/payment",
    icon: CreditCard,
    title: "Thanh toán & giải ngân",
    description: "Cách ACFMart xử lý tiền online, COD và thời điểm mở khóa số dư.",
  },
  {
    href: "/legal/return",
    icon: RotateCcw,
    title: "Đổi trả & hoàn tiền",
    description: "Khung 7 ngày, 15 ngày, hàng lỗi, hàng giả và cơ chế freeze khi tranh chấp.",
  },
  {
    href: "/legal/shipping",
    icon: Truck,
    title: "Vận chuyển & COD",
    description: "Giao nhận, RTO, mất/hư hỏng hàng, đối soát vận chuyển và trace trạng thái.",
  },
  {
    href: "/legal/seller-fees",
    icon: Wallet,
    title: "Phí & số dư người bán",
    description: "Phí sàn, chu kỳ đối soát, số dư chờ, số dư khả dụng và trạng thái khóa.",
  },
  {
    href: "/legal/terms",
    icon: FileText,
    title: "Điều khoản sử dụng",
    description: "Quyền, nghĩa vụ, giới hạn trách nhiệm và nguyên tắc vận hành nền tảng.",
  },
  {
    href: "/legal/privacy",
    icon: ShieldCheck,
    title: "Bảo mật & dữ liệu",
    description: "Cách ACFMart thu thập, xử lý và bảo vệ dữ liệu cá nhân trên hệ thống.",
  },
]

const lifecycle = [
  "Người mua đặt hàng với địa chỉ đã hoàn tất trong Sổ địa chỉ.",
  "Tiền online đi qua đối tác thanh toán; COD đi qua đơn vị vận chuyển và khâu đối soát.",
  "ACFMart ghi nhận trạng thái đơn, giữ trạng thái giải ngân và freeze nếu phát sinh tranh chấp.",
  "Khi đơn giao thành công và hết cửa sổ khiếu nại, hệ thống mới mở khóa số dư cho seller.",
  "Nếu có đổi trả, hoàn tiền hoặc bồi thường, hệ thống sẽ chặn giải ngân cho tới khi có kết luận.",
]

const safeguards = [
  {
    title: "ACFMart không giữ tiền như ngân hàng",
    body:
      "Sàn điều phối quy tắc giải ngân, ghi nhận trạng thái và đối soát. Tiền thực tế nên nằm ở ngân hàng hoặc đối tác thanh toán được cấp phép.",
  },
  {
    title: "COD là dòng tiền riêng",
    body:
      "Khách thanh toán cho đơn vị vận chuyển khi nhận hàng. GHTK hoặc carrier đối soát phần thu hộ; ACFMart chỉ ghi nhận và áp chính sách payout.",
  },
  {
    title: "Tranh chấp = freeze",
    body:
      "Khi có khiếu nại, hệ thống tạm giữ giải ngân, chờ xác minh rồi mới refund, bồi thường hoặc mở khóa số dư seller.",
  },
]

export function PolicyCenterPage() {
  return (
    <div className="container-acf py-8 lg:py-12">
      <div className="mx-auto max-w-6xl">
        <Link
          to="/"
          className="mb-4 inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-brand-red-600"
        >
          <ArrowLeft size={12} />
          Về trang chủ
        </Link>

        <section className="overflow-hidden rounded-3xl border border-neutral-200 bg-gradient-to-br from-brand-red-50 via-white to-brand-gold-50 p-6 shadow-sm lg:p-8">
          <div className="max-w-3xl">
            <span className="badge-verified inline-flex items-center gap-2 px-3 py-1 text-xs">
              <ShieldCheck size={14} />
              Trung tâm chính sách & giao dịch
            </span>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-neutral-900 lg:text-4xl">
              Toàn bộ quy tắc thanh toán, COD, đổi trả và giải ngân ở một nơi.
            </h1>
            <p className="mt-4 text-sm leading-6 text-neutral-600 lg:text-base">
              {ACFMART_LEGAL_DISPLAY} công bố trung tâm này để người mua và người bán
              hiểu rõ luồng tiền, luồng vận chuyển và quy tắc xử lý khiếu nại trước khi
              phát sinh giao dịch.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/legal/payment" className="btn-primary inline-flex items-center gap-2">
                <CreditCard size={16} />
                Thanh toán
              </Link>
              <Link to="/legal/return" className="btn-secondary inline-flex items-center gap-2">
                <RotateCcw size={16} />
                Đổi trả
              </Link>
              <Link to="/legal/shipping" className="btn-secondary inline-flex items-center gap-2">
                <Truck size={16} />
                Vận chuyển
              </Link>
            </div>
          </div>

          <div className="mt-8 grid gap-3 md:grid-cols-3">
            {safeguards.map((item) => (
              <div key={item.title} className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur">
                <h2 className="text-sm font-semibold text-neutral-900">{item.title}</h2>
                <p className="mt-2 text-xs leading-5 text-neutral-600">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {policyCards.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                to={item.href}
                className="group rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-red-200 hover:shadow-md"
              >
                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-brand-red-50 p-3 text-brand-red-600">
                    <Icon size={20} />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-base font-semibold text-neutral-900">{item.title}</h2>
                    <p className="mt-1 text-sm leading-6 text-neutral-600">{item.description}</p>
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-red-700">
                      Xem chi tiết
                      <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-brand-gold-100 p-3 text-brand-gold-700">
                <Scale size={20} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-neutral-900">Nguyên tắc dòng tiền</h2>
                <p className="text-sm text-neutral-500">Một chuỗi quyết định rõ ràng thay cho cảm tính.</p>
              </div>
            </div>

            <ol className="mt-5 space-y-3">
              {lifecycle.map((step, index) => (
                <li key={step} className="flex gap-4 rounded-xl border border-neutral-100 bg-neutral-50 p-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-red-600 text-sm font-bold text-white">
                    {index + 1}
                  </span>
                  <p className="pt-1 text-sm leading-6 text-neutral-700">{step}</p>
                </li>
              ))}
            </ol>
          </div>

          <aside className="rounded-2xl border border-neutral-200 bg-neutral-900 p-6 text-white shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-white/10 p-3 text-brand-gold-300">
                <Banknote size={20} />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Điểm cần nhớ</h2>
                <p className="text-sm text-white/70">Tóm gọn cho buyer, seller và CSKH.</p>
              </div>
            </div>

            <div className="mt-5 space-y-3 text-sm leading-6 text-white/85">
              <p>• Địa chỉ giao hàng phải hoàn tất trước khi đặt đơn.</p>
              <p>• COD không làm ACFMart trở thành bên giữ tiền mặt; carrier đối soát phần thu hộ.</p>
              <p>• Đơn có tranh chấp sẽ bị khóa giải ngân cho đến khi chốt kết quả xử lý.</p>
              <p>• Khiếu nại, hoàn tiền và bồi thường đều đi qua cùng một ledger nội bộ.</p>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/contact" className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10">
                CSKH
              </Link>
              <a
                href={`mailto:${ACFMART_SUPPORT_EMAIL}`}
                className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                Email hỗ trợ
              </a>
              <a
                href={`tel:${ACFMART_HOTLINE.replace(/\s+/g, "")}`}
                className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                Hotline
              </a>
            </div>
          </aside>
        </section>
      </div>
    </div>
  )
}
