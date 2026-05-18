import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import {
  Radio,
  Plus,
  CalendarClock,
  Eye,
  CircleStop,
  ExternalLink,
  Share2,
} from "lucide-react"
import toast from "react-hot-toast"
import { cn } from "../../../lib/cn"
import { useAuthStore } from "../../../stores/auth-store"
import {
  useEndLiveStream,
  useStreamsForVendor,
} from "../../../hooks/use-live-stream"
import type { LiveStream, LiveStreamStatus } from "../../../types"

type Tab = "live" | "scheduled" | "ended"

const TAB_LABELS: Record<Tab, string> = {
  live: "Đang phát",
  scheduled: "Sắp diễn ra",
  ended: "Đã kết thúc",
}

function statusBadge(status: LiveStreamStatus) {
  if (status === "live")
    return (
      <span className="inline-flex items-center gap-1 rounded bg-brand-red-600 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
        ● Live
      </span>
    )
  if (status === "scheduled")
    return (
      <span className="inline-flex items-center gap-1 rounded bg-brand-gold-100 px-2 py-0.5 text-[10px] font-bold text-brand-gold-700">
        <CalendarClock size={10} /> Đã lên lịch
      </span>
    )
  if (status === "cancelled")
    return (
      <span className="inline-flex items-center rounded bg-neutral-200 px-2 py-0.5 text-[10px] font-bold text-neutral-600">
        Đã huỷ
      </span>
    )
  return (
    <span className="inline-flex items-center rounded bg-neutral-100 px-2 py-0.5 text-[10px] font-bold text-neutral-500">
      Đã kết thúc
    </span>
  )
}

function buildTikTokShareUrl(stream: LiveStream) {
  const caption = `🔴 LIVE ${stream.title} | acfmart.vn/live/${stream.id} #acfmart #chinhhang #chongtanggia`
  return `https://www.tiktok.com/upload?caption=${encodeURIComponent(caption)}`
}

