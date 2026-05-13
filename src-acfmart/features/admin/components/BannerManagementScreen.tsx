import { useState, useEffect } from "react"
import { Plus, Trash2, GripVertical, Eye, EyeOff, Pencil, Loader2, Image, ExternalLink } from "lucide-react"
import toast from "react-hot-toast"
import {
  getAdminBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  type BannerItem,
} from "../../../lib/banner-service"

export function BannerManagementScreen() {
  const [banners, setBanners] = useState<BannerItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    image_url: "",
    link_url: "",
    title: "",
    position: 0,
    active: true,
  })

  async function loadBanners() {
    setLoading(true)
    try {
      const items = await getAdminBanners()
      setBanners(items)
    } catch {
      toast.error("Không thể tải danh sách banner")
    }
    setLoading(false)
  }

  useEffect(() => { loadBanners() }, [])

  function resetForm() {
    setForm({ image_url: "", link_url: "", title: "", position: 0, active: true })
    setEditingId(null)
    setShowForm(false)
  }

  function startEdit(banner: BannerItem) {
    setForm({
      image_url: banner.image_url,
      link_url: banner.link_url,
      title: banner.title,
      position: banner.position,
      active: banner.active,
    })
    setEditingId(banner.id)
    setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.image_url) {
      toast.error("Vui lòng nhập URL hình ảnh")
      return
    }
    setSaving(true)
    try {
      if (editingId) {
        await updateBanner(editingId, form)
        toast.success("Đã cập nhật banner")
      } else {
        await createBanner(form)
        toast.success("Đã thêm banner mới")
      }
      resetForm()
      await loadBanners()
    } catch {
      toast.error("Lỗi khi lưu banner")
    }
    setSaving(false)
  }

  async function handleDelete(id: string) {
    if (!confirm("Xác nhận xóa banner này?")) return
    try {
      await deleteBanner(id)
      toast.success("Đã xóa banner")
      await loadBanners()
    } catch {
      toast.error("Lỗi khi xóa banner")
    }
  }

  async function toggleActive(banner: BannerItem) {
    try {
      await updateBanner(banner.id, { active: !banner.active })
      setBanners((prev) =>
        prev.map((b) => (b.id === banner.id ? { ...b, active: !b.active } : b))
      )
    } catch {
      toast.error("Lỗi khi cập nhật trạng thái")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Quản lý Banner</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Banner slide trang chủ — kéo thả để sắp xếp thứ tự
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true) }}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-red-700"
        >
          <Plus size={16} />
          Thêm Banner
        </button>
      </div>

      {/* Info box about Remote Config */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <p className="text-sm text-blue-800">
          <strong>2 nguồn banner:</strong>
        </p>
        <ul className="mt-1 list-inside list-disc text-xs text-blue-700">
          <li>
            <strong>Firestore</strong> (bảng bên dưới) — Quản lý trực tiếp tại đây
          </li>
          <li>
            <strong>Remote Config</strong> — Vào{" "}
            <a
              href="https://console.firebase.google.com/project/ecommerce-acf/remoteconfig"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline"
            >
              Firebase Console → Remote Config
              <ExternalLink size={10} className="ml-0.5 inline" />
            </a>
            {" "}→ key <code className="rounded bg-blue-100 px-1">homepage_banners</code> (JSON array)
          </li>
        </ul>
      </div>

      {/* Add/Edit form */}
      {showForm && (
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-neutral-900">
            {editingId ? "Chỉnh sửa Banner" : "Thêm Banner mới"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">
                  URL Hình ảnh *
                </label>
                <input
                  type="url"
                  value={form.image_url}
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  placeholder="https://example.com/banner.jpg"
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-brand-red-400 focus:ring-2 focus:ring-brand-red-100"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">
                  Link khi click (URL đích)
                </label>
                <input
                  type="url"
                  value={form.link_url}
                  onChange={(e) => setForm({ ...form, link_url: e.target.value })}
                  placeholder="https://acfmart.vn/products/..."
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-brand-red-400 focus:ring-2 focus:ring-brand-red-100"
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">
                  Tiêu đề (hiển thị trên ảnh)
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Khuyến mãi hè..."
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-brand-red-400 focus:ring-2 focus:ring-brand-red-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">
                  Vị trí (số nhỏ hiển thị trước)
                </label>
                <input
                  type="number"
                  value={form.position}
                  onChange={(e) => setForm({ ...form, position: parseInt(e.target.value) || 0 })}
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-brand-red-400 focus:ring-2 focus:ring-brand-red-100"
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 text-sm font-medium text-neutral-700">
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={(e) => setForm({ ...form, active: e.target.checked })}
                    className="h-4 w-4 rounded border-neutral-300 text-brand-red-600"
                  />
                  Hiển thị (active)
                </label>
              </div>
            </div>

            {/* Preview */}
            {form.image_url && (
              <div className="rounded-lg border border-neutral-100 bg-neutral-50 p-3">
                <p className="mb-2 text-xs font-medium text-neutral-500">Xem trước:</p>
                <img
                  src={form.image_url}
                  alt="Preview"
                  className="max-h-40 rounded-lg object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                />
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-brand-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-red-700 disabled:opacity-60"
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                {editingId ? "Cập nhật" : "Thêm"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-neutral-200 px-5 py-2.5 text-sm font-medium text-neutral-600 hover:bg-neutral-50"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Banner list */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-neutral-400" />
        </div>
      ) : banners.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 py-16 text-center">
          <Image size={40} className="mx-auto text-neutral-300" />
          <p className="mt-3 text-sm text-neutral-500">Chưa có banner nào</p>
          <p className="text-xs text-neutral-400">Bấm "Thêm Banner" để tạo slide mới</p>
        </div>
      ) : (
        <div className="space-y-3">
          {banners.map((banner) => (
            <div
              key={banner.id}
              className={`flex items-center gap-4 rounded-xl border bg-white p-4 shadow-sm transition-colors ${
                banner.active ? "border-neutral-200" : "border-neutral-100 opacity-60"
              }`}
            >
              <GripVertical size={18} className="shrink-0 cursor-grab text-neutral-300" />

              {/* Thumbnail */}
              <div className="h-16 w-28 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                <img
                  src={banner.image_url}
                  alt={banner.title}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://placehold.co/224x128/f5f5f5/a3a3a3?text=No+Image"
                  }}
                />
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-neutral-900">
                  {banner.title || "(Không có tiêu đề)"}
                </p>
                <p className="mt-0.5 truncate text-xs text-neutral-400">
                  {banner.link_url || "Không có link"}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-[11px] text-neutral-400">
                    Vị trí: {banner.position}
                  </span>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                    banner.active
                      ? "bg-green-50 text-green-700"
                      : "bg-neutral-100 text-neutral-500"
                  }`}>
                    {banner.active ? "Đang hiện" : "Ẩn"}
                  </span>
                  {banner.source === "remote_config" && (
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-600">
                      Remote Config
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex shrink-0 items-center gap-1">
                <button
                  onClick={() => toggleActive(banner)}
                  className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-50 hover:text-neutral-600"
                  title={banner.active ? "Ẩn banner" : "Hiện banner"}
                >
                  {banner.active ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
                <button
                  onClick={() => startEdit(banner)}
                  className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-50 hover:text-neutral-600"
                  title="Chỉnh sửa"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => handleDelete(banner.id)}
                  className="rounded-lg p-2 text-neutral-400 hover:bg-red-50 hover:text-red-600"
                  title="Xóa"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
