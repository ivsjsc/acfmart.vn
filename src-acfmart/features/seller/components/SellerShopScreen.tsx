import { useState } from "react"
import { Upload, Save, ShieldCheck, Loader2, Sparkles } from "lucide-react"
import toast from "react-hot-toast"
import { MOCK_SELLER_PROFILE } from "../mock-data"

export default function SellerShopScreen() {
  const initial = MOCK_SELLER_PROFILE
  const [shopName, setShopName] = useState(initial.shopName)
  const [description, setDescription] = useState(initial.description ?? "")
  const [logo, setLogo] = useState(initial.shopLogo)
  const [banner, setBanner] = useState(initial.shopBanner ?? "")
  const [loading, setLoading] = useState(false)

  async function save() {
    setLoading(true)
    await new Promise((r) => setTimeout(r, 800))
    setLoading(false)
    toast.success("Đã lưu thay đổi")
  }

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 lg:text-3xl">Quản lý shop</h1>
          <p className="mt-1 text-sm text-neutral-600">
            Thông tin hiển thị công khai trên trang shop
          </p>
        </div>
        <button onClick={save} disabled={loading} className="btn-primary">
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          Lưu thay đổi
        </button>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          {/* Banner */}
          <div className="card overflow-hidden">
            <div className="border-b border-neutral-100 p-4">
              <h3 className="text-base font-bold">Ảnh banner shop</h3>
              <p className="text-xs text-neutral-500">Khuyến nghị 1920×400px, JPG/PNG</p>
            </div>
            <div className="p-5">
              <div className="relative aspect-[6/1] overflow-hidden rounded-lg bg-gradient-to-r from-brand-red-500 to-brand-gold-500">
                {banner && <img src={banner} alt="Banner" className="h-full w-full object-cover" />}
                <label className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/30 opacity-0 transition-opacity hover:opacity-100">
                  <div className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-brand-red-600">
                    <Upload size={14} /> Đổi banner
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0]
                      if (f) setBanner(URL.createObjectURL(f))
                    }}
                  />
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
                  <img src={logo} alt="Logo" className="h-20 w-20 rounded-2xl object-cover" />
                  <label className="absolute -bottom-1 -right-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-white shadow-md ring-2 ring-white">
                    <Upload size={12} />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0]
                        if (f) setLogo(URL.createObjectURL(f))
                      }}
                    />
                  </label>
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
                  defaultValue={initial.pickupAddress.fullAddress}
                  className="input sm:col-span-2"
                  placeholder="Địa chỉ chi tiết"
                />
                <input
                  type="text"
                  defaultValue={initial.pickupAddress.ward}
                  className="input"
                  placeholder="Phường/Xã"
                />
                <input
                  type="text"
                  defaultValue={initial.pickupAddress.district}
                  className="input"
                  placeholder="Quận/Huyện"
                />
                <input
                  type="text"
                  defaultValue={initial.pickupAddress.city}
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
                  defaultValue={initial.bankAccount?.bankName}
                  className="input"
                  placeholder="Ngân hàng"
                />
                <input
                  type="text"
                  defaultValue={initial.bankAccount?.accountNumber}
                  className="input"
                  placeholder="Số tài khoản"
                />
                <input
                  type="text"
                  defaultValue={initial.bankAccount?.accountHolder}
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
                  KYC: {initial.kycLevel === "verified" ? "Đã xác minh" : initial.kycLevel}
                </h3>
                <p className="mt-1 text-xs text-neutral-600">
                  Shop đã được Quỹ Chống Hàng Giả VN xác minh.
                </p>
                <button className="mt-2 text-xs font-semibold text-brand-red-600 hover:underline">
                  Nâng cấp lên Premium →
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
                <strong>124.000</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Sản phẩm</span>
                <strong>187</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Đánh giá TB</span>
                <strong>⭐ 4.9</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Tham gia từ</span>
                <strong>{new Date(initial.registeredAt).toLocaleDateString("vi-VN")}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
