import React, { useState, useEffect } from 'react';
import { Package, Truck, Clock, CheckCircle, XCircle, AlertCircle, Star, MessageCircle, Download, Eye, Filter, Search, Calendar, ChevronDown, User, MapPin, Phone, CreditCard } from 'lucide-react';

interface Order {
  id: string;
  orderNumber: string;
  status: 'pending' | 'processing' | 'shipping' | 'delivered' | 'cancelled' | 'returned';
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  shippingMethod: string;
  trackingNumber?: string;
  orderDate: string;
  deliveryDate?: string;
  notes?: string;
  shopName: string;
  shopId: string;
}

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  variant?: string;
  shopName: string;
}

const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // Mock data
  useEffect(() => {
    const mockOrders: Order[] = [
      {
        id: '1',
        orderNumber: 'ORD-2024-001',
        status: 'pending',
        customerName: 'Nguyễn Văn A',
        customerEmail: 'nguyenvana@email.com',
        customerPhone: '0912345678',
        customerAddress: '123 Nguyễn Huệ, Quận 1, TP.HCM',
        items: [
          {
            id: '1',
            productId: '1',
            productName: 'iPhone 15 Pro Max',
            productImage: 'https://via.placeholder.com/100x100',
            quantity: 1,
            price: 29990000,
            shopName: 'TechStore'
          }
        ],
        totalAmount: 29990000,
        paymentMethod: 'COD',
        paymentStatus: 'pending',
        shippingMethod: 'Giao hàng nhanh',
        orderDate: '2024-01-15',
        shopName: 'TechStore',
        shopId: 'shop1'
      },
      {
        id: '2',
        orderNumber: 'ORD-2024-002',
        status: 'processing',
        customerName: 'Trần Thị B',
        customerEmail: 'tranthib@email.com',
        customerPhone: '0987654321',
        customerAddress: '456 Lê Lợi, Quận 3, TP.HCM',
        items: [
          {
            id: '2',
            productId: '2',
            productName: 'Samsung Galaxy S24',
            productImage: 'https://via.placeholder.com/100x100',
            quantity: 2,
            price: 19990000,
            shopName: 'MobileWorld'
          }
        ],
        totalAmount: 39980000,
        paymentMethod: 'Chuyển khoản',
        paymentStatus: 'paid',
        shippingMethod: 'Giao hàng tiêu chuẩn',
        orderDate: '2024-01-14',
        shopName: 'MobileWorld',
        shopId: 'shop2'
      }
    ];
    setOrders(mockOrders);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shipping': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'returned': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'processing': return <Package className="w-4 h-4" />;
      case 'shipping': return <Truck className="w-4 h-4" />;
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      case 'returned': return <AlertCircle className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Chờ xác nhận';
      case 'processing': return 'Đang xử lý';
      case 'shipping': return 'Đang giao hàng';
      case 'delivered': return 'Đã giao hàng';
      case 'cancelled': return 'Đã hủy';
      case 'returned': return 'Đã trả hàng';
      default: return status;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-600';
      case 'pending': return 'text-yellow-600';
      case 'failed': return 'text-red-600';
      case 'refunded': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'Đã thanh toán';
      case 'pending': return 'Chờ thanh toán';
      case 'failed': return 'Thanh toán thất bại';
      case 'refunded': return 'Đã hoàn tiền';
      default: return status;
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleUpdateStatus = (orderId: string, newStatus: string) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status: newStatus as Order['status'] } : order
    ));
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Quản lý đơn hàng</h1>
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Download className="w-4 h-4" />
                Xuất Excel
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <Package className="w-4 h-4" />
                Tạo đơn hàng
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo mã đơn hàng, khách hàng..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ xác nhận</option>
              <option value="processing">Đang xử lý</option>
              <option value="shipping">Đang giao hàng</option>
              <option value="delivered">Đã giao hàng</option>
              <option value="cancelled">Đã hủy</option>
              <option value="returned">Đã trả hàng</option>
            </select>

            {/* Date Range */}
            <input
              type="date"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            />

            <input
              type="date"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Chờ xác nhận</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {orders.filter(o => o.status === 'pending').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Đang xử lý</p>
                <p className="text-2xl font-bold text-blue-600">
                  {orders.filter(o => o.status === 'processing').length}
                </p>
              </div>
              <Package className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Đang giao hàng</p>
                <p className="text-2xl font-bold text-purple-600">
                  {orders.filter(o => o.status === 'shipping').length}
                </p>
              </div>
              <Truck className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Đã giao hàng</p>
                <p className="text-2xl font-bold text-green-600">
                  {orders.filter(o => o.status === 'delivered').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã đơn hàng</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khách hàng</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sản phẩm</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng tiền</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thanh toán</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày đặt</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{order.orderNumber}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">{order.customerName}</div>
                        <div className="text-gray-500">{order.customerEmail}</div>
                        <div className="text-gray-500">{order.customerPhone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex items-center gap-2 mb-2">
                            <img src={item.productImage} alt={item.productName} className="w-8 h-8 object-cover rounded" />
                            <div>
                              <div className="font-medium text-gray-900">{item.productName}</div>
                              <div className="text-gray-500">SL: {item.quantity} x {item.price.toLocaleString('vi-VN')}đ</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {order.totalAmount.toLocaleString('vi-VN')}đ
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className={`font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                          {getPaymentStatusText(order.paymentStatus)}
                        </div>
                        <div className="text-gray-500">{order.paymentMethod}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {getStatusText(order.status)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.orderDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewOrder(order)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          className="text-green-600 hover:text-green-900 transition-colors"
                          title="In đơn hàng"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          className="text-gray-600 hover:text-gray-900 transition-colors"
                          title="Nhắn tin khách"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Details Modal */}
        {showOrderDetails && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto m-4">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Chi tiết đơn hàng #{selectedOrder.orderNumber}</h2>
                  <button
                    onClick={() => setShowOrderDetails(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* Order Status */}
                <div className="mb-6">
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${getStatusColor(selectedOrder.status)}`}>
                    {getStatusIcon(selectedOrder.status)}
                    {getStatusText(selectedOrder.status)}
                  </div>
                </div>

                {/* Customer Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Thông tin khách hàng</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{selectedOrder.customerName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{selectedOrder.customerPhone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{selectedOrder.customerAddress}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Thông tin thanh toán</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{selectedOrder.paymentMethod}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-gray-400" />
                        <span className={`text-sm ${getPaymentStatusColor(selectedOrder.paymentStatus)}`}>
                          {getPaymentStatusText(selectedOrder.paymentStatus)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Sản phẩm</h3>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex items-center gap-4 p-4 border-b border-gray-200 last:border-b-0">
                        <img src={item.productImage} alt={item.productName} className="w-16 h-16 object-cover rounded" />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{item.productName}</h4>
                          <p className="text-sm text-gray-500">Shop: {item.shopName}</p>
                          {item.variant && <p className="text-sm text-gray-500">Phân loại: {item.variant}</p>}
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">SL: {item.quantity}</p>
                          <p className="font-medium text-gray-900">{item.price.toLocaleString('vi-VN')}đ</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tạm tính:</span>
                      <span className="font-medium">{selectedOrder.totalAmount.toLocaleString('vi-VN')}đ</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Phí vận chuyển:</span>
                      <span className="font-medium">30.000đ</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
                      <span>Tổng cộng:</span>
                      <span>{(selectedOrder.totalAmount + 30000).toLocaleString('vi-VN')}đ</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 mt-6">
                  {selectedOrder.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(selectedOrder.id, 'processing')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Xác nhận đơn hàng
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(selectedOrder.id, 'cancelled')}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Hủy đơn hàng
                      </button>
                    </>
                  )}
                  {selectedOrder.status === 'processing' && (
                    <button
                      onClick={() => handleUpdateStatus(selectedOrder.id, 'shipping')}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Bắt đầu giao hàng
                    </button>
                  )}
                  {selectedOrder.status === 'shipping' && (
                    <button
                      onClick={() => handleUpdateStatus(selectedOrder.id, 'delivered')}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Xác nhận đã giao hàng
                    </button>
                  )}
                  <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                    In đơn hàng
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderManagement;
