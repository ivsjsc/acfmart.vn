'use client';

import { useState } from 'react';
import {
  CheckCircle, XCircle, Clock, TrendingUp, TrendingDown,
  Edit, Trash2, ArrowLeft, Star, Eye, ShoppingBag, DollarSign,
} from 'lucide-react';
import Link from 'next/link';

// Mock data sản phẩm chờ duyệt
const mockProduct = {
  id: 'p1',
  name: 'Kem chống nắng Anessa Perfect UV Sunscreen Skincare Milk SPF50+ PA++++',
  slug: 'kem-chong-nang-anessa-perfect-uv-spf50',
  status: 'PENDING',
  category: 'Mỹ phẩm & Làm đẹp',
  brand: 'Anessa',
  price: 389000,
  comparePrice: 520000,
  costPrice: 280000,
  stock: 245,
  sku: 'ANS-UV-SPF50-60ML',
  origin: 'Nhật Bản',
  description: 'Kem chống nắng Anessa Perfect UV Skincare Milk SPF50+ PA++++ bảo vệ tối ưu khỏi tia UV, không gây nhờn rít, thích hợp cho da dầu và hỗn hợp.',
  submittedAt: '21/01/2025 09:15',
  images: [
    'https://picsum.photos/seed/anessa1/400/400',
    'https://picsum.photos/seed/anessa2/400/400',
    'https://picsum.photos/seed/anessa3/400/400',
  ],
  shop: {
    name: 'Anessa Vietnam Official',
    slug: 'anessa-vietnam-official',
    id: 'SH001',
    vendorId: 'VD-2024-0145',
    type: 'Nhà phân phối chính thức',
    email: 'shop@anessa.com.vn',
    phone: '028 3825 7890',
    address: '123 Nguyễn Huệ, Q.1, TP.HCM',
    isVerified: true,
    rating: 4.9,
  },
  metrics: {
    revenue7d: 4560000,
    revenueChange: 23.4,
    orders7d: 34,
    ordersChange: 18.7,
    views7d: 1245,
    viewsChange: 45.2,
    conversionRate: 2.73,
    conversionChange: -2.1,
    avgRating: 4.8,
    ratingCount: 234,
    totalSold: 1890,
  },
};

const statusConfig = {
  PENDING: { label: 'Chờ duyệt', color: 'bg-yellow-100 text-yellow-700 border border-yellow-300', icon: <Clock size={14} /> },
  APPROVED: { label: 'Đã duyệt', color: 'bg-green-100 text-green-700 border border-green-300', icon: <CheckCircle size={14} /> },
  REJECTED: { label: 'Từ chối', color: 'bg-red-100 text-red-700 border border-red-300', icon: <XCircle size={14} /> },
};

function formatVND(n: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
}

const TABS = ['Thông tin sản phẩm', 'Hình ảnh', 'Biến thể', 'Tài liệu', 'Lịch sử duyệt'];

