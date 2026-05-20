import { Header } from '@/components/shop/Header';

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>{children}</main>
      <footer className="bg-gray-900 text-gray-400 py-12 mt-16">
        <div className="container-acf">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-[#E31937] rounded-lg flex items-center justify-center">
                  <span className="text-white font-black">A</span>
                </div>
                <span className="text-white font-bold text-lg">ACFMart</span>
              </div>
              <p className="text-sm leading-relaxed">
                Nền tảng thương mại điện tử chống hàng giả hàng đầu Việt Nam.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Hỗ trợ khách hàng</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Trung tâm hỗ trợ</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Chính sách hoàn trả</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Hướng dẫn mua hàng</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Xác thực QR</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Về ACFMart</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Về chúng tôi</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Tuyển dụng</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Tin tức</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Liên hệ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Kết nối với chúng tôi</h4>
              <div className="flex gap-3">
                {['Facebook', 'Zalo', 'TikTok', 'YouTube'].map((social) => (
                  <a key={social} href="#" className="w-8 h-8 bg-gray-700 hover:bg-[#E31937] rounded-full flex items-center justify-center transition-colors text-xs font-bold text-white">
                    {social[0]}
                  </a>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row justify-between text-sm">
            <p>© 2025 ACFMart - Quỹ Chống Hàng Giả Việt Nam. All rights reserved.</p>
            <p>Phát triển bởi <a href="https://ivsacademy.edu.vn" className="text-[#E31937] hover:underline">IVS JSC</a></p>
          </div>
        </div>
      </footer>
    </div>
  );
}
