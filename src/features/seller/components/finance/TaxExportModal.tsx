import { useState } from "react"
import { X, Download, Loader2, FileSpreadsheet, AlertCircle } from "lucide-react"
import toast from "react-hot-toast"
import { useTaxExport } from "../../../../hooks/use-seller-finance"
import type { TaxExportRow } from "../../finance-types"

type Period = "current_month" | "previous_month" | "current_quarter" | "previous_quarter" | "custom"

interface TaxExportModalProps {
  open: boolean
  onClose: () => void
  shopName: string
}

export function TaxExportModal({ open, onClose, shopName }: TaxExportModalProps) {
  const exporter = useTaxExport()
  const [period, setPeriod] = useState<Period>("current_month")
  const [customFrom, setCustomFrom] = useState("")
  const [customTo, setCustomTo] = useState("")
  const [format, setFormat] = useState<"csv" | "html">("csv")

  if (!open) return null

  const getRange = (): { from: Date; to: Date } | null => {
    const now = new Date()
    switch (period) {
      case "current_month": {
        const from = new Date(now.getFullYear(), now.getMonth(), 1)
        const to = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
        return { from, to }
      }
      case "previous_month": {
        const from = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        const to = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)
        return { from, to }
      }
      case "current_quarter": {
        const q = Math.floor(now.getMonth() / 3)
        const from = new Date(now.getFullYear(), q * 3, 1)
        const to = new Date(now.getFullYear(), q * 3 + 3, 0, 23, 59, 59)
        return { from, to }
      }
      case "previous_quarter": {
        const q = Math.floor(now.getMonth() / 3) - 1
        const year = q < 0 ? now.getFullYear() - 1 : now.getFullYear()
        const adjustedQ = q < 0 ? 3 : q
        const from = new Date(year, adjustedQ * 3, 1)
        const to = new Date(year, adjustedQ * 3 + 3, 0, 23, 59, 59)
        return { from, to }
      }
      case "custom": {
        if (!customFrom || !customTo) return null
        return {
          from: new Date(customFrom),
          to: new Date(`${customTo}T23:59:59`),
        }
      }
    }
  }

  const handleExport = async () => {
    const range = getRange()
    if (!range) {
      toast.error("Vui lòng chọn khoảng thời gian.")
      return
    }
    try {
      const rows = await exporter.mutateAsync(range)
      if (rows.length === 0) {
        toast.error("Không có hoá đơn nào trong khoảng thời gian này.")
        return
      }
      const periodLabel = formatPeriodLabel(range)
      if (format === "csv") {
        const csv = rowsToCsv(rows)
        downloadFile(csv, `tax-report-${periodLabel}.csv`, "text/csv;charset=utf-8")
      } else {
        const html = rowsToHtmlReport(rows, shopName, periodLabel)
        downloadFile(html, `tax-report-${periodLabel}.html`, "text/html;charset=utf-8")
      }
      toast.success(`Đã xuất báo cáo ${rows.length} hoá đơn`)
      onClose()
    } catch (err) {
      toast.error("Không xuất được báo cáo. Vui lòng thử lại.")
      console.error(err)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-2 md:items-center md:p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-neutral-100 p-4">
          <h2 className="flex items-center gap-2 text-lg font-bold text-neutral-900">
            <FileSpreadsheet size={18} className="text-brand-red-500" />
            Xuất báo cáo thuế
          </h2>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-neutral-100">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 p-5">
          {/* Period */}
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-neutral-500">
              Kỳ báo cáo
            </label>
            <div className="grid grid-cols-2 gap-2">
              <PeriodChip value="current_month" current={period} onChange={setPeriod} label="Tháng này" />
              <PeriodChip value="previous_month" current={period} onChange={setPeriod} label="Tháng trước" />
              <PeriodChip value="current_quarter" current={period} onChange={setPeriod} label="Quý này" />
              <PeriodChip value="previous_quarter" current={period} onChange={setPeriod} label="Quý trước" />
              <PeriodChip
                value="custom"
                current={period}
                onChange={setPeriod}
                label="Tuỳ chọn"
                className="col-span-2"
              />
            </div>
            {period === "custom" && (
              <div className="mt-2 grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  className="input text-sm"
                />
                <input
                  type="date"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                  className="input text-sm"
                />
              </div>
            )}
          </div>

          {/* Format */}
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-neutral-500">
              Định dạng
            </label>
            <div className="grid grid-cols-2 gap-2">
              <FormatChip value="csv" current={format} onChange={setFormat} label="CSV (Excel)" />
              <FormatChip value="html" current={format} onChange={setFormat} label="HTML (in PDF)" />
            </div>
          </div>

          <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            <div>
              Báo cáo chỉ bao gồm các hoá đơn đã <strong>phát hành</strong>. Hoá đơn nháp hoặc đã huỷ sẽ không được tính.
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-neutral-100 bg-neutral-50 p-4">
          <button onClick={onClose} className="btn-secondary text-sm">
            Huỷ
          </button>
          <button
            onClick={handleExport}
            disabled={exporter.isPending}
            className="btn-primary text-sm"
          >
            {exporter.isPending ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            Xuất báo cáo
          </button>
        </div>
      </div>
    </div>
  )
}

function PeriodChip({
  value,
  current,
  onChange,
  label,
  className,
}: {
  value: Period
  current: Period
  onChange: (v: Period) => void
  label: string
  className?: string
}) {
  const active = value === current
  return (
    <button
      onClick={() => onChange(value)}
      className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
        active
          ? "border-brand-red-500 bg-brand-red-50 font-semibold text-brand-red-700"
          : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"
      } ${className ?? ""}`}
    >
      {label}
    </button>
  )
}

function FormatChip({
  value,
  current,
  onChange,
  label,
}: {
  value: "csv" | "html"
  current: "csv" | "html"
  onChange: (v: "csv" | "html") => void
  label: string
}) {
  const active = value === current
  return (
    <button
      onClick={() => onChange(value)}
      className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
        active
          ? "border-brand-red-500 bg-brand-red-50 font-semibold text-brand-red-700"
          : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"
      }`}
    >
      {label}
    </button>
  )
}

