import { useState } from "react"
import { Link } from "react-router-dom"
import {
  ShieldAlert,
  ShieldCheck,
  FileText,
  Phone,
  Mail,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Upload,
  X,
} from "lucide-react"
import toast from "react-hot-toast"

export default function AntiCounterfeitReportPage() {
  const [step, setStep] = useState(1)
  const [productInfo, setProductInfo] = useState({
    name: "",
    brand: "",
    purchasePlace: "",
    purchaseDate: "",
    price: "",
  })
  const [suspicionReason, setSuspicionReason] = useState<string[]>([])
  const [description, setDescription] = useState("")
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [contactInfo, setContactInfo] = useState({
    name: "",
    phone: "",
    email: "",
  })
  const [submitted, setSubmitted] = useState(false)

  const suspicionOptions = [
    "Bao bì khác so với chính hãng",
    "Chất lượng sản phẩm không đúng",
    "Mã QR/serial không xác thực được",
    "Giá quá rẻ so với thị trường",
    "Không có tem chống hàng giả",
    "Nguồn gốc xuất xứ không rõ ràng",
    "Mùi vị/màu sắc bất thường",
    "Khác biệt về font chữ/logo",
  ]

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    Array.from(files).forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setUploadedImages(prev => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = () => {
    if (!productInfo.name || !productInfo.brand) {
      toast.error("Vui lòng điền tên sản phẩm và thương hiệu")
      return
    }
    if (suspicionReason.length === 0) {
      toast.error("Vui lòng chọn ít nhất một lý do nghi ngờ")
      return
    }
    if (!contactInfo.name || !contactInfo.phone) {
      toast.error("Vui lòng điền thông tin liên hệ")
      return
    }

    // Simulate submission
    setSubmitted(true)
    toast.success("Đã gửi báo cáo thành công!")
  }

  if (submitted) {
    return (
      <div className="container-acf py-12">
        <div className="mx-auto max-w-2xl rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle size={32} />
          </div>
          <h1 className="text-2xl font-bold text-emerald-900">Đã gửi báo cáo thành công!</h1>
          <p className="mt-3 text-sm text-emerald-700">
            Cảm ơn bạn đã đóng góp vào cuộc chiến chống hàng giả. Chúng tôi sẽ xem xét báo cáo của bạn trong vòng 3-5 ngày làm việc.
          </p>
          <div className="mt-6 space-y-3 text-sm text-emerald-800">
            <p>Mã báo cáo: <strong>ACF-{Date.now().toString().slice(-8)}</strong></p>
            <p>Thời gian xử lý dự kiến: <strong>3-5 ngày làm việc</strong></p>
            <p>Kết quả sẽ được gửi qua: <strong>{contactInfo.email || contactInfo.phone}</strong></p>
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link to="/qr-verify" className="btn-primary inline-flex items-center justify-center gap-2">
              <ShieldCheck size={18} /> Kiểm tra QR ngay
            </Link>
            <Link to="/" className="btn-secondary inline-flex">
              Về trang chủ
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-neutral-50">
      {/* Header */}
      <section className="border-b border-neutral-200 bg-white">
        <div className="container-acf py-8">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-brand-red-100 p-3 text-brand-red-600">
              <ShieldAlert size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neutral-900 lg:text-3xl">
                Báo cáo nghi ngờ hàng giả
              </h1>
              <p className="mt-2 text-sm text-neutral-600">
                Giúp chúng tôi phát hiện và xử lý các sản phẩm giả mạo, bảo vệ quyền lợi người tiêu dùng
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Progress Steps */}
      <section className="container-acf py-6">
        <div className="flex items-center justify-center gap-4">
          {[
            { num: 1, label: "Thông tin sản phẩm" },
            { num: 2, label: "Lý do nghi ngờ" },
            { num: 3, label: "Hình ảnh" },
            { num: 4, label: "Liên hệ" },
          ].map((s) => (
            <div key={s.num} className="flex items-center">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${
                step >= s.num 
                  ? "bg-brand-red-500 text-white" 
                  : "bg-neutral-200 text-neutral-500"
              }`}>
                {s.num}
              </div>
              <span className={`ml-2 text-xs font-medium ${
                step >= s.num ? "text-neutral-900" : "text-neutral-400"
              }`}>
                {s.label}
              </span>
              {s.num < 4 && (
                <ArrowRight size={16} className={`mx-3 ${
                  step > s.num ? "text-brand-red-500" : "text-neutral-300"
                }`} />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Form Content */}
      <section className="container-acf pb-12">
        <div className="mx-auto max-w-3xl">
          {/* Step 1: Product Info */}
          {step === 1 && (
            <div className="card p-6">
              <h2 className="mb-4 text-lg font-bold text-neutral-900">Thông tin sản phẩm</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-neutral-700">Tên sản phẩm *</label>
                  <input
                    type="text"
                    value={productInfo.name}
                    onChange={(e) => setProductInfo({ ...productInfo, name: e.target.value })}
                    className="input mt-1"
                    placeholder="Ví dụ: Son Dior Rouge Liquid"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700">Thương hiệu *</label>
                  <input
                    type="text"
                    value={productInfo.brand}
                    onChange={(e) => setProductInfo({ ...productInfo, brand: e.target.value })}
                    className="input mt-1"
                    placeholder="Ví dụ: Dior"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700">Giá mua (VNĐ)</label>
                  <input
                    type="text"
                    value={productInfo.price}
                    onChange={(e) => setProductInfo({ ...productInfo, price: e.target.value })}
                    className="input mt-1"
                    placeholder="Ví dụ: 500000"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-neutral-700">Nơi mua *</label>
                  <input
                    type="text"
                    value={productInfo.purchasePlace}
                    onChange={(e) => setProductInfo({ ...productInfo, purchasePlace: e.target.value })}
                    className="input mt-1"
                    placeholder="Ví dụ: Shop ABC trên Shopee, Cửa hàng XYZ..."
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-neutral-700">Ngày mua</label>
                  <input
                    type="date"
                    value={productInfo.purchaseDate}
                    onChange={(e) => setProductInfo({ ...productInfo, purchaseDate: e.target.value })}
                    className="input mt-1"
                  />
                </div>
              </div>
              <button onClick={() => setStep(2)} className="btn-primary mt-6 w-full">
                Tiếp tục
              </button>
            </div>
          )}

          {/* Step 2: Suspicion Reasons */}
          {step === 2 && (
            <div className="card p-6">
              <h2 className="mb-4 text-lg font-bold text-neutral-900">Lý do nghi ngờ hàng giả</h2>
              <p className="mb-4 text-sm text-neutral-600">Chọn tất cả các dấu hiệu khiến bạn nghi ngờ sản phẩm này</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {suspicionOptions.map((option) => (
                  <label
                    key={option}
                    className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                      suspicionReason.includes(option)
                        ? "border-brand-red-500 bg-brand-red-50"
                        : "border-neutral-200 hover:border-brand-red-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={suspicionReason.includes(option)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSuspicionReason([...suspicionReason, option])
                        } else {
                          setSuspicionReason(suspicionReason.filter(r => r !== option))
                        }
                      }}
                      className="mt-0.5 h-4 w-4 text-brand-red-500 focus:ring-brand-red-500"
                    />
                    <span className="text-sm text-neutral-700">{option}</span>
                  </label>
                ))}
              </div>
              <div className="mt-6">
                <label className="block text-sm font-medium text-neutral-700">Mô tả chi tiết (tuỳ chọn)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input mt-1"
                  rows={4}
                  placeholder="Mô tả thêm về những điểm bất thường bạn nhận thấy..."
                />
              </div>
              <div className="mt-6 flex gap-3">
                <button onClick={() => setStep(1)} className="btn-secondary flex-1">
                  Quay lại
                </button>
                <button onClick={() => setStep(3)} className="btn-primary flex-1">
                  Tiếp tục
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Images */}
          {step === 3 && (
            <div className="card p-6">
              <h2 className="mb-4 text-lg font-bold text-neutral-900">Hình ảnh minh chứng</h2>
              <p className="mb-4 text-sm text-neutral-600">
                Tải lên hình ảnh sản phẩm, bao bì, tem QR, hoá đơn mua hàng... để giúp xác minh
              </p>
              
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-neutral-300 bg-neutral-50 p-8 transition hover:border-brand-red-400 hover:bg-brand-red-50">
                <Upload size={32} className="text-neutral-400" />
                <span className="mt-2 text-sm font-medium text-neutral-600">
                  Click để tải ảnh hoặc kéo thả vào đây
                </span>
                <span className="text-xs text-neutral-400">Hỗ trợ JPG, PNG (tối đa 5MB/ảnh)</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>

              {uploadedImages.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
                  {uploadedImages.map((img, idx) => (
                    <div key={idx} className="relative aspect-square overflow-hidden rounded-lg border border-neutral-200">
                      <img src={img} alt={`Upload ${idx + 1}`} className="h-full w-full object-cover" />
                      <button
                        onClick={() => removeImage(idx)}
                        className="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 flex gap-3">
                <button onClick={() => setStep(2)} className="btn-secondary flex-1">
                  Quay lại
                </button>
                <button onClick={() => setStep(4)} className="btn-primary flex-1">
                  Tiếp tục
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Contact Info */}
          {step === 4 && (
            <div className="card p-6">
              <h2 className="mb-4 text-lg font-bold text-neutral-900">Thông tin liên hệ</h2>
              <p className="mb-4 text-sm text-neutral-600">
                Chúng tôi sẽ liên hệ với bạn để cập nhật kết quả xử lý
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-neutral-700">Họ và tên *</label>
                  <input
                    type="text"
                    value={contactInfo.name}
                    onChange={(e) => setContactInfo({ ...contactInfo, name: e.target.value })}
                    className="input mt-1"
                    placeholder="Nguyễn Văn A"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700">Số điện thoại *</label>
                  <input
                    type="tel"
                    value={contactInfo.phone}
                    onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                    className="input mt-1"
                    placeholder="0901234567"
                    pattern="[0-9]{10,11}"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-neutral-700">Email (tuỳ chọn)</label>
                  <input
                    type="email"
                    value={contactInfo.email}
                    onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                    className="input mt-1"
                    placeholder="example@email.com"
                  />
                </div>
              </div>

              <div className="mt-6 rounded-lg bg-neutral-50 p-4">
                <h3 className="mb-2 text-sm font-semibold text-neutral-900">Cam kết bảo mật</h3>
                <ul className="space-y-1 text-xs text-neutral-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle size={14} className="mt-0.5 text-emerald-500" />
                    Thông tin cá nhân được bảo mật tuyệt đối
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle size={14} className="mt-0.5 text-emerald-500" />
                    Chỉ sử dụng để liên hệ về báo cáo này
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle size={14} className="mt-0.5 text-emerald-500" />
                    Không chia sẻ với bên thứ ba
                  </li>
                </ul>
              </div>

              <div className="mt-6 flex gap-3">
                <button onClick={() => setStep(3)} className="btn-secondary flex-1">
                  Quay lại
                </button>
                <button onClick={handleSubmit} className="btn-primary flex-1">
                  Gửi báo cáo
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Info Section */}
      <section className="border-t border-neutral-200 bg-white">
        <div className="container-acf py-8">
          <h2 className="mb-4 text-lg font-bold text-neutral-900">Quy trình xử lý báo cáo</h2>
          <div className="grid gap-4 sm:grid-cols-4">
            {[
              { icon: FileText, title: "Tiếp nhận", desc: "Báo cáo được ghi nhận và phân loại" },
              { icon: ShieldCheck, title: "Xác minh", desc: "Đối chiếu với CSDL chính hãng" },
              { icon: AlertTriangle, title: "Điều tra", desc: "Phối hợp cơ quan chức năng nếu cần" },
              { icon: CheckCircle, title: "Kết luận", desc: "Thông báo kết quả cho người báo cáo" },
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-red-100 text-brand-red-600">
                  <item.icon size={24} />
                </div>
                <h3 className="text-sm font-semibold text-neutral-900">{item.title}</h3>
                <p className="mt-1 text-xs text-neutral-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Support */}
      <section className="container-acf py-8">
        <div className="rounded-xl bg-neutral-100 p-6">
          <h2 className="mb-4 text-lg font-bold text-neutral-900">Cần hỗ trợ thêm?</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <a href="tel:19001234" className="flex items-center gap-3 rounded-lg bg-white p-4 transition hover:shadow">
              <Phone size={20} className="text-brand-red-500" />
              <div>
                <div className="text-sm font-semibold text-neutral-900">Hotline</div>
                <div className="text-xs text-neutral-600">1900 1234 (Miễn phí)</div>
              </div>
            </a>
            <a href="mailto:hotline@acfmart.vn" className="flex items-center gap-3 rounded-lg bg-white p-4 transition hover:shadow">
              <Mail size={20} className="text-brand-red-500" />
              <div>
                <div className="text-sm font-semibold text-neutral-900">Email</div>
                <div className="text-xs text-neutral-600">hotline@acfmart.vn</div>
              </div>
            </a>
            <Link to="/qr-verify" className="flex items-center gap-3 rounded-lg bg-white p-4 transition hover:shadow">
              <ShieldCheck size={20} className="text-brand-red-500" />
              <div>
                <div className="text-sm font-semibold text-neutral-900">Kiểm tra QR</div>
                <div className="text-xs text-neutral-600">Xác thực sản phẩm</div>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
