'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Star, ShoppingCart, Shield, Lock, QrCode, ChevronRight, Truck, RefreshCw, Award } from 'lucide-react';

const product = {
  name: 'Tai nghe Bluetooth Sony WH-1000XM5',
  category: 'Điện tử',
  brand: 'Sony',
  price: 7990000,
  originalPrice: 9490000,
  rating: 4.8,
  totalReviews: 128,
  sold: 456,
  colors: ['#1a1a1a', '#f5f0e8', '#3b5998'],
  colorNames: ['Đen', 'Kem', 'Xanh dương'],
  sizes: [] as string[],
  images: ['IMG1', 'IMG2', 'IMG3', 'IMG4'],
  description: `Tai nghe Sony WH-1000XM5 sở hữu công nghệ chống ồn chủ động hàng đầu thế giới với 8 micro thu âm và 2 chip xử lý HD QN1, mang đến trải nghiệm âm thanh vượt trội và khả năng cách ly tiếng ồn môi trường hoàn hảo.

Thiết kế nhẹ nhàng, đơn giản với vành tai mềm mại giúp đeo thoải mái trong nhiều giờ liên tục. Pin 30 giờ với sạc nhanh — chỉ 3 phút sạc cho 3 giờ nghe.

Tích hợp trợ lý giọng nói Alexa và Google Assistant, cùng Multipoint Connection cho phép kết nối đồng thời hai thiết bị.`,
  specs: [
    ['Kiểu kết nối', 'Bluetooth 5.2'],
    ['Chip âm thanh', 'HD QN1'],
    ['Thời lượng pin', '30 giờ'],
    ['Trọng lượng', '250g'],
    ['Driver', '30mm'],
    ['Dải tần', '4Hz – 40,000Hz'],
    ['Codec hỗ trợ', 'SBC, AAC, LDAC'],
    ['Chống ồn', 'ANC + Ambient Sound'],
    ['Micro', '8 micro thu âm'],
    ['Sạc', 'USB-C, 3 phút = 3 giờ'],
  ],
};

const reviews = [
  {
    id: 1, author: 'Nguyễn Văn An', avatar: 'NA', rating: 5, date: '15/05/2026',
    content: 'Sản phẩm rất tuyệt vời! Chống ồn cực kỳ tốt, âm thanh trong trẻo, bass mạnh nhưng không bị chát. Đã dùng được 2 tuần và rất hài lòng. Giao hàng nhanh, đóng gói cẩn thận.',
    verified: true, images: ['IMG1', 'IMG2'],
  },
  {
    id: 2, author: 'Trần Thị Bình', avatar: 'TB', rating: 5, date: '10/05/2026',
    content: 'Mình mua để dùng khi làm việc tại nhà. Tính năng chống ồn hoạt động rất ổn, lọc hoàn toàn tiếng ồn xung quanh. Thiết kế đẹp, đeo nhẹ không đau tai. Rất đáng tiền!',
    verified: true, images: [],
  },
  {
    id: 3, author: 'Lê Minh Châu', avatar: 'LC', rating: 4, date: '05/05/2026',
    content: 'Chất lượng âm thanh tốt, chống ồn khá ổn. Duy nhất một điểm là hơi nóng tai sau vài giờ đeo nhưng không đáng kể. Nhìn chung rất hài lòng với sản phẩm.',
    verified: false, images: [],
  },
];

const relatedProducts = [
  { id: '1', name: 'AirPods Pro 2', price: 6490000, rating: 4.7 },
  { id: '2', name: 'Tai nghe Sony WF-1000XM5', price: 5990000, rating: 4.6 },
  { id: '3', name: 'Sennheiser Momentum 4', price: 8990000, rating: 4.8 },
  { id: '4', name: 'Bose QC45', price: 7490000, rating: 4.5 },
  { id: '5', name: 'JBL Tour One M2', price: 4990000, rating: 4.4 },
];

const ratingBreakdown = [5, 4, 3, 2, 1].map((star, i) => ({
  star,
  count: [89, 28, 8, 2, 1][i],
  pct: [70, 22, 6, 1.5, 0.5][i],
}));

