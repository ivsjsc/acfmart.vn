import { HeroBanner } from '@/components/shop/HeroBanner';
import { CategoryGrid } from '@/components/shop/CategoryGrid';
import { ProductCard } from '@/components/shop/ProductCard';
import { Shield, QrCode, Store, CheckCircle, TrendingUp, Truck } from 'lucide-react';

// Danh mục sidebar
const sidebarCategories = [
  { name: 'Điện thoại & Máy tính', icon: '📱', count: 856, slug: 'dien-thoai' },
  { name: 'Thời trang nam', icon: '👔', count: 1243, slug: 'thoi-trang-nam' },
  { name: 'Thời trang nữ', icon: '👗', count: 1567, slug: 'thoi-trang-nu' },
  { name: 'Mỹ phẩm & Làm đẹp', icon: '💄', count: 943, slug: 'my-pham' },
  { name: 'Nhà cửa & Đời sống', icon: '🏠', count: 512, slug: 'nha-cua' },
  { name: 'Thể thao & Du lịch', icon: '⚽', count: 387, slug: 'the-thao' },
  { name: 'Sức khỏe & Dinh dưỡng', icon: '🌿', count: 268, slug: 'suc-khoe' },
  { name: 'Đồ chơi & Trẻ em', icon: '🧸', count: 431, slug: 'do-choi' },
  { name: 'Thực phẩm sạch', icon: '🥗', count: 198, slug: 'thuc-pham' },
  { name: 'Điện gia dụng', icon: '🔌', count: 723, slug: 'dien-gia-dung' },
];

// Mock sản phẩm nổi bật
const mockProducts = [
  { id: '1', name: 'iPhone 16 Pro Max 256GB Chính Hãng VN/A', price: 29990000, comparePrice: 34990000, thumbnail: 'https://picsum.photos/seed/iphone16/400/400', rating: 4.9, reviewCount: 1243, soldCount: 5678, shopName: 'Apple Store VN', isVerified: true },
  { id: '2', name: 'Samsung Galaxy S24 Ultra 512GB Titanium Black', price: 26990000, comparePrice: 31990000, thumbnail: 'https://picsum.photos/seed/samsung24/400/400', rating: 4.8, reviewCount: 856, soldCount: 3421, shopName: 'Samsung Official', isVerified: true },
  { id: '3', name: 'Kem dưỡng da Laneige Water Sleeping Mask 70ml', price: 450000, comparePrice: 590000, thumbnail: 'https://picsum.photos/seed/laneige/400/400', rating: 4.7, reviewCount: 2341, soldCount: 12456, shopName: 'Laneige VN', isVerified: true },
  { id: '4', name: 'Giày Nike Air Max 270 React Chính Hãng', price: 3200000, comparePrice: 4000000, thumbnail: 'https://picsum.photos/seed/nike270/400/400', rating: 4.6, reviewCount: 567, soldCount: 1890, shopName: 'Nike Vietnam', isVerified: true },
  { id: '5', name: 'Nồi cơm điện Panasonic SR-HL151 1.5L', price: 890000, comparePrice: 1190000, thumbnail: 'https://picsum.photos/seed/panasonic/400/400', rating: 4.5, reviewCount: 445, soldCount: 2567, shopName: 'Panasonic Official', isVerified: true },
  { id: '6', name: 'Đồng hồ Casio G-Shock GA-2100-1A1DR', price: 2890000, comparePrice: 3500000, thumbnail: 'https://picsum.photos/seed/casio/400/400', rating: 4.8, reviewCount: 789, soldCount: 1234, shopName: 'Casio VN Store', isVerified: true },
  { id: '7', name: 'Bộ dưỡng tóc TRESemmé Keratin Smooth 850ml', price: 189000, comparePrice: 245000, thumbnail: 'https://picsum.photos/seed/tresemme/400/400', rating: 4.4, reviewCount: 1567, soldCount: 8901, shopName: 'Unilever Official', isVerified: true },
  { id: '8', name: 'Chuột không dây Logitech MX Master 3S', price: 1890000, comparePrice: 2290000, thumbnail: 'https://picsum.photos/seed/logitech/400/400', rating: 4.9, reviewCount: 432, soldCount: 765, shopName: 'Logitech VN', isVerified: true },
];