export default function SellerLiveScreen() {
  const user = useAuthStore((s) => s.user)
  const vendorId = user?.id ?? null
  const [tab, setTab] = useState<Tab>("live")

  const { data, isLoading } = useStreamsForVendor(vendorId)
  const streams = data?.streams ?? []

  const buckets = useMemo(() => {
    const live: LiveStream[] = []
    const scheduled: LiveStream[] = []
    const ended: LiveStream[] = []
    for (const s of streams) {
      if (s.status === "live") live.push(s)
      else if (s.status === "scheduled") scheduled.push(s)
      else ended.push(s)
    }
    return { live, scheduled, ended }
  }, [streams])

  const visible = buckets[tab]
  const endMutation = useEndLiveStream()

  async function handleEnd(stream: LiveStream) {
    if (!window.confirm(`Kết thúc phiên "${stream.title}"?`)) return
    try {
      await endMutation.mutateAsync(stream.id)
      toast.success("Đã đánh dấu phiên live kết thúc")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không kết thúc được phiên")
    }
  }

  function handleShareTikTok(stream: LiveStream) {
    window.open(buildTikTokShareUrl(stream), "_blank", "noopener,noreferrer")
  }

  return (
    <div className="space-y-4 p-4 lg:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold text-neutral-900">
            <Radio size={22} className="text-brand-red-500" /> Phiên Live
          </h1>
          <p className="text-sm text-neutral-500">
            Quản lý các phiên livestream của shop. Sử dụng OBS hoặc encoder RTMPS để phát.
          </p>
        </div>
        <Link
          to="/seller/live/new"
          className="btn-primary inline-flex items-center gap-1.5"
        >
          <Plus size={16} /> Tạo phiên mới
        </Link>
      </div>

      <div className="flex items-center gap-2 border-b border-neutral-200">
        {(Object.keys(TAB_LABELS) as Tab[]).map((key) => {
          const count = buckets[key].length
          return (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={cn(
                "border-b-2 px-3 py-2 text-sm font-medium transition-colors",
                tab === key
                  ? "border-brand-red-500 text-brand-red-600"
                  : "border-transparent text-neutral-500 hover:text-neutral-800"
              )}
            >
              {TAB_LABELS[key]}{" "}
              <span className="ml-1 text-xs text-neutral-400">({count})</span>
            </button>
          )
        })}
      </div>

      {isLoading ? (
        <div className="rounded-lg border border-neutral-200 bg-white p-8 text-center text-sm text-neutral-500">
          Đang tải danh sách phiên live…
        </div>
      ) : visible.length === 0 ? (
        <div className="rounded-lg border border-dashed border-neutral-300 bg-white p-10 text-center">
          <Radio size={36} className="mx-auto mb-3 text-neutral-300" />
          <p className="text-base font-semibold text-neutral-700">
            Chưa có phiên {TAB_LABELS[tab].toLowerCase()}
          </p>
          <p className="mt-1 text-sm text-neutral-500">
            Tạo phiên live đầu tiên để chia sẻ sản phẩm chính hãng tới người mua.
          </p>
          <Link
            to="/seller/live/new"
            className="btn-primary mt-5 inline-flex items-center gap-1.5"
          >
            <Plus size={16} /> Tạo phiên live
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
          <table className="w-full">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-left text-xs uppercase tracking-wider text-neutral-500">
              <tr>
                <th className="px-3 py-2">Phiên</th>
                <th className="px-3 py-2">Trạng thái</th>
                <th className="px-3 py-2">Lịch phát</th>
                <th className="px-3 py-2 text-right">Người xem</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-sm">
              {visible.map((stream) => (
                <tr key={stream.id} className="hover:bg-neutral-50">
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-3">
                      {stream.thumbnail_url ? (
                        <img
                          src={stream.thumbnail_url}
                          alt={stream.title}
                          className="h-12 w-20 shrink-0 rounded object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-20 shrink-0 items-center justify-center rounded bg-neutral-100 text-neutral-400">
                          <Radio size={16} />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="truncate font-semibold text-neutral-900">
                          {stream.title}
                        </div>
                        <div className="truncate text-xs text-neutral-500">
                          {stream.category ?? "Chưa phân loại"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3">{statusBadge(stream.status)}</td>
                  <td className="px-3 py-3 text-neutral-600">
                    {new Date(stream.scheduled_start_at).toLocaleString("vi-VN")}
                  </td>
                  <td className="px-3 py-3 text-right">
                    <span className="inline-flex items-center gap-1 text-neutral-600">
                      <Eye size={12} /> {stream.peak_viewers.toLocaleString("vi-VN")}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        to={`/seller/live/${stream.id}`}
                        className="rounded-md border border-neutral-200 px-2.5 py-1 text-xs text-neutral-700 hover:border-brand-red-300 hover:bg-brand-red-50 hover:text-brand-red-600"
                      >
                        Studio
                      </Link>
                      {stream.status === "live" && (
                        <button
                          onClick={() => handleEnd(stream)}
                          disabled={endMutation.isPending}
                          className="inline-flex items-center gap-1 rounded-md bg-brand-red-500 px-2.5 py-1 text-xs font-semibold text-white hover:bg-brand-red-600 disabled:bg-neutral-300"
                        >
                          <CircleStop size={12} /> Kết thúc
                        </button>
                      )}
                      <button
                        onClick={() => handleShareTikTok(stream)}
                        className="rounded-md border border-neutral-200 px-2.5 py-1 text-xs text-neutral-700 hover:border-brand-red-300 hover:bg-brand-red-50 hover:text-brand-red-600"
                        title="Chia sẻ qua TikTok"
                      >
                        <Share2 size={12} />
                      </button>
                      <a
                        href={`/live/${stream.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-md border border-neutral-200 px-2.5 py-1 text-xs text-neutral-700 hover:border-brand-red-300 hover:bg-brand-red-50 hover:text-brand-red-600"
                        title="Xem trên trang buyer"
                      >
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
