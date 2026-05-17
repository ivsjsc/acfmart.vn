import { useEffect, useState } from "react"
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
  Download,
  FileText,
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
import { SELLER_DOCUMENT_TEMPLATES } from "../../../lib/vendor-documents"
import {
  downloadSellerContractDocument,
  downloadSellerRegistrationDocument,
  type SellerDocumentData,
} from "../../../lib/seller-document-generator"

const STEPS = [
  { id: 1, label: "Loại hình", icon: Building2 },
  { id: 2, label: "Thông tin shop", icon: Store },
  { id: 3, label: "Người đại diện", icon: User },
  { id: 4, label: "Tài chính", icon: CreditCard },
  { id: 5, label: "Hoàn tất", icon: CheckCircle2 },
]

type FormState = {
  businessType: BusinessType
  legalName: string
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
  registrationForm: File | null
  registrationFormPreview: string | null
  sellerContract: File | null
  sellerContractPreview: string | null
  businessLicense: File | null
  businessLicensePreview: string | null
  specialGoodsLicense: File | null
  specialGoodsLicensePreview: string | null
  sellsRegulatedGoods: boolean
  regulatedGoodsTypes: string[]
  regulatedGoodsNote: string
  agreedTerms: boolean
  agreedPDPD: boolean
}

const BUSINESS_TYPES = [
  {
    id: "individual" as const,
    label: "Cá nhân",
    desc: "Bán theo dạng cá nhân, chưa có giấy phép kinh doanh",
    requirement: "Đơn đăng ký + Hợp đồng + CCCD + tài khoản ngân hàng",
  },
  {
    id: "household" as const,
    label: "Hộ kinh doanh",
    desc: "Đã có giấy chứng nhận hộ kinh doanh",
    requirement: "Đơn đăng ký + Hợp đồng + GCN hộ kinh doanh + CCCD chủ hộ",
  },
  {
    id: "company" as const,
    label: "Doanh nghiệp",
    desc: "Công ty TNHH / Cổ phần có giấy phép",
    requirement: "Đơn đăng ký + Hợp đồng + GP ĐKKD + CCCD đại diện + MST",
  },
]

const REGULATED_GOODS_TYPES = [
  { id: "imported", label: "Hàng nhập khẩu" },
  { id: "alcohol", label: "Đồ uống có cồn" },
  { id: "food", label: "Thực phẩm / đồ uống" },
  { id: "health", label: "Sức khoẻ / thực phẩm chức năng" },
  { id: "cosmetics", label: "Mỹ phẩm" },
  { id: "conformity", label: "Hàng cần hợp quy / kiểm định" },
]

type DocumentFileField =
  | "docFront"
  | "docBack"
  | "registrationForm"
  | "sellerContract"
  | "businessLicense"
  | "specialGoodsLicense"

const DOCUMENT_PREVIEW_FIELD: Record<DocumentFileField, keyof FormState> = {
  docFront: "docFrontPreview",
  docBack: "docBackPreview",
  registrationForm: "registrationFormPreview",
  sellerContract: "sellerContractPreview",
  businessLicense: "businessLicensePreview",
  specialGoodsLicense: "specialGoodsLicensePreview",
}

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

const SELLER_REGISTRATION_DRAFT_KEY = "acfmart:seller-registration:draft:v1"
const SELLER_REGISTRATION_DRAFT_STEP_KEY = "acfmart:seller-registration:step:v1"

const DEFAULT_FORM: FormState = {
  businessType: "individual",
  legalName: "",
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
  registrationForm: null,
  registrationFormPreview: null,
  sellerContract: null,
  sellerContractPreview: null,
  businessLicense: null,
  businessLicensePreview: null,
  specialGoodsLicense: null,
  specialGoodsLicensePreview: null,
  sellsRegulatedGoods: false,
  regulatedGoodsTypes: [],
  regulatedGoodsNote: "",
  agreedTerms: false,
  agreedPDPD: false,
}

