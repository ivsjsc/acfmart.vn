import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import {
  BadgeCheck,
  Bell,
  CalendarClock,
  Eye,
  Loader2,
  MessageCircle,
  Play,
  Search,
  ShieldCheck,
  ShoppingBag,
  Star,
  Tv,
} from "lucide-react"
import { cn } from "../../lib/cn"
import { useLiveStreams, type LiveStreamSummary } from "../../hooks/use-live-stream"

// Fallback hero/card image when a stream doesn't have its own thumbnail.
const FALLBACK_THUMBNAIL =
  "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1200&q=80"

type StatusFilter = "all" | "live" | "scheduled"

const STATUS_FILTERS: Array<{ id: StatusFilter; label: string }> = [
  { id: "all", label: "Tất cả" },
  { id: "live", label: "Đang live" },
  { id: "scheduled", label: "Sắp diễn ra" },
]

function statusLabel(status: LiveStreamSummary["status"]) {
  if (status === "live") return "Đang live"
  if (status === "scheduled") return "Sắp diễn ra"
  if (status === "cancelled") return "Đã hủy"
  return "Đã kết thúc"
}

function formatStartTime(stream: LiveStreamSummary): string {
  const iso = stream.actual_start_at ?? stream.scheduled_start_at
  if (!iso) return "Chưa đặt lịch"
  try {
    return new Date(iso).toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
    })
  } catch {
    return "Chưa đặt lịch"
  }
}

