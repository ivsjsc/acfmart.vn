import React, { useState } from 'react';
import { useStore, Product } from '../store';
import { useLanguage } from '../contexts/LanguageContext';
import { ShoppingCart, Package, Star, LogOut, ShieldCheck, CheckCircle2, QrCode, AlertTriangle, TrendingUp, Heart, Filter } from 'lucide-react';
import { QRVerification } from '../components/QRVerification';
import { ReportCounterfeit } from '../components/ReportCounterfeit';
import { CategoryNav } from '../components/CategoryNav';
import { ProductMarketplace } from '../components/ProductMarketplace';
import { WalletSystem } from '../components/WalletSystem';
import { QrScanner } from '../components/QrScanner';
import { VerificationManagement } from '../pages/VerificationManagement';
import { ViolationManagement } from '../pages/ViolationManagement';
import { escrowService, createEscrowPayment } from '../services/EscrowService';
import { showSuccess, showError } from '../lib/notifications';

export function CustomerView() {
  const { products, orders, addOrder, updateOrderStatus, user, logout, role } = useStore();
  const { t } = useLanguage();
  const approvedProducts = products.filter(p => p.status === 'approved');
  const myOrders = role === 'admin' ? orders : orders.filter(o => o.customerId === user?.uid); // Store orders filtered by query unless admin, but client side check safety
  
  const [cart, setCart] = useState<{product: Product, quantity: number}[]>([]);
  const [selectedProductForQR, setSelectedProductForQR] = useState<Product | null>(null);
  const [selectedProductForReport, setSelectedProductForReport] = useState<Product | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [showWallet, setShowWallet] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [activeExperienceTab, setActiveExperienceTab] = useState<'shopping' | 'verification' | 'wallet' | 'scanner' | 'verification-management' | 'violation-management'>('shopping');

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleCheckout = async () => {
    if (cart.length === 0 || !user) return;
    
    // We will place an order for each distinct item as this is a simple prototype
    for (const item of cart) {
      const orderId = await addOrder({
        productId: item.product.id,
        shopId: item.product.shopId,
        customerId: user.uid,
        status: 'pending',
        total: item.product.price * item.quantity,
      });

      if (orderId) {
        createEscrowPayment(
          orderId,
          user.uid,
          item.product.shopId,
          item.product.price * item.quantity
        );
      }
    }
    
    setCart([]);
    showSuccess('Đặt hàng thành công!', 'Tiền của bạn đang được Sàn TMĐT ACF giữ an toàn cho đến khi bạn xác nhận nhận hàng.');
  };

  const handleCategorySelect = (category: string) => {
    setActiveCategory(category);
  };

  const filteredProducts = activeCategory
    ? approvedProducts.filter(p => p.category === activeCategory)
    : approvedProducts;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-bold uppercase tracking-wider">Chờ xác nhận</span>;
      case 'processing': return <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-bold uppercase tracking-wider">Đang xử lý</span>;
      case 'shipping': return <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full font-bold uppercase tracking-wider">Đang giao</span>;
      case 'delivered': return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-bold uppercase tracking-wider">Đã giao</span>;
      case 'completed': return <span className="px-2 py-1 bg-emerald-100 text-emerald-800 text-xs rounded-full font-bold uppercase tracking-wider">Hoàn tất</span>;
      default: return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full font-bold uppercase tracking-wider">{status}</span>;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto w-full px-4 md:px-8 flex-1 space-y-8 py-8">

        {/* Experience Mode Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-8 rounded-xl shadow-lg">
          <h1 className="text-3xl font-bold mb-3 flex items-center">
            <ShieldCheck className="w-10 h-10 mr-3" />
            Chế độ trải nghiệm ACF
          </h1>
          <p className="text-red-100 text-lg">Trải nghiệm đầy đủ tính năng chống hàng giả và mua sắm an toàn</p>
        </div>

        {/* Experience Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveExperienceTab('shopping')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeExperienceTab === 'shopping' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <ShoppingCart className="w-4 h-4 mr-2 inline" />
              Mua sắm
            </button>
            <button
              onClick={() => setActiveExperienceTab('verification')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeExperienceTab === 'verification' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <QrCode className="w-4 h-4 mr-2 inline" />
              Xác thực QR
            </button>
            <button
              onClick={() => setActiveExperienceTab('wallet')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeExperienceTab === 'wallet' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <TrendingUp className="w-4 h-4 mr-2 inline" />
              Ví ACF
            </button>
            <button
              onClick={() => setActiveExperienceTab('scanner')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeExperienceTab === 'scanner' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <QrCode className="w-4 h-4 mr-2 inline" />
              QR Scanner
            </button>
            <button
              onClick={() => setActiveExperienceTab('verification-management')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeExperienceTab === 'verification-management' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <ShieldCheck className="w-4 h-4 mr-2 inline" />
              Xác minh
            </button>
            <button
              onClick={() => setActiveExperienceTab('violation-management')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeExperienceTab === 'violation-management' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <AlertTriangle className="w-4 h-4 mr-2 inline" />
              Vi phạm
            </button>
          </div>
        </div>

        {/* Experience Content */}
        {activeExperienceTab === 'shopping' && (
          <>
            {/* Category Navigation */}
            <CategoryNav
              activeCategory={activeCategory}
              onSelectCategory={handleCategorySelect}
            />

            {/* Header Cart */}
            <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-red-100 gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-800 uppercase tracking-tight">Sản phẩm chính hãng</h2>
                <p className="text-sm text-gray-500">Mua sắm an toàn, được kiểm duyệt bởi ACF</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="relative p-2 bg-red-50 rounded-full text-red-600">
                  <ShoppingCart className="w-6 h-6" />
                  {cart.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-yellow-400 text-red-900 text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full shadow-sm">
                      {cart.reduce((sum, item) => sum + item.quantity, 0)}
                    </span>
                  )}
                </div>
                {cart.length > 0 && (
                  <button 
                    onClick={handleCheckout}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold uppercase text-sm tracking-wider shadow-md transition-colors"
                  >
                    Thanh toán ({cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0).toLocaleString('vi-VN')} ₫)
                  </button>
                )}
              </div>
            </div>

            {/* Product Marketplace */}
            <ProductMarketplace />

            {/* My Orders */}
            <div className="pb-8">
              <h3 className="text-lg font-bold mb-4 text-gray-800 flex items-center uppercase">
                <Package className="w-5 h-5 mr-2 text-red-600" /> Đơn hàng của tôi
              </h3>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {myOrders.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">Bạn chưa có đơn hàng nào.</div>
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {myOrders.map(order => {
                      const product = products.find(p => p.id === order.productId);
                      return (
                        <li key={order.id} className="p-4 hover:bg-gray-50 flex flex-col gap-4">
                          <div className="flex flex-col md:flex-row justify-between w-full gap-4">
                            <div className="flex items-center gap-4 flex-1">
                              <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                                 {product && <img src={product.image} alt={product.name} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60'; }} />}
                              </div>
                              <div>
                                <p className="font-bold text-gray-800">{product?.name || 'Sản phẩm không rõ'}</p>
                                <p className="text-sm text-gray-500 mt-1">Mã đơn: <span className="text-gray-700 font-mono">{order.id}</span> • {new Date(order.date).toLocaleDateString('vi-VN')}</p>
                              </div>
                            </div>
                            <div className="text-left md:text-right flex flex-row md:flex-col justify-between items-center md:items-end gap-2 md:pl-8 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0">
                              <div className="flex flex-col items-center md:items-end gap-2">
                                <p className="font-black text-red-600 mb-0">{order.total.toLocaleString('vi-VN')} ₫</p>
                                {getStatusBadge(order.status)}
                              </div>
                              {order.status === 'delivered' && (
                                <button
                                  onClick={() => updateOrderStatus(order.id, 'completed')}
                                  className="bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded flex items-center shadow-sm transition-colors mt-2 whitespace-nowrap"
                                >
                                  <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-1.5" /> Đã nhận được hàng
                                </button>
                              )}
                            </div>
                          </div>
                          {['pending', 'processing', 'shipping', 'delivered'].includes(order.status) && (
                            <div className="w-full bg-blue-50 text-blue-800 text-xs px-3 py-2 rounded flex flex-col md:flex-row items-start md:items-center mt-3 gap-2 border border-blue-100">
                              <div className="flex items-center">
                                <ShieldCheck className="w-4 h-4 mr-1.5 text-blue-600 shrink-0" />
                                <strong>BẢO VỆ CHỐNG GIẢ:</strong>
                              </div>
                              <span className="flex-1">Tiền được ACF giữ an toàn cho đến khi bạn xác nhận "Đã nhận được hàng" và không có khiếu nại.</span>
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          </>
        )}

        {activeExperienceTab === 'verification' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <QrCode className="w-6 h-6 mr-2 text-red-600" />
              Xác thực sản phẩm QR
            </h2>
            <p className="text-gray-600 mb-6">Quét mã QR để xác thực sản phẩm chính hãng ACF</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {approvedProducts.slice(0, 4).map(product => (
                <div key={product.id} className="border border-gray-200 rounded-lg p-4 hover:border-red-300 transition-colors">
                  <div className="flex items-center gap-4 mb-3">
                    <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded" />
                    <div>
                      <h3 className="font-semibold text-gray-800">{product.name}</h3>
                      <p className="text-sm text-gray-500">{product.price.toLocaleString('vi-VN')} ₫</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedProductForQR(product)}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-medium transition-colors"
                  >
                    Xác thực QR
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeExperienceTab === 'wallet' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <TrendingUp className="w-6 h-6 mr-2 text-red-600" />
              Ví ACF
            </h2>
            <p className="text-gray-600 mb-6">Quản lý tài chính và thanh toán an toàn</p>
            
            <button
              onClick={() => setShowWallet(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Mở Ví ACF
            </button>
          </div>
        )}

        {activeExperienceTab === 'scanner' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <QrCode className="w-6 h-6 mr-2 text-red-600" />
              QR Scanner
            </h2>
            <p className="text-gray-600 mb-6">Quét mã QR sản phẩm trực tiếp</p>
            
            <button
              onClick={() => setShowScanner(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Bật Scanner
            </button>
          </div>
        )}

        {activeExperienceTab === 'verification-management' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <ShieldCheck className="w-6 h-6 mr-2 text-red-600" />
              Quản lý Xác minh
            </h2>
            <p className="text-gray-600 mb-6">Hệ thống xác minh sản phẩm và người bán theo Nghị định 43/2017/NĐ-CP</p>
            
            <VerificationManagement />
          </div>
        )}

        {activeExperienceTab === 'violation-management' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <AlertTriangle className="w-6 h-6 mr-2 text-red-600" />
              Quản lý Vi phạm
            </h2>
            <p className="text-gray-600 mb-6">Hệ thống xử lý vi phạm và báo cáo hàng giả theo Nghị định 98/2020/NĐ-CP</p>
            
            <ViolationManagement />
          </div>
        )}
      </div>

      {/* QR Verification Modal */}
      {selectedProductForQR && (
        <QRVerification 
          product={selectedProductForQR}
          onClose={() => setSelectedProductForQR(null)}
        />
      )}

      {/* Report Counterfeit Modal */}
      {selectedProductForReport && (
        <ReportCounterfeit 
          product={selectedProductForReport}
          onClose={() => setSelectedProductForReport(null)}
        />
      )}

      {/* Wallet Modal */}
      {showWallet && user && (
        <WalletSystem
          userId={user.uid}
          onClose={() => setShowWallet(false)}
        />
      )}

      {/* QR Scanner Modal */}
      {showScanner && (
        <QrScanner
          onScanSuccess={(result) => {
            console.log('QR scanned:', result);
            setShowScanner(false);
          }}
          onError={(error) => {
            console.error('QR scan error:', error);
            showError('Lỗi quét QR', String(error));
          }}
          onCancel={() => setShowScanner(false)}
        />
      )}
    </div>
  );
}