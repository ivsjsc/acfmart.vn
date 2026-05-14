import { useState } from "react"
import { Link } from "react-router-dom"
import {
  Heart,
  MessageCircle,
  Share2,
  Play,
  ShoppingBag,
  Plus,
  Search,
  Radio,
  Flame,
  UserPlus,
  Send,
  Bookmark,
  MoreHorizontal,
} from "lucide-react"
import logoImg from "../../../assets/logo.png"

const MOCK_STORIES = [
  { id: "s1", user: "Bạn", avatar: null, isOwn: true },
  { id: "s2", user: "Mai Anh", avatar: "https://placehold.co/80/f59e0b/fff?text=MA", hasNew: true },
  { id: "s3", user: "TechZone", avatar: "https://placehold.co/80/3b82f6/fff?text=TZ", hasNew: true },
  { id: "s4", user: "BeautyLab", avatar: "https://placehold.co/80/ec4899/fff?text=BL", hasNew: true },
  { id: "s5", user: "FoodieVN", avatar: "https://placehold.co/80/22c55e/fff?text=FV", hasNew: false },
  { id: "s6", user: "SportMax", avatar: "https://placehold.co/80/8b5cf6/fff?text=SM", hasNew: false },
]

const MOCK_POSTS = [
  {
    id: "p1",
    type: "video" as const,
    user: { name: "Natural Beauty Shop", avatar: "https://placehold.co/48/ec4899/fff?text=NB", verified: true },
    content: "Serum Vitamin C chính hãng - Da sáng sau 7 ngày! 🌟 #skincare #vitaminC #chinh_hang",
    media: "https://placehold.co/400x600/1f2937/f59e0b?text=VIDEO+30s",
    duration: "0:28",
    product: { name: "Serum Vitamin C 30ml", price: 295000, link: "/products/p1" },
    likes: 1243,
    comments: 89,
    shares: 156,
    isLiked: false,
    timeAgo: "2 giờ trước",
  },
  {
    id: "p2",
    type: "status" as const,
    user: { name: "Minh Triết", avatar: "https://placehold.co/48/3b82f6/fff?text=MT", verified: false },
    content: "Vừa nhận hàng từ ACFMart, quét mã QR xác thực ngay — chính hãng 100%! 🛡️ Yên tâm mua sắm.\n\n#ACFMart #chinh_hang #anti_counterfeit",
    media: null,
    product: null,
    likes: 87,
    comments: 12,
    shares: 5,
    isLiked: true,
    timeAgo: "4 giờ trước",
  },
  {
    id: "p3",
    type: "video" as const,
    user: { name: "TechZone VN", avatar: "https://placehold.co/48/3b82f6/fff?text=TZ", verified: true },
    content: "Unbox tai nghe Pro Max - Âm thanh quá đỉnh 🎧 Link sản phẩm bên dưới! #tech #review #unbox",
    media: "https://placehold.co/400x600/0f172a/06b6d4?text=UNBOX+VIDEO",
    duration: "0:24",
    product: { name: "Tai nghe Pro Max Wireless", price: 1890000, link: "/products/p3" },
    likes: 3421,
    comments: 234,
    shares: 890,
    isLiked: false,
    timeAgo: "6 giờ trước",
  },
]

const MOCK_LIVE = [
  { id: "lv1", title: "Flash Sale Tối Nay!", host: "Beauty Queen", viewers: 2341, thumb: "https://placehold.co/200x120/dc2626/fff?text=LIVE" },
  { id: "lv2", title: "Review Đồ Công Nghệ", host: "TechZone", viewers: 876, thumb: "https://placehold.co/200x120/7c3aed/fff?text=LIVE" },
]

