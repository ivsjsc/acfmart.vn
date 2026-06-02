export function formatCurrency(amount: number, currency = "VND"): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("vi-VN").format(value)
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d)
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  const diff = Date.now() - d.getTime()
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour

  if (diff < minute) return "vừa xong"
  if (diff < hour) return `${Math.floor(diff / minute)} phút trước`
  if (diff < day) return `${Math.floor(diff / hour)} giờ trước`
  if (diff < 7 * day) return `${Math.floor(diff / day)} ngày trước`
  return formatDateTime(d)
}

/**
 * Khoảng thời gian đã trôi qua, không có hậu tố "trước".
 * VD: "vừa xong", "5 phút", "3 giờ", "2 ngày", "3 tuần", "2 tháng".
 * Dùng cho badge "Chờ X" trong hàng đợi kiểm duyệt.
 */
export function formatDuration(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  const diff = Date.now() - d.getTime()
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  const week = 7 * day
  const month = 30 * day

  if (diff < minute) return "vừa xong"
  if (diff < hour) return `${Math.floor(diff / minute)} phút`
  if (diff < day) return `${Math.floor(diff / hour)} giờ`
  if (diff < week) return `${Math.floor(diff / day)} ngày`
  if (diff < month) return `${Math.floor(diff / week)} tuần`
  return `${Math.floor(diff / month)} tháng`
}

/** Số ngày (thập phân) đã trôi qua kể từ `date`. */
export function getElapsedDays(date: Date | string): number {
  const d = typeof date === "string" ? new Date(date) : date
  return (Date.now() - d.getTime()) / 86_400_000
}
