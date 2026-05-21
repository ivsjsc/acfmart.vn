'use client';

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer,
} from 'recharts';
import { TrendingUp, TrendingDown, Package, ShoppingBag, Eye, DollarSign, AlertCircle, CheckCircle, Clock } from 'lucide-react';

// Dữ liệu mẫu doanh thu 7 ngày
const revenueData = [
  { date: '15/01', revenue: 8500000, orders: 42 },
  { date: '16/01', revenue: 11200000, orders: 58 },
  { date: '17/01', revenue: 9800000, orders: 51 },
  { date: '18/01', revenue: 14500000, orders: 73 },
  { date: '19/01', revenue: 12300000, orders: 64 },
  { date: '20/01', revenue: 16800000, orders: 89 },
  { date: '21/01', revenue: 18450000, orders: 96 },
];

// Tỷ lệ đơn hàng
const orderStatus = [
  { name: 'Hoàn thành', value: 92, color: '#10B981' },
  { name: 'Đang xử lý', value: 6, color: '#F59E0B' },
  { name: 'Đã hủy', value: 2, color: '#EF4444' },
];

// Sản phẩm bán chạy
const topProducts = [
  { id: '1', name: 'iPhone 16 Pro Max 256GB', sku: 'IPH16PM256', img: 'https://picsum.photos/seed/iphone16/40/40', sold: 124, revenue: 3718760000, views: 4521, rate: 2.74, change: +12.3 },
  { id: '2', name: 'Samsung Galaxy S24 Ultra', sku: 'SS24U512', img: 'https://picsum.photos/seed/samsung24/40/40', sold: 87, revenue: 2348130000, views: 3124, rate: 2.79, change: +8.7 },
  { id: '3', name: 'Kem dưỡng Laneige 70ml', sku: 'LAN70ML', img: 'https://picsum.photos/seed/laneige/40/40', sold: 341, revenue: 153450000, views: 8901, rate: 3.83, change: +22.1 },
  { id: '4', name: 'Nike Air Max 270 React', sku: 'NK270R42', img: 'https://picsum.photos/seed/nike270/40/40', sold: 56, revenue: 179200000, views: 1890, rate: 2.96, change: -3.2 },
  { id: '5', name: 'Logitech MX Master 3S', sku: 'LGMXM3S', img: 'https://picsum.photos/seed/logitech/40/40', sold: 43, revenue: 81270000, views: 987, rate: 4.36, change: +15.8 },
];

function formatVND(n: number) {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}tỷ`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}tr`;
  return new Intl.NumberFormat('vi-VN').format(n) + 'đ';
}

interface MetricCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  iconBg: string;
}

