'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Star, ShoppingCart, Shield, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';

const categories = [
  { name: 'Điện tử', sub: ['Điện thoại', 'Tai nghe', 'Laptop', 'Đồng hồ thông minh'] },
  { name: 'Thời trang', sub: ['Áo', 'Quần', 'Giày dép', 'Phụ kiện'] },
  { name: 'Làm đẹp', sub: [] },
  { name: 'Nhà cửa', sub: [] },
  { name: 'Sức khỏe', sub: [] },
  { name: 'Thể thao', sub: [] },
  { name: 'Mẹ & Bé', sub: [] },
  { name: 'Ô tô & Xe', sub: [] },
];

const brands = ['Sony', 'Apple', 'Nike', 'Samsung', 'Ray-Ban', 'Innisfree', 'Uniqlo', 'Dell'];

const mockProducts = Array.from({ length: 12 }, (_, i) => ({
  id: String(i + 1),
  slug: `product-${i + 1}`,
  name: [
    'Tai nghe Bluetooth Sony WH-1000XM5',
    'Đồng hồ Apple Watch Series 9',
    'Giày Nike Air Max 270',
    'Điện thoại Samsung Galaxy S24',
    'Kính Ray-Ban Aviator Classic',
    'Kem dưỡng da Innisfree Super Volcanic',
    'Áo thun Uniqlo Dry-EX Pro',
    'Laptop Dell XPS 15 2024',
    'Tai nghe AirPods Pro 2',
    'Balo Nike Air Heritage',
    'Nước hoa Dior Sauvage EDP',
    'Đèn LED Philips Hue Starter',
  ][i],
  price: [7990000, 11990000, 3290000, 22990000, 2890000, 450000, 299000, 32000000, 6490000, 1290000, 2200000, 1890000][i],
  originalPrice: [9490000, 13490000, 3890000, 24990000, 3290000, 550000, 349000, 35000000, 7490000, 1490000, 2500000, 2100000][i],
  rating: 4 + Math.random() * 0.9,
  reviews: Math.floor(Math.random() * 300) + 20,
  sold: Math.floor(Math.random() * 500) + 50,
  verified: i % 3 !== 2,
  badge: i === 0 ? 'Best Seller' : i === 3 ? 'Mới nhất' : null,
}));

