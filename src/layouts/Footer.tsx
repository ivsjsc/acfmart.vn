import { Link } from "react-router-dom"
import { Logo } from "../components/Logo"
import { ShieldCheck, Truck, Headphones, Award } from "lucide-react"
import { ACFMART_LEGAL_DISPLAY } from "../lib/legal-profile"

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
              Sàn TMĐT chống hàng giả do ACFMart JSC sở hữu và vận hành, kết hợp xác thực nguồn gốc cùng hệ sinh thái ACF.
            </p>
            <div className="mt-4 flex gap-3">
              <a 
                href="https://fb.com/acfmart" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-neutral-600 hover:text-brand-red-600"
                aria-label="Facebook của ACFMart"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12z"/>
                </svg>
              </a>
              <a 
                href="https://www.linkedin.com/company/acfmart" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-neutral-600 hover:text-brand-red-600"
                aria-label="LinkedIn của ACFMart"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>
            </div>
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
                <Link to="/seller-channel" className="hover:text-brand-red-600">
                  Đăng ký bán hàng
                </Link>
              </li>
              <li>
                <Link to="http://kythuatchonghanggia.vn/" className="hover:text-brand-red-600">
                  Tin tức
                </Link>
              </li>
              <li>
                <Link to="https://qrverifiedbyivs.web.app/" className="hover:text-brand-red-600">
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
                <Link to="/legal/data-protection" className="hover:text-brand-red-600">
                  Bảo vệ dữ liệu cá nhân
                </Link>
              </li>
              <li>
                <Link to="/legal/payment" className="hover:text-brand-red-600">
                  Chính sách thanh toán
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
              <li>
                <Link to="/legal/seller-terms" className="hover:text-brand-red-600">
                  Điều khoản người bán
                </Link>
              </li>
              <li>
                <Link to="/legal/seller-fees" className="hover:text-brand-red-600">
                  Chính sách phí người bán
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-start justify-between gap-3 border-t border-neutral-100 pt-6 text-xs text-neutral-500 md:flex-row md:items-center">
          <div>
            © {new Date().getFullYear()} {ACFMART_LEGAL_DISPLAY}
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
