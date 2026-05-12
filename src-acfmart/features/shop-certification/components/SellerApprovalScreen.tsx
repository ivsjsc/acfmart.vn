import React, { useState, useEffect } from 'react';
import { ShopCertificationService, ShopCertificationRequest } from '../certification-service';

const SellerApprovalScreen: React.FC = () => {
  const [requests, setRequests] = useState<ShopCertificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<ShopCertificationRequest | null>(null);

  useEffect(() => {
    loadPendingRequests();
  }, []);

  const loadPendingRequests = async () => {
    try {
      // Trong thực tế, sẽ gọi API backend để lấy danh sách yêu cầu đăng ký người bán
      // Mock data tạm thời
      const mockRequests: ShopCertificationRequest[] = [
        {
          id: 'cert_12345',
          shopId: 'shop_001',
          shopName: 'Cửa hàng Minh Anh',
          ownerName: 'Nguyễn Văn Anh',
          businessLicense: '123456789',
          businessType: 'retailer',
          contactEmail: 'minhanh@example.com',
          contactPhone: '0912345678',
          address: '123 Đường ABC, Quận XYZ, TP.HCM',
          documents: [
            {
              id: 'doc_001',
              type: 'business_license',
              fileName: 'giay_phep_kinh_doanh.pdf',
              filePath: '/uploads/doc_001/giay_phep_kinh_doanh.pdf',
              uploadedAt: '2023-06-15T10:30:00Z',
              verified: false
            },
            {
              id: 'doc_002',
              type: 'tax_certificate',
              fileName: 'giay_chung_nhan_thue.jpg',
              filePath: '/uploads/doc_002/giay_chung_nhan_thue.jpg',
              uploadedAt: '2023-06-15T10:30:00Z',
              verified: false
            }
          ],
          status: 'pending',
          requestedAt: '2023-06-15T10:30:00Z'
        },
        {
          id: 'cert_12346',
          shopId: 'shop_002',
          shopName: 'Cửa hàng Thuận Việt',
          ownerName: 'Trần Thị Bình',
          businessLicense: '987654321',
          businessType: 'brand_official',
          contactEmail: 'thuanviet@example.com',
          contactPhone: '0987654321',
          address: '456 Đường DEF, Quận UVW, Hà Nội',
          documents: [
            {
              id: 'doc_003',
              type: 'business_license',
              fileName: 'giay_phep_kinh_doanh.jpg',
              filePath: '/uploads/doc_003/giay_phep_kinh_doanh.jpg',
              uploadedAt: '2023-06-16T14:20:00Z',
              verified: false
            },
            {
              id: 'doc_004',
              type: 'brand_authorization',
              fileName: 'giay_uy_quyen_thuong_hieu.pdf',
              filePath: '/uploads/doc_004/giay_uy_quyen_thuong_hieu.pdf',
              uploadedAt: '2023-06-16T14:20:00Z',
              verified: false
            }
          ],
          status: 'pending',
          requestedAt: '2023-06-16T14:20:00Z'
        }
      ];
      
      setRequests(mockRequests);
      setLoading(false);
    } catch (error) {
      console.error('Error loading certification requests:', error);
      setLoading(false);
    }
  };

  const handleApprove = (requestId: string) => {
    // Trong thực tế, sẽ gọi API backend để cập nhật trạng thái yêu cầu
    console.log(`Approving request ${requestId}`);
    updateRequestStatus(requestId, 'approved');
  };

  const handleReject = (requestId: string) => {
    // Trong thực tế, sẽ gọi API backend để cập nhật trạng thái yêu cầu
    console.log(`Rejecting request ${requestId}`);
    updateRequestStatus(requestId, 'rejected');
  };

  const updateRequestStatus = (requestId: string, status: 'approved' | 'rejected' | 'under_review') => {
    setRequests(prev => prev.map(req => 
      req.id === requestId ? { ...req, status, reviewedAt: new Date().toISOString() } : req
    ));
    
    if (selectedRequest && selectedRequest.id === requestId) {
      setSelectedRequest({...selectedRequest, status, reviewedAt: new Date().toISOString()});
    }
  };

  const viewDetails = (request: ShopCertificationRequest) => {
    setSelectedRequest(request);
  };

  const closeDetails = () => {
    setSelectedRequest(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Quản lý đăng ký người bán</h1>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cửa hàng
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Chủ sở hữu
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Loại hình
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày đăng ký
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{request.shopName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{request.ownerName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {request.businessType === 'individual' && 'Cá nhân'}
                      {request.businessType === 'retailer' && 'Cửa hàng bán lẻ'}
                      {request.businessType === 'brand_official' && 'Thương hiệu chính hãng'}
                      {request.businessType === 'manufacturer' && 'Nhà sản xuất'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(request.requestedAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${request.status === 'approved' ? 'bg-green-100 text-green-800' : 
                        request.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                        request.status === 'under_review' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-gray-100 text-gray-800'}`}>
                      {request.status === 'pending' && 'Chờ xử lý'}
                      {request.status === 'approved' && 'Đã duyệt'}
                      {request.status === 'rejected' && 'Từ chối'}
                      {request.status === 'under_review' && 'Đang xem xét'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => viewDetails(request)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      Xem
                    </button>
                    {request.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(request.id)}
                          className="text-green-600 hover:text-green-900 mr-3"
                        >
                          Duyệt
                        </button>
                        <button
                          onClick={() => handleReject(request.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Từ chối
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal hiển thị chi tiết yêu cầu */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-bold text-gray-800">Chi tiết yêu cầu đăng ký</h2>
                <button 
                  onClick={closeDetails}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mt-4 space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Tên cửa hàng</h3>
                  <p className="mt-1 text-gray-900">{selectedRequest.shopName}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Chủ sở hữu</h3>
                  <p className="mt-1 text-gray-900">{selectedRequest.ownerName}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Loại hình kinh doanh</h3>
                  <p className="mt-1 text-gray-900">
                    {selectedRequest.businessType === 'individual' && 'Cá nhân/Tiệm tạp hóa'}
                    {selectedRequest.businessType === 'retailer' && 'Cửa hàng bán lẻ'}
                    {selectedRequest.businessType === 'brand_official' && 'Thương hiệu chính hãng'}
                    {selectedRequest.businessType === 'manufacturer' && 'Nhà sản xuất'}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Thông tin liên hệ</h3>
                  <p className="mt-1 text-gray-900">{selectedRequest.contactEmail}</p>
                  <p className="text-gray-900">{selectedRequest.contactPhone}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Địa chỉ</h3>
                  <p className="mt-1 text-gray-900">{selectedRequest.address}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Tài liệu đính kèm</h3>
                  <ul className="mt-1 space-y-2">
                    {selectedRequest.documents.map(doc => (
                      <li key={doc.id} className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                        </svg>
                        <a 
                          href={doc.filePath} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {doc.fileName}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                {selectedRequest.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleApprove(selectedRequest.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none"
                    >
                      Duyệt yêu cầu
                    </button>
                    <button
                      onClick={() => handleReject(selectedRequest.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none"
                    >
                      Từ chối yêu cầu
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerApprovalScreen;