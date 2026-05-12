import React, { useState } from 'react';
import { ShoppingCart, Heart, Star, ShieldCheck, QrCode, AlertTriangle, Package, TrendingUp } from 'lucide-react';
import { useStore, Product } from '../store';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onQuickView: (product: Product) => void;
  onReportCounterfeit: (product: Product) => void;
  onVerifyQR: (product: Product) => void;
  showActions?: boolean;
  variant?: 'grid' | 'list';
}

export function ProductCard({ 
  product, 
  onAddToCart, 
  onQuickView, 
  onReportCounterfeit, 
  onVerifyQR,
  showActions = true,
  variant = 'grid'
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);

  const handleImageLoad = () => {
    setIsImageLoaded(true);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    onQuickView(product);
  };

  const handleReport = (e: React.MouseEvent) => {
    e.stopPropagation();
    onReportCounterfeit(product);
  };

  const handleVerifyQR = (e: React.MouseEvent) => {
    e.stopPropagation();
    onVerifyQR(product);
  };

  const getRatingStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => {
      if (i < Math.floor(rating)) {
        return 'fill-yellow-400';
      }
      return 'text-gray-300';
    });
  };

  const getDiscountPercentage = () => {
    if (product.commercialInfo?.promotionalPrice && product.commercialInfo?.basePrice) {
      const discount = ((product.commercialInfo.basePrice - product.commercialInfo.promotionalPrice) / product.commercialInfo.basePrice) * 100;
      return Math.round(discount);
    }
    return 0;
  };

  const isOnSale = () => {
    return product.commercialInfo?.promotionalPrice && 
           product.commercialInfo.promotionalPrice < product.commercialInfo.basePrice;
  };

  const getStockStatus = () => {
    // Simulate stock status based on product status
    if (product.status === 'approved') {
      return Math.random() > 0.3 ? 'Còn hàng' : 'Sắp hết hàng';
    }
    return 'Hết hàng';
  };

  const cardClasses = variant === 'list' 
    ? 'flex bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all duration-200'
    : 'bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 group cursor-pointer';

  const imageContainerClasses = variant === 'list'
    ? 'w-24 h-24 flex-shrink-0'
    : 'h-48 overflow-hidden bg-gray-100 relative';

  return (
    <div 
      className={cardClasses}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Badge */}
      <div className="relative">
        {/* ACF Verified Badge */}
        {product.verificationInfo?.verifiedByAcf && (
          <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded shadow z-10 flex items-center">
            <ShieldCheck className="w-3 h-3 mr-1" />
            ACF Đã duyệt
          </div>
        )}
        
        {/* Sale Badge */}
        {isOnSale() && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded shadow z-10">
            🔥 Giảm {getDiscountPercentage()}%
          </div>
        )}
        
        {/* Best Seller Badge */}
        {(product.commercialInfo?.soldCount || 0) > 100 && (
          <div className="absolute top-10 right-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded shadow z-10 flex items-center">
            <TrendingUp className="w-3 h-3 mr-1" />
            Best Seller
          </div>
        )}
        
        {/* Stock Status Badge */}
        <div className="absolute bottom-2 left-2 bg-gray-800 text-white text-xs font-bold px-2 py-1 rounded">
          {getStockStatus()}
        </div>
      </div>

      <div className={variant === 'list' ? 'flex-1 ml-4' : ''}>
        {/* Product Image */}
        <div className={imageContainerClasses}>
          {!isImageLoaded && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse">
              <div className="w-full h-full bg-gray-300"></div>
            </div>
          )}
          <img
            src={product.image}
            alt={product.name}
            className={`w-full h-full object-cover transition-transform duration-300 ${isImageLoaded ? 'group-hover:scale-105' : ''}`}
            onLoad={handleImageLoad}
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1523275335684-bfa01b55200?w=500&auto=format&fit=crop&q=60';
            }}
          />
        </div>

        {/* Product Info */}
        <div className={`p-4 flex-1 flex flex-col ${variant === 'list' ? 'justify-between' : 'justify-between'}`}>
          <div>
            {/* Product Name */}
            <h3 className={`font-bold text-gray-800 mb-2 ${variant === 'grid' ? 'line-clamp-2' : 'line-clamp-1'}`}>
              {product.name}
            </h3>

            {/* Rating and Reviews */}
            <div className="flex items-center mb-1">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${getRatingStars(product.commercialInfo?.averageRating || 0)[i]}`}
                    fill={i < (product.commercialInfo?.averageRating || 0) ? 'currentColor' : 'none'}
                  />
                ))}
              </div>
              <span className="ml-2 text-sm text-gray-600">
                {product.commercialInfo?.averageRating?.toFixed(1) || '0.0'} 
                <span className="text-gray-400"> ({product.commercialInfo?.reviewCount || 0} đánh giá)</span>
              </span>
            </div>

            {/* Sales Count */}
            <div className="flex items-center text-sm text-gray-500 mb-1">
              <Package className="w-4 h-4 mr-1 text-gray-400" />
              <span>Đã bán {product.commercialInfo?.soldCount || 0}</span>
            </div>

            {/* Origin Badge */}
            <div className="flex items-center mb-2">
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                product.origin === 'domestic' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-purple-100 text-purple-800'
              }`}>
                {product.origin === 'domestic' ? '🇻🇳 Trong nước' : '🌍 Nhập khẩu'}
              </span>
            </div>

            {/* Category */}
            <div className="text-sm text-gray-500 mb-3">
              Danh mục: <span className="font-medium">{product.category}</span>
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                {product.description}
              </p>
            )}
          </div>

          {/* Price Section */}
          <div className="flex items-end justify-between">
            <div>
              {isOnSale() ? (
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400 line-through text-sm">
                    {product.commercialInfo?.basePrice?.toLocaleString('vi-VN')} ₫
                  </span>
                  <span className="text-red-600 font-bold text-lg">
                    {product.commercialInfo?.promotionalPrice?.toLocaleString('vi-VN')} ₫
                  </span>
                </div>
              ) : (
                <span className="text-red-600 font-bold text-lg">
                  {product.price.toLocaleString('vi-VN')} ₫
                </span>
              )}
              
              {/* Installments */}
              <div className="text-xs text-green-600 mt-1">
                Trả góp 0% lãi suất
              </div>
            </div>

            {/* Quick Actions */}
            {showActions && (
              <div className="flex space-x-2">
                <button
                  onClick={handleVerifyQR}
                  className="p-2 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white rounded-lg transition-colors"
                  title="Xác minh QR Code"
                >
                  <QrCode className="w-4 h-4" />
                </button>
                <button
                  onClick={handleQuickView}
                  className="p-2 bg-gray-50 hover:bg-gray-600 text-gray-600 hover:text-white rounded-lg transition-colors"
                  title="Xem nhanh"
                >
                  <Heart className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Hover Actions */}
        {isHovered && showActions && (
          <div className="absolute bottom-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-xl p-2 z-20 w-64">
            <div className="space-y-2">
              <button
                onClick={handleAddToCart}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Thêm vào giỏ hàng
              </button>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleQuickView}
                  className="bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white py-2 px-3 rounded-lg transition-colors text-sm"
                >
                  Xem nhanh
                </button>
                <button
                  onClick={handleReport}
                  className="bg-yellow-50 hover:bg-yellow-600 text-yellow-600 hover:text-white py-2 px-3 rounded-lg transition-colors text-sm"
                >
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  Báo cáo giả
                </button>
              </div>
              
              {/* Product Details */}
              <div className="pt-2 border-t border-gray-100">
                <h4 className="font-bold text-gray-800 mb-2">Chi tiết sản phẩm:</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <div>Mã sản phẩm: <span className="font-mono">{product.id}</span></div>
                  <div>Người bán: <span className="font-medium">{product.labelInfo.manufacturerName.substring(0, 8)}...</span></div>
                  <div>Thương hiệu: <span className="font-medium">{product.labelInfo.brandName}</span></div>
                  <div>Trạng thái: <span className={`font-medium ${
                    product.status === 'approved' ? 'text-green-600' : 
                    product.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {product.status === 'approved' ? '✅ Đã duyệt' : 
                     product.status === 'pending' ? '⏳ Chờ duyệt' : '❌ Từ chối'}
                  </span></div>
                  <div>Đánh giá: <span className="font-medium">{product.commercialInfo?.averageRating?.toFixed(1) || '0.0'}/5.0</span></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
