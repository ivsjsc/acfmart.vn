import React, { useState } from 'react';
import { useStore, Product } from '../store';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  X, 
  CreditCard, 
  Truck, 
  ShieldCheck,
  Calculator,
  Percent,
  Package,
  Clock,
  CheckCircle
} from 'lucide-react';
import { createEscrowPayment } from '../services/EscrowService';
import { showSuccess, showError, showWarning } from '../lib/notifications';

interface CartItem {
  product: Product;
  quantity: number;
  selected: boolean;
}

interface ShippingOption {
  id: string;
  name: string;
  carrier: string;
  price: number;
  estimatedDays: string;
  description: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  type: 'card' | 'bank' | 'ewallet';
  icon: string;
  fee: number;
}

export function Cart({ onClose }: { onClose: () => void }) {
  const { user, addOrder } = useStore();
  const { t } = useLanguage();
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      product: {
        id: '1',
        name: 'iPhone 15 Pro Max 256GB',
        price: 28990000,
        image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500&auto=format&fit=crop&q=60',
        category: 'electronics',
        status: 'approved',
        shopId: 'shop1',
        labelInfo: { brandName: 'Apple', manufacturerName: 'Apple Inc' },
        commercialInfo: { averageRating: 4.8, reviewCount: 1250, soldCount: 3420 }
      } as Product,
      quantity: 1,
      selected: true
    },
    {
      product: {
        id: '2',
        name: 'Samsung Galaxy Watch 6',
        price: 8990000,
        image: 'https://images.unsplash.com/photo-1523275335684-bfa01b55200?w=500&auto=format&fit=crop&q=60',
        category: 'electronics',
        status: 'approved',
        shopId: 'shop2',
        labelInfo: { brandName: 'Samsung', manufacturerName: 'Samsung Electronics' },
        commercialInfo: { averageRating: 4.6, reviewCount: 890, soldCount: 2150 }
      } as Product,
      quantity: 2,
      selected: true
    }
  ]);

  const [shippingOptions] = useState<ShippingOption[]>([
    {
      id: 'standard',
      name: 'Giao hàng tiêu chuẩn',
      carrier: 'Giao Hàng Nhanh',
      price: 30000,
      estimatedDays: '3-5 ngày',
      description: 'Giao hàng trong 3-5 ngày làm việc'
    },
    {
      id: 'express',
      name: 'Giao hàng hỏa tốc',
      carrier: 'Viettel Post',
      price: 50000,
      estimatedDays: '1-2 ngày',
      description: 'Giao hàng trong 1-2 ngày làm việc'
    },
    {
      id: 'economy',
      name: 'Giao hàng tiết kiệm',
      carrier: 'Giao Hàng Tiết Kiệm',
      price: 20000,
      estimatedDays: '5-7 ngày',
      description: 'Giao hàng trong 5-7 ngày làm việc'
    }
  ]);

  const [paymentMethods] = useState<PaymentMethod[]>([
    {
      id: 'card1',
      name: 'Visa ****1234',
      type: 'card',
      icon: '💳',
      fee: 0.03
    },
    {
      id: 'bank1',
      name: 'Vietcombank ****5678',
      type: 'bank',
      icon: '🏦',
      fee: 0
    },
    {
      id: 'ewallet1',
      name: 'MoMo ****9012',
      type: 'ewallet',
      icon: '📱',
      fee: 0.01
    }
  ]);

  const [selectedShipping, setSelectedShipping] = useState<string>('standard');
  const [selectedPayment, setSelectedPayment] = useState<string>('bank1');
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const selectedItems = cartItems.filter(item => item.selected);
  const subtotal = selectedItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const shippingCost = shippingOptions.find(opt => opt.id === selectedShipping)?.price || 0;
  const paymentFee = subtotal * (paymentMethods.find(method => method.id === selectedPayment)?.fee || 0);
  const total = Math.max(0, subtotal + shippingCost + paymentFee - discount);

  const updateQuantity = (index: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    const newCartItems = [...cartItems];
    newCartItems[index].quantity = newQuantity;
    setCartItems(newCartItems);
  };

  const removeItem = (index: number) => {
    const newCartItems = cartItems.filter((_, i) => i !== index);
    setCartItems(newCartItems);
  };

  const toggleSelect = (index: number) => {
    const newCartItems = [...cartItems];
    newCartItems[index].selected = !newCartItems[index].selected;
    setCartItems(newCartItems);
  };

  const toggleSelectAll = () => {
    const allSelected = cartItems.every(item => item.selected);
    const newCartItems = cartItems.map(item => ({ ...item, selected: !allSelected }));
    setCartItems(newCartItems);
  };

  const applyPromoCode = () => {
    if (promoCode.toUpperCase() === 'SAVE10') {
      setDiscount(subtotal * 0.1);
    } else if (promoCode.toUpperCase() === 'SAVE20') {
      setDiscount(subtotal * 0.2);
    } else {
      showWarning('Mã giảm giá không hợp lệ', 'Vui lòng kiểm tra lại mã giảm giá.');
    }
  };

  const handleCheckout = async () => {
    if (selectedItems.length === 0) {
      showWarning('Vui lòng chọn sản phẩm để thanh toán');
      return;
    }

    if (!user) {
      showWarning('Vui lòng đăng nhập để thanh toán');
      return;
    }

    setIsProcessing(true);

    try {
      for (const item of selectedItems) {
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

      showSuccess('Đặt hàng thành công!', 'Tiền của bạn đang được Sàn TMĐT ACF giữ an toàn.');
      onClose();
    } catch (error) {
      showError('Có lỗi xảy ra', 'Vui lòng thử lại sau.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <ShoppingCart className="w-6 h-6" />
              <div>
                <h2 className="text-2xl font-bold">Giỏ hàng của bạn</h2>
                <p className="text-red-100">
                  {selectedItems.length}/{cartItems.length} sản phẩm được chọn
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row h-[calc(90vh-120px)]">
          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6 border-b lg:border-b-0 lg:border-r">
            {/* Select All */}
            <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={cartItems.every(item => item.selected)}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                />
                <span className="font-medium">Chọn tất cả ({cartItems.length} sản phẩm)</span>
              </label>
              <button
                onClick={() => setCartItems([])}
                className="text-red-600 hover:text-red-700 font-medium text-sm"
              >
                Xóa tất cả
              </button>
            </div>

            {/* Cart Items List */}
            <div className="space-y-4">
              {cartItems.map((item, index) => (
                <div key={index} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex gap-4">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={item.selected}
                      onChange={() => toggleSelect(index)}
                      className="w-4 h-4 text-red-600 rounded focus:ring-red-500 mt-8"
                    />

                    {/* Product Image */}
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-20 h-20 object-cover rounded-lg"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1523275335684-bfa01b55200?w=500&auto=format&fit=crop&q=60';
                      }}
                    />

                    {/* Product Info */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 mb-1">{item.product.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">
                        Thương hiệu: {item.product.labelInfo?.brandName}
                      </p>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                          Còn hàng
                        </span>
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                          ACF Đã duyệt
                        </span>
                      </div>
                      <p className="text-red-600 font-bold text-lg">
                        {item.product.price.toLocaleString('vi-VN')} ₫
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(index, item.quantity - 1)}
                          className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-12 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(index, item.quantity + 1)}
                          className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(index)}
                        className="text-red-600 hover:text-red-700 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-96 p-6 bg-gray-50">
            <h3 className="text-lg font-bold mb-4">Tóm tắt đơn hàng</h3>

            {/* Promo Code */}
            <div className="mb-6">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nhập mã giảm giá"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <button
                  onClick={applyPromoCode}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Áp dụng
                </button>
              </div>
              {discount > 0 && (
                <p className="text-green-600 text-sm mt-1">Đã giảm: {discount.toLocaleString('vi-VN')} ₫</p>
              )}
            </div>

            {/* Shipping Options */}
            <div className="mb-6">
              <h4 className="font-medium mb-3">Phương thức vận chuyển</h4>
              <div className="space-y-2">
                {shippingOptions.map(option => (
                  <label key={option.id} className="flex items-center justify-between p-3 bg-white rounded-lg cursor-pointer hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="shipping"
                        value={option.id}
                        checked={selectedShipping === option.id}
                        onChange={(e) => setSelectedShipping(e.target.value)}
                        className="w-4 h-4 text-red-600"
                      />
                      <div>
                        <p className="font-medium">{option.name}</p>
                        <p className="text-sm text-gray-600">{option.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{option.price.toLocaleString('vi-VN')} ₫</p>
                      <p className="text-xs text-gray-500">{option.estimatedDays}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Payment Methods */}
            <div className="mb-6">
              <h4 className="font-medium mb-3">Phương thức thanh toán</h4>
              <div className="space-y-2">
                {paymentMethods.map(method => (
                  <label key={method.id} className="flex items-center justify-between p-3 bg-white rounded-lg cursor-pointer hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment"
                        value={method.id}
                        checked={selectedPayment === method.id}
                        onChange={(e) => setSelectedPayment(e.target.value)}
                        className="w-4 h-4 text-red-600"
                      />
                      <span className="text-2xl">{method.icon}</span>
                      <div>
                        <p className="font-medium">{method.name}</p>
                        {method.fee > 0 && (
                          <p className="text-sm text-gray-600">Phí: {(method.fee * 100).toFixed(0)}%</p>
                        )}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="bg-white rounded-lg p-4 mb-6">
              <h4 className="font-medium mb-3">Chi tiết thanh toán</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Tạm tính:</span>
                  <span>{subtotal.toLocaleString('vi-VN')} ₫</span>
                </div>
                <div className="flex justify-between">
                  <span>Phí vận chuyển:</span>
                  <span>{shippingCost.toLocaleString('vi-VN')} ₫</span>
                </div>
                {paymentFee > 0 && (
                  <div className="flex justify-between">
                    <span>Phí thanh toán:</span>
                    <span>{paymentFee.toLocaleString('vi-VN')} ₫</span>
                  </div>
                )}
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Giảm giá:</span>
                    <span>-{discount.toLocaleString('vi-VN')} ₫</span>
                  </div>
                )}
                <div className="border-t pt-2 flex justify-between font-bold text-lg">
                  <span>Tổng cộng:</span>
                  <span className="text-red-600">{total.toLocaleString('vi-VN')} ₫</span>
                </div>
              </div>
            </div>

            {/* Escrow Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900">Bảo vệ thanh toán ACF</h4>
                  <p className="text-blue-800 text-sm mt-1">
                    Tiền của bạn được Sàn TMĐT ACF giữ an toàn. Tiền chỉ được chuyển cho Shop sau khi bạn xác nhận nhận hàng và không có khiếu nại trong vòng 7 ngày.
                  </p>
                </div>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              disabled={selectedItems.length === 0 || isProcessing}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Đang xử lý...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  Thanh toán ({total.toLocaleString('vi-VN')} ₫)
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
