import { useState } from "react"
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom"
import {
  Store,
  Upload,
  CheckCircle2,
  Building2,
  User,
  CreditCard,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Loader2,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
} from "lucide-react"
import toast from "react-hot-toast"
import { Logo } from "../../../components/Logo"
import { cn } from "../../../lib/cn"
import { useAuthStore } from "../../../stores/auth-store"
import { useFirebaseAuthReady } from "../../../hooks/use-firebase-auth-ready"
import type { BusinessType } from "../types"
import { useRegisterVendor, useMyVendor } from "../../../hooks/use-vendor"
import { uploadSellerDocument } from "../../../lib/upload"
import { validateCCCD, validatePhone, validateTaxCode } from "../../../lib/validators"

const STEPS = [
  { id: 1, label: "Loại hình", icon: Building2 },
  { id: 2, label: "Thông tin shop", icon: Store },
  { id: 3, label: "Người đại diện", icon: User },
  { id: 4, label: "Tài chính", icon: CreditCard },
  { id: 5, label: "Hoàn tất", icon: CheckCircle2 },
]

type FormState = {
  businessType: BusinessType
  shopName: string
  shopSlug: string
  description: string
  category: string
  ownerName: string
  ownerEmail: string
  ownerPhone: string
  taxCode: string
  idCard: string
  address: string
  ward: string
  district: string
  city: string
  bankName: string
  accountNumber: string
  accountHolder: string
  docFront: File | null
  docFrontPreview: string | null
  docBack: File | null
  docBackPreview: string | null
  businessLicense: File | null
  businessLicensePreview: string | null
  agreedTerms: boolean
  agreedPDPD: boolean
}

const BUSINESS_TYPES = [
  {
    id: "individual" as const,
    label: "Cá nhân",
    desc: "Bán theo dạng cá nhân, chưa có giấy phép kinh doanh",
    requirement: "CCCD + Số TK ngân hàng",
  },
  {
    id: "household" as const,
    label: "Hộ kinh doanh",
    desc: "Đã có giấy chứng nhận hộ kinh doanh",
    requirement: "Giấy phép HKD + CCCD chủ hộ",
  },
  {
    id: "company" as const,
    label: "Doanh nghiệp",
    desc: "Công ty TNHH / Cổ phần có giấy phép",
    requirement: "GPKD + CCCD người đại diện + MST",
  },
]

const CATEGORIES = [
  "Mỹ phẩm",
  "Thời trang",
  "Điện tử",
  "Sức khoẻ",
  "Mẹ & Bé",
  "Gia dụng",
  "Thực phẩm",
  "Sách",
]

const BANKS = [
  "Vietcombank",
  "Techcombank",
  "BIDV",
  "Agribank",
  "VietinBank",
  "MB Bank",
  "ACB",
  "VPBank",
  "Sacombank",
]