function MetricCard({ title, value, change, icon, iconBg }: MetricCardProps) {
  const positive = change >= 0;
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 ${iconBg} rounded-lg flex items-center justify-center`}>{icon}</div>
        <span className={`flex items-center gap-1 text-xs font-semibold ${positive ? 'text-green-600' : 'text-red-500'}`}>
          {positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {positive ? '+' : ''}{change}%
        </span>
      </div>
      <p className="text-2xl font-black text-gray-900 mb-1">{value}</p>
      <p className="text-xs text-gray-500">{title} <span className="text-gray-400">so với tuần trước</span></p>
    </div>
  );
}

export default function SellerDashboardPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Xin chào, IVS Shop 👋</h1>
          <p className="text-gray-500 text-sm mt-1">Thứ Hai, 21 tháng 5 năm 2025 | Dữ liệu cập nhật lúc 08:32</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1.5 rounded-full border border-amber-200">
            ⭐ Gói Seller Pro
          </span>
          <button className="btn-primary text-sm py-2">+ Thêm sản phẩm</button>
        </div>
      </div>

      {/* 4 Metric cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard
          title="Doanh thu tháng này"
          value="12,45tr"
          change={28.5}
          icon={<DollarSign size={18} className="text-orange-600" />}
          iconBg="bg-orange-100"
        />
        <MetricCard
          title="Đơn hàng mới"
          value="156"
          change={18.7}
          icon={<ShoppingBag size={18} className="text-blue-600" />}
          iconBg="bg-blue-100"
        />
        <MetricCard
          title="Sản phẩm đã bán"
          value="312"
          change={22.1}
          icon={<Package size={18} className="text-green-600" />}
          iconBg="bg-green-100"
        />
        <MetricCard
          title="Lượt xem shop"
          value="8.456"
          change={15.3}
          icon={<Eye size={18} className="text-yellow-600" />}
          iconBg="bg-yellow-100"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue line chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">📈 Doanh thu 7 ngày gần nhất</h3>
            <select className="text-xs border border-gray-200 rounded-lg px-2 py-1 text-gray-600">
              <option>7 ngày qua</option>
              <option>30 ngày qua</option>
              <option>3 tháng qua</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={revenueData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}tr`} />
              <Tooltip
                formatter={(value: number, name: string) =>
                  name === 'revenue' ? [formatVND(value), 'Doanh thu'] : [value, 'Đơn hàng']
                }
              />
              <Legend formatter={(v) => (v === 'revenue' ? 'Doanh thu' : 'Đơn hàng')} />
              <Line type="monotone" dataKey="revenue" stroke="#E31937" strokeWidth={2.5} dot={{ fill: '#E31937', r: 4 }} />
              <Line type="monotone" dataKey="orders" stroke="#fca5a5" strokeWidth={2} dot={{ fill: '#fca5a5', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Order status pie chart */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4">🥧 Tỷ lệ đơn hàng</h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={orderStatus} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={2}>
                {orderStatus.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(v) => `${v}%`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {orderStatus.map((s) => (
              <div key={s.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-gray-700">{s.name}</span>
                </div>
                <span className="font-bold text-gray-900">{s.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row: Product table + Sidebar */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Product performance table */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-900">🏆 Hiệu suất sản phẩm</h3>
            <div className="flex gap-1">
              {['Bán chạy nhất', 'Lượt xem', 'Tỷ lệ chuyển đổi'].map((tab, i) => (
                <button
                  key={tab}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    i === 0 ? 'bg-[#E31937] text-white' : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  <th className="text-left px-5 py-3">Sản phẩm</th>
                  <th className="text-right px-4 py-3">Đã bán</th>
                  <th className="text-right px-4 py-3">Doanh thu</th>
                  <th className="text-right px-4 py-3">Lượt xem</th>
                  <th className="text-right px-5 py-3">Tỷ lệ %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {topProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <img src={p.img} alt={p.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-900 line-clamp-1">{p.name}</p>
                          <p className="text-xs text-gray-400">SKU: {p.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">{p.sold}</td>
                    <td className="px-4 py-3 text-right text-[#E31937] font-semibold">{formatVND(p.revenue)}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{p.views.toLocaleString('vi-VN')}</td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <span className="text-gray-900 font-medium">{p.rate}%</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${p.change >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                          {p.change >= 0 ? '+' : ''}{p.change}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right sidebar notifications + tasks */}
        <div className="space-y-4">
          {/* Thông báo */}
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-[#E31937] rounded-full animate-pulse"></span>
              Thông báo mới
            </h3>
            <ul className="space-y-2.5">
              {[
                { icon: <ShoppingBag size={14} className="text-blue-500" />, text: '5 đơn hàng mới cần xác nhận', time: '10 phút trước', urgent: true },
                { icon: <AlertCircle size={14} className="text-orange-500" />, text: 'Sản phẩm "iPhone 16" sắp hết hàng (còn 3)', time: '1 giờ trước', urgent: false },
                { icon: <CheckCircle size={14} className="text-green-500" />, text: 'Đơn #ACF12345678 đã giao thành công', time: '2 giờ trước', urgent: false },
                { icon: <DollarSign size={14} className="text-purple-500" />, text: 'Thanh toán 12,450,000đ đã được duyệt', time: 'Hôm qua', urgent: false },
              ].map((n, i) => (
                <li key={i} className={`flex items-start gap-2.5 text-xs p-2 rounded-lg ${n.urgent ? 'bg-red-50' : 'hover:bg-gray-50'}`}>
                  <div className="mt-0.5 flex-shrink-0">{n.icon}</div>
                  <div>
                    <p className={`leading-snug ${n.urgent ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>{n.text}</p>
                    <p className="text-gray-400 mt-0.5">{n.time}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Việc cần làm */}
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Clock size={14} className="text-[#E31937]" /> Việc cần làm hôm nay
            </h3>
            <ul className="space-y-2">
              {[
                { text: 'Xác nhận 5 đơn hàng mới', done: false, priority: 'high' },
                { text: 'Nhập thêm hàng cho iPhone 16', done: false, priority: 'high' },
                { text: 'Trả lời 12 tin nhắn khách hàng', done: false, priority: 'normal' },
                { text: 'Cập nhật ảnh sản phẩm Samsung', done: true, priority: 'normal' },
                { text: 'Xuất báo cáo doanh thu tháng 1', done: true, priority: 'normal' },
              ].map((task, i) => (
                <li key={i} className="flex items-center gap-2.5 text-xs">
                  <div className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center ${
                    task.done ? 'bg-green-500 border-green-500' : task.priority === 'high' ? 'border-red-400' : 'border-gray-300'
                  }`}>
                    {task.done && <CheckCircle size={10} className="text-white" />}
                  </div>
                  <span className={task.done ? 'line-through text-gray-400' : task.priority === 'high' ? 'text-gray-900 font-medium' : 'text-gray-700'}>
                    {task.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Live Commerce banner */}
      <div className="bg-gradient-to-r from-red-600 via-[#E31937] to-orange-500 rounded-xl p-5 text-white flex items-center justify-between">
        <div>
          <p className="text-red-200 text-xs font-medium mb-1">🔴 LIVE COMMERCE</p>
          <h3 className="text-xl font-black mb-1">Tăng doanh thu gấp 5x với Livestream</h3>
          <p className="text-red-100 text-sm">Bắt đầu phiên live bán hàng ngay hôm nay. Tiếp cận hàng nghìn khách hàng trực tiếp.</p>
        </div>
        <button className="flex-shrink-0 bg-white text-[#E31937] font-bold px-5 py-2.5 rounded-full hover:bg-red-50 transition-colors text-sm ml-6">
          Bắt đầu Live →
        </button>
      </div>
    </div>
  );
}
