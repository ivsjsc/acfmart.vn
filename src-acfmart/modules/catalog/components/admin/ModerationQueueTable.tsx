// =============================================================================
// ModerationQueueTable — Admin Moderation Queue
// Responsive kanban (mobile) / table (desktop)
// WCAG 2.1 AA, keyboard navigation, live regions
// =============================================================================

import React, { useState, useEffect, useCallback, useId } from 'react';
import type {
  ModerationQueueItem,
  ModerationDecision,
  ViolationType,
  ProductStatus,
} from '../../types';
import { AiStatusBadge } from '../catalog/AiStatusBadge';

// ---------------------------------------------------------------------------
// Skeleton row
// ---------------------------------------------------------------------------

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="px-4 py-3"><div className="w-12 h-12 bg-gray-200 rounded-lg" /></td>
      <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-3/4" /></td>
      <td className="px-4 py-3"><div className="h-6 bg-gray-200 rounded w-24" /></td>
      <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-16" /></td>
      <td className="px-4 py-3"><div className="h-8 bg-gray-200 rounded w-28" /></td>
    </tr>
  );
}

// ---------------------------------------------------------------------------
// Violation highlight panel
// ---------------------------------------------------------------------------

interface ViolationPanelProps {
  violations: ViolationType[];
  aiScore?: number;
  primaryImageUrl?: string;
}

const VIOLATION_LABELS: Record<ViolationType, string> = {
  COUNTERFEIT: 'Hàng giả',
  PROHIBITED_ITEM: 'Hàng cấm',
  MISLEADING_DESCRIPTION: 'Mô tả gây nhầm lẫn',
  MISSING_LABEL_INFO: 'Thiếu thông tin nhãn',
  DANGEROUS_PRODUCT: 'Sản phẩm nguy hiểm',
  PRICE_MANIPULATION: 'Thao túng giá',
  COPYRIGHT_INFRINGEMENT: 'Vi phạm bản quyền',
  ADULT_CONTENT: 'Nội dung không phù hợp',
  OCR_LABEL_MISMATCH: 'Nhãn không khớp',
};

