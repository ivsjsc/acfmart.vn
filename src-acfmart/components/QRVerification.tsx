import React, { useState, useEffect } from 'react';
import { QrCode, CheckCircle, XCircle, AlertTriangle, ShieldCheck, X, Copy, ExternalLink, Calendar, MapPin, Hash, Globe } from 'lucide-react';
import { useStore, Product } from '../store';
import { QrScanner } from './QrScanner';
import { showSuccess, showWarning } from '../lib/notifications';

interface QRVerificationProps {
  productId?: string; // Accept product ID to fetch from store
  product?: Product; // Or accept product directly
  onClose: () => void;
}

export function QRVerification({ productId, product: propProduct, onClose }: QRVerificationProps) {
  const { products } = useStore();
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'scanning' | 'verified' | 'failed' | 'not_found'>('idle');
  const [verificationDetails, setVerificationDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [scanHistory, setScanHistory] = useState<any[]>([]);
  const [showScanner, setShowScanner] = useState(false);
  
  // If product was passed via props, use it; otherwise find by ID
  const product = propProduct || (productId ? products.find(p => p.id === productId) : null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showSuccess('Đã sao chép vào clipboard');
  };

  const generateVerificationToken = () => {
    // Generate unique verification token for this product
    return `ACF-${product?.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // New function to fetch product from QR code result
  const fetchProductFromQr = async (qrCode: string) => {
    setIsLoading(true);
    setVerificationStatus('scanning');
    
    // Simulate API call to fetch product info from blockchain
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // In a real app, this would fetch from blockchain
    const foundProduct = products.find(p => p.id === qrCode || p.verificationInfo?.qrCodeUrl === qrCode);
    
    if (foundProduct) {
      setVerificationStatus('verified');
      const details = {
        verifiedAt: foundProduct.verificationInfo?.verificationDate || new Date(),
        verifiedBy: 'Trung tâm Kỹ thuật Chống hàng giả ACF',
        verificationToken: generateVerificationToken(),
        blockchainHash: `0x${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
        productInfo: {
          name: foundProduct.name,
          shopId: foundProduct.shopId,
          origin: foundProduct.origin,
          category: foundProduct.category
        },
        traceability: {
          manufacturing: {
            facility: 'Nhà máy sản xuất ABC',
            location: 'TP. HCM, Việt Nam',
            date: '2024-01-15',
            batch: 'BAT240115001'
          },
          qualityControl: {
            facility: 'Phòng kiểm định XYZ',
            location: 'Hà Nội, Việt Nam',
            date: '2024-01-18',
            result: 'Đạt tiêu chuẩn'
          },
          shipping: [
            {
              from: 'TP. HCM',
              to: 'Hà Nội',
              date: '2024-01-20',
              transporter: 'VCN Logistics'
            },
            {
              from: 'Hà Nội',
              to: 'Hải Phòng',
              date: '2024-01-22',
              transporter: 'FastShip Co.'
            }
          ],
          finalDestination: {
            location: 'Cửa hàng ủy quyền DEF',
            date: '2024-01-25'
          }
        },
        additionalChecks: {
          labelCompliance: true,
          qualityCertified: foundProduct.qualityInfo?.standardsApplied ? true : false,
          originVerified: true,
          packagingMatch: true
        }
      };
      setVerificationDetails(details);
      
      // Update scan history
      const newScan = {
        id: Date.now(),
        timestamp: new Date(),
        productId: foundProduct.id,
        status: 'verified',
        token: details.verificationToken
      };
      setScanHistory(prev => [newScan, ...prev.slice(0, 9)]); // Keep last 10 scans
    } else {
      setVerificationStatus('not_found');
      setVerificationDetails({
        message: 'Sản phẩm này chưa được đăng ký với ACF',
        suggestion: 'Vui lòng liên hệ người bán để xác minh sản phẩm'
      });
    }
    
    setIsLoading(false);
  };

  const handleScanSuccess = (result: string) => {
    setShowScanner(false);
    fetchProductFromQr(result);
  };

  const handleScanError = (error: string) => {
    setVerificationStatus('failed');
    setVerificationDetails({
      message: 'Lỗi quét mã QR',
      reason: error,
      suggestion: 'Vui lòng thử lại hoặc quét từ một góc khác'
    });
    setShowScanner(false);
    setIsLoading(false);
  };

  const getStatusIcon = () => {
    switch (verificationStatus) {
      case 'idle':
        return <QrCode className="w-16 h-16 text-blue-600" />;
      case 'scanning':
        return <QrCode className="w-16 h-16 text-blue-600 animate-pulse" />;
      case 'verified':
        return <CheckCircle className="w-16 h-16 text-green-600" />;
      case 'failed':
        return <XCircle className="w-16 h-16 text-red-600" />;
      case 'not_found':
        return <AlertTriangle className="w-16 h-16 text-yellow-600" />;
      default:
        return <QrCode className="w-16 h-16 text-gray-400" />;
    }
  };

  // Auto-fetch product if ID is provided
  useEffect(() => {
    if (product) {
      // If we have a product passed as prop, automatically verify it
      setVerificationStatus('verified');
      const details = {
        verifiedAt: product.verificationInfo?.verificationDate || new Date(),
        verifiedBy: 'Trung tâm Kỹ thuật Chống hàng giả ACF',
        verificationToken: generateVerificationToken(),
        blockchainHash: `0x${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
        productInfo: {
          name: product.name,
          shopId: product.shopId,
          origin: product.origin,
          category: product.category
        },
        additionalChecks: {
          labelCompliance: true,
          qualityCertified: product.qualityInfo?.standardsApplied ? true : false,
          originVerified: true,
          packagingMatch: true
        }
      };
      setVerificationDetails(details);
    }
  }, [product]);

  const getStatusText = () => {
    switch (verificationStatus) {
      case 'idle':
        return 'Sẵn sàng quét mã';
      case 'scanning':
        return 'Đang quét mã QR...';
      case 'verified':
        return 'Sản phẩm chính hãng!';
      case 'failed':
        return 'Cảnh báo: Hàng giả!';
      case 'not_found':
        return 'Sản phẩm chưa đăng ký';
      default:
        return 'Sẵn sàng quét mã';
    }
  };

  const getStatusColor = () => {
    switch (verificationStatus) {
      case 'idle':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'scanning':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'verified':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'failed':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'not_found':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (showScanner) {
    return <QrScanner onScanSuccess={handleScanSuccess} onError={handleScanError} onCancel={() => setShowScanner(false)} />;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <ShieldCheck className="w-6 h-6 mr-2 text-red-600" />
              Xác minh Sản phẩm ACF
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* QR Scanner Simulation */}
        <div className="p-6">
          <div className={`text-center p-8 rounded-2xl border-2 border-dashed ${getStatusColor()}`}>
            {getStatusIcon()}
            <h3 className="text-lg font-bold mt-4 mb-2">{getStatusText()}</h3>
            
            {verificationStatus === 'scanning' && (
              <div className="space-y-3">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                </div>
                <p className="text-sm text-gray-600">Đang kiểm tra trong cơ sở dữ liệu ACF...</p>
              </div>
            )}
          </div>

          {/* Product Info */}
          {product && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-bold text-gray-800 mb-3">Thông tin sản phẩm:</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tên sản phẩm:</span>
                  <span className="font-medium">{product.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Mã sản phẩm:</span>
                  <span className="font-mono text-xs">{product.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Người bán:</span>
                  <span className="font-medium">{product.shopId.substring(0, 8)}...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Nguồn gốc:</span>
                  <span className="font-medium">{product.origin === 'domestic' ? 'Trong nước' : 'Nhập khẩu'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Danh mục:</span>
                  <span className="font-medium">{product.category}</span>
                </div>
              </div>
            </div>
          )}

          {/* Verification Details */}
          {verificationDetails && (
            <div className={`mt-4 p-4 rounded-lg ${getStatusColor()}`}>
              <h4 className="font-bold mb-2">Kết quả xác minh:</h4>
              
              {verificationStatus === 'verified' && (
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                    <span>Sản phẩm đã được ACF xác minh</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                    <span>Đảm bảo chất lượng chính hãng</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                    <span>Được bảo vệ theo luật pháp Việt Nam</span>
                  </div>
                  
                  {verificationDetails.blockchainHash && (
                    <div className="mt-3 pt-3 border-t border-current flex items-center justify-between">
                      <div className="flex items-center">
                        <Hash className="w-4 h-4 mr-2 text-blue-600" />
                        <span className="text-xs">
                          <strong>Blockchain Hash:</strong>
                        </span>
                      </div>
                      <button 
                        onClick={() => copyToClipboard(verificationDetails.blockchainHash)}
                        className="text-blue-600 flex items-center gap-1 text-xs"
                      >
                        {verificationDetails.blockchainHash.substring(0, 8)}...
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  
                  {verificationDetails.verifiedAt && (
                    <div className="flex items-center text-xs mt-3">
                      <Calendar className="w-3 h-3 mr-2" />
                      <span>
                        <strong>Ngày xác minh:</strong> {new Date(verificationDetails.verifiedAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  )}
                  
                  {verificationDetails.traceability && (
                    <div className="mt-3 pt-3 border-t border-current">
                      <h5 className="font-semibold mb-2 flex items-center">
                        <Globe className="w-4 h-4 mr-2" />
                        Truy xuất nguồn gốc:
                      </h5>
                      
                      <div className="space-y-2">
                        <div className="text-xs p-2 bg-white bg-opacity-50 rounded">
                          <div className="font-medium">Sản xuất:</div>
                          <div>{verificationDetails.traceability.manufacturing.facility}</div>
                          <div className="text-gray-600">{verificationDetails.traceability.manufacturing.location} - {verificationDetails.traceability.manufacturing.date}</div>
                        </div>
                        
                        <div className="text-xs p-2 bg-white bg-opacity-50 rounded">
                          <div className="font-medium">Kiểm định:</div>
                          <div>{verificationDetails.traceability.qualityControl.facility}</div>
                          <div className="text-gray-600">{verificationDetails.traceability.qualityControl.location} - {verificationDetails.traceability.qualityControl.date}</div>
                        </div>
                        
                        {verificationDetails.traceability.shipping.map((ship: any, idx: number) => (
                          <div key={idx} className="text-xs p-2 bg-white bg-opacity-50 rounded">
                            <div className="font-medium">Vận chuyển #{idx + 1}:</div>
                            <div>{ship.from} → {ship.to}</div>
                            <div className="text-gray-600">{ship.transporter} - {ship.date}</div>
                          </div>
                        ))}
                        
                        <div className="text-xs p-2 bg-white bg-opacity-50 rounded">
                          <div className="font-medium">Đích đến:</div>
                          <div>{verificationDetails.traceability.finalDestination.location}</div>
                          <div className="text-gray-600">{verificationDetails.traceability.finalDestination.date}</div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {verificationDetails.additionalChecks && (
                    <div className="mt-3 pt-3 border-t border-current">
                      <h5 className="font-semibold mb-2">Kiểm tra chi tiết:</h5>
                      <div className="grid grid-cols-2 gap-2">
                        <div className={`flex items-center text-xs p-2 rounded ${verificationDetails.additionalChecks.labelCompliance ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50'}`}>
                          <CheckCircle className={`w-3 h-3 mr-1 ${verificationDetails.additionalChecks.labelCompliance ? 'text-green-600' : 'text-red-600'}`} />
                          <span>Nhãn mác</span>
                        </div>
                        <div className={`flex items-center text-xs p-2 rounded ${verificationDetails.additionalChecks.qualityCertified ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50'}`}>
                          <CheckCircle className={`w-3 h-3 mr-1 ${verificationDetails.additionalChecks.qualityCertified ? 'text-green-600' : 'text-red-600'}`} />
                          <span>Chất lượng</span>
                        </div>
                        <div className={`flex items-center text-xs p-2 rounded ${verificationDetails.additionalChecks.originVerified ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50'}`}>
                          <CheckCircle className={`w-3 h-3 mr-1 ${verificationDetails.additionalChecks.originVerified ? 'text-green-600' : 'text-red-600'}`} />
                          <span>Xuất xứ</span>
                        </div>
                        <div className={`flex items-center text-xs p-2 rounded ${verificationDetails.additionalChecks.packagingMatch ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50'}`}>
                          <CheckCircle className={`w-3 h-3 mr-1 ${verificationDetails.additionalChecks.packagingMatch ? 'text-green-600' : 'text-red-600'}`} />
                          <span>Bao bì</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {verificationDetails.verificationToken && (
                    <div className="mt-3 pt-3 border-t border-current flex items-center justify-between">
                      <div className="flex items-center">
                        <ShieldCheck className="w-4 h-4 mr-2 text-blue-600" />
                        <span className="text-xs">
                          <strong>Mã xác minh:</strong>
                        </span>
                      </div>
                      <button 
                        onClick={() => copyToClipboard(verificationDetails.verificationToken)}
                        className="text-blue-600 flex items-center gap-1 text-xs"
                      >
                        {verificationDetails.verificationToken.substring(0, 12)}...
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {verificationStatus === 'failed' && (
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <XCircle className="w-4 h-4 mr-2 text-red-600" />
                    <span>Không tìm thấy thông tin xác minh</span>
                  </div>
                  <div className="flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-2 text-red-600" />
                    <span>Rủi ro cao: Hàng giả</span>
                  </div>
                  <p className="text-xs mt-3">
                    <strong>Khuyến nghị:</strong> {verificationDetails.suggestion}
                  </p>
                </div>
              )}

              {verificationStatus === 'not_found' && (
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-2 text-yellow-600" />
                    <span>Sản phẩm chưa đăng ký</span>
                  </div>
                  <p className="text-xs mt-3">
                    <strong>Gợi ý:</strong> {verificationDetails.suggestion}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6 space-y-3">
            {verificationStatus === 'idle' && (
              <button
                onClick={() => setShowScanner(true)}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
              >
                <QrCode className="w-5 h-5 mr-2" />
                Quét mã QR để xác minh
              </button>
            )}

            {verificationStatus === 'scanning' && (
              <button
                onClick={() => {}}
                disabled={isLoading}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <QrCode className="w-5 h-5 mr-2" />
                    Quét mã QR để xác minh
                  </>
                )}
              </button>
            )}

            {verificationStatus === 'verified' && (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={onClose}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                >
                  Đã hiểu
                </button>
                <button
                  onClick={() => {
                    // Share verification results
                    if (navigator.share) {
                      navigator.share({
                        title: 'Xác minh sản phẩm chính hãng',
                        text: `Tôi đã xác minh sản phẩm "${product?.name}" là chính hãng thông qua ACF Anti-Counterfeiting`,
                        url: window.location.href
                      }).catch(console.error);
                    } else {
                      showWarning('Tính năng chia sẻ không hỗ trợ trên trình duyệt này');
                    }
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                >
                  <ExternalLink className="w-5 h-5 mr-2" />
                  Chia sẻ
                </button>
              </div>
            )}

            {(verificationStatus === 'failed' || verificationStatus === 'not_found') && (
              <div className="space-y-3">
                <button
                  onClick={() => {
                    // Redirect to report counterfeit
                    showWarning('Tính năng báo cáo hàng giả đang phát triển');
                  }}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                >
                  Báo cáo hàng giả
                </button>
                <button
                  onClick={onClose}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                >
                  Đóng
                </button>
              </div>
            )}
          </div>
          
          {/* Recent Scans */}
          {scanHistory.length > 0 && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-bold text-gray-800 mb-2">Lịch sử quét gần đây:</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {scanHistory.slice(0, 3).map(scan => (
                  <div key={scan.id} className="flex justify-between text-xs p-2 bg-white border rounded">
                    <span>{new Date(scan.timestamp).toLocaleTimeString('vi-VN')}</span>
                    <span className={`px-2 py-1 rounded-full ${scan.status === 'verified' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {scan.status === 'verified' ? 'Chính hãng' : 'Cảnh báo'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}