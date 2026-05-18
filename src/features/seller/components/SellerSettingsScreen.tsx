import { useEffect, useState } from "react"
import { AlertCircle, Save, ShieldCheck, Sparkles } from "lucide-react"
import toast from "react-hot-toast"
import { useMyVendor, useUpdateMyVendor } from "../../../hooks/use-vendor"
import { Skeleton } from "../../../components/Skeleton"
import { sanitizeUserError } from "../../../lib/error-utils"

interface FormState {
  shop_name: string
  description: string
  owner_name: string
  owner_phone: string
  pickup_full_address: string
  pickup_ward: string
  pickup_district: string
  pickup_city: string
  bank_name: string
  bank_account_number: string
  bank_account_holder: string
}

const EMPTY_FORM: FormState = {
  shop_name: "",
  description: "",
  owner_name: "",
  owner_phone: "",
  pickup_full_address: "",
  pickup_ward: "",
  pickup_district: "",
  pickup_city: "",
  bank_name: "",
  bank_account_number: "",
  bank_account_holder: "",
}

export default function SellerSettingsScreen() {
  const { data, isLoading, isError, error, refetch } = useMyVendor()
  const updateMutation = useUpdateMyVendor()
  const vendor = data?.vendor ?? null

  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    if (!vendor) return
    setForm({
      shop_name: vendor.shop_name,
      description: vendor.description ?? "",
      owner_name: vendor.owner_name,
      owner_phone: vendor.owner_phone,
      pickup_full_address: vendor.pickup_address.full_address,
      pickup_ward: vendor.pickup_address.ward,
      pickup_district: vendor.pickup_address.district,
      pickup_city: vendor.pickup_address.city,
      bank_name: vendor.bank_name ?? "",
      bank_account_number: vendor.bank_account_number ?? "",
      bank_account_holder: vendor.bank_account_holder ?? "",
    })
    setDirty(false)
  }, [vendor])

  function patch<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setDirty(true)
  }

  async function handleSave() {
    if (!vendor) return
    if (!form.shop_name.trim()) return toast.error("Tên shop không được trống")
    if (!form.owner_phone.trim()) return toast.error("Hotline không được trống")

    try {
      await updateMutation.mutateAsync({
        vendorId: vendor.id,
        patch: {
          shop_name: form.shop_name.trim(),
          description: form.description.trim() || null,
          owner_name: form.owner_name.trim(),
          owner_phone: form.owner_phone.trim(),
          pickup_address: {
            full_address: form.pickup_full_address.trim(),
            ward: form.pickup_ward.trim(),
            district: form.pickup_district.trim(),
            city: form.pickup_city.trim(),
          },
          bank_name: form.bank_name.trim() || null,
          bank_account_number: form.bank_account_number.trim() || null,
          bank_account_holder: form.bank_account_holder.trim() || null,
        },
      })
      toast.success("Đã lưu cài đặt shop")
      setDirty(false)
    } catch (err) {
      toast.error(sanitizeUserError(err, "Lưu thất bại. Vui lòng thử lại sau."))
    }
  }

  if (isLoading) {
    return (
      <div className="p-4 lg:p-8">
        <Skeleton className="mb-3 h-8 w-1/3" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="p-4 lg:p-8">
        <div className="card flex items-start gap-3 border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold">Không tải được cài đặt</p>
            <p className="mt-0.5 text-xs">
              Hệ thống đang gặp trục trặc. Vui lòng thử lại sau ít phút.
            </p>
            <button onClick={() => refetch()} className="btn-secondary mt-3 text-xs">
              Thử lại
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!vendor) {
    return (
      <div className="p-4 lg:p-8">
        <div className="card flex flex-col items-center py-16 text-center">
          <AlertCircle size={48} className="text-amber-500" />
          <h2 className="mt-3 text-lg font-bold">Chưa có hồ sơ shop</h2>
          <p className="mt-1 max-w-md text-sm text-neutral-500">
            Vui lòng hoàn tất đăng ký seller trước khi cài đặt.
          </p>
        </div>
      </div>
    )
  }

  const isActive = vendor.status === "active"

  return (
    <div className="p-4 lg:p-8">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Cài đặt shop</h1>
          <p className="mt-0.5 text-sm text-neutral-500">
            Cập nhật thông tin hiển thị, địa chỉ lấy hàng và tài khoản ngân hàng.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={!dirty || updateMutation.isPending || !isActive}
          className="btn-primary"
        >
          <Save size={14} />
          {updateMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
      </div>

      {!isActive && (
        <div className="mb-5 card border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Shop đang ở trạng thái <strong>{vendor.status}</strong> — chưa thể cập nhật profile.
          Vui lòng chờ duyệt KYC.
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Section 1: Shop identity */}
        <Section
          title="Thông tin shop"
          subtitle="Hiển thị công khai cho khách hàng"
          icon={Sparkles}
        >
          <Field label="Tên shop" required>
            <input
              className="input"
              value={form.shop_name}
              onChange={(e) => patch("shop_name", e.target.value)}
            />
          </Field>
          <Field label="Mô tả">
            <textarea
              className="input resize-none"
              rows={4}
              value={form.description}
              onChange={(e) => patch("description", e.target.value)}
              placeholder="Giới thiệu shop, cam kết, chính sách..."
            />
          </Field>
        </Section>

        {/* Section 2: Contact */}
        <Section title="Người phụ trách" subtitle="Chỉ admin shop nhìn thấy">
          <Field label="Họ tên">
            <input
              className="input"
              value={form.owner_name}
              onChange={(e) => patch("owner_name", e.target.value)}
            />
          </Field>
          <Field label="Hotline" required>
            <input
              type="tel"
              className="input"
              value={form.owner_phone}
              onChange={(e) => patch("owner_phone", e.target.value)}
            />
          </Field>
        </Section>

        {/* Section 3: Pickup address */}
        <Section
          title="Địa chỉ lấy hàng"
          subtitle="Đơn vị vận chuyển sẽ lấy hàng tại đây"
        >
          <Field label="Địa chỉ chi tiết">
            <input
              className="input"
              value={form.pickup_full_address}
              onChange={(e) => patch("pickup_full_address", e.target.value)}
              placeholder="Số nhà, đường"
            />
          </Field>
          <div className="grid grid-cols-3 gap-2">
            <Field label="Phường/Xã">
              <input
                className="input"
                value={form.pickup_ward}
                onChange={(e) => patch("pickup_ward", e.target.value)}
              />
            </Field>
            <Field label="Quận/Huyện">
              <input
                className="input"
                value={form.pickup_district}
                onChange={(e) => patch("pickup_district", e.target.value)}
              />
            </Field>
            <Field label="Tỉnh/TP">
              <input
                className="input"
                value={form.pickup_city}
                onChange={(e) => patch("pickup_city", e.target.value)}
              />
            </Field>
          </div>
        </Section>

        {/* Section 4: Bank */}
        <Section
          title="Tài khoản ngân hàng"
          subtitle="Dùng để chi trả doanh thu"
          icon={ShieldCheck}
        >
          <Field label="Ngân hàng">
            <input
              className="input"
              value={form.bank_name}
              onChange={(e) => patch("bank_name", e.target.value)}
              placeholder="VD: Vietcombank"
            />
          </Field>
          <Field label="Số tài khoản">
            <input
              className="input"
              value={form.bank_account_number}
              onChange={(e) => patch("bank_account_number", e.target.value)}
            />
          </Field>
          <Field label="Chủ tài khoản">
            <input
              className="input"
              value={form.bank_account_holder}
              onChange={(e) => patch("bank_account_holder", e.target.value)}
            />
          </Field>
        </Section>

        {/* Read-only KYC */}
        <Section title="Trạng thái xác minh" subtitle="Chỉ admin ACFMart cập nhật được">
          <ReadOnlyRow label="Trạng thái" value={vendor.status} />
          <ReadOnlyRow label="Mức KYC" value={vendor.kyc_level} />
          <ReadOnlyRow
            label="Xác minh lúc"
            value={
              vendor.verified_at?.toDate?.().toLocaleDateString("vi-VN") ?? "Chưa xác minh"
            }
          />
          <ReadOnlyRow label="Loại hình" value={vendor.business_type} />
        </Section>
      </div>
    </div>
  )
}

function Section({
  title,
  subtitle,
  icon: Icon,
  children,
}: {
  title: string
  subtitle?: string
  icon?: typeof Sparkles
  children: React.ReactNode
}) {
  return (
    <div className="card space-y-3 p-5">
      <div className="flex items-start gap-2">
        {Icon && <Icon size={16} className="mt-0.5 text-brand-gold-500" />}
        <div>
          <h2 className="text-sm font-bold text-neutral-900">{title}</h2>
          {subtitle && <p className="text-xs text-neutral-500">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  )
}

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-neutral-700">
        {label}
        {required && <span className="text-brand-red-500"> *</span>}
      </span>
      {children}
    </label>
  )
}

function ReadOnlyRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-md bg-neutral-50 px-3 py-2 text-xs">
      <span className="text-neutral-500">{label}</span>
      <span className="font-semibold uppercase text-neutral-900">{value}</span>
    </div>
  )
}
