import { useMemo } from "react"
import { Link } from "react-router-dom"
import {
  MessageCircle,
  Users,
  TrendingUp,
  Video,
  Share2,
  Sparkles,
  Heart,
  Eye,
  ArrowRight,
  ChevronRight,
  Loader2,
  PackageSearch,
} from "lucide-react"
import { useAuthStore } from "../../../stores/auth-store"
import { useApprovedProducts } from "../../../hooks/use-products"
import { useLiveStreams } from "../../../hooks/use-live-stream"
import { formatCurrency } from "../../../lib/format"
import { PLACEHOLDER_IMAGE } from "../../../lib/constants"

export function SocialDashboardScreen() {
  const user = useAuthStore((s) => s.user)
  const { data: products = [], isLoading: productsLoading } = useApprovedProducts({ limit: 30 })
  const liveStreamsQuery = useLiveStreams("live")
  const liveStreams = liveStreamsQuery.data?.streams ?? []

  const topProducts = useMemo(
    () => products.slice(0, 6),
    [products]
  )

  return (
    <div className="p-4 lg:p-8 animate-fade-in">
      {/* Welcome header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">
            Xin chào{user?.name ? `, ${user.name}` : ""}
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Trung tâm cộng đồng ACFMart — Chia sẻ, kết nối và mua sắm thông minh
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-500" />
          </span>
          Social Hub
        </div>
      </div>

      {/* Quick stats */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <QuickStat
          icon={MessageCircle}
          label="Bảng tin"
          desc="Đọc & chia sẻ"
          color="bg-violet-50 text-violet-600"
          to="/social/feed"
        />
        <QuickStat
          icon={Users}
          label="Cộng đồng"
          desc="Hỏi đáp & review"
          color="bg-blue-50 text-blue-600"
          to="/social/community"
        />
        <QuickStat
          icon={Share2}
          label="Affiliate"
          desc="Chia sẻ — nhận hoa hồng"
          color="bg-emerald-50 text-emerald-600"
          to="/social/affiliate"
        />
        <QuickStat
          icon={Video}
          label="Live Commerce"
          desc={`${liveStreams.length} đang phát`}
          color="bg-rose-50 text-rose-600"
          to="/social/live"
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Left column */}
        <div className="space-y-6">
          {/* Featured channels */}
          <section className="rounded-xl border border-neutral-200 bg-white">
            <div className="flex items-center justify-between border-b border-neutral-100 p-4">
              <div>
                <h2 className="text-base font-bold text-neutral-900">Kênh nổi bật</h2>
                <p className="text-xs text-neutral-500">Các kênh chức năng trên ACFMart Social</p>
              </div>
            </div>
            <div className="grid gap-3 p-4 sm:grid-cols-2">
              <ChannelCard
                icon={MessageCircle}
                title="Bảng tin Cộng đồng"
                desc="Chia sẻ trải nghiệm, hỏi đáp và đánh giá sản phẩm chính hãng từ cộng đồng người mua."
                color="bg-violet-500"
                to="/social/feed"
              />
              <ChannelCard
                icon={Share2}
                title="Affiliate Marketing"
                desc="Chia sẻ link sản phẩm chính hãng, nhận hoa hồng từ mỗi đơn hàng thành công."
                color="bg-emerald-500"
                to="/social/affiliate"
              />
              <ChannelCard
                icon={Video}
                title="Live Commerce"
                desc="Xem livestream bán hàng, tương tác trực tiếp với seller và săn deal độc quyền."
                color="bg-rose-500"
                to="/social/live"
              />
              <ChannelCard
                icon={TrendingUp}
                title="Xu hướng"
                desc="Sản phẩm hot, bài viết nổi bật và hoạt động trending trên cộng đồng."
                color="bg-amber-500"
                to="/social/trending"
              />
              <ChannelCard
                icon={Sparkles}
                title="Aivy AI"
                desc="Trợ lý AI thông minh — hỏi đáp, tư vấn sản phẩm, hỗ trợ mua sắm cá nhân hóa."
                color="bg-sky-500"
                to="/social/aivy"
              />
              <ChannelCard
                icon={Users}
                title="Cộng đồng ACF"
                desc="Tham gia nhóm cộng đồng, kết nối với người mua và seller uy tín trên nền tảng."
                color="bg-indigo-500"
                to="/social/community"
              />
            </div>
          </section>

          {/* Live streams */}
          <section className="rounded-xl border border-neutral-200 bg-white">
            <div className="flex items-center justify-between border-b border-neutral-100 p-4">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-neutral-900">Đang phát trực tiếp</h2>
                {liveStreams.length > 0 && (
                  <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white animate-pulse">
                    LIVE
                  </span>
                )}
              </div>
              <Link
                to="/social/live"
                className="inline-flex items-center gap-1 text-xs font-semibold text-violet-600 hover:text-violet-700"
              >
                Xem tất cả <ArrowRight size={12} />
              </Link>
            </div>
            <div className="p-4">
              {liveStreamsQuery.isLoading ? (
                <div className="flex items-center justify-center gap-2 py-8 text-sm text-neutral-500">
                  <Loader2 size={16} className="animate-spin" /> Đang tải...
                </div>
              ) : liveStreams.length === 0 ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <Video size={36} className="text-neutral-300" />
                  <p className="mt-2 text-sm text-neutral-500">
                    Hiện không có livestream nào đang phát.
                  </p>
                  <Link to="/social/live" className="mt-3 text-xs font-semibold text-violet-600 hover:underline">
                    Xem lịch livestream
                  </Link>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {liveStreams.slice(0, 3).map((s) => (
                    <Link
                      key={s.id}
                      to={`/social/live/${s.id}`}
                      className="group overflow-hidden rounded-lg border border-neutral-200 transition-shadow hover:shadow-md"
                    >
                      <div className="relative aspect-video overflow-hidden bg-neutral-100">
                        <img
                          src={
                            s.thumbnail_url ??
                            "https://placehold.co/600x400/7c3aed/ffffff?text=LIVE"
                          }
                          alt={s.title}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                        <div className="absolute left-2 top-2 rounded-md bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white animate-pulse">
                          LIVE
                        </div>
                        <div className="absolute right-2 top-2 flex items-center gap-1 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white">
                          <Eye size={10} /> {s.peak_viewers.toLocaleString("vi-VN")}
                        </div>
                      </div>
                      <div className="p-2.5">
                        <h3 className="line-clamp-1 text-xs font-semibold text-neutral-900 group-hover:text-violet-600">
                          {s.title}
                        </h3>
                        <p className="mt-0.5 text-[10px] text-neutral-500">{s.host_name}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right column — sidebar widgets */}
        <div className="space-y-4">
          {/* AI Assistant CTA */}
          <div className="rounded-xl border border-violet-200 bg-gradient-to-br from-violet-50 to-indigo-50 p-5">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500 text-white">
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-violet-900">Aivy AI</h3>
                <p className="text-[10px] text-violet-600">Trợ lý mua sắm thông minh</p>
              </div>
            </div>
            <p className="mt-3 text-xs leading-5 text-violet-800">
              Hỏi Aivy bất kỳ điều gì: tư vấn sản phẩm, so sánh giá, kiểm tra hàng chính hãng.
            </p>
            <Link
              to="/social/aivy"
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-violet-700"
            >
              Trò chuyện với Aivy <ArrowRight size={12} />
            </Link>
          </div>

          {/* Trending products */}
          <div className="rounded-xl border border-neutral-200 bg-white">
            <div className="flex items-center justify-between border-b border-neutral-100 p-4">
              <h3 className="text-sm font-bold text-neutral-900">Sản phẩm nổi bật</h3>
              <Link
                to="/social/trending"
                className="text-[10px] font-semibold text-violet-600 hover:text-violet-700"
              >
                Xem thêm
              </Link>
            </div>
            <div className="p-3">
              {productsLoading ? (
                <div className="flex items-center gap-2 py-4 text-sm text-neutral-500">
                  <Loader2 size={14} className="animate-spin" /> Đang tải...
                </div>
              ) : topProducts.length === 0 ? (
                <div className="flex flex-col items-center py-6 text-center">
                  <PackageSearch size={28} className="text-neutral-300" />
                  <p className="mt-2 text-xs text-neutral-500">
                    Chưa có sản phẩm nào.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {topProducts.map((product) => (
                    <Link
                      key={product.id}
                      to={`/products/${product.handle}`}
                      className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-neutral-50"
                    >
                      <img
                        src={product.thumbnail || product.images[0] || PLACEHOLDER_IMAGE}
                        alt={product.title}
                        className="h-12 w-12 shrink-0 rounded-lg object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 text-xs font-semibold text-neutral-900">
                          {product.title}
                        </p>
                        <p className="text-xs font-bold text-violet-600">
                          {formatCurrency(product.basePrice)}
                        </p>
                      </div>
                      <Heart size={14} className="shrink-0 text-neutral-300" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Affiliate CTA */}
          <div className="rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-5">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white">
                <Share2 size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-emerald-900">Affiliate</h3>
                <p className="text-[10px] text-emerald-600">Kiếm tiền từ chia sẻ</p>
              </div>
            </div>
            <p className="mt-3 text-xs leading-5 text-emerald-800">
              Chia sẻ sản phẩm chính hãng qua link cá nhân. Nhận hoa hồng 2.5% – 4.5% cho mỗi đơn thành công.
            </p>
            <Link
              to="/social/affiliate"
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-700"
            >
              Bắt đầu kiếm tiền <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function QuickStat({
  icon: Icon,
  label,
  desc,
  color,
  to,
}: {
  icon: typeof MessageCircle
  label: string
  desc: string
  color: string
  to: string
}) {
  return (
    <Link
      to={to}
      className="group rounded-xl border border-neutral-200 bg-white p-4 transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-center justify-between">
        <div className={`rounded-lg p-2 ${color}`}>
          <Icon size={20} />
        </div>
        <ChevronRight
          size={14}
          className="text-neutral-300 transition-transform group-hover:translate-x-1 group-hover:text-neutral-500"
        />
      </div>
      <div className="mt-3">
        <p className="text-sm font-bold text-neutral-900">{label}</p>
        <p className="mt-0.5 text-xs text-neutral-500">{desc}</p>
      </div>
    </Link>
  )
}

function ChannelCard({
  icon: Icon,
  title,
  desc,
  color,
  to,
}: {
  icon: typeof MessageCircle
  title: string
  desc: string
  color: string
  to: string
}) {
  return (
    <Link
      to={to}
      className="group flex items-start gap-3 rounded-xl border border-neutral-200 p-4 transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white ${color}`}
      >
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <h3 className="text-sm font-bold text-neutral-900 group-hover:text-violet-600">
          {title}
        </h3>
        <p className="mt-1 text-xs leading-5 text-neutral-500">{desc}</p>
      </div>
    </Link>
  )
}
