import { useMemo } from "react"
import { Link } from "react-router-dom"
import {
  ShieldCheck,
  QrCode,
  Video,
  Users,
  ArrowRight,
  TrendingUp,
  Award,
  Package,
  AlertCircle,
  Store,
  FileText,
  BarChart3,
} from "lucide-react"
import { formatCurrency } from "../../../lib/format"
import { BannerSlider } from "../../../components/BannerSlider"
import { usePortalConfig } from "../../../hooks/use-portal-config"
import { CardSkeleton, Skeleton } from "../../../components/Skeleton"
import { useApprovedProducts } from "../../../hooks/use-products"
import { useLiveStreams } from "../../../hooks/use-live-stream"
import {
  productDocToCardShape,
  type ProductDoc,
} from "../../../lib/product-service"

const FEATURED_LIMIT = 12
const CATEGORY_CHIP_LIMIT = 8

// Static emoji map for known categories. Falls back to 🛍️ for unknown ones.
const CATEGORY_EMOJI: Record<string, string> = {
  "Mỹ phẩm": "💄",
  "Thời trang nữ": "👗",
  "Thời trang nam": "👔",
  "Điện tử": "📱",
  "Nhà cửa": "🏠",
  "Đồ gia dụng": "🍳",
  "Thực phẩm": "🍎",
  "Mẹ và bé": "👶",
  "Sức khỏe": "💊",
  "Sách": "📚",
  "Thể thao": "⚽",
  "Đồ chơi": "🧸",
}

function categoryEmoji(name: string): string {
  return CATEGORY_EMOJI[name] ?? "🛍️"
}

function deriveTopCategories(products: ProductDoc[]): { name: string; count: number }[] {
  const counts = new Map<string, number>()
  for (const p of products) {
    if (!p.category) continue
    counts.set(p.category, (counts.get(p.category) ?? 0) + 1)
  }
  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, CATEGORY_CHIP_LIMIT)
}

