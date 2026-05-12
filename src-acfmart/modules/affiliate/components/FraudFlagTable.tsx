// =============================================================================
// FraudFlagTable — Admin oversight, block/unblock, export
// Mobile: card list. Desktop: table. WCAG 2.1 AA.
// =============================================================================

import { useState, useMemo } from 'react';
import type { FraudFlagType, FraudSeverity } from '../types';

export interface FraudFlagRow {
  id: string;
  type: FraudFlagType;
  severity: FraudSeverity;
  entityType: string;
  entityKey: string;
  reason: string;
  evidence: Record<string, unknown>;
  isBlocked: boolean;
  createdAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface FraudFlagTableProps {
  rows: FraudFlagRow[];
  total: number;
  page: number;
  pageSize: number;
  loading?: boolean;
  onPageChange?: (page: number) => void;
  onFilterChange?: (filters: { severity?: FraudSeverity[]; blocked?: boolean }) => void;
  onBlock?: (flagId: string) => Promise<void>;
  onUnblock?: (flagId: string) => Promise<void>;
  onExport?: () => Promise<void>;
}

const TYPE_LABEL: Record<FraudFlagType, string> = {
  CLICK_FLOOD: 'Click flood',
  DATACENTER_IP: 'IP datacenter',
  GEO_MISMATCH: 'Sai vùng địa lý',
  COOKIE_STUFFING: 'Cookie stuffing',
  SELF_AFFILIATE: 'Tự mua hàng',
  ZERO_CONVERSION_RATIO: 'Tỷ lệ chuyển đổi 0%',
  REFERRER_SPOOF: 'Referrer giả',
};

const SEVERITY_CONFIG: Record<FraudSeverity, { label: string; classes: string; dot: string }> = {
  LOW: { label: 'Thấp', classes: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300', dot: 'bg-gray-400' },
  MEDIUM: { label: 'Vừa', classes: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200', dot: 'bg-yellow-500' },
  HIGH: { label: 'Cao', classes: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200', dot: 'bg-orange-500' },
  CRITICAL: { label: 'Nghiêm trọng', classes: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200', dot: 'bg-red-600' },
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' });
}

function shortKey(key: string): string {
  if (key.length <= 16) return key;
  return `${key.slice(0, 8)}…${key.slice(-4)}`;
}

// ---------------------------------------------------------------------------
// Severity badge
// ---------------------------------------------------------------------------

function SeverityBadge({ severity }: { severity: FraudSeverity }) {
  const cfg = SEVERITY_CONFIG[severity];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.classes}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} aria-hidden="true" />
      {cfg.label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Row actions
// ---------------------------------------------------------------------------

function RowActions({ row, onBlock, onUnblock }: {
  row: FraudFlagRow;
  onBlock?: (id: string) => Promise<void>;
  onUnblock?: (id: string) => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);

  const handle = async (fn?: (id: string) => Promise<void>) => {
    if (!fn) return;
    setBusy(true);
    try { await fn(row.id); } finally { setBusy(false); }
  };

  return (
    <div className="flex gap-2 flex-wrap">
      {row.isBlocked ? (
        <button
          type="button"
          onClick={() => handle(onUnblock)}
          disabled={busy}
          className="min-h-[44px] px-3 py-1.5 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
        >
          Bỏ chặn
        </button>
      ) : (
        <button
          type="button"
          onClick={() => handle(onBlock)}
          disabled={busy}
          className="min-h-[44px] px-3 py-1.5 text-xs bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
        >
          Chặn
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Mobile card
// ---------------------------------------------------------------------------

function MobileCard({ row, onBlock, onUnblock }: { row: FraudFlagRow; onBlock?: FraudFlagTableProps['onBlock']; onUnblock?: FraudFlagTableProps['onUnblock'] }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">
            {TYPE_LABEL[row.type]}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {row.entityType} <span className="font-mono">{shortKey(row.entityKey)}</span>
          </div>
        </div>
        <SeverityBadge severity={row.severity} />
      </div>
      <p className="text-xs text-gray-700 dark:text-gray-300">{row.reason}</p>
      <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
        <span className="text-xs text-gray-500 dark:text-gray-400">{formatDate(row.createdAt)}</span>
        {row.isBlocked && (
          <span className="text-xs font-semibold text-red-700 dark:text-red-300">🚫 Đã chặn</span>
        )}
      </div>
      <RowActions row={row} onBlock={onBlock} onUnblock={onUnblock} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main table
// ---------------------------------------------------------------------------

export function FraudFlagTable({
  rows,
  total,
  page,
  pageSize,
  loading = false,
  onPageChange,
  onFilterChange,
  onBlock,
  onUnblock,
  onExport,
}: FraudFlagTableProps) {
  const [severityFilter, setSeverityFilter] = useState<FraudSeverity[]>([]);
  const [showBlockedOnly, setShowBlockedOnly] = useState<boolean | undefined>(undefined);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const toggleSeverity = (s: FraudSeverity) => {
    const next = severityFilter.includes(s)
      ? severityFilter.filter((x) => x !== s)
      : [...severityFilter, s];
    setSeverityFilter(next);
    onFilterChange?.({ severity: next.length ? next : undefined, blocked: showBlockedOnly });
  };

  const cycleBlocked = () => {
    const next = showBlockedOnly === undefined ? true : showBlockedOnly === true ? false : undefined;
    setShowBlockedOnly(next);
    onFilterChange?.({ severity: severityFilter.length ? severityFilter : undefined, blocked: next });
  };

  const blockedLabel = useMemo(() => {
    if (showBlockedOnly === true) return 'Đã chặn';
    if (showBlockedOnly === false) return 'Chưa chặn';
    return 'Tất cả';
  }, [showBlockedOnly]);

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Toolbar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
              Cảnh báo gian lận
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {total} flag · trang {page}/{totalPages}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={cycleBlocked}
              className="min-h-[44px] px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300"
            >
              {blockedLabel}
            </button>
            <button
              type="button"
              onClick={() => onExport?.()}
              className="min-h-[44px] px-4 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              📥 Xuất CSV
            </button>
          </div>
        </div>

        {/* Severity chips */}
        <div className="max-w-7xl mx-auto mt-3 flex gap-2 flex-wrap" role="group" aria-label="Lọc theo mức độ">
          {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => toggleSeverity(s)}
              aria-pressed={severityFilter.includes(s)}
              className={`min-h-[44px] px-3 py-1.5 text-xs rounded-full border transition-colors ${
                severityFilter.includes(s)
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {SEVERITY_CONFIG[s].label}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {loading && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <span className="inline-block animate-spin">⏳</span> Đang tải...
          </div>
        )}

        {!loading && rows.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            Không có cảnh báo nào khớp bộ lọc
          </div>
        )}

        {/* Mobile: card list */}
        {!loading && rows.length > 0 && (
          <div className="sm:hidden space-y-3">
            {rows.map((r) => (
              <MobileCard key={r.id} row={r} onBlock={onBlock} onUnblock={onUnblock} />
            ))}
          </div>
        )}

        {/* Desktop: table */}
        {!loading && rows.length > 0 && (
          <div className="hidden sm:block overflow-x-auto bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th scope="col" className="text-left px-4 py-3 font-medium text-gray-700 dark:text-gray-300">Loại</th>
                  <th scope="col" className="text-left px-4 py-3 font-medium text-gray-700 dark:text-gray-300">Mức độ</th>
                  <th scope="col" className="text-left px-4 py-3 font-medium text-gray-700 dark:text-gray-300">Thực thể</th>
                  <th scope="col" className="text-left px-4 py-3 font-medium text-gray-700 dark:text-gray-300">Lý do</th>
                  <th scope="col" className="text-left px-4 py-3 font-medium text-gray-700 dark:text-gray-300">Thời gian</th>
                  <th scope="col" className="text-left px-4 py-3 font-medium text-gray-700 dark:text-gray-300">Trạng thái</th>
                  <th scope="col" className="text-left px-4 py-3 font-medium text-gray-700 dark:text-gray-300">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{TYPE_LABEL[r.type]}</td>
                    <td className="px-4 py-3"><SeverityBadge severity={r.severity} /></td>
                    <td className="px-4 py-3">
                      <div className="text-xs text-gray-500 dark:text-gray-400">{r.entityType}</div>
                      <div className="font-mono text-xs text-gray-700 dark:text-gray-300">{shortKey(r.entityKey)}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300 max-w-xs">
                      <span className="line-clamp-2">{r.reason}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{formatDate(r.createdAt)}</td>
                    <td className="px-4 py-3">
                      {r.isBlocked ? (
                        <span className="text-xs font-semibold text-red-700 dark:text-red-300">🚫 Đã chặn</span>
                      ) : (
                        <span className="text-xs text-gray-500 dark:text-gray-400">Mở</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <RowActions row={r} onBlock={onBlock} onUnblock={onUnblock} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <nav aria-label="Điều hướng trang" className="flex justify-center items-center gap-2 mt-6">
            <button
              type="button"
              onClick={() => onPageChange?.(Math.max(1, page - 1))}
              disabled={page <= 1}
              className="min-h-[44px] px-3 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50"
            >
              ← Trước
            </button>
            <span className="text-sm text-gray-700 dark:text-gray-300 px-2">{page} / {totalPages}</span>
            <button
              type="button"
              onClick={() => onPageChange?.(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
              className="min-h-[44px] px-3 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50"
            >
              Sau →
            </button>
          </nav>
        )}
      </main>
    </div>
  );
}

export default FraudFlagTable;