export default function LiveCommerceScreen() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const [query, setQuery] = useState("")

  // Pull live + scheduled in parallel; we merge them client-side so the
  // listing can show both states at once. `ended` is intentionally omitted —
  // surface it later via a "Replay" tab once VOD is wired.
  const liveQuery = useLiveStreams("live")
  const scheduledQuery = useLiveStreams("scheduled")

  const isLoading = liveQuery.isLoading || scheduledQuery.isLoading
  const isError = liveQuery.isError || scheduledQuery.isError

  const allStreams = useMemo<LiveStreamSummary[]>(() => {
    const live = liveQuery.data?.streams ?? []
    const scheduled = scheduledQuery.data?.streams ?? []
    return [...live, ...scheduled]
  }, [liveQuery.data, scheduledQuery.data])

  const categories = useMemo(() => {
    const set = new Set<string>()
    for (const s of allStreams) {
      if (s.category) set.add(s.category)
    }
    return Array.from(set).sort()
  }, [allStreams])

  const sessions = useMemo(() => {
    return allStreams
      .filter((session) => {
        if (statusFilter === "live" && session.status !== "live") return false
        if (statusFilter === "scheduled" && session.status !== "scheduled") return false
        if (categoryFilter && session.category !== categoryFilter) return false
        if (!query.trim()) return true
        const haystack =
          `${session.title} ${session.host_name} ${session.description ?? ""}`.toLowerCase()
        return haystack.includes(query.trim().toLowerCase())
      })
      .sort((a, b) => {
        // Live first, then scheduled by soonest start time.
        if (a.status === "live" && b.status !== "live") return -1
        if (b.status === "live" && a.status !== "live") return 1
        const aTime = new Date(a.actual_start_at ?? a.scheduled_start_at).getTime()
        const bTime = new Date(b.actual_start_at ?? b.scheduled_start_at).getTime()
        return aTime - bTime
      })
  }, [allStreams, statusFilter, categoryFilter, query])

  const featured = sessions[0] ?? null

  return (
    <div className="bg-neutral-50">
      <section className="border-b border-neutral-200 bg-white">
        <div className="container-acf grid gap-5 py-5 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="relative min-h-[360px] overflow-hidden rounded-lg bg-neutral-950">
            {featured ? (
              <>
                <img
                  src={featured.thumbnail_url || FALLBACK_THUMBNAIL}
                  alt={featured.title}
                  className="h-full min-h-[360px] w-full object-cover opacity-70"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent p-5 text-white">
                  <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-semibold">
                    <span className="inline-flex items-center gap-1 rounded bg-brand-red-600 px-2 py-1">
                      <Play size={12} fill="currentColor" /> {statusLabel(featured.status)}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded bg-white/15 px-2 py-1">
                      <ShieldCheck size={12} /> Bảo mật bởi IVS &amp; Quỹ Chống Hàng Giả VN
                    </span>
                  </div>
                  <h1 className="max-w-2xl text-2xl font-extrabold md:text-4xl">
                    {featured.title}
                  </h1>
                  <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-white/90">
                    <span className="inline-flex items-center gap-1">
                      <BadgeCheck size={16} className="text-brand-gold-400" />{" "}
                      {featured.host_name}
                    </span>
                    {featured.status === "live" ? (
                      <span className="inline-flex items-center gap-1">
                        <Eye size={16} />{" "}
                        {featured.peak_viewers.toLocaleString("vi-VN")} người xem
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1">
                        <CalendarClock size={16} /> {formatStartTime(featured)}
                      </span>
                    )}
                    {featured.category && <span>{featured.category}</span>}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex h-full min-h-[360px] flex-col items-center justify-center px-6 text-center text-white">
                <Tv size={40} className="mb-3 text-white/40" />
                <h1 className="text-2xl font-extrabold md:text-4xl">
                  Chưa có phiên livestream
                </h1>
                <p className="mt-2 max-w-md text-sm text-white/70">
                  Khi shop bắt đầu phát hoặc lên lịch live, phiên sẽ xuất hiện
                  tại đây realtime.
                </p>
              </div>
            )}
          </div>

          <aside className="rounded-lg border border-neutral-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-neutral-900">Phiên nổi bật</h2>
              {featured?.status === "live" && (
                <span className="rounded bg-brand-red-50 px-2 py-1 text-xs font-bold text-brand-red-700">
                  Đang live
                </span>
              )}
            </div>
            {featured ? (
              <div className="mt-4 rounded-lg border border-neutral-200 p-3">
                <div className="text-sm font-semibold text-neutral-900">
                  {featured.title}
                </div>
                <div className="mt-1 text-xs text-neutral-600">
                  Shop: {featured.host_name}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-neutral-600">
                  <span className="inline-flex items-center gap-1">
                    <ShieldCheck size={14} className="text-emerald-600" /> Shop
                    đã xác thực
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Star size={14} className="text-brand-gold-500" /> Phiên
                    chính hãng
                  </span>
                </div>
                <Link
                  to={`/live/${featured.id}`}
                  className="btn-primary mt-4 w-full justify-center"
                >
                  <ShoppingBag size={16} />
                  {featured.status === "live" ? "Xem live ngay" : "Đặt lịch nhắc"}
                </Link>
              </div>
            ) : (
              <p className="mt-4 text-sm text-neutral-500">
                Hiện chưa có phiên live nào. Bật thông báo để biết khi shop bắt
                đầu live.
              </p>
            )}
            <button className="btn-secondary mt-3 w-full justify-center">
              <Bell size={16} /> Nhắc khi có deal chính hãng
            </button>
          </aside>
        </div>
      </section>

      <section className="container-acf py-5">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2 overflow-x-auto">
            {STATUS_FILTERS.map((item) => (
              <button
                key={item.id}
                onClick={() => setStatusFilter(item.id)}
                className={cn(
                  "shrink-0 rounded-md border px-3 py-2 text-sm font-semibold",
                  statusFilter === item.id
                    ? "border-brand-red-500 bg-brand-red-50 text-brand-red-700"
                    : "border-neutral-200 bg-white text-neutral-700"
                )}
              >
                {item.label}
              </button>
            ))}
            {categories.map((category) => (
              <button
                key={category}
                onClick={() =>
                  setCategoryFilter((prev) => (prev === category ? null : category))
                }
                className={cn(
                  "shrink-0 rounded-md border px-3 py-2 text-sm font-semibold",
                  categoryFilter === category
                    ? "border-brand-red-500 bg-brand-red-50 text-brand-red-700"
                    : "border-neutral-200 bg-white text-neutral-700"
                )}
              >
                {category}
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

        {isLoading ? (
          <div className="card flex items-center justify-center gap-2 p-12 text-sm text-neutral-500">
            <Loader2 size={16} className="animate-spin" /> Đang tải danh sách
            livestream...
          </div>
        ) : isError ? (
          <div className="card p-6 text-sm text-rose-600">
            Không thể tải danh sách livestream. Vui lòng thử lại sau.
          </div>
        ) : sessions.length === 0 ? (
          <div className="card flex flex-col items-center justify-center py-14 text-center">
            <Tv size={44} className="text-neutral-300" />
            <h3 className="mt-3 text-lg font-bold text-neutral-900">
              Chưa có phiên live phù hợp
            </h3>
            <p className="mt-1 max-w-md text-sm text-neutral-500">
              Hãy quay lại sau hoặc theo dõi shop bạn yêu thích để nhận thông
              báo khi shop bắt đầu phát.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {sessions.map((session) => (
              <Link
                key={session.id}
                to={`/live/${session.id}`}
                className="overflow-hidden rounded-lg border border-neutral-200 bg-white transition hover:border-brand-red-300 hover:shadow-sm"
              >
                <div className="relative aspect-video bg-neutral-900">
                  <img
                    src={session.thumbnail_url || FALLBACK_THUMBNAIL}
                    alt={session.title}
                    className="h-full w-full object-cover"
                  />
                  <span
                    className={cn(
                      "absolute left-3 top-3 rounded px-2 py-1 text-xs font-bold text-white",
                      session.status === "live"
                        ? "bg-brand-red-600"
                        : "bg-neutral-800/80"
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
                    {session.host_name}
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-neutral-600">
                    <span className="inline-flex items-center gap-1">
                      <Eye size={13} />{" "}
                      {(session.status === "live"
                        ? session.peak_viewers
                        : session.total_views
                      ).toLocaleString("vi-VN")}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MessageCircle size={13} /> Chat
                    </span>
                    {session.category && (
                      <span className="truncate" title={session.category}>
                        {session.category}
                      </span>
                    )}
                  </div>
                  <div className="mt-3 flex items-center gap-2 rounded-md bg-neutral-50 p-2 text-xs text-neutral-700">
                    <CalendarClock size={14} className="text-brand-red-500" />
                    {formatStartTime(session)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
