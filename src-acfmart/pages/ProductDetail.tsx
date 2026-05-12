import React, { useState, useEffect } from 'react';
import { Star, MapPin, Calendar, ShieldCheck, AlertTriangle, Heart, Share2, ArrowLeft, ShoppingCart, CheckCircle, XCircle, AlertCircle, Copy, ExternalLink } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useStore, Product } from '../store';
import { QRVerification } from '../components/QRVerification';
import { showSuccess } from '../lib/notifications';
import { ReportCounterfeit } from '../components/ReportCounterfeit';

export function ProductDetail() {
  const { productId } = useParams<{ productId: string }>();
  const { products, addToCart } = useStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (productId) {
      const foundProduct = products.find(p => p.id === productId);
      if (foundProduct) {
        setProduct(foundProduct);
      }
    }
  }, [productId, products]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      showSuccess('Sản phẩm đã được thêm vào giỏ hàng!');
    }
  };

  const handleBuyNow = () => {
    if (product) {
      addToCart(product, quantity);
      // Navigate to checkout
      window.location.href = '/checkout';
    }
  };

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải sản phẩm...</p>
        </div>
      </div>
    );
  }

  const images = [
    product.image,
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1099&q=80',
    'https://images.unsplash.com/photo-1499950505025-7fed7ec4b768?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    'https://images.unsplash.com/photo-1546868871-7041f2a55e12?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=764&q=80'
  ];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center">
            <button 
              onClick={() => window.history.back()} 
              className="flex items-center text-gray-700 hover:text-red-600"
            >
              <ArrowLeft className="w-5 h-5 mr-1" />
              Quay lại
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
            {/* Product Images */}
            <div>
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
                <img 
                  src={images[selectedImage]} 
                  alt={product.name} 
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {images.map((img, idx) => (
                  <div 
                    key={idx}
                    className={`aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer border-2 ${selectedImage === idx ? 'border-red-600' : 'border-transparent'}`}
                    onClick={() => setSelectedImage(idx)}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
                  <div className="flex items-center mt-1">
                    <div className="flex">
                      {renderStars(4.5)}
                    </div>
                    <span className="text-gray-500 text-sm ml-2">(128 đánh giá)</span>
                  </div>
                </div>
                <button 
                  onClick={() => setIsFavorite(!isFavorite)}
                  className={`${isFavorite ? 'text-red-600' : 'text-gray-400'} hover:text-red-600`}
                >
                  <Heart className={`w-6 h-6 ${isFavorite ? 'fill-current' : ''}`} />
                </button>
              </div>

              <div className="mt-6">
                <div className="text-3xl font-bold text-red-600">{product.price.toLocaleString('vi-VN')} ₫</div>
                {product.commercialInfo?.promotionalPrice && (
                  <div className="flex items-center mt-1">
                    <span className="text-lg text-gray-500 line-through">{product.commercialInfo.promotionalPrice.toLocaleString('vi-VN')} ₫</span>
                    <span className="ml-3 bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                      Giảm {Math.round((1 - product.price / product.commercialInfo.promotionalPrice) * 100)}%
                    </span>
                  </div>
                )}
              </div>

              {/* Product Info Badges */}
              <div className="mt-6 flex flex-wrap gap-2">
                {product.verificationInfo?.verifiedByAcf && (
                  <div className="flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                    <ShieldCheck className="w-4 h-4 mr-1" />
                    Chính hãng ACF
                  </div>
                )}
                <div className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Miễn phí giao hàng
                </div>
                <div className="flex items-center bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  7 ngày đổi trả
                </div>
              </div>

              {/* Shop Info */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
                  <div className="ml-4">
                    <h3 className="font-bold text-gray-900">{product.shopId}</h3>
                    <div className="flex items-center text-sm text-gray-600 mt-1">
                      <div className="flex mr-4">
                        {renderStars(4.8)}
                        <span className="ml-1">4.8</span>
                      </div>
                      <span>12.5k sản phẩm</span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex space-x-2">
                  <button className="flex-1 bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50">
                    Theo dõi
                  </button>
                  <button className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700">
                    Chat
                  </button>
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="mt-6">
                <div className="flex items-center">
                  <span className="text-gray-700 mr-4">Số lượng:</span>
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button 
                      className="px-4 py-2 text-gray-600 hover:bg-gray-100"
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    >
                      -
                    </button>
                    <span className="px-4 py-2">{quantity}</span>
                    <button 
                      className="px-4 py-2 text-gray-600 hover:bg-gray-100"
                      onClick={() => setQuantity(q => q + 1)}
                    >
                      +
                    </button>
                  </div>
                  <span className="ml-4 text-gray-600">Còn {product.stock || 100} sản phẩm</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-3">
                <button 
                  onClick={handleAddToCart}
                  className="flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 px-4 rounded-lg transition-colors"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Thêm vào giỏ
                </button>
                <button 
                  onClick={handleBuyNow}
                  className="flex items-center justify-center bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                >
                  Mua ngay
                </button>
              </div>

              {/* Verification and Report Buttons */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setShowQRModal(true)}
                  className="flex items-center justify-center bg-green-100 hover:bg-green-200 text-green-800 font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  <ShieldCheck className="w-4 h-4 mr-2" />
                  Xác minh QR
                </button>
                <button 
                  onClick={() => setShowReportModal(true)}
                  className="flex items-center justify-center bg-red-100 hover:bg-red-200 text-red-800 font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Báo cáo giả
                </button>
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="border-t border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Chi tiết sản phẩm</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold text-gray-800 mb-2">Thông tin sản phẩm</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex">
                    <span className="text-gray-600 w-32">Tên sản phẩm:</span>
                    <span className="font-medium">{product.name}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-600 w-32">Mã sản phẩm:</span>
                    <span className="font-mono">{product.id}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-600 w-32">Danh mục:</span>
                    <span className="font-medium">{product.category}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-600 w-32">Xuất xứ:</span>
                    <span className="font-medium">{product.origin === 'domestic' ? 'Trong nước' : 'Nhập khẩu'}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-600 w-32">Thương hiệu:</span>
                    <span className="font-medium">{product.labelInfo?.brandName || 'N/A'}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-bold text-gray-800 mb-2">Thông tin pháp lý</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex">
                    <span className="text-gray-600 w-32">Nhà sản xuất:</span>
                    <span className="font-medium">{product.labelInfo?.manufacturerName || 'N/A'}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-600 w-32">Địa chỉ:</span>
                    <span className="font-medium">{product.labelInfo?.manufacturerAddress || 'N/A'}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-600 w-32">Quốc gia SX:</span>
                    <span className="font-medium">{product.labelInfo?.originCountry || 'N/A'}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-600 w-32">Số lô:</span>
                    <span className="font-medium">{product.labelInfo?.batchNumber || 'N/A'}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-600 w-32">Tiêu chuẩn áp dụng:</span>
                    <span className="font-medium">{product.qualityInfo?.standardsApplied || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {product.description && (
              <div className="mt-6">
                <h3 className="font-bold text-gray-800 mb-2">Mô tả sản phẩm</h3>
                <p className="text-gray-600">{product.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Sản phẩm liên quan</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <div className="aspect-square bg-gray-100 rounded-lg mb-3" />
                <h3 className="font-medium text-gray-900 line-clamp-2">Sản phẩm liên quan {item}</h3>
                <div className="flex items-center mt-1">
                  <div className="flex">
                    {renderStars(4.2)}
                  </div>
                  <span className="text-gray-500 text-xs ml-1">(12)</span>
                </div>
                <div className="mt-2">
                  <span className="text-red-600 font-bold">1.{item * 200}.000 ₫</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* QR Verification Modal */}
      {showQRModal && (
        <QRVerification 
          productId={product.id} 
          onClose={() => setShowQRModal(false)} 
        />
      )}

      {/* Report Counterfeit Modal */}
      {showReportModal && (
        <ReportCounterfeit 
          product={product} 
          onClose={() => setShowReportModal(false)} 
        />
      )}
    </div>
  );
}