import { useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import {
  ArrowLeft,
  Upload,
  X,
  Plus,
  Save,
  Trash2,
  ShieldCheck,
  AlertCircle,
  Loader2,
} from "lucide-react"
import toast from "react-hot-toast"
import { cn } from "../../../lib/cn"
import { MOCK_SELLER_PRODUCTS } from "../mock-data"

interface VariantRow {
  id: string
  title: string
  sku: string
  price: number
  stock: number
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

export default function SellerProductFormScreen() {
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const isEdit = !!id && id !== "new"
  const existing = isEdit ? MOCK_SELLER_PRODUCTS.find((p) => p.id === id) : null

  const [title, setTitle] = useState(existing?.title ?? "")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState(existing?.category ?? CATEGORIES[0])
  const [brand, setBrand] = useState(existing?.brand ?? "")
  const [images, setImages] = useState<string[]>(existing ? [existing.thumbnail] : [])
  const [basePrice, setBasePrice] = useState(existing?.basePrice ?? 0)
  const [variants, setVariants] = useState<VariantRow[]>([])
  const [acfVerified, setAcfVerified] = useState(existing?.acfVerified ?? false)
  const [status, setStatus] = useState<"draft" | "active">(
    existing?.status === "active" ? "active" : "draft"
  )
  const [loading, setLoading] = useState(false)

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files) return
    const newImages = Array.from(files)
      .slice(0, 9 - images.length)
      .map((f) => URL.createObjectURL(f))
    setImages([...images, ...newImages])
  }

  function addVariant() {
    setVariants([
      ...variants,
      {
        id: `v_${Date.now()}`,
        title: "",
        sku: "",
        price: basePrice,
        stock: 0,
      },
    ])
  }

  function updateVariant(id: string, patch: Partial<VariantRow>) {
    setVariants((prev) => prev.map((v) => (v.id === id ? { ...v, ...patch } : v)))
  }

  function removeVariant(id: string) {
    setVariants((prev) => prev.filter((v) => v.id !== id))
  }

  async function save(publish: boolean = false) {
    if (!title || title.length < 5) {
      toast.error("Tên sản phẩm tối thiểu 5 ký tự")
      return
    }
    if (images.length === 0) {
      toast.error("Vui lòng tải lên ít nhất 1 ảnh sản phẩm")
      return
    }
    if (basePrice <= 0) {
      toast.error("Giá phải lớn hơn 0")
      return
    }

    setLoading(true)
    try {
      await new Promise((r) => setTimeout(r, 1000))
      toast.success(
        publish
          ? "Sản phẩm đã được đăng bán"
          : isEdit
          ? "Đã cập nhật sản phẩm"
          : "Đã lưu nháp sản phẩm"
      )
      navigate("/seller/products")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <Link
        to="/seller/products"
        className="mb-3 inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-brand-red-600"
      >
        <ArrowLeft size={14} />
        Quay lại sản phẩm
      </Link>

      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 lg:text-3xl">
            {isEdit ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
          </h1>
          <p className="mt-1 text-sm text-neutral-600">
            Điền đầy đủ thông tin để sản phẩm hiển thị tốt nhất.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => save(false)}
            disabled={loading}
            className="btn-secondary"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Lưu nháp
          </button>
          <button
            onClick={() => save(true)}
            disabled={loading}
            className="btn-primary"
          >
            Đăng bán
          </button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          {/* Basic info */}
          <Section title="Thông tin cơ bản">
            <FormField label="Tên sản phẩm" required>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="VD: Son Dưỡng SPF 15 Natural Beauty 4g"
                className="input"
                maxLength={120}
              />
              <div className="mt-1 text-right text-[10px] text-neutral-400">
                {title.length}/120
              </div>
            </FormField>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Danh mục" required>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="input"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </FormField>
              <FormField label="Thương hiệu" required>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="input"
                />
              </FormField>
            </div>

            <FormField label="Mô tả">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả chi tiết về sản phẩm, thành phần, công dụng, hướng dẫn sử dụng..."
                rows={6}
                className="input resize-none"
              />
            </FormField>
          </Section>

          {/* Images */}
          <Section title="Hình ảnh sản phẩm">
            <p className="mb-3 text-xs text-neutral-500">
              Tối đa 9 ảnh. Ảnh đầu tiên sẽ là ảnh đại diện. Khuyến nghị 1000x1000px.
            </p>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
              {images.map((url, i) => (
                <div key={i} className="relative aspect-square overflow-hidden rounded-lg border-2 border-neutral-200 bg-neutral-100">
                  <img src={url} alt={`Ảnh ${i + 1}`} className="h-full w-full object-cover" />
                  {i === 0 && (
                    <span className="absolute left-1 top-1 rounded bg-brand-red-500 px-1.5 py-0.5 text-[9px] font-bold text-white">
                      Bìa
                    </span>
                  )}
                  <button
                    onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                    className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
              {images.length < 9 && (
                <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-neutral-300 bg-neutral-50 text-xs text-neutral-500 hover:border-brand-red-400 hover:text-brand-red-600">
                  <Upload size={20} />
                  <span>Tải lên</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </Section>

          {/* Pricing & inventory */}
          <Section title="Giá & tồn kho">
            <FormField label="Giá bán cơ bản (VND)" required>
              <input
                type="number"
                value={basePrice || ""}
                onChange={(e) => setBasePrice(+e.target.value)}
                placeholder="VD: 180000"
                className="input"
                min={0}
              />
            </FormField>

            <div className="mt-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-neutral-700">
                Phân loại (Variants)
              </h3>
              <button onClick={addVariant} className="btn-secondary text-xs">
                <Plus size={12} />
                Thêm phân loại
              </button>
            </div>

            {variants.length === 0 ? (
              <div className="mt-2 rounded-lg border border-dashed border-neutral-300 p-4 text-center text-xs text-neutral-500">
                Sản phẩm không có phân loại — dùng giá & kho cơ bản ở trên.
                <br />
                Bấm "Thêm phân loại" để tạo nhiều phiên bản (màu, size, dung tích...).
              </div>
            ) : (
              <div className="mt-2 space-y-2">
                <div className="hidden grid-cols-12 gap-2 px-3 text-[10px] uppercase tracking-wider text-neutral-500 sm:grid">
                  <div className="col-span-4">Tên phân loại</div>
                  <div className="col-span-3">SKU</div>
                  <div className="col-span-2 text-right">Giá</div>
                  <div className="col-span-2 text-right">Kho</div>
                  <div></div>
                </div>
                {variants.map((v) => (
                  <div key={v.id} className="grid grid-cols-12 gap-2 rounded-lg bg-neutral-50 p-2">
                    <input
                      value={v.title}
                      onChange={(e) => updateVariant(v.id, { title: e.target.value })}
                      placeholder="VD: Hồng nude"
                      className="input col-span-4"
                    />
                    <input
                      value={v.sku}
                      onChange={(e) => updateVariant(v.id, { sku: e.target.value })}
                      placeholder="SKU"
                      className="input col-span-3 font-mono text-xs"
                    />
                    <input
                      type="number"
                      value={v.price || ""}
                      onChange={(e) => updateVariant(v.id, { price: +e.target.value })}
                      placeholder="180000"
                      className="input col-span-2 text-right"
                      min={0}
                    />
                    <input
                      type="number"
                      value={v.stock || ""}
                      onChange={(e) => updateVariant(v.id, { stock: +e.target.value })}
                      placeholder="50"
                      className="input col-span-2 text-right"
                      min={0}
                    />
                    <button
                      onClick={() => removeVariant(v.id)}
                      className="flex items-center justify-center rounded-md text-rose-500 hover:bg-rose-50"
                      aria-label="Xoá"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* Shipping */}
          <Section title="Vận chuyển">
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Khối lượng (g)">
                <input type="number" placeholder="200" className="input" min={0} />
              </FormField>
              <FormField label="Kích thước (cm)">
                <div className="flex gap-1">
                  <input placeholder="D" className="input" />
                  <input placeholder="R" className="input" />
                  <input placeholder="C" className="input" />
                </div>
              </FormField>
            </div>
          </Section>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Status */}
          <Section title="Trạng thái" compact>
            <div className="space-y-2 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={status === "active"}
                  onChange={() => setStatus("active")}
                  className="h-4 w-4 text-brand-red-500"
                />
                <span>
                  <strong className="text-emerald-700">Đang bán</strong> – Hiển thị công khai
                </span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={status === "draft"}
                  onChange={() => setStatus("draft")}
                  className="h-4 w-4 text-brand-red-500"
                />
                <span>
                  <strong className="text-neutral-700">Nháp</strong> – Chỉ shop thấy
                </span>
              </label>
            </div>
          </Section>

          {/* ACF verify */}
          <Section title="Chống hàng giả ACF" compact>
            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                checked={acfVerified}
                onChange={(e) => setAcfVerified(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded text-brand-red-500"
              />
              <span>
                <strong className="flex items-center gap-1 text-brand-gold-700">
                  <ShieldCheck size={12} />
                  Đăng ký xác thực QR
                </strong>
                <span className="block text-xs text-neutral-500">
                  Sản phẩm sẽ được Quỹ Chống Hàng Giả VN xét duyệt và gắn nhãn "Chính hãng"
                </span>
              </span>
            </label>
            {acfVerified && (
              <div className="mt-3 flex items-start gap-2 rounded-lg bg-brand-gold-50 p-2 text-[11px] text-brand-gold-800">
                <AlertCircle size={12} className="mt-0.5 shrink-0" />
                <span>
                  Cần upload chứng nhận xuất xứ / phân phối / giấy phép sản phẩm sau khi đăng. ACF sẽ liên hệ trong 24h.
                </span>
              </div>
            )}
          </Section>

          <Section title="SEO" compact>
            <FormField label="Slug URL">
              <div className="flex items-center rounded-lg border border-neutral-200 bg-neutral-50">
                <span className="px-2 text-[11px] text-neutral-500">.../products/</span>
                <input
                  placeholder="auto-generate"
                  className="flex-1 border-0 bg-transparent py-2 pr-2 text-xs focus:outline-none focus:ring-0"
                />
              </div>
            </FormField>
            <FormField label="Meta description">
              <textarea
                rows={3}
                placeholder="Mô tả ngắn cho Google..."
                className="input resize-none text-xs"
              />
            </FormField>
          </Section>
        </div>
      </div>
    </div>
  )
}

function Section({
  title,
  children,
  compact,
}: {
  title: string
  children: React.ReactNode
  compact?: boolean
}) {
  return (
    <div className="card overflow-hidden">
      <div className={cn("border-b border-neutral-100 px-5", compact ? "py-3" : "py-4")}>
        <h3 className="text-base font-bold text-neutral-900">{title}</h3>
      </div>
      <div className={cn(compact ? "p-3" : "p-5")}>{children}</div>
    </div>
  )
}

function FormField({
  label,
  children,
  required,
}: {
  label: string
  children: React.ReactNode
  required?: boolean
}) {
  return (
    <div className="mb-3 last:mb-0">
      <label className="mb-1 block text-sm font-medium text-neutral-700">
        {label}
        {required && <span className="ml-0.5 text-rose-500">*</span>}
      </label>
      {children}
    </div>
  )
}
