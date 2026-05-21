'use client';
import { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Copy, Check, Download, TrendingUp, MousePointer, ShoppingBag, Percent } from 'lucide-react';

// 30 ngày mock data
const chartData = Array.from({ length: 30 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (29 - i));
  return {
    date: `${d.getDate()}/${d.getMonth() + 1}`,
    commission: Math.floor(Math.random() * 150000) + 10000,
  };
});

const commissions = [
  { date: '21/05/2026', orderId: 'ACF001234', product: 'Tai nghe Sony WH-1000XM5', commission: 79900, status: 'PENDING' },
  { date: '20/05/2026', orderId: 'ACF001231', product: 'Apple Watch Series 9', commission: 119900, status: 'CONFIRMED' },
  { date: '19/05/2026', orderId: 'ACF001228', product: 'Kem Innisfree 3 hộp', commission: 4500, status: 'CONFIRMED' },
  { date: '18/05/2026', orderId: 'ACF001225', product: 'Giày Nike Air Max 270', commission: 32900, status: 'PAID' },
  { date: '17/05/2026', orderId: 'ACF001220', product: 'Áo Uniqlo × 3', commission: 8970, status: 'PAID' },
  { date: '16/05/2026', orderId: 'ACF001218', product: 'Kính Ray-Ban Aviator', commission: 28900, status: 'CANCELLED' },
  { date: '15/05/2026', orderId: 'ACF001215', product: 'Laptop Dell XPS 15', commission: 320000, status: 'CONFIRMED' },
];

const banners = [
  { id: 1, name: 'Banner 728×90 (Leaderboard)', size: '728×90', preview: 'bg-gradient-to-r from-red-500 to-red-700' },
  { id: 2, name: 'Banner 300×250 (Medium)', size: '300×250', preview: 'bg-gradient-to-br from-red-400 to-orange-500' },
  { id: 3, name: 'Banner 160×600 (Skyscraper)', size: '160×600', preview: 'bg-gradient-to-b from-red-600 to-red-800' },
  { id: 4, name: 'Post Facebook 1200×630', size: '1200×630', preview: 'bg-gradient-to-r from-orange-400 to-red-500' },
];

const statusConfig: Record<string, { label: string; className: string }> = {
  PENDING:   { label: 'Chờ xác nhận', className: 'bg-yellow-100 text-yellow-700' },
  CONFIRMED: { label: 'Đã xác nhận',  className: 'bg-blue-100 text-blue-700' },
  PAID:      { label: 'Đã thanh toán', className: 'bg-green-100 text-green-700' },
  CANCELLED: { label: 'Đã hủy',       className: 'bg-gray-100 text-gray-500' },
};

const formatCurrency = (v: number) => {
  if (v >= 1000) return `${(v / 1000).toFixed(0)}K`;
  return v.toString();
};

