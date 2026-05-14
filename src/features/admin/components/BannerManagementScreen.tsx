import { useState, useEffect, useCallback } from "react"
import { Loader2, Trash2, ImagePlus } from "lucide-react"
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
  const [saving, setSaving] = useState(false)

  const [newBanner, setNewBanner] = useState({
    image_url: "",
    link_url: "",
    title: "",
    position: 0,
    active: true,
  })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const list = await getAdminBanners()
      setBanners(list)
    } catch {
      toast.error("Không thể tải danh sách banner")
      setBanners([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function handleAddBanner() {
    if (!newBanner.image_url.trim()) {
      toast.error("Vui lòng nhập URL hình ảnh")
      return
    }
    setSaving(true)
    try {
      await createBanner({
        image_url: newBanner.image_url.trim(),
        link_url: newBanner.link_url.trim(),
        title: newBanner.title.trim(),
        position: Number(newBanner.position) || 0,
        active: newBanner.active,
      })
      toast.success("Đã thêm banner")
      setNewBanner({ image_url: "", link_url: "", title: "", position: 0, active: true })
      await load()
    } catch {
      toast.error("Không thể thêm banner (kiểm tra quyền Firestore / composite index)")
    } finally {
      setSaving(false)
    }
  }

  async function handleToggleActive(b: BannerItem) {
    try {
      await updateBanner(b.id, { active: !b.active })
      toast.success(b.active ? "Đã ẩn banner" : "Đã bật hiển thị")
      await load()
    } catch {
      toast.error("Không thể cập nhật trạng thái")
    }
  }

  async function handleRemove(id: string) {
    if (!window.confirm("Xóa banner này khỏi Firestore?")) return
    try {
      await deleteBanner(id)
      toast.success("Đã xóa banner")
      await load()
    } catch {
      toast.error("Không thể xóa banner")
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-2 text-neutral-600">
        <Loader2 className="animate-spin" size={22} />
        Đang tải banner…
      </div>
    )
  }

  return (
    <div className="container-acf py-8">
      <h1 className="mb-2 text-2xl font-bold text-neutral-900">Quản lý Banner</h1>
      <p className="mb-8 text-sm text-neutral-600">
        Banner hiển thị trên trang chủ (Firestore collection <code className="rounded bg-neutral-100 px-1">banners</code>
        , trường <code className="rounded bg-neutral-100 px-1">active</code> + <code className="rounded bg-neutral-100 px-1">position</code>).
      </p>

      <section className="mb-10 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-neutral-900">
          <ImagePlus size={20} className="text-brand-red-600" />
          Thêm banner mới
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="banner-image" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-neutral-600">
              URL hình ảnh *
            </label>
            <input
              id="banner-image"
              type="url"
              value={newBanner.image_url}
              onChange={(e) => setNewBanner({ ...newBanner, image_url: e.target.value })}
              placeholder="https://…"
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-brand-red-400 focus:ring-2 focus:ring-brand-red-100"
            />
          </div>
          <div>
            <label htmlFor="banner-link" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-neutral-600">
              Link khi click
            </label>
            <input
              id="banner-link"
              type="url"
              value={newBanner.link_url}
              onChange={(e) => setNewBanner({ ...newBanner, link_url: e.target.value })}
              placeholder="https://… (tuỳ chọn)"
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-brand-red-400 focus:ring-2 focus:ring-brand-red-100"
            />
          </div>
          <div>
            <label htmlFor="banner-title" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-neutral-600">
              Tiêu đề trên ảnh
            </label>
            <input
              id="banner-title"
              type="text"
              value={newBanner.title}
              onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })}
              placeholder="Khuyến mãi…"
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-brand-red-400 focus:ring-2 focus:ring-brand-red-100"
            />
          </div>
          <div>
            <label htmlFor="banner-position" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-neutral-600">
              Vị trí (số nhỏ hiển thị trước)
            </label>
            <input
              id="banner-position"
              type="number"
              value={newBanner.position}
              onChange={(e) => setNewBanner({ ...newBanner, position: parseInt(e.target.value, 10) || 0 })}
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-brand-red-400 focus:ring-2 focus:ring-brand-red-100"
            />
          </div>
          <div className="flex items-center gap-2 md:col-span-2">
            <input
              type="checkbox"
              id="banner-active"
              checked={newBanner.active}
              onChange={(e) => setNewBanner({ ...newBanner, active: e.target.checked })}
              className="h-4 w-4 rounded border-neutral-300 text-brand-red-600 focus:ring-brand-red-500"
            />
            <label htmlFor="banner-active" className="text-sm text-neutral-700">
              Hiển thị ngay (active)
            </label>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={saving}
            onClick={handleAddBanner}
            className="rounded-lg bg-brand-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-red-700 disabled:opacity-60"
          >
            {saving ? "Đang lưu…" : "Thêm banner"}
          </button>
          <button
            type="button"
            onClick={() => setNewBanner({ image_url: "", link_url: "", title: "", position: 0, active: true })}
            className="rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
          >
            Xoá form
          </button>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-neutral-900">Danh sách ({banners.length})</h2>
        {banners.length === 0 ? (
          <p className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50 py-12 text-center text-sm text-neutral-500">
            Chưa có banner trong Firestore.
          </p>
        ) : (
          <ul className="space-y-4">
            {banners.map((b) => (
              <li
                key={b.id}
                className="flex flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 flex-1 items-start gap-4">
                  <img
                    src={b.image_url}
                    alt={b.title || "Banner"}
                    className="h-20 w-36 shrink-0 rounded-lg object-cover"
                  />
                  <div className="min-w-0">
                    <p className="font-medium text-neutral-900">{b.title || "(Không tiêu đề)"}</p>
                    <p className="mt-1 truncate text-xs text-neutral-500">{b.link_url || "—"}</p>
                    <p className="mt-1 text-xs text-neutral-500">
                      Vị trí: {b.position} · Nguồn: {b.source} ·{" "}
                      <span className={b.active ? "text-emerald-600" : "text-neutral-400"}>
                        {b.active ? "Đang bật" : "Đang tắt"}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(b)}
                    className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
                  >
                    {b.active ? "Ẩn" : "Bật"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemove(b.id)}
                    className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100"
                  >
                    <Trash2 size={14} />
                    Xóa
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