function ViolationPanel({ violations, aiScore, primaryImageUrl }: ViolationPanelProps) {
  return (
    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl space-y-3">
      {primaryImageUrl && (
        <div className="relative">
          <img
            src={primaryImageUrl}
            alt="Ảnh sản phẩm vi phạm"
            className="w-full h-40 object-cover rounded-lg"
            loading="lazy"
          />
          {/* In production: render bounding boxes here */}
          {violations.length > 0 && (
            <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full font-bold">
              {violations.length} vi phạm
            </div>
          )}
        </div>
      )}

      {aiScore !== undefined && (
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-600">Điểm vi phạm AI:</span>
          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${aiScore < 0.3 ? 'bg-green-500' : aiScore < 0.7 ? 'bg-yellow-500' : 'bg-red-500'}`}
              style={{ width: `${aiScore * 100}%` }}
            />
          </div>
          <span className="font-mono font-semibold text-red-600">{(aiScore * 100).toFixed(0)}%</span>
        </div>
      )}

      {violations.length > 0 && (
        <ul className="space-y-1" aria-label="Danh sách vi phạm">
          {violations.map((v) => (
            <li key={v} className="flex items-center gap-2 text-xs text-red-700">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0" aria-hidden="true" />
              {VIOLATION_LABELS[v]}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Decision Modal
// ---------------------------------------------------------------------------

interface DecisionModalProps {
  item: ModerationQueueItem;
  onDecide: (decision: ModerationDecision) => Promise<void>;
  onClose: () => void;
}

function DecisionModal({ item, onDecide, onClose }: DecisionModalProps) {
  const [action, setAction] = useState<'APPROVE' | 'REJECT' | 'SUSPEND'>('APPROVE');
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [reviewStartedAt] = useState(new Date());
  const modalId = useId();

  const handleDecide = async () => {
    setIsLoading(true);
    try {
      await onDecide({
        productId: item.productId,
        action,
        reason: reason.trim() || undefined,
        reviewerId: 'current-admin', // Replace with actual admin ID from auth context
      });
      onClose();
    } catch (err) {
      console.error('Decision failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Trap focus in modal
  useEffect(() => {
    const el = document.getElementById(modalId);
    el?.focus();
  }, [modalId]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${modalId}-title`}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        id={modalId}
        tabIndex={-1}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto outline-none"
      >
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 id={`${modalId}-title`} className="text-base font-bold text-gray-800">
              Phán quyết kiểm duyệt
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Đóng"
            >
              ✕
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-1 line-clamp-1">{item.productName}</p>
        </div>

        <div className="p-5 space-y-5">
          {/* AI score panel */}
          {(item.violations.length > 0 || item.aiScore !== undefined) && (
            <ViolationPanel
              violations={item.violations}
              aiScore={item.aiScore}
              primaryImageUrl={item.primaryImageUrl}
            />
          )}

          {/* Action selection */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3" id="action-label">
              Quyết định
            </p>
            <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-labelledby="action-label">
              {([
                { value: 'APPROVE', label: '✓ Duyệt', color: 'border-green-500 bg-green-50 text-green-700' },
                { value: 'REJECT', label: '✕ Từ chối', color: 'border-red-500 bg-red-50 text-red-700' },
                { value: 'SUSPEND', label: '⊘ Đình chỉ', color: 'border-purple-500 bg-purple-50 text-purple-700' },
              ] as const).map(({ value, label, color }) => (
                <label key={value} className={`
                  flex items-center justify-center p-3 border-2 rounded-xl cursor-pointer
                  min-h-[44px] text-sm font-medium transition-colors
                  ${action === value ? color : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}
                `}>
                  <input
                    type="radio"
                    name="action"
                    value={value}
                    checked={action === value}
                    onChange={() => setAction(value)}
                    className="sr-only"
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="reason">
              Ghi chú {action !== 'APPROVE' && <span className="text-red-500" aria-hidden="true">*</span>}
            </label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder={
                action === 'APPROVE'
                  ? 'Ghi chú không bắt buộc...'
                  : 'Giải thích lý do từ chối / đình chỉ...'
              }
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-sm resize-none"
              required={action !== 'APPROVE'}
            />
          </div>
        </div>

        <div className="p-5 border-t border-gray-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 min-h-[44px]"
          >
            Hủy
          </button>
          <button
            onClick={handleDecide}
            disabled={isLoading || (action !== 'APPROVE' && !reason.trim())}
            className={`
              flex-1 px-4 py-3 rounded-xl text-sm font-bold min-h-[44px] transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed
              ${action === 'APPROVE' ? 'bg-green-600 hover:bg-green-700 text-white' :
                action === 'REJECT' ? 'bg-red-600 hover:bg-red-700 text-white' :
                'bg-purple-600 hover:bg-purple-700 text-white'}
            `}
          >
            {isLoading ? '...' : action === 'APPROVE' ? '✓ Duyệt' : action === 'REJECT' ? '✕ Từ chối' : '⊘ Đình chỉ'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SLA countdown
// ---------------------------------------------------------------------------

function SlaCountdown({ deadline, isUrgent }: { deadline: string; isUrgent: boolean }) {
  const [remaining, setRemaining] = useState('');

  useEffect(() => {
    const update = () => {
      const diff = new Date(deadline).getTime() - Date.now();
      if (diff <= 0) { setRemaining('Quá hạn'); return; }
      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      setRemaining(`${h}g ${m}p`);
    };
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, [deadline]);

  return (
    <span className={`text-xs font-mono ${isUrgent ? 'text-red-600 font-bold animate-pulse' : 'text-gray-500'}`}>
      {isUrgent && '⚡ '}{remaining}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Main Table
// ---------------------------------------------------------------------------

interface ModerationQueueTableProps {
  items: ModerationQueueItem[];
  total: number;
  isLoading?: boolean;
  onDecide: (decision: ModerationDecision) => Promise<void>;
  onRefresh: () => void;
  onPageChange: (page: number) => void;
  currentPage: number;
  pageSize?: number;
  activeStatusFilter: ProductStatus[];
  onStatusFilterChange: (statuses: ProductStatus[]) => void;
}

const STATUS_FILTERS: { value: ProductStatus; label: string }[] = [
  { value: 'HUMAN_REVIEW', label: 'Cần xem xét' },
  { value: 'PENDING', label: 'Chờ AI' },
  { value: 'AI_APPROVED', label: 'AI duyệt' },
  { value: 'REJECTED', label: 'Từ chối' },
];

export function ModerationQueueTable({
  items,
  total,
  isLoading = false,
  onDecide,
  onRefresh,
  onPageChange,
  currentPage,
  pageSize = 20,
  activeStatusFilter,
  onStatusFilterChange,
}: ModerationQueueTableProps) {
  const [selectedItem, setSelectedItem] = useState<ModerationQueueItem | null>(null);
  const liveRegionId = useId();

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Live region for screen readers */}
      <div id={liveRegionId} role="status" aria-live="polite" className="sr-only">
        {isLoading ? 'Đang tải danh sách...' : `${total} sản phẩm cần duyệt`}
      </div>

      {/* Header */}
      <div className="px-4 sm:px-6 py-4 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div>
            <h2 className="text-base font-bold text-gray-800">Hàng đợi kiểm duyệt</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {total} sản phẩm • Cập nhật mỗi 30s
            </p>
          </div>

          <div className="flex items-center gap-2 sm:ml-auto">
            <button
              onClick={onRefresh}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
              aria-label="Làm mới danh sách"
            >
              ↻
            </button>
          </div>
        </div>

        {/* Status filter tabs */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1" role="group" aria-label="Lọc trạng thái">
          {STATUS_FILTERS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => onStatusFilterChange([value])}
              className={`
                px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors min-h-[44px] sm:min-h-0
                ${activeStatusFilter.includes(value)
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
              `}
              aria-pressed={activeStatusFilter.includes(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile: Card list */}
      <div className="sm:hidden divide-y divide-gray-100">
        {isLoading
          ? Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="p-4 animate-pulse space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            ))
          : items.map((item) => (
              <div key={item.productId} className="p-4 space-y-3">
                <div className="flex items-start gap-3">
                  {item.primaryImageUrl && (
                    <img
                      src={item.primaryImageUrl}
                      alt=""
                      className="w-14 h-14 object-cover rounded-xl flex-shrink-0"
                      loading="lazy"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-800 text-sm line-clamp-1">{item.productName}</p>
                    <p className="text-xs text-gray-500">{item.shopName}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <AiStatusBadge
                        status={item.status}
                        aiScore={item.aiScore}
                        violations={item.violations}
                        size="sm"
                      />
                      <SlaCountdown deadline={item.reviewDeadline} isUrgent={item.isUrgent} />
                    </div>
                  </div>
                </div>

                {item.status === 'HUMAN_REVIEW' && (
                  <button
                    onClick={() => setSelectedItem(item)}
                    className="w-full px-4 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold min-h-[44px] hover:bg-red-700 transition-colors"
                  >
                    Xem xét & Phán quyết
                  </button>
                )}
              </div>
            ))}
      </div>

      {/* Desktop: Table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full" role="grid">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Ảnh</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Sản phẩm</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Trạng thái</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">SLA</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide sr-only">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading
              ? Array.from({ length: 5 }, (_, i) => <SkeletonRow key={i} />)
              : items.map((item) => (
                  <tr key={item.productId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      {item.primaryImageUrl ? (
                        <img
                          src={item.primaryImageUrl}
                          alt=""
                          className="w-12 h-12 object-cover rounded-lg"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs">N/A</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800 text-sm">{item.productName}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{item.shopName}</p>
                    </td>
                    <td className="px-4 py-3">
                      <AiStatusBadge
                        status={item.status}
                        aiScore={item.aiScore}
                        violations={item.violations}
                        size="sm"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <SlaCountdown deadline={item.reviewDeadline} isUrgent={item.isUrgent} />
                    </td>
                    <td className="px-4 py-3">
                      {item.status === 'HUMAN_REVIEW' && (
                        <button
                          onClick={() => setSelectedItem(item)}
                          className="
                            px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold
                            hover:bg-red-700 transition-colors min-h-[44px] whitespace-nowrap
                          "
                        >
                          Phán quyết
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-500">
            Trang {currentPage}/{totalPages} · {total} kết quả
          </p>
          <div className="flex gap-1">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-600 disabled:opacity-40 hover:bg-gray-50 min-h-[44px] sm:min-h-0"
              aria-label="Trang trước"
            >
              ‹
            </button>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-600 disabled:opacity-40 hover:bg-gray-50 min-h-[44px] sm:min-h-0"
              aria-label="Trang tiếp"
            >
              ›
            </button>
          </div>
        </div>
      )}

      {/* Decision modal */}
      {selectedItem && (
        <DecisionModal
          item={selectedItem}
          onDecide={onDecide}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}

export default ModerationQueueTable;
