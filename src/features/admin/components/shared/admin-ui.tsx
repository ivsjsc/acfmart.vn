import type { ReactNode } from "react"
import { Search, X, Clock, AlertTriangle, RefreshCw } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "../../../../lib/cn"
import { formatDuration, getElapsedDays } from "../../../../lib/format"

/** Ô tìm kiếm admin có icon + nút xoá nhanh. Parent tự debounce giá trị. */
export function AdminSearchInput({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  className?: string
}) {
  return (
    <div className={cn("relative", className)}>
      <Search
        size={14}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-neutral-200 py-2 pl-9 pr-8 text-sm outline-none focus:border-brand-red-300 focus:ring-1 focus:ring-brand-red-200"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Xoá tìm kiếm"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
}

export interface FilterTab<T> {
  value: T
  label: string
  count?: number
}

/** Hàng tab lọc dạng pill, badge đếm số tuỳ chọn. */
export function FilterTabs<T>({
  tabs,
  value,
  onChange,
}: {
  tabs: FilterTab<T>[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="flex gap-1 overflow-x-auto">
      {tabs.map((tab) => {
        const active = Object.is(tab.value, value)
        return (
          <button
            key={tab.label}
            onClick={() => onChange(tab.value)}
            className={cn(
              "flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              active
                ? "bg-brand-red-50 text-brand-red-700"
                : "text-neutral-600 hover:bg-neutral-100"
            )}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                  active
                    ? "bg-brand-red-200 text-brand-red-800"
                    : "bg-neutral-200 text-neutral-700"
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

/** Ô thống kê, có thể bấm để dùng làm bộ lọc nhanh. */
export function StatTile({
  label,
  value,
  color,
  icon: Icon,
  onClick,
  active,
}: {
  label: string
  value: number | string
  color: string
  icon?: LucideIcon
  onClick?: () => void
  active?: boolean
}) {
  const Tag = onClick ? "button" : "div"
  return (
    <Tag
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-xl border bg-white p-4 text-left transition-all",
        onClick && "hover:-translate-y-0.5 hover:shadow-sm",
        active ? "border-brand-red-300 ring-2 ring-brand-red-100" : "border-neutral-200"
      )}
    >
      {Icon && (
        <div className={cn("rounded-lg p-2", color)}>
          <Icon size={18} />
        </div>
      )}
      <div className="min-w-0">
        <p className="truncate text-xs text-neutral-500">{label}</p>
        <p
          className={cn(
            "mt-0.5 text-lg font-bold",
            Icon ? "text-neutral-900" : cn("inline-flex rounded-md px-2 py-0.5", color)
          )}
        >
          {typeof value === "number" ? value.toLocaleString("vi-VN") : value}
        </p>
      </div>
    </Tag>
  )
}

/** Badge thời gian chờ, tô màu theo mức độ vượt SLA. */
export function WaitingBadge({
  since,
  slaDays = 2,
  prefix = "Chờ",
}: {
  since: Date | null | undefined
  slaDays?: number
  prefix?: string
}) {
  if (!since) return null
  const days = getElapsedDays(since)
  let cls = "bg-emerald-50 text-emerald-700"
  if (days >= slaDays) cls = "bg-rose-50 text-rose-700"
  else if (days >= slaDays / 2) cls = "bg-amber-50 text-amber-700"
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
        cls
      )}
      title={since.toLocaleString("vi-VN")}
    >
      <Clock size={10} />
      {prefix} {formatDuration(since)}
    </span>
  )
}

/** Thanh hành động hàng loạt, hiện khi có mục được chọn. */
export function BulkActionBar({
  count,
  onClear,
  children,
}: {
  count: number
  onClear: () => void
  children: ReactNode
}) {
  if (count === 0) return null
  return (
    <div className="sticky bottom-4 z-20 mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-neutral-200 bg-white p-3 shadow-lg">
      <span className="text-sm font-semibold text-neutral-900">
        Đã chọn {count} mục
      </span>
      <button
        onClick={onClear}
        className="text-xs font-medium text-neutral-500 hover:text-neutral-700"
      >
        Bỏ chọn
      </button>
      <div className="ml-auto flex flex-wrap gap-2">{children}</div>
    </div>
  )
}

/** Trạng thái rỗng cho danh sách. */
export function AdminEmptyState({
  icon: Icon,
  title,
  hint,
}: {
  icon: LucideIcon
  title: string
  hint?: string
}) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white py-16 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100">
        <Icon className="text-neutral-400" size={20} />
      </div>
      <p className="mt-3 text-sm text-neutral-500">{title}</p>
      {hint && <p className="mt-1 text-xs text-neutral-400">{hint}</p>}
    </div>
  )
}

/** Trạng thái lỗi kèm nút thử lại. */
export function AdminErrorState({
  title,
  message,
  onRetry,
}: {
  title: string
  message: string
  onRetry: () => void
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4">
      <AlertTriangle className="mt-0.5 shrink-0 text-rose-600" size={18} />
      <div className="flex-1">
        <p className="text-sm font-semibold text-rose-900">{title}</p>
        <p className="mt-1 text-xs text-rose-700">{message}</p>
        <button
          onClick={onRetry}
          className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-rose-300 bg-white px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-100"
        >
          <RefreshCw size={12} />
          Thử lại
        </button>
      </div>
    </div>
  )
}

/** Placeholder cho panel chi tiết khi chưa chọn mục nào (desktop). */
export function DetailEmptyHint({
  icon: Icon,
  text,
}: {
  icon: LucideIcon
  text: string
}) {
  return (
    <div className="flex h-full min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-neutral-200 bg-white/60 p-8 text-center">
      <Icon className="text-neutral-300" size={32} />
      <p className="mt-3 max-w-[220px] text-sm text-neutral-400">{text}</p>
    </div>
  )
}
