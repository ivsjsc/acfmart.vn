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
} from "lucide-react"
import toast from "react-hot-toast"
import { cn } from "@/lib/cn"
import { formatRelativeTime } from "@/lib/format"
import {
  useLiveStreams,
  useLiveStreamChat,
  useLiveStreamRealtime,
} from "@/hooks/use-live-stream"
import { liveStreamService } from "@/lib/firestore-livestream"
import { useAuthStore } from "@/stores/auth-store"

export default function LiveStreamRoomScreen() {
  const { id } = useParams<{ id: string }>()
  const user = useAuthStore((s) => s.user)
  const [isMuted, setIsMuted] = useState(false)
  const [isPlaying, setIsPlaying] = useState(true)
  const [chatInput, setChatInput] = useState("")
  const [liked, setLiked] = useState(false)
  const [showProductList, setShowProductList] = useState(false)

  const { data, isLoading, isError } = useLiveStreams("live")
  const streams = data?.streams ?? []
  const stream = useMemo(
    () => streams.find((s) => s.id === id) ?? streams[0] ?? null,
    [streams, id]
  )

  const roomId = stream?.firestore_room_id ?? stream?.id ?? null
  const { data: realtime } = useLiveStreamRealtime(roomId)
  const chatMessages = useLiveStreamChat(roomId)

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
      toast.error(err instanceof Error ? err.message : "Không gửi được bình luận")
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
        {stream.hls_url ? (
          <video
            src={stream.hls_url}
            className="h-full w-full object-cover"
            autoPlay
            playsInline
            muted={isMuted}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-neutral-800 text-neutral-500">
            Luồng video chưa sẵn sàng
          </div>
        )}

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