export default function HomeScreen() {
  const approved = useApprovedProducts({ limit: 100 })
  const liveStreamsQuery = useLiveStreams("live")

  const featuredProducts = useMemo(() => {
    return (approved.data ?? [])
      .slice(0, FEATURED_LIMIT)
      .map(productDocToCardShape)
  }, [approved.data])

  const topCategories = useMemo(
    () => deriveTopCategories(approved.data ?? []),
    [approved.data]
  )

  const liveStreams = liveStreamsQuery.data?.streams ?? []
  const { images: buyerImages } = usePortalConfig("buyer")

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

      {/* Seller Portal */}
      <section className="bg-neutral-950 py-10 text-white">
        <div className="container-acf grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-gold-400">
              Seller Portal
            </p>
            <h2 className="mt-2 text-2xl font-extrabold leading-tight md:text-4xl">
              Cổng vận hành dành cho người bán chính hãng
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-neutral-300">
              ACFMart hỗ trợ người bán hoàn thiện hồ sơ pháp lý, tạo đơn đăng ký
              và hợp đồng đã điền sẵn, quản lý sản phẩm, voucher, đơn hàng, tài
              chính và trang trưng bày sau khi được duyệt.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                to="/seller-channel"
                className="inline-flex items-center gap-2 rounded-lg bg-brand-gold-500 px-5 py-3 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-brand-gold-600"
              >
                Khám phá Seller Portal
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/guide/seller"
                className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                Hướng dẫn người bán
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {[
              {
                icon: FileText,
                title: "Hồ sơ tự động điền",
                desc: "Tạo Word cho đơn đăng ký và hợp đồng để in hoặc ký số.",
              },
              {
                icon: Store,
                title: "Quản lý shop",
                desc: "Logo, ảnh bìa, Bán chạy, Flash Sale và danh mục trưng bày.",
              },
              {
                icon: Package,
                title: "Kho sản phẩm",
                desc: "Thêm sản phẩm, nhập CSV mẫu và gửi duyệt hàng chính hãng.",
              },
              {
                icon: BarChart3,
                title: "Phân tích & tài chính",
                desc: "Theo dõi đơn bán, doanh thu, voucher và hiệu quả vận hành.",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-xl border border-white/10 bg-white/[0.06] p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-red-500 text-white">
                  <item.icon size={18} />
                </div>
                <h3 className="mt-3 text-sm font-bold text-white">{item.title}</h3>
                <p className="mt-1 text-xs leading-5 text-neutral-300">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Configurable promo banner — managed from Admin Console */}
      {buyerImages["promo_banner"]?.image_url && (
        <section className="container-acf py-6">
          {buyerImages["promo_banner"].link_url ? (
            <a
              href={buyerImages["promo_banner"].link_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src={buyerImages["promo_banner"].image_url}
                alt={buyerImages["promo_banner"].alt || "Khuyến mãi"}
                className="w-full rounded-2xl object-cover shadow-sm"
              />
            </a>
          ) : (
            <img
              src={buyerImages["promo_banner"].image_url}
              alt={buyerImages["promo_banner"].alt || "Khuyến mãi"}
              className="w-full rounded-2xl object-cover shadow-sm"
            />
          )}
        </section>
      )}

      {/* Configurable category banner */}
      {buyerImages["category_banner"]?.image_url && (
        <section className="container-acf pb-2">
          {buyerImages["category_banner"].link_url ? (
            <a
              href={buyerImages["category_banner"].link_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src={buyerImages["category_banner"].image_url}
                alt={buyerImages["category_banner"].alt || "Danh mục"}
                className="w-full rounded-2xl object-cover shadow-sm"
              />
            </a>
          ) : (
            <img
              src={buyerImages["category_banner"].image_url}
              alt={buyerImages["category_banner"].alt || "Danh mục"}
              className="w-full rounded-2xl object-cover shadow-sm"
            />
          )}
        </section>
      )}

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
        {approved.isLoading ? (
          <div className="grid grid-cols-4 gap-3 md:grid-cols-8">
            {Array.from({ length: CATEGORY_CHIP_LIMIT }).map((_, i) => (
              <Skeleton key={i} className="h-20" rounded="lg" />
            ))}
          </div>
        ) : topCategories.length === 0 ? (
          <div className="card flex flex-col items-center py-10 text-center">
            <Package size={36} className="text-neutral-300" />
            <p className="mt-2 text-sm text-neutral-500">
              Chưa có danh mục nào — chờ shop thêm sản phẩm.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-3 md:grid-cols-8">
            {topCategories.map((c) => (
              <Link
                key={c.name}
                to={`/categories/${encodeURIComponent(c.name)}`}
                className="card flex flex-col items-center justify-center gap-2 p-4 transition-transform hover:scale-105 hover:border-brand-red-300"
              >
                <span className="text-3xl">{categoryEmoji(c.name)}</span>
                <span className="text-center text-xs font-medium text-neutral-700">
                  {c.name}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Live streams */}
      <section className="container-acf py-10">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-2xl font-bold text-neutral-900">
              <span className="badge-live">LIVE</span>
              Đang phát trực tiếp
            </h2>
            <p className="mt-1 text-sm text-neutral-600">Săn deal độc quyền cùng host</p>
          </div>
          <Link
            to="/live"
            className="inline-flex items-center gap-1 text-sm font-semibold text-brand-red-600 hover:text-brand-red-700"
          >
            Xem tất cả <ArrowRight size={14} />
          </Link>
        </div>
        {liveStreamsQuery.isLoading ? (
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : liveStreams.length === 0 ? (
          <div className="card flex flex-col items-center py-10 text-center">
            <Video size={36} className="text-neutral-300" />
            <p className="mt-2 text-sm text-neutral-500">
              Hiện không có livestream nào đang phát.
            </p>
            <Link to="/live" className="btn-secondary mt-3">
              Xem lịch livestream
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {liveStreams.slice(0, 3).map((s) => (
              <Link
                key={s.id}
                to={`/live/${s.id}`}
                className="group card overflow-hidden transition-shadow hover:shadow-lg"
              >
                <div className="relative aspect-video overflow-hidden bg-neutral-100">
                  <img
                    src={
                      s.thumbnail_url ??
                      "https://placehold.co/600x400/dc2626/ffffff?text=LIVE"
                    }
                    alt={s.title}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute left-2 top-2 flex items-center gap-2">
                    <span className="badge-live animate-pulse">● LIVE</span>
                  </div>
                  <div className="absolute right-2 top-2 flex items-center gap-1 rounded-md bg-black/60 px-2 py-0.5 text-xs font-medium text-white">
                    <Users size={12} /> {s.peak_viewers.toLocaleString("vi-VN")}
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="line-clamp-2 text-sm font-semibold text-neutral-900 group-hover:text-brand-red-600">
                    {s.title}
                  </h3>
                  <div className="mt-1 text-xs text-neutral-500">{s.host_name}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
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
            to="/search"
            className="inline-flex items-center gap-1 text-sm font-semibold text-brand-red-600 hover:text-brand-red-700"
          >
            Xem tất cả <ArrowRight size={14} />
          </Link>
        </div>

        {approved.isLoading ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
            {Array.from({ length: FEATURED_LIMIT }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : approved.isError ? (
          <div className="card flex items-start gap-3 border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="font-semibold">Không tải được sản phẩm</p>
              <p className="mt-0.5 text-xs">
                {approved.error instanceof Error
                  ? approved.error.message
                  : "Có lỗi xảy ra"}
              </p>
              <button
                onClick={() => approved.refetch()}
                className="btn-secondary mt-3 text-xs"
              >
                Thử lại
              </button>
            </div>
          </div>
        ) : featuredProducts.length === 0 ? (
          <div className="card flex flex-col items-center py-10 text-center">
            <Package size={36} className="text-neutral-300" />
            <p className="mt-2 text-sm text-neutral-500">
              Chưa có sản phẩm nào được duyệt.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
            {featuredProducts.map((p) => (
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
                  <div className="mt-1.5 flex items-center justify-between text-[10px] text-neutral-500">
                    <span>⭐ {p.rating || "—"}</span>
                    <span>Đã bán {p.sold?.toLocaleString("vi-VN") ?? "0"}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
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
                Đăng ký gian hàng qua quy trình xác minh hồ sơ, kiểm duyệt sản phẩm
                và vận hành minh bạch cho hàng hóa có nguồn gốc rõ ràng.
              </p>
              <Link
                to="/seller-channel"
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-brand-gold-700 shadow-lg transition-transform hover:scale-105"
              >
                Tìm hiểu Seller Portal
                <ArrowRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              {[
                { title: "Xác minh", label: "Hồ sơ người bán" },
                { title: "Kiểm duyệt", label: "Sản phẩm & QR" },
                { title: "Hỗ trợ", label: "Vận hành đơn hàng" },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl bg-white/15 p-4 backdrop-blur">
                  <div className="text-xl font-extrabold md:text-2xl">{item.title}</div>
                  <div className="mt-1 text-xs text-white/80">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
