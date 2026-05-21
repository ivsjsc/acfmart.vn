'use client';
import { useState } from 'react';
import { ChevronRight, Lock, CheckCircle } from 'lucide-react';
import Link from 'next/link';

const stepLabels = ['Địa chỉ', 'Vận chuyển', 'Thanh toán', 'Xác nhận'];

const savedAddresses = [
  { id: '1', name: 'Nguyễn Văn An', phone: '0901234567', address: '123 Lê Lợi, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh', isDefault: true },
  { id: '2', name: 'Nguyễn Văn An', phone: '0901234567', address: '456 Hoàng Diệu, Phường 10, Quận 10, TP. Hồ Chí Minh', isDefault: false },
];

const shippingOptions = [
  { id: 'standard', label: 'Giao hàng tiêu chuẩn', desc: '3–5 ngày làm việc', price: 0 },
  { id: 'fast', label: 'Giao hàng nhanh', desc: '1–2 ngày làm việc', price: 30000 },
  { id: 'same_day', label: 'Giao trong ngày', desc: 'Trong vòng 4 giờ', price: 50000 },
];

const paymentOptions = [
  { id: 'cod', label: 'Thanh toán khi nhận hàng (COD)', icon: '💵' },
  { id: 'bank', label: 'Chuyển khoản ngân hàng (QR)', icon: '🏦' },
  { id: 'momo', label: 'Ví MoMo', icon: '💜' },
  { id: 'zalopay', label: 'ZaloPay', icon: '🔵' },
  { id: 'card', label: 'Thẻ tín dụng / Ghi nợ', icon: '💳' },
];

const orderItems = [
  { name: 'Tai nghe Bluetooth Sony WH-1000XM5', variant: 'Màu: Đen', price: 7990000, qty: 1 },
  { name: 'Áo thun Uniqlo Dry-EX Pro', variant: 'Size: M / Xanh', price: 299000, qty: 2 },
  { name: 'Kem dưỡng da Innisfree Super Volcanic', variant: '50ml', price: 450000, qty: 1 },
];

interface AddressForm {
  name: string;
  phone: string;
  address: string;
  city: string;
}

