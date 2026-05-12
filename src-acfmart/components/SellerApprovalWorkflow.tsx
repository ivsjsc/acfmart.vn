import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, CheckCircle, XCircle, Clock, AlertCircle, User, Store, FileText, Calendar, Download, Mail, Phone, MapPin, CreditCard, Shield, Star, ChevronDown, Upload, Check, Package, ShoppingCart, Heart, Home, Settings, BarChart3, Users, MessageSquare, Bell, Archive, Truck, BadgeCheck, ExternalLink, Copy, Trash2, Edit3, EyeOff } from 'lucide-react';
import { zaloNotificationService } from '../services/zaloNotificationService'; // Import the Zalo notification service

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
  shopLogoVerified?: boolean;
  businessLicense?: string;
  taxCode: string;
  bankName: string;
  bankAccount: string;
  status: 'pending' | 'reviewing' | 'approved' | 'rejected' | 'needs_info' | 'payment_pending';
  submittedAt: string;
  updatedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  sellerId?: string;
  googleEmail: string;
  paymentStatus?: 'pending' | 'paid' | 'failed';
  registrationFee?: number;
  applicationVersion: number;
  documents?: {
    acfFormFile?: string;
    vneidScreenshot?: string;
    idCard?: string;
    businessLicense?: string;
    distributionContract?: string;
    qualityCertificate?: string;
    taxCertificate?: string;
    bankStatement?: string;
  };
  verificationStatus?: {
    email: boolean;
    phone: boolean;
    address: boolean;
    business: boolean;
    bank: boolean;
    shopCategory: boolean;
  };
  notes?: string[];
}

