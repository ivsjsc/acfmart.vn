import { useState, type FormEvent } from "react"
import { useNavigate, Link } from "react-router-dom"
import { ArrowLeft, Image as ImageIcon, Loader2 } from "lucide-react"
import toast from "react-hot-toast"
import { useAuthStore } from "../../../stores/auth-store"
import { useScheduleLiveStream } from "../../../hooks/use-live-stream"
import { uploadSellerDocument } from "../../../lib/upload"

const CATEGORIES = [
  "Mỹ phẩm",
  "Thời trang",
  "Điện tử",
  "Gia dụng",
  "Mẹ & bé",
  "Thực phẩm",
  "Khác",
]

function defaultStartAt() {
  const now = new Date(Date.now() + 30 * 60 * 1000)
  const tzOffsetMs = now.getTimezoneOffset() * 60 * 1000
  return new Date(now.getTime() - tzOffsetMs).toISOString().slice(0, 16)
}

export default function SellerLiveFormScreen() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const schedule = useScheduleLiveStream()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState<string>(CATEGORIES[0])
  const [scheduledAt, setScheduledAt] = useState(defaultStartAt())
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  async function handleThumbnail(file: File) {
    if (!user?.id) return
    setUploading(true)
    try {
      const url = await uploadSellerDocument(
        file,
        user.id,
        "livestream-thumbnails"
      )
      setThumbnailUrl(url)
      toast.success("Đã tải ảnh thumbnail")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không tải được ảnh")
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!title.trim()) {
      toast.error("Vui lòng nhập tiêu đề phiên live")
      return
    }
    try {
      const res = await schedule.mutateAsync({
        title: title.trim(),
        description: description.trim() || undefined,
        thumbnail_url: thumbnailUrl ?? undefined,
        category,
        scheduled_start_at: new Date(scheduledAt).toISOString(),
      })
      if (res.credentialsError) {
        toast(
          (t) => (
            <span>
              Phiên đã tạo ở trạng thái <b>Sắp diễn ra</b>. Cloudflare chưa kích hoạt:
              <br />
              <span className="text-xs text-neutral-500">{res.credentialsError}</span>
              <button
                onClick={() => toast.dismiss(t.id)}
                className="ml-2 text-brand-red-600"
              >
                OK
              </button>
            </span>
          ),
          { duration: 8000 }
        )
      } else {
        toast.success("Đã tạo phiên live. Vào Studio để lấy RTMPS URL.")
      }
      navigate(`/seller/live/${res.streamId}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không tạo được phiên")
    }
  }

  return (
    <div className="space-y-4 p-4 lg:p-6">
      <Link
        to="/seller/live"
        className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-brand-red-600"
      >
        <ArrowLeft size={14} /> Trở về danh sách phiên live
      </Link>
      <div>
        <h1 className="text-xl font-bold text-neutral-900">Tạo phiên live mới</h1>
        <p className="text-sm text-neutral-500">
          Lên lịch phát livestream. Sau khi tạo, anh sẽ nhận URL RTMPS để cấu hình OBS.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-lg border border-neutral-200 bg-white p-5"
      >
        <div>
          <label className="mb-1 block text-sm font-semibold text-neutral-800">
            Tiêu đề phiên live <span className="text-brand-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="VD: Kiểm chứng mỹ phẩm chính hãng — Tem QR Bộ Công Thương"
            maxLength={120}
            required
            className="input w-full"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-neutral-800">
            Mô tả ngắn
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Nội dung phiên live, sản phẩm sẽ giới thiệu, ưu đãi…"
            maxLength={500}
            className="input w-full"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-semibold text-neutral-800">
              Danh mục
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input w-full"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-neutral-800">
              Lịch phát <span className="text-brand-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              required
              className="input w-full"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-neutral-800">
            Thumbnail (16:9)
          </label>
          <div className="flex items-center gap-3">
            <div className="flex h-24 w-40 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-dashed border-neutral-300 bg-neutral-50">
              {thumbnailUrl ? (
                <img
                  src={thumbnailUrl}
                  alt="Thumbnail"
                  className="h-full w-full object-cover"
                />
              ) : (
                <ImageIcon size={20} className="text-neutral-400" />
              )}
            </div>
            <label className="cursor-pointer rounded-md border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700 hover:border-brand-red-300 hover:bg-brand-red-50">
              {uploading ? (
                <span className="inline-flex items-center gap-1">
                  <Loader2 size={14} className="animate-spin" /> Đang tải…
                </span>
              ) : thumbnailUrl ? (
                "Đổi ảnh"
              ) : (
                "Tải ảnh"
              )}
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) void handleThumbnail(f)
                  e.target.value = ""
                }}
              />
            </label>
            {thumbnailUrl && (
              <button
                type="button"
                onClick={() => setThumbnailUrl(null)}
                className="text-sm text-neutral-500 hover:text-brand-red-600"
              >
                Xoá
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-neutral-100 pt-3">
          <Link
            to="/seller/live"
            className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:border-neutral-400"
          >
            Huỷ
          </Link>
          <button
            type="submit"
            disabled={schedule.isPending}
            className="btn-primary inline-flex items-center gap-1.5"
          >
            {schedule.isPending && <Loader2 size={14} className="animate-spin" />}
            Tạo phiên live
          </button>
        </div>
      </form>
    </div>
  )
}