function rowsToCsv(rows: TaxExportRow[]): string {
  const header = [
    "Số hoá đơn",
    "Ngày phát hành",
    "Tên người mua",
    "MST người mua",
    "Tiền hàng",
    "Tiền thuế GTGT",
    "Tổng tiền",
    "Hình thức thanh toán",
  ]
  const lines = rows.map((r) =>
    [
      r.invoiceNumber,
      r.issuedAt,
      escapeCsv(r.buyerName),
      r.buyerTaxCode,
      r.subtotal,
      r.vatAmount,
      r.total,
      escapeCsv(r.paymentMethod),
    ].join(","),
  )
  return "﻿" + [header.join(","), ...lines].join("\n")
}

function rowsToHtmlReport(rows: TaxExportRow[], shopName: string, periodLabel: string): string {
  const totalSubtotal = rows.reduce((s, r) => s + r.subtotal, 0)
  const totalVat = rows.reduce((s, r) => s + r.vatAmount, 0)
  const totalAmount = rows.reduce((s, r) => s + r.total, 0)
  const fmt = (n: number) => new Intl.NumberFormat("vi-VN").format(n)
  return `<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8">
<title>Báo cáo thuế ${periodLabel} - ${escapeHtml(shopName)}</title>
<style>
  body { font-family: system-ui, sans-serif; padding: 24px; color: #111; }
  h1 { margin: 0; font-size: 18px; }
  .meta { color: #666; margin-bottom: 16px; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th, td { padding: 6px 8px; border-bottom: 1px solid #e5e7eb; }
  th { background: #f9fafb; text-align: left; font-size: 11px; text-transform: uppercase; }
  .right { text-align: right; }
  tfoot td { font-weight: bold; background: #f9fafb; }
</style>
</head>
<body>
<h1>BÁO CÁO HOÁ ĐƠN GTGT - ${escapeHtml(shopName)}</h1>
<p class="meta">Kỳ: <strong>${periodLabel}</strong> · ${rows.length} hoá đơn</p>
<table>
  <thead>
    <tr>
      <th>Số HĐ</th><th>Ngày</th><th>Người mua</th><th>MST</th>
      <th class="right">Tiền hàng</th><th class="right">VAT</th><th class="right">Tổng</th><th>Thanh toán</th>
    </tr>
  </thead>
  <tbody>
    ${rows
      .map(
        (r) => `<tr>
      <td>${escapeHtml(r.invoiceNumber)}</td>
      <td>${escapeHtml(r.issuedAt)}</td>
      <td>${escapeHtml(r.buyerName)}</td>
      <td>${escapeHtml(r.buyerTaxCode)}</td>
      <td class="right">${fmt(r.subtotal)}</td>
      <td class="right">${fmt(r.vatAmount)}</td>
      <td class="right">${fmt(r.total)}</td>
      <td>${escapeHtml(r.paymentMethod)}</td>
    </tr>`,
      )
      .join("")}
  </tbody>
  <tfoot>
    <tr>
      <td colspan="4" class="right">Tổng cộng</td>
      <td class="right">${fmt(totalSubtotal)}</td>
      <td class="right">${fmt(totalVat)}</td>
      <td class="right">${fmt(totalAmount)}</td>
      <td></td>
    </tr>
  </tfoot>
</table>
</body>
</html>`
}

function formatPeriodLabel(range: { from: Date; to: Date }): string {
  const f = (d: Date) => `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`
  return `${f(range.from)}-${f(range.to)}`
}

function escapeCsv(s: string): string {
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => {
    switch (c) {
      case "&":
        return "&amp;"
      case "<":
        return "&lt;"
      case ">":
        return "&gt;"
      case '"':
        return "&quot;"
      case "'":
        return "&#39;"
      default:
        return c
    }
  })
}

function downloadFile(content: string, filename: string, mime: string): void {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
