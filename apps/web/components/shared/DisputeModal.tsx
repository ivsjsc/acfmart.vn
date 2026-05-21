'use client';
import { useState } from 'react';
import { X, Upload } from 'lucide-react';

type DisputeReason =
  | 'KHONG_NHAN_DUOC'
  | 'KHONG_DUNG_MO_TA'
  | 'HANG_GIA'
  | 'HANG_VO'
  | 'SAI_SAN_PHAM';

interface DisputeModalProps {
  orderId: string;
  onClose: () => void;
  onSubmit?: (reason: DisputeReason, description: string, evidence: string[]) => void;
}

const REASONS: { value: DisputeReason; label: string; desc: string }[] = [
  { value: 'KHONG_NHAN_DUOC', label: 'Không nhận được hàng', desc: 'Đơn hàng chưa được giao đến' },
  { value: 'KHONG_DUNG_MO_TA', label: 'Hàng không đúng mô tả', desc: 'Sản phẩm khác với hình ảnh/thông tin trên web' },
  { value: 'HANG_GIA', label: 'Nghi ngờ hàng giả', desc: 'Sản phẩm có dấu hiệu không chính hãng' },
  { value: 'HANG_VO', label: 'Hàng bị hỏng/vỡ', desc: 'Sản phẩm bị hư hỏng khi nhận' },
  { value: 'SAI_SAN_PHAM', label: 'Giao sai sản phẩm', desc: 'Nhận được sản phẩm khác với đơn đặt hàng' },
];

export function DisputeModal({ orderId, onClose, onSubmit }: DisputeModalProps) {
  const [reason, setReason] = useState<DisputeReason | ''>('');
  const [description, setDescription] = useState('');
  const [evidence, setEvidence] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const mockAddEvidence = () => {
    if (evidence.length < 3) {
      setEvidence(prev => [...prev, `Ảnh_bằng_chứng_${prev.length + 1}.jpg`]);
    }
  };

  const handleSubmit = async () => {
    if (!reason || !description.trim()) return;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1000));
    onSubmit?.(reason as DisputeReason, description, evidence);
    setSubmitting(false);
    onClose();
  };

  const isReady = reason && description.trim().length >= 20;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Yêu cầu hoàn tiền</h2>
            <p className="text-xs text-gray-500 mt-0.5">Đơn hàng #{orderId}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Escrow note */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-700">
            🔒 Tiền của bạn đang được ACFMart giữ an toàn. Chúng tôi sẽ xem xét khiếu nại và xử lý trong 3–5 ngày làm việc.
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lý do khiếu nại <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {REASONS.map(r => (
                <label key={r.value}
                  className={`flex items-start gap-3 p-3 border-2 rounded-xl cursor-pointer transition-colors ${
                    reason === r.value ? 'border-[#E31937] bg-red-50' : 'border-gray-200 hover:border-gray-300'
                  }`}>
                  <input type="radio" name="reason" value={r.value} checked={reason === r.value}
                    onChange={() => setReason(r.value)}
                    className="mt-0.5 text-red-600 focus:ring-red-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{r.label}</p>
                    <p className="text-xs text-gray-500">{r.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mô tả chi tiết <span className="text-red-500">*</span>
              <span className="text-xs font-normal text-gray-400 ml-1">(tối thiểu 20 ký tự)</span>
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={4}
              placeholder="Mô tả cụ thể vấn đề của bạn để chúng tôi có thể hỗ trợ nhanh nhất..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
            />
            <p className="text-xs text-gray-400 mt-1">{description.length} ký tự</p>
          </div>

          {/* Evidence upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ảnh bằng chứng (tối đa 3 ảnh)
            </label>
            <div className="flex gap-3 flex-wrap">
              {evidence.map((ev, i) => (
                <div key={i} className="relative w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center">
                  <p className="text-xs text-gray-400 text-center px-1 leading-tight">{ev}</p>
                  <button
                    onClick={() => setEvidence(prev => prev.filter((_, idx) => idx !== i))}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {evidence.length < 3 && (
                <button onClick={mockAddEvidence}
                  className="w-20 h-20 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-red-300 hover:text-red-400 transition-colors">
                  <Upload className="w-5 h-5 mb-1" />
                  <span className="text-xs">Tải ảnh</span>
                </button>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-1">Chụp ảnh hàng nhận được, bao bì, tem nhãn để tăng tốc xử lý.</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button onClick={onClose}
              className="flex-1 py-3 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl font-medium text-sm transition-colors">
              Hủy
            </button>
            <button
              onClick={handleSubmit}
              disabled={!isReady || submitting}
              className="flex-1 py-3 bg-[#E31937] hover:bg-red-700 disabled:opacity-40 text-white rounded-xl font-bold text-sm transition-colors"
            >
              {submitting ? 'Đang gửi...' : 'Gửi khiếu nại'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
