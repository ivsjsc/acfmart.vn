'use client';
import { useState } from 'react';
import { X, Package, Truck, CheckCircle, XCircle, Clock, Eye } from 'lucide-react';

type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED';

interface Order {
  id: string;
  code: string;
  customer: string;
  phone: string;
  address: string;
  items: { name: string; qty: number; price: number }[];
  total: number;
  paymentMethod: string;
  status: OrderStatus;
  createdAt: string;
  trackingCode?: string;
  escrowAmount: number;
}

const mockOrders: Order[] = [
  { id: '1', code: 'ACF001234', customer: 'Nguyễn Văn An', phone: '0901234567', address: '123 Lê Lợi, Q.1, TP.HCM', items: [{ name: 'Tai nghe Sony WH-1000XM5', qty: 1, price: 7990000 }], total: 7990000, paymentMethod: 'Chuyển khoản', status: 'PENDING', createdAt: '21/05/2026 08:30', escrowAmount: 7990000 },
  { id: '2', code: 'ACF001235', customer: 'Trần Thị Bình', phone: '0912345678', address: '45 Nguyễn Huệ, Q.1, TP.HCM', items: [{ name: 'Apple Watch Series 9', qty: 1, price: 11990000 }, { name: 'Dây đeo thêm', qty: 2, price: 250000 }], total: 12490000, paymentMethod: 'MoMo', status: 'CONFIRMED', createdAt: '20/05/2026 14:15', escrowAmount: 12490000 },
  { id: '3', code: 'ACF001236', customer: 'Lê Minh Châu', phone: '0923456789', address: '78 Trần Hưng Đạo, Q.5, TP.HCM', items: [{ name: 'Giày Nike Air Max 270', qty: 1, price: 3290000 }], total: 3290000, paymentMethod: 'COD', status: 'SHIPPING', createdAt: '19/05/2026 10:00', trackingCode: 'GHN8823456', escrowAmount: 3290000 },
  { id: '4', code: 'ACF001237', customer: 'Phạm Thu Dung', phone: '0934567890', address: '12 Võ Văn Tần, Q.3, TP.HCM', items: [{ name: 'Kính Ray-Ban Aviator', qty: 1, price: 2890000 }], total: 2890000, paymentMethod: 'ZaloPay', status: 'DELIVERED', createdAt: '18/05/2026 09:45', escrowAmount: 0 },
  { id: '5', code: 'ACF001238', customer: 'Hoàng Văn Em', phone: '0945678901', address: '56 Điện Biên Phủ, Q.Bình Thạnh, TP.HCM', items: [{ name: 'Kem Innisfree', qty: 3, price: 450000 }], total: 1350000, paymentMethod: 'Thẻ tín dụng', status: 'CANCELLED', createdAt: '17/05/2026 16:20', escrowAmount: 0 },
  { id: '6', code: 'ACF001239', customer: 'Vũ Ngọc Phương', phone: '0956789012', address: '90 Cách Mạng Tháng 8, Q.3, TP.HCM', items: [{ name: 'Áo Uniqlo Dry-EX', qty: 2, price: 299000 }], total: 598000, paymentMethod: 'MoMo', status: 'PENDING', createdAt: '21/05/2026 07:10', escrowAmount: 598000 },
  { id: '7', code: 'ACF001240', customer: 'Đặng Thị Giang', phone: '0967890123', address: '34 Nam Kỳ Khởi Nghĩa, Q.3, TP.HCM', items: [{ name: 'Tai nghe Sony WH-1000XM5', qty: 1, price: 7990000 }], total: 7990000, paymentMethod: 'Chuyển khoản', status: 'SHIPPING', createdAt: '20/05/2026 11:30', trackingCode: 'GHN9934512', escrowAmount: 7990000 },
  { id: '8', code: 'ACF001241', customer: 'Bùi Thanh Hải', phone: '0978901234', address: '67 Lý Tự Trọng, Q.1, TP.HCM', items: [{ name: 'Apple Watch Series 9', qty: 1, price: 11990000 }], total: 11990000, paymentMethod: 'ZaloPay', status: 'CONFIRMED', createdAt: '19/05/2026 15:00', escrowAmount: 11990000 },
  { id: '9', code: 'ACF001242', customer: 'Ngô Minh Ích', phone: '0989012345', address: '23 Hai Bà Trưng, Q.1, TP.HCM', items: [{ name: 'Kính Ray-Ban', qty: 1, price: 2890000 }, { name: 'Hộp bảo quản', qty: 1, price: 150000 }], total: 3040000, paymentMethod: 'COD', status: 'DELIVERED', createdAt: '16/05/2026 13:25', escrowAmount: 0 },
  { id: '10', code: 'ACF001243', customer: 'Trịnh Thu Khanh', phone: '0990123456', address: '89 Pasteur, Q.3, TP.HCM', items: [{ name: 'Kem Innisfree', qty: 5, price: 450000 }], total: 2250000, paymentMethod: 'MoMo', status: 'PENDING', createdAt: '21/05/2026 06:50', escrowAmount: 2250000 },
];

