import React, { useState, useEffect } from 'react';
import { Camera, Scan, AlertCircle, CheckCircle, Package, MapPin, Calendar } from 'lucide-react';

interface ProductInfo {
  id: string;
  name: string;
  brand: string;
  manufactureDate: string;
  expiryDate?: string;
  origin: string;
  status: 'verified' | 'suspicious' | 'not_found';
  authenticityScore: number;
  lastScanned: string;
  manufacturingFacility?: {
    name: string;
    address: string;
    license: string;
  };
  supplyChain?: Array<{
    date: string;
    location: string;
    action: string; // received, shipped, stored, etc.
  }>;
}

const ProductVerificationScreen: React.FC = () => {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ProductInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'chain' | 'report'>('info');

  // Mock function to simulate scanning and verifying a product
  const scanAndVerifyProduct = async (qrCode: string) => {
    try {
      setScanning(true);
      setError(null);
      
      // Simulate API call to backend to verify product
      // In real implementation, this would call our backend API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock data based on QR code
      let productInfo: ProductInfo;
      
      if (qrCode.startsWith('valid_')) {
        productInfo = {
          id: qrCode,
          name: 'Sữa rửa mặt ngừa mụn Clean & Clear',
          brand: 'Clean & Clear',
          manufactureDate: '2023-05-15',
          expiryDate: '2026-05-15',
          origin: 'Việt Nam',
          status: 'verified',
          authenticityScore: 98,
          lastScanned: new Date().toISOString(),
          manufacturingFacility: {
            name: 'Nhà máy mỹ phẩm Quốc tế ELMEX',
            address: 'KCN Sóng Thần, Dĩ An, Bình Dương',
            license: 'ELMEX-2023-001'
          },
          supplyChain: [
            { date: '2023-05-16', location: 'Bình Dương', action: 'Đóng gói và kiểm định' },
            { date: '2023-05-18', location: 'TP.HCM', action: 'Nhập kho phân phối' },
            { date: '2023-05-20', location: 'Quận 1, TP.HCM', action: 'Nhập cửa hàng' }
          ]
        };
      } else if (qrCode.startsWith('suspicious_')) {
        productInfo = {
          id: qrCode,
          name: 'Trà sữa Hokkaido',
          brand: 'Tiger Sugar',
          manufactureDate: '2023-04-10',
          expiryDate: '2023-07-10',
          origin: 'Không rõ nguồn gốc',
          status: 'suspicious',
          authenticityScore: 25,
          lastScanned: new Date().toISOString(),
          manufacturingFacility: {
            name: 'Cơ sở sản xuất tư nhân',
            address: 'Không rõ',
            license: 'Không có thông tin'
          },
          supplyChain: [
            { date: '2023-04-12', location: 'Không xác định', action: 'Sản xuất' },
            { date: '2023-04-15', location: 'Không rõ', action: 'Đóng gói' }
          ]
        };
      } else {
        productInfo = {
          id: qrCode,
          name: 'Không tìm thấy thông tin sản phẩm',
          brand: 'Không xác định',
          manufactureDate: 'Không xác định',
          origin: 'Không xác định',
          status: 'not_found',
          authenticityScore: 0,
          lastScanned: new Date().toISOString()
        };
      }
      
      setResult(productInfo);
    } catch (err) {
      setError('Không thể quét mã QR. Vui lòng thử lại.');
      console.error('Scan error:', err);
    } finally {
      setScanning(false);
    }
  };

  const handleScanClick = () => {
    // In a real implementation, this would open the device camera
    // For now, we'll simulate with mock data
    const mockQrCode = Math.random() > 0.3 ? 
      (Math.random() > 0.5 ? 'valid_product_123' : 'suspicious_product_456') : 
      'invalid_product_789';
    
    scanAndVerifyProduct(mockQrCode);
  };

  const handleManualInput = () => {
    const qrCode = prompt('Nhập mã QR hoặc mã vạch:');
    if (qrCode) {
      scanAndVerifyProduct(qrCode);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'text-green-600 bg-green-100';
      case 'suspicious':
        return 'text-yellow-600 bg-yellow-100';
      case 'not_found':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="w-5 h-5" />;
      case 'suspicious':
        return <AlertCircle className="w-5 h-5" />;
      case 'not_found':
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <Package className="w-5 h-5" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <Scan className="w-6 h-6 mr-2 text-blue-600" />
            Xác minh sản phẩm chính hãng
          </h1>
          <p className="text-gray-600 mt-2">
            Quét mã QR để kiểm tra tính xác thực của sản phẩm
          </p>
        </div>

        <div className="p-6">
          {!result ? (
            <div className="text-center py-12">
              <div className="mx-auto bg-gray-100 rounded-full p-4 w-24 h-24 flex items-center justify-center mb-6">
                <Camera className="w-12 h-12 text-blue-600 mx-auto" />
              </div>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Quét mã QR để xác minh</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Đặt mã QR hoặc mã vạch của sản phẩm vào khung phía trên để kiểm tra tính xác thực
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handleScanClick}
                  disabled={scanning}
                  className={`px-6 py-3 rounded-lg font-medium flex items-center justify-center ${
                    scanning 
                      ? 'bg-gray-300 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {scanning ? (
                    <>
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                      Đang quét...
                    </>
                  ) : (
                    <>
                      <Camera className="w-5 h-5 mr-2" />
                      Quét mã QR
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleManualInput}
                  className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center"
                >
                  <Package className="w-5 h-5 mr-2" />
                  Nhập mã thủ công
                </button>
              </div>
              
              {error && (
                <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-lg max-w-md mx-auto">
                  {error}
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/3">
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-4 
                      ${getStatusColor(result.status)}">
                      {getStatusIcon(result.status)}
                      <span className="ml-2 capitalize">
                        {result.status === 'verified' && 'Xác thực'}
                        {result.status === 'suspicious' && 'Nghi vấn'}
                        {result.status === 'not_found' && 'Không tồn tại'}
                      </span>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="text-3xl font-bold text-gray-800 mb-2">
                        {result.authenticityScore}%
                      </div>
                      <div className="text-sm text-gray-600">Độ xác thực</div>
                    </div>
                    
                    <div className="mt-4 text-left">
                      <h3 className="font-medium text-gray-800 mb-2">Thông tin sản phẩm</h3>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex">
                          <span className="font-medium w-32">Tên:</span>
                          <span>{result.name}</span>
                        </li>
                        <li className="flex">
                          <span className="font-medium w-32">Thương hiệu:</span>
                          <span>{result.brand}</span>
                        </li>
                        <li className="flex">
                          <span className="font-medium w-32">Xuất xứ:</span>
                          <span>{result.origin}</span>
                        </li>
                        <li className="flex">
                          <span className="font-medium w-32">SX/NK:</span>
                          <span>{new Date(result.manufactureDate).toLocaleDateString('vi-VN')}</span>
                        </li>
                        {result.expiryDate && (
                          <li className="flex">
                            <span className="font-medium w-32">HSD:</span>
                            <span>{new Date(result.expiryDate).toLocaleDateString('vi-VN')}</span>
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="md:w-2/3">
                  <div className="border-b border-gray-200">
                    <nav className="flex space-x-6">
                      <button
                        onClick={() => setActiveTab('info')}
                        className={`py-3 px-1 border-b-2 font-medium text-sm ${
                          activeTab === 'info'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        Chi tiết
                      </button>
                      <button
                        onClick={() => setActiveTab('chain')}
                        className={`py-3 px-1 border-b-2 font-medium text-sm ${
                          activeTab === 'chain'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        Chuỗi cung ứng
                      </button>
                      <button
                        onClick={() => setActiveTab('report')}
                        className={`py-3 px-1 border-b-2 font-medium text-sm ${
                          activeTab === 'report'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        Báo cáo
                      </button>
                    </nav>
                  </div>
                  
                  <div className="py-4">
                    {activeTab === 'info' && (
                      <div>
                        {result.manufacturingFacility ? (
                          <div>
                            <h3 className="font-medium text-gray-800 mb-3 flex items-center">
                              <Package className="w-5 h-5 mr-2 text-blue-600" />
                              Thông tin sản xuất
                            </h3>
                            <div className="bg-gray-50 rounded-lg p-4">
                              <ul className="space-y-2 text-sm text-gray-600">
                                <li className="flex">
                                  <span className="font-medium w-32">Nhà máy:</span>
                                  <span>{result.manufacturingFacility.name}</span>
                                </li>
                                <li className="flex">
                                  <span className="font-medium w-32">Địa chỉ:</span>
                                  <span>{result.manufacturingFacility.address}</span>
                                </li>
                                <li className="flex">
                                  <span className="font-medium w-32">Giấy phép:</span>
                                  <span>{result.manufacturingFacility.license}</span>
                                </li>
                              </ul>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-6">
                            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-600">Không có thông tin nhà sản xuất</p>
                          </div>
                        )}
                        
                        <div className="mt-6">
                          <h3 className="font-medium text-gray-800 mb-3 flex items-center">
                            <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                            Lần quét gần nhất
                          </h3>
                          <div className="text-sm text-gray-600">
                            {new Date(result.lastScanned).toLocaleString('vi-VN')}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {activeTab === 'chain' && (
                      <div>
                        {result.supplyChain && result.supplyChain.length > 0 ? (
                          <div>
                            <h3 className="font-medium text-gray-800 mb-4">Lịch sử di chuyển</h3>
                            <div className="space-y-4">
                              {result.supplyChain.map((step, index) => (
                                <div key={index} className="flex">
                                  <div className="flex flex-col items-center mr-4">
                                    <div className="rounded-full bg-blue-500 p-2">
                                      <MapPin className="w-4 h-4 text-white" />
                                    </div>
                                    {index !== result.supplyChain!.length - 1 && (
                                      <div className="w-0.5 h-full bg-gray-300 mt-2"></div>
                                    )}
                                  </div>
                                  <div className="pb-6">
                                    <div className="text-sm font-medium text-gray-800">
                                      {step.action === 'received' && 'Nhận hàng'}
                                      {step.action === 'shipped' && 'Vận chuyển'}
                                      {step.action === 'stored' && 'Lưu kho'}
                                      {step.action !== 'received' && step.action !== 'shipped' && step.action !== 'stored' && step.action}
                                    </div>
                                    <div className="text-sm text-gray-600">{step.location}</div>
                                    <div className="text-xs text-gray-500">
                                      {new Date(step.date).toLocaleDateString('vi-VN')}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-6">
                            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-600">Không có thông tin chuỗi cung ứng</p>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {activeTab === 'report' && (
                      <div>
                        <h3 className="font-medium text-gray-800 mb-4">Báo cáo sản phẩm</h3>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                          <div className="flex">
                            <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
                            <p className="text-yellow-800 text-sm">
                              Nếu bạn nghi ngờ đây là sản phẩm giả, hãy báo cáo để chúng tôi 
                              kiểm tra và ngăn chặn hàng giả lan rộng.
                            </p>
                          </div>
                        </div>
                        
                        <button className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg">
                          Báo cáo sản phẩm giả
                        </button>
                        
                        <div className="mt-6 pt-6 border-t border-gray-200">
                          <h4 className="font-medium text-gray-800 mb-3">Lý do báo cáo</h4>
                          <div className="space-y-2">
                            <label className="flex items-center">
                              <input type="radio" name="reason" className="h-4 w-4 text-blue-600" />
                              <span className="ml-2 text-sm text-gray-700">Giá quá rẻ so với thị trường</span>
                            </label>
                            <label className="flex items-center">
                              <input type="radio" name="reason" className="h-4 w-4 text-blue-600" />
                              <span className="ml-2 text-sm text-gray-700">Bao bì không giống hàng chính hãng</span>
                            </label>
                            <label className="flex items-center">
                              <input type="radio" name="reason" className="h-4 w-4 text-blue-600" />
                              <span className="ml-2 text-sm text-gray-700">Địa điểm mua không đáng tin cậy</span>
                            </label>
                            <label className="flex items-center">
                              <input type="radio" name="reason" className="h-4 w-4 text-blue-600" />
                              <span className="ml-2 text-sm text-gray-700">Khác</span>
                            </label>
                          </div>
                          
                          <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Mô tả chi tiết (không bắt buộc)
                            </label>
                            <textarea 
                              rows={3}
                              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Mô tả thêm về lý do bạn nghi ngờ sản phẩm..."
                            ></textarea>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex justify-center">
                <button
                  onClick={() => {
                    setResult(null);
                    setError(null);
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
                >
                  Quét lại
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductVerificationScreen;