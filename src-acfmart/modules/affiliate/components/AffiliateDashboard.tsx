// =============================================================================
// AffiliateDashboard — Mobile-first, dark mode support
// WCAG 2.1 AA: touch targets ≥44px, semantic structure, color+text indicators
// =============================================================================

import { useState, useEffect, useMemo } from 'react';
import type { AffiliateKpi, AffiliateChartPoint } from '../types';

interface DashboardData {
  kpi: AffiliateKpi;
  chart: AffiliateChartPoint[];
}

export interface AffiliateDashboardProps {
  affiliateId: string;
  data: DashboardData | null;
  loading?: boolean;
  onRequestPayout?: (amount: number) => void;
  onRangeChange?: (range: '7d' | '30d' | '90d') => void;
}

// ---------------------------------------------------------------------------
// Format helpers
// ---------------------------------------------------------------------------

function formatVnd(n: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);
}

function formatPercent(n: number): string {
  return `${(n * 100).toFixed(2)}%`;
}

// ---------------------------------------------------------------------------
// KPI Card
// ---------------------------------------------------------------------------

interface KpiCardProps {
  label: string;
  value: string;
  sublabel?: string;
  tone?: 'neutral' | 'positive' | 'warning' | 'danger';
  icon: string;
}

function KpiCard({ label, value, sublabel, tone = 'neutral', icon }: KpiCardProps) {
  const toneClasses = {
    neutral: 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700',
    positive: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
    warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
    danger: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
  };
  const valueColor = {
    neutral: 'text-gray-900 dark:text-gray-100',
    positive: 'text-emerald-700 dark:text-emerald-300',
    warning: 'text-yellow-700 dark:text-yellow-300',
    danger: 'text-red-700 dark:text-red-300',
  };
  return (
    <div className={`rounded-xl border p-4 ${toneClasses[tone]}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{label}</span>
        <span aria-hidden="true" className="text-lg">{icon}</span>
      </div>
      <div className={`text-xl sm:text-2xl font-bold ${valueColor[tone]}`}>{value}</div>
      {sublabel && (
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{sublabel}</div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Simple inline chart (SVG, no external dep)
// ---------------------------------------------------------------------------

function TrendChart({ data }: { data: AffiliateChartPoint[] }) {
  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
        Chưa có dữ liệu
      </div>
    );
  }

  const maxClicks = Math.max(...data.map((d) => d.clicks), 1);
  const maxConv = Math.max(...data.map((d) => d.conversions), 1);

  const W = 600, H = 180, P = 24;
  const xStep = (W - P * 2) / Math.max(data.length - 1, 1);
  const yClicks = (v: number) => H - P - ((v / maxClicks) * (H - P * 2));
  const yConv = (v: number) => H - P - ((v / maxConv) * (H - P * 2));

  const clicksPath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${P + i * xStep},${yClicks(d.clicks)}`).join(' ');
  const convPath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${P + i * xStep},${yConv(d.conversions)}`).join(' ');

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-48" role="img" aria-label="Biểu đồ click và conversion theo thời gian">
        {/* Grid */}
        {[0.25, 0.5, 0.75].map((g) => (
          <line key={g} x1={P} y1={P + g * (H - P * 2)} x2={W - P} y2={P + g * (H - P * 2)}
            stroke="currentColor" strokeOpacity="0.1" />
        ))}
        {/* Clicks line */}
        <path d={clicksPath} fill="none" stroke="#3b82f6" strokeWidth="2" />
        {/* Conversions line */}
        <path d={convPath} fill="none" stroke="#10b981" strokeWidth="2" />
        {/* Dots */}
        {data.map((d, i) => (
          <g key={d.date}>
            <circle cx={P + i * xStep} cy={yClicks(d.clicks)} r="3" fill="#3b82f6" />
            <circle cx={P + i * xStep} cy={yConv(d.conversions)} r="3" fill="#10b981" />
          </g>
        ))}
      </svg>
      <div className="flex gap-4 text-xs text-gray-600 dark:text-gray-400 mt-2 px-2">
        <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-blue-500" aria-hidden="true" />Click</span>
        <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-emerald-500" aria-hidden="true" />Conversion</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Dashboard
// ---------------------------------------------------------------------------

export function AffiliateDashboard({
  affiliateId,
  data,
  loading = false,
  onRequestPayout,
  onRangeChange,
}: AffiliateDashboardProps) {
  const [range, setRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    onRangeChange?.(range);
  }, [range, onRangeChange]);

  const kpi = data?.kpi;
  const chart = data?.chart ?? [];

  const canRequestPayout = useMemo(() => {
    return !!kpi && kpi.pendingCommission > 0;
  }, [kpi]);

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen pb-20 sm:pb-8">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
              Tổng quan Affiliate
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">ID: {affiliateId}</p>
          </div>
          <div className="flex gap-2" role="group" aria-label="Khoảng thời gian">
            {(['7d', '30d', '90d'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRange(r)}
                aria-pressed={range === r}
                className={`min-h-[44px] px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  range === r
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {r === '7d' ? '7 ngày' : r === '30d' ? '30 ngày' : '90 ngày'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {loading && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <span className="inline-block animate-spin">⏳</span> Đang tải...
          </div>
        )}

        {!loading && kpi && (
          <>
            {/* KPI Grid */}
            <section aria-labelledby="kpi-heading">
              <h2 id="kpi-heading" className="sr-only">Chỉ số chính</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <KpiCard
                  label="Tổng click"
                  value={kpi.clicks.toLocaleString('vi-VN')}
                  sublabel={`${kpi.uniqueClicks.toLocaleString('vi-VN')} unique`}
                  icon="👆"
                />
                <KpiCard
                  label="Conversion"
                  value={kpi.conversions.toLocaleString('vi-VN')}
                  sublabel={`Tỷ lệ: ${formatPercent(kpi.conversionRate)}`}
                  tone="positive"
                  icon="✓"
                />
                <KpiCard
                  label="Hoa hồng chờ"
                  value={formatVnd(kpi.pendingCommission)}
                  sublabel="Sẽ duyệt sau 7 ngày"
                  tone="warning"
                  icon="⏳"
                />
                <KpiCard
                  label="Đã thanh toán"
                  value={formatVnd(kpi.paidCommission)}
                  sublabel={kpi.reversedCommission > 0 ? `Reversed: ${formatVnd(kpi.reversedCommission)}` : undefined}
                  tone={kpi.reversedCommission > 0 ? 'danger' : 'positive'}
                  icon="💰"
                />
              </div>
            </section>

            {/* Chart */}
            <section
              aria-labelledby="chart-heading"
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6"
            >
              <h2 id="chart-heading" className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Xu hướng theo ngày
              </h2>
              <TrendChart data={chart} />
            </section>

            {/* Payout CTA */}
            <section
              aria-labelledby="payout-heading"
              className="bg-gradient-to-r from-blue-50 to-emerald-50 dark:from-blue-900/20 dark:to-emerald-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-4 sm:p-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h2 id="payout-heading" className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Yêu cầu rút tiền
                  </h2>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Khả dụng: <strong>{formatVnd(kpi.pendingCommission)}</strong>
                    {kpi.pendingCommission > 500_000 && (
                      <span className="ml-2 text-orange-700 dark:text-orange-300">
                        ⚠ &gt; 500k cần duyệt thủ công lần đầu
                      </span>
                    )}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={!canRequestPayout}
                  onClick={() => onRequestPayout?.(kpi.pendingCommission)}
                  className="min-h-[44px] px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors"
                >
                  Rút tiền
                </button>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default AffiliateDashboard;