const statusConfig: Record<OrderStatus, { label: string; className: string; icon: React.ReactNode }> = {
  PENDING:   { label: 'Chờ xác nhận', className: 'bg-yellow-100 text-yellow-700', icon: <Clock className="w-3 h-3" /> },
  CONFIRMED: { label: 'Đang xử lý',   className: 'bg-blue-100 text-blue-700',   icon: <Package className="w-3 h-3" /> },
  SHIPPING:  { label: 'Đang giao',    className: 'bg-purple-100 text-purple-700', icon: <Truck className="w-3 h-3" /> },
  DELIVERED: { label: 'Đã giao',      className: 'bg-green-100 text-green-700',  icon: <CheckCircle className="w-3 h-3" /> },
  CANCELLED: { label: 'Đã hủy',       className: 'bg-red-100 text-red-700',      icon: <XCircle className="w-3 h-3" /> },
};

const tabs: { key: string; label: string }[] = [
  { key: 'ALL', label: 'Tất cả' },
  { key: 'PENDING', label: 'Chờ xác nhận' },
  { key: 'CONFIRMED', label: 'Đang xử lý' },
  { key: 'SHIPPING', label: 'Đang giao' },
  { key: 'DELIVERED', label: 'Đã giao' },
  { key: 'CANCELLED', label: 'Đã hủy' },
];

