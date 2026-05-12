// =============================================================================
// AiStatusBadge — Product moderation status indicator
// WCAG 2.1 AA: uses both color AND icon/text (not color-only)
// Touch target ≥44px for mobile
// =============================================================================

import React, { useState } from 'react';
import type { ProductStatus, ViolationType } from '../../types';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

interface StatusConfig {
  label: string;
  labelVi: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  dotColor: string;
  icon: string;
  ariaLabel: string;
}

const STATUS_CONFIG: Record<ProductStatus, StatusConfig> = {
  DRAFT: {
    label: 'Draft',
    labelVi: 'Bản nháp',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-600',
    borderColor: 'border-gray-300',
    dotColor: 'bg-gray-400',
    icon: '○',
    ariaLabel: 'Sản phẩm đang ở trạng thái bản nháp',
  },
  PENDING: {
    label: 'Pending',
    labelVi: 'Chờ quét AI',
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-700',
    borderColor: 'border-yellow-300',
    dotColor: 'bg-yellow-400',
    icon: '⏳',
    ariaLabel: 'Sản phẩm đang chờ quét AI',
  },
  AI_APPROVED: {
    label: 'AI Approved',
    labelVi: 'AI duyệt',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    borderColor: 'border-emerald-300',
    dotColor: 'bg-emerald-500',
    icon: '✓',
    ariaLabel: 'Sản phẩm được AI duyệt tự động',
  },
  HUMAN_REVIEW: {
    label: 'Human Review',
    labelVi: 'Chờ kiểm tra',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-700',
    borderColor: 'border-orange-300',
    dotColor: 'bg-orange-400',
    icon: '👤',
    ariaLabel: 'Sản phẩm cần kiểm tra thủ công',
  },
  APPROVED: {
    label: 'Approved',
    labelVi: 'Đã duyệt',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    borderColor: 'border-green-300',
    dotColor: 'bg-green-500',
    icon: '✓',
    ariaLabel: 'Sản phẩm đã được duyệt',
  },
  REJECTED: {
    label: 'Rejected',
    labelVi: 'Từ chối',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    borderColor: 'border-red-300',
    dotColor: 'bg-red-500',
    icon: '✕',
    ariaLabel: 'Sản phẩm bị từ chối',
  },
  SUSPENDED: {
    label: 'Suspended',
    labelVi: 'Đình chỉ',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-300',
    dotColor: 'bg-purple-500',
    icon: '⊘',
    ariaLabel: 'Sản phẩm bị đình chỉ',
  },
};

const VIOLATION_LABELS: Record<ViolationType, string> = {
  COUNTERFEIT: 'Hàng giả',
  PROHIBITED_ITEM: 'Hàng cấm',
  MISLEADING_DESCRIPTION: 'Mô tả gây nhầm lẫn',
  MISSING_LABEL_INFO: 'Thiếu thông tin nhãn (NĐ 43/2017)',
  DANGEROUS_PRODUCT: 'Sản phẩm nguy hiểm',
  PRICE_MANIPULATION: 'Thao túng giá',
  COPYRIGHT_INFRINGEMENT: 'Vi phạm bản quyền',
  ADULT_CONTENT: 'Nội dung không phù hợp',
  OCR_LABEL_MISMATCH: 'Nhãn không khớp mô tả',
};

// ---------------------------------------------------------------------------
// Tooltip
// ---------------------------------------------------------------------------

interface TooltipProps {
  aiScore?: number;
  violations: ViolationType[];
  statusReason?: string;
  fromCache?: boolean;
}

function StatusTooltip({ aiScore, violations, statusReason, fromCache }: TooltipProps) {
  return (
    <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 rounded-lg bg-gray-900 text-white text-xs p-3 shadow-xl pointer-events-none">
      {/* Arrow */}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />

      {aiScore !== undefined && (
        <div className="flex items-center gap-2 mb-2">
          <span className="text-gray-400">Điểm tin cậy AI:</span>
          <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                aiScore < 0.3 ? 'bg-emerald-400' :
                aiScore < 0.7 ? 'bg-yellow-400' : 'bg-red-400'
              }`}
              style={{ width: `${(1 - aiScore) * 100}%` }}
            />
          </div>
          <span className={aiScore < 0.3 ? 'text-emerald-400' : aiScore < 0.7 ? 'text-yellow-400' : 'text-red-400'}>
            {((1 - aiScore) * 100).toFixed(0)}%
          </span>
        </div>
      )}

      {violations.length > 0 && (
        <div className="mb-2">
          <p className="text-gray-400 mb-1">Vi phạm phát hiện:</p>
          <ul className="space-y-0.5">
            {violations.map((v) => (
              <li key={v} className="flex items-center gap-1.5 text-red-300">
                <span>•</span>
                <span>{VIOLATION_LABELS[v]}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {statusReason && (
        <div className="pt-2 border-t border-gray-700 text-gray-300">
          <span className="text-gray-400">Lý do: </span>{statusReason}
        </div>
      )}

      {fromCache && (
        <div className="mt-1.5 text-gray-500 text-[10px]">⚡ Từ cache</div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Badge Component
// ---------------------------------------------------------------------------

export interface AiStatusBadgeProps {
  status: ProductStatus;
  aiScore?: number;
  violations?: ViolationType[];
  statusReason?: string;
  fromCache?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  animate?: boolean;      // Pulse animation for PENDING
}

export function AiStatusBadge({
  status,
  aiScore,
  violations = [],
  statusReason,
  fromCache,
  size = 'md',
  showLabel = true,
  animate = true,
}: AiStatusBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const config = STATUS_CONFIG[status];

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2',
  };

  const dotSizeClasses = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  };

  const hasTooltipContent = aiScore !== undefined || violations.length > 0 || statusReason;

  return (
    <div className="relative inline-flex">
      <button
        type="button"
        className={`
          inline-flex items-center font-medium rounded-full border cursor-default
          min-h-[44px] sm:min-h-0
          ${sizeClasses[size]}
          ${config.bgColor} ${config.textColor} ${config.borderColor}
          ${hasTooltipContent ? 'cursor-help' : ''}
          transition-colors
        `}
        aria-label={config.ariaLabel}
        aria-describedby={hasTooltipContent ? `tooltip-${status}` : undefined}
        onMouseEnter={() => hasTooltipContent && setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => hasTooltipContent && setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
      >
        {/* Dot indicator */}
        <span
          className={`
            rounded-full flex-shrink-0
            ${dotSizeClasses[size]} ${config.dotColor}
            ${animate && status === 'PENDING' ? 'animate-pulse' : ''}
          `}
          aria-hidden="true"
        />

        {/* Icon (always shown for screen readers / color-blind) */}
        <span aria-hidden="true">{config.icon}</span>

        {showLabel && <span>{config.labelVi}</span>}

        {violations.length > 0 && (
          <span
            className="ml-0.5 bg-red-500 text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center font-bold"
            aria-label={`${violations.length} vi phạm`}
          >
            {violations.length}
          </span>
        )}
      </button>

      {showTooltip && hasTooltipContent && (
        <StatusTooltip
          aiScore={aiScore}
          violations={violations}
          statusReason={statusReason}
          fromCache={fromCache}
        />
      )}
    </div>
  );
}

export default AiStatusBadge;
