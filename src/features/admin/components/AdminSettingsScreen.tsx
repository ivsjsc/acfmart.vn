import { useEffect, useMemo, useState } from "react"
import type { ReactNode } from "react"
import {
  AlertTriangle,
  CreditCard,
  Loader2,
  Save,
  Settings,
  ShieldCheck,
  Store,
  Truck,
} from "lucide-react"
import toast from "react-hot-toast"
import { cn } from "../../../lib/cn"
import { sanitizeUserError } from "../../../lib/error-utils"
import { useAuthStore } from "../../../stores/auth-store"
import {
  DEFAULT_SYSTEM_SETTINGS,
  saveSystemSettings,
  subscribeSystemSettings,
  type SystemSettingsDoc,
} from "../../../lib/system-settings-service"

const PAYMENT_METHODS = [
  { id: "cod", label: "COD" },
  { id: "vnpay", label: "VNPay" },
  { id: "momo", label: "MoMo" },
  { id: "zalopay", label: "ZaloPay" },
  { id: "wallet", label: "Ví ACF" },
]

const SHIPPING_PROVIDERS = [
  { id: "ghn", label: "GHN" },
  { id: "ghtk", label: "GHTK" },
  { id: "jnt", label: "J&T" },
  { id: "viettel-post", label: "Viettel Post" },
]

export function AdminSettingsScreen() {
  const currentUser = useAuthStore((s) => s.user)
  const [settings, setSettings] = useState<SystemSettingsDoc>(DEFAULT_SYSTEM_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canEdit = currentUser?.role === "owner" || currentUser?.role === "admin"

  useEffect(() => {
    setLoading(true)
    const unsub = subscribeSystemSettings(
      (data) => {
        setSettings(data)
        setLoading(false)
      },
      (err) => {
        setError(sanitizeUserError(err, "Không tải được cài đặt hệ thống."))
        setLoading(false)
      }
    )
    return () => unsub()
  }, [])

  const dirtySummary = useMemo(() => {
    const enabledPayments = settings.enabledPaymentMethods.join(", ")
    const enabledShipping = settings.enabledShippingProviders.join(", ")
    return `${enabledPayments || "không có thanh toán"} · ${enabledShipping || "không có vận chuyển"}`
  }, [settings.enabledPaymentMethods, settings.enabledShippingProviders])

  function patchSettings(patch: Partial<SystemSettingsDoc>) {
    setSettings((prev) => ({ ...prev, ...patch }))
  }

  function toggleList(field: "enabledPaymentMethods" | "enabledShippingProviders", id: string) {
    setSettings((prev) => {
      const set = new Set(prev[field])
      if (set.has(id)) set.delete(id)
      else set.add(id)
      return { ...prev, [field]: Array.from(set) }
    })
  }

  async function handleSave() {
    if (!currentUser || !canEdit) {
      toast.error("Chỉ Owner/Admin mới có thể lưu cài đặt")
      return
    }
    setSaving(true)
    try {
      await saveSystemSettings(settings, {
        id: currentUser.id,
        email: currentUser.email,
        role: currentUser.role,
      })
      toast.success("Đã lưu cài đặt hệ thống")
    } catch (err) {
      toast.error(sanitizeUserError(err, "Lưu cài đặt thất bại. Vui lòng thử lại sau."))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="animate-spin text-brand-red-500" size={30} />
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-neutral-900 p-2 text-white">
            <Settings size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Cài đặt hệ thống</h1>
            <p className="mt-1 text-sm text-neutral-500">
              Điều khiển vận hành sàn, duyệt seller/sản phẩm, thanh toán và vận chuyển
            </p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || !canEdit}
          className="btn-primary disabled:opacity-50"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          Lưu cài đặt
        </button>
      </div>

      {!canEdit && (
        <div className="mt-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          <span>Moderator chỉ được xem cài đặt. Quyền chỉnh sửa thuộc Owner/Admin.</span>
        </div>
      )}

      {error && (
        <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          Không thể tải cài đặt: {error}
        </div>
      )}

      <div className="mt-6 grid gap-5 xl:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <SettingsPanel icon={Store} title="Thông tin sàn">
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="Tên nền tảng">
                <input
                  value={settings.platformName}
                  onChange={(e) => patchSettings({ platformName: e.target.value })}
                  disabled={!canEdit}
                  className="input"
                />
              </Field>
              <Field label="Hotline">
                <input
                  value={settings.hotline}
                  onChange={(e) => patchSettings({ hotline: e.target.value })}
                  disabled={!canEdit}
                  className="input"
                />
              </Field>
              <Field label="Email hỗ trợ">
                <input
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) => patchSettings({ supportEmail: e.target.value })}
                  disabled={!canEdit}
                  className="input md:col-span-2"
                />
              </Field>
            </div>
            <Toggle
              label="Bật chế độ bảo trì"
              description="Ẩn các thao tác mua hàng nhạy cảm khi hệ thống cần bảo trì."
              checked={settings.maintenanceMode}
              disabled={!canEdit}
              onChange={(checked) => patchSettings({ maintenanceMode: checked })}
            />
          </SettingsPanel>

          <SettingsPanel icon={ShieldCheck} title="Duyệt seller và sản phẩm">
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="SLA duyệt seller (giờ)">
                <input
                  type="number"
                  value={settings.sellerReviewSlaHours}
                  onChange={(e) =>
                    patchSettings({ sellerReviewSlaHours: Number(e.target.value) })
                  }
                  disabled={!canEdit}
                  className="input"
                  min={1}
                />
              </Field>
              <Field label="SLA duyệt sản phẩm (giờ)">
                <input
                  type="number"
                  value={settings.productReviewSlaHours}
                  onChange={(e) =>
                    patchSettings({ productReviewSlaHours: Number(e.target.value) })
                  }
                  disabled={!canEdit}
                  className="input"
                  min={1}
                />
              </Field>
              <Field label="Ảnh tối đa / sản phẩm">
                <input
                  type="number"
                  value={settings.maxImagesPerProduct}
                  onChange={(e) =>
                    patchSettings({ maxImagesPerProduct: Number(e.target.value) })
                  }
                  disabled={!canEdit}
                  className="input"
                  min={1}
                  max={20}
                />
              </Field>
            </div>
            <Toggle
              label="Tự động duyệt seller"
              description="Không khuyến nghị cho sàn chống hàng giả; chỉ bật khi có bước KYC bên ngoài."
              checked={settings.sellerAutoApprove}
              disabled={!canEdit}
              onChange={(checked) => patchSettings({ sellerAutoApprove: checked })}
            />
            <Toggle
              label="Bắt buộc xác thực ACF trước khi public"
              description="Nếu bật, sản phẩm cần qua xác minh chống hàng giả trước khi hiển thị rộng rãi."
              checked={settings.requireAcfVerificationForPublishing}
              disabled={!canEdit}
              onChange={(checked) =>
                patchSettings({ requireAcfVerificationForPublishing: checked })
              }
            />
          </SettingsPanel>

          <SettingsPanel icon={CreditCard} title="Thanh toán">
            <OptionGrid
              options={PAYMENT_METHODS}
              selected={settings.enabledPaymentMethods}
              disabled={!canEdit}
              onToggle={(id) => toggleList("enabledPaymentMethods", id)}
            />
          </SettingsPanel>

          <SettingsPanel icon={Truck} title="Vận chuyển">
            <OptionGrid
              options={SHIPPING_PROVIDERS}
              selected={settings.enabledShippingProviders}
              disabled={!canEdit}
              onToggle={(id) => toggleList("enabledShippingProviders", id)}
            />
          </SettingsPanel>
        </div>

        <aside className="space-y-4">
          <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <h2 className="text-base font-bold text-neutral-900">Tóm tắt vận hành</h2>
            <p className="mt-2 text-sm text-neutral-600">{dirtySummary}</p>
            <div className="mt-4 space-y-2 text-xs text-neutral-500">
              <SummaryRow label="Duyệt seller" value={`${settings.sellerReviewSlaHours}h`} />
              <SummaryRow label="Duyệt sản phẩm" value={`${settings.productReviewSlaHours}h`} />
              <SummaryRow
                label="Bảo trì"
                value={settings.maintenanceMode ? "Đang bật" : "Đang tắt"}
              />
              <SummaryRow
                label="ACF bắt buộc"
                value={settings.requireAcfVerificationForPublishing ? "Có" : "Không"}
              />
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

function SettingsPanel({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Settings
  title: string
  children: ReactNode
}) {
  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-5">
      <div className="mb-4 flex items-center gap-2">
        <div className="rounded-lg bg-brand-red-50 p-2 text-brand-red-600">
          <Icon size={18} />
        </div>
        <h2 className="text-base font-bold text-neutral-900">{title}</h2>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-neutral-700">{label}</span>
      {children}
    </label>
  )
}

