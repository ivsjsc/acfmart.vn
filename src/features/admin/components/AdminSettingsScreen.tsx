import { useEffect, useState } from "react"
import {
  Settings,
  Loader2,
  Mail,
  AlertTriangle,
  Save,
  ShieldCheck,
} from "lucide-react"
import toast from "react-hot-toast"
import { useAuthStore } from "../../../stores/auth-store"
import {
  defaultPlatformSettings,
  getPlatformSettings,
  savePlatformSettings,
  type PlatformSettings,
} from "../../../lib/system-settings-service"

export function AdminSettingsScreen() {
  const user = useAuthStore((s) => s.user)
  const isAdmin = user?.role === "admin"

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<PlatformSettings>(defaultPlatformSettings())

  useEffect(() => {
    let cancel = false
    ;(async () => {
      setLoading(true)
      try {
        const s = await getPlatformSettings()
        if (!cancel) setForm(s)
      } catch {
        if (!cancel) {
          toast.error("Không thể tải cấu hình")
          setForm(defaultPlatformSettings())
        }
      } finally {
        if (!cancel) setLoading(false)
      }
    })()
    return () => {
      cancel = true
    }
  }, [])

  async function handleSave() {
    if (!isAdmin) {
      toast.error("Chỉ Admin mới được lưu cài đặt hệ thống")
      return
    }
    setSaving(true)
    try {
      await savePlatformSettings({
        maintenance_enabled: form.maintenance_enabled,
        maintenance_message: form.maintenance_message.trim(),
        support_email: form.support_email.trim(),
        qr_help_message: (form.qr_help_message ?? "").trim(),
      })
      toast.success("Đã lưu cấu hình")
    } catch {
      toast.error("Lưu thất bại (kiểm tra Firestore rules — chỉ admin ghi được)")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-neutral-900">
          <Settings className="text-brand-red-600" size={26} />
          Cài đặt hệ thống
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Đọc/ghi Firestore{" "}
          <code className="rounded bg-neutral-100 px-1">systemSettings/platform</code>.
          Moderator xem được; chỉ Admin lưu được.
        </p>
      </div>

      {!isAdmin && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <AlertTriangle className="mt-0.5 shrink-0" size={18} />
          <div>
            Bạn đang đăng nhập với quyền <strong>Kiểm duyệt viên</strong>. Chỉ{" "}
            <strong>Admin</strong> mới có thể lưu thay đổi trên trang này.
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16 text-neutral-500">
          <Loader2 className="animate-spin" size={28} />
        </div>
      ) : (
        <div className="mx-auto max-w-2xl space-y-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <section>
            <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-neutral-500">
              <ShieldCheck size={16} /> Bảo trì
            </h2>
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={form.maintenance_enabled}
                disabled={!isAdmin}
                onChange={(e) =>
                  setForm((f) => ({ ...f, maintenance_enabled: e.target.checked }))
                }
                className="h-4 w-4 rounded border-neutral-300 text-brand-red-600 focus:ring-brand-red-500"
              />
              <span className="text-sm font-medium text-neutral-800">
                Bật chế độ bảo trì (client có thể đọc cờ này để hiển thị banner)
              </span>
            </label>
            <textarea
              className="mt-3 w-full rounded-lg border border-neutral-200 p-3 text-sm disabled:bg-neutral-50"
              rows={3}
              disabled={!isAdmin}
              placeholder="Thông báo cho người dùng khi bảo trì…"
              value={form.maintenance_message}
              onChange={(e) =>
                setForm((f) => ({ ...f, maintenance_message: e.target.value }))
              }
            />
          </section>

          <section>
            <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-neutral-500">
              <Mail size={16} /> Liên hệ hỗ trợ
            </h2>
            <input
              type="email"
              disabled={!isAdmin}
              className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm disabled:bg-neutral-50"
              value={form.support_email}
              onChange={(e) =>
                setForm((f) => ({ ...f, support_email: e.target.value }))
              }
            />
          </section>

          <section>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-neutral-500">
              QR / chống hàng giả
            </h2>
            <textarea
              className="w-full rounded-lg border border-neutral-200 p-3 text-sm disabled:bg-neutral-50"
              rows={3}
              disabled={!isAdmin}
              placeholder="Thông báo hướng dẫn khi quét QR (tuỳ app sử dụng)…"
              value={form.qr_help_message ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, qr_help_message: e.target.value }))
              }
            />
          </section>

          <button
            type="button"
            disabled={!isAdmin || saving}
            onClick={handleSave}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-red-600 py-3 text-sm font-semibold text-white hover:bg-brand-red-700 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Save size={18} />
            )}
            Lưu cấu hình
          </button>
        </div>
      )}
    </div>
  )
}
