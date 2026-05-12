import React from 'react';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

interface RouteStatus {
  path: string;
  name: string;
  status: 'implemented' | 'partial' | 'not-implemented';
  description: string;
  component?: string;
}

const RouteStatus: React.FC = () => {
  const routes: RouteStatus[] = [
    // Navigation Bar Routes
    { path: '/about', name: 'Giới thiệu', status: 'not-implemented', description: 'Chưa có trang About' },
    { path: '/', name: 'Trưng bày', status: 'implemented', description: 'ProductMarketplace - Hoạt động' },
    { path: '/contact', name: 'Liên hệ', status: 'not-implemented', description: 'Chưa có trang Contact' },
    
    // Authentication Routes
    { path: '/login', name: 'Đăng nhập', status: 'implemented', description: 'Login function trong Header' },
    { path: '/register', name: 'Đăng ký', status: 'not-implemented', description: 'Chưa có trang Register' },
    
    // Profile Dropdown Routes
    { path: '/profile/settings', name: 'Cài đặt tài khoản', status: 'not-implemented', description: 'Chưa có trang Settings' },
    { path: '/orders', name: 'Đơn mua', status: 'implemented', description: 'OrderManagement component' },
    { path: '/shop/orders', name: 'Đơn bán', status: 'not-implemented', description: 'Chưa có trang shop orders' },
    { path: '/cart', name: 'Giỏ hàng', status: 'implemented', description: 'Cart component' },
    { path: '/favorites', name: 'Yêu thích', status: 'not-implemented', description: 'Chưa có trang Favorites' },
    { path: '/profile/addresses', name: 'Sổ địa chỉ', status: 'not-implemented', description: 'Chưa có trang Addresses' },
    { path: '/wallet', name: 'Ví của tôi', status: 'not-implemented', description: 'Chưa có trang Wallet' },
    { path: '/shop/dashboard', name: 'Shop của tôi', status: 'not-implemented', description: 'Chưa có trang Shop Dashboard' },
    
    // Seller Routes
    { path: '/become-seller', name: 'Trở thành người bán hàng', status: 'implemented', description: 'BecomeSeller component' },
    { path: '/seller-approval', name: 'Duyệt tài khoản seller', status: 'implemented', description: 'SellerApprovalWorkflow component' },
    { path: '/admin/seller-applications', name: 'Quản lý hồ sơ seller', status: 'implemented', description: 'SellerApplicationManagement component' },
    
    // Other Routes
    { path: '/checkout', name: 'Thanh toán', status: 'implemented', description: 'Checkout component' },
    { path: '/product/:id', name: 'Chi tiết sản phẩm', status: 'implemented', description: 'ProductDetail component' },
    { path: '/search', name: 'Tìm kiếm', status: 'implemented', description: 'SearchResultsPage component' },
    { path: '/development-plan', name: 'Kế hoạch', status: 'not-implemented', description: 'Chưa có trang DevelopmentPlan' },
    { path: '/activities', name: 'Hoạt động', status: 'not-implemented', description: 'Chưa có trang Activities' },
    { path: '/legal', name: 'Văn bản pháp lý', status: 'not-implemented', description: 'Chưa có trang Legal' },
    { path: '/media', name: 'Media', status: 'not-implemented', description: 'Chưa có trang Media' },
    
    // Role-based Routes
    { path: '/customer', name: 'Customer View', status: 'implemented', description: 'CustomerView component' },
    { path: '/moderator', name: 'Moderator View', status: 'implemented', description: 'ModeratorView component' },
    { path: '/admin', name: 'Admin View', status: 'implemented', description: 'AdminView component' },
    { path: '/carrier', name: 'Carrier View', status: 'implemented', description: 'CarrierView component' },
    { path: '/shop-owner', name: 'Shop Owner View', status: 'implemented', description: 'ShopView component' },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'implemented':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'partial':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'not-implemented':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'implemented':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'partial':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'not-implemented':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'implemented':
        return 'Đã triển khai';
      case 'partial':
        return 'Đang triển khai';
      case 'not-implemented':
        return 'Chưa triển khai';
      default:
        return 'Không xác định';
    }
  };

  const implementedCount = routes.filter(r => r.status === 'implemented').length;
  const notImplementedCount = routes.filter(r => r.status === 'not-implemented').length;
  const partialCount = routes.filter(r => r.status === 'partial').length;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Trạng thái triển khai Routes</h1>
          
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600">Đã triển khai</p>
                  <p className="text-2xl font-bold text-green-700">{implementedCount}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
            
            <div className="bg-red-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-600">Chưa triển khai</p>
                  <p className="text-2xl font-bold text-red-700">{notImplementedCount}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            </div>
            
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-600">Đang triển khai</p>
                  <p className="text-2xl font-bold text-yellow-700">{partialCount}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
          </div>

          {/* Routes Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Path</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tên</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Mô tả</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Component</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {routes.map((route, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm font-mono text-gray-900">{route.path}</td>
                    <td className="px-4 py-2 text-sm font-medium text-gray-900">{route.name}</td>
                    <td className="px-4 py-2">
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(route.status)}`}>
                        {getStatusIcon(route.status)}
                        {getStatusText(route.status)}
                      </div>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-600">{route.description}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">{route.component || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Priority Development List */}
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Cần ưu tiên phát triển:</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {routes.filter(r => r.status === 'not-implemented').map((route, index) => (
                <div key={index} className="border border-red-200 rounded-lg p-4 bg-red-50">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-red-900">{route.name}</h3>
                    <XCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <p className="text-sm text-red-700 mb-2">{route.description}</p>
                  <p className="text-xs text-red-600 font-mono">{route.path}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteStatus;
