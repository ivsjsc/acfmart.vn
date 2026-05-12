import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, CheckCircle, XCircle, Clock, AlertCircle, User, Store, FileText, Calendar, Download, Mail, Phone, MapPin, CreditCard, Shield, Star } from 'lucide-react';
import { showWarning } from '../lib/notifications';

interface SellerApplication {
  id: string;
  applicationId: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  shopName: string;
  shopDescription: string;
  shopCategory: string;
  shopLogo?: string;
  businessLicense?: string;
  taxCode: string;
  bankName: string;
  bankAccount: string;
  status: 'pending' | 'reviewing' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  sellerId?: string;
  googleEmail: string;
}

const SellerApplicationManagement: React.FC = () => {
  const [applications, setApplications] = useState<SellerApplication[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<SellerApplication | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // Load applications from localStorage or initialize with mock data
  useEffect(() => {
    const storedApplication = localStorage.getItem('sellerApplication');
    if (storedApplication) {
      const parsedApplication = JSON.parse(storedApplication);
      // Ensure the stored application has the complete structure
      setApplications([parsedApplication]);
    } else {
      // Mock data as fallback
      const mockApplications: SellerApplication[] = [
        {
          id: '1',
          applicationId: 'SELLER-1705123456789',
          fullName: 'Nguyễn Văn A',
          email: 'nguyenvana@gmail.com',
          phone: '0912345678',
          address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
          shopName: 'TechStore Pro',
          shopDescription: 'Chuyên bán các sản phẩm công nghệ chính hãng',
          shopCategory: 'Điện tử & Điện lạnh',
          taxCode: '0123456789',
          bankName: 'Vietcombank',
          bankAccount: '1234567890',
          status: 'pending',
          submittedAt: '2024-01-15T10:30:00Z',
          googleEmail: 'nguyenvana@gmail.com'
        }
      ];
      setApplications(mockApplications);
    }
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'reviewing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'reviewing': return <Eye className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Chờ xử lý';
      case 'reviewing': return 'Đang xem xét';
      case 'approved': return 'Đã duyệt';
      case 'rejected': return 'Đã từ chối';
      default: return status;
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesStatus = filterStatus === 'all' || app.status === filterStatus;
    const matchesSearch = app.applicationId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         app.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         app.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         app.shopName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleApprove = async (applicationId: string) => {
    // Generate unique seller ID
    const sellerId = `SELLER-ACF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    setApplications(prev => prev.map(app => 
      app.id === applicationId 
        ? { 
            ...app, 
            status: 'approved' as const,
            reviewedAt: new Date().toISOString(),
            reviewedBy: 'admin@acf.vn',
            sellerId
          } 
        : app
    ));
    
    // Update the local storage with the approved status
    const updatedApp = applications.find(a => a.id === applicationId);
    if (updatedApp) {
      const updatedApplication = {
        ...updatedApp,
        status: 'approved',
        reviewedAt: new Date().toISOString(),
        reviewedBy: 'admin@acf.vn',
        sellerId
      };
      localStorage.setItem('sellerApplication', JSON.stringify(updatedApplication));
    }
    
    // Send approval notification (simulation)
    console.log(`Approval notification sent to ${applications.find(a => a.id === applicationId)?.email}`);
    console.log(`Seller ID generated: ${sellerId}`);
  };

  const handleReject = async (applicationId: string) => {
    if (!rejectReason.trim()) {
      showWarning('Vui lòng nhập lý do từ chối');
      return;
    }

    setApplications(prev => prev.map(app => 
      app.id === applicationId 
        ? { 
            ...app, 
            status: 'rejected' as const,
            reviewedAt: new Date().toISOString(),
            reviewedBy: 'admin@acf.vn',
            rejectionReason: rejectReason
          } 
        : app
    ));
    
    // Update the local storage with the rejected status
    const updatedApp = applications.find(a => a.id === applicationId);
    if (updatedApp) {
      const updatedApplication = {
        ...updatedApp,
        status: 'rejected',
        reviewedAt: new Date().toISOString(),
        reviewedBy: 'admin@acf.vn',
        rejectionReason: rejectReason
      };
      localStorage.setItem('sellerApplication', JSON.stringify(updatedApplication));
    }
    
    setShowRejectModal(false);
    setRejectReason('');
    
    // Send rejection notification (simulation)
    console.log(`Rejection notification sent to ${applications.find(a => a.id === applicationId)?.email}`);
  };

  const handleViewDetails = (application: SellerApplication) => {
    setSelectedApplication(application);
    setShowDetails(true);
  };

  const generateSellerId = (application: SellerApplication) => {
    return `SELLER-ACF-${new Date(application.submittedAt).getTime()}-${application.email.substring(0, 3).toUpperCase()}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Quản lý hồ sơ người bán hàng</h1>
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <Download className="w-4 h-4" />
                Xuất báo cáo
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-600">Chờ xử lý</p>
                  <p className="text-2xl font-bold text-yellow-700">
                    {applications.filter(a => a.status === 'pending').length}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600">Đang xem xét</p>
                  <p className="text-2xl font-bold text-blue-700">
                    {applications.filter(a => a.status === 'reviewing').length}
                  </p>
                </div>
                <Eye className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600">Đã duyệt</p>
                  <p className="text-2xl font-bold text-green-700">
                    {applications.filter(a => a.status === 'approved').length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-red-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-600">Đã từ chối</p>
                  <p className="text-2xl font-bold text-red-700">
                    {applications.filter(a => a.status === 'rejected').length}
                  </p>
                </div>
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo mã hồ sơ, tên, email..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ xử lý</option>
              <option value="reviewing">Đang xem xét</option>
              <option value="approved">Đã duyệt</option>
              <option value="rejected">Đã từ chối</option>
            </select>

            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="w-4 h-4" />
              Bộ lọc nâng cao
            </button>
          </div>
        </div>

        {/* Applications Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã hồ sơ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người đăng ký</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cửa hàng</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email Google</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày nộp</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredApplications.length > 0 ? (
                  filteredApplications.map((application) => (
                    <tr key={application.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{application.applicationId}</div>
                        {application.sellerId && (
                          <div className="text-xs text-green-600">ID: {application.sellerId}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">{application.fullName}</div>
                          <div className="text-gray-500">{application.phone}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">{application.shopName}</div>
                          <div className="text-gray-500">{application.shopCategory}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">{application.email}</div>
                          <div className="text-xs text-blue-600">Google Account</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(application.submittedAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(application.status)}`}>
                          {getStatusIcon(application.status)}
                          {getStatusText(application.status)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewDetails(application)}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {application.status === 'pending' && (
                            <button
                              onClick={() => {
                                setSelectedApplication(application);
                                setApplications(prev => prev.map(app => 
                                  app.id === application.id ? { ...app, status: 'reviewing' as const } : app
                                ));
                                
                                // Update local storage
                                const updatedApplication = {
                                  ...application,
                                  status: 'reviewing'
                                };
                                localStorage.setItem('sellerApplication', JSON.stringify(updatedApplication));
                              }}
                              className="text-yellow-600 hover:text-yellow-900 transition-colors"
                              title="Bắt đầu xem xét"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}
                          {application.status === 'reviewing' && (
                            <>
                              <button
                                onClick={() => handleApprove(application.id)}
                                className="text-green-600 hover:text-green-900 transition-colors"
                                title="Duyệt hồ sơ"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedApplication(application);
                                  setShowRejectModal(true);
                                }}
                                className="text-red-600 hover:text-red-900 transition-colors"
                                title="Từ chối hồ sơ"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      Không có hồ sơ nào để hiển thị
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Application Details Modal */}
        {showDetails && selectedApplication && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto m-4">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Chi tiết hồ sơ #{selectedApplication.applicationId}</h2>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* Status */}
                <div className="mb-6">
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${getStatusColor(selectedApplication.status)}`}>
                    {getStatusIcon(selectedApplication.status)}
                    {getStatusText(selectedApplication.status)}
                  </div>
                  {selectedApplication.sellerId && (
                    <div className="mt-2 text-sm">
                      <span className="font-medium">ID Seller: </span>
                      <span className="text-green-600 font-bold">{selectedApplication.sellerId}</span>
                    </div>
                  )}
                </div>

                {/* Personal Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Thông tin cá nhân</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{selectedApplication.fullName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{selectedApplication.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{selectedApplication.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{selectedApplication.address}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Thông tin cửa hàng</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Store className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{selectedApplication.shopName}</span>
                      </div>
                      <div className="text-sm text-gray-600">{selectedApplication.shopDescription}</div>
                      <div className="text-sm">
                        <span className="font-medium">Danh mục: </span>
                        <span>{selectedApplication.shopCategory}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Business Info */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Thông tin kinh doanh</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">Mã số thuế: {selectedApplication.taxCode}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{selectedApplication.bankName} - {selectedApplication.bankAccount}</span>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Lịch sử xử lý</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                        <Calendar className="w-3 h-3 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">Nộp hồ sơ</div>
                        <div className="text-xs text-gray-500">
                          {new Date(selectedApplication.submittedAt).toLocaleString('vi-VN')}
                        </div>
                      </div>
                    </div>
                    {selectedApplication.reviewedAt && (
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-3 h-3 text-green-600" />
                        </div>
                        <div>
                          <div className="font-medium text-sm">Xem xét bởi {selectedApplication.reviewedBy}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(selectedApplication.reviewedAt).toLocaleString('vi-VN')}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {selectedApplication.status === 'reviewing' && (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleApprove(selectedApplication.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Duyệt hồ sơ
                    </button>
                    <button
                      onClick={() => {
                        setSelectedApplication(selectedApplication);
                        setShowRejectModal(true);
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Từ chối
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Reject Modal */}
        {showRejectModal && selectedApplication && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-md w-full m-4">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Từ chối hồ sơ</h2>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lý do từ chối
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Nhập lý do từ chối hồ sơ này..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleReject(selectedApplication.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Xác nhận từ chối
                  </button>
                  <button
                    onClick={() => {
                      setShowRejectModal(false);
                      setRejectReason('');
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Hủy
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

export default SellerApplicationManagement;
