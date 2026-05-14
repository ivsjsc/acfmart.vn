import { Link } from "react-router-dom"
import {
  ShieldCheck,
  QrCode,
  Video,
  Users,
  ArrowRight,
  TrendingUp,
  Award,
} from "lucide-react"
import { formatCurrency } from "../../../lib/format"
import { MOCK_CATEGORIES, MOCK_PRODUCTS } from "../../../lib/mock-data"
import { BannerSlider } from "../../../components/BannerSlider"

const categories = MOCK_CATEGORIES.slice(0, 8)
const featuredProducts = MOCK_PRODUCTS.slice(0, 6)

const liveStreams = [
  {
    id: "l1",
    title: "Siêu sale tối nay - Deal khủng chỉ có trong live!",
    host: "Nguyễn Thị Mai",
    shop: "Natural Beauty Shop",
    viewers: 1245,
    thumbnail: "https://placehold.co/600x400/dc2626/ffffff?text=LIVE+NOW",
    isLive: true,
  },
  {
    id: "l2",
    title: "Review tai nghe Pro - Mở hộp & test thực tế",
    host: "Tech Reviewer VN",
    shop: "TechZone VN",
    viewers: 587,
    thumbnail: "https://placehold.co/600x400/f59e0b/ffffff?text=LIVE",
    isLive: true,
  },
  {
    id: "l3",
    title: "Bí kíp chăm da mùa hè - Q&A với chuyên gia",
    host: "Dr. Lan Anh",
    shop: "Skin Lab",
    viewers: 0,
    thumbnail: "https://placehold.co/600x400/8b5cf6/ffffff?text=20:00",
    isLive: false,
  },
]

