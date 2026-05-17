import { useEffect, useMemo, useState } from "react"
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
  Send,
  CheckCircle2,
  Percent,
  Ticket,
  Search,
  ChevronDown,
} from "lucide-react"
import toast from "react-hot-toast"
import { cn } from "../../../lib/cn"
import { uploadProductImage } from "../../../lib/upload"
import { useMyVendor } from "../../../hooks/use-vendor"
import {
  useProduct,
  useSaveDraftProduct,
  useSubmitProduct,
  useUpdateProduct,
  useResubmitProduct,
} from "../../../hooks/use-products"
import { useShopVouchers } from "../../../hooks/use-vouchers"
import type {
  ProductPromotionSettings,
  ProductVariantInput,
  ProductVoucherScope,
} from "../../../lib/product-service"
import {
  DEFAULT_PRODUCT_CATEGORY,
  PRODUCT_CATEGORIES,
  normalizeCategorySearch,
} from "../../../lib/product-categories"
import { requestProductCategory } from "../../../lib/category-request-service"

const MAX_IMAGES = 9

export default function SellerProductFormScreen() {
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const isEdit = !!id && id !== "new"

  const vendor = useMyVendor()
  const editing = useProduct(isEdit ? id : undefined)
  const shopId = vendor.data?.vendor?.firebase_uid ?? null
  const shopVouchers = useShopVouchers(shopId)

  const submitProductM = useSubmitProduct()
  const saveDraftM = useSaveDraftProduct()
  const updateProductM = useUpdateProduct()
  const resubmitM = useResubmitProduct()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState(DEFAULT_PRODUCT_CATEGORY)
  const [categoryRequestName, setCategoryRequestName] = useState("")
  const [categoryRequestNote, setCategoryRequestNote] = useState("")
  const [requestingCategory, setRequestingCategory] = useState(false)
  const [brand, setBrand] = useState("")
  const [images, setImages] = useState<string[]>([])
  const [uploadingCount, setUploadingCount] = useState(0)
  const [basePrice, setBasePrice] = useState(0)
  const [variants, setVariants] = useState<ProductVariantInput[]>([])
  const [voucherScope, setVoucherScope] = useState<ProductVoucherScope>("none")
  const [selectedVoucherIds, setSelectedVoucherIds] = useState<string[]>([])
  const [affiliateCommissionPercent, setAffiliateCommissionPercent] = useState<number | "">("")
  const [acfVerified, setAcfVerified] = useState(false)
  const [weightGrams, setWeightGrams] = useState<number | "">("")
  const [dimL, setDimL] = useState<number | "">("")
  const [dimW, setDimW] = useState<number | "">("")
  const [dimH, setDimH] = useState<number | "">("")
  const [metaDescription, setMetaDescription] = useState("")

  // Hydrate form from existing product when editing
  useEffect(() => {
    const p = editing.data
    if (!p) return
    setTitle(p.title)
    setDescription(p.description ?? "")
    setCategory(p.category)
    setBrand(p.brand)
    setImages(p.images)
    setBasePrice(p.basePrice)
    setVariants(p.variants)
    setVoucherScope(p.promotion?.voucherScope ?? "none")
    setSelectedVoucherIds(p.promotion?.voucherIds ?? [])
    setAffiliateCommissionPercent(
      typeof p.promotion?.affiliateCommissionBps === "number"
        ? p.promotion.affiliateCommissionBps / 100
        : ""
    )
    setAcfVerified(p.acfVerifyStatus !== "none")
    setWeightGrams(p.weightGrams ?? "")
    setDimL(p.dimensions?.length ?? "")
    setDimW(p.dimensions?.width ?? "")
    setDimH(p.dimensions?.height ?? "")
    setMetaDescription(p.metaDescription ?? "")
  }, [editing.data])

  const editingStatus = editing.data?.status
  const editingRejectedReason = editing.data?.rejectedReason

  const isLocked = editingStatus === "approved" || editingStatus === "pending"

  const isSaving =
    submitProductM.isPending ||
    saveDraftM.isPending ||
    updateProductM.isPending ||
    resubmitM.isPending

  const canSubmit = useMemo(() => {
    if (!vendor.data?.vendor) return false
    return !isSaving && uploadingCount === 0
  }, [vendor.data, isSaving, uploadingCount])

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || !vendor.data?.vendor) return
    const shopId = vendor.data.vendor.firebase_uid
    const remaining = MAX_IMAGES - images.length
    const toUpload = Array.from(files).slice(0, remaining)

    setUploadingCount((c) => c + toUpload.length)
    try {
      const urls = await Promise.all(
        toUpload.map((f) => uploadProductImage(f, shopId))
      )
      setImages((prev) => [...prev, ...urls])
    } catch (err) {
      console.error("Upload error:", err)
      toast.error("Tải ảnh thất bại — kiểm tra kết nối")
    } finally {
      setUploadingCount((c) => c - toUpload.length)
      e.target.value = "" // allow re-selecting the same file
    }
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  function addVariant() {
    setVariants((prev) => [
      ...prev,
      {
        id: `v_${Date.now()}_${prev.length}`,
        title: "",
        sku: "",
        price: basePrice,
        stock: 0,
      },
    ])
  }

  function updateVariant(vid: string, patch: Partial<ProductVariantInput>) {
    setVariants((prev) =>
      prev.map((v) => (v.id === vid ? { ...v, ...patch } : v))
    )
  }

  function removeVariant(vid: string) {
    setVariants((prev) => prev.filter((v) => v.id !== vid))
  }

  function validateBasics(): boolean {
    if (!title || title.length < 5) {
      toast.error("Tên sản phẩm tối thiểu 5 ký tự")
      return false
    }
    if (!brand) {
      toast.error("Vui lòng nhập thương hiệu")
      return false
    }
    if (!category) {
      toast.error("Vui lòng chọn danh mục")
      return false
    }
    if (images.length === 0) {
      toast.error("Vui lòng tải lên ít nhất 1 ảnh sản phẩm")
      return false
    }
    if (basePrice <= 0) {
      toast.error("Giá phải lớn hơn 0")
      return false
    }
    if (uploadingCount > 0) {
      toast.error("Vui lòng đợi ảnh tải xong")
      return false
    }
    return true
  }

  async function handleCategoryRequest() {
    const shop = vendor.data?.vendor
    if (!shop) {
      toast.error("Chưa xác định được shop của bạn")
      return
    }
    if (categoryRequestName.trim().length < 3) {
      toast.error("Tên danh mục đề xuất tối thiểu 3 ký tự")
      return
    }

    try {
      setRequestingCategory(true)
      await requestProductCategory({
        shopId: shop.firebase_uid,
        vendorId: shop.id,
        shopName: shop.shop_name,
        requestedName: categoryRequestName,
        note: categoryRequestNote,
        productTitle: title,
        currentCategory: category,
      })
      toast.success("Đã gửi yêu cầu bổ sung danh mục")
      setCategoryRequestName("")
      setCategoryRequestNote("")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không gửi được yêu cầu danh mục")
    } finally {
      setRequestingCategory(false)
    }
  }

  function toggleVoucher(voucherId: string) {
    setSelectedVoucherIds((prev) =>
      prev.includes(voucherId)
        ? prev.filter((id) => id !== voucherId)
        : [...prev, voucherId]
    )
  }

  function buildPromotion(): ProductPromotionSettings {
    const selected = shopVouchers.vouchers.filter((voucher) =>
      selectedVoucherIds.includes(voucher.id)
    )
    const commission =
      affiliateCommissionPercent === ""
        ? null
        : Math.max(0, Math.min(3000, Math.round(Number(affiliateCommissionPercent) * 100)))

    return {
      voucherScope,
      voucherIds: voucherScope === "none" ? [] : selectedVoucherIds,
      voucherCodes: voucherScope === "none" ? [] : selected.map((voucher) => voucher.code),
      affiliateCommissionBps: commission,
    }
  }

  function buildPayload() {
    const v = vendor.data?.vendor
    if (!v) return null
    const dimensions =
      dimL && dimW && dimH
        ? { length: Number(dimL), width: Number(dimW), height: Number(dimH) }
        : undefined
    return {
      shopId: v.firebase_uid,
      vendorId: v.id,
      shopName: v.shop_name,
      shopSlug: v.shop_slug,
      title,
      description: description || undefined,
      brand,
      category,
      thumbnail: images[0],
      images,
      basePrice,
      variants,
      promotion: buildPromotion(),
      weightGrams: weightGrams === "" ? undefined : Number(weightGrams),
      dimensions,
      acfVerified,
      metaDescription: metaDescription || undefined,
    }
  }

  async function handleSaveDraft() {
    if (!validateBasics()) return
    const payload = buildPayload()
    if (!payload) {
      toast.error("Chưa xác định được shop của bạn")
      return
    }
    try {
      if (isEdit && editing.data) {
        await updateProductM.mutateAsync({
          id: editing.data.id,
          patch: {
            ...payload,
            status: "draft",
            rejectedReason: null,
          },
        })
        toast.success("Đã lưu thay đổi nháp")
      } else {
        await saveDraftM.mutateAsync(payload)
        toast.success("Đã lưu nháp sản phẩm")
      }
      navigate("/seller/products")
    } catch (err: any) {
      toast.error(err?.message ?? "Lưu nháp thất bại")
    }
  }

  async function handleSubmitForReview() {
    if (!validateBasics()) return
    const payload = buildPayload()
    if (!payload) {
      toast.error("Chưa xác định được shop của bạn")
      return
    }
    try {
      if (isEdit && editing.data) {
        // Update + flip to pending in one go.
        await updateProductM.mutateAsync({
          id: editing.data.id,
          patch: { ...payload, status: "pending", rejectedReason: null },
        })
        toast.success("Đã gửi sản phẩm để admin duyệt")
      } else {
        await submitProductM.mutateAsync(payload)
        toast.success(
          "Sản phẩm đã được gửi. Admin sẽ duyệt trong 24-48h."
        )
      }
      navigate("/seller/products")
    } catch (err: any) {
      toast.error(err?.message ?? "Gửi duyệt thất bại")
    }
  }

  if (isEdit && editing.isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="animate-spin text-brand-red-500" size={28} />
      </div>
    )
  }

  if (isEdit && !editing.data) {
    return (
      <div className="p-6">
        <Link
          to="/seller/products"
          className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-brand-red-600"
        >
          <ArrowLeft size={14} /> Quay lại
        </Link>
        <p className="mt-4 text-neutral-700">
          Không tìm thấy sản phẩm hoặc đã bị xoá.
        </p>
      </div>
    )
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
            Điền đầy đủ thông tin để admin có thể duyệt nhanh.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSaveDraft}
            disabled={!canSubmit || isLocked}
            className="btn-secondary disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Save size={14} />
            )}
            Lưu nháp
          </button>
          <button
            onClick={handleSubmitForReview}
            disabled={!canSubmit || isLocked}
            className="btn-primary disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Send size={14} />
            )}
            {isEdit && editingStatus === "rejected"
              ? "Gửi duyệt lại"
              : "Gửi để duyệt"}
          </button>
        </div>
      </div>

      {/* Status alerts */}
      {editingStatus === "pending" && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm">
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-amber-600" />
          <div>
            <p className="font-semibold text-amber-900">
              Đang chờ admin duyệt
            </p>
            <p className="mt-0.5 text-amber-700">
              Bạn không thể chỉnh sửa khi sản phẩm đang trong hàng đợi. Đợi
              admin phản hồi hoặc liên hệ support.
            </p>
          </div>
        </div>
      )}

      {editingStatus === "approved" && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm">
          <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-600" />
          <div>
            <p className="font-semibold text-emerald-900">Đã được duyệt</p>
            <p className="mt-0.5 text-emerald-700">
              Sản phẩm đang hiển thị công khai. Để chỉnh sửa, vui lòng tạo bản
              nháp mới.
            </p>
          </div>
        </div>
      )}

      {editingStatus === "rejected" && editingRejectedReason && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm">
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-rose-600" />
          <div>
            <p className="font-semibold text-rose-900">Đã bị từ chối</p>
            <p className="mt-0.5 text-rose-700">{editingRejectedReason}</p>
            <p className="mt-1 text-xs text-rose-600">
              Chỉnh sửa rồi bấm "Gửi duyệt lại" để admin xem xét lần nữa.
            </p>
          </div>
        </div>
      )}

      <div className={cn("grid gap-5 lg:grid-cols-[1fr_320px]", isLocked && "pointer-events-none opacity-60")}>
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
                <CategorySearchSelect
                  value={category}
                  onChange={setCategory}
                />
                <div className="mt-3 rounded-lg border border-dashed border-neutral-200 bg-neutral-50 p-3">
                  <div className="text-xs font-semibold text-neutral-700">
                    Không tìm thấy danh mục phù hợp?
                  </div>
                  <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_auto]">
                    <input
                      type="text"
                      value={categoryRequestName}
                      onChange={(e) => setCategoryRequestName(e.target.value)}
                      placeholder="VD: Thiết bị livestream"
                      className="input bg-white text-xs"
                      maxLength={120}
                    />
                    <button
                      type="button"
                      onClick={handleCategoryRequest}
                      disabled={requestingCategory}
                      className="btn-secondary justify-center text-xs disabled:opacity-60"
                    >
                      {requestingCategory ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <Plus size={12} />
                      )}
                      Yêu cầu bổ sung
                    </button>
                  </div>
                  <textarea
                    value={categoryRequestNote}
                    onChange={(e) => setCategoryRequestNote(e.target.value)}
                    placeholder="Ghi chú thêm cho admin: nhóm hàng, ví dụ sản phẩm, lý do cần danh mục..."
                    rows={2}
                    className="input mt-2 resize-none bg-white text-xs"
                    maxLength={300}
                  />
                </div>
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
              Tối đa {MAX_IMAGES} ảnh. Ảnh đầu tiên sẽ là ảnh đại diện. Khuyến nghị 1000x1000px.
            </p>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
              {images.map((url, i) => (
                <div
                  key={url + i}
                  className="relative aspect-square overflow-hidden rounded-lg border-2 border-neutral-200 bg-neutral-100"
                >
                  <img src={url} alt={`Ảnh ${i + 1}`} className="h-full w-full object-cover" />
                  {i === 0 && (
                    <span className="absolute left-1 top-1 rounded bg-brand-red-500 px-1.5 py-0.5 text-[9px] font-bold text-white">
                      Bìa
                    </span>
                  )}
                  <button
                    onClick={() => removeImage(i)}
                    className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
              {uploadingCount > 0 &&
                Array.from({ length: uploadingCount }).map((_, i) => (
                  <div
                    key={`uploading-${i}`}
                    className="flex aspect-square items-center justify-center rounded-lg border-2 border-dashed border-amber-300 bg-amber-50 text-amber-600"
                  >
                    <Loader2 className="animate-spin" size={20} />
                  </div>
                ))}
              {images.length + uploadingCount < MAX_IMAGES && (
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
                Sản phẩm không có phân loại — dùng giá &amp; kho cơ bản ở trên.
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
          <Section title="Khuyến mãi & Affiliate">
            <div className="mb-4 grid gap-3 md:grid-cols-3">
              {[
                {
                  id: "none",
                  title: "Không gắn voucher",
                  desc: "Chỉ dùng voucher chung của shop.",
                },
                {
                  id: "product",
                  title: "Voucher riêng sản phẩm",
                  desc: "Ưu tiên hiển thị cho sản phẩm này.",
                },
                {
                  id: "category",
                  title: "Voucher theo danh mục",
                  desc: `Áp dụng nhóm ${category}.`,
                },
              ].map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setVoucherScope(option.id as ProductVoucherScope)}
                  className={cn(
                    "rounded-lg border p-3 text-left transition-colors",
                    voucherScope === option.id
                      ? "border-brand-red-500 bg-brand-red-50 text-brand-red-700"
                      : "border-neutral-200 hover:border-brand-red-300"
                  )}
                >
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Ticket size={14} />
                    {option.title}
                  </div>
                  <p className="mt-1 text-xs text-neutral-500">{option.desc}</p>
                </button>
              ))}
            </div>

            {voucherScope !== "none" && (
              <div className="mb-4 rounded-lg border border-neutral-200 p-3">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-neutral-900">
                      Chọn voucher liên kết
                    </div>
                    <p className="text-xs text-neutral-500">
                      Checkout vẫn dùng voucher thật trong tab Voucher; phần này giúp gắn ưu đãi đúng sản phẩm/danh mục.
                    </p>
                  </div>
                  <Link to="/seller/vouchers" className="text-xs font-semibold text-brand-red-600 hover:underline">
                    Quản lý voucher
                  </Link>
                </div>
                {shopVouchers.loading ? (
                  <div className="flex items-center gap-2 py-3 text-sm text-neutral-500">
                    <Loader2 size={14} className="animate-spin" />
                    Đang tải voucher...
                  </div>
                ) : shopVouchers.vouchers.length === 0 ? (
                  <div className="rounded-md border border-dashed border-neutral-200 p-4 text-center text-sm text-neutral-500">
                    Shop chưa có voucher. Tạo voucher trước rồi quay lại gắn vào sản phẩm.
                  </div>
                ) : (
                  <div className="grid gap-2 md:grid-cols-2">
                    {shopVouchers.vouchers.map((voucher) => (
                      <label
                        key={voucher.id}
                        className={cn(
                          "flex cursor-pointer items-start gap-2 rounded-md border p-3 text-sm",
                          selectedVoucherIds.includes(voucher.id)
                            ? "border-brand-red-400 bg-brand-red-50"
                            : "border-neutral-200 hover:border-brand-red-200"
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={selectedVoucherIds.includes(voucher.id)}
                          onChange={() => toggleVoucher(voucher.id)}
                          className="mt-0.5 h-4 w-4 rounded text-brand-red-500"
                        />
                        <span className="min-w-0">
                          <span className="block font-mono text-xs font-bold text-brand-red-600">
                            {voucher.code}
                          </span>
                          <span className="line-clamp-1 block text-neutral-800">
                            {voucher.title}
                          </span>
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}

            <FormField label="Affiliate commission riêng sản phẩm">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Percent
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                  />
                  <input
                    type="number"
                    min={0}
                    max={30}
                    step={0.5}
                    value={affiliateCommissionPercent}
                    onChange={(event) =>
                      setAffiliateCommissionPercent(
                        event.target.value === "" ? "" : Number(event.target.value)
                      )
                    }
                    placeholder="Theo mặc định của shop"
                    className="input pl-9"
                  />
                </div>
                <span className="text-sm font-semibold text-neutral-500">%</span>
              </div>
              <p className="mt-1 text-xs text-neutral-500">
                Để trống nếu dùng mức commission mặc định trong Trang trưng bày.
              </p>
            </FormField>
          </Section>

          {/* Shipping */}
          <Section title="Vận chuyển">
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Khối lượng (g)">
                <input
                  type="number"
                  value={weightGrams}
                  onChange={(e) =>
                    setWeightGrams(e.target.value === "" ? "" : +e.target.value)
                  }
                  placeholder="200"
                  className="input"
                  min={0}
                />
              </FormField>
              <FormField label="Kích thước (cm)">
                <div className="flex gap-1">
                  <input
                    type="number"
                    value={dimL}
                    onChange={(e) =>
                      setDimL(e.target.value === "" ? "" : +e.target.value)
                    }
                    placeholder="D"
                    className="input"
                  />
                  <input
                    type="number"
                    value={dimW}
                    onChange={(e) =>
                      setDimW(e.target.value === "" ? "" : +e.target.value)
                    }
                    placeholder="R"
                    className="input"
                  />
                  <input
                    type="number"
                    value={dimH}
                    onChange={(e) =>
                      setDimH(e.target.value === "" ? "" : +e.target.value)
                    }
                    placeholder="C"
                    className="input"
                  />
                </div>
              </FormField>
            </div>
          </Section>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Shop info */}
          <Section title="Gian hàng" compact>
            {vendor.data?.vendor ? (
              <div className="text-sm">
                <p className="font-semibold text-neutral-900">
                  {vendor.data.vendor.shop_name}
                </p>
                <p className="mt-0.5 text-xs text-neutral-500">
                  {vendor.data.vendor.shop_slug}
                </p>
              </div>
            ) : (
              <p className="text-xs text-amber-700">
                Đang tải thông tin shop...
              </p>
            )}
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
            <FormField label="Meta description">
              <textarea
                rows={3}
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="Mô tả ngắn cho Google..."
                className="input resize-none text-xs"
                maxLength={160}
              />
            </FormField>
          </Section>
        </div>
      </div>
    </div>
  )
}

function CategorySearchSelect({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  const [query, setQuery] = useState(value)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) setQuery(value)
  }, [open, value])

  const filteredCategories = useMemo(() => {
    const normalizedQuery = normalizeCategorySearch(query)
    if (!normalizedQuery) return PRODUCT_CATEGORIES.slice(0, 80)

    return PRODUCT_CATEGORIES.filter((category) => {
      const haystack = normalizeCategorySearch(
        [category.label, category.group, ...(category.keywords ?? [])].join(" ")
      )
      return haystack.includes(normalizedQuery)
    }).slice(0, 80)
  }, [query])

  const selected = PRODUCT_CATEGORIES.find((category) => category.label === value)

  return (
    <div className="relative">
      <div className="relative">
        <Search
          size={15}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
        />
        <input
          type="text"
          value={query}
          onFocus={() => setOpen(true)}
          onBlur={() => window.setTimeout(() => setOpen(false), 120)}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          placeholder="Tìm danh mục theo tên hàng hoá..."
          className="input pl-9 pr-9"
        />
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
          aria-label="Mở danh sách danh mục"
        >
          <ChevronDown size={15} />
        </button>
      </div>

      <div className="mt-1 min-h-5 text-[11px] text-neutral-500">
        {selected ? (
          <>
            Đã chọn: <span className="font-semibold text-neutral-700">{selected.label}</span>
            <span className="text-neutral-400"> · {selected.group}</span>
          </>
        ) : value ? (
          <>
            Danh mục hiện tại: <span className="font-semibold text-neutral-700">{value}</span>
          </>
        ) : (
          "Nhập từ khóa như: son, chuột, thực phẩm, mẹ bé, dầu nhớt..."
        )}
      </div>

      {open && (
        <div
          className="absolute z-30 mt-1 max-h-72 w-full overflow-y-auto rounded-lg border border-neutral-200 bg-white py-1 shadow-xl"
          onMouseDown={(e) => e.preventDefault()}
        >
          {filteredCategories.length === 0 ? (
            <div className="px-3 py-4 text-sm text-neutral-500">
              Không tìm thấy danh mục phù hợp. Bạn có thể gửi yêu cầu bổ sung bên dưới.
            </div>
          ) : (
            filteredCategories.map((category) => (
              <button
                key={category.label}
                type="button"
                onClick={() => {
                  onChange(category.label)
                  setQuery(category.label)
                  setOpen(false)
                }}
                className={cn(
                  "flex w-full items-start justify-between gap-3 px-3 py-2 text-left hover:bg-brand-red-50",
                  value === category.label && "bg-brand-red-50 text-brand-red-700"
                )}
              >
                <span>
                  <span className="block text-sm font-medium">{category.label}</span>
                  <span className="text-[11px] text-neutral-500">{category.group}</span>
                </span>
                {value === category.label && (
                  <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-brand-red-600" />
                )}
              </button>
            ))
          )}
        </div>
      )}
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