export default function CheckoutPage() {
  const [step, setStep] = useState(1);
  const [selectedAddress, setSelectedAddress] = useState('1');
  const [shipping, setShipping] = useState('standard');
  const [payment, setPayment] = useState('momo');
  const [form, setForm] = useState<AddressForm>({ name: '', phone: '', address: '', city: '' });
  const [showNewAddress, setShowNewAddress] = useState(false);

  const shippingFee = shippingOptions.find(s => s.id === shipping)?.price ?? 0;
  const subtotal = orderItems.reduce((s, i) => s + i.price * i.qty, 0);
  const total = subtotal + shippingFee;

  const inputClass = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500';

  const OrderSummary = () => (
    <div className="bg-white border border-gray-200 rounded-xl p-5 sticky top-4">
      <h2 className="text-base font-bold text-gray-900 mb-4">Đơn hàng của bạn</h2>
      <div className="space-y-3 mb-4">
        {orderItems.map((item, i) => (
          <div key={i} className="flex gap-3">
            <div className="w-12 h-12 bg-gray-100 rounded-lg shrink-0 flex items-center justify-center">
              <div className="w-6 h-6 bg-gray-200 rounded" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-800 line-clamp-2">{item.name}</p>
              <p className="text-xs text-gray-400">{item.variant} × {item.qty}</p>
            </div>
            <p className="text-sm font-semibold text-gray-900 shrink-0">{(item.price * item.qty).toLocaleString('vi-VN')}đ</p>
          </div>
        ))}
      </div>
      <div className="border-t border-gray-100 pt-3 space-y-2 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Tạm tính</span>
          <span>{subtotal.toLocaleString('vi-VN')}đ</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Phí vận chuyển</span>
          <span>{shippingFee === 0 ? <span className="text-green-600">Miễn phí</span> : `${shippingFee.toLocaleString('vi-VN')}đ`}</span>
        </div>
        <div className="flex justify-between font-bold text-gray-900 border-t border-gray-100 pt-2 mt-2">
          <span>Tổng cộng</span>
          <span className="text-[#E31937] text-lg">{total.toLocaleString('vi-VN')}đ</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6 flex items-center gap-1.5">
        <Link href="/" className="hover:text-red-600">Trang chủ</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/cart" className="hover:text-red-600">Giỏ hàng</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-900 font-medium">Thanh toán</span>
      </nav>

      {/* Stepper */}
      <div className="flex items-center justify-center mb-8">
        {stepLabels.map((label, i) => (
          <div key={i} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                step > i + 1 ? 'bg-green-500 text-white' : step === i + 1 ? 'bg-[#E31937] text-white' : 'bg-gray-100 text-gray-400'
              }`}>
                {step > i + 1 ? '✓' : i + 1}
              </div>
              <span className={`text-xs mt-1 font-medium ${step === i + 1 ? 'text-[#E31937]' : 'text-gray-400'}`}>{label}</span>
            </div>
            {i < stepLabels.length - 1 && (
              <div className={`w-16 sm:w-24 h-0.5 mx-2 mb-4 ${step > i + 1 ? 'bg-green-500' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main */}
        <div className="flex-1">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            {/* Step 1 — Địa chỉ */}
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">Địa chỉ giao hàng</h2>
                <div className="space-y-3">
                  {savedAddresses.map(addr => (
                    <label key={addr.id} className={`flex gap-3 p-4 border-2 rounded-xl cursor-pointer transition-colors ${
                      selectedAddress === addr.id ? 'border-[#E31937] bg-red-50' : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <input type="radio" checked={selectedAddress === addr.id} onChange={() => setSelectedAddress(addr.id)}
                        className="mt-0.5 text-red-600 focus:ring-red-500" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-medium text-gray-900">{addr.name}</span>
                          <span className="text-xs text-gray-500">| {addr.phone}</span>
                          {addr.isDefault && (
                            <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-medium">Mặc định</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{addr.address}</p>
                      </div>
                    </label>
                  ))}
                  <button onClick={() => setShowNewAddress(!showNewAddress)}
                    className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-500 hover:border-red-300 hover:text-red-500 transition-colors">
                    + Thêm địa chỉ mới
                  </button>
                </div>
                {showNewAddress && (
                  <div className="space-y-3 border border-gray-200 rounded-xl p-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Họ và tên</label>
                        <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inputClass} placeholder="Nguyễn Văn A" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Số điện thoại</label>
                        <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className={inputClass} placeholder="0901234567" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Địa chỉ chi tiết</label>
                      <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} className={inputClass} placeholder="Số nhà, tên đường..." />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Tỉnh / Thành phố</label>
                      <select value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} className={inputClass}>
                        <option value="">Chọn tỉnh/thành</option>
                        {['TP. Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Cần Thơ', 'Hải Phòng'].map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 2 — Vận chuyển */}
            {step === 2 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">Phương thức vận chuyển</h2>
                <div className="space-y-3">
                  {shippingOptions.map(opt => (
                    <label key={opt.id} className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-colors ${
                      shipping === opt.id ? 'border-[#E31937] bg-red-50' : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <input type="radio" checked={shipping === opt.id} onChange={() => setShipping(opt.id)}
                        className="text-red-600 focus:ring-red-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{opt.label}</p>
                        <p className="text-xs text-gray-500">{opt.desc}</p>
                      </div>
                      <span className={`text-sm font-semibold ${opt.price === 0 ? 'text-green-600' : 'text-gray-800'}`}>
                        {opt.price === 0 ? 'Miễn phí' : `${opt.price.toLocaleString('vi-VN')}đ`}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3 — Thanh toán */}
            {step === 3 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">Phương thức thanh toán</h2>
                <div className="space-y-3">
                  {paymentOptions.map(opt => (
                    <label key={opt.id} className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-colors ${
                      payment === opt.id ? 'border-[#E31937] bg-red-50' : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <input type="radio" checked={payment === opt.id} onChange={() => setPayment(opt.id)}
                        className="text-red-600 focus:ring-red-500" />
                      <span className="text-xl">{opt.icon}</span>
                      <span className="text-sm font-medium text-gray-900">{opt.label}</span>
                    </label>
                  ))}
                </div>

                {/* Escrow Info Box */}
                <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-5 mt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Lock className="w-5 h-5 text-blue-700" />
                    <h3 className="text-base font-bold text-blue-900">Bảo vệ thanh toán ACFmart Escrow</h3>
                  </div>
                  <div className="space-y-2">
                    {[
                      'Tiền của bạn được giữ an toàn tại ACFmart — không đến tay người bán ngay lập tức',
                      'Người bán giao hàng thành công → Bạn kiểm tra sản phẩm → Xác nhận OK → Người bán mới nhận tiền',
                      'Hàng có vấn đề? Khiếu nại trong 7 ngày — hoàn tiền 100%',
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-blue-700">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4 — Xác nhận */}
            {step === 4 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">Xác nhận đơn hàng</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    {
                      title: 'Địa chỉ giao hàng',
                      content: savedAddresses.find(a => a.id === selectedAddress),
                      render: (v: typeof savedAddresses[0]) => (
                        <div className="text-sm text-gray-600">
                          <p className="font-medium text-gray-800">{v.name}</p>
                          <p>{v.phone}</p>
                          <p>{v.address}</p>
                        </div>
                      ),
                    },
                    {
                      title: 'Vận chuyển',
                      content: shippingOptions.find(s => s.id === shipping),
                      render: (v: typeof shippingOptions[0]) => (
                        <div className="text-sm text-gray-600">
                          <p className="font-medium text-gray-800">{v.label}</p>
                          <p>{v.desc}</p>
                          <p className="text-green-600 font-medium">{v.price === 0 ? 'Miễn phí' : `${v.price.toLocaleString('vi-VN')}đ`}</p>
                        </div>
                      ),
                    },
                    {
                      title: 'Thanh toán',
                      content: paymentOptions.find(p => p.id === payment),
                      render: (v: typeof paymentOptions[0]) => (
                        <div className="text-sm text-gray-600">
                          <p className="font-medium text-gray-800">{v.label}</p>
                          <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                            <Lock className="w-3 h-3" />Bảo vệ bởi Escrow
                          </p>
                        </div>
                      ),
                    },
                  ].map((section, i) => (
                    <div key={i} className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-2">{section.title}</p>
                      {section.content && (section.render as (v: unknown) => React.ReactNode)(section.content)}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-4 border-t border-gray-100">
              {step > 1 ? (
                <button onClick={() => setStep(s => s - 1)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                  ← Quay lại
                </button>
              ) : (
                <Link href="/cart" className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                  ← Giỏ hàng
                </Link>
              )}
              {step < 4 ? (
                <button onClick={() => setStep(s => s + 1)}
                  className="px-6 py-2 bg-[#E31937] hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors">
                  Tiếp theo →
                </button>
              ) : (
                <button className="px-8 py-3 bg-[#E31937] hover:bg-red-700 text-white rounded-xl text-sm font-bold transition-colors">
                  🛒 Đặt hàng ngay — {total.toLocaleString('vi-VN')}đ
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="lg:w-80 shrink-0">
          <OrderSummary />
        </aside>
      </div>
    </div>
  );
}