export default function SellerRegistrationScreen() {
  const navigate = useNavigate()
  const location = useLocation()
  const authReady = useFirebaseAuthReady()
  const user = useAuthStore((s) => s.user)
  const myVendor = useMyVendor()
  const registerVendor = useRegisterVendor()
  const [step, setStep] = useState(1)
  const loading = registerVendor.isPending

  const [form, setForm] = useState<FormState>({
    businessType: "individual",
    shopName: "",
    shopSlug: "",
    description: "",
    category: CATEGORIES[0],
    ownerName: "",
    ownerEmail: "",
    ownerPhone: "",
    taxCode: "",
    idCard: "",
    address: "",
    ward: "",
    district: "",
    city: "",
    bankName: BANKS[0],
    accountNumber: "",
    accountHolder: "",
    docFront: null,
    docFrontPreview: null,
    docBack: null,
    docBackPreview: null,
    businessLicense: null,
    businessLicensePreview: null,
    agreedTerms: false,
    agreedPDPD: false,
  })

  if (!authReady) {
    return <RegistrationLoading />
  }

  if (!user) {
    return (
      <Navigate
        to="/login/store"
        state={{ from: location.pathname + location.search }}
        replace
      />
    )
  }

  if (myVendor.isLoading) {
    return <RegistrationLoading label="Đang kiểm tra trạng thái nhà bán..." />
  }

  if (myVendor.data?.registered && myVendor.data.vendor) {
    return <Navigate to="/seller" replace />
  }

  if (myVendor.isError) {
    return <RegistrationLookupError onRetry={() => myVendor.refetch()} />
  }

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleFileUpload(field: "docFront" | "docBack" | "businessLicense", e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    update(field, file)
    update(`${field}Preview` as keyof FormState, URL.createObjectURL(file) as any)
  }

  function next() {
    // Validate per step
    if (step === 2 && (!form.shopName || form.shopName.length < 3)) {
      toast.error("Tên shop tối thiểu 3 ký tự")
      return
    }
    if (step === 3 && (!form.ownerName || !form.ownerPhone || !(form.ownerEmail || user?.email))) {
      toast.error("Vui lòng điền họ tên, email và số điện thoại")
      return
    }
    if (step === 3 && form.ownerPhone && !validatePhone(form.ownerPhone)) {
      toast.error("Số điện thoại không hợp lệ (VD: 0912345678)")
      return
    }
    if (step === 3 && form.idCard && !validateCCCD(form.idCard)) {
      toast.error("Số CCCD/CMND phải có 9 hoặc 12 chữ số")
      return
    }
    if (step === 3 && form.taxCode && !validateTaxCode(form.taxCode)) {
      toast.error("Mã số thuế phải có 10 hoặc 13 chữ số")
      return
    }
    if (step === 3 && !form.docFront) {
      toast.error("Vui lòng tải lên CCCD mặt trước")
      return
    }
    if (step === 4 && (!form.accountNumber || !form.accountHolder)) {
      toast.error("Vui lòng nhập thông tin tài khoản ngân hàng")
      return
    }
    setStep(Math.min(5, step + 1))
  }

  function back() {
    setStep(Math.max(1, step - 1))
  }

  async function submit() {
    if (!form.agreedTerms) {
      toast.error("Vui lòng đồng ý Điều khoản trước khi gửi")
      return
    }
    if (!form.agreedPDPD) {
      toast.error("Vui lòng đồng ý Chính sách bảo vệ dữ liệu cá nhân")
      return
    }
    if (!user) {
      toast.error("Vui lòng đăng nhập trước khi đăng ký shop")
      navigate("/login/store", { state: { from: "/seller-register" } })
      return
    }

    try {
      const documents: Array<{ type: string; file_url: string; file_name?: string; mime_type?: string }> = []

      if (form.docFront) {
        const url = await uploadSellerDocument(form.docFront, user.id)
        documents.push({ type: "id_card_front", file_url: url, file_name: form.docFront.name, mime_type: form.docFront.type })
      }
      if (form.docBack) {
        const url = await uploadSellerDocument(form.docBack, user.id)
        documents.push({ type: "id_card_back", file_url: url, file_name: form.docBack.name, mime_type: form.docBack.type })
      }
      if (form.businessLicense) {
        const url = await uploadSellerDocument(form.businessLicense, user.id)
        documents.push({ type: "business_license", file_url: url, file_name: form.businessLicense.name, mime_type: form.businessLicense.type })
      }

      await registerVendor.mutateAsync({
        shop_name: form.shopName,
        shop_slug: form.shopSlug,
        description: form.description || undefined,
        owner_name: form.ownerName,
        owner_email: form.ownerEmail || user.email,
        owner_phone: form.ownerPhone,
        business_type: form.businessType,
        tax_code: form.taxCode || undefined,
        id_card_number: form.idCard || undefined,
        pickup_address: {
          full_address: form.address,
          ward: form.ward,
          district: form.district,
          city: form.city,
        },
        bank_name: form.bankName || undefined,
        bank_account_number: form.accountNumber || undefined,
        bank_account_holder: form.accountHolder || undefined,
        documents: documents.length ? documents : undefined,
      })
      toast.success(
        "Đã gửi đăng ký! ACFMart sẽ duyệt trong 24-48h và gửi email kết quả."
      )
      navigate("/seller", { replace: true })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gửi yêu cầu thất bại")
    }
  }

  // Auto-generate slug from shop name
  function onShopNameChange(name: string) {
    update("shopName", name)
    if (!form.shopSlug || form.shopSlug === slugify(form.shopName)) {
      update("shopSlug", slugify(name))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-red-50 via-white to-brand-gold-50 py-6 lg:py-10">
      <div className="container-acf">
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <div className="mb-6 text-center">
            <Link to="/" className="inline-flex">
              <Logo size="md" />
            </Link>
            <h1 className="mt-3 text-2xl font-extrabold text-neutral-900 md:text-3xl">
              Đăng ký trở thành Người bán
            </h1>
            <p className="mt-1 text-sm text-neutral-600">
              Kết nối khách hàng tin dùng sản phẩm chính hãng, được bảo trợ bởi Quỹ Chống Hàng Giả VN
            </p>
          </div>

          {/* Stepper */}
          <div className="mb-6 overflow-x-auto">
            <div className="flex min-w-max items-center justify-between gap-2">
              {STEPS.map((s, i) => {
                const completed = step > s.id
                const active = step === s.id
                return (
                  <div key={s.id} className="flex items-center gap-2">
                    <div
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-colors",
                        completed
                          ? "bg-emerald-500 text-white"
                          : active
                          ? "bg-brand-red-500 text-white ring-4 ring-brand-red-100"
                          : "bg-neutral-200 text-neutral-500"
                      )}
                    >
                      {completed ? <CheckCircle2 size={16} /> : <s.icon size={16} />}
                    </div>
                    <span
                      className={cn(
                        "hidden text-xs font-semibold sm:inline",
                        active ? "text-brand-red-600" : "text-neutral-600"
                      )}
                    >
                      {s.label}
                    </span>
                    {i < STEPS.length - 1 && (
                      <div
                        className={cn(
                          "h-0.5 w-6 sm:w-12",
                          completed ? "bg-emerald-500" : "bg-neutral-200"
                        )}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Form card */}
          <div className="card overflow-hidden p-6 md:p-8">
            {step === 1 && (
              <Step1
                form={form}
                onSelect={(type) => update("businessType", type)}
              />
            )}
            {step === 2 && (
              <Step2
                form={form}
                onShopNameChange={onShopNameChange}
                update={update}
              />
            )}
            {step === 3 && (
              <Step3 form={form} update={update} onFile={handleFileUpload} />
            )}
            {step === 4 && <Step4 form={form} update={update} />}
            {step === 5 && (
              <Step5
                form={form}
                agreedTerms={form.agreedTerms}
                agreedPDPD={form.agreedPDPD}
                onAgree={(v) => update("agreedTerms", v)}
                onAgreePDPD={(v) => update("agreedPDPD", v)}
              />
            )}

            {/* Nav buttons */}
            <div className="mt-8 flex items-center justify-between border-t border-neutral-100 pt-6">
              {step > 1 ? (
                <button onClick={back} className="btn-secondary">
                  <ArrowLeft size={14} /> Quay lại
                </button>
              ) : (
                <Link to="/" className="text-sm text-neutral-500 hover:text-neutral-700">
                  Để sau
                </Link>
              )}

              {step < 5 ? (
                <button onClick={next} className="btn-primary">
                  Tiếp theo <ArrowRight size={14} />
                </button>
              ) : (
                <button
                  onClick={submit}
                  disabled={loading || !form.agreedTerms || !form.agreedPDPD}
                  className="btn-primary"
                >
                  {loading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Đang gửi...
                    </>
                  ) : (
                    <>
                      Gửi đăng ký <Sparkles size={14} />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-neutral-500">
            <ShieldCheck size={12} className="text-brand-gold-500" />
            <span>Hồ sơ được mã hoá và bảo mật. Xét duyệt trong 24-48h.</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function RegistrationLoading({ label = "Đang kiểm tra phiên đăng nhập..." }: { label?: string }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-red-50 via-white to-brand-gold-50 px-4 py-10">
      <div className="mx-auto flex min-h-[60vh] max-w-sm flex-col items-center justify-center text-center">
        <Logo size="md" />
        <div className="mt-6 flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-600 shadow-sm">
          <Loader2 size={16} className="animate-spin text-brand-red-500" />
          {label}
        </div>
      </div>
    </div>
  )
}

function RegistrationLookupError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-red-50 via-white to-brand-gold-50 px-4 py-10">
      <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col justify-center">
        <div className="mb-5 flex justify-center">
          <Logo size="md" />
        </div>
        <div className="card p-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-600">
            <AlertTriangle size={28} />
          </div>
          <h1 className="mt-4 text-xl font-bold text-neutral-900">
            Chưa thể tải trạng thái nhà bán
          </h1>
          <p className="mt-2 text-sm leading-6 text-neutral-600">
            Hệ thống chưa đọc được hồ sơ seller của tài khoản này. Vui lòng thử lại
            trước khi tạo hồ sơ mới để tránh đăng ký trùng.
          </p>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <button type="button" onClick={onRetry} className="btn-primary justify-center">
              <RefreshCw size={14} />
              Thử lại
            </button>
            <Link to="/seller" className="btn-secondary justify-center">
              Mở Seller Center
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function Step1({ form, onSelect }: { form: FormState; onSelect: (t: BusinessType) => void }) {
  return (
    <div>
      <h2 className="text-xl font-bold text-neutral-900">Bạn đăng ký với tư cách nào?</h2>
      <p className="mt-1 text-sm text-neutral-600">
        Chọn loại hình phù hợp để hệ thống yêu cầu giấy tờ tương ứng.
      </p>
      <div className="mt-5 space-y-3">
        {BUSINESS_TYPES.map((t) => (
          <label
            key={t.id}
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors",
              form.businessType === t.id
                ? "border-brand-red-500 bg-brand-red-50"
                : "border-neutral-200 hover:border-brand-red-300"
            )}
          >
            <input
              type="radio"
              name="businessType"
              checked={form.businessType === t.id}
              onChange={() => onSelect(t.id)}
              className="mt-1 h-4 w-4 text-brand-red-500"
            />
            <div className="flex-1">
              <div className="text-base font-bold text-neutral-900">{t.label}</div>
              <div className="text-sm text-neutral-600">{t.desc}</div>
              <div className="mt-1.5 inline-flex items-center gap-1 rounded-md bg-brand-gold-100 px-2 py-0.5 text-[10px] font-semibold text-brand-gold-800">
                <ShieldCheck size={10} /> Cần: {t.requirement}
              </div>
            </div>
          </label>
        ))}
      </div>
    </div>
  )
}

function Step2({
  form,
  onShopNameChange,
  update,
}: {
  form: FormState
  onShopNameChange: (s: string) => void
  update: <K extends keyof FormState>(key: K, value: FormState[K]) => void
}) {
  return (
    <div>
      <h2 className="text-xl font-bold text-neutral-900">Thông tin shop</h2>
      <p className="mt-1 text-sm text-neutral-600">Giới thiệu shop để khách hàng tìm thấy bạn.</p>
      <div className="mt-5 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            Tên shop <span className="text-rose-600">*</span>
          </label>
          <input
            type="text"
            value={form.shopName}
            onChange={(e) => onShopNameChange(e.target.value)}
            placeholder="VD: Natural Beauty Shop"
            className="input"
            maxLength={60}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            Slug URL
          </label>
          <div className="flex items-center rounded-lg border border-neutral-200 bg-neutral-50">
            <span className="px-3 text-sm text-neutral-500">acfmart.vn/shops/</span>
            <input
              type="text"
              value={form.shopSlug}
              onChange={(e) => update("shopSlug", e.target.value)}
              placeholder="natural-beauty"
              className="flex-1 border-0 bg-transparent py-2 pr-3 text-sm focus:outline-none focus:ring-0"
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            Danh mục chính
          </label>
          <select
            value={form.category}
            onChange={(e) => update("category", e.target.value)}
            className="input"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            Mô tả shop
          </label>
          <textarea
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            placeholder="Giới thiệu ngắn gọn về shop và sản phẩm chính..."
            rows={3}
            className="input resize-none"
            maxLength={500}
          />
          <div className="mt-1 text-right text-[10px] text-neutral-400">{form.description.length}/500</div>
        </div>
      </div>
    </div>
  )
}

function Step3({
  form,
  update,
  onFile,
}: {
  form: FormState
  update: <K extends keyof FormState>(key: K, value: FormState[K]) => void
  onFile: (f: "docFront" | "docBack" | "businessLicense", e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  return (
    <div>
      <h2 className="text-xl font-bold text-neutral-900">Người đại diện</h2>
      <p className="mt-1 text-sm text-neutral-600">Thông tin người chịu trách nhiệm pháp lý cho shop.</p>
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            Họ và tên <span className="text-rose-600">*</span>
          </label>
          <input
            type="text"
            value={form.ownerName}
            onChange={(e) => update("ownerName", e.target.value)}
            className="input"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            Email
          </label>
          <input
            type="email"
            value={form.ownerEmail}
            onChange={(e) => update("ownerEmail", e.target.value)}
            className="input"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            Số điện thoại <span className="text-rose-600">*</span>
          </label>
          <input
            type="tel"
            value={form.ownerPhone}
            onChange={(e) => update("ownerPhone", e.target.value)}
            className="input"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            Số CCCD/CMND <span className="text-rose-600">*</span>
          </label>
          <input
            type="text"
            value={form.idCard}
            onChange={(e) => update("idCard", e.target.value)}
            className="input"
          />
        </div>
        {form.businessType !== "individual" && (
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Mã số thuế
            </label>
            <input
              type="text"
              value={form.taxCode}
              onChange={(e) => update("taxCode", e.target.value)}
              className="input"
            />
          </div>
        )}
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            Địa chỉ lấy hàng <span className="text-rose-600">*</span>
          </label>
          <input
            type="text"
            value={form.address}
            onChange={(e) => update("address", e.target.value)}
            placeholder="Số nhà, đường"
            className="input"
          />
        </div>
        <input
          type="text"
          value={form.ward}
          onChange={(e) => update("ward", e.target.value)}
          placeholder="Phường/Xã"
          className="input"
        />
        <input
          type="text"
          value={form.district}
          onChange={(e) => update("district", e.target.value)}
          placeholder="Quận/Huyện"
          className="input"
        />
        <input
          type="text"
          value={form.city}
          onChange={(e) => update("city", e.target.value)}
          placeholder="Tỉnh/Thành"
          className="input sm:col-span-2"
        />
      </div>

      {/* Document upload */}
      <div className="mt-6">
        <h3 className="text-sm font-bold text-neutral-900">
          Giấy tờ chứng thực <span className="text-rose-600">*</span>
        </h3>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <UploadCard
            label="CCCD mặt trước"
            url={form.docFrontPreview}
            onChange={(e) => onFile("docFront", e)}
            onRemove={() => { update("docFront", null); update("docFrontPreview", null) }}
          />
          <UploadCard
            label="CCCD mặt sau"
            url={form.docBackPreview}
            onChange={(e) => onFile("docBack", e)}
            onRemove={() => { update("docBack", null); update("docBackPreview", null) }}
          />
          {form.businessType !== "individual" && (
            <UploadCard
              label="Giấy phép kinh doanh"
              url={form.businessLicensePreview}
              onChange={(e) => onFile("businessLicense", e)}
              onRemove={() => { update("businessLicense", null); update("businessLicensePreview", null) }}
              span="full"
            />
          )}
        </div>
      </div>
    </div>
  )
}

function Step4({
  form,
  update,
}: {
  form: FormState
  update: <K extends keyof FormState>(key: K, value: FormState[K]) => void
}) {
  return (
    <div>
      <h2 className="text-xl font-bold text-neutral-900">Tài khoản nhận tiền</h2>
      <p className="mt-1 text-sm text-neutral-600">
        Doanh thu sẽ được chuyển về tài khoản này sau mỗi chu kỳ thanh toán.
      </p>

      <div className="mt-5 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            Ngân hàng <span className="text-rose-600">*</span>
          </label>
          <select
            value={form.bankName}
            onChange={(e) => update("bankName", e.target.value)}
            className="input"
          >
            {BANKS.map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            Số tài khoản <span className="text-rose-600">*</span>
          </label>
          <input
            type="text"
            value={form.accountNumber}
            onChange={(e) => update("accountNumber", e.target.value.replace(/\s/g, ""))}
            className="input"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            Tên chủ tài khoản <span className="text-rose-600">*</span>
          </label>
          <input
            type="text"
            value={form.accountHolder}
            onChange={(e) => update("accountHolder", e.target.value.toUpperCase())}
            placeholder="VD: NGUYEN THI MAI"
            className="input uppercase"
          />
          <p className="mt-1 text-[11px] text-neutral-500">
            Tên chủ tài khoản phải trùng với người đại diện đã khai báo ở bước trước.
          </p>
        </div>
      </div>
    </div>
  )
}

function Step5({
  form,
  agreedTerms,
  agreedPDPD,
  onAgree,
  onAgreePDPD,
}: {
  form: FormState
  agreedTerms: boolean
  agreedPDPD: boolean
  onAgree: (v: boolean) => void
  onAgreePDPD: (v: boolean) => void
}) {
  const businessTypeLabel = BUSINESS_TYPES.find((b) => b.id === form.businessType)?.label

  return (
    <div>
      <h2 className="text-xl font-bold text-neutral-900">Xác nhận thông tin</h2>
      <p className="mt-1 text-sm text-neutral-600">
        Vui lòng kiểm tra lại trước khi gửi yêu cầu xét duyệt.
      </p>

      <div className="mt-5 space-y-3">
        <SummaryRow label="Loại hình" value={businessTypeLabel ?? ""} />
        <SummaryRow label="Tên shop" value={form.shopName} />
        <SummaryRow label="URL" value={`san-chinh-hang.vn/shops/${form.shopSlug}`} />
        <SummaryRow label="Danh mục" value={form.category} />
        <SummaryRow label="Người đại diện" value={form.ownerName} />
        <SummaryRow label="Số điện thoại" value={form.ownerPhone} />
        <SummaryRow label="CCCD" value={form.idCard} />
        <SummaryRow
          label="Địa chỉ lấy hàng"
          value={[form.address, form.ward, form.district, form.city].filter(Boolean).join(", ")}
        />
        <SummaryRow label="Ngân hàng" value={form.bankName} />
        <SummaryRow label="Số TK" value={form.accountNumber} />
      </div>

      <label className="mt-6 flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          checked={agreedTerms}
          onChange={(e) => onAgree(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded text-brand-red-500"
        />
        <span className="text-neutral-700">
          Tôi cam kết các thông tin khai báo là chính xác, đồng ý với{" "}
          <Link to="/legal/seller-terms" className="text-brand-red-600 underline">
            Điều khoản người bán
          </Link>{" "}
          và{" "}
          <Link to="/legal/seller-fees" className="text-brand-red-600 underline">
            Chính sách phí
          </Link>{" "}
          của nền tảng.
        </span>
      </label>

      <label className="mt-3 flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          checked={agreedPDPD}
          onChange={(e) => onAgreePDPD(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded text-brand-red-500"
        />
        <span className="text-neutral-700">
          Tôi đồng ý cho ACFMart thu thập, xử lý dữ liệu cá nhân (CCCD, địa chỉ, tài khoản ngân hàng)
          phục vụ mục đích xác minh danh tính và vận hành gian hàng, theo{" "}
          <Link to="/legal/privacy" className="text-brand-red-600 underline">
            Chính sách Bảo vệ Dữ liệu Cá nhân
          </Link>{" "}
          (Nghị định 13/2023/NĐ-CP).
        </span>
      </label>
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-neutral-100 py-2 text-sm last:border-0">
      <span className="text-neutral-500">{label}</span>
      <span className="text-right font-medium text-neutral-900">{value || "—"}</span>
    </div>
  )
}

function UploadCard({
  label,
  url,
  onChange,
  onRemove,
  span,
}: {
  label: string
  url: string | null
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onRemove: () => void
  span?: "full"
}) {
  return (
    <div className={cn(span === "full" && "sm:col-span-2")}>
      <div className="mb-1 text-xs font-medium text-neutral-700">{label}</div>
      {url ? (
        <div className="relative overflow-hidden rounded-lg border border-neutral-200">
          <img src={url} alt={label} className="h-32 w-full object-cover" />
          <button
            onClick={onRemove}
            className="absolute right-2 top-2 rounded-md bg-black/60 px-2 py-1 text-[10px] font-semibold text-white"
          >
            Đổi ảnh
          </button>
        </div>
      ) : (
        <label className="flex h-32 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-neutral-300 bg-neutral-50 text-xs text-neutral-500 transition-colors hover:border-brand-red-400 hover:bg-brand-red-50">
          <Upload size={20} />
          <span>Tải lên</span>
          <input type="file" accept="image/*,application/pdf" className="hidden" onChange={onChange} />
        </label>
      )}
    </div>
  )
}
