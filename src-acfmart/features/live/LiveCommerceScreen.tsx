import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import {
  BadgeCheck,
  Bell,
  CalendarClock,
  Eye,
  MessageCircle,
  Play,
  Search,
  ShieldCheck,
  ShoppingBag,
  Star,
} from "lucide-react"
import { cn } from "../../lib/cn"
import { formatCurrency } from "../../lib/format"

type LiveStatus = "live" | "scheduled" | "ended"

type LiveSession = {
  id: string
  title: string
  host: string
  category: string
  status: LiveStatus
  viewers: number
  startsAt: string
  thumbnail: string
  verifiedProducts: number
  featuredProduct: {
    id: string
    name: string
    price: number
    badge: string
  }
}

const SESSIONS: LiveSession[] = [
  {
    id: "live-beauty-auth",
    title: "Kiểm chứng mỹ phẩm chính hãng trước khi mua",
    host: "Natural Beauty Official",
    category: "Mỹ phẩm",
    status: "live",
    viewers: 1284,
    startsAt: new Date().toISOString(),
    thumbnail:
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1200&q=80",
    verifiedProducts: 18,
    featuredProduct: {
      id: "prod-lip-spf",
      name: "Son dưỡng SPF 15 có tem QR",
      price: 159000,
      badge: "Đã xác thực QR",
    },
  },
  {
    id: "live-home-auth",
    title: "Gia dụng chính hãng: kiểm tem, kiểm bảo hành",
    host: "HomeTrust Store",
    category: "Gia dụng",
    status: "scheduled",
    viewers: 0,
    startsAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    thumbnail:
      "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1200&q=80",
    verifiedProducts: 12,
    featuredProduct: {
      id: "prod-air-fryer",
      name: "Nồi chiên 5L bảo hành điện tử",
      price: 1290000,
      badge: "Shop đã chứng nhận",
    },
  },
  {
    id: "live-tech-auth",
    title: "Phân biệt tai nghe thật - giả qua QR và serial",
    host: "TechPoint Authorized",
    category: "Điện tử",
    status: "live",
    viewers: 846,
    startsAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    thumbnail:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80",
    verifiedProducts: 9,
    featuredProduct: {
      id: "prod-headphone-pro",
      name: "Tai nghe chống ồn có serial xác thực",
      price: 2190000,
      badge: "Kiểm định nguồn gốc",
    },
  },
]

const FILTERS = ["Tất cả", "Đang live", "Sắp diễn ra", "Mỹ phẩm", "Gia dụng", "Điện tử"]

function statusLabel(status: LiveStatus) {
  if (status === "live") return "Đang live"
  if (status === "scheduled") return "Sắp diễn ra"
  return "Đã kết thúc"
}

