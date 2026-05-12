import React, { useState } from 'react';
import { useStore, Product, SellerVerification, Violation } from '../store';
import { useLanguage } from '../contexts/LanguageContext';
import { Package, Users, ShieldCheck, AlertTriangle, FileText, Eye, CheckCircle, XCircle, Clock, Search, Filter, Download, BarChart3, TrendingUp, Award, Database, CreditCard, Truck } from 'lucide-react';
import { showSuccess, showError } from '../lib/notifications';

import { validateProduct, determineViolationLevel } from '../lib/validation';
import { generateSampleData } from '../lib/sampleData';
import { shippingService } from '../services/shippingService';

export function AdminView() {
  const { products, orders, updateProductStatus, user, role, addProduct, addOrder, updateShopProfile, 
    shopProfile, counterfeitReports } = useStore();
  const { t } = useLanguage();
  const pendingProducts = products.filter(p => p.status === 'pending');
  const approvedProducts = products.filter(p => p.status === 'approved');
  const rejectedProducts = products.filter(p => p.status === 'rejected');
  const suspiciousProducts = products.filter(p => {
    // Flag products that might be counterfeit based on criteria
    const priceRatio = (p.commercialInfo?.promotionalPrice && p.commercialInfo?.basePrice) ? 
      p.commercialInfo.promotionalPrice / p.commercialInfo.basePrice : 1;
    
    // Flag if price seems too low compared to market average or if other suspicious factors exist
    return priceRatio < 0.1; // Less than 10% of original price could be suspicious
  });
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'verifications' | 'violations' | 'payments' | 'shipping'>('dashboard');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isGeneratingData, setIsGeneratingData] = useState(false);
  const [dataGenerationStatus, setDataGenerationStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  const handleApproveProduct = async (productId: string) => {
    try {
      await updateProductStatus(productId, 'approved');
      showSuccess('Sản phẩm đã được duyệt thành công!');
    } catch (error) {
      console.error('Error approving product:', error);
      showError('Có lỗi xảy ra khi duyệt sản phẩm');
    }
  };
  
  const handleRejectProduct = async (productId: string) => {
    try {
      await updateProductStatus(productId, 'rejected');
      showSuccess('Sản phẩm đã bị từ chối');
    } catch (error) {
      console.error('Error rejecting product:', error);
      showError('Có lỗi xảy ra khi từ chối sản phẩm');
    }
  };
  
  const handleGenerateSampleData = async () => {
    setIsGeneratingData(true);
    setDataGenerationStatus('idle');
    
    try {
      const success = await generateSampleData(addProduct, addOrder, updateShopProfile);
      if (success) {
        setDataGenerationStatus('success');
        setTimeout(() => setDataGenerationStatus('idle'), 3000);
      } else {
        setDataGenerationStatus('error');
        setTimeout(() => setDataGenerationStatus('idle'), 3000);
      }
    } catch (error) {
      console.error('Error generating sample data:', error);
      setDataGenerationStatus('error');
      setTimeout(() => setDataGenerationStatus('idle'), 3000);
    } finally {
      setIsGeneratingData(false);
    }
  };
  
  const openProductDetails = (product: Product) => {
    setSelectedProduct(product);
  };
  
  const closeProductDetails = () => {
    setSelectedProduct(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">

      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Admin Dashboard Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-800 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Trung tâm Quản trị ACF</h1>
                <p className="opacity-90">Quản lý sản phẩm, xác minh và xử lý vi phạm</p>
              </div>
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <ShieldCheck className="w-8 h-8" />
              </div>
            </div>
          </div>
          
          {/* Button to generate sample data */}
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <div className="flex justify-center">
              <button
                onClick={handleGenerateSampleData}
                disabled={isGeneratingData}
                className={`flex items-center px-6 py-3 rounded-lg font-bold transition-all ${
                  isGeneratingData 
                    ? 'bg-gray-300 cursor-not-allowed' 
                    : dataGenerationStatus === 'success' 
                      ? 'bg-green-500 hover:bg-green-600 text-white'
                      : dataGenerationStatus === 'error'
                        ? 'bg-red-500 hover:bg-red-700 text-white'
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                <Database className="w-5 h-5 mr-2" />
                {isGeneratingData 
                  ? 'Đang tạo dữ liệu...' 
                  : dataGenerationStatus === 'success' 
                    ? 'Tạo dữ liệu thành công!' 
                    : dataGenerationStatus === 'error'
                      ? 'Lỗi khi tạo dữ liệu!'
                      : 'Tạo dữ liệu mẫu'}
              </button>
            </div>
          </div>
          
          {/* Navigation Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'dashboard', name: 'Tổng quan', icon: BarChart3 },
                { id: 'products', name: 'Sản phẩm', icon: Package },               
                { id: 'payments', name: 'Thanh toán', icon: CreditCard },
                { id: 'shipping', name: 'Vận chuyển', icon: Truck }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-5 h-5 mr-2" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
          
          <div className="p-6">
            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-red-50 p-5 rounded-xl hover:shadow-md transition-shadow">
                    <div className="flex items-center">
                      <div className="bg-red-100 p-3 rounded-lg">
                        <Package className="w-6 h-6 text-red-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Tổng sản phẩm</p>
                        <p className="text-2xl font-bold">{products.length}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-yellow-50 p-5 rounded-xl hover:shadow-md transition-shadow">
                    <div className="flex items-center">
                      <div className="bg-yellow-100 p-3 rounded-lg">
                        <Clock className="w-6 h-6 text-yellow-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Chờ duyệt</p>
                        <p className="text-2xl font-bold">{pendingProducts.length}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 p-5 rounded-xl hover:shadow-md transition-shadow">
                    <div className="flex items-center">
                      <div className="bg-green-100 p-3 rounded-lg">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Đã duyệt</p>
                        <p className="text-2xl font-bold">{approvedProducts.length}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-red-50 p-5 rounded-xl hover:shadow-md transition-shadow">
                    <div className="flex items-center">
                      <div className="bg-red-100 p-3 rounded-lg">
                        <XCircle className="w-6 h-6 text-red-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Nghi vấn giả</p>
                        <p className="text-2xl font-bold">{suspiciousProducts.length}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Statistics Chart Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                      <BarChart3 className="w-5 h-5 mr-2 text-red-600" />
                      Thống kê theo danh mục
                    </h3>
                    <div className="h-64 flex items-center justify-center">
                      <p className="text-gray-500 italic">Biểu đồ thống kê sẽ được tích hợp ở đây</p>
                    </div>
                  </div>
                  
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2 text-red-600" />
                      Thống kê theo trạng thái
                    </h3>
                    <div className="h-64 flex items-center justify-center">
                      <p className="text-gray-500 italic">Biểu đồ phân tích sẽ được tích hợp ở đây</p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2 text-red-600" />
                      Sản phẩm chờ duyệt
                    </h3>
                    <div className="space-y-4">
                      {pendingProducts.slice(0, 5).map(product => (
                        <div key={product.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                          <div>
                            <h4 className="font-medium text-gray-800">{product.name}</h4>
                            <p className="text-sm text-gray-500">{product.category}</p>
                          </div>
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => handleApproveProduct(product.id)}
                              className="text-xs bg-green-100 text-green-800 hover:bg-green-200 px-3 py-1 rounded font-bold"
                            >
                              Duyệt
                            </button>
                            <button 
                              onClick={() => handleRejectProduct(product.id)}
                              className="text-xs bg-red-100 text-red-800 hover:bg-red-200 px-3 py-1 rounded font-bold"
                            >
                              Từ chối
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                      <Award className="w-5 h-5 mr-2 text-red-600" />
                      Sản phẩm nghi vấn hàng giả
                    </h3>
                    <div className="space-y-4">
                      {suspiciousProducts.slice(0, 5).map(product => (
                        <div key={product.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                          <div>
                            <h4 className="font-medium text-gray-800">{product.name}</h4>
                            <p className="text-sm text-gray-500">{product.category}</p>
                          </div>
                          <button 
                            onClick={() => openProductDetails(product)}
                            className="text-xs bg-red-600 text-white hover:bg-red-700 px-3 py-1 rounded font-bold"
                          >
                            Kiểm tra
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Products Tab */}
            {activeTab === 'products' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-800">Quản lý sản phẩm</h2>
                  <div className="flex space-x-3">
                    <div className="relative">
                      <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Tìm kiếm sản phẩm..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                    <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700">
                      <Filter className="w-4 h-4 mr-2" />
                      Lọc
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <button 
                    className={`py-3 px-4 rounded-lg border font-bold flex items-center justify-center ${
                      !searchTerm || searchTerm.toLowerCase() === 'pending' 
                        ? 'border-red-500 bg-red-50 text-red-700' 
                        : 'border-gray-300 text-gray-700'
                    }`}
                    onClick={() => setSearchTerm(searchTerm === 'pending' ? '' : 'pending')}
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    Chờ duyệt ({pendingProducts.length})
                  </button>
                  <button 
                    className={`py-3 px-4 rounded-lg border font-bold flex items-center justify-center ${
                      !searchTerm || searchTerm.toLowerCase() === 'approved' 
                        ? 'border-green-500 bg-green-50 text-green-700' 
                        : 'border-gray-300 text-gray-700'
                    }`}
                    onClick={() => setSearchTerm(searchTerm === 'approved' ? '' : 'approved')}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Đã duyệt ({approvedProducts.length})
                  </button>
                  <button 
                    className={`py-3 px-4 rounded-lg border font-bold flex items-center justify-center ${
                      !searchTerm || searchTerm.toLowerCase() === 'rejected' 
                        ? 'border-red-500 bg-red-50 text-red-700' 
                        : 'border-gray-300 text-gray-700'
                    }`}
                    onClick={() => setSearchTerm(searchTerm === 'rejected' ? '' : 'rejected')}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Bị từ chối ({rejectedProducts.length})
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sản phẩm</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Danh mục</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giá</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {products
                        .filter(product => 
                          !searchTerm || 
                          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.status.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .map(product => (
                        <tr key={product.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <img className="h-10 w-10 rounded object-cover" src={product.image} alt={product.name} />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900 truncate max-w-xs">{product.name}</div>
                                <div className="text-sm text-gray-500">{product.shopId.substring(0, 8)}...</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-red-600">{(product.commercialInfo?.basePrice || product.price).toLocaleString('vi-VN')} ₫</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              product.status === 'approved' ? 'bg-green-100 text-green-800' :
                              product.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              product.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {product.status === 'approved' ? 'Đã duyệt' : 
                               product.status === 'pending' ? 'Chờ duyệt' : 
                               product.status === 'rejected' ? 'Từ chối' : 'Không xác định'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button 
                              onClick={() => openProductDetails(product)}
                              className="text-indigo-600 hover:text-indigo-900 mr-3"
                            >
                              Xem
                            </button>
                            {product.status === 'pending' && (
                              <>
                                <button 
                                  onClick={() => handleApproveProduct(product.id)}
                                  className="text-green-600 hover:text-green-900 mr-3"
                                >
                                  Duyệt
                                </button>
                                <button 
                                  onClick={() => handleRejectProduct(product.id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Từ chối
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                      {products.filter(product => 
                        !searchTerm || 
                        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        product.status.toLowerCase().includes(searchTerm.toLowerCase())
                      ).length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                            Không tìm thấy sản phẩm phù hợp
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {/* Verifications Tab */}
            {activeTab === 'verifications' && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-6">Xác minh người bán</h2>
                <p className="text-gray-600">Tính năng đang được phát triển...</p>
              </div>
            )}
            
            {/* Violations Tab */}
            {activeTab === 'violations' && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-6">Xử lý vi phạm</h2>
                <p className="text-gray-600">Tính năng đang được phát triển...</p>
              </div>
            )}
            
            {/* Payments Tab */}
            {activeTab === 'payments' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-800">Quản lý phương thức thanh toán</h2>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                      <CreditCard className="w-5 h-5 mr-2 text-red-600" />
                      Tổng quan thanh toán
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm font-medium text-gray-600">Tổng phương thức</p>
                        <p className="text-2xl font-bold">12</p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-sm font-medium text-gray-600">Phương thức mặc định</p>
                        <p className="text-2xl font-bold">3</p>
                      </div>
                      <div className="bg-yellow-50 p-4 rounded-lg">
                        <p className="text-sm font-medium text-gray-600">Đang chờ xác nhận</p>
                        <p className="text-2xl font-bold">2</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Phương thức phổ biến</h3>
                    <div className="space-y-3">
                      {['Ví điện tử MoMo', 'Thẻ Visa', 'Thẻ Mastercard', 'Thanh toán khi nhận hàng (COD)', 'Chuyển khoản ngân hàng'].map((method, idx) => (
                        <div key={idx} className="flex justify-between items-center p-3 border-b border-gray-100">
                          <div className="flex items-center">
                            <div className="bg-gray-100 p-2 rounded-lg mr-3">
                              {idx === 0 && <CreditCard className="w-5 h-5 text-blue-500" />}
                              {idx === 1 && <CreditCard className="w-5 h-5 text-green-500" />}
                              {idx === 2 && <CreditCard className="w-5 h-5 text-purple-500" />}
                              {idx === 3 && <Truck className="w-5 h-5 text-yellow-500" />}
                              {idx === 4 && <CreditCard className="w-5 h-5 text-gray-500" />}
                            </div>
                            <span className="font-medium">{method}</span>
                          </div>
                          <span className="text-sm text-gray-500">{[60, 45, 30, 25, 15][idx]}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Tích hợp cổng thanh toán</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[
                        { name: 'VNPay', connected: true, fee: '0.55%' },
                        { name: 'MoMo', connected: true, fee: '1.7%' },
                        { name: 'ZaloPay', connected: false, fee: '1.9%' },
                        { name: 'ShopeePay', connected: true, fee: '1.6%' },
                        { name: 'Payoo', connected: false, fee: '2.0%' },
                        { name: 'OnePay', connected: true, fee: '2.3%' }
                      ].map((provider, idx) => (
                        <div key={idx} className={`p-4 rounded-lg border ${
                          provider.connected ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                        }`}>
                          <div className="flex justify-between items-start">
                            <h4 className="font-bold">{provider.name}</h4>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              provider.connected ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-800'
                            }`}>
                              {provider.connected ? 'Đã kết nối' : 'Chưa kết nối'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-2">Phí giao dịch: {provider.fee}</p>
                          <button className={`mt-3 w-full py-2 text-sm rounded ${
                            provider.connected ? 'bg-gray-200 text-gray-800' : 'bg-red-600 text-white'
                          }`}>
                            {provider.connected ? 'Quản lý' : 'Kết nối'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Shipping Tab */}
            {activeTab === 'shipping' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-800">Quản lý dịch vụ vận chuyển</h2>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                      <Truck className="w-5 h-5 mr-2 text-red-600" />
                      Tổng quan vận chuyển
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm font-medium text-gray-600">Đơn vị vận chuyển</p>
                        <p className="text-2xl font-bold">5</p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-sm font-medium text-gray-600">Đơn hàng đang giao</p>
                        <p className="text-2xl font-bold">24</p>
                      </div>
                      <div className="bg-yellow-50 p-4 rounded-lg">
                        <p className="text-sm font-medium text-gray-600">Tỷ lệ giao đúng hạn</p>
                        <p className="text-2xl font-bold">92%</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Đơn vị vận chuyển</h3>
                    <div className="space-y-4">
                      {[
                        { id: 'ghn', name: 'Giao Hàng Nhanh', active: true, avgDelivery: '2-3 ngày', rating: 4.5 },
                        { id: 'viettel', name: 'Viettel Post', active: true, avgDelivery: '3-4 ngày', rating: 4.2 },
                        { id: 'ghtk', name: 'Giao Hàng Tiết Kiệm', active: true, avgDelivery: '4-5 ngày', rating: 4.0 },
                        { id: 'vnpost', name: 'VNPost', active: false, avgDelivery: '5-7 ngày', rating: 3.8 },
                        { id: 'best', name: 'Best Express', active: true, avgDelivery: '2-3 ngày', rating: 4.3 }
                      ].map((provider, idx) => (
                        <div key={provider.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-center">
                            <div className="bg-gray-100 p-3 rounded-lg mr-4">
                              <Truck className="w-6 h-6 text-gray-600" />
                            </div>
                            <div>
                              <h4 className="font-bold">{provider.name}</h4>
                              <p className="text-sm text-gray-600">Thời gian giao: {provider.avgDelivery}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center">
                              <span className="text-yellow-500 mr-1">★</span>
                              <span>{provider.rating}</span>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm ${
                              provider.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {provider.active ? 'Hoạt động' : 'Tạm ngưng'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Tích hợp API vận chuyển</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-bold text-gray-700 mb-3">API Key của bạn</h4>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">GHN Token</label>
                              <input 
                                type="password" 
                                placeholder="Nhập token GHN" 
                                className="w-full p-2 border border-gray-300 rounded-md"
                                defaultValue={process.env.REACT_APP_GHN_TOKEN || ''}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Viettel Post Token</label>
                              <input 
                                type="password" 
                                placeholder="Nhập token Viettel" 
                                className="w-full p-2 border border-gray-300 rounded-md"
                                defaultValue={process.env.REACT_APP_VIETTEL_TOKEN || ''}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">GHTK Token</label>
                              <input 
                                type="password" 
                                placeholder="Nhập token GHTK" 
                                className="w-full p-2 border border-gray-300 rounded-md"
                                defaultValue={process.env.REACT_APP_GHTK_TOKEN || ''}
                              />
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-700 mb-3">Cấu hình API</h4>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Endpoint GHN</label>
                              <input 
                                type="text" 
                                placeholder="https://..." 
                                className="w-full p-2 border border-gray-300 rounded-md"
                                defaultValue="https://dev-online-gateway.ghn.vn/shiip/public-api"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Endpoint Viettel Post</label>
                              <input 
                                type="text" 
                                placeholder="https://..." 
                                className="w-full p-2 border border-gray-300 rounded-md"
                                defaultValue="https://api.viettelpost.vn/api"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Endpoint GHTK</label>
                              <input 
                                type="text" 
                                placeholder="https://..." 
                                className="w-full p-2 border border-gray-300 rounded-md"
                                defaultValue="https://services.giaohangtietkiem.vn/services"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-6 flex justify-end">
                        <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg">
                          Lưu cấu hình
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Product Details Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-bold text-gray-800">Chi tiết sản phẩm</h3>
                <button 
                  onClick={closeProductDetails}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <div className="h-80 bg-gray-100 rounded-lg overflow-hidden mb-4">
                    <img 
                      src={selectedProduct.image} 
                      alt={selectedProduct.name} 
                      className="w-full h-full object-contain"
                      onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60'; }}
                    />
                  </div>
                  
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h4 className="font-bold text-red-800 mb-2 flex items-center">
                      <AlertTriangle className="w-5 h-5 mr-2" />
                      Phân tích rủi ro
                    </h4>
                    <ul className="text-sm text-red-700 space-y-1">
                      {(() => {
                        const issues = [];
                        const priceRatio = (selectedProduct.commercialInfo?.promotionalPrice && selectedProduct.commercialInfo?.basePrice) ? 
                          selectedProduct.commercialInfo.promotionalPrice / selectedProduct.commercialInfo.basePrice : 1;
                        
                        if (priceRatio < 0.1) {
                          issues.push("Giá khuyến mãi quá thấp so với giá gốc (dưới 10%)");
                        }
                        
                        if (!selectedProduct.labelInfo.barcode) {
                          issues.push("Thiếu mã vạch");
                        }
                        
                        if (!selectedProduct.qualityInfo?.certificateOfQualityUrl) {
                          issues.push("Thiếu giấy chứng nhận chất lượng");
                        }
                        
                        return issues.length > 0 ? issues.map((issue, i) => <li key={i}>• {issue}</li>) : <li>• Không phát hiện rủi ro đáng kể</li>;
                      })()}
                    </ul>
                  </div>
                </div>
                
                <div>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-bold text-gray-700 mb-3">Thông tin cơ bản</h4>
                      <ul className="space-y-2">
                        <li><span className="font-medium">Tên sản phẩm:</span> {selectedProduct.name}</li>
                        <li><span className="font-medium">Danh mục:</span> {selectedProduct.category}</li>
                        <li><span className="font-medium">Giá gốc:</span> {selectedProduct.commercialInfo?.basePrice?.toLocaleString('vi-VN') || selectedProduct.price} ₫</li>
                        <li><span className="font-medium">Người bán:</span> {selectedProduct.shopId.substring(0, 8)}...</li>
                        <li><span className="font-medium">Trạng thái:</span> 
                          <span className={`ml-2 px-2 py-1 rounded-full text-xs font-bold ${
                            selectedProduct.status === 'approved' ? 'bg-green-100 text-green-800' :
                            selectedProduct.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {selectedProduct.status === 'approved' ? 'Đã duyệt' : 
                             selectedProduct.status === 'pending' ? 'Chờ duyệt' : 'Từ chối'}
                          </span>
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-bold text-gray-700 mb-3">Thông tin nhãn hàng hóa</h4>
                      <ul className="space-y-2 text-sm">
                        <li><span className="font-medium">Tên nhãn hiệu:</span> {selectedProduct.labelInfo.brandName}</li>
                        <li><span className="font-medium">Nhà sản xuất:</span> {selectedProduct.labelInfo.manufacturerName}</li>
                        <li><span className="font-medium">Địa chỉ:</span> {selectedProduct.labelInfo.manufacturerAddress}</li>
                        <li><span className="font-medium">Xuất xứ:</span> {selectedProduct.labelInfo.originCountry}</li>
                        <li><span className="font-medium">Định lượng:</span> {selectedProduct.labelInfo.quantityMeasurement}</li>
                        <li><span className="font-medium">Số lô:</span> {selectedProduct.labelInfo.batchNumber}</li>
                        <li><span className="font-medium">NSX:</span> {new Date(selectedProduct.labelInfo.productionDate).toLocaleDateString('vi-VN')}</li>
                        {selectedProduct.labelInfo.expiryDate && (
                          <li><span className="font-medium">HSD:</span> {new Date(selectedProduct.labelInfo.expiryDate).toLocaleDateString('vi-VN')}</li>
                        )}
                        <li><span className="font-medium">Mã vạch:</span> {selectedProduct.labelInfo.barcode || 'Chưa cung cấp'}</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-bold text-gray-700 mb-3">Chi tiết khác</h4>
                      <ul className="space-y-2 text-sm">
                        <li><span className="font-medium">Thành phần:</span> {selectedProduct.labelInfo.ingredientsOrComponents}</li>
                        <li><span className="font-medium">HDSD:</span> {selectedProduct.labelInfo.usageInstructions}</li>
                        <li><span className="font-medium">HDBQ:</span> {selectedProduct.labelInfo.storageInstructions}</li>
                        {selectedProduct.labelInfo.warningInformation && (
                          <li><span className="font-medium">Cảnh báo:</span> {selectedProduct.labelInfo.warningInformation}</li>
                        )}
                      </ul>
                    </div>
                    
                    <div className="flex space-x-3 pt-4">
                      {selectedProduct.status === 'pending' ? (
                        <>
                          <button 
                            onClick={() => {
                              handleApproveProduct(selectedProduct.id);
                              closeProductDetails();
                            }}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold flex items-center justify-center"
                          >
                            <CheckCircle className="w-5 h-5 mr-2" />
                            Duyệt sản phẩm
                          </button>
                          <button 
                            onClick={() => {
                              handleRejectProduct(selectedProduct.id);
                              closeProductDetails();
                            }}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-bold flex items-center justify-center"
                          >
                            <XCircle className="w-5 h-5 mr-2" />
                            Từ chối
                          </button>
                        </>
                      ) : (
                        <button 
                          onClick={closeProductDetails}
                          className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-bold"
                        >
                          Đóng
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
          </div>
  );
}