type PersistedFormState = Omit<
  FormState,
  | "docFront"
  | "docFrontPreview"
  | "docBack"
  | "docBackPreview"
  | "registrationForm"
  | "registrationFormPreview"
  | "sellerContract"
  | "sellerContractPreview"
  | "businessLicense"
  | "businessLicensePreview"
  | "specialGoodsLicense"
  | "specialGoodsLicensePreview"
>

function readRegistrationDraft(): Partial<PersistedFormState> {
  try {
    const raw = localStorage.getItem(SELLER_REGISTRATION_DRAFT_KEY)
    if (!raw) return {}
    const data = JSON.parse(raw) as Partial<PersistedFormState>
    return data && typeof data === "object" ? data : {}
  } catch {
    return {}
  }
}

function readRegistrationStep() {
  try {
    const step = Number(localStorage.getItem(SELLER_REGISTRATION_DRAFT_STEP_KEY))
    return Number.isInteger(step) && step >= 1 && step <= STEPS.length ? step : 1
  } catch {
    return 1
  }
}

function toPersistedForm(form: FormState): PersistedFormState {
  return {
    businessType: form.businessType,
    legalName: form.legalName,
    shopName: form.shopName,
    shopSlug: form.shopSlug,
    description: form.description,
    category: form.category,
    ownerName: form.ownerName,
    ownerEmail: form.ownerEmail,
    ownerPhone: form.ownerPhone,
    taxCode: form.taxCode,
    idCard: form.idCard,
    address: form.address,
    ward: form.ward,
    district: form.district,
    city: form.city,
    bankName: form.bankName,
    accountNumber: form.accountNumber,
    accountHolder: form.accountHolder,
    sellsRegulatedGoods: form.sellsRegulatedGoods,
    regulatedGoodsTypes: form.regulatedGoodsTypes,
    regulatedGoodsNote: form.regulatedGoodsNote,
    agreedTerms: form.agreedTerms,
    agreedPDPD: form.agreedPDPD,
  }
}

function persistRegistrationDraft(form: FormState, step: number) {
  try {
    localStorage.setItem(SELLER_REGISTRATION_DRAFT_KEY, JSON.stringify(toPersistedForm(form)))
    localStorage.setItem(SELLER_REGISTRATION_DRAFT_STEP_KEY, String(step))
  } catch {
    // localStorage can be blocked in private browsing; the form still works in memory.
  }
}

function clearRegistrationDraft() {
  try {
    localStorage.removeItem(SELLER_REGISTRATION_DRAFT_KEY)
    localStorage.removeItem(SELLER_REGISTRATION_DRAFT_STEP_KEY)
  } catch {
    // Ignore storage cleanup errors.
  }
}

