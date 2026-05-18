import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { Navigation, Package, CheckCircle2, Clock, XCircle, MapPin } from "lucide-react"
import { ShippingService, type TrackingInfo } from "../../../lib/shipping-service"
import { formatDateTime } from "../../../lib/format"

export default function TrackOrderScreen() {
  const [searchParams] = useSearchParams()
  const [trackingNumber, setTrackingNumber] = useState(searchParams.get('tracking') || '')
  const [trackingInfo, setTrackingInfo] = useState<TrackingInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (trackingNumber) {
      lookupTracking()
    }
  }, [trackingNumber])

  const lookupTracking = async () => {
    if (!trackingNumber.trim()) {
      setError('Vui lòng nhập mã vận đơn')
      return
    }

    setLoading(true)
    setError('')

    try {
      const result = await ShippingService.trackShipment(trackingNumber.trim())
      if (!result) {
        setError('Không tìm thấy thông tin vận đơn. Vui lòng kiểm tra lại mã.')
        setTrackingInfo(null)
      } else {
        setTrackingInfo(result)
      }
    } catch (err) {
      setError('Không thể tra cứu mã vận đơn. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'delivered': return <CheckCircle2 size={18} className="text-emerald-600" />
      case 'out_for_delivery': return <Navigation size={18} className="text-blue-600" />
      case 'in_transit': return <Package size={18} className="text-amber-600" />
      case 'picked_up': return <CheckCircle2 size={18} className="text-blue-600" />
      case 'pending': return <Clock size={18} className="text-neutral-500" />
      case 'returned': 
      case 'lost': return <XCircle size={18} className="text-rose-600" />
      default: return <Clock size={18} className="text-neutral-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'delivered': return 'text-emerald-600'
      case 'out_for_delivery': return 'text-blue-600'
      case 'in_transit': return 'text-amber-600'
      case 'picked_up': return 'text-blue-600'
      case 'pending': return 'text-neutral-500'
      case 'returned': 
      case 'lost': return 'text-rose-600'
      default: return 'text-neutral-500'
    }
  }

  return (
    <div className="container-acf py-4 lg:py-6">
      <h1 className="mb-6 text-2xl font-bold text-neutral-900">Theo dõi đơn hàng</h1>

      <div className="card mb-6 p-5">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            placeholder="Nhập mã vận đơn (VD: GHN123456789)"
            className="flex-1 input"
            onKeyPress={(e) => e.key === 'Enter' && lookupTracking()}
          />
          <button
            onClick={lookupTracking}
            disabled={loading}
            className="btn-primary whitespace-nowrap"
          >
            {loading ? 'Đang tra cứu...' : 'Tra cứu'}
          </button>
        </div>
        {error && <p className="mt-2 text-sm text-rose-600">{error}</p>}
      </div>

      {trackingInfo && (
        <div className="card overflow-hidden">
          <div className="bg-gradient-to-r from-brand-red-500 to-brand-red-700 p-5 text-white">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-sm text-white/90">Mã vận đơn</div>
                <div className="mt-1 text-2xl font-bold">{trackingInfo.trackingNumber}</div>
              </div>
              <div>
                <div className="text-sm text-white/90">Đơn vị vận chuyển</div>
                <div className="mt-1 text-lg font-bold">{trackingInfo.provider}</div>
              </div>
              <div>
                <div className="text-sm text-white/90">Trạng thái</div>
                <div className="mt-1 text-lg font-bold">{trackingInfo.statusDescription}</div>
              </div>
            </div>
          </div>

          <div className="p-5">
            <h2 className="mb-4 text-lg font-bold text-neutral-900">Lịch trình vận chuyển</h2>
            
            <div className="relative">
              {/* Vertical timeline line */}
              <div className="absolute left-4 top-0 h-full w-0.5 bg-neutral-200 md:left-8" />
              
              <div className="space-y-6">
                {trackingInfo.progress.map((step: any, index: number) => (
                  <div key={index} className="relative flex items-start gap-3">
                    {/* Status icon */}
                    <div className={`
                      absolute flex h-8 w-8 items-center justify-center rounded-full border-4 border-white
                      bg-white
                    `}>
                      {getStatusIcon(step.status)}
                    </div>
                    
                    {/* Content */}
                    <div className="ml-12 flex-1 pt-1 md:ml-16">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <h3 className={`text-base font-semibold ${getStatusColor(step.status)}`}>
                          {step.description}
                        </h3>
                        <span className="text-xs text-neutral-500">
                          {formatDateTime(step.timestamp)}
                        </span>
                      </div>
                      
                      <div className="mt-1 flex items-center gap-2 text-sm text-neutral-600">
                        <MapPin size={12} />
                        <span>{step.location}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {!trackingInfo && !loading && (
        <div className="card flex flex-col items-center justify-center py-12 text-center">
          <Navigation size={48} className="text-neutral-300" />
          <h2 className="mt-4 text-lg font-semibold text-neutral-900">Nhập mã vận đơn để theo dõi</h2>
          <p className="mt-2 text-sm text-neutral-600">
            Bạn có thể tìm thấy mã vận đơn trong email xác nhận hoặc trong chi tiết đơn hàng
          </p>
        </div>
      )}
    </div>
  )
}
