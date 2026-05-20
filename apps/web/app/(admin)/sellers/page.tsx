'use client';

import { useState } from 'react';
import { Search, CheckCircle, Clock, Store, Star } from 'lucide-react';

const sellers = [
  { id: 's1', shopName: 'Apple Store VN', ownerName: 'Nguyễn Minh Tuấn', email: 'apple@ivsacademy.edu.vn', type: 'Nhà phân phối chính thức', isVerified: true, isPro: true, products: 24, rating: 4.9, revenue: 1245000000, joinedAt: '01/01/2024' },
  { id: 's2', shopName: 'Samsung Official Vietnam', ownerName: 'Trần Thu Hương', email: 'samsung@official.vn', type: 'Nhà phân phối chính thức', isVerified: true, isPro: true, products: 56, rating: 4.8, revenue: 987000000, joinedAt: '15/02/2024' },
  { id: 's3', shopName: 'Anessa Vietnam', ownerName: 'Lê Thị Mai', email: 'anessa@beauty.vn', type: 'Nhà phân phối', isVerified: true, isPro: false, products: 12, rating: 4.7, revenue: 234000000, joinedAt: '20/03/2024' },
  { id: 's4', shopName: 'Shop Thời Trang Phong Cách', ownerName: 'Phạm Văn Hùng', email: 'phongtrao@gmail.com', type: 'Cá nhân', isVerified: false, isPro: false, products: 89, rating: 4.2, revenue: 89000000, joinedAt: '10/04/2024' },
  { id: 's5', shopName: 'Đồ Điện Tử Minh Khoa', ownerName: 'Hoàng Minh Khoa', email: 'minhkhoa.tech@gmail.com', type: 'Doanh nghiệp', isVerified: false, isPro: false, products: 34, rating: 4.5, revenue: 156000000, joinedAt: '05/05/2024' },
];

function formatVND(n: number) {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}tỷ`;
  return `${(n / 1_000_000).toFixed(0)}tr đ`;
}

export default function AdminSellersPage() {
  const [search, setSearch] = useState('');
  const [verifyFilter, setVerifyFilter] = useState('ALL');

  const filtered = sellers.filter((s) => {
    const matchVerify = verifyFilter === 'ALL' || (verifyFilter === 'VERIFIED' ? s.isVerified : !s.isVerified);
    const matchSearch = s.shopName.toLowerCase().includes(search.toLowerCase());
    return matchVerify && matchSearch;
  });

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Quản lý Seller</h1>
          <p className="text-gray-500 text-sm mt-1">{sellers.length} shop đã đăng ký · {sellers.filter((s) => s.isVerified).length} đã xác thực</p>
        </div>
        <div className="flex gap-2">
          {[
            { value: 'ALL', label: 'Tất cả' },
            { value: 'VERIFIED', label: '✓ Đã xác thực' },
            { value: 'UNVERIFIED', label: '⏳ Chờ xác thực' },
          ].map((f) => (
            <button key={f.value} onClick={() => setVerifyFilter(f.value)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${verifyFilter === f.value ? 'bg-[#E31937] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm shop..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E31937]/20 focus:border-[#E31937]" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filtered.map((s) => (
          <div key={s.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-orange-400 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Store size={20} className="text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-bold text-gray-900">{s.shopName}</h3>
                    {s.isVerified && (
                      <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle size={10} /> Đã xác thực
                      </span>
                    )}
                    {s.isPro && (
                      <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full">⭐ Pro</span>
                    )}
                    {!s.isVerified && (
                      <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Clock size={10} /> Chờ xác thực
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{s.ownerName} · {s.email}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{s.type} · Tham gia: {s.joinedAt}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-black text-[#E31937]">{formatVND(s.revenue)}</p>
                <p className="text-xs text-gray-400">Tổng doanh thu</p>
              </div>
            </div>
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
              <div className="flex gap-6 text-sm">
                <div><span className="font-bold text-gray-900">{s.products}</span> <span className="text-gray-500">sản phẩm</span></div>
                <div className="flex items-center gap-1"><Star size={13} className="text-yellow-500 fill-yellow-500" /><span className="font-bold text-gray-900">{s.rating}</span></div>
              </div>
              <div className="flex gap-2">
                <button className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg font-medium transition-colors">Xem chi tiết</button>
                {!s.isVerified && (
                  <button className="text-xs bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg font-semibold transition-colors">Xác thực</button>
                )}
                <button className="text-xs bg-red-100 hover:bg-red-200 text-red-600 px-3 py-1.5 rounded-lg font-medium transition-colors">Tạm khóa</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