export default function HomePage() {
  return (
    <div className="container-acf py-4">
      <div className="flex gap-6">
        {/* Sidebar trái — Danh mục */}
        <aside className="w-56 flex-shrink-0 hidden lg:block">
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden sticky top-24">
            <div className="bg-[#E31937] px-4 py-3">
              <h3 className="text-white font-bold text-sm">📋 Danh Mục Sản Phẩm</h3>
            </div>
            <ul className="py-1">
              {sidebarCategories.map((cat) => (
                <li key={cat.slug}>
                  <a
                    href={`/categories/${cat.slug}`}
                    className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-[#E31937] transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <span>{cat.icon}</span>
                      <span className="text-xs leading-tight">{cat.name}</span>
                    </span>
                    <span className="text-[10px] text-gray-400">{cat.count}</span>
                  </a>
                </li>
              ))}
              <li className="px-4 py-2 border-t">
                <a href="/categories" className="text-xs text-[#E31937] font-semibold hover:underline">
                  Xem tất cả →
                </a>
              </li>
            </ul>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          {/* Hero banner */}
          <HeroBanner />

          {/* Category icon grid */}
          <CategoryGrid />

          {/* Sản phẩm nổi bật */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-black text-gray-900">Sản phẩm nổi bật</h2>
                <span className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <TrendingUp size={10} /> Ưu đãi mỗi ngày
                </span>
              </div>
              <a href="/products" className="text-sm text-[#E31937] font-semibold hover:underline">
                Xem thêm →
              </a>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
              {mockProducts.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          </section>
        </main>

        {/* Sidebar phải */}
        <aside className="w-72 flex-shrink-0 hidden xl:block">
          <div className="space-y-4 sticky top-24">
            {/* Cam kết ACFMart */}
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Shield size={16} className="text-[#E31937]" /> Cam kết ACFMart
              </h3>
              <ul className="space-y-2.5">
                {[
                  { icon: <CheckCircle size={14} className="text-green-500" />, text: '100% sản phẩm chính hãng' },
                  { icon: <Truck size={14} className="text-blue-500" />, text: 'Giao hàng toàn quốc 2-5 ngày' },
                  { icon: <Shield size={14} className="text-purple-500" />, text: 'Bảo hành theo nhà sản xuất' },
                  { icon: <CheckCircle size={14} className="text-orange-500" />, text: 'Hoàn tiền 100% nếu hàng giả' },
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                    {item.icon}
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* QR Xác thực */}
            <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl border border-red-100 p-4">
              <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                <QrCode size={16} className="text-[#E31937]" /> Xác thực QR
              </h3>
              <p className="text-xs text-gray-600 mb-3">
                Quét mã QR trên sản phẩm để kiểm tra tính chính hãng ngay lập tức.
              </p>
              <a
                href="/qr-verify"
                className="block w-full text-center bg-[#E31937] text-white text-sm font-semibold py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Quét QR ngay →
              </a>
            </div>

            {/* Trở thành người bán */}
            <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl border border-orange-100 p-4">
              <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Store size={16} className="text-orange-500" /> Trở thành người bán
              </h3>
              <p className="text-xs text-gray-600 mb-3">
                Mở shop ngay hôm nay! Tiếp cận hàng triệu khách hàng trên toàn quốc.
              </p>
              <ul className="text-xs text-gray-600 space-y-1 mb-3">
                <li>✓ Đăng ký miễn phí</li>
                <li>✓ Công cụ quản lý đơn hàng</li>
                <li>✓ Hỗ trợ vận chuyển toàn quốc</li>
              </ul>
              <a
                href="/seller/register"
                className="block w-full text-center bg-orange-500 text-white text-sm font-semibold py-2 rounded-lg hover:bg-orange-600 transition-colors"
              >
                Đăng ký bán hàng
              </a>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
