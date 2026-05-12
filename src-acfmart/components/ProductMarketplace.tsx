import React, { useState } from 'react';
import { useStore, Product } from '../store';
import { useLanguage } from '../contexts/LanguageContext';
import { Search, Filter, ShoppingCart, Star, ShieldCheck, Truck, Store, Package, TrendingUp, Clock, Eye } from 'lucide-react';
import { Cart } from './Cart';

interface MarketplaceProduct extends Product {
  shopName: string;
  carrierName: string;
  supplierName: string;
  viewCount: number;
  salesCount: number;
  rating: number;
  reviews: number;
  originalPrice: number;
  badge?: string;
  discount?: number;
}

export function ProductMarketplace() {
  const { products } = useStore();
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showCart, setShowCart] = useState(false);
  const [cartItems, setCartItems] = useState<{product: Product, quantity: number}[]>([]);

  // No mock products - will be loaded from real data source
  const mockSellerProducts: MarketplaceProduct[] = [];

  const filteredProducts = mockSellerProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesFilter = selectedFilter === 'all' || 
      (selectedFilter === 'approved' && product.status === 'approved') ||
      (selectedFilter === 'pending' && product.status === 'pending');
    
    return matchesSearch && matchesCategory && matchesFilter;
  });

  const handleAddToCart = (product: Product) => {
    const existingItem = cartItems.find(item => item.product.id === product.id);
    if (existingItem) {
      setCartItems(cartItems.map(item => 
        item.product.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCartItems([...cartItems, { product, quantity: 1 }]);
    }
  };

  const handleQuickView = (product: Product) => {
    // Quick view functionality
    console.log('Quick view:', product);
  };

  const handleReportCounterfeit = (product: Product) => {
    // Report counterfeit functionality
    console.log('Report counterfeit:', product);
  };

  const handleVerifyQR = (product: Product) => {
    // QR verification functionality
    console.log('Verify QR:', product);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Sản phẩm Marketplace</h1>
          </div>

          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">Tất cả danh mục</option>
              <option value="Điện thoại">Điện thoại</option>
              <option value="Laptop">Laptop</option>
              <option value="Tai nghe">Tai nghe</option>
            </select>

            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="approved">Đã duyệt</option>
              <option value="pending">Chờ duyệt</option>
            </select>

            <button className="w-full flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Filter className="w-4 h-4" />
              Bộ lọc nâng cao
            </button>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200">
              {/* Product Image */}
              <div className="h-48 overflow-hidden bg-gray-100 relative">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1523275335684-bfa01ac8b8?w=500&auto=format&fit=crop&q=60';
                  }}
                />
                
                {/* Badges */}
                <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded shadow z-10 flex items-center">
                  <ShieldCheck className="w-3 h-3 mr-1" />
                  ACF Đã duyệt
                </div>
                
                {product.commercialInfo?.promotionalPrice && product.commercialInfo?.basePrice && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded shadow z-10">
                    🔥 Giảm {Math.round(((product.commercialInfo.basePrice - product.commercialInfo.promotionalPrice) / product.commercialInfo.basePrice) * 100)}%
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h3 className="font-bold text-gray-800 mb-2 line-clamp-2">
                  {product.name}
                </h3>

                {/* Rating and Reviews */}
                <div className="flex items-center mb-1">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < (product.commercialInfo?.averageRating || 0) ? 'fill-yellow-400' : 'text-gray-300'}`}
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
                  <span className="text-xs px-2 py-1 rounded-full font-medium bg-blue-100 text-blue-800">
                    🇻🇳 Trong nước
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

                {/* Price Section */}
                <div className="flex items-end justify-between">
                  <div>
                    {product.commercialInfo?.promotionalPrice && product.commercialInfo?.basePrice ? (
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
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleVerifyQR(product)}
                      className="p-2 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white rounded-lg transition-colors"
                      title="Xác minh QR Code"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleQuickView(product)}
                      className="p-2 bg-gray-50 hover:bg-gray-600 text-gray-600 hover:text-white rounded-lg transition-colors"
                      title="Xem nhanh"
                    >
                      <Star className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy sản phẩm</h3>
            <p className="text-gray-600">Không có sản phẩm nào khớp với bộ lọc của bạn.</p>
          </div>
        )}

        {/* Cart Sidebar */}
        {showCart && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full m-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Giỏ hàng</h2>
                <button
                  onClick={() => setShowCart(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ✕
                </button>
              </div>
              
              {/* Cart Items */}
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {cartItems.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4 pb-4 border-b border-gray-200">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                      <p className="text-sm text-gray-600">{item.product.price.toLocaleString('vi-VN')} ₫</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setCartItems(cartItems.filter((_, i) => i !== index))}
                        className="text-red-600 hover:text-red-800"
                      >
                        🗑️
                      </button>
                      <span className="font-medium">x{item.quantity}</span>
                      <button
                        onClick={() => setCartItems(cartItems.map((cartItem, i) => 
                          i === index 
                            ? { ...cartItem, quantity: Math.max(1, cartItem.quantity + 1) }
                            : cartItem
                        ))}
                        className="text-green-600 hover:text-green-800"
                      >
                        ➕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Cart Summary */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-medium">Tổng cộng:</span>
                  <span className="text-lg font-bold">
                    {cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0).toLocaleString('vi-VN')} ₫
                  </span>
                </div>
                <button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-colors">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Thanh toán
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
