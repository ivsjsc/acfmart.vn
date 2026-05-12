// =============================================================================
// LinkGenerator — Mobile-first form + copy 1-click + URL preview
// =============================================================================

import { useState, useMemo } from 'react';
import type { AffiliateTier, Industry, CommissionBreakdown } from '../types';

export interface LinkGeneratorProps {
  affiliateId: string;
  tier: AffiliateTier;
  onGenerate: (input: {
    affiliateId: string;
    productId?: string;
    destinationUrl: string;
    industry?: Industry;
    tier?: AffiliateTier;
  }) => Promise<{ trackingUrl: string } | null>;
  onPreviewCommission?: (input: {
    price: number;
    shopDiscount: number;
    category: string;
    tier: AffiliateTier;
  }) => CommissionBreakdown | null;
}

const INDUSTRIES: { value: Industry; label: string }[] = [
  { value: 'food', label: 'Thực phẩm' },
  { value: 'beverage', label: 'Đồ uống' },
  { value: 'cosmetics', label: 'Mỹ phẩm' },
  { value: 'electronics', label: 'Điện tử' },
  { value: 'fashion', label: 'Thời trang' },
  { value: 'home', label: 'Gia dụng' },
  { value: 'default', label: 'Khác' },
];

function formatVnd(n: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);
}

