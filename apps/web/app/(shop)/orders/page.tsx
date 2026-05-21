'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Lock, CheckCircle, AlertTriangle, ChevronRight, RotateCcw } from 'lucide-react';

type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED' | 'RETURNING';

interface BuyerOrder {
  id: string;
  code: string;
  shop: string;
  date: string;
  total: number;
  status: OrderStatus;
  items: { name: string; image: string; qty: number; price: number }[];
  autoConfirmDays?: number;
}

const mockOrders: BuyerOrder[] = [
  {
    id: '1', code: 'ACF001234', shop: 'CenterCare by IVS', date: '21/05/2026', total: 8588000, status: 'SHIPPING',
    items: [
      { name: 'Tai nghe Sony WH-1000XM5', image: 'IMG1', qty: 1, price: 7990000 },
      { name: 'Áo Uniqlo Dry-EX', image: 'IMG2', qty: 2, price: 299000 },
    ],
    autoConfirmDays: 5,
  },
  {
    id: '2', code: 'ACF001235', shop: 'TechWorld Store', date: '20/05/2026', total: 11990000, status: 'CONFIRMED',
    items: [{ name: 'Apple Watch Series 9', image: 'IMG3', qty: 1, price: 11990000 }],
  },
  {
    id: '3', code: 'ACF001233', shop: 'BeautyPlus', date: '18/05/2026', total: 1350000, status: 'DELIVERED',
    items: [{ name: 'Kem dưỡng da Innisfree', image: 'IMG4', qty: 3, price: 450000 }],
  },
  {
    id: '4', code: 'ACF001230', shop: 'Nike Official', date: '15/05/2026', total: 3290000, status: 'CANCELLED',
    items: [{ name: 'Giày Nike Air Max 270', image: 'IMG5', qty: 1, price: 3290000 }],
  },
  {
    id: '5', code: 'ACF001228', shop: 'FashionHub', date: '12/05/2026', total: 2890000, status: 'RETURNING',
    items: [{ name: 'Kính Ray-Ban Aviator', image: 'IMG6', qty: 1, price: 2890000 }],
  },
];

const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
  PENDING:   { label: 'Chờ xác nhận', className: 'bg-yellow-100 text-yellow-700' },
  CONFIRMED: { label: 'Đang xử lý',   className: 'bg-blue-100 text-blue-700' },
  SHIPPING:  { label: 'Đang giao',    className: 'bg-purple-100 text-purple-700' },
  DELIVERED: { label: 'Đã giao',      className: 'bg-green-100 text-green-700' },
  CANCELLED: { label: 'Đã hủy',       className: 'bg-gray-100 text-gray-500' },
  RETURNING: { label: 'Đang hoàn trả', className: 'bg-orange-100 text-orange-700' },
};

const tabs: { key: string; label: string }[] = [
  { key: 'ALL', label: 'Tất cả' },
  { key: 'PENDING', label: 'Chờ xác nhận' },
  { key: 'SHIPPING', label: 'Đang giao' },
  { key: 'DELIVERED', label: 'Đã nhận' },
  { key: 'CANCELLED', label: 'Đã hủy' },
  { key: 'RETURNING', label: 'Hoàn trả' },
];

export default function BuyerOrdersPage() {
  const [activeTab, setActiveTab] = useState('ALL');
  const [confirmedOrders, setConfirmedOrders] = useState<string[]>([]);

  const filtered = activeTab === 'ALL' ? mockOrders : mockOrders.filter(o => o.status === activeTab);

  const handleConfirmReceived = (id: string) => {
    setConfirmedOrders(prev => [...prev, id]);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Đơn hàng của tôi</h1>
        <p className="text-gray-500 text-sm mt-1">Theo dõi trạng thái và lịch sử đơn hàng</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.key ? 'bg-[#E31937] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Order cards */}
      <div className="space-y-4">
        {filtered.map(order => {
          const isConfirmed = confirmedOrders.includes(order.id);
          return (
            <div key={order.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              {/* Card header */}
              <div className="flex items-center justify-between px-5 py-4 bg-gray-50 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center text-[#E31937] font-bold text-xs">
                    {order.shop[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{order.shop}</p>
                    <p className="text-xs text-gray-400">Đặt ngày {order.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-gray-400">#{order.code}</span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig[order.status].className}`}>
                    {isConfirmed && order.status === 'SHIPPING' ? statusConfig['DELIVERED'].label : statusConfig[order.status].label}
                  </span>
                </div>
              </div>

              {/* Products */}
              <div className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex gap-2">
                    {order.items.slice(0, 3).map((item, i) => (
                      <div key={i} className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
                        <div className="w-7 h-7 bg-gray-200 rounded" />
                      </div>
                    ))}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800 line-clamp-1">{order.items[0].name}</p>
                    {order.items.length > 1 && (
                      <p className="text-xs text-gray-400">và {order.items.length - 1} sản phẩm khác</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Escrow status for SHIPPING orders */}
              {order.status === 'SHIPPING' && !isConfirmed && (
                <div className="mx-5 mb-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-start gap-2 mb-3">
                    <Lock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-900">
                        Tiền đang được giữ an toàn — Xác nhận nhận hàng để người bán nhận tiền
                      </p>
                      {order.autoConfirmDays && (
                        <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Tự động xác nhận sau <span className="font-bold">{order.autoConfirmDays} ngày</span> nếu không có phản hồi
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleConfirmReceived(order.id)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-semibold transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Tôi đã nhận hàng
                  </button>
                </div>
              )}

              {/* Confirmed state */}
              {isConfirmed && order.status === 'SHIPPING' && (
                <div className="mx-5 mb-4 bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2 text-sm text-green-700">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span className="font-medium">Đã xác nhận nhận hàng — Tiền đã được giải phóng cho người bán</span>
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
                <div className="text-sm">
                  <span className="text-gray-500">Tổng cộng: </span>
                  <span className="font-bold text-[#E31937] text-base">{order.total.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex gap-2">
                  {order.status === 'DELIVERED' && (
                    <button className="px-3 py-1.5 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-lg text-xs font-medium transition-colors">
                      Mua lại
                    </button>
                  )}
                  {(order.status === 'SHIPPING' || order.status === 'DELIVERED') && !isConfirmed && (
                    <button className="flex items-center gap-1.5 px-3 py-1.5 border border-red-200 hover:bg-red-50 text-red-600 rounded-lg text-xs font-medium transition-colors">
                      <RotateCcw className="w-3.5 h-3.5" />
                      Yêu cầu hoàn tiền
                    </button>
                  )}
                  <Link href={`/orders/${order.code}`}
                    className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium transition-colors">
                    Chi tiết <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <div className="text-5xl mb-4">📦</div>
            <p className="text-gray-500 font-medium">Không có đơn hàng nào</p>
            <Link href="/products" className="mt-4 inline-block text-[#E31937] hover:underline text-sm">
              Mua sắm ngay →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
