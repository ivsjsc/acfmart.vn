'use client';
import { useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Download, TrendingUp, Users, ShoppingBag, Store, Lock } from 'lucide-react';

// Mock data
const gmvData = Array.from({ length: 30 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (29 - i));
  return {
    date: `${d.getDate()}/${d.getMonth() + 1}`,
    gmv: Math.floor(Math.random() * 500_000_000) + 200_000_000,
    revenue: Math.floor(Math.random() * 25_000_000) + 10_000_000,
  };
});

const categoryData = [
  { name: 'Điện tử', gmv: 850_000_000 },
  { name: 'Thời trang', gmv: 620_000_000 },
  { name: 'Làm đẹp', gmv: 380_000_000 },
  { name: 'Nhà cửa', gmv: 290_000_000 },
  { name: 'Thể thao', gmv: 180_000_000 },
];

const paymentData = [
  { name: 'MoMo', value: 32 },
  { name: 'Chuyển khoản', value: 28 },
  { name: 'COD', value: 20 },
  { name: 'ZaloPay', value: 12 },
  { name: 'Thẻ tín dụng', value: 8 },
];

const topSellers = [
  { rank: 1, name: 'CenterCare by IVS', gmv: 245_000_000, orders: 1234, rating: 4.9 },
  { rank: 2, name: 'TechWorld Official', gmv: 198_000_000, orders: 987, rating: 4.8 },
  { rank: 3, name: 'Nike Vietnam', gmv: 167_000_000, orders: 2345, rating: 4.7 },
  { rank: 4, name: 'BeautyPlus Store', gmv: 134_000_000, orders: 3456, rating: 4.8 },
  { rank: 5, name: 'Apple Premium', gmv: 121_000_000, orders: 567, rating: 4.9 },
];

const topProducts = [
  { rank: 1, name: 'Tai nghe Sony WH-1000XM5', sold: 1567, revenue: 12_519_330_000 },
  { rank: 2, name: 'Apple Watch Series 9', sold: 890, revenue: 10_671_100_000 },
  { rank: 3, name: 'Áo thun Uniqlo Dry-EX', sold: 5678, revenue: 1_697_822_000 },
  { rank: 4, name: 'Kem dưỡng Innisfree', sold: 3120, revenue: 1_404_000_000 },
  { rank: 5, name: 'Giày Nike Air Max 270', sold: 2345, revenue: 7_715_050_000 },
];