export function LinkGenerator({
  affiliateId,
  tier,
  onGenerate,
  onPreviewCommission,
}: LinkGeneratorProps) {
  const [destinationUrl, setDestinationUrl] = useState('');
  const [productId, setProductId] = useState('');
  const [industry, setIndustry] = useState<Industry>('default');
  const [previewPrice, setPreviewPrice] = useState('');
  const [previewDiscount, setPreviewDiscount] = useState('');
  const [generated, setGenerated] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'mobile' | 'desktop'>('mobile');

  // Live commission preview (Self-check #2)
  const commission = useMemo(() => {
    const p = parseFloat(previewPrice);
    const d = parseFloat(previewDiscount || '0');
    if (!onPreviewCommission || !Number.isFinite(p) || p <= 0 || d < 0 || d >= p) return null;
    return onPreviewCommission({ price: p, shopDiscount: d, category: industry, tier });
  }, [previewPrice, previewDiscount, industry, tier, onPreviewCommission]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!destinationUrl.trim()) {
      setError('Vui lòng nhập URL đích');
      return;
    }
    try {
      new URL(destinationUrl);
    } catch {
      setError('URL không hợp lệ');
      return;
    }

    setSubmitting(true);
    try {
      const result = await onGenerate({
        affiliateId,
        productId: productId.trim() || undefined,
        destinationUrl,
        industry,
        tier,
      });
      if (result) {
        setGenerated(result.trackingUrl);
      } else {
        setError('Tạo link thất bại');
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopy = async () => {
    if (!generated) return;
    try {
      await navigator.clipboard.writeText(generated);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Không thể copy — hãy chọn và copy thủ công');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
          Tạo link Affiliate
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Tier hiện tại: <strong>{tier === 'PREMIUM' ? 'Premium (30 ngày, +2%)' : 'Standard (7 ngày)'}</strong>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <div>
          <label htmlFor="dest-url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            URL sản phẩm / trang đích <span className="text-red-600">*</span>
          </label>
          <input
            id="dest-url"
            type="url"
            value={destinationUrl}
            onChange={(e) => setDestinationUrl(e.target.value)}
            placeholder="https://acf.vn/p/sample-product"
            required
            className="w-full min-h-[44px] px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="product-id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Product ID (optional)
            </label>
            <input
              id="product-id"
              type="text"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              placeholder="prod_abc123"
              className="w-full min-h-[44px] px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="industry" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Ngành hàng
            </label>
            <select
              id="industry"
              value={industry}
              onChange={(e) => setIndustry(e.target.value as Industry)}
              className="w-full min-h-[44px] px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {INDUSTRIES.map((i) => (
                <option key={i.value} value={i.value}>{i.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Live commission preview */}
        <fieldset className="border border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-3 sm:p-4">
          <legend className="px-2 text-xs font-medium text-gray-600 dark:text-gray-400">
            Tính thử hoa hồng
          </legend>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="preview-price" className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Giá (VND)</label>
              <input
                id="preview-price"
                type="number"
                inputMode="numeric"
                value={previewPrice}
                onChange={(e) => setPreviewPrice(e.target.value)}
                placeholder="100000"
                className="w-full min-h-[44px] px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-sm"
              />
            </div>
            <div>
              <label htmlFor="preview-discount" className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Giảm giá (VND)</label>
              <input
                id="preview-discount"
                type="number"
                inputMode="numeric"
                value={previewDiscount}
                onChange={(e) => setPreviewDiscount(e.target.value)}
                placeholder="10000"
                className="w-full min-h-[44px] px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-sm"
              />
            </div>
          </div>

          {commission && (
            <dl className="mt-3 text-xs space-y-1 text-gray-700 dark:text-gray-300">
              <div className="flex justify-between">
                <dt>Giá hiệu lực:</dt>
                <dd>{formatVnd(commission.effectivePrice)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Tỷ lệ ngành ({(commission.industryRate * 100).toFixed(1)}%):</dt>
                <dd>{formatVnd(commission.grossCommission)}</dd>
              </div>
              <div className="flex justify-between text-gray-500">
                <dt>– Phí nền tảng:</dt>
                <dd>−{formatVnd(commission.platformFee)}</dd>
              </div>
              <div className="flex justify-between text-gray-500">
                <dt>– Phí chuyển khoản:</dt>
                <dd>−{formatVnd(commission.payoutFee)}</dd>
              </div>
              <div className="flex justify-between font-semibold text-emerald-700 dark:text-emerald-300 border-t border-dashed pt-1 mt-1">
                <dt>Bạn nhận:</dt>
                <dd>{formatVnd(commission.netCommission)}</dd>
              </div>
            </dl>
          )}
        </fieldset>

        {error && (
          <div role="alert" className="text-sm text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full min-h-[44px] bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? 'Đang tạo...' : 'Tạo link tracking'}
        </button>
      </form>

      {/* Generated link + preview */}
      {generated && (
        <section
          aria-labelledby="generated-heading"
          className="bg-white dark:bg-gray-800 rounded-xl border border-emerald-200 dark:border-emerald-800 p-4 sm:p-6 space-y-3"
        >
          <h2 id="generated-heading" className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
            ✓ Đã tạo link
          </h2>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={generated}
              readOnly
              aria-label="Tracking URL"
              className="flex-1 min-h-[44px] px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-sm font-mono"
              onFocus={(e) => e.currentTarget.select()}
            />
            <button
              type="button"
              onClick={handleCopy}
              className="min-h-[44px] px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
            >
              {copied ? '✓ Đã copy' : 'Copy'}
            </button>
          </div>

          {/* Preview tabs */}
          <div role="tablist" aria-label="Xem trước thiết bị" className="flex gap-1 border-b border-gray-200 dark:border-gray-700">
            {(['mobile', 'desktop'] as const).map((m) => (
              <button
                key={m}
                role="tab"
                aria-selected={viewMode === m}
                type="button"
                onClick={() => setViewMode(m)}
                className={`min-h-[44px] px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  viewMode === m
                    ? 'border-blue-600 text-blue-700 dark:text-blue-300'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900'
                }`}
              >
                {m === 'mobile' ? '📱 Mobile' : '🖥 Desktop'}
              </button>
            ))}
          </div>

          <div
            role="tabpanel"
            className={`mx-auto bg-gray-100 dark:bg-gray-900 rounded-lg p-3 transition-all ${
              viewMode === 'mobile' ? 'max-w-[320px]' : 'max-w-full'
            }`}
          >
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Xem trước URL khi chia sẻ:
            </div>
            <div className="bg-white dark:bg-gray-800 rounded p-3 break-all font-mono text-xs text-blue-700 dark:text-blue-300">
              {generated}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default LinkGenerator;