export default function ProductDetailPage() {
  const [activeImage, setActiveImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [showQR, setShowQR] = useState(false);
  const [showEscrowTooltip, setShowEscrowTooltip] = useState(false);

  const discount = Math.round((1 - product.price / product.originalPrice) * 100);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6 flex items-center gap-1.5 flex-wrap">
        <Link href="/" className="hover:text-red-600">Trang chủ</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/products" className="hover:text-red-600">Điện tử</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-900 line-clamp-1">{product.name}</span>
      </nav>

      {/* Main Section */}
      <div className="flex flex-col lg:flex-row gap-8 mb-10">
        {/* LEFT — Gallery */}
        <div className="lg:w-[55%] space-y-3">
          <div className="aspect-square bg-gray-100 rounded-2xl flex items-center justify-center overflow-hidden relative">
            <div className="w-32 h-32 bg-gray-200 rounded-xl" />
            <span className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
              {activeImage + 1}/{product.images.length}
            </span>
          </div>
          <div className="flex gap-2">
            {product.images.map((_, i) => (
              <button key={i} onClick={() => setActiveImage(i)}
                className={`flex-1 aspect-square bg-gray-100 rounded-xl flex items-center justify-center border-2 transition-colors ${
                  activeImage === i ? 'border-[#E31937]' : 'border-transparent hover:border-gray-300'
                }`}>
                <div className="w-8 h-8 bg-gray-200 rounded" />
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT — Info */}
        <div className="lg:w-[45%] space-y-4">
          {/* Verified badge */}
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-xl text-sm">
            <Shield className="w-4 h-4 shrink-0" />
            <span className="font-medium">Sản phẩm chính hãng đã xác thực ACFmart</span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 leading-snug">{product.name}</h1>

          {/* Rating + sold */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
              ))}
              <span className="font-medium ml-1">{product.rating}</span>
              <span className="text-gray-400 ml-1">({product.totalReviews} đánh giá)</span>
            </div>
            <span className="text-gray-400">•</span>
            <span className="text-gray-500">Đã bán <span className="font-medium text-gray-700">{product.sold.toLocaleString()}</span></span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-[#E31937]">{product.price.toLocaleString('vi-VN')}đ</span>
            <span className="text-lg text-gray-400 line-through">{product.originalPrice.toLocaleString('vi-VN')}đ</span>
            <span className="bg-orange-500 text-white text-sm font-bold px-2 py-0.5 rounded-full">-{discount}%</span>
          </div>

          <hr className="border-gray-100" />

          {/* Color selection */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">
              Màu sắc: <span className="font-normal text-gray-900">{product.colorNames[selectedColor]}</span>
            </p>
            <div className="flex gap-2">
              {product.colors.map((color, i) => (
                <button key={i} onClick={() => setSelectedColor(i)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${selectedColor === i ? 'border-[#E31937] scale-110' : 'border-gray-300'}`}
                  style={{ backgroundColor: color }} />
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Số lượng</p>
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                <button onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors text-xl">−</button>
                <span className="w-12 text-center font-medium text-gray-900">{qty}</span>
                <button onClick={() => setQty(q => q + 1)}
                  className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors text-xl">+</button>
              </div>
              <span className="text-sm text-gray-400">Còn 45 sản phẩm</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-[#E31937] text-[#E31937] hover:bg-red-50 rounded-xl font-semibold transition-colors">
              <ShoppingCart className="w-5 h-5" />
              Thêm vào giỏ
            </button>
            <button className="flex-1 py-3 bg-[#E31937] hover:bg-red-700 text-white rounded-xl font-semibold transition-colors">
              Mua ngay
            </button>
          </div>

          {/* QR Verify */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="text-sm font-medium text-gray-800">Xác thực sản phẩm</p>
                  <p className="text-xs text-gray-400">Quét QR để kiểm tra nguồn gốc</p>
                </div>
              </div>
              <button onClick={() => setShowQR(!showQR)}
                className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors">
                🔍 Xem QR
              </button>
            </div>
            {showQR && (
              <div className="mt-3 flex justify-center">
                <div className="w-32 h-32 bg-gray-200 rounded-xl flex items-center justify-center text-gray-400 text-xs text-center p-2">
                  QR Code xác thực sản phẩm #SNY-WH1000
                </div>
              </div>
            )}
          </div>

          {/* Escrow badge */}
          <div className="relative">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center gap-3 cursor-pointer"
              onClick={() => setShowEscrowTooltip(!showEscrowTooltip)}>
              <Lock className="w-5 h-5 text-blue-600 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-800">Thanh toán bảo vệ bởi ACFmart Escrow</p>
                <p className="text-xs text-blue-600">Tiền của bạn an toàn cho đến khi nhận hàng</p>
              </div>
              <span className="text-xs text-blue-500 underline">?</span>
            </div>
            {showEscrowTooltip && (
              <div className="absolute z-10 top-full mt-2 left-0 right-0 bg-white border border-blue-200 rounded-xl shadow-lg p-4 text-sm text-gray-700 space-y-1.5">
                {[
                  'Tiền được giữ tại ACFmart — không đến tay người bán ngay',
                  'Nhận hàng và kiểm tra OK → người bán mới nhận tiền',
                  'Có vấn đề → khiếu nại trong 7 ngày → hoàn tiền 100%',
                ].map((t, i) => <p key={i}>✓ {t}</p>)}
              </div>
            )}
          </div>

          {/* Shop info */}
          <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl p-3">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center text-[#E31937] font-bold text-sm">CC</div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">CenterCare by IVS</p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="flex items-center gap-0.5"><Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />4.8</span>
                <span>•</span>
                <span>1.2K người theo dõi</span>
              </div>
            </div>
            <Link href="/shop/centercare" className="text-xs text-[#E31937] hover:underline flex items-center gap-0.5">
              Xem shop <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Policies */}
          <div className="flex gap-4 text-xs text-gray-600">
            {[
              { icon: <RefreshCw className="w-4 h-4 text-green-600" />, text: 'Đổi trả 30 ngày' },
              { icon: <Award className="w-4 h-4 text-blue-600" />, text: 'Bảo hành 12 tháng' },
              { icon: <Truck className="w-4 h-4 text-purple-600" />, text: 'Miễn phí vận chuyển' },
            ].map(p => (
              <div key={p.text} className="flex items-center gap-1.5">
                {p.icon}
                <span>{p.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-8">
        <div className="flex border-b border-gray-100">
          {[
            { key: 'description', label: 'Mô tả' },
            { key: 'specs', label: 'Thông số' },
            { key: 'reviews', label: `Đánh giá (${product.totalReviews})` },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`px-6 py-4 text-sm font-medium transition-colors border-b-2 ${
                activeTab === tab.key
                  ? 'border-[#E31937] text-[#E31937]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'description' && (
            <div className="prose max-w-none text-gray-700 text-sm leading-relaxed whitespace-pre-line">
              {product.description}
            </div>
          )}

          {activeTab === 'specs' && (
            <table className="w-full max-w-lg text-sm">
              <tbody>
                {product.specs.map(([key, val]) => (
                  <tr key={key} className="border-b border-gray-100">
                    <td className="py-2.5 pr-6 font-medium text-gray-600 w-48">{key}</td>
                    <td className="py-2.5 text-gray-900">{val}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-6">
              {/* Rating overview */}
              <div className="flex gap-8 items-start">
                <div className="text-center">
                  <p className="text-5xl font-bold text-gray-900">{product.rating}</p>
                  <div className="flex gap-0.5 justify-center mt-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{product.totalReviews} đánh giá</p>
                </div>
                <div className="flex-1 space-y-1.5">
                  {ratingBreakdown.map(r => (
                    <div key={r.star} className="flex items-center gap-2 text-sm">
                      <span className="w-6 text-right text-gray-600">{r.star}★</span>
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${r.pct}%` }} />
                      </div>
                      <span className="w-8 text-gray-500 text-xs">{r.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Review cards */}
              <div className="space-y-4">
                {reviews.map(review => (
                  <div key={review.id} className="border border-gray-100 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 bg-red-100 rounded-full flex items-center justify-center text-[#E31937] font-bold text-sm">
                        {review.avatar}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-900">{review.author}</p>
                          {review.verified && (
                            <span className="flex items-center gap-0.5 text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">
                              <Shield className="w-2.5 h-2.5" />Đã mua
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: review.rating }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          ))}
                          <span className="text-xs text-gray-400 ml-1">{review.date}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{review.content}</p>
                    {review.images.length > 0 && (
                      <div className="flex gap-2 mt-3">
                        {review.images.map((_, i) => (
                          <div key={i} className="w-16 h-16 bg-gray-100 rounded-lg" />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Sản phẩm liên quan</h2>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {relatedProducts.map(rp => (
            <Link key={rp.id} href={`/products/${rp.id}`}
              className="bg-white border border-gray-200 rounded-xl p-3 w-44 shrink-0 hover:shadow-md hover:-translate-y-0.5 transition-all">
              <div className="aspect-square bg-gray-100 rounded-lg mb-2 flex items-center justify-center">
                <div className="w-10 h-10 bg-gray-200 rounded" />
              </div>
              <p className="text-xs text-gray-700 line-clamp-2 mb-1">{rp.name}</p>
              <p className="text-sm font-bold text-[#E31937]">{rp.price.toLocaleString('vi-VN')}đ</p>
              <div className="flex items-center gap-0.5 mt-1">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs text-gray-600">{rp.rating}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
