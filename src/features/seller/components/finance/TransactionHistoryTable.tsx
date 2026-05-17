import { useMemo, useState } from "react"
import { Download, Filter, Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import toast from "react-hot-toast"
import { formatCurrency, formatDateTime } from "../../../../lib/format"
import { cn } from "../../../../lib/cn"
import { useTransactionHistory } from "../../../../hooks/use-seller-finance"
import type {
  TransactionChannel,
  TransactionDoc,
  TransactionType,
} from "../../finance-types"

const TYPE_LABEL: Record<TransactionType, string> = {
  order_revenue: "Doanh thu đơn",
  commission: "Phí hoa hồng",
  payment_gateway: "Phí thanh toán",
  ads_charge: "Phí quảng cáo",
  livestream_fee: "Phí livestream",
  refund: "Hoàn tiền",
  adjustment: "Điều chỉnh",
  payout: "Chi trả",
}

const TYPE_TONE: Record<TransactionType, string> = {
  order_revenue: "bg-emerald-50 text-emerald-700",
  commission: "bg-rose-50 text-rose-700",
  payment_gateway: "bg-rose-50 text-rose-700",
  ads_charge: "bg-amber-50 text-amber-700",
  livestream_fee: "bg-amber-50 text-amber-700",
  refund: "bg-rose-50 text-rose-700",
  adjustment: "bg-neutral-100 text-neutral-700",
  payout: "bg-blue-50 text-blue-700",
}

const CHANNEL_LABEL: Record<TransactionChannel, string> = {
  online: "Online",
  store: "Cửa hàng",
  cloud: "Cloud",
  live: "Livestream",
}

const PAGE_SIZE = 20

export function TransactionHistoryTable() {
  const [typeFilter, setTypeFilter] = useState<TransactionType | "all">("all")
  const [channelFilter, setChannelFilter] = useState<TransactionChannel | "all">("all")
  const [fromInput, setFromInput] = useState("")
  const [toInput, setToInput] = useState("")
  const [page, setPage] = useState(0)

  const filters = useMemo(
    () => ({
      type: typeFilter === "all" ? undefined : typeFilter,
      channel: channelFilter === "all" ? undefined : channelFilter,
      from: fromInput ? new Date(fromInput) : undefined,
      to: toInput ? new Date(`${toInput}T23:59:59`) : undefined,
      limit: 500,
    }),
    [typeFilter, channelFilter, fromInput, toInput],
  )

  const tx = useTransactionHistory(filters)

  const rows = tx.data ?? []
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
  const pageRows = rows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const handleExport = () => {
    if (rows.length === 0) {
      toast.error("Không có giao dịch để xuất")
      return
    }
    const csv = transactionsToCsv(rows)
    downloadCsv(csv, `transactions-${new Date().toISOString().slice(0, 10)}.csv`)
    toast.success(`Đã xuất ${rows.length} giao dịch`)
  }

  return (
    <div className="card overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 p-4">
        <div className="flex items-center gap-2 text-base font-bold text-neutral-900">
          <Filter size={16} className="text-brand-red-500" />
          Lịch sử giao dịch
        </div>
        <button onClick={handleExport} className="btn-secondary text-xs">
          <Download size={14} />
          Xuất CSV
        </button>
      </div>

      {/* Filters */}
      <div className="grid gap-2 border-b border-neutral-100 bg-neutral-50 p-4 md:grid-cols-4">
        <select
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value as TransactionType | "all")
            setPage(0)
          }}
          className="input text-sm"
        >
          <option value="all">Tất cả loại</option>
          {Object.entries(TYPE_LABEL).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <select
          value={channelFilter}
          onChange={(e) => {
            setChannelFilter(e.target.value as TransactionChannel | "all")
            setPage(0)
          }}
          className="input text-sm"
        >
          <option value="all">Tất cả kênh</option>
          {Object.entries(CHANNEL_LABEL).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={fromInput}
          onChange={(e) => {
            setFromInput(e.target.value)
            setPage(0)
          }}
          className="input text-sm"
          placeholder="Từ ngày"
        />
        <input
          type="date"
          value={toInput}
          onChange={(e) => {
            setToInput(e.target.value)
            setPage(0)
          }}
          className="input text-sm"
          placeholder="Đến ngày"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {tx.isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="animate-spin text-neutral-400" size={20} />
          </div>
        ) : rows.length === 0 ? (
          <div className="py-12 text-center text-sm text-neutral-500">
            Chưa có giao dịch nào trong khoảng thời gian này.
          </div>
        ) : (
          <table className="min-w-full divide-y divide-neutral-100 text-sm">
            <thead className="bg-neutral-50 text-xs uppercase tracking-wider text-neutral-500">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Thời gian</th>
                <th className="px-4 py-3 text-left font-semibold">Loại</th>
                <th className="px-4 py-3 text-left font-semibold">Mô tả</th>
                <th className="px-4 py-3 text-left font-semibold">Đơn / Kênh</th>
                <th className="px-4 py-3 text-right font-semibold">Số tiền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 bg-white">
              {pageRows.map((row) => (
                <TransactionRow key={row.id} row={row} />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {rows.length > PAGE_SIZE && (
        <div className="flex items-center justify-between border-t border-neutral-100 p-3 text-xs text-neutral-600">
          <div>
            Trang <strong>{page + 1}</strong> / {totalPages} ({rows.length} giao dịch)
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="rounded-md p-1.5 hover:bg-neutral-100 disabled:opacity-30"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="rounded-md p-1.5 hover:bg-neutral-100 disabled:opacity-30"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function TransactionRow({ row }: { row: TransactionDoc }) {
  const isIncome = row.amount > 0
  return (
    <tr className="hover:bg-neutral-50">
      <td className="whitespace-nowrap px-4 py-3 text-xs text-neutral-600">
        {formatDateTime(row.occurredAt.toDate())}
      </td>
      <td className="px-4 py-3">
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
            TYPE_TONE[row.type],
          )}
        >
          {TYPE_LABEL[row.type]}
        </span>
      </td>
      <td className="px-4 py-3 text-neutral-900">{row.description}</td>
      <td className="px-4 py-3 text-xs text-neutral-500">
        {row.orderCode && <code className="font-mono">{row.orderCode}</code>}
        {row.orderCode && row.channel && <span className="mx-1">·</span>}
        {row.channel && <span>{CHANNEL_LABEL[row.channel]}</span>}
      </td>
      <td
        className={cn(
          "whitespace-nowrap px-4 py-3 text-right font-bold",
          isIncome ? "text-emerald-600" : "text-rose-600",
        )}
      >
        {isIncome ? "+" : ""}
        {formatCurrency(row.amount)}
      </td>
    </tr>
  )
}

function transactionsToCsv(rows: TransactionDoc[]): string {
  const header = [
    "Thời gian",
    "Loại",
    "Mô tả",
    "Mã đơn",
    "Kênh",
    "Danh mục",
    "Số tiền (VND)",
  ]
  const lines = rows.map((r) =>
    [
      r.occurredAt.toDate().toISOString(),
      TYPE_LABEL[r.type],
      escapeCsv(r.description),
      r.orderCode ?? "",
      r.channel ? CHANNEL_LABEL[r.channel] : "",
      r.category ?? "",
      r.amount.toString(),
    ].join(","),
  )
  // BOM for Excel UTF-8 recognition
  return "﻿" + [header.join(","), ...lines].join("\n")
}

function escapeCsv(s: string): string {
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

function downloadCsv(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
