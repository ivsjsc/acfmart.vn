import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AlertTriangle, Upload, ShieldCheck, CheckCircle2, X, FileText, Camera } from 'lucide-react'
import toast from 'react-hot-toast'
import { QRVerificationService } from '../qr-service'
import { cn } from '../../../lib/cn'

interface ReportFormData {
  qrCode: string
  productName: string
  suspectReason: string
  additionalInfo: string
  images: string[]
}

export default function ReportCounterfeitScreen() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as { qrCode?: string; productName?: string } | undefined
  
  const [formData, setFormData] = useState<ReportFormData>({
    qrCode: state?.qrCode || '',
    productName: state?.productName || '',
    suspectReason: '',
    additionalInfo: '',
    images: []
  })
  
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      // In a real app, we would upload the images to a server
      // For now, we'll just store a placeholder
      const newImages = Array.from(e.target.files).map(file => URL.createObjectURL(file))
      setFormData(prev => ({ ...prev, images: [...prev.images, ...newImages] }))
    }
  }

  const removeImage = (index: number) => {
    setFormData(prev => {
      const newImages = [...prev.images]
      newImages.splice(index, 1)
      return { ...prev, images: newImages }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.qrCode || !formData.suspectReason) {
      toast.error('Vui lòng điền các trường bắt buộc')
      return
    }
    
    setLoading(true)
    
    try {
      // Submit the report
      const success = await QRVerificationService.reportCounterfeit(
        formData.qrCode,
        formData.suspectReason + '\n' + formData.additionalInfo
      )
      
      if (success) {
        setSubmitted(true)
        toast.success('Báo cáo đã được gửi thành công!')
        
        // Redirect after delay
        setTimeout(() => {
          navigate('/')
        }, 3000)
      } else {
        toast.error('Có lỗi xảy ra khi gửi báo cáo')
      }
    } catch (error) {
      console.error('Error submitting report:', error)
      toast.error('Có lỗi xảy ra khi gửi báo cáo')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="container-acf py-12">
        <div className="max-w-lg mx-auto text-center">
          <div className="inline-flex items-center justify-center p-4 rounded-full bg-emerald-100 text-emerald-600 mb-6">
            <CheckCircle2 size={48} />
          </div>
          
          <h1 className="text-2xl font-bold text-neutral-900 mb-3">Cảm ơn báo cáo của bạn!</h1>
          <p className="text-neutral-600 mb-6">
            Báo cáo hàng giả về mã QR <span className="font-mono">{formData.qrCode}</span> đã được gửi đến đội ngũ chuyên gia của Quỹ Chống Hàng Giả Việt Nam.
          </p>
          
          <div className="card p-4 text-left">
            <h3 className="font-bold text-neutral-900 mb-2">Tiếp theo:</h3>
            <ul className="space-y-2 text-sm text-neutral-600">
              <li className="flex items-start gap-2">
                <div className="mt-0.5 w-4 h-4 rounded-full bg-brand-red-100 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-brand-red-500"></div>
                </div>
                <span>Chuyên gia sẽ xem xét báo cáo trong vòng 24-48h</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="mt-0.5 w-4 h-4 rounded-full bg-brand-red-100 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-brand-red-500"></div>
                </div>
                <span>Bạn sẽ nhận được phản hồi qua email hoặc tin nhắn</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="mt-0.5 w-4 h-4 rounded-full bg-brand-red-100 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-brand-red-500"></div>
                </div>
                <span>Nếu xác nhận là hàng giả, sản phẩm sẽ được cảnh báo rộng rãi</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container-acf py-4 lg:py-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-neutral-900">Báo cáo hàng giả</h1>
          <p className="text-sm text-neutral-600">
            Giúp cộng đồng tránh xa hàng giả bằng cách báo cáo sản phẩm nghi vấn
          </p>
        </div>

        <div className="card overflow-hidden">
          <div className="p-5 border-b border-neutral-200 bg-gradient-to-r from-rose-50 to-amber-50">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-rose-600 mt-0.5" size={20} />
              <div>
                <h2 className="font-bold text-neutral-900">Tầm quan trọng của báo cáo</h2>
                <p className="text-xs text-neutral-600 mt-1">
                  Mỗi báo cáo của bạn giúp bảo vệ hàng ngàn người tiêu dùng khác khỏi hàng giả.
                  Dữ liệu của bạn sẽ được xử lý bởi chuyên gia của Quỹ Chống Hàng Giả Việt Nam.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-5">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Mã QR sản phẩm <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="qrCode"
                value={formData.qrCode}
                onChange={handleChange}
                placeholder="Dán hoặc nhập mã QR của sản phẩm nghi vấn"
                className="w-full input"
                required
              />
              <p className="mt-1 text-xs text-neutral-500">
                Mã QR thường nằm trên bao bì hoặc trong tem chống giả của sản phẩm
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Tên sản phẩm
              </label>
              <input
                type="text"
                name="productName"
                value={formData.productName}
                onChange={handleChange}
                placeholder="Tên sản phẩm nghi vấn (nếu biết)"
                className="w-full input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Lý do nghi vấn hàng giả <span className="text-rose-500">*</span>
              </label>
              <select
                name="suspectReason"
                value={formData.suspectReason}
                onChange={handleChange}
                className="w-full input"
                required
              >
                <option value="">Chọn lý do nghi vấn</option>
                <option value="packaging_poor_quality">Bao bì in ấn kém chất lượng</option>
                <option value="price_suspiciously_low">Giá quá rẻ so với thị trường</option>
                <option value="product_quality_bad">Chất lượng sản phẩm kém</option>
                <option value="qr_not_recognized">Mã QR không được công nhận</option>
                <option value="different_from_original">Khác biệt so với sản phẩm gốc</option>
                <option value="other">Lý do khác</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Hình ảnh minh họa (tùy chọn)
              </label>
              <div className="space-y-3">
                <label className="flex items-center gap-2 p-4 border-2 border-dashed border-neutral-300 rounded-lg cursor-pointer hover:bg-neutral-50">
                  <Upload className="text-neutral-400" size={20} />
                  <span className="text-sm text-neutral-600">Tải lên hình ảnh sản phẩm nghi vấn</span>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*" 
                    multiple 
                    onChange={handleImageUpload}
                  />
                </label>
                
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {formData.images.map((img, index) => (
                      <div key={index} className="relative group">
                        <img 
                          src={img} 
                          alt={`Preview ${index}`} 
                          className="w-full h-20 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Thông tin bổ sung
              </label>
              <textarea
                name="additionalInfo"
                value={formData.additionalInfo}
                onChange={handleChange}
                placeholder="Mô tả thêm về lý do bạn nghi vấn sản phẩm này là hàng giả..."
                rows={4}
                className="w-full input"
              />
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex-1 justify-center"
              >
                {loading ? 'Đang gửi...' : 'Gửi báo cáo'}
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="btn-secondary flex-1 justify-center"
              >
                Huỷ
              </button>
            </div>
          </form>
        </div>

        <div className="card p-5 mt-6">
          <h3 className="font-bold text-neutral-900 mb-3 flex items-center gap-2">
            <ShieldCheck className="text-brand-gold-500" size={18} />
            Quy trình xử lý báo cáo
          </h3>
          <ol className="space-y-3 text-sm text-neutral-600">
            <li className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5 w-6 h-6 rounded-full bg-brand-red-100 flex items-center justify-center text-xs font-bold text-brand-red-600">1</div>
              <span>Chuyên gia nhận và phân tích báo cáo của bạn</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5 w-6 h-6 rounded-full bg-brand-red-100 flex items-center justify-center text-xs font-bold text-brand-red-600">2</div>
              <span>Thực hiện xác minh độc lập về sản phẩm nghi vấn</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5 w-6 h-6 rounded-full bg-brand-red-100 flex items-center justify-center text-xs font-bold text-brand-red-600">3</div>
              <span>Cập nhật trạng thái xác minh và thông báo cho người dùng</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5 w-6 h-6 rounded-full bg-brand-red-100 flex items-center justify-center text-xs font-bold text-brand-red-600">4</div>
              <span>Cảnh báo cộng đồng nếu xác nhận là hàng giả</span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  )
}