export default function SellerOrdersPage() {
  const [activeTab, setActiveTab] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [trackingInput, setTrackingInput] = useState('');
  const [orders, setOrders] = useState<Order[]>(mockOrders);

  const filtered = activeTab === 'ALL' ? orders : orders.filter(o => o.status === activeTab);
  const pendingCount = orders.filter(o => o.status === 'PENDING').length;

  const confirmOrder = (id: string) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'CONFIRMED' as OrderStatus } : o));
    setSelectedOrder(null);
  };

  const shipOrder = (id: string, code: string) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'SHIPPING' as OrderStatus, trackingCode: code } : o));
    setSelectedOrder(null);
    setTrackingInput('');
  };

  const timeline = (order: Order) => {
    const steps = [
      { label: 'Đặt hàng', done: true, time: order.createdAt },
      { label: 'Xác nhận', done: ['CONFIRMED','SHIPPING','DELIVERED'].includes(order.status), time: '' },
      { label: 'Đang giao', done: ['SHIPPING','DELIVERED'].includes(order.status), time: '' },
      { label: 'Đã nhận', done: order.status === 'DELIVERED', time: '' },
    ];
    return steps;
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Đơn hàng</h1>
        <p className="text-gray-500 text-sm mt-1">Quản lý và xử lý đơn hàng của shop bạn</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
            {tab.key === 'PENDING' && pendingCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#E31937] text-white text-xs rounded-full flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Mã đơn</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Khách hàng</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Sản phẩm</th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase px-4 py-3">Tổng tiền</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Thanh toán</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Trạng thái</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Ngày đặt</th>
                <th className="text-center text-xs font-medium text-gray-500 uppercase px-4 py-3">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(order => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-mono font-medium text-[#E31937]">#{order.code}</td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-900">{order.customer}</p>
                    <p className="text-xs text-gray-400">{order.phone}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-gray-700 line-clamp-1 max-w-[160px]">{order.items[0].name}</p>
                    {order.items.length > 1 && <p className="text-xs text-gray-400">+{order.items.length - 1} sản phẩm khác</p>}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                    {order.total.toLocaleString('vi-VN')}đ
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{order.paymentMethod}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig[order.status].className}`}>
                      {statusConfig[order.status].icon}
                      {statusConfig[order.status].label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{order.createdAt}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-12 text-center text-gray-400">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Không có đơn hàng nào</p>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Chi tiết đơn #{selectedOrder.code}</h2>
                <p className="text-sm text-gray-500 mt-0.5">{selectedOrder.createdAt}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Timeline */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Trạng thái đơn hàng</h3>
                <div className="flex items-center gap-2">
                  {timeline(selectedOrder).map((step, i) => (
                    <div key={i} className="flex items-center flex-1 last:flex-none">
                      <div className="flex flex-col items-center">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step.done ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                          {step.done ? '✓' : i + 1}
                        </div>
                        <p className={`text-xs mt-1 text-center ${step.done ? 'text-green-600 font-medium' : 'text-gray-400'}`}>{step.label}</p>
                      </div>
                      {i < 3 && <div className={`flex-1 h-0.5 mb-4 mx-1 ${step.done ? 'bg-green-500' : 'bg-gray-200'}`} />}
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer info */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Thông tin khách hàng</h3>
                <p className="text-sm text-gray-800 font-medium">{selectedOrder.customer}</p>
                <p className="text-sm text-gray-500">{selectedOrder.phone}</p>
                <p className="text-sm text-gray-500 mt-1">📍 {selectedOrder.address}</p>
              </div>

              {/* Items */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Sản phẩm</h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-gray-700">{item.name} × {item.qty}</span>
                      <span className="font-medium text-gray-900">{(item.price * item.qty).toLocaleString('vi-VN')}đ</span>
                    </div>
                  ))}
                  <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold">
                    <span>Tổng cộng</span>
                    <span className="text-[#E31937]">{selectedOrder.total.toLocaleString('vi-VN')}đ</span>
                  </div>
                </div>
              </div>

              {/* Escrow Panel */}
              {selectedOrder.escrowAmount > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">🔒</span>
                    <h3 className="text-sm font-semibold text-blue-900">Tiền đang được giữ bởi ACFmart Escrow</h3>
                  </div>
                  <p className="text-2xl font-bold text-blue-700 mb-1">
                    {selectedOrder.escrowAmount.toLocaleString('vi-VN')}đ
                  </p>
                  <p className="text-xs text-blue-600">
                    Tiền sẽ được giải phóng sau khi khách hàng xác nhận nhận hàng thành công (tối đa 7 ngày).
                  </p>
                </div>
              )}

              {/* Tracking input */}
              {selectedOrder.status === 'CONFIRMED' && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Cập nhật mã vận đơn</h3>
                  <div className="flex gap-2">
                    <input
                      value={trackingInput}
                      onChange={e => setTrackingInput(e.target.value)}
                      placeholder="Nhập mã vận đơn GHN/GHTK..."
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                    <button
                      onClick={() => shipOrder(selectedOrder.id, trackingInput)}
                      disabled={!trackingInput.trim()}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Xác nhận giao
                    </button>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                {selectedOrder.status === 'PENDING' && (
                  <button
                    onClick={() => confirmOrder(selectedOrder.id)}
                    className="flex-1 py-2.5 bg-[#E31937] hover:bg-red-700 text-white rounded-lg font-medium text-sm transition-colors"
                  >
                    ✓ Xác nhận đơn hàng
                  </button>
                )}
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="flex-1 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-lg font-medium text-sm transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