export default function ProductsPage() {
  const [checkedCats, setCheckedCats] = useState<string[]>([]);
  const [checkedBrands, setCheckedBrands] = useState<string[]>([]);
  const [priceFrom, setPriceFrom] = useState('');
  const [priceTo, setPriceTo] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sort, setSort] = useState('popular');
  const [page, setPage] = useState(1);
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  const toggleCat = (c: string) => setCheckedCats(p => p.includes(c) ? p.filter(x => x !== c) : [...p, c]);
  const toggleBrand = (b: string) => setCheckedBrands(p => p.includes(b) ? p.filter(x => x !== b) : [...p, b]);

  const totalResults = 248;
  const totalPages = Math.ceil(totalResults / 20);

  const FilterPanel = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Danh mục</h3>
        <div className="space-y-1">
          {categories.map(cat => (
            <div key={cat.name}>
              <label className="flex items-center gap-2 py-1 cursor-pointer group">
                <input type="checkbox" checked={checkedCats.includes(cat.name)} onChange={() => toggleCat(cat.name)}
                  className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500" />
                <span className="text-sm text-gray-700 group-hover:text-gray-900">{cat.name}</span>
              </label>
              {cat.sub.length > 0 && checkedCats.includes(cat.name) && (
                <div className="ml-6 space-y-1">
                  {cat.sub.map(s => (
                    <label key={s} className="flex items-center gap-2 py-0.5 cursor-pointer">
                      <input type="checkbox" className="w-3.5 h-3.5 rounded border-gray-300 text-red-600" />
                      <span className="text-xs text-gray-600">{s}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Price range */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Khoảng giá</h3>
        <div className="flex gap-2 items-center">
          <input value={priceFrom} onChange={e => setPriceFrom(e.target.value)} placeholder="Từ"
            className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
          <span className="text-gray-400 text-xs">—</span>
          <input value={priceTo} onChange={e => setPriceTo(e.target.value)} placeholder="Đến"
            className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
        </div>
        <button className="mt-2 w-full py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-lg transition-colors">
          Áp dụng
        </button>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {[['0', '500000', '<500K'], ['500000', '2000000', '500K–2M'], ['2000000', '10000000', '2M–10M'], ['10000000', '', '>10M']].map(([from, to, label]) => (
            <button key={label} onClick={() => { setPriceFrom(from); setPriceTo(to); }}
              className="px-2 py-1 border border-gray-200 rounded text-xs text-gray-600 hover:border-red-400 hover:text-red-600 transition-colors">
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Brands */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Thương hiệu</h3>
        <div className="space-y-1">
          {brands.map(b => (
            <label key={b} className="flex items-center gap-2 py-1 cursor-pointer group">
              <input type="checkbox" checked={checkedBrands.includes(b)} onChange={() => toggleBrand(b)}
                className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500" />
              <span className="text-sm text-gray-700 group-hover:text-gray-900">{b}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Đánh giá</h3>
        <div className="space-y-1">
          {[4, 3, 2].map(r => (
            <button key={r} onClick={() => setMinRating(r === minRating ? 0 : r)}
              className={`flex items-center gap-1.5 w-full py-1 px-2 rounded-lg text-sm transition-colors ${
                minRating === r ? 'bg-yellow-50 text-yellow-700' : 'text-gray-700 hover:bg-gray-50'
              }`}>
              {Array.from({ length: r }).map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />)}
              <span className="text-xs ml-1">từ {r} sao trở lên</span>
            </button>
          ))}
        </div>
      </div>

      {/* Verified */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-green-600" />
          <span className="text-sm font-medium text-gray-700">Đã xác thực ACFmart</span>
        </div>
        <button onClick={() => setVerifiedOnly(!verifiedOnly)}
          className={`relative w-10 h-5 rounded-full transition-colors ${verifiedOnly ? 'bg-green-500' : 'bg-gray-200'}`}>
          <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${verifiedOnly ? 'translate-x-5' : 'translate-x-0.5'}`} />
        </button>
      </div>

      <button onClick={() => { setCheckedCats([]); setCheckedBrands([]); setPriceFrom(''); setPriceTo(''); setMinRating(0); setVerifiedOnly(false); }}
        className="w-full py-2 border border-gray-200 rounded-lg text-sm text-gray-500 hover:bg-gray-50 transition-colors">
        Xóa bộ lọc
      </button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-red-600">Trang chủ</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 font-medium">Tất cả sản phẩm</span>
      </nav>

      <div className="flex gap-6">
        {/* Filter Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-4">
            <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4" />
              Bộ lọc
            </h2>
            <FilterPanel />
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          {/* Sort bar */}
          <div className="flex items-center justify-between mb-4 bg-white border border-gray-200 rounded-xl px-4 py-3">
            <p className="text-sm text-gray-500">
              Hiển thị <span className="font-medium text-gray-900">1–20</span> trong{' '}
              <span className="font-medium text-gray-900">{totalResults}</span> sản phẩm
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 hidden sm:block">Sắp xếp:</span>
              <select value={sort} onChange={e => setSort(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
                <option value="popular">Phổ biến nhất</option>
                <option value="newest">Mới nhất</option>
                <option value="price_asc">Giá thấp → cao</option>
                <option value="price_desc">Giá cao → thấp</option>
                <option value="rating">Đánh giá cao</option>
              </select>
              <button onClick={() => setShowMobileFilter(true)}
                className="lg:hidden p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <SlidersHorizontal className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
            {mockProducts.map(product => {
              const discount = Math.round((1 - product.price / product.originalPrice) * 100);
              return (
                <Link key={product.id} href={`/products/${product.slug}`}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all group">
                  {/* Image */}
                  <div className="relative aspect-square bg-gray-100 flex items-center justify-center">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg" />
                    {product.badge && (
                      <span className="absolute top-2 left-2 bg-[#E31937] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {product.badge}
                      </span>
                    )}
                    {discount > 0 && (
                      <span className="absolute top-2 right-2 bg-orange-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                        -{discount}%
                      </span>
                    )}
                    {product.verified && (
                      <span className="absolute bottom-2 left-2 bg-green-100 text-green-700 text-xs px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                        <Shield className="w-2.5 h-2.5" />
                        XN
                      </span>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-xs text-gray-500 line-clamp-2 mb-1.5 leading-relaxed min-h-[2.5rem]">{product.name}</p>
                    <p className="text-base font-bold text-[#E31937]">{product.price.toLocaleString('vi-VN')}đ</p>
                    <p className="text-xs text-gray-400 line-through">{product.originalPrice.toLocaleString('vi-VN')}đ</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs text-gray-600">{product.rating.toFixed(1)}</span>
                        <span className="text-xs text-gray-400">({product.reviews})</span>
                      </div>
                      <span className="text-xs text-gray-400">Đã bán {product.sold}</span>
                    </div>
                    <button className="mt-2 w-full flex items-center justify-center gap-1.5 py-1.5 border border-[#E31937] text-[#E31937] hover:bg-[#E31937] hover:text-white rounded-lg text-xs font-medium transition-colors">
                      <ShoppingCart className="w-3.5 h-3.5" />
                      Thêm vào giỏ
                    </button>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pg = i + 1;
              return (
                <button key={pg} onClick={() => setPage(pg)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                    page === pg ? 'bg-[#E31937] text-white' : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}>
                  {pg}
                </button>
              );
            })}
            {totalPages > 5 && (
              <>
                <span className="px-2 text-gray-400">...</span>
                <button onClick={() => setPage(totalPages)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors`}>
                  {totalPages}
                </button>
              </>
            )}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </main>
      </div>

      {/* Mobile filter overlay */}
      {showMobileFilter && (
        <div className="fixed inset-0 bg-black/50 z-50 lg:hidden">
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-white p-5 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">Bộ lọc</h2>
              <button onClick={() => setShowMobileFilter(false)}>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <FilterPanel />
          </div>
        </div>
      )}
    </div>
  );
}
