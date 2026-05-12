import { Camera, Scan, ShieldCheck, AlertTriangle, X, CheckCircle, Clock, ExternalLink } from 'lucide-react'
import { LogoSquare } from '../../../components/Logo'
import { useState, useRef } from 'react'

export default function QRVerifyScreen() {
  const [isScanning, setIsScanning] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const handleScan = () => {
    setIsScanning(!isScanning)
    // TODO: Implement actual QR scanning logic
  }

  return (
    <div className="container-acf py-4 lg:py-6">
      <div className="mb-6 flex items-center justify-center">
        <LogoSquare size="lg" />
      </div>
      
      <div className="card mb-6 p-5">
        <h2 className="mb-4 text-xl font-bold text-neutral-900">Quét mã QR để xác thực sản phẩm</h2>
        <p className="text-sm text-neutral-600 mb-6">
          Dùng camera để quét mã QR trên bao bì sản phẩm để kiểm tra xem có phải hàng chính hãng hay không
        </p>
        
        <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100">
          {isScanning ? (
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          ) : (
            <div className="flex items-center justify-center w-full h-full">
              <div className="text-center">
                <Camera size={64} className="text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Bật camera để bắt đầu quét</p>
              </div>
            </div>
          )}
          
          <button
            onClick={handleScan}
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-full p-3 shadow-lg hover:bg-gray-50 transition-colors"
          >
            {isScanning ? <X size={24} /> : <Scan size={24} />}
          </button>
        </div>
      </div>
    </div>
  )
}