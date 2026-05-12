import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown, Users, Package, ShoppingBag, DollarSign, AlertTriangle, ShieldCheck, Calendar } from 'lucide-react';
import { useStore } from '../store';

// Mock data interfaces
interface SalesData {
  name: string;
  revenue: number;
  orders: number;
}

interface ProductPerformance {
  name: string;
  sales: number;
  revenue: number;
}

interface CategoryDistribution {
  name: string;
  value: number;
}

interface DailyActivity {
  date: string;
  visitors: number;
  orders: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function AnalyticsDashboard() {
  const { products, orders, counterfeitReports } = useStore();
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [productPerformance, setProductPerformance] = useState<ProductPerformance[]>([]);
  const [categoryDistribution, setCategoryDistribution] = useState<CategoryDistribution[]>([]);
  const [dailyActivity, setDailyActivity] = useState<DailyActivity[]>([]);
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    activeUsers: 0,
    counterfeitReports: 0,
    verifiedProducts: 0
  });

  // Generate mock data
  useEffect(() => {
    // Generate sales data for last 7 days
    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const sales = days.map((day, idx) => ({
      name: day,
      revenue: Math.floor(Math.random() * 5000000) + 2000000,
      orders: Math.floor(Math.random() * 100) + 20
    }));
    setSalesData(sales);

    // Generate product performance data
    const perfItems: ProductPerformance[] = [];
    for (let i = 0; i < 5; i++) {
      perfItems.push({
        name: `Sản phẩm ${i+1}`,
        sales: Math.floor(Math.random() * 500),
        revenue: Math.floor(Math.random() * 10000000) + 5000000
      });
    }
    setProductPerformance(perfItems);

    // Generate category distribution
    const categories: CategoryDistribution[] = [
      { name: 'Thời trang', value: 35 },
      { name: 'Điện tử', value: 25 },
      { name: 'Mẹ & Bé', value: 15 },
      { name: 'Sắc đẹp', value: 10 },
      { name: 'Khác', value: 15 }
    ];
    setCategoryDistribution(categories);

    // Generate daily activity
    const activity: DailyActivity[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      activity.push({
        date: date.toLocaleDateString('vi-VN'),
        visitors: Math.floor(Math.random() * 500) + 100,
        orders: Math.floor(Math.random() * 50) + 5
      });
    }
    setDailyActivity(activity);

    // Calculate metrics
    const totalRevenue = sales.reduce((sum, day) => sum + day.revenue, 0);
    const totalOrders = sales.reduce((sum, day) => sum + day.orders, 0);
    
    setMetrics({
      totalRevenue,
      totalOrders,
      totalProducts: products.length,
      activeUsers: 1242, // Mock data
      counterfeitReports: counterfeitReports.length,
      verifiedProducts: products.filter(p => p.verificationInfo?.verifiedByAcf).length
    });
  }, [products, orders, counterfeitReports]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <TrendingUp className="w-6 h-6 mr-2 text-blue-600" />
          Bảng điều khiển phân tích ACF
        </h1>
        <p className="text-gray-600">Thống kê và phân tích hoạt động sàn thương mại điện tử chống hàng giả</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100 text-blue-600 mr-4">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Doanh thu</p>
              <p className="text-xl font-bold">{(metrics.totalRevenue / 1000000).toFixed(1)}M ₫</p>
            </div>
          </div>
          <div className="mt-4 flex items-center text-green-500 text-sm">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>12.3% tuần trước</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100 text-green-600 mr-4">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Đơn hàng</p>
              <p className="text-xl font-bold">{metrics.totalOrders}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center text-green-500 text-sm">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>8.2% tuần trước</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-100 text-purple-600 mr-4">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Sản phẩm</p>
              <p className="text-xl font-bold">{metrics.totalProducts}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center text-green-500 text-sm">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>5.7% tuần trước</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-yellow-100 text-yellow-600 mr-4">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Người dùng</p>
              <p className="text-xl font-bold">{metrics.activeUsers}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center text-green-500 text-sm">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>3.1% tuần trước</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-red-100 text-red-600 mr-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Báo cáo giả</p>
              <p className="text-xl font-bold">{metrics.counterfeitReports}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center text-red-500 text-sm">
            <TrendingDown className="w-4 h-4 mr-1" />
            <span>1.2% tuần trước</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-teal-100 text-teal-600 mr-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Đã xác thực</p>
              <p className="text-xl font-bold">{metrics.verifiedProducts}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center text-green-500 text-sm">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>15.4% tuần trước</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue and Orders Chart */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <BarChart className="w-5 h-5 mr-2 text-blue-600" />
            Doanh thu & Đơn hàng theo ngày
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [`${Number(value).toLocaleString('vi-VN')} ₫`, 'Giá trị']} />
              <Legend />
              <Bar dataKey="revenue" name="Doanh thu (₫)" fill="#3b82f6" />
              <Bar dataKey="orders" name="Đơn hàng" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Product Performance */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
            Hiệu suất sản phẩm hàng đầu
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={productPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [value, 'Số lượng']} />
              <Area type="monotone" dataKey="sales" name="Số lượng bán" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Category Distribution */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <PieChart className="w-5 h-5 mr-2 text-purple-600" />
            Phân bổ theo danh mục
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryDistribution}
                cx="50%"
                cy="50%"
                labelLine={true}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {categoryDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value}%`, 'Tỷ lệ']} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Daily Activity */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-yellow-600" />
            Hoạt động người dùng 7 ngày
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyActivity}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="visitors" name="Lượt truy cập" fill="#f59e0b" />
              <Bar dataKey="orders" name="Đơn hàng" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Reports */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
          Báo cáo hàng giả gần đây
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sản phẩm</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người báo cáo</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lý do</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày báo cáo</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {counterfeitReports.slice(0, 5).map((report, idx) => (
                <tr key={idx}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Sản phẩm {idx+1}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.reporterName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.suspicionReason}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${report.status === 'confirmed' ? 'bg-red-100 text-red-800' : 
                        report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-green-100 text-green-800'}`}>
                      {report.status === 'confirmed' ? 'Đã xác nhận' : 
                       report.status === 'pending' ? 'Đang xử lý' : 'Đã xử lý'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {report.createdAt ? report.createdAt.toLocaleDateString('vi-VN') : 'N/A'}
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