'use client';
import { useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { TrendingUp, ShoppingBag, CreditCard, RotateCcw } from 'lucide-react';

// Generate 30 days of mock data
const generateDaily = () => {
  const data = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const label = `${d.getDate()}/${d.getMonth() + 1}`;
    data.push({
      date: label,
      revenue: Math.floor(Math.random() * 15000000) + 5000000,
      orders: Math.floor(Math.random() * 30) + 5,
    });
  }
  return data;
};

const dailyData = generateDaily();

const categoryData = [
  { name: 'Điện tử', value: 45600000 },
  { name: 'Thời trang', value: 28900000 },
  { name: 'Làm đẹp', value: 18700000 },
  { name: 'Phụ kiện', value: 12300000 },
  { name: 'Thể thao', value: 9800000 },
];

const topProducts = [
  { rank: 1, name: 'Tai nghe Sony WH-1000XM5', sold: 156, revenue: 1246440000 },
  { rank: 2, name: 'Apple Watch Series 9', sold: 89, revenue: 1067110000 },
  { rank: 3, name: 'Áo Uniqlo Dry-EX', sold: 567, revenue: 169533000 },
  { rank: 4, name: 'Kem Innisfree', sold: 312, revenue: 140400000 },
  { rank: 5, name: 'Kính Ray-Ban Aviator', sold: 45, revenue: 130050000 },
];

const sourceData = [
  { name: 'Trực tiếp', value: 40 },
  { name: 'Affiliate', value: 25 },
  { name: 'Mạng xã hội', value: 20 },
  { name: 'Tìm kiếm', value: 15 },
];

const COLORS = ['#E31937', '#f59e0b', '#3b82f6', '#10b981'];
const rankMedals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];

const formatCurrency = (v: number) => {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
  return v.toString();
};

type Range = '7d' | '30d' | '3m';

export default function SellerAnalyticsPage() {
  const [range, setRange] = useState<Range>('30d');

  const rangeData = range === '7d' ? dailyData.slice(-7) : range === '30d' ? dailyData : dailyData;
  const totalRevenue = rangeData.reduce((s, d) => s + d.revenue, 0);
  const totalOrders = rangeData.reduce((s, d) => s + d.orders, 0);
  const avgOrder = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Phân tích doanh thu</h1>
          <p className="text-gray-500 text-sm mt-1">Theo dõi hiệu suất kinh doanh của shop</p>
        </div>
        <div className="flex gap-2">
          {([['7d', '7 ngày'], ['30d', '30 ngày'], ['3m', '3 tháng']] as [Range, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setRange(key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                range === key ? 'bg-[#E31937] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Tổng doanh thu', value: `${(totalRevenue / 1_000_000).toFixed(1)}M đ`, change: '+12.5%', icon: <TrendingUp className="w-5 h-5" />, color: 'text-green-600', bg: 'bg-green-100' },
          { label: 'Số đơn hàng', value: totalOrders.toString(), change: '+8.3%', icon: <ShoppingBag className="w-5 h-5" />, color: 'text-blue-600', bg: 'bg-blue-100' },
          { label: 'Giá trị TB/đơn', value: `${(avgOrder / 1_000).toFixed(0)}K đ`, change: '+3.7%', icon: <CreditCard className="w-5 h-5" />, color: 'text-purple-600', bg: 'bg-purple-100' },
          { label: 'Tỷ lệ hoàn hàng', value: '2.4%', change: '-0.5%', icon: <RotateCcw className="w-5 h-5" />, color: 'text-orange-600', bg: 'bg-orange-100' },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-500">{kpi.label}</p>
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${kpi.bg} ${kpi.color}`}>
                {kpi.icon}
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
            <p className={`text-xs font-medium mt-1 ${kpi.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
              {kpi.change} so với kỳ trước
            </p>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Doanh thu theo ngày</h2>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={rangeData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#E31937" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#E31937" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} />
            <YAxis tickFormatter={formatCurrency} tick={{ fontSize: 11, fill: '#9ca3af' }} />
            <Tooltip
              formatter={(v: number) => [`${v.toLocaleString('vi-VN')}đ`, 'Doanh thu']}
              contentStyle={{ fontSize: 12, borderRadius: 8 }}
            />
            <Area type="monotone" dataKey="revenue" stroke="#E31937" strokeWidth={2} fill="url(#revenueGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Row: Category + Source */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Category bar */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Top danh mục</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={categoryData} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis type="number" tickFormatter={formatCurrency} tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: '#374151' }} width={72} />
              <Tooltip formatter={(v: number) => [`${v.toLocaleString('vi-VN')}đ`, 'Doanh thu']} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Bar dataKey="value" fill="#E31937" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Source pie */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Nguồn đơn hàng</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={sourceData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={3}>
                {sourceData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip formatter={(v: number) => [`${v}%`, '']} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Legend iconSize={10} iconType="circle" formatter={(v) => <span style={{ fontSize: 12, color: '#374151' }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Products Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Top 5 sản phẩm bán chạy</h2>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Hạng</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Sản phẩm</th>
              <th className="text-right text-xs font-medium text-gray-500 uppercase px-5 py-3">Đã bán</th>
              <th className="text-right text-xs font-medium text-gray-500 uppercase px-5 py-3">Doanh thu</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {topProducts.map(p => (
              <tr key={p.rank} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3 text-xl">{rankMedals[p.rank - 1]}</td>
                <td className="px-5 py-3 text-sm font-medium text-gray-900">{p.name}</td>
                <td className="px-5 py-3 text-right text-sm text-gray-700">{p.sold.toLocaleString()}</td>
                <td className="px-5 py-3 text-right text-sm font-semibold text-green-600">
                  {(p.revenue / 1_000_000).toFixed(1)}M đ
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
