import { useEffect, useState } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  Copy,
  Eye,
  EyeOff,
  Radio,
  CircleStop,
  Share2,
  ExternalLink,
  AlertCircle,
} from "lucide-react"
import toast from "react-hot-toast"
import { cn } from "../../../lib/cn"
import { sanitizeUserError } from "../../../lib/error-utils"
import { useAuthStore } from "../../../stores/auth-store"
import {
  useEndLiveStream,
  useLiveStream,
  useStreamCredentials,
} from "../../../hooks/use-live-stream"

function copy(text: string, label: string) {
  navigator.clipboard
    .writeText(text)
    .then(() => toast.success(`Đã sao chép ${label}`))
    .catch(() => toast.error(`Không sao chép được ${label}`))
}

function buildTikTokShareUrl(streamId: string, title: string) {
  const caption = `🔴 LIVE ${title} | acfmart.vn/live/${streamId} #acfmart #chinhhang #chongtanggia`
  return `https://www.tiktok.com/upload?caption=${encodeURIComponent(caption)}`
}

export default function SellerLiveStudioScreen() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const { data: stream, isLoading } = useLiveStream(id ?? null)
  const credentialsMutation = useStreamCredentials()
  const endMutation = useEndLiveStream()
  const [revealKey, setRevealKey] = useState(false)

  useEffect(() => {
    if (id && stream && stream.vendor_id === user?.id) {
      credentialsMutation
        .mutateAsync(id)
        .catch(() => undefined)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, stream?.vendor_id])

  if (isLoading) {
    return (
      <div className="p-6 text-sm text-neutral-500">Đang tải Studio…</div>
    )
  }

  if (!stream) {
    return (
      <div className="p-6">
        <p className="text-base font-semibold text-neutral-800">
          Không tìm thấy phiên live.
        </p>
        <Link
          to="/seller/live"
          className="mt-2 inline-flex items-center gap-1 text-sm text-brand-red-600 hover:underline"
        >
          <ArrowLeft size={14} /> Trở về danh sách
        </Link>
      </div>
    )
  }

  const isOwner = user?.id === stream.vendor_id
  const creds = credentialsMutation.data
  const credsError =
    credentialsMutation.error instanceof Error
      ? credentialsMutation.error.message
      : null

  async function handleEnd() {
    if (!stream) return
    if (!window.confirm("Kết thúc phiên live này?")) return
    try {
      await endMutation.mutateAsync(stream.id)
      toast.success("Đã đánh dấu kết thúc phiên")
      navigate("/seller/live")
    } catch (err) {
      toast.error(sanitizeUserError(err, "Không kết thúc được. Vui lòng thử lại sau."))
    }
  }

  return (
    <div className="space-y-4 p-4 lg:p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <Link
            to="/seller/live"
            className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-brand-red-600"
          >
            <ArrowLeft size={14} /> Trở về
          </Link>
          <h1 className="mt-1 flex items-center gap-2 text-xl font-bold text-neutral-900">
            <Radio size={22} className="text-brand-red-500" />
            <span className="truncate">{stream.title}</span>
            {stream.status === "live" && (
              <span className="rounded bg-brand-red-600 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                ● Live
              </span>
            )}
          </h1>
          <p className="text-sm text-neutral-500">
            Lịch phát: {new Date(stream.scheduled_start_at).toLocaleString("vi-VN")}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <a
            href={`/live/${stream.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-md border border-neutral-300 px-3 py-1.5 text-xs text-neutral-700 hover:border-brand-red-300 hover:bg-brand-red-50 hover:text-brand-red-600"
          >
            <ExternalLink size={14} /> Xem trang buyer
          </a>
          <button
            onClick={() => window.open(buildTikTokShareUrl(stream.id, stream.title), "_blank", "noopener,noreferrer")}
            className="inline-flex items-center gap-1 rounded-md border border-neutral-300 px-3 py-1.5 text-xs text-neutral-700 hover:border-brand-red-300 hover:bg-brand-red-50 hover:text-brand-red-600"
            title="Chia sẻ qua TikTok"
          >
            <Share2 size={14} /> TikTok
          </button>
          {stream.status === "live" && (
            <button
              onClick={handleEnd}
              disabled={endMutation.isPending}
              className="inline-flex items-center gap-1 rounded-md bg-brand-red-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-red-600 disabled:bg-neutral-300"
            >
              <CircleStop size={14} /> Kết thúc
            </button>
          )}
        </div>
      </div>

      {!isOwner && (
        <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          Bạn không phải chủ phiên live này. Một số chức năng bị hạn chế.
        </div>
      )}

      {credsError && (
        <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">Cloudflare chưa kích hoạt</p>
            <p className="text-xs text-amber-800">{credsError}</p>
            <p className="mt-1 text-xs text-amber-800">
              Liên hệ admin để cấu hình{" "}
              <code className="rounded bg-amber-100 px-1">CLOUDFLARE_API_TOKEN</code>{" "}
              và các secret khác (xem{" "}
              <a
                href="/docs/cloudflare-stream-setup.md"
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                docs/cloudflare-stream-setup.md
              </a>
              ).
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="space-y-3 lg:col-span-2">
          <div className="rounded-lg border border-neutral-200 bg-white p-4">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-neutral-500">
              Thông tin phát (OBS / encoder)
            </h2>
            {creds ? (
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-neutral-500">Server URL (RTMPS)</p>
                  <div className="mt-1 flex items-center gap-2">
                    <code className="block flex-1 truncate rounded bg-neutral-100 px-3 py-2 font-mono text-xs">
                      {creds.rtmpsUrl}
                    </code>
                    <button
                      onClick={() => copy(creds.rtmpsUrl, "Server URL")}
                      className="rounded-md border border-neutral-200 p-2 hover:bg-neutral-50"
                      aria-label="Sao chép"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Stream Key</p>
                  <div className="mt-1 flex items-center gap-2">
                    <code className="block flex-1 truncate rounded bg-neutral-100 px-3 py-2 font-mono text-xs">
                      {revealKey
                        ? creds.streamKey
                        : "•".repeat(Math.min(creds.streamKey.length, 32))}
                    </code>
                    <button
                      onClick={() => setRevealKey((p) => !p)}
                      className="rounded-md border border-neutral-200 p-2 hover:bg-neutral-50"
                      aria-label={revealKey ? "Ẩn key" : "Hiện key"}
                    >
                      {revealKey ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                    <button
                      onClick={() => copy(creds.streamKey, "Stream Key")}
                      className="rounded-md border border-neutral-200 p-2 hover:bg-neutral-50"
                      aria-label="Sao chép"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                  <p className="mt-1 text-[11px] text-neutral-500">
                    Không chia sẻ stream key cho bất kỳ ai khác.
                  </p>
                </div>
              </div>
            ) : credentialsMutation.isPending ? (
              <p className="text-sm text-neutral-500">Đang tải thông tin RTMPS…</p>
            ) : (
              <p className="text-sm text-neutral-500">
                Chưa có thông tin RTMPS. Liên hệ admin để cấu hình Cloudflare.
              </p>
            )}
          </div>

          <div className="rounded-lg border border-neutral-200 bg-white p-4">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-neutral-500">
              Hướng dẫn cấu hình OBS
            </h2>
            <ol className="list-inside list-decimal space-y-1.5 text-sm text-neutral-700">
              <li>Mở OBS Studio → Settings → Stream.</li>
              <li>
                Service: <code className="rounded bg-neutral-100 px-1">Custom</code>.
              </li>
              <li>
                Server: dán <b>Server URL</b> ở trên.
              </li>
              <li>
                Stream Key: dán <b>Stream Key</b> ở trên.
              </li>
              <li>Settings → Output → Video Bitrate 4500 Kbps, Audio Bitrate 128 Kbps.</li>
              <li>Settings → Video → Output Resolution 1280×720, FPS 30.</li>
              <li>Bấm <b>Start Streaming</b> trong OBS.</li>
            </ol>
            <p className="mt-3 text-xs text-neutral-500">
              Khi OBS kết nối thành công, phiên live sẽ tự chuyển trạng thái sang{" "}
              <b>Đang phát</b> trong vòng ~10 giây (webhook từ Cloudflare).
            </p>
          </div>
        </section>

        <aside className="space-y-3">
          <div className="rounded-lg border border-neutral-200 bg-white p-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-500">
              Trạng thái
            </h3>
            <p
              className={cn(
                "mt-2 text-base font-semibold",
                stream.status === "live"
                  ? "text-brand-red-600"
                  : stream.status === "scheduled"
                  ? "text-brand-gold-700"
                  : "text-neutral-500"
              )}
            >
              {stream.status === "live"
                ? "● Đang phát"
                : stream.status === "scheduled"
                ? "Sắp diễn ra"
                : stream.status === "ended"
                ? "Đã kết thúc"
                : "Đã huỷ"}
            </p>
            {stream.verified_origin && (
              <p className="mt-1 text-xs text-brand-gold-700">
                ✓ Đã xác thực phát từ shop chính chủ
              </p>
            )}
          </div>

          <div className="rounded-lg border border-neutral-200 bg-white p-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-500">
              Thống kê
            </h3>
            <div className="mt-2 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500">Người xem cao nhất</span>
                <span className="inline-flex items-center gap-1 font-semibold text-neutral-900">
                  <Eye size={12} /> {stream.peak_viewers.toLocaleString("vi-VN")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Tổng lượt xem</span>
                <span className="font-semibold text-neutral-900">
                  {stream.total_views.toLocaleString("vi-VN")}
                </span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