const SellerApprovalWorkflow: React.FC = () => {
  const [applications, setApplications] = useState<SellerApplication[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<SellerApplication | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [approvalNotes, setApprovalNotes] = useState('');
  const [sellerIdPrefix, setSellerIdPrefix] = useState('ACF-SELLER');
  const [registrationFee] = useState(500000); // 500k VND

  // Fetch applications from localStorage where BecomeSeller stores the data
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        // Get applications from localStorage
        const storedApplications = localStorage.getItem('sellerApplication');
        if (storedApplications) {
          const parsedApplication = JSON.parse(storedApplications);
          // Convert single application to array or get from a different key
          setApplications([parsedApplication]);
        } else {
          // Try getting from a different key that might store multiple applications
          const allApplications = localStorage.getItem('sellerApplications');
          if (allApplications) {
            const parsedApplications = JSON.parse(allApplications);
            setApplications(parsedApplications);
          } else {
            setApplications([]);
          }
        }
      } catch (error) {
        console.error('Error fetching applications:', error);
        // Fallback to empty array
        setApplications([]);
      }
    };

    fetchApplications();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'reviewing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'needs_info': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'payment_pending': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Chờ xử lý';
      case 'reviewing': return 'Đang xem xét';
      case 'needs_info': return 'Cần bổ sung thông tin';
      case 'payment_pending': return 'Chờ thanh toán';
      case 'approved': return 'Đã duyệt';
      case 'rejected': return 'Đã từ chối';
      default: return status;
    }
  };

  const generateSellerId = (application: SellerApplication) => {
    const timestamp = new Date(application.submittedAt).getTime();
    const random = Math.random().toString(36).substr(2, 6).toUpperCase();
    return `${sellerIdPrefix}-${timestamp}-${random}`;
  };

  const handleApprove = async () => {
    if (!selectedApplication) return;

    const sellerId = generateSellerId(selectedApplication);
    
    setApplications(prev => prev.map(app => 
      app.id === selectedApplication.id 
        ? { 
            ...app, 
            status: 'approved' as const,
            reviewedAt: new Date().toISOString(),
            reviewedBy: 'admin@acf.vn',
            sellerId,
            notes: [...(app.notes || []), `Đã duyệt với Seller ID: ${sellerId}`, `Ghi chú: ${approvalNotes}`]
          } 
        : app
    ));
    
    // Send approval notification via Zalo
    if (zaloNotificationService) {
      try {
        const updatedApplication = {
          ...selectedApplication,
          status: 'approved' as const,
          reviewedAt: new Date().toISOString(),
          reviewedBy: 'Admin',
          sellerId,
          notes: [...(selectedApplication.notes || []), `Đã duyệt với Seller ID: ${sellerId}`, `Ghi chú: ${approvalNotes}`],
          updatedAt: new Date().toISOString(),
          applicationVersion: 1,
          verificationStatus: {
            ...selectedApplication.verificationStatus,
            shopCategory: true
          }
        };
        const notificationResults = await zaloNotificationService.notifySellerStatus(updatedApplication, 'approved');
        console.log('Zalo approval notifications sent:', notificationResults);
      } catch (error) {
        console.error('Error sending Zalo approval notifications:', error);
      }
    }
    
    // Send approval email
    console.log(`Approval email sent to ${selectedApplication.email}`);
    console.log(`Seller ID generated: ${sellerId}`);
    
    setShowApprovalModal(false);
    setApprovalNotes('');
  };

  const handleReject = async () => {
    if (!selectedApplication || !rejectReason.trim()) return;

    setApplications(prev => prev.map(app => 
      app.id === selectedApplication.id 
        ? { 
            ...app, 
            status: 'rejected' as const,
            reviewedAt: new Date().toISOString(),
            reviewedBy: 'admin@acf.vn',
            rejectionReason: rejectReason,
            notes: [...(app.notes || []), `Đã từ chối: ${rejectReason}`]
          } 
        : app
    ));
    
    // Send rejection notification via Zalo
    if (zaloNotificationService) {
      try {
        const updatedApplication = {
          ...selectedApplication,
          status: 'rejected' as const,
          reviewedAt: new Date().toISOString(),
          reviewedBy: 'admin@acf.vn',
          rejectionReason: rejectReason,
          notes: [...(selectedApplication.notes || []), `Đã từ chối: ${rejectReason}`],
          updatedAt: new Date().toISOString(),
          applicationVersion: 1,
          verificationStatus: {
            ...selectedApplication.verificationStatus,
            shopCategory: true
          }
        };
        const notificationResults = await zaloNotificationService.notifySellerStatus(updatedApplication, 'rejected');
        console.log('Zalo rejection notifications sent:', notificationResults);
      } catch (error) {
        console.error('Error sending Zalo rejection notifications:', error);
      }
    }
    
    setShowRejectModal(false);
    setRejectReason('');
  };

  const handleRequestMoreInfo = (applicationId: string, note: string) => {
    setApplications(prev => prev.map(app => 
      app.id === applicationId 
        ? { 
            ...app, 
            status: 'needs_info' as const,
            notes: [...(app.notes || []), `Yêu cầu bổ sung: ${note}`]
          } 
        : app
    ));
  };

  const handlePaymentConfirmation = (applicationId: string) => {
    setApplications(prev => prev.map(app => 
      app.id === applicationId 
        ? { 
            ...app, 
            status: 'reviewing' as const,
            paymentStatus: 'paid' as const,
            reviewedAt: new Date().toISOString(),
            notes: [...(app.notes || []), 'Đã xác nhận thanh toán phí đăng ký']
          } 
        : app
    ));
    setShowPaymentModal(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'reviewing': return <Eye className="w-4 h-4" />;
      case 'needs_info': return <AlertCircle className="w-4 h-4" />;
      case 'payment_pending': return <CreditCard className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
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

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Quản lý Duyệt Seller</h1>
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <Download className="w-4 h-4" />
                Xuất báo cáo
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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

            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600">Chờ thanh toán</p>
                  <p className="text-2xl font-bold text-purple-700">
                    {applications.filter(a => a.status === 'payment_pending').length}
                  </p>
                </div>
                <CreditCard className="w-8 h-8 text-purple-600" />
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <option value="payment_pending">Chờ thanh toán</option>
              <option value="reviewing">Đang xem xét</option>
              <option value="needs_info">Cần bổ sung</option>
              <option value="approved">Đã duyệt</option>
              <option value="rejected">Đã từ chối</option>
            </select>

            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Seller ID:</label>
              <input
                type="text"
                value={sellerIdPrefix}
                onChange={(e) => setSellerIdPrefix(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ACF-SELLER"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Phí đăng ký:</label>
              <input
                type="number"
                value={registrationFee}
                readOnly
                className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
              <span className="text-sm text-gray-600">VNĐ</span>
            </div>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thanh toán</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Xác thực</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredApplications.map((application) => (
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
                        <div className="text-gray-500">{application.email}</div>
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
                        <div className="font-medium text-gray-900">{application.registrationFee?.toLocaleString('vi-VN')}đ</div>
                        <div className={`text-xs ${application.paymentStatus === 'paid' ? 'text-green-600' : 'text-red-600'}`}>
                          {application.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chờ thanh toán'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(application.verificationStatus).map(([key, value]) => (
                          <span
                            key={key}
                            className={`px-2 py-1 text-xs rounded-full ${
                              value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {key === 'email' ? 'Email' :
                             key === 'phone' ? 'SĐT' :
                             key === 'address' ? 'Địa chỉ' :
                             key === 'business' ? 'Kinh doanh' :
                             key === 'bank' ? 'Ngân hàng' : key}
                          </span>
                        ))}
                      </div>
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
                          onClick={() => {
                            setSelectedApplication(application);
                            setShowDetails(true);
                          }}
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
                            }}
                            className="text-yellow-600 hover:text-yellow-900 transition-colors"
                            title="Bắt đầu xem xét"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        {application.status === 'payment_pending' && (
                          <button
                            onClick={() => {
                              setSelectedApplication(application);
                              setShowPaymentModal(true);
                            }}
                            className="text-purple-600 hover:text-purple-900 transition-colors"
                            title="Xác nhận thanh toán"
                          >
                            <CreditCard className="w-4 h-4" />
                          </button>
                        )}
                        {application.status === 'reviewing' && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedApplication(application);
                                setShowApprovalModal(true);
                              }}
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
                            <button
                              onClick={() => {
                                const note = prompt('Nhập yêu cầu bổ sung thông tin:');
                                if (note) handleRequestMoreInfo(application.id, note);
                              }}
                              className="text-orange-600 hover:text-orange-900 transition-colors"
                              title="Yêu cầu bổ sung"
                            >
                              <AlertCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Application Details Modal */}
        {showDetails && selectedApplication && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto m-4">
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

                {/* Personal & Business Info */}
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
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Thông tin kinh doanh</h3>
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
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">Mã thuế: {selectedApplication.taxCode}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{selectedApplication.bankName} - {selectedApplication.bankAccount}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Documents */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Tài liệu đính kèm</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="border rounded-lg p-3">
                      <div className="aspect-video bg-gray-100 rounded mb-2 flex items-center justify-center">
                        <FileText className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-sm font-medium">Giấy phép KD</p>
                      <button className="text-xs text-blue-600 hover:text-blue-800">Xem</button>
                    </div>
                    <div className="border rounded-lg p-3">
                      <div className="aspect-video bg-gray-100 rounded mb-2 flex items-center justify-center">
                        <User className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-sm font-medium">CMND/CCCD</p>
                      <button className="text-xs text-blue-600 hover:text-blue-800">Xem</button>
                    </div>
                    <div className="border rounded-lg p-3">
                      <div className="aspect-video bg-gray-100 rounded mb-2 flex items-center justify-center">
                        <Shield className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-sm font-medium">Giấy chứng thuế</p>
                      <button className="text-xs text-blue-600 hover:text-blue-800">Xem</button>
                    </div>
                    <div className="border rounded-lg p-3">
                      <div className="aspect-video bg-gray-100 rounded mb-2 flex items-center justify-center">
                        <CreditCard className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-sm font-medium">Sao kê ngân hàng</p>
                      <button className="text-xs text-blue-600 hover:text-blue-800">Xem</button>
                    </div>
                  </div>
                </div>

                {/* Verification Status */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Trạng thái xác thực</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {Object.entries(selectedApplication.verificationStatus).map(([key, value]) => (
                      <div
                        key={key}
                        className={`p-3 rounded-lg border ${
                          value ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {value ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-600" />
                          )}
                          <span className="text-sm font-medium">
                            {key === 'email' ? 'Email' :
                             key === 'phone' ? 'SĐT' :
                             key === 'address' ? 'Địa chỉ' :
                             key === 'business' ? 'Kinh doanh' :
                             key === 'bank' ? 'Ngân hàng' : key}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">
                          {value ? 'Đã xác thực' : 'Chưa xác thực'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                {selectedApplication.notes && selectedApplication.notes.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Ghi chú</h3>
                    <div className="space-y-2">
                      {selectedApplication.notes.map((note, index) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg text-sm">
                          {note}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                {selectedApplication.status === 'reviewing' && (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setSelectedApplication(selectedApplication);
                        setShowApprovalModal(true);
                      }}
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
                    <button
                      onClick={() => {
                        const note = prompt('Nhập yêu cầu bổ sung thông tin:');
                        if (note) handleRequestMoreInfo(selectedApplication.id, note);
                      }}
                      className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                    >
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Yêu cầu bổ sung
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Approval Modal */}
        {showApprovalModal && selectedApplication && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-md w-full m-4">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Duyệt hồ sơ Seller</h2>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ghi chú duyệt
                  </label>
                  <textarea
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Nhập ghi chú cho việc duyệt hồ sơ..."
                    value={approvalNotes}
                    onChange={(e) => setApprovalNotes(e.target.value)}
                  />
                </div>
                <div className="mb-4 p-4 bg-green-50 rounded-lg">
                  <p className="text-sm font-medium text-green-900 mb-2">Thông tin Seller ID sẽ được tạo:</p>
                  <p className="text-lg font-bold text-green-600">{generateSellerId(selectedApplication)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleApprove}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Xác nhận duyệt
                  </button>
                  <button
                    onClick={() => setShowApprovalModal(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Hủy
                  </button>
                </div>
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
                    onClick={handleReject}
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

        {/* Payment Confirmation Modal */}
        {showPaymentModal && selectedApplication && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-md w-full m-4">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Xác nhận thanh toán</h2>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Hồ sơ:</p>
                  <p className="font-medium">{selectedApplication.applicationId}</p>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Phí đăng ký:</p>
                  <p className="text-lg font-bold text-purple-600">{selectedApplication.registrationFee?.toLocaleString('vi-VN')}đ</p>
                </div>
                <div className="mb-4 p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-purple-800">
                    Xác nhận rằng hồ sơ này đã thanh toán phí đăng ký và sẵn sàng cho việc xem xét.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handlePaymentConfirmation(selectedApplication.id)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Xác nhận đã thanh toán
                  </button>
                  <button
                    onClick={() => setShowPaymentModal(false)}
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

export default SellerApprovalWorkflow;