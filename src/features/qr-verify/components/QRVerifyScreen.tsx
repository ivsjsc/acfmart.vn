import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Camera, Scan, ShieldCheck, AlertTriangle, X, CheckCircle, Clock, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'
import { QRVerificationService } from '../qr-service'
import { cn } from '../../../lib/cn'
import { formatDateTime } from '../../../lib/format'

interface VerificationResult {
  isValid: boolean
  qrCode?: string
  productId: string
  productName: string
  brand: string
  manufacturingDate: string
  batchNumber: string
  isCounterfeit: boolean
  authenticityScore: number
  verificationDate: string
  additionalInfo?: string
  source?: "backend" | "offline"
}

export default function QRVerifyScreen() {
  const navigate = useNavigate()
  const [isScanning, setIsScanning] = useState(false)
  const [manualInput, setManualInput] = useState('')
  const [result, setResult] = useState<VerificationResult | null>(null)
  const [loading, setLoading] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setIsScanning(true)
      }
    } catch (err) {
      console.error('Error accessing camera:', err)
      toast.error('Không thể truy cập camera. Vui lòng kiểm tra quyền.')
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setIsScanning(false)
  }

  const handleScan = async () => {
    if (!isScanning) {
      startCamera()
    } else {
      stopCamera()
    }
  }

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!manualInput.trim()) return

    await verifyQRCode(manualInput)
  }

  const verifyQRCode = async (qrCode: string) => {
    setLoading(true)
    setResult(null)
    
    try {
      const verificationResult = await QRVerificationService.verifyProduct(qrCode)
      setResult(verificationResult)
      
      if (verificationResult.isCounterfeit) {
        toast.error('Sản phẩm này có thể là hàng giả!')
      } else if (verificationResult.source === "offline") {
        toast("Backend chưa kết nối. Kết quả đang ở chế độ tạm thời.", {
          icon: "!",
        })
      } else if (verificationResult.authenticityScore < 80) {
        toast(verificationResult.additionalInfo || 'Sản phẩm có thể không chính hãng', {
          icon: '⚠️',
        })
      } else {
        toast.success('Sản phẩm chính hãng!')
      }
    } catch (error) {
      console.error('Verification error:', error)
      toast.error(error instanceof Error ? error.message : 'Lỗi xác thực QR')
    } finally {
      setLoading(false)
      stopCamera()
    }
  }

  const handleAddToCabinet = () => {
    if (result) {
      QRVerificationService.addToCabinet(result.qrCode || result.productId, 'Xác thực qua QR')
      toast.success('Đã thêm vào tủ xác thực')
    }
  }

  const handleReportCounterfeit = () => {
    if (result) {
      navigate('/report-counterfeit', { state: { qrCode: result.qrCode || result.productId, productName: result.productName } })
    }
  }

  return (
    <div className="container-acf py-4 lg:py-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-neutral-900">Xác thực QR</h1>
          <p className="text-sm text-neutral-600">
            Quét mã QR trên sản phẩm để xác minh tính chính hãng
          </p>
        </div>

        {/* Scanner card */}
        <div className="card overflow-hidden">
          <div className="p-5 border-b border-neutral-200 bg-gradient-to-r from-brand-red-50 to-brand-gold-50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-brand-red-500 text-white">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h2 className="font-bold text-neutral-900">Xác thực sản phẩm chính hãng</h2>
                <p className="text-xs text-neutral-600">
                  Quét QR để kiểm tra nguồn gốc, ngăn chặn hàng giả
                </p>
              </div>
            </div>
          </div>

          <div className="p-5">
            {/* Camera preview */}
            {isScanning && (
              <div className="relative mb-4">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted
                  className="w-full h-64 rounded-lg bg-black object-contain"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="border-2 border-brand-red-500 w-64 h-64 rounded-lg" />
                </div>
                <button
                  onClick={stopCamera}
                  className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-full"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Manual input */}
            <form onSubmit={handleManualSubmit} className="mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  placeholder="Dán mã QR hoặc nhập thủ công"
                  className="flex-1 input"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !manualInput.trim()}
                  className="btn-primary"
                >
                  {loading ? 'Đang xác thực...' : 'Xác thực'}
                </button>
              </div>
            </form>

            {/* Scan button */}
            <button
              onClick={handleScan}
              className={cn(
                'w-full flex items-center justify-center gap-2 py-3 rounded-lg border text-sm font-medium',
                isScanning 
                  ? 'border-rose-300 bg-rose-50 text-rose-700' 
                  : 'border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50'
              )}
            >
              {isScanning ? (
                <>
                  <X size={18} /> Dừng quét
                </>
              ) : (
                <>
                  <Camera size={18} /> Quét bằng camera
                </>
              )}
            </button>

            <p className="mt-3 text-xs text-neutral-500 text-center">
              QR code thường nằm trên bao bì sản phẩm hoặc trong tem chống giả
            </p>
          </div>
        </div>

        {/* Result */}
        {result && (
          <div className="card mt-4 overflow-hidden">
            <div className={cn(
              "p-4 border-b",
              result.isCounterfeit 
                ? 'bg-rose-50 border-rose-200' 
                : result.authenticityScore < 80 
                  ? 'bg-amber-50 border-amber-200' 
                  : 'bg-emerald-50 border-emerald-200'
            )}>
              <div className="flex items-center gap-3">
                {result.isCounterfeit ? (
                  <AlertTriangle className="text-rose-600" size={24} />
                ) : result.authenticityScore < 80 ? (
                  <AlertTriangle className="text-amber-600" size={24} />
                ) : (
                  <CheckCircle className="text-emerald-600" size={24} />
                )}
                <div>
                  <h3 className="font-bold text-neutral-900">
                    {result.isCounterfeit 
                      ? 'Sản phẩm nghi vấn hàng giả' 
                      : result.authenticityScore < 80
                        ? 'Độ chính hãng thấp'
                        : 'Sản phẩm chính hãng'}
                  </h3>
                  <p className="text-xs text-neutral-600">
                    Xác thực lúc: {formatDateTime(result.verificationDate)}
                  </p>
                  {result.source === "offline" && (
                    <p className="mt-1 text-xs font-medium text-amber-700">
                      Chế độ tạm thời - cần backend để đối soát chính thức
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-neutral-500">Tên sản phẩm</div>
                  <div className="font-medium">{result.productName}</div>
                </div>
                <div>
                  <div className="text-xs text-neutral-500">Thương hiệu</div>
                  <div className="font-medium">{result.brand}</div>
                </div>
                <div>
                  <div className="text-xs text-neutral-500">Mã sản phẩm</div>
                  <div className="font-mono text-sm">{result.productId}</div>
                </div>
                <div>
                  <div className="text-xs text-neutral-500">Lô sản xuất</div>
                  <div className="font-mono text-sm">{result.batchNumber}</div>
                </div>
              </div>

              <div>
                <div className="text-xs text-neutral-500">Độ chính hãng</div>
                <div className="mt-1 w-full bg-neutral-200 rounded-full h-2">
                  <div 
                    className={cn(
                      "h-2 rounded-full",
                      result.authenticityScore < 50 
                        ? 'bg-rose-500' 
                        : result.authenticityScore < 80 
                          ? 'bg-amber-500' 
                          : 'bg-emerald-500'
                    )}
                    style={{ width: `${result.authenticityScore}%` }}
                  ></div>
                </div>
                <div className="text-right text-xs mt-1">
                  {result.authenticityScore}% xác thực chính hãng
                </div>
              </div>

              {result.additionalInfo && (
                <div className={cn(
                  "p-3 rounded-lg text-sm",
                  result.isCounterfeit 
                    ? 'bg-rose-100 text-rose-700' 
                    : result.authenticityScore < 80
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-emerald-100 text-emerald-700'
                )}>
                  {result.additionalInfo}
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  onClick={handleAddToCabinet}
                  className="btn-primary flex-1 justify-center"
                >
                  <ShieldCheck size={16} />
                  Thêm vào tủ xác thực
                </button>
                
                {result.isCounterfeit && (
                  <button
                    onClick={handleReportCounterfeit}
                    className="btn-secondary flex-1 justify-center"
                  >
                    <AlertTriangle size={16} />
                    Báo cáo hàng giả
                  </button>
                )}
                
                <Link 
                  to={`/products/${result.productId}`} 
                  className="btn-secondary flex-1 justify-center"
                >
                  <ExternalLink size={16} />
                  Xem sản phẩm
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="mt-6 card p-5">
          <h3 className="font-bold text-neutral-900 mb-3">Mẹo xác thực sản phẩm</h3>
          <ul className="space-y-2 text-sm text-neutral-600">
            <li className="flex items-start gap-2">
              <Scan className="text-brand-red-500 mt-0.5 flex-shrink-0" size={16} />
              <span>Luôn quét mã QR trên bao bì gốc của sản phẩm</span>
            </li>
            <li className="flex items-start gap-2">
              <ShieldCheck className="text-brand-red-500 mt-0.5 flex-shrink-0" size={16} />
              <span>Kiểm tra độ chính hãng trước khi thanh toán</span>
            </li>
            <li className="flex items-start gap-2">
              <Clock className="text-brand-red-500 mt-0.5 flex-shrink-0" size={16} />
              <span>Lưu trữ kết quả xác thực trong "Tủ xác thực cá nhân"</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
