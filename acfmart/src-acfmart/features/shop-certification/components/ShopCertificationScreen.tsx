import { LogoSquare } from "../../../components/Logo"
import { ShieldCheck, AlertTriangle, CheckCircle, Clock, Users } from "lucide-react"

export default function ShopCertificationScreen() {
  return (
    <div className="container-acf py-8 lg:py-12">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-center">
          <LogoSquare size="lg" />
        </div>
        
        <div className="card p-6">
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Chứng nhận Shop</h1>
          <p className="text-neutral-600 mb-6">
            Tính năng Chứng nhận Shop đang được phát triển trong Phase 3. Cho phép người bán đăng ký xác minh để trở thành shop được chứng nhận chính hãng.
          </p>
          
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
            <div className="flex items-start">
              <AlertTriangle className="text-yellow-500 mt-0.5 mr-2" size={20} />
              <div>
                <h3 className="font-bold text-yellow-800">Thông báo</h3>
                <p className="text-yellow-700 text-sm">
                  Tính năng này sẽ được ra mắt trong thời gian tới. Hãy theo dõi trang chủ để cập nhật thông tin mới nhất.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}