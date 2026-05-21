'use client';

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from 'recharts';
import { TrendingUp, Users, ShoppingBag, Clock, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

const revenueData = [
  { date: '15/01', revenue: 145000000, orders: 312 },
  { date: '16/01', revenue: 189000000, orders: 421 },
  { date: '17/01', revenue: 167000000, orders: 378 },
  { date: '18/01', revenue: 234000000, orders: 523 },
  { date: '19/01', revenue: 198000000, orders: 445 },
  { date: '20/01', revenue: 278000000, orders: 612 },
  { date: '21/01', revenue: 312000000, orders: 689 },
];

const pendingProducts = [
  { id: 'p1', name: 'Kem chống nắng Anessa Perfect UV SPF50+', shop: 'Anessa VN', price: 389000, submittedAt: '2 giờ trước', category: 'Mỹ phẩm' },
  { id: 'p2', name: 'Tai nghe Sony WH-1000XM5 Noise Cancelling', shop: 'Sony Vietnam', price: 7990000, submittedAt: '3 giờ trước', category: 'Điện tử' },
  { id: 'p3', name: 'Giày Adidas Ultraboost 22 Chính Hãng', shop: 'Adidas Store', price: 4200000, submittedAt: '5 giờ trước', category: 'Thể thao' },
  { id: 'p4', name: 'Máy lọc không khí Xiaomi Mi Air Purifier 4', shop: 'Xiaomi VN Official', price: 3490000, submittedAt: '6 giờ trước', category: 'Gia dụng' },
  { id: 'p5', name: 'Serum Vitamin C Skinceuticals C E Ferulic', shop: 'Skinceuticals VN', price: 4800000, submittedAt: '8 giờ trước', category: 'Mỹ phẩm' },
];

const recentOrders = [
  { id: 'ACF87654321', customer: 'Nguyễn Văn An', total: 29990000, status: 'DELIVERED', time: '10 phút trước' },
  { id: 'ACF87654320', customer: 'Trần Thị Bình', total: 450000, status: 'PROCESSING', time: '25 phút trước' },
  { id: 'ACF87654319', customer: 'Lê Hoàng Cường', total: 7990000, status: 'PENDING', time: '1 giờ trước' },
  { id: 'ACF87654318', customer: 'Phạm Thị Dung', total: 3200000, status: 'SHIPPED', time: '2 giờ trước' },
  { id: 'ACF87654317', customer: 'Hoàng Văn Em', total: 189000, status: 'CANCELLED', time: '3 giờ trước' },
];

const statusMap: Record<string, { label: string; color: string }> = {
  DELIVERED: { label: 'Đã giao', color: 'bg-green-100 text-green-700' },
  PROCESSING: { label: 'Đang xử lý', color: 'bg-blue-100 text-blue-700' },
  PENDING: { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-700' },
  SHIPPED: { label: 'Đang giao', color: 'bg-purple-100 text-purple-700' },
  CANCELLED: { label: 'Đã hủy', color: 'bg-red-100 text-red-700' },
};

function formatVND(n: number) {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}tỷ`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)}tr đ`;
  return new Intl.NumberFormat('vi-VN').format(n) + 'đ';
}

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Tổng quan hệ thống</h1>
          <p className="text-gray-500 text-sm mt-1">Dữ liệu thời gian thực — cập nhật mỗi 5 phút</p>
        </div>
        <button className="text-xs bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
          Xuất báo cáo
        </button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { title: 'Tổng doanh thu', value: '1,724tr đ', change: '+23.4%', icon: <TrendingUp size={20} className="text-green-600" />, bg: 'bg-green-100', trend: true },
          { title: 'Đơn hàng hôm nay', value: '689', change: '+12.1%', icon: <ShoppingBag size={20} className="text-blue-600" />, bg: 'bg-blue-100', trend: true },
          { title: 'Người dùng mới', value: '234', change: '+8.7%', icon: <Users size={20} className="text-purple-600" />, bg: 'bg-purple-100', trend: true },
          { title: 'SP chờ duyệt', value: '12', change: 'Cần xử lý', icon: <AlertTriangle size={20} className="text-orange-600" />, bg: 'bg-orange-100', trend: false },
        ].map((card, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 ${card.bg} rounded-lg flex items-center justify-center`}>{card.icon}</div>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${card.trend ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'}`}>
                {card.change}
              </span>
            </div>
            <p className="text-2xl font-black text-gray-900 mb-1">{card.value}</p>
            <p className="text-xs text-gray-500">{card.title}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4">📈 Doanh thu 7 ngày</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}tr`} />
              <Tooltip formatter={(v: number) => [formatVND(v), 'Doanh thu']} />
              <Line type="monotone" dataKey="revenue" stroke="#E31937" strokeWidth={2.5} dot={{ fill: '#E31937', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4">📊 Đơn hàng theo ngày</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => [v, 'Đơn hàng']} />
              <Bar dataKey="orders" fill="#E31937" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom tables */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Pending products */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Clock size={16} className="text-orange-500" /> Sản phẩm chờ duyệt
              <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-0.5 rounded-full">12</span>
            </h3>
            <Link href="/admin/products" className="text-xs text-[#E31937] font-semibold hover:underline">Xem tất cả</Link>
          </div>
          <ul className="divide-y divide-gray-50">
            {pendingProducts.map((p) => (
              <li key={p.id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors">
                <div className="flex-1 min-w-0 mr-3">
                  <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                  <p className="text-xs text-gray-500">{p.shop} · {p.category} · {p.submittedAt}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-sm font-bold text-[#E31937]">{formatVND(p.price)}</span>
                  <Link href={`/admin/products/${p.id}`}>
                    <button className="text-[10px] bg-[#E31937] text-white px-2.5 py-1 rounded-lg hover:bg-red-700 font-semibold">Duyệt</button>
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Recent orders */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <ShoppingBag size={16} className="text-blue-500" /> Đơn hàng gần đây
            </h3>
            <Link href="/admin/orders" className="text-xs text-[#E31937] font-semibold hover:underline">Xem tất cả</Link>
          </div>
          <ul className="divide-y divide-gray-50">
            {recentOrders.map((o) => (
              <li key={o.id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors">
                <div>
                  <p className="text-sm font-medium text-gray-900">#{o.id}</p>
                  <p className="text-xs text-gray-500">{o.customer} · {o.time}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-900">{formatVND(o.total)}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusMap[o.status]?.color}`}>
                    {statusMap[o.status]?.label}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