export default function LiveCommerceScreen() {
  const [filter, setFilter] = useState(FILTERS[0])
  const [query, setQuery] = useState("")

  const sessions = useMemo(() => {
    return SESSIONS.filter((session) => {
      const matchesFilter =
        filter === "Tất cả" ||
        (filter === "Đang live" && session.status === "live") ||
        (filter === "Sắp diễn ra" && session.status === "scheduled") ||
        session.category === filter
      const matchesQuery =
        !query.trim() ||
        `${session.title} ${session.host} ${session.featuredProduct.name}`
          .toLowerCase()
          .includes(query.trim().toLowerCase())
      return matchesFilter && matchesQuery
    })
  }, [filter, query])

  const featured = sessions[0] ?? SESSIONS[0]

  return (
    <div className="bg-neutral-50">
      <section className="border-b border-neutral-200 bg-white">
        <div className="container-acf grid gap-5 py-5 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="relative min-h-[360px] overflow-hidden rounded-lg bg-neutral-950">
            <img
              src={featured.thumbnail}
              alt={featured.title}
              className="h-full min-h-[360px] w-full object-cover opacity-70"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent p-5 text-white">
              <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-semibold">
                <span className="inline-flex items-center gap-1 rounded bg-brand-red-600 px-2 py-1">
                  <Play size={12} fill="currentColor" /> {statusLabel(featured.status)}
                </span>
                <span className="inline-flex items-center gap-1 rounded bg-white/15 px-2 py-1">
                  <ShieldCheck size={12} /> Bảo mật bởi IVS & Quỹ Chống Hàng Giả VN
                </span>
              </div>
              <h1 className="max-w-2xl text-2xl font-extrabold md:text-4xl">
                {featured.title}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-white/90">
                <span className="inline-flex items-center gap-1">
                  <BadgeCheck size={16} className="text-brand-gold-400" /> {featured.host}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Eye size={16} /> {featured.viewers.toLocaleString("vi-VN")} người xem
                </span>
                <span>{featured.verifiedProducts} sản phẩm có QR</span>
              </div>
            </div>
          </div>

          <aside className="rounded-lg border border-neutral-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-neutral-900">Sản phẩm đang ghim</h2>
              <span className="rounded bg-brand-gold-100 px-2 py-1 text-xs font-bold text-brand-gold-800">
                {featured.featuredProduct.badge}
              </span>
            </div>
            <div className="mt-4 rounded-lg border border-neutral-200 p-3">
              <div className="text-sm font-semibold text-neutral-900">
                {featured.featuredProduct.name}
              </div>
              <div className="mt-1 text-xl font-extrabold text-brand-red-600">
                {formatCurrency(featured.featuredProduct.price)}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-neutral-600">
                <span className="inline-flex items-center gap-1">
                  <ShieldCheck size={14} className="text-emerald-600" /> QR hợp lệ
                </span>
                <span className="inline-flex items-center gap-1">
                  <Star size={14} className="text-brand-gold-500" /> Shop tin cậy
                </span>
              </div>
              <Link
                to={`/products/${featured.featuredProduct.id}`}
                className="btn-primary mt-4 w-full justify-center"
              >
                <ShoppingBag size={16} /> Xem sản phẩm
              </Link>
            </div>
            <button className="btn-secondary mt-3 w-full justify-center">
              <Bell size={16} /> Nhắc khi có deal chính hãng
            </button>
          </aside>
        </div>
      </section>

      <section className="container-acf py-5">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-2 overflow-x-auto">
            {FILTERS.map((item) => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={cn(
                  "shrink-0 rounded-md border px-3 py-2 text-sm font-semibold",
                  filter === item
                    ? "border-brand-red-500 bg-brand-red-50 text-brand-red-700"
                    : "border-neutral-200 bg-white text-neutral-700"
                )}
              >
                {item}
              </button>
            ))}
          </div>
          <label className="relative block lg:w-80">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
            />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="input pl-9"
              placeholder="Tìm phiên live, shop, sản phẩm"
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {sessions.map((session) => (
            <Link
              key={session.id}
              to={`/live/${session.id}`}
              className="overflow-hidden rounded-lg border border-neutral-200 bg-white transition hover:border-brand-red-300 hover:shadow-sm"
            >
              <div className="relative aspect-video bg-neutral-900">
                <img
                  src={session.thumbnail}
                  alt={session.title}
                  className="h-full w-full object-cover"
                />
                <span
                  className={cn(
                    "absolute left-3 top-3 rounded px-2 py-1 text-xs font-bold text-white",
                    session.status === "live" ? "bg-brand-red-600" : "bg-neutral-800/80"
                  )}
                >
                  {statusLabel(session.status)}
                </span>
              </div>
              <div className="p-4">
                <h3 className="line-clamp-2 text-base font-bold text-neutral-900">
                  {session.title}
                </h3>
                <div className="mt-2 flex items-center gap-1 text-xs text-neutral-600">
                  <BadgeCheck size={13} className="text-brand-gold-500" />
                  {session.host}
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-neutral-600">
                  <span className="inline-flex items-center gap-1">
                    <Eye size={13} /> {session.viewers.toLocaleString("vi-VN")}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <ShieldCheck size={13} /> {session.verifiedProducts} QR
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MessageCircle size={13} /> Chat
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-2 rounded-md bg-neutral-50 p-2 text-xs text-neutral-700">
                  <CalendarClock size={14} className="text-brand-red-500" />
                  {new Date(session.startsAt).toLocaleString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                    day: "2-digit",
                    month: "2-digit",
                  })}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