function Toggle({
  label,
  description,
  checked,
  disabled,
  onChange,
}: {
  label: string
  description: string
  checked: boolean
  disabled: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <label
      className={cn(
        "flex items-start justify-between gap-4 rounded-lg border border-neutral-200 p-3",
        disabled ? "opacity-70" : "cursor-pointer hover:bg-neutral-50"
      )}
    >
      <span>
        <span className="block text-sm font-semibold text-neutral-900">{label}</span>
        <span className="mt-0.5 block text-xs text-neutral-500">{description}</span>
      </span>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-4 w-4 accent-brand-red-600"
      />
    </label>
  )
}

function OptionGrid({
  options,
  selected,
  disabled,
  onToggle,
}: {
  options: Array<{ id: string; label: string }>
  selected: string[]
  disabled: boolean
  onToggle: (id: string) => void
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {options.map((option) => {
        const active = selected.includes(option.id)
        return (
          <button
            key={option.id}
            type="button"
            disabled={disabled}
            onClick={() => onToggle(option.id)}
            className={cn(
              "rounded-lg border px-3 py-2 text-left text-sm font-medium transition-colors disabled:opacity-60",
              active
                ? "border-brand-red-300 bg-brand-red-50 text-brand-red-700"
                : "border-neutral-200 text-neutral-700 hover:bg-neutral-50"
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span>{label}</span>
      <span className="font-semibold text-neutral-800">{value}</span>
    </div>
  )
}
