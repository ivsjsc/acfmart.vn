// =============================================================================
// UploadWizard — Mobile-first seller product upload (4-step)
// WCAG 2.1 AA, touch target ≥44px, skeleton loading, drag/drop + camera
// Self-check #5: Consent collected in Step 3 before AI scan
// =============================================================================

import React, { useState, useCallback, useRef, useId } from 'react';
import type { ProductDraft, UploadedFile, PricingBreakdown } from '../../types';
import { UPLOAD_STEPS, calculatePricing } from '../../types';
import { AiStatusBadge } from './AiStatusBadge';

// ---------------------------------------------------------------------------
// Step 1: Image Upload
// ---------------------------------------------------------------------------

function computeImageHash(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      if (!e.target?.result) { resolve(''); return; }
      const buffer = e.target.result as ArrayBuffer;
      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      resolve(hashArray.map((b) => b.toString(16).padStart(2, '0')).join(''));
    };
    reader.readAsArrayBuffer(file);
  });
}

function ImageUploadStep({
  files,
  onChange,
}: {
  files: UploadedFile[];
  onChange: (files: UploadedFile[]) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneId = useId();

  const processFiles = useCallback(async (raw: FileList) => {
    const newFiles: UploadedFile[] = await Promise.all(
      Array.from(raw).slice(0, 8 - files.length).map(async (file) => {
        const imageHash = await computeImageHash(file);
        return {
          id: crypto.randomUUID(),
          file,
          previewUrl: URL.createObjectURL(file),
          uploadProgress: 0,
          imageHash,
        };
      }),
    );
    onChange([...files, ...newFiles]);
  }, [files, onChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  }, [processFiles]);

  const removeFile = (id: string) => {
    const f = files.find((f) => f.id === id);
    if (f) URL.revokeObjectURL(f.previewUrl);
    onChange(files.filter((f) => f.id !== id));
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Tải lên 1–8 ảnh sản phẩm (JPG, PNG, WebP). Ảnh đầu tiên là ảnh đại diện.
      </p>

      {/* Drop zone */}
      <div
        id={dropZoneId}
        role="region"
        aria-label="Khu vực tải ảnh lên"
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer
          min-h-[160px] flex flex-col items-center justify-center gap-3
          ${isDragging ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400 bg-gray-50'}
        `}
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
        tabIndex={0}
      >
        <span className="text-4xl" aria-hidden="true">📷</span>
        <div>
          <p className="font-medium text-gray-700">Kéo thả ảnh vào đây</p>
          <p className="text-sm text-gray-500 mt-1">hoặc nhấn để chọn từ thiết bị</p>
        </div>
        <button
          type="button"
          className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium min-h-[44px] min-w-[44px]"
          aria-label="Chọn ảnh từ thư viện"
        >
          Chọn ảnh
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        capture="environment"
        className="sr-only"
        aria-label="Upload file input"
        onChange={(e) => e.target.files && processFiles(e.target.files)}
      />

      {/* Preview grid */}
      {files.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2" role="list" aria-label="Ảnh đã chọn">
          {files.map((f, i) => (
            <div key={f.id} role="listitem" className="relative group aspect-square">
              <img
                src={f.previewUrl}
                alt={`Ảnh ${i + 1}`}
                className="w-full h-full object-cover rounded-lg border border-gray-200"
                loading="lazy"
              />
              {i === 0 && (
                <span className="absolute top-1 left-1 bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
                  Chính
                </span>
              )}
              {/* Progress overlay */}
              {f.uploadProgress > 0 && f.uploadProgress < 100 && (
                <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center">
                  <div className="text-white text-xs font-bold">{f.uploadProgress}%</div>
                </div>
              )}
              <button
                type="button"
                onClick={() => removeFile(f.id)}
                className="
                  absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full
                  text-xs flex items-center justify-center opacity-0 group-hover:opacity-100
                  focus:opacity-100 transition-opacity min-h-[44px] min-w-[44px] -m-2 p-2
                "
                aria-label={`Xóa ảnh ${i + 1}`}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 2: Product Info
// ---------------------------------------------------------------------------

const CATEGORIES = [
  'Điện thoại & Phụ kiện', 'Thời Trang Nam', 'Thời Trang Nữ',
  'Giày Dép', 'Điện Tử', 'Máy Tính', 'Nhà Cửa & Đời Sống',
  'Mẹ & Bé', 'Sức Khỏe', 'Làm Đẹp', 'Thực Phẩm',
];

function ProductInfoStep({
  draft,
  onChange,
}: {
  draft: ProductDraft;
  onChange: (patch: Partial<ProductDraft>) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">
          Tên sản phẩm <span className="text-red-500" aria-hidden="true">*</span>
        </label>
        <input
          id="name"
          type="text"
          required
          value={draft.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="VD: Áo polo nam Premium Cotton 100%"
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm min-h-[44px]"
          maxLength={200}
        />
        <p className="text-xs text-gray-400 mt-1">{draft.name.length}/200</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="category">
          Danh mục <span className="text-red-500" aria-hidden="true">*</span>
        </label>
        <select
          id="category"
          required
          value={draft.category}
          onChange={(e) => onChange({ category: e.target.value })}
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-sm min-h-[44px]"
        >
          <option value="">Chọn danh mục</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="origin">
          Xuất xứ
        </label>
        <div className="flex gap-3" role="radiogroup" aria-labelledby="origin-label">
          {(['domestic', 'imported'] as const).map((v) => (
            <label key={v} className="flex items-center gap-2 cursor-pointer min-h-[44px]">
              <input
                type="radio"
                name="origin"
                value={v}
                checked={draft.origin === v}
                onChange={() => onChange({ origin: v })}
                className="w-4 h-4 text-red-600"
              />
              <span className="text-sm">{v === 'domestic' ? 'Trong nước' : 'Nhập khẩu'}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="description">
          Mô tả
        </label>
        <textarea
          id="description"
          value={draft.description}
          onChange={(e) => onChange({ description: e.target.value })}
          rows={4}
          placeholder="Mô tả chi tiết sản phẩm..."
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-sm resize-none"
          maxLength={2000}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 3: Label & Price (NĐ 43/2017 compliance + consent)
// ---------------------------------------------------------------------------

function LabelPriceStep({
  draft,
  onChange,
}: {
  draft: ProductDraft;
  onChange: (patch: Partial<ProductDraft>) => void;
}) {
  const pricing: PricingBreakdown = calculatePricing(
    draft.price || 0,
    draft.shopDiscount || 0,
    0.05,
    0,
  );

  const toggleConsent = (purpose: string) => {
    const current = draft.consentScope;
    onChange({
      consentScope: current.includes(purpose)
        ? current.filter((c) => c !== purpose)
        : [...current, purpose],
    });
  };

  return (
    <div className="space-y-6">
      {/* Pricing section */}
      <section>
        <h3 className="text-sm font-semibold text-gray-800 mb-3">Giá bán</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1" htmlFor="price">
              Giá niêm yết (đ) <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <input
              id="price"
              type="number"
              min={1000}
              required
              value={draft.price || ''}
              onChange={(e) => onChange({ price: Number(e.target.value) })}
              placeholder="100000"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-sm min-h-[44px]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1" htmlFor="shopDiscount">
              Giảm giá shop (đ)
            </label>
            <input
              id="shopDiscount"
              type="number"
              min={0}
              value={draft.shopDiscount || ''}
              onChange={(e) => onChange({ shopDiscount: Number(e.target.value) })}
              placeholder="0"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-sm min-h-[44px]"
            />
          </div>
        </div>

        {/* Fee breakdown (self-check #4) */}
        {draft.price > 0 && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-500">Giá hiệu lực (sau KM shop)</span>
              <span className="font-medium">{pricing.effectivePrice.toLocaleString('vi-VN')} đ</span>
            </div>
            <div className="flex justify-between text-orange-600">
              <span>Hoa hồng sàn (5% × giá hiệu lực)</span>
              <span>-{pricing.commission.toLocaleString('vi-VN')} đ</span>
            </div>
            <div className="flex justify-between font-semibold border-t border-gray-200 pt-1">
              <span>Seller nhận được</span>
              <span className="text-green-600">{pricing.sellerReceives.toLocaleString('vi-VN')} đ</span>
            </div>
          </div>
        )}
      </section>

      {/* NĐ 43/2017 label compliance */}
      <section>
        <h3 className="text-sm font-semibold text-gray-800 mb-1">
          Thông tin nhãn sản phẩm
          <span className="ml-2 text-xs font-normal text-gray-500">(theo NĐ 43/2017)</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { id: 'brandName', label: 'Thương hiệu *', ph: 'Nike, Samsung...' },
            { id: 'manufacturerName', label: 'Nhà sản xuất *', ph: 'Tên công ty SX' },
            { id: 'originCountry', label: 'Nước xuất xứ *', ph: 'Việt Nam, Hàn Quốc...' },
            { id: 'batchNumber', label: 'Số lô', ph: 'VD: LOT202401' },
            { id: 'barcode', label: 'Mã vạch (EAN/UPC)', ph: '8935000000000' },
          ].map(({ id, label, ph }) => (
            <div key={id}>
              <label className="block text-xs font-medium text-gray-600 mb-1" htmlFor={id}>
                {label}
              </label>
              <input
                id={id}
                type="text"
                value={(draft as any)[id] || ''}
                onChange={(e) => onChange({ [id]: e.target.value })}
                placeholder={ph}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-sm min-h-[44px]"
              />
            </div>
          ))}
        </div>
      </section>

      {/* NĐ 13/2023 Consent */}
      <section className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <h3 className="text-sm font-semibold text-blue-800 mb-2">
          🔒 Đồng ý xử lý dữ liệu (NĐ 13/2023)
        </h3>
        <p className="text-xs text-blue-700 mb-3">
          ACF sẽ xử lý ảnh sản phẩm của bạn bằng AI. Vui lòng đồng ý các mục đích sau:
        </p>
        <div className="space-y-2" role="group" aria-label="Đồng ý mục đích xử lý dữ liệu">
          {[
            { key: 'PRODUCT_SCAN', label: 'Quét ảnh kiểm tra nội dung vi phạm' },
            { key: 'LABEL_OCR', label: 'Trích xuất văn bản từ nhãn sản phẩm (OCR)' },
            { key: 'FACE_DETECTION_BLUR', label: 'Phát hiện và làm mờ khuôn mặt trong ảnh' },
            { key: 'QUALITY_ASSESSMENT', label: 'Đánh giá chất lượng hình ảnh' },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-start gap-2.5 cursor-pointer min-h-[44px]">
              <input
                type="checkbox"
                checked={draft.consentScope.includes(key)}
                onChange={() => toggleConsent(key)}
                className="mt-0.5 w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-xs text-blue-800">{label}</span>
            </label>
          ))}
        </div>
        {['PRODUCT_SCAN', 'LABEL_OCR'].some((k) => !draft.consentScope.includes(k)) && (
          <p className="mt-2 text-xs text-red-600" role="alert">
            ⚠ Cần đồng ý "Quét ảnh" và "Trích xuất văn bản" để tiếp tục
          </p>
        )}
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 4: Review & Submit
// ---------------------------------------------------------------------------

function ReviewStep({
  draft,
  isSubmitting,
}: {
  draft: ProductDraft;
  isSubmitting: boolean;
}) {
  if (isSubmitting) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="flex justify-center mt-8">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" aria-hidden="true" />
            <p className="text-sm text-gray-600" role="status" aria-live="polite">
              Đang đăng sản phẩm...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <h3 className="font-semibold text-gray-800">Xác nhận thông tin</h3>
        </div>
        <div className="p-4 space-y-3 text-sm">
          <Row label="Tên" value={draft.name} />
          <Row label="Danh mục" value={draft.category} />
          <Row label="Thương hiệu" value={draft.brandName || '—'} />
          <Row label="Giá niêm yết" value={`${draft.price.toLocaleString('vi-VN')} đ`} />
          {draft.shopDiscount > 0 && (
            <Row label="Giảm giá shop" value={`-${draft.shopDiscount.toLocaleString('vi-VN')} đ`} />
          )}
          <Row
            label="Ảnh"
            value={`${draft.mediaFiles.length} ảnh`}
          />
        </div>
      </div>

      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
        <p className="text-xs text-yellow-800">
          <strong>Sau khi đăng:</strong> Sản phẩm sẽ được quét tự động bởi AI (~1-3 giây).
          Nếu AI không phát hiện vi phạm, sản phẩm được duyệt ngay lập tức.
          Trường hợp nghi ngờ sẽ được kiểm tra thủ công trong 24h.
        </p>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-gray-500 flex-shrink-0">{label}</span>
      <span className="text-gray-800 text-right">{value}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main UploadWizard
// ---------------------------------------------------------------------------

interface UploadWizardProps {
  shopId: string;
  onSuccess?: (productId: string) => void;
  onCancel?: () => void;
}

const EMPTY_DRAFT: ProductDraft = {
  mediaFiles: [],
  name: '',
  description: '',
  category: '',
  origin: '',
  price: 0,
  shopDiscount: 0,
  brandName: '',
  manufacturerName: '',
  originCountry: '',
  batchNumber: '',
  barcode: '',
  consentScope: [],
};

export function UploadWizard({ shopId, onSuccess, onCancel }: UploadWizardProps) {
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<ProductDraft>(EMPTY_DRAFT);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{
    productId?: string;
    error?: string;
  } | null>(null);

  const patchDraft = useCallback((patch: Partial<ProductDraft>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
  }, []);

  // ---------------------------------------------------------------------------
  // Validation per step
  // ---------------------------------------------------------------------------

  const isStepValid = useCallback((): boolean => {
    switch (step) {
      case 1: return draft.mediaFiles.length > 0;
      case 2: return draft.name.trim().length > 0 && draft.category.length > 0;
      case 3:
        return (
          draft.price > 0 &&
          draft.brandName.trim().length > 0 &&
          draft.manufacturerName.trim().length > 0 &&
          draft.originCountry.trim().length > 0 &&
          ['PRODUCT_SCAN', 'LABEL_OCR'].every((k) => draft.consentScope.includes(k))
        );
      case 4: return true;
      default: return false;
    }
  }, [step, draft]);

  // ---------------------------------------------------------------------------
  // Submit
  // ---------------------------------------------------------------------------

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const { submitProduct } = await import('../../services/catalogRouter');
      const result = await submitProduct(shopId, draft);
      if (result.success) {
        setSubmitResult({ productId: result.data.productId });
        onSuccess?.(result.data.productId);
      } else {
        setSubmitResult({ error: 'message' in result ? result.message : 'Lỗi không xác định' });
      }
    } catch (err) {
      setSubmitResult({ error: (err as Error).message });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Success screen
  // ---------------------------------------------------------------------------

  if (submitResult?.productId) {
    return (
      <div className="text-center py-12 px-4">
        <div className="text-5xl mb-4" aria-hidden="true">🎉</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Đăng sản phẩm thành công!</h2>
        <p className="text-gray-600 text-sm mb-4">
          AI đang quét sản phẩm của bạn. Kết quả trong vài giây.
        </p>
        <AiStatusBadge status="PENDING" size="lg" animate />
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Wizard render
  // ---------------------------------------------------------------------------

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Progress bar */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-1" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={4} aria-label={`Bước ${step} / 4`}>
          {UPLOAD_STEPS.map((s) => (
            <React.Fragment key={s.id}>
              <div className="flex flex-col items-center">
                <div className={`
                  w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors
                  ${step > s.id ? 'bg-green-500 text-white' :
                    step === s.id ? 'bg-red-600 text-white' :
                    'bg-gray-200 text-gray-500'}
                `}>
                  {step > s.id ? '✓' : s.id}
                </div>
                <span className={`text-[10px] mt-0.5 ${step === s.id ? 'text-red-600 font-semibold' : 'text-gray-400'}`}>
                  {s.label}
                </span>
              </div>
              {s.id < 4 && (
                <div className={`flex-1 h-0.5 mx-1 transition-colors ${step > s.id ? 'bg-green-400' : 'bg-gray-200'}`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className="px-4 pb-4 pt-3">
        <h2 className="text-base font-bold text-gray-800 mb-4">
          {UPLOAD_STEPS[step - 1].description}
        </h2>

        {step === 1 && (
          <ImageUploadStep
            files={draft.mediaFiles}
            onChange={(mediaFiles) => patchDraft({ mediaFiles })}
          />
        )}
        {step === 2 && <ProductInfoStep draft={draft} onChange={patchDraft} />}
        {step === 3 && <LabelPriceStep draft={draft} onChange={patchDraft} />}
        {step === 4 && <ReviewStep draft={draft} isSubmitting={isSubmitting} />}

        {submitResult?.error && (
          <p className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3" role="alert">
            ⚠ {submitResult.error}
          </p>
        )}
      </div>

      {/* Navigation */}
      <div className="px-4 pb-5 flex items-center gap-3">
        <button
          type="button"
          onClick={() => step > 1 ? setStep(step - 1) : onCancel?.()}
          className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 min-h-[44px] transition-colors"
        >
          {step > 1 ? '← Quay lại' : 'Hủy'}
        </button>

        {step < 4 ? (
          <button
            type="button"
            onClick={() => setStep(step + 1)}
            disabled={!isStepValid()}
            className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-700 min-h-[44px] transition-colors"
            aria-disabled={!isStepValid()}
          >
            Tiếp theo →
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl text-sm font-bold disabled:opacity-50 min-h-[44px] transition-colors"
          >
            {isSubmitting ? 'Đang đăng...' : '🚀 Đăng sản phẩm'}
          </button>
        )}
      </div>
    </div>
  );
}

export default UploadWizard;
