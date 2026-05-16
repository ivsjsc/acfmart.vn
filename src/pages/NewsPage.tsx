import { Link } from "react-router-dom"
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Newspaper,
  QrCode,
  Radio,
  ShieldCheck,
  Store,
} from "lucide-react"
import bannerDesktop from "../assets/banner-desktop.png"

const featured = {
  title: "ACFMart chuẩn hóa quy trình xác thực hàng chính hãng trên toàn sàn",
  excerpt:
    "Từ khâu duyệt seller, đăng sản phẩm, quét QR đến xử lý khiếu nại, ACFMart triển khai một luồng kiểm soát thống nhất để giảm rủi ro hàng giả trong thương mại điện tử.",
  date: "17/05/2026",
  category: "Chống hàng giả",
}

const news = [
  {
    icon: ShieldCheck,
    category: "Chống hàng giả",
    title: "5 dấu hiệu người mua nên kiểm tra trước khi nhận hàng",
    excerpt:
      "Bao bì, tem QR, mã lô, hóa đơn và lịch sử quét là các tín hiệu quan trọng giúp phát hiện sản phẩm có dấu hiệu bất thường.",
    date: "16/05/2026",
    readTime: "4 phút",
    color: "bg-rose-50 text-rose-700",
  },
  {
    icon: QrCode,
    category: "Công nghệ",
    title: "QR ACF hoạt động như thế nào trong quy trình xác thực?",
    excerpt:
      "Mã xác thực gắn với sản phẩm, lô hàng và chứng từ để người mua và moderator cùng đối chiếu khi phát sinh nghi vấn.",
    date: "15/05/2026",
    readTime: "5 phút",
    color: "bg-blue-50 text-blue-700",
  },
  {
    icon: Store,
    category: "Seller",
    title: "Checklist hồ sơ giúp seller được duyệt sản phẩm nhanh hơn",
    excerpt:
      "Seller cần chuẩn bị giấy phép, chứng từ nguồn gốc, hình ảnh nhãn hàng và mô tả đúng tiêu chuẩn ngành hàng.",
    date: "14/05/2026",
    readTime: "3 phút",
    color: "bg-amber-50 text-amber-700",
  },
  {
    icon: BadgeCheck,
    category: "Người mua",
    title: "Chính sách bồi thường 200% áp dụng trong trường hợp nào?",
    excerpt:
      "ACFMart chỉ kích hoạt bồi thường sau khi có kết luận xác minh từ đội kỹ thuật và đủ bằng chứng giao dịch hợp lệ.",
    date: "13/05/2026",
    readTime: "4 phút",
    color: "bg-emerald-50 text-emerald-700",
  },
]

const updates = [
  "Ra mắt dashboard theo dõi báo cáo hàng giả realtime cho moderator.",
  "Bổ sung luồng gửi báo cáo hàng giả từ trang xác thực QR.",
  "Cập nhật hướng dẫn seller về hồ sơ nguồn gốc sản phẩm.",
]

export function NewsPage() {
  return (
    <div className="bg-neutral-50">
      <section className="container-acf py-8 lg:py-12">
        <Link
          to="/"
          className="mb-4 inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-brand-red-600"
        >
          <ArrowLeft size={12} />
          Về trang chủ
        </Link>

        <div className="grid gap-8 lg:grid-cols-[1fr_460px] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-brand-red-700 shadow-sm">
              <Newspaper size={14} />
              Tin tức ACFMart
            </div>
            <h1 className="mt-5 text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl">
              Cập nhật về thương mại điện tử chống hàng giả.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-neutral-600">
              Tin vận hành, chính sách, công nghệ xác thực và hướng dẫn dành cho
              người mua, seller và đội ngũ moderator trên hệ sinh thái ACFMart.
            </p>
          </div>
          <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
            <img
              src={bannerDesktop}
              alt="ACFMart chống hàng giả"
              className="aspect-[16/10] w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="container-acf pb-12">
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <article className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
            <div className="border-b border-neutral-100 bg-gradient-to-r from-brand-red-50 to-brand-gold-50 p-5">
              <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-neutral-600">
                <span className="rounded-full bg-brand-red-600 px-2.5 py-1 text-white">
                  Nổi bật
                </span>
                <span className="inline-flex items-center gap-1">
                  <CalendarDays size={13} />
                  {featured.date}
                </span>
                <span>{featured.category}</span>
              </div>
              <h2 className="mt-4 max-w-3xl text-2xl font-bold text-neutral-900">
                {featured.title}
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-600">
                {featured.excerpt}
              </p>
              <Link to="/anti-counterfeit" className="btn-primary mt-5">
                Xem chương trình chống hàng giả
                <ArrowRight size={16} />
              </Link>
            </div>
            <div className="grid gap-0 divide-y divide-neutral-100 md:grid-cols-3 md:divide-x md:divide-y-0">
              {["Xác thực QR", "Escrow", "Bồi thường 200%"].map((item) => (
                <div key={item} className="p-5">
                  <p className="text-sm font-semibold text-neutral-900">{item}</p>
                  <p className="mt-1 text-xs leading-5 text-neutral-500">
                    Một phần trong quy trình kiểm soát rủi ro hàng giả của ACFMart.
                  </p>
                </div>
              ))}
            </div>
          </article>

          <aside className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-brand-red-600">
              <Radio size={18} />
              <h2 className="font-semibold text-neutral-900">Thông báo vận hành</h2>
            </div>
            <div className="mt-4 space-y-3">
              {updates.map((update) => (
                <div key={update} className="rounded-lg bg-neutral-50 p-3">
                  <p className="text-sm leading-6 text-neutral-700">{update}</p>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section className="container-acf pb-14">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">Bài viết mới</h2>
            <p className="mt-1 text-sm text-neutral-500">
              Nội dung được biên tập theo các luồng nghiệp vụ chính của ACFMart.
            </p>
          </div>
          <Link to="/help" className="text-sm font-medium text-brand-red-600 hover:text-brand-red-700">
            Trung tâm hỗ trợ
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {news.map((item) => {
            const Icon = item.icon
            return (
              <article
                key={item.title}
                className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start gap-4">
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${item.color}`}>
                    <Icon size={22} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                      <span className="font-semibold text-brand-red-600">{item.category}</span>
                      <span>·</span>
                      <span>{item.date}</span>
                      <span>·</span>
                      <span>{item.readTime}</span>
                    </div>
                    <h3 className="mt-2 text-lg font-semibold leading-6 text-neutral-900">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-neutral-600">{item.excerpt}</p>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </section>
    </div>
  )
}