export default function SocialFeedScreen() {
  const [activeTab, setActiveTab] = useState<"feed" | "discover" | "live">("feed")

  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Top nav */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-neutral-950/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <img src={logoImg} alt="ACFMart" className="h-6 brightness-0 invert" />
            <span className="text-xs font-bold uppercase tracking-wider text-white/60">Online</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="rounded-full p-2 text-white/70 hover:bg-white/10">
              <Search size={20} />
            </button>
            <button className="rounded-full p-2 text-white/70 hover:bg-white/10">
              <Send size={20} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mx-auto flex max-w-lg border-b border-white/5">
          {[
            { key: "feed", label: "Cho bạn" },
            { key: "discover", label: "Khám phá" },
            { key: "live", label: "LIVE", icon: <Radio size={12} /> },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex flex-1 items-center justify-center gap-1 py-2.5 text-xs font-semibold transition-colors ${
                activeTab === tab.key
                  ? "border-b-2 border-purple-500 text-white"
                  : "text-white/50 hover:text-white/80"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <main className="mx-auto max-w-lg">
        {/* Stories / Streaks */}
        <div className="border-b border-white/5 px-4 py-4">
          <div className="flex gap-4 overflow-x-auto pb-2">
            {MOCK_STORIES.map((story) => (
              <div key={story.id} className="flex shrink-0 flex-col items-center gap-1">
                <div className={`relative h-16 w-16 rounded-full p-0.5 ${
                  story.hasNew ? "bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400" : "bg-white/20"
                }`}>
                  {story.isOwn ? (
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-neutral-800">
                      <Plus size={20} className="text-white/70" />
                    </div>
                  ) : (
                    <img
                      src={story.avatar!}
                      alt={story.user}
                      className="h-full w-full rounded-full object-cover"
                    />
                  )}
                  {story.hasNew && (
                    <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2">
                      <Flame size={12} className="text-orange-400" />
                    </div>
                  )}
                </div>
                <span className="max-w-[60px] truncate text-[10px] text-white/60">{story.user}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Live now banner */}
        {activeTab === "feed" && MOCK_LIVE.length > 0 && (
          <div className="border-b border-white/5 px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-white/80">
                <Radio size={12} className="text-red-500 animate-pulse" /> Đang Live
              </span>
              <Link to="/live" className="text-[11px] text-purple-400">Xem tất cả</Link>
            </div>
            <div className="flex gap-3 overflow-x-auto">
              {MOCK_LIVE.map((live) => (
                <div key={live.id} className="relative shrink-0 overflow-hidden rounded-xl w-40">
                  <img src={live.thumb} alt={live.title} className="h-24 w-full object-cover" />
                  <div className="absolute top-1.5 left-1.5 flex items-center gap-1 rounded-full bg-red-600 px-2 py-0.5">
                    <Radio size={8} className="text-white" />
                    <span className="text-[10px] font-bold text-white">{live.viewers.toLocaleString()}</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                    <p className="text-[10px] font-medium text-white truncate">{live.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Posts feed */}
        <div className="divide-y divide-white/5">
          {MOCK_POSTS.map((post) => (
            <article key={post.id} className="px-4 py-4">
              {/* User header */}
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={post.user.avatar} alt="" className="h-10 w-10 rounded-full" />
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-semibold text-white">{post.user.name}</span>
                      {post.user.verified && (
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-[8px] text-white">✓</span>
                      )}
                    </div>
                    <span className="text-[11px] text-white/40">{post.timeAgo}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="rounded-full border border-purple-500 px-3 py-1 text-[11px] font-semibold text-purple-400 hover:bg-purple-500/10">
                    <UserPlus size={12} className="mr-1 inline" />
                    Theo dõi
                  </button>
                  <button className="text-white/40 hover:text-white/70">
                    <MoreHorizontal size={18} />
                  </button>
                </div>
              </div>

              {/* Content */}
              <p className="mb-3 text-sm leading-relaxed text-white/90 whitespace-pre-line">
                {formatHashtags(post.content)}
              </p>

              {/* Media */}
              {post.media && (
                <div className="relative mb-3 overflow-hidden rounded-xl">
                  <img src={post.media} alt="" className="w-full" />
                  {post.type === "video" && (
                    <>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                          <Play size={24} className="ml-1 text-white" fill="white" />
                        </div>
                      </div>
                      <span className="absolute bottom-2 right-2 rounded-md bg-black/60 px-1.5 py-0.5 text-[11px] font-medium text-white">
                        {post.duration}
                      </span>
                    </>
                  )}
                </div>
              )}

              {/* Product link */}
              {post.product && (
                <Link
                  to={post.product.link}
                  className="mb-3 flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3"
                >
                  <ShoppingBag size={18} className="shrink-0 text-orange-400" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-white/90">{post.product.name}</p>
                    <p className="text-xs font-bold text-orange-400">
                      {post.product.price.toLocaleString("vi-VN")}₫
                    </p>
                  </div>
                  <span className="shrink-0 rounded-lg bg-orange-500 px-3 py-1.5 text-[11px] font-bold text-white">
                    Mua
                  </span>
                </Link>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <button className={`flex items-center gap-1.5 ${post.isLiked ? "text-pink-500" : "text-white/50 hover:text-pink-400"}`}>
                    <Heart size={20} fill={post.isLiked ? "currentColor" : "none"} />
                    <span className="text-xs">{formatCount(post.likes)}</span>
                  </button>
                  <button className="flex items-center gap-1.5 text-white/50 hover:text-white/80">
                    <MessageCircle size={20} />
                    <span className="text-xs">{formatCount(post.comments)}</span>
                  </button>
                  <button className="flex items-center gap-1.5 text-white/50 hover:text-white/80">
                    <Share2 size={20} />
                    <span className="text-xs">{formatCount(post.shares)}</span>
                  </button>
                </div>
                <button className="text-white/50 hover:text-white/80">
                  <Bookmark size={20} />
                </button>
              </div>
            </article>
          ))}
        </div>

        {/* Create post FAB */}
        <button className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg shadow-purple-500/30">
          <Plus size={24} className="text-white" />
        </button>
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-neutral-950/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-lg items-center justify-around py-2">
          <NavItem icon="home" label="Trang chủ" active />
          <NavItem icon="search" label="Khám phá" />
          <NavItem icon="plus" label="Tạo" />
          <NavItem icon="shopping" label="Shop" />
          <NavItem icon="user" label="Tôi" />
        </div>
      </nav>
    </div>
  )
}

function NavItem({ icon, label, active }: { icon: string; label: string; active?: boolean }) {
  const iconMap: Record<string, React.ReactNode> = {
    home: <svg viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} className="h-5 w-5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>,
    search: <Search size={20} />,
    plus: <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-purple-500 to-pink-500"><Plus size={18} className="text-white" /></div>,
    shopping: <ShoppingBag size={20} />,
    user: <div className="h-6 w-6 rounded-full bg-white/20" />,
  }
  return (
    <button className={`flex flex-col items-center gap-0.5 ${active ? "text-white" : "text-white/40"}`}>
      {iconMap[icon]}
      {icon !== "plus" && <span className="text-[10px]">{label}</span>}
    </button>
  )
}

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return n.toString()
}

function formatHashtags(text: string) {
  return text.split(/(#\w+)/g).map((part, i) =>
    part.startsWith("#") ? (
      <span key={i} className="text-purple-400 hover:underline cursor-pointer">{part}</span>
    ) : (
      <span key={i}>{part}</span>
    )
  )
}
