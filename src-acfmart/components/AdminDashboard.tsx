import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  BarChart3, 
  Users, 
  Package, 
  ShoppingCart, 
  Truck,
  TrendingUp, 
  DollarSign,
  CreditCard,
  Shield,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  Settings,
  LogOut,
  Eye,
  XCircle
} from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  activeShops: number;
  pendingApplications: number;
  totalOrders: number;
  revenue: number;
  growthRate: number;
}

interface TabItem {
  id: string;
  label: string;
  icon: React.ElementType;
}

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeShops: 0,
    pendingApplications: 0,
    totalOrders: 0,
    revenue: 0,
    growthRate: 0
  });

  const tabs: TabItem[] = [
    { id: 'overview', label: 'Tổng quan', icon: BarChart },
    { id: 'shipping', label: 'Vận chuyển', icon: Package },
    { id: 'payment', label: 'Thanh toán', icon: DollarSign },
    { id: 'users', label: 'Người dùng', icon: Users },
    { id: 'moderators', label: 'Kiểm duyệt viên', icon: Shield },
    { id: 'analytics', label: 'Phân tích', icon: TrendingUp },
    { id: 'accountVerification', label: 'Xác thực tài khoản', icon: CheckCircle }
  ];

  useEffect(() => {
    // Simulate fetching dashboard data
    const fetchStats = async () => {
      // Mock data for demonstration
      setStats({
        totalUsers: 12543,
        activeShops: 892,
        pendingApplications: 47,
        totalOrders: 3421,
        revenue: 2847500,
        growthRate: 12.5
      });
    };

    fetchStats();
  }, []);

  const renderOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Tổng người dùng</p>
            <p className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</p>
          </div>
          <Users className="w-8 h-8 text-blue-600" />
        </div>
        <div className="mt-4 flex items-center text-green-600">
          <TrendingUp className="w-4 h-4 mr-1" />
          <span className="text-sm">+{stats.growthRate}% so với tháng trước</span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Cửa hàng hoạt động</p>
            <p className="text-2xl font-bold">{stats.activeShops}</p>
          </div>
          <Package className="w-8 h-8 text-green-600" />
        </div>
        <div className="mt-4 flex items-center text-green-600">
          <TrendingUp className="w-4 h-4 mr-1" />
          <span className="text-sm">+8.2% so với tháng trước</span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Hồ sơ chờ duyệt</p>
            <p className="text-2xl font-bold">{stats.pendingApplications}</p>
          </div>
          <AlertTriangle className="w-8 h-8 text-yellow-600" />
        </div>
        <div className="mt-4 flex items-center text-yellow-600">
          <Settings className="w-4 h-4 mr-1" />
          <span className="text-sm">Cần xử lý trong 48h</span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Tổng đơn hàng</p>
            <p className="text-2xl font-bold">{stats.totalOrders.toLocaleString()}</p>
          </div>
          <ShoppingCart className="w-8 h-8 text-purple-600" />
        </div>
        <div className="mt-4 flex items-center text-green-600">
          <TrendingUp className="w-4 h-4 mr-1" />
          <span className="text-sm">+15.3% so với tháng trước</span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Doanh thu</p>
            <p className="text-2xl font-bold">₫{stats.revenue.toLocaleString()}</p>
          </div>
          <DollarSign className="w-8 h-8 text-green-600" />
        </div>
        <div className="mt-4 flex items-center text-green-600">
          <TrendingUp className="w-4 h-4 mr-1" />
          <span className="text-sm">+22.1% so với tháng trước</span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Tỷ lệ tăng trưởng</p>
            <p className="text-2xl font-bold">{stats.growthRate}%</p>
          </div>
          <TrendingUp className="w-8 h-8 text-blue-600" />
        </div>
        <div className="mt-4 flex items-center text-blue-600">
          <Settings className="w-4 h-4 mr-1" />
          <span className="text-sm">Tăng trưởng ổn định</span>
        </div>
      </div>
    </div>
  );

  const renderAccountVerification = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Xác thực tài khoản người bán</h3>
      <div className="space-y-4">
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">Cửa hàng ABC</span>
            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm">Chờ xác thực</span>
          </div>
          <div className="text-sm text-gray-600">
            <p>Người đăng ký: Nguyễn Văn A</p>
            <p>Email: seller@example.com</p>
            <p>Ngày đăng ký: 10/05/2026</p>
          </div>
          <div className="mt-3 flex space-x-2">
            <button className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700">
              <CheckCircle className="w-4 h-4 inline mr-1" />
              Phê duyệt
            </button>
            <button className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700">
              <XCircle className="w-4 h-4 inline mr-1" />
              Từ chối
            </button>
            <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
              <Eye className="w-4 h-4 inline mr-1" />
              Chi tiết
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Bảng điều khiển Admin</h1>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-600 hover:text-gray-900">
                <Settings className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex space-x-1 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-2 rounded-t-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'accountVerification' && renderAccountVerification()}
          {activeTab === 'shipping' && (
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quản lý vận chuyển</h3>
              <p className="text-gray-600">Tính năng quản lý vận chuyển sẽ được triển khai sớm.</p>
            </div>
          )}
          {activeTab === 'payment' && (
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quản lý thanh toán</h3>
              <p className="text-gray-600">Tính năng quản lý thanh toán sẽ được triển khai sớm.</p>
            </div>
          )}
          {activeTab === 'users' && (
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quản lý người dùng</h3>
              <p className="text-gray-600">Tính năng quản lý người dùng sẽ được triển khai sớm.</p>
            </div>
          )}
          {activeTab === 'moderators' && (
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quản lý kiểm duyệt viên</h3>
              <p className="text-gray-600">Tính năng quản lý kiểm duyệt viên sẽ được triển khai sớm.</p>
            </div>
          )}
          {activeTab === 'analytics' && (
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Phân tích dữ liệu</h3>
              <p className="text-gray-600">Tính năng phân tích dữ liệu sẽ được triển khai sớm.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