export default function AdminProductDetailPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState(0);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const p = mockProduct;
  const cfg = statusConfig[p.status as keyof typeof statusConfig];

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link href="/admin/products">
          <button className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors">
            <ArrowLeft size={16} className="text-gray-600" />
          </button>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <h1 className="text-xl font-black text-gray-900 leading-tight">{p.name}</h1>
            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${cfg.color}`}>
              {cfg.icon}{cfg.label}
            </span>
          </div>
          <p className="text-xs text-gray-400">ID: {params.id} · SKU: {p.sku} · Gửi lúc {p.submittedAt}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-xl border border-gray-100 p-1 shadow-sm w-fit">
        {TABS.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === i ? 'bg-[#E31937] text-white shadow-sm' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left — main content */}
        <div className="xl:col-span-2 space-y-5">
          {activeTab === 0 && (
            <>
              {/* Thông tin cơ bản */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="bg-gray-50 px-5 py-3 border-b border-gray-100">
                  <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide">📋 Thông Tin Cơ Bản</h3>
                </div>
                <div className="p-5 grid grid-cols-2 gap-4 text-sm">
                  {[
                    ['Tên sản phẩm', p.name],
                    ['Slug URL', p.slug],
                    ['Danh mục', p.category],
                    ['Thương hiệu', p.brand],
                    ['Giá bán', formatVND(p.price)],
                    ['Giá so sánh', formatVND(p.comparePrice)],
                    ['Giá nhập', formatVND(p.costPrice)],
                    ['Tồn kho', `${p.stock} sản phẩm`],
                    ['SKU', p.sku],
                    ['Xuất xứ', p.origin],
                    ['Trạng thái', cfg.label],
                    ['Ngày gửi duyệt', p.submittedAt],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <p className="text-xs text-gray-400 font-medium mb-0.5">{label}</p>
                      <p className={`font-semibold ${label === 'Giá bán' ? 'text-[#E31937]' : 'text-gray-900'}`}>{value}</p>
                    </div>
                  ))}
                  <div className="col-span-2">
                    <p className="text-xs text-gray-400 font-medium mb-1">Mô tả sản phẩm</p>
                    <p className="text-gray-700 leading-relaxed bg-gray-50 rounded-lg p-3 text-xs">{p.description}</p>
                  </div>
                </div>
              </div>

              {/* Thông tin shop */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="bg-gray-50 px-5 py-3 border-b border-gray-100">
                  <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide">🏪 Thông Tin Shop</h3>
                </div>
                <div className="p-5 grid grid-cols-2 gap-4 text-sm">
                  {[
                    ['Tên shop', p.shop.name],
                    ['Slug shop', p.shop.slug],
                    ['Shop ID', p.shop.id],
                    ['Vendor ID', p.shop.vendorId],
                    ['Loại shop', p.shop.type],
                    ['Email', p.shop.email],
                    ['Số điện thoại', p.shop.phone],
                    ['Địa chỉ', p.shop.address],
                    ['Xác thực', p.shop.isVerified ? '✅ Đã xác thực' : '❌ Chưa xác thực'],
                    ['Đánh giá trung bình', `⭐ ${p.shop.rating}/5.0`],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <p className="text-xs text-gray-400 font-medium mb-0.5">{label}</p>
                      <p className="font-semibold text-gray-900">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 1 && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-900 mb-4">🖼️ Hình ảnh sản phẩm ({p.images.length} ảnh)</h3>
              <div className="grid grid-cols-3 gap-3">
                {p.images.map((img, i) => (
                  <div key={i} className="aspect-square rounded-xl overflow-hidden border border-gray-200 relative group">
                    <img src={img} alt={`Ảnh ${i + 1}`} className="w-full h-full object-cover" />
                    {i === 0 && (
                      <span className="absolute top-2 left-2 bg-[#E31937] text-white text-[10px] font-bold px-2 py-0.5 rounded">Ảnh chính</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 2 && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-900 mb-4">🔀 Biến thể sản phẩm</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-xs text-gray-500">
                    <tr>
                      {['Biến thể', 'SKU', 'Giá', 'Tồn kho'].map((h) => (
                        <th key={h} className="text-left px-4 py-2">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {[
                      { name: '60ml', sku: 'ANS-UV-SPF50-60ML', price: 389000, stock: 245 },
                      { name: '90ml', sku: 'ANS-UV-SPF50-90ML', price: 520000, stock: 128 },
                    ].map((v) => (
                      <tr key={v.sku} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">{v.name}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{v.sku}</td>
                        <td className="px-4 py-3 font-bold text-[#E31937]">{formatVND(v.price)}</td>
                        <td className="px-4 py-3">{v.stock}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 4 && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-900 mb-4">📅 Lịch sử duyệt</h3>
              <ol className="relative border-l-2 border-gray-200 ml-3 space-y-6">
                {[
                  { event: 'Sản phẩm gửi duyệt', time: '21/01/2025 09:15', by: 'Seller: Anessa VN', color: 'bg-blue-500' },
                  { event: 'Đang chờ Admin xem xét', time: '21/01/2025 09:16', by: 'Hệ thống tự động', color: 'bg-yellow-500' },
                ].map((step, i) => (
                  <li key={i} className="ml-6">
                    <span className={`absolute -left-[9px] w-4 h-4 ${step.color} rounded-full border-2 border-white`} />
                    <p className="text-sm font-semibold text-gray-900">{step.event}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{step.time} · {step.by}</p>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="space-y-5">
          {/* Metrics */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-sm">📊 Hiệu suất sản phẩm</h3>
            </div>
            <div className="p-3 grid grid-cols-2 gap-2">
              {[
                { label: 'DT 7 ngày', value: formatVND(p.metrics.revenue7d), change: p.metrics.revenueChange, icon: <DollarSign size={14} className="text-green-600" />, bg: 'bg-green-50' },
                { label: 'Đơn hàng', value: p.metrics.orders7d, change: p.metrics.ordersChange, icon: <ShoppingBag size={14} className="text-blue-600" />, bg: 'bg-blue-50' },
                { label: 'Lượt xem', value: p.metrics.views7d.toLocaleString('vi-VN'), change: p.metrics.viewsChange, icon: <Eye size={14} className="text-purple-600" />, bg: 'bg-purple-50' },
                { label: 'Tỷ lệ CĐ', value: `${p.metrics.conversionRate}%`, change: p.metrics.conversionChange, icon: <TrendingUp size={14} className="text-orange-600" />, bg: 'bg-orange-50' },
                { label: 'Đánh giá', value: `⭐ ${p.metrics.avgRating}`, change: 0, icon: <Star size={14} className="text-yellow-600" />, bg: 'bg-yellow-50' },
                { label: 'Đã bán', value: p.metrics.totalSold.toLocaleString('vi-VN'), change: 0, icon: <CheckCircle size={14} className="text-teal-600" />, bg: 'bg-teal-50' },
              ].map((m) => (
                <div key={m.label} className={`${m.bg} rounded-lg p-3`}>
                  <div className="flex items-center gap-1.5 mb-1">
                    {m.icon}
                    <span className="text-[10px] font-semibold text-gray-600">{m.label}</span>
                  </div>
                  <p className="text-sm font-black text-gray-900">{m.value}</p>
                  {m.change !== 0 && (
                    <p className={`text-[10px] font-semibold flex items-center gap-0.5 mt-0.5 ${m.change > 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {m.change > 0 ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
                      {m.change > 0 ? '+' : ''}{m.change}%
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Approval timeline */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <h3 className="font-bold text-gray-900 text-sm mb-4">🔄 Quy trình duyệt</h3>
            <ol className="space-y-3">
              {[
                { step: 'Đã duyệt', desc: 'Sản phẩm được phê duyệt', active: false, done: false },
                { step: 'Đang chờ', desc: 'Chờ Admin xem xét', active: true, done: false },
                { step: 'Đã gửi', desc: 'Seller đã gửi yêu cầu', active: false, done: true },
              ].map((s, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    s.done ? 'bg-green-500' : s.active ? 'bg-[#E31937] ring-4 ring-red-100' : 'bg-gray-200'
                  }`}>
                    {s.done ? <CheckCircle size={12} className="text-white" /> : <span className="text-white text-[10px] font-bold">{i + 1}</span>}
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${s.active ? 'text-[#E31937]' : s.done ? 'text-green-700' : 'text-gray-400'}`}>{s.step}</p>
                    <p className="text-[11px] text-gray-400">{s.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* Action buttons */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-2.5">
            <h3 className="font-bold text-gray-900 text-sm mb-3">⚡ Hành động</h3>
            <button className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl transition-colors">
              <CheckCircle size={16} /> Duyệt sản phẩm
            </button>
            <button
              onClick={() => setShowRejectModal(true)}
              className="w-full flex items-center justify-center gap-2 bg-white hover:bg-red-50 text-[#E31937] border-2 border-[#E31937] font-bold py-3 rounded-xl transition-colors"
            >
              <XCircle size={16} /> Từ chối
            </button>
            <button className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 rounded-xl transition-colors text-sm">
              <Edit size={14} /> Chỉnh sửa
            </button>
            <button className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-red-50 text-red-500 hover:text-red-600 font-medium py-2.5 rounded-xl transition-colors text-sm">
              <Trash2 size={14} /> Xóa sản phẩm
            </button>
          </div>
        </div>
      </div>

      {/* Reject modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="font-black text-lg text-gray-900 mb-2">Từ chối sản phẩm</h3>
            <p className="text-sm text-gray-500 mb-4">Vui lòng nhập lý do từ chối để thông báo cho seller.</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Ví dụ: Hình ảnh sản phẩm không rõ ràng, thiếu chứng nhận xuất xứ..."
              className="w-full border border-gray-200 rounded-xl p-3 text-sm h-28 resize-none focus:outline-none focus:ring-2 focus:ring-[#E31937]/20 focus:border-[#E31937]"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button className="flex-1 py-2.5 bg-[#E31937] text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-colors">
                Xác nhận từ chối
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
