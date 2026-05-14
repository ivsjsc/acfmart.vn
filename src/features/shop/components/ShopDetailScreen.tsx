import { useState } from "react"
import { useParams, Link } from "react-router-dom"
import {
  ShieldCheck,
  Star,
  Users,
  Package,
  MessageSquare,
  Heart,
  Share2,
  TrendingUp,
  Clock,
  Award,
  Video,
} from "lucide-react"
import toast from "react-hot-toast"
import { findShopById, MOCK_PRODUCTS } from "../../../lib/mock-data"
import { ProductCard } from "../../../components/ProductCard"
import { cn } from "../../../lib/cn"
import { NotFound } from "../../../pages/NotFound"

const TABS = [
  { id: "products", label: "Sản phẩm" },
  { id: "categories", label: "Danh mục" },
  { id: "live", label: "Live" },
  { id: "reviews", label: "Đánh giá" },
  { id: "about", label: "Giới thiệu" },
] as const

type TabId = (typeof TABS)[number]["id"]

const SHOP_REVIEWS = [
  {
    id: "r1",
    user: "Nguyễn Thị H.",
    rating: 5,
    date: "2 ngày trước",
    comment: "Shop tư vấn rất nhiệt tình, đóng gói cẩn thận. Sản phẩm chính hãng đúng như mô tả.",
    productTitle: "Son Dưỡng SPF 15",
  },
  {
    id: "r2",
    user: "Trần Văn A.",
    rating: 5,
    date: "1 tuần trước",
    comment: "Mua lần 3 rồi, chất lượng ổn định, giao nhanh.",
    productTitle: "Mặt nạ Vitamin C",
  },
  {
    id: "r3",
    user: "Lê Hồng N.",
    rating: 4,
    date: "2 tuần trước",
    comment: "Sản phẩm tốt nhưng giao hơi chậm. Shop có thiện chí hỗ trợ.",
    productTitle: "Combo skincare",
  },
]

