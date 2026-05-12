import React, { useState } from 'react';
import { ShieldCheck, CheckCircle, XCircle, AlertTriangle, Search, Filter, Download, Eye, FileText, Clock, User, Building, QrCode, Barcode, Award } from 'lucide-react';
import { useStore, Product, SellerVerification } from '../store';

export function VerificationManagement() {
  const { products, shopProfile } = useStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'sellers' | 'statistics'>('overview');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Statistics
  const verifiedProducts = products.filter(p => p.verificationInfo?.verifiedByAcf).length;
  const pendingProducts = products.filter(p => p.status === 'pending').length;
  const totalProducts = products.length;
  const verificationRate = totalProducts > 0 ? ((verifiedProducts / totalProducts) * 100).toFixed(1) : '0';

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            <ShieldCheck className="w-8 h-8 mr-3 text-red-600" />
            Quản lý Xác minh ACF
          </h1>
          <p className="text-gray-600 mt-2">Hệ thống xác minh sản phẩm và người bán theo Nghị định 43/2017/NĐ-CP</p>
        </div>

        {/* Definition Section */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6 border-l-4 border-red-600">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <FileText className="w-6 h-6 mr-2 text-red-600" />
            Định nghĩa Xác minh ACF
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-gray-700 mb-2">Xác minh sản phẩm là gì?</h3>
              <p className="text-sm text-gray-600 mb-3">
                Quá trình kiểm tra và xác nhận tính chính hãng của sản phẩm thông qua:
              </p>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li>Kiểm tra thông tin nhãn mác theo Nghị định 43/2017/NĐ-CP</li>
                <li>Xác minh nguồn gốc xuất xứ sản phẩm</li>
                <li>Kiểm tra giấy chứng nhận chất lượng (Nghị định 119/2017/NĐ-CP)</li>
                <li>Tạo mã QR xác minh độc nhất</li>
                <li>Cấp chứng nhận ACF Verified</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-gray-700 mb-2">Xác minh người bán là gì?</h3>
              <p className="text-sm text-gray-600 mb-3">
                Quá trình kiểm tra và xác nhận uy tín của người bán:
              </p>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li>Kiểm tra giấy phép kinh doanh</li>
                <li>Xác minh mã số thuế</li>
                <li>Kiểm tra giấy tờ tùy thân</li>
                <li>Xác thực địa chỉ kinh doanh</li>
                <li>Đánh giá lịch sử hoạt động</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-6 bg-white rounded-lg p-2 shadow-sm">
          {[
            { id: 'overview', label: 'Tổng quan', icon: ShieldCheck },
            { id: 'products', label: 'Xác minh SP', icon: QrCode },
            { id: 'sellers', label: 'Xác minh Shop', icon: Building },
            { id: 'statistics', label: 'Thống kê', icon: Award }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-red-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="w-5 h-5 mr-2" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Sản phẩm đã xác minh</p>
                  <p className="text-3xl font-bold text-green-600">{verifiedProducts}</p>
                </div>
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>
              <p className="text-xs text-gray-500 mt-2">Tỷ lệ: {verificationRate}%</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Chờ xác minh</p>
                  <p className="text-3xl font-bold text-yellow-600">{pendingProducts}</p>
                </div>
                <Clock className="w-12 h-12 text-yellow-500" />
              </div>
              <p className="text-xs text-gray-500 mt-2">Cần xử lý</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Tổng sản phẩm</p>
                  <p className="text-3xl font-bold text-blue-600">{totalProducts}</p>
                </div>
                <QrCode className="w-12 h-12 text-blue-500" />
              </div>
              <p className="text-xs text-gray-500 mt-2">Trong hệ thống</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Shop đã xác minh</p>
                  <p className="text-3xl font-bold text-purple-600">12</p>
                </div>
                <Building className="w-12 h-12 text-purple-500" />
              </div>
              <p className="text-xs text-gray-500 mt-2">Đang hoạt động</p>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Danh sách sản phẩm</h2>
              <div className="flex space-x-2">
                <button className="flex items-center px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">
                  <Filter className="w-4 h-4 mr-2" />
                  Lọc
                </button>
                <button className="flex items-center px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">
                  <Search className="w-4 h-4 mr-2" />
                  Tìm kiếm
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {products.slice(0, 5).map(product => (
                <div key={product.id} className="p-4 border border-gray-200 rounded-lg hover:border-red-500 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div>
                        <h3 className="font-bold text-gray-800">{product.name}</h3>
                        <p className="text-sm text-gray-600">Shop: {product.shopId.substring(0, 8)}...</p>
                        <div className="flex items-center space-x-2 mt-2">
                          {product.verificationInfo?.verifiedByAcf ? (
                            <span className="flex items-center text-green-600 text-sm">
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Đã xác minh
                            </span>
                          ) : (
                            <span className="flex items-center text-yellow-600 text-sm">
                              <Clock className="w-4 h-4 mr-1" />
                              Chờ xác minh
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button className="p-2 hover:bg-gray-100 rounded-lg">
                        <Eye className="w-5 h-5 text-gray-600" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg">
                        <Download className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'sellers' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Xác minh người bán</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 border border-gray-200 rounded-lg">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-blue-600" />
                  Chức năng xác minh
                </h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-600 mt-0.5" />
                    <span>Kiểm tra giấy phép kinh doanh</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-600 mt-0.5" />
                    <span>Xác minh mã số thuế</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-600 mt-0.5" />
                    <span>Kiểm tra CMND/CCCD</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-600 mt-0.5" />
                    <span>Xác thực địa chỉ kinh doanh</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-600 mt-0.5" />
                    <span>Kiểm tra giấy tờ ngành hàng có điều kiện</span>
                  </li>
                </ul>
              </div>

              <div className="p-6 border border-gray-200 rounded-lg">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                  <Award className="w-5 h-5 mr-2 text-purple-600" />
                  Tính năng nâng cao
                </h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-600 mt-0.5" />
                    <span>Hệ thống điểm uy tín (Trust Score)</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-600 mt-0.5" />
                    <span>Theo dõi lịch sử vi phạm</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-600 mt-0.5" />
                    <span>Xác thực khuôn mặt (Face Verification)</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-600 mt-0.5" />
                    <span>Kết nối cơ sở dữ liệu quốc gia</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-600 mt-0.5" />
                    <span>Cập nhật thời gian thực</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'statistics' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Thống kê xác minh</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-green-50 rounded-lg border border-green-200">
                <h3 className="font-bold text-green-800 mb-2">Tỷ lệ xác minh</h3>
                <p className="text-4xl font-bold text-green-600">{verificationRate}%</p>
                <p className="text-sm text-green-700 mt-2">Sản phẩm đã xác minh</p>
              </div>
              <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-bold text-blue-800 mb-2">Thời gian xử lý</h3>
                <p className="text-4xl font-bold text-blue-600">2.5</p>
                <p className="text-sm text-blue-700 mt-2">Ngày trung bình</p>
              </div>
              <div className="p-6 bg-purple-50 rounded-lg border border-purple-200">
                <h3 className="font-bold text-purple-800 mb-2">Độ chính xác</h3>
                <p className="text-4xl font-bold text-purple-600">99.8%</p>
                <p className="text-sm text-purple-700 mt-2">Xác minh thành công</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
