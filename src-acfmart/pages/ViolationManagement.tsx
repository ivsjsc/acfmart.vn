import React, { useState } from 'react';
import { AlertTriangle, ShieldAlert, FileText, Search, Filter, Download, Eye, Clock, User, Ban, Gavel, AlertCircle, TrendingUp, Activity, CheckCircle, XCircle } from 'lucide-react';
import { useStore, Violation, CounterfeitReport } from '../store';

export function ViolationManagement() {
  const { counterfeitReports } = useStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'reports' | 'violations' | 'statistics'>('overview');

  // Statistics
  const pendingReports = counterfeitReports.filter(r => r.status === 'pending').length;
  const investigatingReports = counterfeitReports.filter(r => r.status === 'investigating').length;
  const confirmedViolations = counterfeitReports.filter(r => r.status === 'confirmed').length;
  const totalReports = counterfeitReports.length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            <ShieldAlert className="w-8 h-8 mr-3 text-red-600" />
            Quản lý Vi phạm
          </h1>
          <p className="text-gray-600 mt-2">Hệ thống xử lý vi phạm và báo cáo hàng giả theo Nghị định 98/2020/NĐ-CP</p>
        </div>

        {/* Definition Section */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6 border-l-4 border-red-600">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <FileText className="w-6 h-6 mr-2 text-red-600" />
            Định nghĩa Vi phạm
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-bold text-gray-700 mb-2">Vi phạm là gì?</h3>
              <p className="text-sm text-gray-600 mb-3">
                Hành vi không tuân thủ quy định pháp luật trong thương mại điện tử:
              </p>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li>Bán hàng giả, hàng nhái</li>
                <li>Quảng cáo sai sự thật</li>
                <li>Vi phạm quyền sở hữu trí tuệ</li>
                <li>Gian lận thương mại</li>
                <li>Không cung cấp thông tin đúng</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-gray-700 mb-2">Chức năng xử lý</h3>
              <p className="text-sm text-gray-600 mb-3">
                Các biện pháp xử lý vi phạm:
              </p>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li>Cảnh báo và nhắc nhở</li>
                <li>Tạm đình chỉ hoạt động</li>
                <li>Khoản tiền phạt theo quy định</li>
                <li>Cấm hoạt động vĩnh viễn</li>
                <li>Chuyển cơ quan điều tra</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-gray-700 mb-2">Tính năng hệ thống</h3>
              <p className="text-sm text-gray-600 mb-3">
                Công cụ hỗ trợ quản lý:
              </p>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li>Hệ thống báo cáo tự động</li>
                <li>Theo dõi lịch sử vi phạm</li>
                <li>Phân tích rủi ro AI</li>
                <li>Cảnh báo sớm</li>
                <li>Báo cáo thống kê</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-6 bg-white rounded-lg p-2 shadow-sm">
          {[
            { id: 'overview', label: 'Tổng quan', icon: Activity },
            { id: 'reports', label: 'Báo cáo', icon: AlertTriangle },
            { id: 'violations', label: 'Vi phạm', icon: Ban },
            { id: 'statistics', label: 'Thống kê', icon: TrendingUp }
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
            <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Báo cáo chờ xử lý</p>
                  <p className="text-3xl font-bold text-yellow-600">{pendingReports}</p>
                </div>
                <Clock className="w-12 h-12 text-yellow-500" />
              </div>
              <p className="text-xs text-gray-500 mt-2">Cần xem xét</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Đang điều tra</p>
                  <p className="text-3xl font-bold text-blue-600">{investigatingReports}</p>
                </div>
                <Search className="w-12 h-12 text-blue-500" />
              </div>
              <p className="text-xs text-gray-500 mt-2">Đang xử lý</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Vi phạm xác nhận</p>
                  <p className="text-3xl font-bold text-red-600">{confirmedViolations}</p>
                </div>
                <Ban className="w-12 h-12 text-red-500" />
              </div>
              <p className="text-xs text-gray-500 mt-2">Đã xử lý</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Tổng báo cáo</p>
                  <p className="text-3xl font-bold text-purple-600">{totalReports}</p>
                </div>
                <AlertTriangle className="w-12 h-12 text-purple-500" />
              </div>
              <p className="text-xs text-gray-500 mt-2">Tất cả thời gian</p>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Danh sách báo cáo</h2>
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
              {counterfeitReports.slice(0, 5).map(report => (
                <div key={report.id} className="p-4 border border-gray-200 rounded-lg hover:border-red-500 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          report.status === 'investigating' ? 'bg-blue-100 text-blue-800' :
                          report.status === 'confirmed' ? 'bg-red-100 text-red-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {report.status === 'pending' && 'Chờ xử lý'}
                          {report.status === 'investigating' && 'Đang điều tra'}
                          {report.status === 'confirmed' && 'Đã xác nhận'}
                          {report.status === 'resolved' && 'Đã giải quyết'}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          report.priority === 'high' ? 'bg-red-100 text-red-800' :
                          report.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {report.priority === 'high' && 'Ưu tiên cao'}
                          {report.priority === 'medium' && 'Trung bình'}
                          {report.priority === 'low' && 'Thấp'}
                        </span>
                      </div>
                      <h3 className="font-bold text-gray-800">{report.productInfo.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{report.suspicionReason}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span>Người báo: {report.reporterName}</span>
                        <span>{new Date(report.createdAt).toLocaleDateString('vi-VN')}</span>
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

        {activeTab === 'violations' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Quản lý vi phạm</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 border border-gray-200 rounded-lg">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                  <Gavel className="w-5 h-5 mr-2 text-red-600" />
                  Hình thức xử lý
                </h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start">
                    <AlertCircle className="w-4 h-4 mr-2 text-yellow-600 mt-0.5" />
                    <div>
                      <span className="font-medium">Cảnh báo:</span>
                      <span className="text-gray-600 ml-1">Nhắc nhở lần đầu</span>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <Ban className="w-4 h-4 mr-2 text-orange-600 mt-0.5" />
                    <div>
                      <span className="font-medium">Tạm đình chỉ 7 ngày:</span>
                      <span className="text-gray-600 ml-1">Khóa tài khoản tạm thời</span>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <Ban className="w-4 h-4 mr-2 text-red-600 mt-0.5" />
                    <div>
                      <span className="font-medium">Tạm đình chỉ 30 ngày:</span>
                      <span className="text-gray-600 ml-1">Khóa tài khoản dài hạn</span>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <XCircle className="w-4 h-4 mr-2 text-red-700 mt-0.5" />
                    <div>
                      <span className="font-medium">Cấm vĩnh viễn:</span>
                      <span className="text-gray-600 ml-1">Xóa tài khoản khỏi hệ thống</span>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="p-6 border border-gray-200 rounded-lg">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                  <ShieldAlert className="w-5 h-5 mr-2 text-purple-600" />
                  Tính năng quản lý
                </h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-600 mt-0.5" />
                    <span>Theo dõi lịch sử vi phạm</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-600 mt-0.5" />
                    <span>Hệ thống điểm rủi ro</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-600 mt-0.5" />
                    <span>Cảnh báo tự động</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-600 mt-0.5" />
                    <span>Xử lý hàng loạt</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-600 mt-0.5" />
                    <span>Xuất báo cáo PDF</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'statistics' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Thống kê vi phạm</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-red-50 rounded-lg border border-red-200">
                <h3 className="font-bold text-red-800 mb-2">Tỷ lệ xử lý</h3>
                <p className="text-4xl font-bold text-red-600">85%</p>
                <p className="text-sm text-red-700 mt-2">Báo cáo đã giải quyết</p>
              </div>
              <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-bold text-blue-800 mb-2">Thời gian xử lý</h3>
                <p className="text-4xl font-bold text-blue-600">3.2</p>
                <p className="text-sm text-blue-700 mt-2">Ngày trung bình</p>
              </div>
              <div className="p-6 bg-green-50 rounded-lg border border-green-200">
                <h3 className="font-bold text-green-800 mb-2">Độ chính xác</h3>
                <p className="text-4xl font-bold text-green-600">92%</p>
                <p className="text-sm text-green-700 mt-2">Xác nhận chính xác</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