export default function ShopDetailScreen() {
  const { id } = useParams<{ id: string }>()
  const shop = id ? findShopById(id) : null

  const [tab, setTab] = useState<TabId>("products")
  const [following, setFollowing] = useState(false)

  if (!shop) return <NotFound />

  const shopProducts = MOCK_PRODUCTS.filter((p) => p.shopId === shop.id)

  function toggleFollow() {
    setFollowing(!following)
    toast.success(following ? "Đã bỏ theo dõi shop" : "Đã theo dõi shop")
  }

  const certBadgeColor = {
    gold: "bg-brand-gold-100 text-brand-gold-700 border-brand-gold-300",
    silver: "bg-neutral-100 text-neutral-700 border-neutral-300",
    bronze: "bg-amber-100 text-amber-700 border-amber-300",
  }[shop.certificationLevel]

  return (
    <div className="animate-fade-in">
      {/* Cover + header */}
      <div className="relative h-32 overflow-hidden bg-gradient-to-r from-brand-red-500 via-brand-red-600 to-brand-gold-500 md:h-48">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white blur-3xl" />
        </div>
      </div>

      <div className="container-acf -mt-12 md:-mt-16">
        {/* Shop card */}
        <div className="card flex flex-col gap-4 p-5 md:flex-row md:items-start">
          <img
            src={shop.logo}
            alt={shop.name}
            className="h-24 w-24 shrink-0 rounded-2xl border-4 border-white object-cover shadow-md md:h-32 md:w-32"
          />

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-extrabold text-neutral-900 md:text-3xl">
                {shop.name}
              </h1>
              {shop.verified && (
                <span className={cn("inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-bold", certBadgeColor)}>
                  <ShieldCheck size={12} />
                  Chứng nhận {shop.certificationLevel === "gold" ? "Vàng" : shop.certificationLevel === "silver" ? "Bạc" : "Đồng"}
                </span>
              )}
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-neutral-600">
              <span className="flex items-center gap-1">
                <Star size={12} className="fill-brand-gold-400 text-brand-gold-400" />
                <strong className="text-neutral-900">{shop.rating}</strong>
                <span className="text-neutral-400">đánh giá</span>
              </span>
              <span className="text-neutral-300">·</span>
              <span className="flex items-center gap-1">
                <Users size={12} />
                <strong className="text-neutral-900">
                  {shop.followerCount.toLocaleString("vi-VN")}
                </strong>
                <span className="text-neutral-400">người theo dõi</span>
              </span>
              <span className="text-neutral-300">·</span>
              <span className="flex items-center gap-1">
                <Package size={12} />
                <strong className="text-neutral-900">{shop.productCount}</strong>
                <span className="text-neutral-400">sản phẩm</span>
              </span>
            </div>

            <div className="mt-2 grid grid-cols-2 gap-2 text-xs md:grid-cols-4">
              <div className="rounded-lg bg-neutral-50 p-2">
                <div className="text-neutral-500">Phản hồi</div>
                <div className="font-semibold text-neutral-900">
                  {shop.responseRate}% · {shop.responseTime}
                </div>
              </div>
              <div className="rounded-lg bg-neutral-50 p-2">
                <div className="text-neutral-500">Tham gia</div>
                <div className="font-semibold text-neutral-900">
                  {new Date(shop.joinedAt).toLocaleDateString("vi-VN", {
                    month: "short",
                    year: "numeric",
                  })}
                </div>
              </div>
              <div className="rounded-lg bg-emerald-50 p-2 text-emerald-700">
                <div className="text-[10px]">Tỷ lệ giao đúng hạn</div>
                <div className="font-semibold">98.5%</div>
              </div>
              <div className="rounded-lg bg-brand-gold-50 p-2 text-brand-gold-700">
                <div className="text-[10px]">Tỷ lệ huỷ đơn</div>
                <div className="font-semibold">0.8%</div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 md:w-44">
            <button
              onClick={toggleFollow}
              className={cn(
                "btn-primary justify-center",
                following && "bg-neutral-200 text-neutral-700 hover:bg-neutral-300"
              )}
            >
              <Heart size={14} fill={following ? "currentColor" : "none"} />
              {following ? "Đang theo dõi" : "Theo dõi"}
            </button>
            <button className="btn-secondary justify-center">
              <MessageSquare size={14} />
              Chat
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href)
                toast.success("Đã sao chép link shop")
              }}
              className="btn-secondary justify-center"
            >
              <Share2 size={14} />
              Chia sẻ
            </button>
          </div>
        </div>

        {/* Highlights */}
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            {
              icon: Award,
              label: "Top 1% Shop",
              color: "text-brand-gold-600 bg-brand-gold-50",
            },
            {
              icon: TrendingUp,
              label: "Bán chạy nhất tháng",
              color: "text-brand-red-600 bg-brand-red-50",
            },
            {
              icon: ShieldCheck,
              label: "Cam kết chính hãng",
              color: "text-emerald-600 bg-emerald-50",
            },
            {
              icon: Clock,
              label: "Giao nhanh 24h",
              color: "text-blue-600 bg-blue-50",
            },
          ].map((h) => (
            <div key={h.label} className="card flex items-center gap-2 p-3">
              <div className={cn("rounded-lg p-2", h.color)}>
                <h.icon size={14} />
              </div>
              <span className="text-xs font-semibold text-neutral-700">
                {h.label}
              </span>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="mt-6 flex overflow-x-auto border-b border-neutral-200">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
                tab === t.id
                  ? "border-brand-red-500 text-brand-red-600"
                  : "border-transparent text-neutral-600 hover:text-neutral-900"
              )}
            >
              {t.label}
              {t.id === "products" && <span className="ml-1 text-xs text-neutral-400">({shopProducts.length})</span>}
              {t.id === "reviews" && <span className="ml-1 text-xs text-neutral-400">({SHOP_REVIEWS.length})</span>}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="py-5">
          {tab === "products" && (
            <>
              {shopProducts.length === 0 ? (
                <div className="card p-12 text-center text-neutral-500">
                  Shop chưa đăng sản phẩm nào
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                  {shopProducts.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              )}
            </>
          )}

          {tab === "categories" && (
            <div className="card p-8 text-center text-sm text-neutral-500">
              Shop chia sản phẩm theo danh mục — chức năng sắp ra mắt
            </div>
          )}

          {tab === "live" && (
            <div className="card p-8 text-center">
              <Video size={32} className="mx-auto text-neutral-300" />
              <h3 className="mt-3 text-base font-semibold">
                Shop chưa có Livestream
              </h3>
              <p className="mt-1 text-sm text-neutral-500">
                Bấm "Theo dõi" để nhận thông báo khi shop lên sóng.
              </p>
            </div>
          )}

          {tab === "reviews" && (
            <div className="space-y-3">
              <div className="card p-5">
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-4xl font-extrabold text-brand-red-600">
                      {shop.rating}
                    </div>
                    <div className="mt-1 flex">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star
                          key={n}
                          size={14}
                          className={cn(
                            n <= Math.round(shop.rating)
                              ? "fill-brand-gold-400 text-brand-gold-400"
                              : "text-neutral-300"
                          )}
                        />
                      ))}
                    </div>
                    <div className="mt-1 text-xs text-neutral-500">
                      / 5 sao
                    </div>
                  </div>
                  <div className="flex-1 space-y-1">
                    {[5, 4, 3, 2, 1].map((star) => (
                      <div key={star} className="flex items-center gap-2 text-xs">
                        <span className="w-2 text-neutral-600">{star}</span>
                        <Star size={10} className="fill-brand-gold-400 text-brand-gold-400" />
                        <div className="flex-1 h-1.5 overflow-hidden rounded-full bg-neutral-100">
                          <div
                            className="h-full bg-brand-gold-400"
                            style={{
                              width:
                                star === 5
                                  ? "82%"
                                  : star === 4
                                  ? "14%"
                                  : star === 3
                                  ? "3%"
                                  : star === 2
                                  ? "1%"
                                  : "0%",
                            }}
                          />
                        </div>
                        <span className="w-8 text-right text-neutral-500">
                          {star === 5 ? "82%" : star === 4 ? "14%" : star === 3 ? "3%" : star === 2 ? "1%" : "0%"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {SHOP_REVIEWS.map((r) => (
                <div key={r.id} className="card p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-red-100 text-sm font-bold text-brand-red-700">
                      {r.user[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-neutral-900">
                          {r.user}
                        </span>
                        <span className="text-[10px] text-neutral-500">
                          {r.date}
                        </span>
                      </div>
                      <div className="mt-0.5 flex">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Star
                            key={n}
                            size={12}
                            className={cn(
                              n <= r.rating
                                ? "fill-brand-gold-400 text-brand-gold-400"
                                : "text-neutral-300"
                            )}
                          />
                        ))}
                      </div>
                      <p className="mt-2 text-sm text-neutral-700">{r.comment}</p>
                      <div className="mt-1 text-[10px] text-neutral-500">
                        Sản phẩm: {r.productTitle}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "about" && (
            <div className="card space-y-4 p-5">
              <div>
                <h3 className="font-bold text-neutral-900">Giới thiệu shop</h3>
                <p className="mt-1 text-sm text-neutral-700">
                  {shop.name} là một trong những shop uy tín hàng đầu,
                  cam kết cung cấp 100% sản phẩm chính hãng có xác thực QR bởi
                  Quỹ Chống Hàng Giả Việt Nam. Chúng tôi tự hào phục vụ hơn{" "}
                  {shop.followerCount.toLocaleString("vi-VN")} khách hàng và sẽ
                  tiếp tục mang đến trải nghiệm mua sắm tốt nhất.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-neutral-900">Chính sách của shop</h3>
                <ul className="mt-1 space-y-1 text-sm text-neutral-700">
                  <li>✓ Đổi trả miễn phí 7 ngày với hàng lỗi</li>
                  <li>✓ Đóng gói cẩn thận, có niêm phong</li>
                  <li>✓ Hỗ trợ kiểm tra hàng trước khi nhận</li>
                  <li>✓ Hoàn tiền 100% nếu phát hiện hàng giả</li>
                </ul>
              </div>
              <Link
                to={`/shop-certification/${shop.id}`}
                className="btn-secondary w-full justify-center"
              >
                <ShieldCheck size={14} />
                Xem chứng nhận chính hãng
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