export default function SellerRegistrationScreen() {
  const navigate = useNavigate()
  const location = useLocation()
  const authReady = useFirebaseAuthReady()
  const user = useAuthStore((s) => s.user)
  const myVendor = useMyVendor()
  const registerVendor = useRegisterVendor()
  const [step, setStep] = useState(readRegistrationStep)
  const [generatingDoc, setGeneratingDoc] = useState<"registration" | "contract" | null>(null)
  const loading = registerVendor.isPending

  const [form, setForm] = useState<FormState>(() => ({
    ...DEFAULT_FORM,
    ...readRegistrationDraft(),
  }))

  useEffect(() => {
    persistRegistrationDraft(form, step)
  }, [form, step])

  useEffect(() => {
    if (!user) return
    setForm((prev) => {
      const ownerEmail = prev.ownerEmail || user.email
      const ownerName = prev.ownerName || user.name || ""
      const legalName = prev.legalName || (prev.businessType === "individual" ? ownerName : "")
      if (
        ownerEmail === prev.ownerEmail &&
        ownerName === prev.ownerName &&
        legalName === prev.legalName
      ) {
        return prev
      }
      return { ...prev, ownerEmail, ownerName, legalName }
    })
  }, [user])

  if (!authReady) {
    return <RegistrationLoading />
  }

  if (!user) {
    return (
      <Navigate
        to="/seller-channel"
        state={{ from: location.pathname + location.search }}
        replace
      />
    )
  }

  if (user && myVendor.isLoading) {
    return <RegistrationLoading label="Đang kiểm tra trạng thái nhà bán..." />
  }

  if (user && myVendor.data?.registered && myVendor.data.vendor) {
    return <Navigate to="/seller" replace />
  }

  if (user && myVendor.isError) {
    return <RegistrationLookupError onRetry={() => myVendor.refetch()} />
  }

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleFileUpload(field: DocumentFileField, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    update(field, file)
    update(DOCUMENT_PREVIEW_FIELD[field], URL.createObjectURL(file) as any)
  }

  function sellerDocumentData(): SellerDocumentData {
    return {
      businessType: form.businessType,
      legalName: form.legalName,
      shopName: form.shopName,
      shopSlug: form.shopSlug,
      description: form.description,
      category: form.category,
      ownerName: form.ownerName,
      ownerEmail: form.ownerEmail || user?.email || "",
      ownerPhone: form.ownerPhone,
      taxCode: form.taxCode,
      idCard: form.idCard,
      address: form.address,
      ward: form.ward,
      district: form.district,
      city: form.city,
      bankName: form.bankName,
      accountNumber: form.accountNumber,
      accountHolder: form.accountHolder,
      sellsRegulatedGoods: form.sellsRegulatedGoods,
      regulatedGoodsTypes: form.regulatedGoodsTypes,
      regulatedGoodsNote: form.regulatedGoodsNote,
    }
  }

  function canGenerateLegalDocument() {
    if (!form.shopName || !form.ownerName || !form.ownerPhone) {
      toast.error("Vui lòng nhập tên shop, người đại diện và số điện thoại trước khi tạo hồ sơ")
      return false
    }
    if (form.businessType !== "individual" && !form.legalName) {
      toast.error("Vui lòng nhập tên pháp lý của doanh nghiệp/hộ kinh doanh")
      return false
    }
    return true
  }

  async function generateRegistrationDocument() {
    if (!canGenerateLegalDocument()) return
    try {
      setGeneratingDoc("registration")
      await downloadSellerRegistrationDocument(sellerDocumentData())
      toast.success("Đã tạo đơn đăng ký đã điền sẵn")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không tạo được đơn đăng ký")
    } finally {
      setGeneratingDoc(null)
    }
  }

  async function generateContractDocument() {
    if (!canGenerateLegalDocument()) return
    try {
      setGeneratingDoc("contract")
      await downloadSellerContractDocument(sellerDocumentData())
      toast.success("Đã tạo hợp đồng đã điền sẵn")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không tạo được hợp đồng")
    } finally {
      setGeneratingDoc(null)
    }
  }

  function validateApplicationBeforeSubmit() {
    if (!form.shopName || form.shopName.length < 3) {
      setStep(2)
      toast.error("Tên shop tối thiểu 3 ký tự")
      return false
    }
    if (!form.ownerName || !form.ownerPhone || !(form.ownerEmail || user?.email)) {
      setStep(3)
      toast.error("Vui lòng điền họ tên, email và số điện thoại")
      return false
    }
    if (form.businessType !== "individual" && !form.legalName) {
      setStep(3)
      toast.error("Vui lòng nhập tên pháp lý của doanh nghiệp/hộ kinh doanh")
      return false
    }
    if (!form.idCard) {
      setStep(3)
      toast.error("Vui lòng nhập số CCCD/CMND")
      return false
    }
    if (!form.docFront || !form.docBack) {
      setStep(3)
      toast.error("Vui lòng tải lên đủ CCCD mặt trước và mặt sau")
      return false
    }
    if (!form.registrationForm) {
      setStep(3)
      toast.error("Vui lòng tải lên Đơn đăng ký Seller đã ký")
      return false
    }
    if (!form.sellerContract) {
      setStep(3)
      toast.error("Vui lòng tải lên Hợp đồng người bán đã ký")
      return false
    }
    if (form.businessType !== "individual" && !form.businessLicense) {
      setStep(3)
      toast.error("Hộ kinh doanh/doanh nghiệp phải tải lên GP ĐKKD")
      return false
    }
    if (form.sellsRegulatedGoods && !form.specialGoodsLicense) {
      setStep(3)
      toast.error("Hàng hoá đặc thù cần giấy phép con/chuyên ngành")
      return false
    }
    if (!form.accountNumber || !form.accountHolder) {
      setStep(4)
      toast.error("Vui lòng nhập thông tin tài khoản ngân hàng")
      return false
    }
    return true
  }

  function next() {
    // Validate per step
    if (step === 2 && (!form.shopName || form.shopName.length < 3)) {
      toast.error("Tên shop tối thiểu 3 ký tự")
      return
    }
    if (step === 2 && form.sellsRegulatedGoods && form.regulatedGoodsTypes.length === 0) {
      toast.error("Vui lòng chọn nhóm hàng cần giấy phép con")
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
    if (step === 3 && !form.idCard) {
      toast.error("Vui lòng nhập số CCCD/CMND")
      return
    }
    if (step === 3 && form.businessType !== "individual" && !form.legalName) {
      toast.error("Vui lòng nhập tên pháp lý của doanh nghiệp/hộ kinh doanh")
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
    if (step === 3 && !form.docBack) {
      toast.error("Vui lòng tải lên CCCD mặt sau")
      return
    }
    if (step === 3 && !form.registrationForm) {
      toast.error("Vui lòng tải lên Đơn đăng ký Seller đã điền")
      return
    }
    if (step === 3 && !form.sellerContract) {
      toast.error("Vui lòng tải lên Hợp đồng người bán")
      return
    }
    if (step === 3 && form.businessType !== "individual" && !form.businessLicense) {
      toast.error("Hộ kinh doanh/doanh nghiệp phải tải lên GP ĐKKD")
      return
    }
    if (step === 3 && form.sellsRegulatedGoods && !form.specialGoodsLicense) {
      toast.error("Hàng hoá đặc thù cần giấy phép con/chuyên ngành")
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
    if (!validateApplicationBeforeSubmit()) {
      return
    }
    if (!form.agreedTerms) {
      toast.error("Vui lòng đồng ý Điều khoản trước khi gửi")
      return
    }
    if (!form.agreedPDPD) {
      toast.error("Vui lòng đồng ý Chính sách bảo vệ dữ liệu cá nhân")
      return
    }
    if (!user) {
      persistRegistrationDraft(form, step)
      toast.success("Đã lưu nháp hồ sơ. Đăng nhập để tiếp tục gửi xét duyệt.")
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
      if (form.registrationForm) {
        const url = await uploadSellerDocument(form.registrationForm, user.id)
        documents.push({ type: "seller_registration_form", file_url: url, file_name: form.registrationForm.name, mime_type: form.registrationForm.type })
      }
      if (form.sellerContract) {
        const url = await uploadSellerDocument(form.sellerContract, user.id)
        documents.push({ type: "seller_contract", file_url: url, file_name: form.sellerContract.name, mime_type: form.sellerContract.type })
      }
      if (form.businessLicense) {
        const url = await uploadSellerDocument(form.businessLicense, user.id)
        documents.push({ type: "business_license", file_url: url, file_name: form.businessLicense.name, mime_type: form.businessLicense.type })
      }
      if (form.specialGoodsLicense) {
        const url = await uploadSellerDocument(form.specialGoodsLicense, user.id)
        documents.push({ type: "special_goods_license", file_url: url, file_name: form.specialGoodsLicense.name, mime_type: form.specialGoodsLicense.type })
      }

      await registerVendor.mutateAsync({
        shop_name: form.shopName,
        shop_slug: form.shopSlug,
        legal_name: form.legalName || undefined,
        description: form.description || undefined,
        owner_name: form.ownerName,
        owner_email: form.ownerEmail || user.email,
        owner_phone: form.ownerPhone,
        business_type: form.businessType,
        requires_special_license: form.sellsRegulatedGoods,
        special_goods_types: form.sellsRegulatedGoods ? form.regulatedGoodsTypes : [],
        special_goods_note: form.sellsRegulatedGoods ? form.regulatedGoodsNote || undefined : undefined,
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
      clearRegistrationDraft()
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
    if (form.businessType !== "individual" && (!form.legalName || form.legalName === form.shopName)) {
      update("legalName", name)
    }
  }

  function onBusinessTypeSelect(type: BusinessType) {
    setForm((prev) => ({
      ...prev,
      businessType: type,
      legalName: prev.legalName || (type === "individual" ? prev.ownerName : prev.shopName),
    }))
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

          {!user && (
            <div className="mb-5 flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
              <ShieldCheck size={18} className="mt-0.5 shrink-0" />
              <div>
                <div className="font-semibold">Có thể nhập hồ sơ trước khi đăng nhập</div>
                <div className="mt-0.5 text-emerald-800">
                  Thông tin sẽ được lưu nháp trên thiết bị này. Khi gửi xét duyệt, hệ thống sẽ chuyển bạn đến đăng nhập rồi quay lại để tiếp tục.
                </div>
              </div>
            </div>
          )}

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
                onSelect={onBusinessTypeSelect}
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
              <Step3
                form={form}
                update={update}
                onFile={handleFileUpload}
                onGenerateRegistration={generateRegistrationDocument}
                onGenerateContract={generateContractDocument}
                generatingDoc={generatingDoc}
              />
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
  function toggleRegulatedGoodsType(id: string) {
    const next = form.regulatedGoodsTypes.includes(id)
      ? form.regulatedGoodsTypes.filter((item) => item !== id)
      : [...form.regulatedGoodsTypes, id]
    update("regulatedGoodsTypes", next)
  }

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
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={form.sellsRegulatedGoods}
              onChange={(e) => {
                update("sellsRegulatedGoods", e.target.checked)
                if (!e.target.checked) {
                  update("regulatedGoodsTypes", [])
                  update("regulatedGoodsNote", "")
                  update("specialGoodsLicense", null)
                  update("specialGoodsLicensePreview", null)
                }
              }}
              className="mt-0.5 h-4 w-4 rounded text-brand-red-500"
            />
            <span>
              <span className="block text-sm font-semibold text-amber-900">
                Shop có bán hàng hoá đặc thù/cần giấy phép con
              </span>
              <span className="mt-1 block text-xs leading-5 text-amber-800">
                Ví dụ: hàng nhập khẩu, đồ uống có cồn, thực phẩm, mỹ phẩm, hàng cần chứng nhận hợp quy hoặc giấy phép chuyên ngành.
              </span>
            </span>
          </label>

          {form.sellsRegulatedGoods && (
            <div className="mt-3 space-y-3 border-t border-amber-200 pt-3">
              <div className="grid gap-2 sm:grid-cols-2">
                {REGULATED_GOODS_TYPES.map((item) => (
                  <label key={item.id} className="flex items-center gap-2 text-xs font-medium text-amber-900">
                    <input
                      type="checkbox"
                      checked={form.regulatedGoodsTypes.includes(item.id)}
                      onChange={() => toggleRegulatedGoodsType(item.id)}
                      className="h-4 w-4 rounded text-brand-red-500"
                    />
                    {item.label}
                  </label>
                ))}
              </div>
              <textarea
                value={form.regulatedGoodsNote}
                onChange={(e) => update("regulatedGoodsNote", e.target.value)}
                placeholder="Ghi rõ giấy phép/chứng từ sẽ nộp, số giấy phép hoặc phạm vi hàng hoá..."
                rows={2}
                className="input resize-none bg-white"
                maxLength={300}
              />
            </div>
          )}
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
  onGenerateRegistration,
  onGenerateContract,
  generatingDoc,
}: {
  form: FormState
  update: <K extends keyof FormState>(key: K, value: FormState[K]) => void
  onFile: (f: DocumentFileField, e: React.ChangeEvent<HTMLInputElement>) => void
  onGenerateRegistration: () => void
  onGenerateContract: () => void
  generatingDoc: "registration" | "contract" | null
}) {
  const legalFileAccept =
    "image/*,application/pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"

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
            onChange={(e) => {
              const name = e.target.value
              update("ownerName", name)
              if (form.businessType === "individual" && (!form.legalName || form.legalName === form.ownerName)) {
                update("legalName", name)
              }
            }}
            className="input"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            Tên pháp lý trên hồ sơ {form.businessType !== "individual" && <span className="text-rose-600">*</span>}
          </label>
          <input
            type="text"
            value={form.legalName}
            onChange={(e) => update("legalName", e.target.value)}
            placeholder="Tên cá nhân, hộ kinh doanh hoặc doanh nghiệp theo giấy tờ"
            className="input"
          />
          <p className="mt-1 text-[11px] text-neutral-500">
            Trường này dùng để tự điền Đơn đăng ký Seller và Hợp đồng người bán.
          </p>
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
          Hồ sơ pháp lý bắt buộc <span className="text-rose-600">*</span>
        </h3>
        <div className="mt-2 rounded-lg border border-neutral-200 bg-neutral-50 p-3">
          <p className="text-xs font-semibold text-neutral-700">
            Tạo file Word đã tự điền thông tin, in hoặc ký số rồi upload lại vào hồ sơ
          </p>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={onGenerateRegistration}
              disabled={generatingDoc !== null}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-brand-red-200 bg-white px-3 py-2 text-xs font-semibold text-brand-red-700 hover:border-brand-red-400 disabled:cursor-wait disabled:opacity-70"
            >
              {generatingDoc === "registration" ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <FileText size={13} />
              )}
              Tạo đơn đã điền
            </button>
            <button
              type="button"
              onClick={onGenerateContract}
              disabled={generatingDoc !== null}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-brand-red-200 bg-white px-3 py-2 text-xs font-semibold text-brand-red-700 hover:border-brand-red-400 disabled:cursor-wait disabled:opacity-70"
            >
              {generatingDoc === "contract" ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <FileText size={13} />
              )}
              Tạo hợp đồng đã điền
            </button>
          </div>
          <div className="mt-3 border-t border-neutral-200 pt-3">
            <p className="text-[11px] font-medium text-neutral-500">Mẫu trắng</p>
            <div className="mt-2 flex flex-wrap gap-2">
            {SELLER_DOCUMENT_TEMPLATES.map((template) => (
              <a
                key={template.href}
                href={template.href}
                download
                className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs font-medium text-neutral-700 hover:border-brand-red-300 hover:text-brand-red-600"
              >
                <Download size={12} />
                {template.label}
              </a>
            ))}
            </div>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <UploadCard
            label="Đơn đăng ký Seller đã điền"
            url={form.registrationFormPreview}
            fileName={form.registrationForm?.name ?? null}
            onChange={(e) => onFile("registrationForm", e)}
            onRemove={() => { update("registrationForm", null); update("registrationFormPreview", null) }}
            accept={legalFileAccept}
          />
          <UploadCard
            label="Hợp đồng người bán đã ký"
            url={form.sellerContractPreview}
            fileName={form.sellerContract?.name ?? null}
            onChange={(e) => onFile("sellerContract", e)}
            onRemove={() => { update("sellerContract", null); update("sellerContractPreview", null) }}
            accept={legalFileAccept}
          />
          <UploadCard
            label="CCCD mặt trước"
            url={form.docFrontPreview}
            fileName={form.docFront?.name ?? null}
            onChange={(e) => onFile("docFront", e)}
            onRemove={() => { update("docFront", null); update("docFrontPreview", null) }}
            accept="image/*,application/pdf"
          />
          <UploadCard
            label="CCCD mặt sau"
            url={form.docBackPreview}
            fileName={form.docBack?.name ?? null}
            onChange={(e) => onFile("docBack", e)}
            onRemove={() => { update("docBack", null); update("docBackPreview", null) }}
            accept="image/*,application/pdf"
          />
          {form.businessType !== "individual" && (
            <UploadCard
              label="GP ĐKKD/Hộ kinh doanh"
              url={form.businessLicensePreview}
              fileName={form.businessLicense?.name ?? null}
              onChange={(e) => onFile("businessLicense", e)}
              onRemove={() => { update("businessLicense", null); update("businessLicensePreview", null) }}
              accept={legalFileAccept}
              span="full"
            />
          )}
          {form.sellsRegulatedGoods && (
            <UploadCard
              label="Giấy phép con/chứng từ chuyên ngành"
              url={form.specialGoodsLicensePreview}
              fileName={form.specialGoodsLicense?.name ?? null}
              onChange={(e) => onFile("specialGoodsLicense", e)}
              onRemove={() => { update("specialGoodsLicense", null); update("specialGoodsLicensePreview", null) }}
              accept={legalFileAccept}
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
  const regulatedGoodsLabels = REGULATED_GOODS_TYPES.filter((item) =>
    form.regulatedGoodsTypes.includes(item.id)
  ).map((item) => item.label)

  return (
    <div>
      <h2 className="text-xl font-bold text-neutral-900">Xác nhận thông tin</h2>
      <p className="mt-1 text-sm text-neutral-600">
        Vui lòng kiểm tra lại trước khi gửi yêu cầu xét duyệt.
      </p>

      <div className="mt-5 space-y-3">
        <SummaryRow label="Loại hình" value={businessTypeLabel ?? ""} />
        <SummaryRow label="Tên shop" value={form.shopName} />
        <SummaryRow label="Tên pháp lý" value={form.legalName} />
        <SummaryRow label="URL" value={`san-chinh-hang.vn/shops/${form.shopSlug}`} />
        <SummaryRow label="Danh mục" value={form.category} />
        <SummaryRow
          label="Hàng đặc thù"
          value={form.sellsRegulatedGoods ? regulatedGoodsLabels.join(", ") : "Không"}
        />
        <SummaryRow label="Người đại diện" value={form.ownerName} />
        <SummaryRow label="Số điện thoại" value={form.ownerPhone} />
        <SummaryRow label="CCCD" value={form.idCard} />
        <SummaryRow
          label="Hồ sơ pháp lý"
          value={[
            form.registrationForm ? "Đơn đăng ký" : "",
            form.sellerContract ? "Hợp đồng" : "",
            form.docFront && form.docBack ? "CCCD 2 mặt" : "",
            form.businessLicense ? "GP ĐKKD/HKD" : "",
            form.specialGoodsLicense ? "Giấy phép con" : "",
          ]
            .filter(Boolean)
            .join(", ")}
        />
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
  fileName,
  onChange,
  onRemove,
  accept = "image/*,application/pdf",
  span,
}: {
  label: string
  url: string | null
  fileName?: string | null
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onRemove: () => void
  accept?: string
  span?: "full"
}) {
  const isImage = Boolean(
    fileName?.match(/\.(png|jpe?g|webp|gif)$/i) || (!fileName && url?.startsWith("blob:"))
  )

  return (
    <div className={cn(span === "full" && "sm:col-span-2")}>
      <div className="mb-1 text-xs font-medium text-neutral-700">{label}</div>
      {url ? (
        <div className="relative overflow-hidden rounded-lg border border-neutral-200 bg-white">
          {isImage ? (
            <img src={url} alt={label} className="h-32 w-full object-cover" />
          ) : (
            <div className="flex h-32 items-center justify-center gap-2 px-4 text-sm text-neutral-700">
              <FileText size={22} className="shrink-0 text-brand-red-500" />
              <span className="truncate font-medium">{fileName || "Tài liệu đã chọn"}</span>
            </div>
          )}
          <button
            onClick={onRemove}
            className="absolute right-2 top-2 rounded-md bg-black/60 px-2 py-1 text-[10px] font-semibold text-white"
          >
            Đổi file
          </button>
        </div>
      ) : (
        <label className="flex h-32 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-neutral-300 bg-neutral-50 text-xs text-neutral-500 transition-colors hover:border-brand-red-400 hover:bg-brand-red-50">
          <Upload size={20} />
          <span>Tải lên</span>
          <input type="file" accept={accept} className="hidden" onChange={onChange} />
        </label>
      )}
    </div>
  )
}
