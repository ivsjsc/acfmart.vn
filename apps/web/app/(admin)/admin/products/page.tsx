'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, CheckCircle, XCircle, Clock, Eye } from 'lucide-react';

const products = [
  { id: 'p1', name: 'Kem chống nắng Anessa Perfect UV SPF50+', shop: 'Anessa VN', shopId: 'SH001', price: 389000, status: 'PENDING', category: 'Mỹ phẩm', submittedAt: '21/01/2025', sku: 'ANS-UV-SPF50' },
  { id: 'p2', name: 'Tai nghe Sony WH-1000XM5 Noise Cancelling', shop: 'Sony Vietnam', shopId: 'SH002', price: 7990000, status: 'PENDING', category: 'Điện tử', submittedAt: '21/01/2025', sku: 'SONY-WH1000XM5' },
  { id: 'p3', name: 'Giày Adidas Ultraboost 22 Chính Hãng', shop: 'Adidas Store', shopId: 'SH003', price: 4200000, status: 'APPROVED', category: 'Thể thao', submittedAt: '20/01/2025', sku: 'ADI-UB22-42' },
  { id: 'p4', name: 'Máy lọc không khí Xiaomi Mi Air Purifier 4', shop: 'Xiaomi VN', shopId: 'SH004', price: 3490000, status: 'PENDING', category: 'Gia dụng', submittedAt: '21/01/2025', sku: 'XM-AP4-WH' },
  { id: 'p5', name: 'Serum Vitamin C Skinceuticals C E Ferulic', shop: 'Skinceuticals VN', shopId: 'SH005', price: 4800000, status: 'REJECTED', category: 'Mỹ phẩm', submittedAt: '19/01/2025', sku: 'SKC-CEF-30ML' },
  { id: 'p6', name: 'MacBook Pro M3 14 inch 512GB', shop: 'Apple Store VN', shopId: 'SH006', price: 49990000, status: 'APPROVED', category: 'Điện tử', submittedAt: '18/01/2025', sku: 'APL-MBP-M3-14' },
  { id: 'p7', name: 'Váy linen mùa hè basic nhẹ nhàng', shop: 'Thời Trang HM', shopId: 'SH007', price: 299000, status: 'PENDING', category: 'Thời trang', submittedAt: '21/01/2025', sku: 'HM-LIN-DRS-M' },
];

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  PENDING: { label: 'Chờ duyệt', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: <Clock size={11} /> },
  APPROVED: { label: 'Đã duyệt', color: 'bg-green-100 text-green-700 border-green-200', icon: <CheckCircle size={11} /> },
  REJECTED: { label: 'Từ chối', color: 'bg-red-100 text-red-700 border-red-200', icon: <XCircle size={11} /> },
};

function formatVND(n: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
}

export default function AdminProductsPage() {
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const filtered = products.filter((p) => {
    const matchStatus = filter === 'ALL' || p.status === filter;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.shop.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Duyệt Sản Phẩm</h1>
          <p className="text-gray-500 text-sm mt-1">Kiểm duyệt chất lượng sản phẩm trước khi hiển thị</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-orange-100 text-orange-700 text-sm font-bold px-3 py-1.5 rounded-full border border-orange-200">
            12 chờ duyệt
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm sản phẩm, shop..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E31937]/20 focus:border-[#E31937]"
          />
        </div>
        <div className="flex gap-2">
          {[
            { value: 'ALL', label: 'Tất cả' },
            { value: 'PENDING', label: 'Chờ duyệt' },
            { value: 'APPROVED', label: 'Đã duyệt' },
            { value: 'REJECTED', label: 'Từ chối' },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f.value ? 'bg-[#E31937] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Sản phẩm</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Shop</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Giá</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Trạng thái</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Ngày gửi</th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((p) => {
                const cfg = statusConfig[p.status];
                return (
                  <tr key={p.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-5 py-3.5">
                      <div>
                        <p className="font-semibold text-gray-900 line-clamp-1">{p.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">SKU: {p.sku} · {p.category}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-sm text-gray-700 font-medium">{p.shop}</p>
                      <p className="text-xs text-gray-400">{p.shopId}</p>
                    </td>
                    <td className="px-4 py-3.5 text-right font-bold text-[#E31937]">{formatVND(p.price)}</td>
                    <td className="px-4 py-3.5 text-center">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.color}`}>
                        {cfg.icon}{cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center text-xs text-gray-500">{p.submittedAt}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-center gap-2">
                        <Link href={`/admin/products/${p.id}`}>
                          <button className="flex items-center gap-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2.5 py-1.5 rounded-lg font-medium transition-colors">
                            <Eye size={12} /> Xem
                          </button>
                        </Link>
                        {p.status === 'PENDING' && (
                          <>
                            <button className="text-xs bg-green-500 hover:bg-green-600 text-white px-2.5 py-1.5 rounded-lg font-semibold transition-colors">Duyệt</button>
                            <button className="text-xs bg-red-100 hover:bg-red-200 text-red-600 px-2.5 py-1.5 rounded-lg font-semibold transition-colors">Từ chối</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span>Hiển thị {filtered.length} / {products.length} sản phẩm</span>
          <div className="flex gap-1">
            {[1, 2, 3].map((p) => (
              <button key={p} className={`w-7 h-7 rounded-lg font-medium ${p === 1 ? 'bg-[#E31937] text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>{p}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
