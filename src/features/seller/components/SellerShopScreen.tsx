import { useEffect, useState } from "react"
import { Upload, Save, ShieldCheck, Loader2, Sparkles } from "lucide-react"
import toast from "react-hot-toast"
import { useMyVendor, useUpdateMyVendor } from "../../../hooks/use-vendor"

export default function SellerShopScreen() {
  const vendorQuery = useMyVendor()
  const updateMutation = useUpdateMyVendor()
  const vendor = vendorQuery.data?.vendor ?? null

  const [shopName, setShopName] = useState("")
  const [description, setDescription] = useState("")
  const [logo, setLogo] = useState<string>("")
  const [banner, setBanner] = useState<string>("")
  const [pickupFullAddress, setPickupFullAddress] = useState("")
  const [pickupWard, setPickupWard] = useState("")
  const [pickupDistrict, setPickupDistrict] = useState("")
  const [pickupCity, setPickupCity] = useState("")
  const [bankName, setBankName] = useState("")
  const [bankAccountNumber, setBankAccountNumber] = useState("")
  const [bankAccountHolder, setBankAccountHolder] = useState("")

  useEffect(() => {
    if (!vendor) return
    setShopName(vendor.shop_name)
    setDescription(vendor.description ?? "")
    setLogo(vendor.shop_logo ?? "")
    setBanner(vendor.shop_banner ?? "")
    setPickupFullAddress(vendor.pickup_address?.full_address ?? "")
    setPickupWard(vendor.pickup_address?.ward ?? "")
    setPickupDistrict(vendor.pickup_address?.district ?? "")
    setPickupCity(vendor.pickup_address?.city ?? "")
    setBankName(vendor.bank_name ?? "")
    setBankAccountNumber(vendor.bank_account_number ?? "")
    setBankAccountHolder(vendor.bank_account_holder ?? "")
  }, [vendor])

  async function save() {
    if (!vendor) return
    try {
      await updateMutation.mutateAsync({
        vendorId: vendor.id,
        patch: {
          shop_name: shopName.trim(),
          description: description.trim() || null,
          pickup_address: {
            full_address: pickupFullAddress.trim(),
            ward: pickupWard.trim(),
            district: pickupDistrict.trim(),
            city: pickupCity.trim(),
          },
          bank_name: bankName.trim() || null,
          bank_account_number: bankAccountNumber.trim() || null,
          bank_account_holder: bankAccountHolder.trim() || null,
        },
      })
      toast.success("Đã lưu thay đổi")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Lưu thất bại")
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
                Khuyến nghị 1920×400px, JPG/PNG. Upload sẽ có ở bản cập nhật sắp tới.
              </p>
            </div>
            <div className="p-5">
              <div className="relative aspect-[6/1] overflow-hidden rounded-lg bg-gradient-to-r from-brand-red-500 to-brand-gold-500">
                {banner && <img src={banner} alt="Banner" className="h-full w-full object-cover" />}
                <label className="absolute inset-0 flex cursor-not-allowed items-center justify-center bg-black/30 opacity-0 transition-opacity hover:opacity-100">
                  <div className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-brand-red-600">
                    <Upload size={14} /> Đổi banner (sắp ra mắt)
                  </div>
                </label>
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

          {/* Pickup address */}
          <div className="card overflow-hidden">
            <div className="border-b border-neutral-100 p-4">
              <h3 className="text-base font-bold">Địa chỉ lấy hàng</h3>
              <p className="text-xs text-neutral-500">
                Đơn vị vận chuyển sẽ tới đây để lấy hàng
              </p>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <input
                  type="text"
                  value={pickupFullAddress}
                  onChange={(e) => setPickupFullAddress(e.target.value)}
                  className="input sm:col-span-2"
                  placeholder="Địa chỉ chi tiết"
                />
                <input
                  type="text"
                  value={pickupWard}
                  onChange={(e) => setPickupWard(e.target.value)}
                  className="input"
                  placeholder="Phường/Xã"
                />
                <input
                  type="text"
                  value={pickupDistrict}
                  onChange={(e) => setPickupDistrict(e.target.value)}
                  className="input"
                  placeholder="Quận/Huyện"
                />
                <input
                  type="text"
                  value={pickupCity}
                  onChange={(e) => setPickupCity(e.target.value)}
                  className="input sm:col-span-2"
                  placeholder="Tỉnh/Thành"
                />
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
                  KYC: {vendor.kyc_level === "verified"
                    ? "Đã xác minh"
                    : vendor.kyc_level === "premium"
                    ? "Premium"
                    : vendor.kyc_level === "basic"
                    ? "Cơ bản"
                    : "Chưa xác minh"}
                </h3>
                <p className="mt-1 text-xs text-neutral-600">
                  {vendor.kyc_level === "verified" || vendor.kyc_level === "premium"
                    ? "Shop đã được Quỹ Chống Hàng Giả VN xác minh."
                    : "Hoàn tất xác minh để tăng độ tin cậy với khách hàng."}
                </p>
                <button className="mt-2 text-xs font-semibold text-brand-red-600 hover:underline">
                  Nâng cấp →
                </button>
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
