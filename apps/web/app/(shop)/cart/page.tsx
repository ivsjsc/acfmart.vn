'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Trash2, ShoppingBag, Lock, Tag, ChevronRight } from 'lucide-react';

interface CartItem {
  id: string;
  productName: string;
  variant: string;
  price: number;
  originalPrice: number;
  qty: number;
  checked: boolean;
}

interface Shop {
  id: string;
  name: string;
  items: CartItem[];
  checked: boolean;
}

const initialShops: Shop[] = [
  {
    id: 'shop1',
    name: 'CenterCare by IVS',
    checked: true,
    items: [
      { id: 'i1', productName: 'Tai nghe Bluetooth Sony WH-1000XM5', variant: 'Màu: Đen', price: 7990000, originalPrice: 9490000, qty: 1, checked: true },
      { id: 'i2', productName: 'Áo thun Uniqlo Dry-EX Pro', variant: 'Size: M / Màu: Xanh', price: 299000, originalPrice: 349000, qty: 2, checked: true },
    ],
  },
  {
    id: 'shop2',
    name: 'BeautyPlus Store',
    checked: true,
    items: [
      { id: 'i3', productName: 'Kem dưỡng da Innisfree Super Volcanic', variant: 'Loại: 50ml', price: 450000, originalPrice: 550000, qty: 1, checked: true },
    ],
  },
];

