import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { Upload, Save, ShieldCheck, Loader2, Sparkles, ImagePlus, MapPin, Phone, UserRound, Plus, Trash2 } from "lucide-react"
import toast from "react-hot-toast"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"
import { useMyVendor, useUpdateMyVendor } from "../../../hooks/use-vendor"
import { uploadSellerDocument } from "../../../lib/upload"
import { sanitizeUserError } from "../../../lib/error-utils"
import { getShopProfile, saveShopProfile, DEFAULT_SHOP_DISPLAY_CONFIG } from "../../../lib/shop-profile-service"
import { firestore } from "../../../lib/firebase"
import { getKycStatusMeta, getKycLevelLabel, getKycProviderLabel, normalizeKycStatus } from "../../../lib/kyc"
import {
  normalizeWarehouseList,
  type ProductWarehouse,
} from "../../../lib/warehouse-routing"

const MAX_PICKUP_WAREHOUSES = 10
const WAREHOUSE_PHONE_PATTERN = /^[0-9+()\-\s]{8,20}$/

export default function SellerShopScreen() {
  const vendorQuery = useMyVendor()
  const updateMutation = useUpdateMyVendor()
  const vendor = vendorQuery.data?.vendor ?? null
  const kycStatusMeta = getKycStatusMeta(vendor?.kyc_status ?? "not_started")
  const normalizedKycStatus = normalizeKycStatus(vendor?.kyc_status)

  const [shopName, setShopName] = useState("")
  const [description, setDescription] = useState("")
  const [logo, setLogo] = useState<string>("")
  const [banner, setBanner] = useState<string>("")
  const [pickupWarehouses, setPickupWarehouses] = useState<ProductWarehouse[]>([])
  const [bankName, setBankName] = useState("")
  const [bankAccountNumber, setBankAccountNumber] = useState("")
  const [bankAccountHolder, setBankAccountHolder] = useState("")
  const [uploadingAsset, setUploadingAsset] = useState<"logo" | "banner" | null>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!vendor) return
    setShopName(vendor.shop_name)
    setDescription(vendor.description ?? "")
    setLogo(vendor.shop_logo ?? "")
    setBanner(vendor.shop_banner ?? "")
    const warehouses = normalizeWarehouseList(vendor.pickup_warehouses)
    const fallbackWarehouse = createBlankWarehouse(0, {
      warehouseName: "Kho mặc định",
      contactName: vendor.owner_name ?? "",
      contactPhone: vendor.owner_phone ?? "",
      fullAddress: vendor.pickup_address?.full_address ?? "",
      ward: vendor.pickup_address?.ward ?? "",
      district: vendor.pickup_address?.district ?? "",
      city: vendor.pickup_address?.city ?? "",
    })
    setPickupWarehouses(warehouses.length > 0 ? warehouses : [fallbackWarehouse])
    setBankName(vendor.bank_name ?? "")
    setBankAccountNumber(vendor.bank_account_number ?? "")
    setBankAccountHolder(vendor.bank_account_holder ?? "")

    // Auto-sync vendor logo/banner to public-readable stores
    if (vendor.shop_logo || vendor.shop_banner) {
      // Mirror to user doc (public get) so PublicProfileScreen can display
      setDoc(
        doc(firestore, "users", vendor.firebase_uid),
        {
          shop_logo: vendor.shop_logo ?? null,
          shop_banner: vendor.shop_banner ?? null,
          shop_name: vendor.shop_name,
          updated_at: serverTimestamp(),
        },
        { merge: true },
      ).catch(() => {})

      // Mirror to shopProfiles (public read)
      getShopProfile(vendor.firebase_uid).then((existing) => {
        const needsSync =
          !existing ||
          (vendor.shop_logo && existing.logoUrl !== vendor.shop_logo) ||
          (vendor.shop_banner && existing.bannerUrl !== vendor.shop_banner)
        if (needsSync) {
          saveShopProfile({
            shopId: vendor.firebase_uid,
            vendorId: vendor.id,
            shopName: vendor.shop_name,
            shopSlug: vendor.shop_slug,
            logoUrl: vendor.shop_logo,
            bannerUrl: vendor.shop_banner,
            displayConfig: existing?.displayConfig ?? DEFAULT_SHOP_DISPLAY_CONFIG,
            affiliateCommissionBps: existing?.affiliateCommissionBps ?? 500,
          }).catch(() => {})
        }
      }).catch(() => {})
    }
  }, [vendor])

  async function syncShopProfile(logoVal: string, bannerVal: string, nameVal: string) {
    if (!vendor) return
    try {
      await Promise.all([
        setDoc(
          doc(firestore, "users", vendor.firebase_uid),
          {
            shop_logo: logoVal || null,
            shop_banner: bannerVal || null,
            shop_name: nameVal,
            updated_at: serverTimestamp(),
          },
          { merge: true },
        ),
        (async () => {
          const existing = await getShopProfile(vendor.firebase_uid)
          await saveShopProfile({
            shopId: vendor.firebase_uid,
            vendorId: vendor.id,
            shopName: nameVal,
            shopSlug: vendor.shop_slug,
            logoUrl: logoVal || null,
            bannerUrl: bannerVal || null,
            displayConfig: existing?.displayConfig ?? DEFAULT_SHOP_DISPLAY_CONFIG,
            affiliateCommissionBps: existing?.affiliateCommissionBps ?? 500,
          })
        })(),
      ])
    } catch {
      // non-critical — public mirror update failed silently
    }
  }

  function createBlankWarehouse(
    index: number,
    overrides: Partial<ProductWarehouse> = {}
  ): ProductWarehouse {
    return {
      id: overrides.id ?? `shop-warehouse-${Date.now()}-${index}`,
      warehouseName: overrides.warehouseName ?? `Kho ${index + 1}`,
      contactName: overrides.contactName ?? "",
      contactPhone: overrides.contactPhone ?? "",
      fullAddress: overrides.fullAddress ?? "",
      ward: overrides.ward ?? "",
      district: overrides.district ?? "",
      city: overrides.city ?? "",
      latitude: overrides.latitude ?? null,
      longitude: overrides.longitude ?? null,
      note: overrides.note ?? null,
      isDefault: overrides.isDefault ?? index === 0,
    }
  }

  function addWarehouse() {
    setPickupWarehouses((prev) => {
      if (prev.length >= MAX_PICKUP_WAREHOUSES) {
        toast.error("Mỗi shop chỉ hỗ trợ tối đa 10 kho lấy hàng")
        return prev
      }
      return [...prev, createBlankWarehouse(prev.length)]
    })
  }

  function updateWarehouse(warehouseId: string, patch: Partial<ProductWarehouse>) {
    setPickupWarehouses((prev) =>
      prev.map((warehouse) =>
        warehouse.id === warehouseId ? { ...warehouse, ...patch } : warehouse
      )
    )
  }

  function removeWarehouse(warehouseId: string) {
    setPickupWarehouses((prev) => {
      const next = prev.filter((warehouse) => warehouse.id !== warehouseId)
      if (next.length === 0) return [createBlankWarehouse(0)]
      if (!next.some((warehouse) => warehouse.isDefault)) {
        next[0] = { ...next[0], isDefault: true }
      }
      return next
    })
  }

  function setDefaultWarehouse(warehouseId: string) {
    setPickupWarehouses((prev) =>
      prev.map((warehouse) => ({
        ...warehouse,
        isDefault: warehouse.id === warehouseId,
      }))
    )
  }

  async function save() {
    if (!vendor) return
    if (!shopName.trim()) {
      toast.error("Tên shop không được trống")
      return
    }
    if (pickupWarehouses.length === 0) {
      toast.error("Shop cần ít nhất 1 kho lấy hàng")
      return
    }

    for (const warehouse of pickupWarehouses) {
      if (
        !warehouse.warehouseName.trim() ||
        !warehouse.contactName.trim() ||
        !warehouse.contactPhone.trim() ||
        !warehouse.fullAddress.trim() ||
        !warehouse.ward.trim() ||
        !warehouse.district.trim() ||
        !warehouse.city.trim()
      ) {
        toast.error("Mỗi kho cần đủ tên kho, người phụ trách, số điện thoại và địa chỉ")
        return
      }
      if (!WAREHOUSE_PHONE_PATTERN.test(warehouse.contactPhone.trim())) {
        toast.error("Số điện thoại kho không hợp lệ")
        return
      }
    }

    const normalizedWarehouses = normalizeWarehouseList(pickupWarehouses)
    const defaultWarehouse =
      normalizedWarehouses.find((warehouse) => warehouse.isDefault) ?? normalizedWarehouses[0]
    if (!defaultWarehouse) {
      toast.error("Thông tin kho lấy hàng không hợp lệ")
      return
    }

    try {
      await updateMutation.mutateAsync({
        vendorId: vendor.id,
        patch: {
          shop_name: shopName.trim(),
          shop_logo: logo || null,
          shop_banner: banner || null,
          description: description.trim() || null,
          owner_name: defaultWarehouse.contactName,
          owner_phone: defaultWarehouse.contactPhone,
          pickup_address: {
            full_address: defaultWarehouse.fullAddress,
            ward: defaultWarehouse.ward,
            district: defaultWarehouse.district,
            city: defaultWarehouse.city,
          },
          pickup_warehouses: normalizedWarehouses,
          bank_name: bankName.trim() || null,
          bank_account_number: bankAccountNumber.trim() || null,
          bank_account_holder: bankAccountHolder.trim() || null,
        },
      })
      await syncShopProfile(logo, banner, shopName.trim())
      toast.success("Đã lưu thay đổi")
    } catch (err) {
      toast.error(sanitizeUserError(err, "Lưu thất bại. Vui lòng thử lại sau."))
    }
  }

  async function uploadAsset(file: File | undefined, type: "logo" | "banner") {
    if (!file || !vendor) return
    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh JPG/PNG/WebP")
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ảnh tối đa 5MB")
      return
    }

    setUploadingAsset(type)
    try {
      const url = await uploadSellerDocument(file, vendor.firebase_uid, "shops")
      if (type === "logo") setLogo(url)
      else setBanner(url)
      await updateMutation.mutateAsync({
        vendorId: vendor.id,
        patch: type === "logo" ? { shop_logo: url } : { shop_banner: url },
      })
      const newLogo = type === "logo" ? url : logo
      const newBanner = type === "banner" ? url : banner
      await syncShopProfile(newLogo, newBanner, shopName.trim() || vendor.shop_name)
      toast.success(type === "logo" ? "Đã cập nhật logo shop" : "Đã cập nhật ảnh bìa")
    } catch (err) {
      toast.error(sanitizeUserError(err, "Không upload được ảnh. Vui lòng thử lại sau."))
    } finally {
      setUploadingAsset(null)
      if (type === "logo" && logoInputRef.current) logoInputRef.current.value = ""
      if (type === "banner" && bannerInputRef.current) bannerInputRef.current.value = ""
    }
  }

  if (vendorQuery.isLoading) {
    return (
      <div className="flex items-center justify-center p-12 text-sm text-neutral-500">
        <Loader2 size={16} className="mr-2 animate-spin" />
        Đang tải thông tin shop...
      </div>
    )
  }

  if (!vendor) {
    return (
      <div className="card flex flex-col items-center justify-center p-8 text-center">
        <h2 className="text-lg font-bold text-neutral-900">Bạn chưa đăng ký shop</h2>
        <p className="mt-2 text-sm text-neutral-600">
          Hoàn tất đăng ký người bán để truy cập trang quản lý shop.
        </p>
        <a href="/seller-register" className="btn-primary mt-4">
          Đăng ký người bán
        </a>
      </div>
    )
  }

  const saving = updateMutation.isPending

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 lg:text-3xl">Quản lý shop</h1>
          <p className="mt-1 text-sm text-neutral-600">
            Thông tin hiển thị công khai trên trang shop
          </p>
        </div>
        <button onClick={save} disabled={saving} className="btn-primary">
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          Lưu thay đổi
        </button>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          {/* Banner */}
          <div className="card overflow-hidden">
            <div className="border-b border-neutral-100 p-4">
              <h3 className="text-base font-bold">Ảnh banner shop</h3>
              <p className="text-xs text-neutral-500">
                Khuyến nghị 1920×400px, JPG/PNG/WebP, tối đa 5MB.
              </p>
            </div>
            <div className="p-5">
              <div className="relative aspect-[6/1] overflow-hidden rounded-lg bg-gradient-to-r from-brand-red-500 to-brand-gold-500">
                {banner && <img src={banner} alt="Banner" className="h-full w-full object-cover" />}
                <input
                  ref={bannerInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => uploadAsset(event.target.files?.[0], "banner")}
                />
                <button
                  type="button"
                  onClick={() => bannerInputRef.current?.click()}
                  disabled={uploadingAsset !== null}
                  className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity hover:opacity-100 disabled:cursor-wait disabled:opacity-100"
                >
                  <div className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-brand-red-600">
                    {uploadingAsset === "banner" ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Upload size={14} />
                    )}
                    Đổi banner
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Logo + Basic info */}
          <div className="card overflow-hidden">
            <div className="border-b border-neutral-100 p-4">
              <h3 className="text-base font-bold">Thông tin shop</h3>
            </div>
            <div className="p-5">
              <div className="mb-4 flex items-center gap-4">
                <div className="relative">
                  {logo ? (
                    <img src={logo} alt="Logo" className="h-20 w-20 rounded-2xl object-cover" />
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-red-100 text-2xl font-bold text-brand-red-700">
                      {shopName[0]?.toUpperCase() ?? "?"}
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-xs text-neutral-500">Logo shop</div>
                  <div className="text-sm font-semibold">Khuyến nghị 500×500px, vuông</div>
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => uploadAsset(event.target.files?.[0], "logo")}
                  />
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    disabled={uploadingAsset !== null}
                    className="btn-secondary mt-2 text-xs"
                  >
                    {uploadingAsset === "logo" ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <ImagePlus size={14} />
                    )}
                    Đổi logo
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">
                  Tên shop
                </label>
                <input
                  type="text"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="input"
                  maxLength={60}
                />
              </div>

              <div className="mt-4">
                <label className="mb-1 block text-sm font-medium text-neutral-700">
                  Mô tả shop
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="input resize-none"
                  maxLength={500}
                />
                <div className="mt-1 text-right text-[10px] text-neutral-400">
                  {description.length}/500
                </div>
              </div>
            </div>
          </div>

          {/* Pickup warehouse */}
          <div className="card overflow-hidden">
            <div className="border-b border-neutral-100 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="rounded-lg bg-sky-50 p-2 text-sky-600">
                  <MapPin size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-bold">Kho lấy hàng</h3>
                  <p className="text-xs text-neutral-500">
                    Bắt buộc có ít nhất 1 kho. Hệ thống dùng kho mặc định nếu sản phẩm chưa gán kho riêng.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addWarehouse}
                  className="btn-secondary text-xs"
                >
                  <Plus size={12} />
                  Thêm kho
                </button>
              </div>
            </div>
            <div className="p-5">
              <p className="text-xs text-neutral-500">
                Nhập đúng phường/xã, quận/huyện, tỉnh/thành để GHTK đối soát tuyến lấy hàng chính xác.
              </p>
              <div className="mt-4 space-y-4">
                {pickupWarehouses.map((warehouse, index) => (
                  <div key={warehouse.id} className="border-t border-neutral-100 pt-4 first:border-t-0 first:pt-0">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-neutral-800">
                        <input
                          type="radio"
                          name="defaultPickupWarehouse"
                          checked={warehouse.isDefault}
                          onChange={() => setDefaultWarehouse(warehouse.id)}
                          className="h-4 w-4 accent-brand-red-600"
                        />
                        Kho #{index + 1}
                      </label>
                      <button
                        type="button"
                        onClick={() => removeWarehouse(warehouse.id)}
                        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 size={12} />
                        Xoá kho
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <input
                        type="text"
                        value={warehouse.warehouseName}
                        onChange={(e) =>
                          updateWarehouse(warehouse.id, { warehouseName: e.target.value })
                        }
                        className="input"
                        placeholder="Tên kho"
                        maxLength={120}
                      />
                      <label className="relative block">
                        <UserRound size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                        <input
                          type="text"
                          value={warehouse.contactName}
                          onChange={(e) =>
                            updateWarehouse(warehouse.id, { contactName: e.target.value })
                          }
                          className="input pl-9"
                          placeholder="Người phụ trách kho"
                          maxLength={120}
                        />
                      </label>
                      <label className="relative block">
                        <Phone size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                        <input
                          type="tel"
                          value={warehouse.contactPhone}
                          onChange={(e) =>
                            updateWarehouse(warehouse.id, { contactPhone: e.target.value })
                          }
                          className="input pl-9"
                          placeholder="Số điện thoại kho"
                          inputMode="tel"
                          maxLength={20}
                          pattern={"[0-9+()\\s-]{8,20}"}
                        />
                      </label>
                      <input
                        type="text"
                        value={warehouse.city}
                        onChange={(e) => updateWarehouse(warehouse.id, { city: e.target.value })}
                        className="input"
                        placeholder="Tỉnh/Thành"
                        maxLength={120}
                      />
                      <input
                        type="text"
                        value={warehouse.district}
                        onChange={(e) =>
                          updateWarehouse(warehouse.id, { district: e.target.value })
                        }
                        className="input"
                        placeholder="Quận/Huyện"
                        maxLength={120}
                      />
                      <input
                        type="text"
                        value={warehouse.ward}
                        onChange={(e) => updateWarehouse(warehouse.id, { ward: e.target.value })}
                        className="input"
                        placeholder="Phường/Xã"
                        maxLength={120}
                      />
                      <textarea
                        value={warehouse.fullAddress}
                        onChange={(e) =>
                          updateWarehouse(warehouse.id, { fullAddress: e.target.value })
                        }
                        className="input resize-none sm:col-span-2"
                        placeholder="Số nhà, tên đường, toà nhà..."
                        rows={2}
                        maxLength={240}
                      />
                      <textarea
                        value={warehouse.note ?? ""}
                        onChange={(e) =>
                          updateWarehouse(warehouse.id, {
                            note: e.target.value.trim() ? e.target.value : null,
                          })
                        }
                        className="input resize-none sm:col-span-2"
                        placeholder="Ghi chú kho: giờ lấy hàng, cổng vào, lưu ý cho shipper..."
                        rows={2}
                        maxLength={500}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bank account */}
          <div className="card overflow-hidden">
            <div className="border-b border-neutral-100 p-4">
              <h3 className="text-base font-bold">Tài khoản nhận tiền</h3>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="input"
                  placeholder="Ngân hàng"
                />
                <input
                  type="text"
                  value={bankAccountNumber}
                  onChange={(e) => setBankAccountNumber(e.target.value)}
                  className="input"
                  placeholder="Số tài khoản"
                />
                <input
                  type="text"
                  value={bankAccountHolder}
                  onChange={(e) => setBankAccountHolder(e.target.value)}
                  className="input sm:col-span-2"
                  placeholder="Tên chủ tài khoản"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Verification */}
          <div className="card p-5">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-brand-gold-100 p-2 text-brand-gold-700">
                <ShieldCheck size={18} />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-neutral-900">
                  {kycStatusMeta.label}
                </h3>
                <p className="mt-1 text-xs text-neutral-600">
                  {kycStatusMeta.description}
                </p>
                <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-neutral-500">
                  <span className="rounded-full bg-neutral-100 px-2 py-0.5 font-semibold text-neutral-700">
                    {getKycProviderLabel(vendor.kyc_provider)}
                  </span>
                  <span className="rounded-full bg-neutral-100 px-2 py-0.5 font-semibold text-neutral-700">
                    {getKycLevelLabel(vendor.kyc_level)}
                  </span>
                </div>
                <Link to="/seller/kyc" className="mt-3 inline-flex text-xs font-semibold text-brand-red-600 hover:underline">
                  {normalizedKycStatus === "APPROVED" ? "Xem lại VNPT eKYC →" : "Nâng cấp bằng VNPT eKYC →"}
                </Link>
              </div>
            </div>
          </div>

          {/* Aivy tips */}
          <div className="card overflow-hidden bg-gradient-to-br from-brand-red-50 to-brand-gold-50 p-5">
            <div className="flex items-start gap-3">
              <Sparkles className="text-brand-gold-500" />
              <div>
                <h3 className="text-sm font-bold text-neutral-900">
                  Tối ưu trang shop
                </h3>
                <p className="mt-1 text-xs text-neutral-700">
                  Hỏi Aivy để gợi ý logo, mô tả thu hút khách hơn.
                </p>
              </div>
            </div>
          </div>

          {/* Quick stats */}
          <div className="card p-5">
            <h3 className="mb-3 text-sm font-bold">Thống kê nhanh</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-neutral-500">Followers</span>
                <strong>{vendor.follower_count.toLocaleString("vi-VN")}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Tổng đơn</span>
                <strong>{vendor.total_orders.toLocaleString("vi-VN")}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Đánh giá TB</span>
                <strong>
                  {vendor.avg_rating > 0 ? `⭐ ${vendor.avg_rating.toFixed(1)}` : "—"}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Tham gia từ</span>
                <strong>
                  {vendor.created_at
                    ? vendor.created_at.toDate().toLocaleDateString("vi-VN")
                    : "—"}
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
