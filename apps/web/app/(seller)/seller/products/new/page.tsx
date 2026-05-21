'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const categories = ['Thời trang', 'Điện thoại', 'Điện tử', 'Nhà cửa', 'Làm đẹp', 'Sức khỏe', 'Thể thao', 'Phụ kiện mẹ & bé'];

interface FormState {
  name: string;
  category: string;
  brand: string;
  description: string;
  tags: string;
  price: string;
  originalPrice: string;
  stock: string;
  sku: string;
  barcode: string;
}

export default function NewProductPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>({
    name: '', category: '', brand: '', description: '', tags: '',
    price: '', originalPrice: '', stock: '', sku: '', barcode: '',
  });

  const steps = ['Thông tin cơ bản', 'Giá & Kho hàng', 'Hình ảnh & Xuất bản'];

  const update = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }));

  const generateSKU = () => {
    const prefix = form.brand.slice(0, 3).toUpperCase() || 'PRD';
    const num = Math.floor(Math.random() * 9000) + 1000;
    setForm(f => ({ ...f, sku: `${prefix}-${num}` }));
  };

  const discountPercent =
    form.price && form.originalPrice && Number(form.originalPrice) > Number(form.price)
      ? Math.round((1 - Number(form.price) / Number(form.originalPrice)) * 100)
      : 0;

  const inputClass = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500';

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/seller/products" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Thêm sản phẩm mới</h1>
          <p className="text-sm text-gray-500">Điền đầy đủ thông tin để gửi sản phẩm đi duyệt</p>
        </div>
      </div>

      {/* Stepper */}
      <div className="flex items-center mb-8">
        {steps.map((s, i) => (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <div className="flex items-center gap-2 shrink-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                step > i + 1 ? 'bg-green-500 text-white' : step === i + 1 ? 'bg-[#E31937] text-white' : 'bg-gray-100 text-gray-400'
              }`}>
                {step > i + 1 ? '✓' : i + 1}
              </div>
              <span className={`text-sm font-medium whitespace-nowrap ${step === i + 1 ? 'text-[#E31937]' : 'text-gray-400'}`}>{s}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-3 ${step > i + 1 ? 'bg-green-500' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {/* Step 1 — Thông tin cơ bản */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin cơ bản</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên sản phẩm <span className="text-red-500">*</span>
              </label>
              <input value={form.name} onChange={update('name')} placeholder="Nhập tên sản phẩm..." className={inputClass} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Danh mục <span className="text-red-500">*</span>
                </label>
                <select value={form.category} onChange={update('category')} className={inputClass}>
                  <option value="">Chọn danh mục</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Thương hiệu</label>
                <input value={form.brand} onChange={update('brand')} placeholder="Tên thương hiệu..." className={inputClass} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả sản phẩm</label>
              <textarea
                value={form.description}
                onChange={update('description')}
                rows={5}
                placeholder="Mô tả chi tiết sản phẩm..."
                className={`${inputClass} resize-none`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags (phân cách bằng dấu phẩy)</label>
              <input value={form.tags} onChange={update('tags')} placeholder="bluetooth, tai nghe, sony..." className={inputClass} />
            </div>
          </div>
        )}

        {/* Step 2 — Giá & Kho */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Giá & Kho hàng</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Giá bán <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input value={form.price} onChange={update('price')} type="number" placeholder="0"
                    className={`${inputClass} pr-8`} />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">đ</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Giá gốc (để gạch ngang)</label>
                <div className="relative">
                  <input value={form.originalPrice} onChange={update('originalPrice')} type="number" placeholder="0"
                    className={`${inputClass} pr-8`} />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">đ</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số lượng tồn <span className="text-red-500">*</span>
                </label>
                <input value={form.stock} onChange={update('stock')} type="number" placeholder="0" className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                <div className="flex gap-2">
                  <input value={form.sku} onChange={update('sku')} placeholder="Mã SKU"
                    className="flex-1 min-w-0 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
                  <button onClick={generateSKU}
                    className="px-2 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs text-gray-600 whitespace-nowrap transition-colors">
                    Tự tạo
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Barcode</label>
                <input value={form.barcode} onChange={update('barcode')} placeholder="Mã barcode" className={inputClass} />
              </div>
            </div>
            {discountPercent > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">
                ✅ Giảm giá: <span className="font-bold">{discountPercent}%</span> so với giá gốc
              </div>
            )}
          </div>
        )}

        {/* Step 3 — Hình ảnh & Xuất bản */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Hình ảnh & Xuất bản</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hình ảnh sản phẩm (tối đa 8 ảnh)
              </label>
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-red-300 transition-colors cursor-pointer">
                <Upload className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">
                  Kéo thả ảnh vào đây hoặc{' '}
                  <span className="text-[#E31937] font-medium">chọn file</span>
                </p>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP. Tối đa 5MB mỗi ảnh.</p>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">Tóm tắt sản phẩm</h3>
              <div className="space-y-1 text-sm text-blue-700">
                <p><span className="font-medium">Tên:</span> {form.name || '—'}</p>
                <p><span className="font-medium">Danh mục:</span> {form.category || '—'}</p>
                <p><span className="font-medium">Thương hiệu:</span> {form.brand || '—'}</p>
                <p><span className="font-medium">Giá:</span> {form.price ? `${Number(form.price).toLocaleString('vi-VN')}đ` : '—'}</p>
                <p><span className="font-medium">Tồn kho:</span> {form.stock || '—'}</p>
              </div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-700">
              ⚠️ Sau khi gửi duyệt, sản phẩm sẽ được admin ACFmart xem xét trong vòng 24 giờ.
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8 pt-4 border-t border-gray-100">
          {step > 1 ? (
            <button
              onClick={() => setStep(s => s - 1)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              ← Quay lại
            </button>
          ) : <div />}
          <div className="flex gap-3">
            {step === 3 && (
              <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                Lưu nháp
              </button>
            )}
            {step < 3 ? (
              <button
                onClick={() => setStep(s => s + 1)}
                className="px-6 py-2 bg-[#E31937] hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Tiếp theo →
              </button>
            ) : (
              <button
                onClick={() => router.push('/seller/products')}
                className="px-6 py-2 bg-[#E31937] hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Gửi duyệt
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
