import { Logo, LogoSquare } from "../components/Logo"
import { ShieldCheck, Truck, Headphones, Award } from "lucide-react"

export function Footer() {
  return (
    <footer className="mt-16 border-t border-neutral-200 bg-white">
      {/* Trust strip */}
      <div className="border-b border-neutral-100 bg-gradient-to-r from-brand-red-50 via-white to-brand-gold-50">
        <div className="container-acf grid grid-cols-2 gap-4 py-6 md:grid-cols-4">
          {[
            {
              icon: ShieldCheck,
              title: "100% chính hãng",
              desc: "Xác thực QR + Quỹ chống hàng giả",
            },
            {
              icon: Truck,
              title: "Giao hàng nhanh",
              desc: "2-4 ngày toàn quốc",
            },
            {
              icon: Award,
              title: "Đổi trả 7 ngày",
              desc: "Miễn phí với hàng lỗi",
            },
            {
              icon: Headphones,
              title: "Hỗ trợ 24/7",
              desc: "Tổng đài tiếng Việt",
            },
          ].map((f) => (
            <div key={f.title} className="flex items-start gap-3">
              <div className="rounded-lg bg-brand-red-100 p-2 text-brand-red-600">
                <f.icon size={20} />
              </div>
              <div>
                <div className="text-sm font-semibold text-neutral-900">
                  {f.title}
                </div>
                <div className="text-xs text-neutral-600">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="container-acf py-10">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <LogoSquare size="lg" />
            <p className="mt-3 text-sm text-neutral-600">
              Sàn TMĐT chống hàng giả – sản phẩm của Quỹ Chống Hàng Giả Việt
              Nam, nơi mọi sản phẩm đều được xác thực nguồn gốc.
            </p>
          </div>
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-sm font-semibold text-neutral-900">Giới thiệu</h3>
            <ul className="mt-3 space-y-2">
              <li className="text-sm text-neutral-600">Giới thiệu về chúng tôi</li>
              <li className="text-sm text-neutral-600">Liên hệ</li>
              <li className="text-sm text-neutral-600">Tuyển dụng</li>
              <li className="text-sm text-neutral-600">Điều khoản sử dụng</li>
              <li className="text-sm text-neutral-600">Chính sách bảo mật</li>
            </ul>
          </div>
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-sm font-semibold text-neutral-900">Hỗ trợ</h3>
            <ul className="mt-3 space-y-2">
              <li className="text-sm text-neutral-600">Hướng dẫn mua hàng</li>
              <li className="text-sm text-neutral-600">Hướng dẫn thanh toán</li>
              <li className="text-sm text-neutral-600">Hướng dẫn giao nhận</li>
              <li className="text-sm text-neutral-600">Hướng dẫn đổi trả</li>
              <li className="text-sm text-neutral-600">Hướng dẫn bảo hành</li>
            </ul>
          </div>
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-sm font-semibold text-neutral-900">Liên hệ</h3>
            <ul className="mt-3 space-y-2">
              <li className="text-sm text-neutral-600">Hotline: 1900 1234</li>
              <li className="text-sm text-neutral-600">Email: support@san.com</li>
              <li className="text-sm text-neutral-600">Địa chỉ: 123 Đường ABC, Quận XYZ, TP.HCM</li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  )
}