export default function HomeScreen() {
  return (
    <div className="animate-fade-in">
      {/* Hero Banner Slider */}
      <section>
        <BannerSlider className="rounded-none md:rounded-none" />
        <div className="bg-gradient-to-r from-brand-red-600 to-brand-red-700 py-4">
          <div className="container-acf flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/categories"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-brand-red-600 shadow-lg transition-transform hover:scale-105"
            >
              Bắt đầu mua sắm
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/qr-verify"
              className="inline-flex items-center gap-2 rounded-lg bg-brand-gold-500 px-5 py-3 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-105"
            >
              <QrCode size={16} />
              Quét mã QR xác thực
            </Link>
          </div>
        </div>
      </section>

      {/* USP banner */}
      <section className="border-y border-neutral-200 bg-white">
        <div className="container-acf grid grid-cols-2 gap-4 py-6 md:grid-cols-4">
          {[
            {
              icon: ShieldCheck,
              title: "Chống hàng giả bằng QR",
              desc: "Quét QR trên bao bì để xác thực",
              color: "text-brand-red-600 bg-brand-red-50",
              link: "/qr-verify",
            },
            {
              icon: Video,
              title: "Live Commerce",
              desc: "Mua trực tiếp từ livestream",
              color: "text-brand-gold-600 bg-brand-gold-50",
              link: "/live",
            },
            {
              icon: TrendingUp,
              title: "Affiliate kiếm tiền",
              desc: "Chia sẻ link – nhận hoa hồng",
              color: "text-info bg-blue-50 text-blue-600",
              link: "/affiliate",
            },
            {
              icon: Award,
              title: "Shop được chứng nhận",
              desc: "Tất cả shop đều xác minh",
              color: "text-emerald-600 bg-emerald-50",
              link: "/categories",
            },
          ].map((f) => (
            <Link
              key={f.title}
              to={f.link}
              className="group flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-neutral-50"
            >
              <div className={`rounded-xl p-2.5 ${f.color}`}>
                <f.icon size={20} />
              </div>
              <div>
                <div className="text-sm font-semibold text-neutral-900 group-hover:text-brand-red-600">
                  {f.title}
                </div>
                <div className="text-xs text-neutral-600">{f.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="container-acf py-10">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">Danh mục nổi bật</h2>
            <p className="mt-1 text-sm text-neutral-600">
              Mua sắm theo nhóm sản phẩm phổ biến
            </p>
          </div>
          <Link
            to="/categories"
            className="hidden items-center gap-1 text-sm font-semibold text-brand-red-600 hover:text-brand-red-700 md:inline-flex"
          >
            Xem tất cả <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-4 gap-3 md:grid-cols-8">
          {categories.map((c) => (
            <Link
              key={c.slug}
              to={`/categories/${c.slug}`}
              className="card flex flex-col items-center justify-center gap-2 p-4 transition-transform hover:scale-105 hover:border-brand-red-300"
            >
              <span className="text-3xl">{c.icon}</span>
              <span className="text-center text-xs font-medium text-neutral-700">
                {c.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Live streams */}
      <section className="container-acf py-10">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-2xl font-bold text-neutral-900">
              <span className="badge-live">LIVE</span>
              Đang phát trực tiếp
            </h2>
            <p className="mt-1 text-sm text-neutral-600">
              Săn deal độc quyền cùng host
            </p>
          </div>
          <Link
            to="/live"
            className="inline-flex items-center gap-1 text-sm font-semibold text-brand-red-600 hover:text-brand-red-700"
          >
            Xem tất cả <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {liveStreams.map((s) => (
            <Link
              key={s.id}
              to={`/live/${s.id}`}
              className="group card overflow-hidden transition-shadow hover:shadow-lg"
            >
              <div className="relative aspect-video overflow-hidden bg-neutral-100">
                <img
                  src={s.thumbnail}
                  alt={s.title}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute left-2 top-2 flex items-center gap-2">
                  {s.isLive ? (
                    <span className="badge-live animate-pulse">● LIVE</span>
                  ) : (
                    <span className="rounded-md bg-neutral-900/80 px-2 py-0.5 text-xs font-bold text-white">
                      Sắp diễn ra
                    </span>
                  )}
                </div>
                {s.isLive && (
                  <div className="absolute right-2 top-2 flex items-center gap-1 rounded-md bg-black/60 px-2 py-0.5 text-xs font-medium text-white">
                    <Users size={12} /> {s.viewers.toLocaleString("vi-VN")}
                  </div>
                )}
              </div>
              <div className="p-3">
                <h3 className="line-clamp-2 text-sm font-semibold text-neutral-900 group-hover:text-brand-red-600">
                  {s.title}
                </h3>
                <div className="mt-1 text-xs text-neutral-500">
                  {s.host} • {s.shop}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="container-acf py-10">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">Sản phẩm nổi bật</h2>
            <p className="mt-1 text-sm text-neutral-600">
              Đang được nhiều người mua nhất
            </p>
          </div>
          <Link
            to="/search?sort=bestseller"
            className="inline-flex items-center gap-1 text-sm font-semibold text-brand-red-600 hover:text-brand-red-700"
          >
            Xem tất cả <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {featuredProducts.map((p) => {
            const discount = p.originalPrice
              ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
              : 0
            return (
              <Link
                key={p.id}
                to={`/products/${p.handle}`}
                className="group card overflow-hidden transition-shadow hover:shadow-md"
              >
                <div className="relative aspect-square overflow-hidden bg-neutral-100">
                  <img
                    src={p.images[0]}
                    alt={p.title}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                  {discount > 0 && (
                    <span className="absolute left-2 top-2 rounded-md bg-brand-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                      -{discount}%
                    </span>
                  )}
                  {p.verified && (
                    <span className="absolute right-2 top-2 rounded-md bg-brand-gold-500/95 px-1.5 py-0.5 text-[10px] font-bold text-white">
                      ✓ Chính hãng
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="line-clamp-2 text-xs font-medium text-neutral-900 group-hover:text-brand-red-600">
                    {p.title}
                  </h3>
                  <div className="mt-1.5 flex items-baseline gap-1">
                    <span className="text-sm font-bold text-brand-red-600">
                      {formatCurrency(p.price)}
                    </span>
                  </div>
                  {p.originalPrice && p.originalPrice > p.price && (
                    <div className="text-[10px] text-neutral-400 line-through">
                      {formatCurrency(p.originalPrice)}
                    </div>
                  )}
                  <div className="mt-1.5 flex items-center justify-between text-[10px] text-neutral-500">
                    <span>⭐ {p.rating}</span>
                    <span>Đã bán {p.sold?.toLocaleString("vi-VN") ?? '0'}</span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Trust CTA */}
      <section className="container-acf py-10">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-brand-gold-500 to-brand-gold-700 p-8 text-white md:p-12">
          <div className="grid items-center gap-6 md:grid-cols-2">
            <div>
              <h2 className="text-3xl font-extrabold md:text-4xl">
                Trở thành Người bán chính hãng
              </h2>
              <p className="mt-3 text-base text-white/90">
                Tham gia hệ sinh thái hàng chính hãng – được Quỹ Chống Hàng Giả Việt Nam
                bảo trợ, kết nối hàng triệu khách hàng tin dùng.
              </p>
              <Link
                to="/seller-register"
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-brand-gold-700 shadow-lg transition-transform hover:scale-105"
              >
                Đăng ký ngay
                <ArrowRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              {[
                { label: "Người bán", value: "12K+" },
                { label: "Đơn hàng / tháng", value: "500K" },
                { label: "Tỉnh thành", value: "63/63" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl bg-white/15 p-4 backdrop-blur">
                  <div className="text-2xl font-extrabold">{stat.value}</div>
                  <div className="mt-1 text-xs text-white/80">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}