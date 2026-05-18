import { useEffect, useMemo, useState } from "react"
import { useParams, Link } from "react-router-dom"
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Heart,
  Share2,
  ShoppingBag,
  ShieldCheck,
  Eye,
  Send,
  X,
  BadgeCheck,
} from "lucide-react"
import toast from "react-hot-toast"
import { cn } from "@/lib/cn"
import { formatRelativeTime } from "@/lib/format"
import {
  useLiveStream,
  useLiveStreamChat,
  useLiveStreamRealtime,
  useSignedPlayback,
} from "@/hooks/use-live-stream"
import { liveStreamService } from "@/lib/firestore-livestream"
import { sanitizeUserError } from "@/lib/error-utils"
import { useAuthStore } from "@/stores/auth-store"

const TIKTOK_HASHTAGS = "#acfmart #chinhhang #chongtanggia"

function buildTikTokShareUrl(streamId: string, title: string) {
  const caption = `🔴 LIVE ${title} | acfmart.vn/live/${streamId} ${TIKTOK_HASHTAGS}`
  return `https://www.tiktok.com/upload?caption=${encodeURIComponent(caption)}`
}

export default function LiveStreamRoomScreen() {
  const { id } = useParams<{ id: string }>()
  const user = useAuthStore((s) => s.user)
  const [isMuted, setIsMuted] = useState(false)
  const [isPlaying, setIsPlaying] = useState(true)
  const [chatInput, setChatInput] = useState("")
  const [liked, setLiked] = useState(false)
  const [showProductList, setShowProductList] = useState(false)

  const { data: stream, isLoading, isError } = useLiveStream(id ?? null)

  const roomId = stream?.firestore_room_id ?? stream?.id ?? null
  const { data: realtime } = useLiveStreamRealtime(roomId)
  const chatMessages = useLiveStreamChat(roomId)
  const playbackQuery = useSignedPlayback(stream?.status === "live" ? roomId : null)
  const signedManifestUrl = playbackQuery.data?.manifestUrl ?? null
  const playbackError = playbackQuery.error
    ? sanitizeUserError(
        playbackQuery.error,
        "Hệ thống đang gặp trục trặc khi tải luồng video."
      )
    : null

  useEffect(() => {
    if (!roomId || !user?.id) return
    let cancelled = false
    liveStreamService.joinStream(roomId, user.id).catch(() => undefined)
    return () => {
      cancelled = true
      void liveStreamService.leaveStream(roomId, user.id)
      void cancelled
    }
  }, [roomId, user?.id])

  async function handleSendChat() {
    const text = chatInput.trim()
    if (!text || !roomId || !user?.id) return
    try {
      await liveStreamService.sendChat({
        streamId: roomId,
        senderId: user.id,
        senderName: user.name,
        senderAvatar: user.avatar,
        content: text,
        isHost: user.id === stream?.vendor_id,
      })
      setChatInput("")
    } catch (err) {
      toast.error(sanitizeUserError(err, "Không gửi được bình luận. Vui lòng thử lại sau."))
    }
  }

  function handleLike() {
    setLiked((prev) => !prev)
    toast.success(liked ? "Đã bỏ thích livestream" : "Đã thích livestream")
  }

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast.success("Đã sao chép liên kết livestream")
    } catch {
      toast.error("Không sao chép được liên kết")
    }
  }

  function handleShareTikTok() {
    if (!stream) return
    const url = buildTikTokShareUrl(stream.id, stream.title)
    window.open(url, "_blank", "noopener,noreferrer")
    toast.success("Mở TikTok để chia sẻ — dán video phát lại vào ô tải lên")
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-neutral-900">
        <div className="text-center text-white">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-brand-red-500 border-t-transparent" />
          <p className="text-lg font-semibold">Đang tải phòng livestream...</p>
        </div>
      </div>
    )
  }

  if (isError || !stream) {
    return (
      <div className="flex h-screen items-center justify-center bg-neutral-900">
        <div className="max-w-md rounded-2xl border border-dashed border-neutral-700 bg-neutral-800 p-8 text-center">
          <h1 className="text-2xl font-bold text-white">Không tìm thấy livestream</h1>
          <p className="mt-2 text-sm text-neutral-400">
            Phiên livestream này đã kết thúc hoặc không tồn tại.
          </p>
          <Link to="/live" className="btn-primary mt-6 inline-flex">
            Về danh sách live
          </Link>
        </div>
      </div>
    )
  }

  const viewerCount = realtime?.viewerCount ?? stream.peak_viewers ?? 0

  return (
    <div className="relative flex h-screen bg-neutral-900">
      {/* Video Player */}
      <div className="absolute inset-0">
        {signedManifestUrl ? (
          <video
            key={signedManifestUrl}
            src={signedManifestUrl}
            className="h-full w-full object-cover"
            autoPlay
            playsInline
            muted={isMuted}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-neutral-800 px-6 text-center text-neutral-300">
            {stream.status === "scheduled" && (
              <>
                <p className="text-base font-semibold">Phiên live chưa bắt đầu</p>
                <p className="text-sm text-neutral-400">
                  Lịch phát: {new Date(stream.scheduled_start_at).toLocaleString("vi-VN")}
                </p>
              </>
            )}
            {stream.status === "ended" && (
              <p className="text-base font-semibold">Phiên live đã kết thúc</p>
            )}
            {stream.status === "live" && playbackQuery.isLoading && (
              <p className="text-sm text-neutral-400">Đang tải luồng video…</p>
            )}
            {stream.status === "live" && playbackError && (
              <>
                <p className="text-base font-semibold">Chưa thể phát luồng</p>
                <p className="max-w-md text-xs text-neutral-400">{playbackError}</p>
              </>
            )}
          </div>
        )}

        {/* Top badges */}
        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 bg-gradient-to-b from-black/60 to-transparent p-4">
          <div className="flex flex-col gap-1">
            {stream.status === "live" && (
              <span className="inline-flex w-fit items-center gap-1 rounded bg-brand-red-600 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">
                ● ĐANG LIVE
              </span>
            )}
            {stream.verified_origin && (
              <span className="inline-flex w-fit items-center gap-1 rounded bg-brand-gold-500 px-2 py-0.5 text-[11px] font-bold text-white">
                <BadgeCheck size={12} /> Phát từ shop chính chủ
              </span>
            )}
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsPlaying((prev) => !prev)}
                className="rounded-full bg-white/20 p-3 text-white backdrop-blur hover:bg-white/30"
                aria-label={isPlaying ? "Tạm dừng" : "Phát"}
              >
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              </button>
              <button
                onClick={() => setIsMuted((prev) => !prev)}
                className="rounded-full bg-white/20 p-3 text-white backdrop-blur hover:bg-white/30"
                aria-label={isMuted ? "Bật âm" : "Tắt âm"}
              >
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              <button
                onClick={handleShareTikTok}
                className="rounded-full bg-white/20 p-3 text-white backdrop-blur hover:bg-white/30"
                aria-label="Chia sẻ qua TikTok"
                title="Chia sẻ qua TikTok"
              >
                {/* TikTok icon (inline svg to avoid extra dep) */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V8.61a8.16 8.16 0 0 0 4.77 1.52V6.69a4.83 4.83 0 0 1-1.84-.0Z" />
                </svg>
              </button>
            </div>

            <span className="inline-flex items-center gap-1 rounded bg-brand-red-600 px-3 py-1 text-xs font-bold text-white">
              <Eye size={14} /> {viewerCount.toLocaleString("vi-VN")}
            </span>
          </div>
        </div>
      </div>

      {/* Left Sidebar - Product List */}
      <div
        className={cn(
          "absolute left-0 top-0 z-10 h-full w-80 transform bg-white transition-transform duration-300 lg:relative lg:transform-none",
          showProductList ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex h-full flex-col">
          <div className="border-b border-neutral-200 p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-neutral-900">Sản phẩm trong live</h2>
              <button
                onClick={() => setShowProductList(false)}
                className="rounded p-1 text-neutral-500 hover:bg-neutral-100 lg:hidden"
                aria-label="Đóng"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="flex flex-1 items-center justify-center p-6 text-center text-sm text-neutral-500">
            Shop chưa ghim sản phẩm nào cho phiên live này.
          </div>
        </div>
      </div>

      {/* Right Sidebar - Chat */}
      <div className="absolute right-0 top-0 z-10 hidden h-full w-80 flex-col bg-white lg:flex">
        <div className="border-b border-neutral-200 p-4">
          <h2 className="text-lg font-bold text-neutral-900">Bình luận</h2>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {chatMessages.length === 0 ? (
            <div className="flex h-full items-center justify-center text-center text-sm text-neutral-500">
              Hãy là người đầu tiên bình luận trong phiên live này.
            </div>
          ) : (
            chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex gap-2",
                  msg.isHost && "-mx-2 rounded-lg bg-brand-gold-50 p-2"
                )}
              >
                {msg.senderAvatar ? (
                  <img
                    src={msg.senderAvatar}
                    alt={msg.senderName}
                    className="h-8 w-8 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-red-100 text-xs font-bold text-brand-red-700">
                    {msg.senderName[0]?.toUpperCase() ?? "?"}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "text-xs font-semibold",
                        msg.isHost ? "text-brand-gold-700" : "text-neutral-700"
                      )}
                    >
                      {msg.senderName}
                    </span>
                    {msg.isHost && <ShieldCheck size={12} className="text-brand-gold-500" />}
                    <span className="text-[10px] text-neutral-400">
                      {formatRelativeTime(msg.timestamp)}
                    </span>
                  </div>
                  <p className="break-words text-sm text-neutral-800">{msg.content}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-neutral-200 p-4">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleSendChat()
                }
              }}
              placeholder={user ? "Nhập bình luận..." : "Đăng nhập để bình luận"}
              disabled={!user}
              className="flex-1 rounded-full border border-neutral-300 px-4 py-2 text-sm focus:border-brand-red-500 focus:outline-none focus:ring-1 focus:ring-brand-red-500 disabled:bg-neutral-100"
            />
            <button
              onClick={handleSendChat}
              disabled={!user || !chatInput.trim()}
              className="rounded-full bg-brand-red-500 p-2 text-white hover:bg-brand-red-600 disabled:bg-neutral-300"
              aria-label="Gửi"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Action Buttons */}
      <div className="absolute bottom-20 right-4 z-10 flex flex-col gap-3 lg:hidden">
        <button
          onClick={() => setShowProductList((prev) => !prev)}
          className="rounded-full bg-white/90 p-3 text-neutral-800 shadow-lg backdrop-blur"
          aria-label="Danh sách sản phẩm"
        >
          <ShoppingBag size={20} />
        </button>
        <button
          onClick={handleLike}
          className={cn(
            "rounded-full p-3 shadow-lg backdrop-blur",
            liked ? "bg-pink-500 text-white" : "bg-white/90 text-neutral-800"
          )}
          aria-label="Thích"
        >
          <Heart size={20} fill={liked ? "currentColor" : "none"} />
        </button>
        <button
          onClick={handleShare}
          className="rounded-full bg-white/90 p-3 text-neutral-800 shadow-lg backdrop-blur"
          aria-label="Chia sẻ"
        >
          <Share2 size={20} />
        </button>
      </div>
    </div>
  )
}