export default function CartPage() {
  const [shops, setShops] = useState<Shop[]>(initialShops);
  const [voucher, setVoucher] = useState('');
  const [voucherApplied, setVoucherApplied] = useState(false);

  const allChecked = shops.every(s => s.checked && s.items.every(i => i.checked));

  const toggleAll = () => {
    const newVal = !allChecked;
    setShops(prev => prev.map(s => ({
      ...s, checked: newVal,
      items: s.items.map(i => ({ ...i, checked: newVal })),
    })));
  };

  const toggleShop = (shopId: string) => {
    setShops(prev => prev.map(s => {
      if (s.id !== shopId) return s;
      const newChecked = !s.checked;
      return { ...s, checked: newChecked, items: s.items.map(i => ({ ...i, checked: newChecked })) };
    }));
  };

  const toggleItem = (shopId: string, itemId: string) => {
    setShops(prev => prev.map(s => {
      if (s.id !== shopId) return s;
      const items = s.items.map(i => i.id === itemId ? { ...i, checked: !i.checked } : i);
      return { ...s, checked: items.every(i => i.checked), items };
    }));
  };

  const changeQty = (shopId: string, itemId: string, delta: number) => {
    setShops(prev => prev.map(s => {
      if (s.id !== shopId) return s;
      return { ...s, items: s.items.map(i => i.id === itemId ? { ...i, qty: Math.max(1, i.qty + delta) } : i) };
    }));
  };

  const removeItem = (shopId: string, itemId: string) => {
    setShops(prev => prev.map(s => {
      if (s.id !== shopId) return s;
      return { ...s, items: s.items.filter(i => i.id !== itemId) };
    }).filter(s => s.items.length > 0));
  };

  const checkedItems = shops.flatMap(s => s.items.filter(i => i.checked));
  const subtotal = checkedItems.reduce((sum, i) => sum + i.price * i.qty, 0);
  const discount = voucherApplied ? Math.floor(subtotal * 0.05) : 0;
  const total = subtotal - discount;
  const totalItems = checkedItems.length;

  const isEmpty = shops.every(s => s.items.length === 0);

  if (isEmpty) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <ShoppingBag className="w-20 h-20 text-gray-200 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-gray-700 mb-2">Giỏ hàng trống</h2>
        <p className="text-gray-400 mb-8">Hãy khám phá và thêm sản phẩm vào giỏ hàng nhé!</p>
        <Link href="/products"
          className="inline-flex items-center gap-2 bg-[#E31937] hover:bg-red-700 text-white px-8 py-3 rounded-xl font-medium transition-colors">
          <ShoppingBag className="w-5 h-5" />
          Mua sắm ngay
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6 flex items-center gap-1.5">
        <Link href="/" className="hover:text-red-600">Trang chủ</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-900 font-medium">Giỏ hàng ({totalItems} sản phẩm)</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Cart items */}
        <div className="flex-1 space-y-4">
          {/* Select all header */}
          <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-3">
            <input type="checkbox" checked={allChecked} onChange={toggleAll}
              className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500" />
            <span className="text-sm font-medium text-gray-700">Chọn tất cả ({shops.flatMap(s => s.items).length} sản phẩm)</span>
          </div>

          {shops.map(shop => (
            <div key={shop.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              {/* Shop header */}
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-100">
                <input type="checkbox" checked={shop.checked} onChange={() => toggleShop(shop.id)}
                  className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500" />
                <div className="w-7 h-7 bg-red-100 rounded-lg flex items-center justify-center text-[#E31937] text-xs font-bold">
                  {shop.name[0]}
                </div>
                <span className="text-sm font-semibold text-gray-800">{shop.name}</span>
                <Link href="#" className="ml-auto text-xs text-[#E31937] hover:underline">Xem shop</Link>
              </div>

              {/* Items */}
              <div className="divide-y divide-gray-50">
                {shop.items.map(item => (
                  <div key={item.id} className="flex gap-4 p-4">
                    <input type="checkbox" checked={item.checked} onChange={() => toggleItem(shop.id, item.id)}
                      className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500 mt-1 shrink-0" />
                    {/* Image */}
                    <div className="w-20 h-20 bg-gray-100 rounded-xl shrink-0 flex items-center justify-center">
                      <div className="w-10 h-10 bg-gray-200 rounded" />
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 line-clamp-2">{item.productName}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{item.variant}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-bold text-[#E31937]">{item.price.toLocaleString('vi-VN')}đ</span>
                        <span className="text-xs text-gray-400 line-through">{item.originalPrice.toLocaleString('vi-VN')}đ</span>
                      </div>
                    </div>
                    {/* Controls */}
                    <div className="flex flex-col items-end gap-3 shrink-0">
                      <button onClick={() => removeItem(shop.id, item.id)}
                        className="text-gray-300 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                        <button onClick={() => changeQty(shop.id, item.id, -1)}
                          className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">−</button>
                        <span className="w-8 text-center text-sm font-medium">{item.qty}</span>
                        <button onClick={() => changeQty(shop.id, item.id, 1)}
                          className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">+</button>
                      </div>
                      <p className="text-sm font-bold text-gray-900">
                        {(item.price * item.qty).toLocaleString('vi-VN')}đ
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary Sidebar */}
        <aside className="lg:w-80 shrink-0">
          <div className="bg-white border border-gray-200 rounded-xl p-5 sticky top-4 space-y-4">
            <h2 className="text-base font-bold text-gray-900">Tóm tắt đơn hàng</h2>

            {/* Voucher */}
            <div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input value={voucher} onChange={e => setVoucher(e.target.value)} placeholder="Nhập mã voucher..."
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
                </div>
                <button
                  onClick={() => { if (voucher) setVoucherApplied(true); }}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors">
                  Áp dụng
                </button>
              </div>
              {voucherApplied && (
                <p className="text-xs text-green-600 mt-1">✓ Đã áp dụng voucher giảm 5%</p>
              )}
            </div>

            {/* Price breakdown */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Tạm tính ({totalItems} sp)</span>
                <span>{subtotal.toLocaleString('vi-VN')}đ</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Phí vận chuyển</span>
                <span className="text-green-600 font-medium">Miễn phí</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Giảm giá voucher</span>
                  <span>−{discount.toLocaleString('vi-VN')}đ</span>
                </div>
              )}
            </div>

            {/* Escrow notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
              <div className="flex items-start gap-2">
                <Lock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700 leading-relaxed">
                  <span className="font-semibold">Thanh toán bảo vệ ACFmart Escrow:</span> Tiền của bạn sẽ được ACFmart giữ an toàn cho đến khi bạn xác nhận nhận hàng thành công.
                </p>
              </div>
            </div>

            {/* Total */}
            <div className="border-t border-gray-100 pt-4">
              <div className="flex justify-between items-baseline mb-4">
                <span className="font-semibold text-gray-900">Tổng cộng</span>
                <span className="text-2xl font-bold text-[#E31937]">{total.toLocaleString('vi-VN')}đ</span>
              </div>
              <Link href="/checkout"
                className="block w-full py-3 bg-[#E31937] hover:bg-red-700 text-white text-center font-semibold rounded-xl transition-colors">
                Thanh toán ({totalItems} sản phẩm)
              </Link>
              <Link href="/products" className="block text-center text-sm text-gray-500 hover:text-gray-700 mt-3 transition-colors">
                ← Tiếp tục mua sắm
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