const COLORS = ['#E31937', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6'];
const formatB = (v: number) => `${(v / 1_000_000_000).toFixed(2)}B`;
const formatM = (v: number) => `${(v / 1_000_000).toFixed(0)}M`;
const rankMedals = ['🥇', '🥈', '🥉', '4', '5'];

export default function AdminReportsPage() {
  const [dateFrom, setDateFrom] = useState('2026-05-01');
  const [dateTo, setDateTo] = useState('2026-05-21');

  const totalGmv = gmvData.reduce((s, d) => s + d.gmv, 0);
  const totalRevenue = gmvData.reduce((s, d) => s + d.revenue, 0);
  const escrowTotal = 125_680_000;
  const escrowRelease = 45_200_000;
  const escrowDisputes = 7;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Báo cáo nền tảng</h1>
          <p className="text-gray-500 text-sm mt-1">Tổng quan hiệu suất kinh doanh ACFMart</p>
        </div>
        <div className="flex items-center gap-3">
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
          <span className="text-gray-400">—</span>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Tổng GMV', value: formatB(totalGmv), sub: '30 ngày', icon: <TrendingUp className="w-5 h-5" />, color: 'text-green-600', bg: 'bg-green-100', change: '+18.5%' },
          { label: 'Doanh thu nền tảng', value: formatM(totalRevenue) + ' đ', sub: 'Sau khi trừ hoàn', icon: <Store className="w-5 h-5" />, color: 'text-blue-600', bg: 'bg-blue-100', change: '+21.2%' },
          { label: 'Users mới', value: '1.247', sub: 'Tháng này', icon: <Users className="w-5 h-5" />, color: 'text-purple-600', bg: 'bg-purple-100', change: '+9.3%' },
          { label: 'Sellers mới', value: '84', sub: 'Tháng này', icon: <ShoppingBag className="w-5 h-5" />, color: 'text-orange-600', bg: 'bg-orange-100', change: '+14.7%' },
        ].map(kpi => (
          <div key={kpi.label} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-500">{kpi.label}</p>
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${kpi.bg} ${kpi.color}`}>
                {kpi.icon}
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-gray-400">{kpi.sub}</span>
              <span className="text-xs font-medium text-green-600">{kpi.change}</span>
            </div>
          </div>
        ))}
      </div>

      {/* GMV Chart */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Tổng GMV theo ngày</h2>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={gmvData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="gmvGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#E31937" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#E31937" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} interval={3} />
            <YAxis tickFormatter={v => `${(v / 1_000_000).toFixed(0)}M`} tick={{ fontSize: 10, fill: '#9ca3af' }} />
            <Tooltip
              formatter={(v: number) => [`${v.toLocaleString('vi-VN')}đ`, 'GMV']}
              contentStyle={{ fontSize: 12, borderRadius: 8 }}
            />
            <Area type="monotone" dataKey="gmv" stroke="#E31937" strokeWidth={2} fill="url(#gmvGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Row: Category + Payment */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-4">GMV theo danh mục</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={categoryData} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis type="number" tickFormatter={formatM} tick={{ fontSize: 10, fill: '#9ca3af' }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: '#374151' }} width={72} />
              <Tooltip formatter={(v: number) => [`${v.toLocaleString('vi-VN')}đ`]} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Bar dataKey="gmv" fill="#E31937" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Phương thức thanh toán</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={paymentData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                {paymentData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v: number) => [`${v}%`]} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Legend iconSize={10} iconType="circle" formatter={(v) => <span style={{ fontSize: 12, color: '#374151' }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Escrow Report */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Lock className="w-5 h-5 text-blue-700" />
          <h2 className="text-base font-semibold text-blue-900">Báo cáo Escrow</h2>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 text-center border border-blue-100">
            <p className="text-xs text-blue-600 mb-1">Tổng trong Escrow</p>
            <p className="text-xl font-bold text-blue-800">{(escrowTotal / 1_000_000).toFixed(1)}M đ</p>
            <p className="text-xs text-gray-500 mt-1">{topSellers.length * 12} đơn đang chờ</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center border border-blue-100">
            <p className="text-xs text-green-600 mb-1">Giải phóng hôm nay</p>
            <p className="text-xl font-bold text-green-700">{(escrowRelease / 1_000_000).toFixed(1)}M đ</p>
            <p className="text-xs text-gray-500 mt-1">18 đơn được release</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center border border-blue-100">
            <p className="text-xs text-orange-600 mb-1">Disputes đang mở</p>
            <p className="text-xl font-bold text-orange-600">{escrowDisputes}</p>
            <p className="text-xs text-gray-500 mt-1">Cần xử lý thủ công</p>
          </div>
        </div>
      </div>

      {/* Top Sellers + Top Products */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">Top 5 Sellers</h2>
          </div>
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-2.5">#</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-2.5">Shop</th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase px-4 py-2.5">GMV</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {topSellers.map(s => (
                <tr key={s.rank} className="hover:bg-gray-50">
                  <td className="px-4 py-2.5 text-lg">{rankMedals[s.rank - 1]}</td>
                  <td className="px-4 py-2.5">
                    <p className="text-sm font-medium text-gray-800">{s.name}</p>
                    <p className="text-xs text-gray-400">{s.orders.toLocaleString()} đơn • ⭐{s.rating}</p>
                  </td>
                  <td className="px-4 py-2.5 text-right text-sm font-semibold text-green-600">
                    {formatM(s.gmv)}M
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">Top 5 Sản phẩm</h2>
          </div>
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-2.5">#</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-2.5">Sản phẩm</th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase px-4 py-2.5">Đã bán</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {topProducts.map(p => (
                <tr key={p.rank} className="hover:bg-gray-50">
                  <td className="px-4 py-2.5 text-lg">{rankMedals[p.rank - 1]}</td>
                  <td className="px-4 py-2.5 text-sm font-medium text-gray-800 max-w-[160px]">
                    <p className="line-clamp-1">{p.name}</p>
                  </td>
                  <td className="px-4 py-2.5 text-right text-sm font-semibold text-blue-600">
                    {p.sold.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
