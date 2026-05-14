import { Link } from "react-router-dom"
import { Logo } from "../components/Logo"
import { ShieldCheck, Truck, Headphones, Award } from "lucide-react"

export function Footer() {
  return (
    <footer className="mt-16 border-t border-neutral-200 bg-white pb-20 lg:pb-0">
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
            <Logo size="md" />
            <p className="mt-3 text-sm text-neutral-600">
              Sàn TMĐT chống hàng giả trực thuộc Quỹ Chống Hàng Giả ACF, nơi mọi sản phẩm đều được xác thực nguồn gốc.
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-bold text-neutral-900">
              Về nền tảng
            </h4>
            <ul className="space-y-2 text-sm text-neutral-600">
              <li>
                <Link to="/about" className="hover:text-brand-red-600">
                  Về chúng tôi
                </Link>
              </li>
              <li>
                <Link to="/seller-register" className="hover:text-brand-red-600">
                  Đăng ký bán hàng
                </Link>
              </li>
              <li>
                <Link to="http://kythuatchonghanggia.vn/" className="hover:text-brand-red-600">
                  Tin tức
                </Link>
              </li>
              <li>
                <Link to="https://qrcodeacf.web.app/" className="hover:text-brand-red-600">
                  Tạo & In QR ACF
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-bold text-neutral-900">
              Hỗ trợ
            </h4>
            <ul className="space-y-2 text-sm text-neutral-600">
              <li>
                <Link to="/help" className="hover:text-brand-red-600">
                  Trung tâm trợ giúp
                </Link>
              </li>
              <li>
                <Link to="/track-order" className="hover:text-brand-red-600">
                  Tra cứu đơn hàng
                </Link>
              </li>
              <li>
                <Link to="/report-counterfeit" className="hover:text-brand-red-600">
                  Báo cáo hàng giả
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-brand-red-600">
                  Liên hệ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-bold text-neutral-900">
              Pháp lý
            </h4>
            <ul className="space-y-2 text-sm text-neutral-600">
              <li>
                <Link to="/legal/terms" className="hover:text-brand-red-600">
                  Điều khoản sử dụng
                </Link>
              </li>
              <li>
                <Link to="/legal/privacy" className="hover:text-brand-red-600">
                  Chính sách bảo mật
                </Link>
              </li>
              <li>
                <Link to="/legal/return" className="hover:text-brand-red-600">
                  Chính sách đổi trả
                </Link>
              </li>
              <li>
                <Link to="/legal/shipping" className="hover:text-brand-red-600">
                  Chính sách vận chuyển
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-start justify-between gap-3 border-t border-neutral-100 pt-6 text-xs text-neutral-500 md:flex-row md:items-center">
          <div>
            © {new Date().getFullYear()} Công ty TNHH Đầu tư ACF. {" "}
            Vận hành bởi{" "}
            <a 
              href="https://ivsacademy.edu.vn" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-brand-red-600 hover:text-brand-red-700 underline"
            >
              IVS JSC
            </a>
            . Bảo trợ chuyên môn: Quỹ & Trung tâm Kỹ thuật Chống Hàng Giả ACF
          </div>
          <div className="flex items-center gap-3">
            <span>Thanh toán:</span>
            {["VNPay", "Momo", "ZaloPay", "VISA", "COD"].map((p) => (
              <span
                key={p}
                className="rounded border border-neutral-200 bg-white px-2 py-1 text-[10px] font-semibold"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}