export default function AffiliatePage() {
  const [copied, setCopied] = useState(false);
  const refLink = 'https://acfmart.vn/?ref=ACF-TRI3T-2026';

  const copyLink = () => {
    navigator.clipboard?.writeText(refLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const totalCommission = commissions.filter(c => c.status !== 'CANCELLED').reduce((s, c) => s + c.commission, 0);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-2xl p-8 text-white mb-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white translate-y-1/2 -translate-x-1/2" />
        </div>
        <div className="relative">
          <h1 className="text-3xl font-bold mb-2">ACFMart Affiliate Program</h1>
          <p className="text-purple-200 text-base mb-4">Kiếm hoa hồng khi giới thiệu bạn bè mua sắm trên ACFMart</p>
          <div className="flex gap-4 text-sm">
            <div className="bg-white/20 rounded-xl px-4 py-2">
              <p className="text-purple-200 text-xs">Hoa hồng mỗi đơn</p>
              <p className="font-bold text-lg">1% – 5%</p>
            </div>
            <div className="bg-white/20 rounded-xl px-4 py-2">
              <p className="text-purple-200 text-xs">Cookie có hạn</p>
              <p className="font-bold text-lg">30 ngày</p>
            </div>
            <div className="bg-white/20 rounded-xl px-4 py-2">
              <p className="text-purple-200 text-xs">Thanh toán</p>
              <p className="font-bold text-lg">Hàng tuần</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Hoa hồng earned', value: `${(totalCommission / 1000).toFixed(0)}K đ`, icon: <TrendingUp className="w-5 h-5" />, color: 'text-green-600', bg: 'bg-green-100' },
          { label: 'Tổng click', value: '342', icon: <MousePointer className="w-5 h-5" />, color: 'text-blue-600', bg: 'bg-blue-100' },
          { label: 'Đơn thành công', value: '18', icon: <ShoppingBag className="w-5 h-5" />, color: 'text-purple-600', bg: 'bg-purple-100' },
          { label: 'Tỷ lệ chuyển đổi', value: '5.3%', icon: <Percent className="w-5 h-5" />, color: 'text-orange-600', bg: 'bg-orange-100' },
        ].map(s => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-500">{s.label}</p>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.bg} ${s.color}`}>
                {s.icon}
              </div>
            </div>
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Referral link */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
        <h2 className="text-base font-semibold text-gray-900 mb-3">Link giới thiệu của bạn</h2>
        <div className="flex gap-2 mb-3">
          <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-700 font-mono truncate">
            {refLink}
          </div>
          <button onClick={copyLink}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors shrink-0 ${
              copied ? 'bg-green-500 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}>
            {copied ? <><Check className="w-4 h-4" />Đã sao chép</> : <><Copy className="w-4 h-4" />Sao chép</>}
          </button>
        </div>
        <div className="flex gap-2">
          <button className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
            📘 Chia sẻ Facebook
          </button>
          <button className="flex-1 py-2 bg-blue-400 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors">
            💬 Chia sẻ Zalo
          </button>
          <button className="flex-1 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors">
            📱 WhatsApp
          </button>
        </div>
      </div>

      {/* Commission chart */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Hoa hồng 30 ngày gần đây</h2>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} interval={4} />
            <YAxis tickFormatter={formatCurrency} tick={{ fontSize: 10, fill: '#9ca3af' }} />
            <Tooltip
              formatter={(v: number) => [`${v.toLocaleString('vi-VN')}đ`, 'Hoa hồng']}
              contentStyle={{ fontSize: 12, borderRadius: 8 }}
            />
            <Line type="monotone" dataKey="commission" stroke="#7c3aed" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Commission table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Lịch sử hoa hồng</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Ngày</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Đơn hàng</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Sản phẩm</th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase px-5 py-3">Hoa hồng</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {commissions.map((c, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 text-sm text-gray-500">{c.date}</td>
                  <td className="px-5 py-3 text-sm font-mono text-[#E31937]">#{c.orderId}</td>
                  <td className="px-5 py-3 text-sm text-gray-700 max-w-[180px] truncate">{c.product}</td>
                  <td className="px-5 py-3 text-right text-sm font-semibold text-green-600">
                    +{c.commission.toLocaleString('vi-VN')}đ
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig[c.status].className}`}>
                      {statusConfig[c.status].label}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Marketing resources */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Tài nguyên marketing</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {banners.map(banner => (
            <div key={banner.id} className="border border-gray-200 rounded-xl overflow-hidden">
              <div className={`h-20 ${banner.preview} flex items-center justify-center`}>
                <span className="text-white text-xs font-bold opacity-80">ACFMart</span>
              </div>
              <div className="p-3">
                <p className="text-xs font-medium text-gray-800 line-clamp-1">{banner.name}</p>
                <p className="text-xs text-gray-400">{banner.size}</p>
                <button className="mt-2 w-full flex items-center justify-center gap-1.5 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs text-gray-600 font-medium transition-colors">
                  <Download className="w-3.5 h-3.5" />
                  Tải xuống
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
