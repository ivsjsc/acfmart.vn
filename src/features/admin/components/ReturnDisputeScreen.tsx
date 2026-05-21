import { useEffect, useMemo, useState } from "react"
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  type Timestamp,
  type Unsubscribe,
} from "firebase/firestore"
import { httpsCallable } from "firebase/functions"
import type { LucideIcon } from "lucide-react"
import {
  Download,
  Loader2,
  RefreshCw,
  Search,
  CheckCircle2,
  Clock3,
  RotateCcw,
  Wallet,
  FileText,
  ShieldAlert,
} from "lucide-react"
import toast from "react-hot-toast"
import { firestore, functions } from "../../../lib/firebase"
import { cn } from "../../../lib/cn"
import { formatCurrency } from "../../../lib/format"
import { useAuthStore } from "../../../stores/auth-store"
import { useFirebaseAuthReady } from "../../../hooks/use-firebase-auth-ready"

type ReturnRequestStatus = "pending" | "approved" | "refunded" | string
type ReturnRequestRefundMethod = "wallet" | "bank" | "exchange" | string

interface ReturnRequestRow {
  id: string
  orderId: string
  orderCode: string
  customerId: string
  customerEmail?: string | null
  shopId?: string | null
  shopName?: string | null
  reason: string
  reasonLabel: string
  refundMethod: ReturnRequestRefundMethod
  refundAmount: number
  status: ReturnRequestStatus
  description?: string | null
  photos?: string[]
  providerRefundStatus?: string | null
  providerRefundId?: string | null
  refundTransactionId?: string | null
  approvedBy?: string | null
  approvedAt?: Timestamp | null
  refundedAt?: Timestamp | null
  created_at?: Timestamp | null
  updated_at?: Timestamp | null
  note?: string | null
}

const DISPLAY_FILTERS = [
  { id: "all", label: "Tất cả" },
  { id: "pending", label: "Chờ duyệt" },
  { id: "approved", label: "Đang xử lý" },
  { id: "refunded", label: "Đã hoàn" },
  { id: "exchange", label: "Đổi hàng" },
] as const

type DisplayFilter = (typeof DISPLAY_FILTERS)[number]["id"]

function normalizeDisplayStatus(row: ReturnRequestRow): DisplayFilter {
  if (row.refundMethod === "exchange") return "exchange"
  if (row.status === "refunded" || row.providerRefundStatus === "completed") return "refunded"
  if (
    row.providerRefundStatus === "pending_provider" ||
    row.providerRefundStatus === "processing_provider" ||
    row.providerRefundStatus === "processing"
  ) {
    return "approved"
  }
  if (row.status === "approved") return "approved"
  return "pending"
}

function escapeCsv(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

function toIso(value?: Timestamp | null): string {
  return value?.toDate?.().toISOString?.() ?? ""
}

export function ReturnDisputeScreen() {
  const user = useAuthStore((s) => s.user)
  const authReady = useFirebaseAuthReady()
  const [rows, setRows] = useState<ReturnRequestRow[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const [filter, setFilter] = useState<DisplayFilter>("all")
  const [search, setSearch] = useState("")
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    if (!authReady || !user) return

    const failureMessages = new Set<string>()
    const guard = (label: string) => (err: Error) => {
      console.error(`[ReturnDispute] ${label} subscription error:`, err)
      failureMessages.add(`${label}: ${err.message}`)
      setErrors(Array.from(failureMessages))
    }

    const unsubs: Unsubscribe[] = [
      onSnapshot(
        query(collection(firestore, "returnRequests"), orderBy("created_at", "desc")),
        (snap) => {
          const nextRows = snap.docs.map((docSnap) => {
            const data = docSnap.data() as Record<string, unknown>
            return {
              id: docSnap.id,
              orderId: String(data.orderId ?? ""),
              orderCode: String(data.orderCode ?? docSnap.id),
              customerId: String(data.customerId ?? ""),
              customerEmail: typeof data.customerEmail === "string" ? data.customerEmail : null,
              shopId: typeof data.shopId === "string" ? data.shopId : null,
              shopName: typeof data.shopName === "string" ? data.shopName : null,
              reason: String(data.reason ?? ""),
              reasonLabel: String(data.reasonLabel ?? ""),
              refundMethod: String(data.refundMethod ?? "wallet"),
              refundAmount: Number(data.refundAmount ?? 0),
              status: String(data.status ?? "pending"),
              description: typeof data.description === "string" ? data.description : null,
              photos: Array.isArray(data.photos) ? data.photos.filter((value) => typeof value === "string") : [],
              providerRefundStatus:
                typeof data.providerRefundStatus === "string" ? data.providerRefundStatus : null,
              providerRefundId:
                typeof data.providerRefundId === "string" ? data.providerRefundId : null,
              refundTransactionId:
                typeof data.refundTransactionId === "string" ? data.refundTransactionId : null,
              approvedBy: typeof data.approvedBy === "string" ? data.approvedBy : null,
              approvedAt: data.approvedAt as Timestamp | null | undefined,
              refundedAt: data.refundedAt as Timestamp | null | undefined,
              created_at: data.created_at as Timestamp | null | undefined,
              updated_at: data.updated_at as Timestamp | null | undefined,
              note: typeof data.note === "string" ? data.note : null,
            } satisfies ReturnRequestRow
          })
          setRows(nextRows)
        },
        guard("returnRequests"),
      ),
    ]

    return () => {
      for (const unsub of unsubs) unsub()
    }
  }, [authReady, user])

  const summary = useMemo(() => {
    let total = 0
    let pending = 0
    let approved = 0
    let refunded = 0
    let exchange = 0
    let pendingAmount = 0
    let approvedAmount = 0
    let refundedAmount = 0
    let exchangeAmount = 0

    for (const row of rows) {
      const amount = Math.max(0, Math.round(row.refundAmount || 0))
      total += 1
      const state = normalizeDisplayStatus(row)
      if (state === "pending") {
        pending += 1
        pendingAmount += amount
      } else if (state === "approved") {
        approved += 1
        approvedAmount += amount
      } else if (state === "refunded") {
        refunded += 1
        refundedAmount += amount
      } else if (state === "exchange") {
        exchange += 1
        exchangeAmount += amount
      }
    }

    return {
      total,
      pending,
      approved,
      refunded,
      exchange,
      pendingAmount,
      approvedAmount,
      refundedAmount,
      exchangeAmount,
    }
  }, [rows])

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase()
    return rows.filter((row) => {
      if (filter !== "all" && normalizeDisplayStatus(row) !== filter) return false
      if (!q) return true
      return (
        row.orderCode.toLowerCase().includes(q) ||
        row.customerEmail?.toLowerCase().includes(q) ||
        row.shopName?.toLowerCase().includes(q) ||
        row.reasonLabel.toLowerCase().includes(q) ||
        row.reason.toLowerCase().includes(q)
      )
    })
  }, [filter, rows, search])

  const handleExport = () => {
    if (filteredRows.length === 0) {
      toast.error("Không có dữ liệu để xuất")
      return
    }
    const header = [
      "Mã yêu cầu",
      "Mã đơn",
      "Khách",
      "Shop",
      "Lý do",
      "Hình thức hoàn",
      "Số tiền",
      "Trạng thái",
      "Trạng thái cổng",
      "Cập nhật",
    ]
    const lines = filteredRows.map((row) =>
      [
        row.id,
        row.orderCode,
        row.customerEmail ?? row.customerId,
        row.shopName ?? row.shopId ?? "",
        row.reasonLabel || row.reason,
        row.refundMethod,
        Math.round(row.refundAmount).toString(),
        row.status,
        row.providerRefundStatus ?? "",
        toIso(row.updated_at ?? row.approvedAt ?? row.refundedAt ?? row.created_at),
      ]
        .map((value) => escapeCsv(value))
        .join(",")
    )
    const csv = "\ufeff" + [header.join(","), ...lines].join("\n")
    const filename = `return-disputes-${new Date().toISOString().slice(0, 10)}.csv`
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success("Đã xuất danh sách tranh chấp")
  }

  const processReturnRefund = httpsCallable<
    { returnRequestId: string; note?: string },
    { status: string; refundMethod: string; refundAmount: number }
  >(functions, "processReturnRefund")

  async function handleProcess(row: ReturnRequestRow) {
    const note = window.prompt("Ghi chú xử lý", "Duyệt từ admin")?.trim()
    if (note === null) return

    setProcessingId(row.id)
    try {
      const result = await processReturnRefund({
        returnRequestId: row.id,
        note: note || undefined,
      })
      const status = result.data.status
      toast.success(
        status === "refunded"
          ? "Đã xử lý hoàn tiền"
          : status === "pending_provider"
            ? "Yêu cầu hoàn tiền đã được ghi nhận và chờ cổng xử lý"
            : "Đã cập nhật yêu cầu"
      )
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không thể xử lý yêu cầu")
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Trả hàng & hoàn tiền</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Đối soát yêu cầu hoàn tiền, bồi hoàn, đổi hàng và các case chờ xử lý qua ledger nội bộ.
          </p>
        </div>
        <button onClick={handleExport} className="btn-secondary text-xs">
          <Download size={14} />
          Xuất CSV
        </button>
      </div>

      {errors.length > 0 && (
        <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <strong className="block text-rose-900">Một vài nguồn dữ liệu không tải được</strong>
          <ul className="mt-1 list-inside list-disc text-xs">
            {errors.map((err) => (
              <li key={err}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Tổng yêu cầu" value={summary.total.toLocaleString("vi-VN")} icon={FileText} />
        <MetricCard label="Chờ duyệt" value={summary.pending.toLocaleString("vi-VN")} icon={Clock3} tone="amber" />
        <MetricCard label="Đang xử lý" value={summary.approved.toLocaleString("vi-VN")} icon={RotateCcw} tone="blue" />
        <MetricCard label="Đã hoàn" value={summary.refunded.toLocaleString("vi-VN")} icon={CheckCircle2} tone="emerald" />
        <MetricCard label="Đổi hàng" value={summary.exchange.toLocaleString("vi-VN")} icon={Wallet} tone="rose" />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-4">
        <InfoCard label="Tiền chờ duyệt" value={summary.pendingAmount} tone="amber" />
        <InfoCard label="Tiền đang xử lý" value={summary.approvedAmount} tone="blue" />
        <InfoCard label="Tiền đã hoàn" value={summary.refundedAmount} tone="emerald" />
        <InfoCard label="Đổi hàng" value={summary.exchangeAmount} tone="rose" />
      </div>

      <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
            <ShieldAlert size={16} className="text-brand-red-500" />
            Danh sách yêu cầu
          </div>
          <div className="flex items-center gap-2">
            <Search size={14} className="text-neutral-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Mã đơn, shop, khách, lý do..."
              className="input h-9 w-64 text-xs"
            />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as DisplayFilter)}
              className="input h-9 text-xs"
            >
              {DISPLAY_FILTERS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          {filteredRows.length === 0 ? (
            <div className="py-12 text-center text-sm text-neutral-500">
              Chưa có yêu cầu phù hợp bộ lọc.
            </div>
          ) : (
            <table className="min-w-full divide-y divide-neutral-100 text-sm">
              <thead className="bg-neutral-50 text-xs uppercase tracking-wider text-neutral-500">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Yêu cầu</th>
                  <th className="px-4 py-3 text-left font-semibold">Đơn / Shop</th>
                  <th className="px-4 py-3 text-left font-semibold">Lý do</th>
                  <th className="px-4 py-3 text-left font-semibold">Số tiền</th>
                  <th className="px-4 py-3 text-left font-semibold">Trạng thái</th>
                  <th className="px-4 py-3 text-left font-semibold">Cập nhật</th>
                  <th className="px-4 py-3 text-left font-semibold">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 bg-white">
                {filteredRows.map((row) => {
                  const state = normalizeDisplayStatus(row)
                  return (
                    <tr key={row.id} className="hover:bg-neutral-50">
                      <td className="px-4 py-3">
                        <div className="font-mono text-xs font-semibold text-neutral-900">
                          {row.id}
                        </div>
                        <div className="text-xs text-neutral-500">
                          {row.customerEmail ?? row.customerId}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-neutral-900">{row.orderCode}</div>
                        <div className="text-xs text-neutral-500">
                          {row.shopName ?? row.shopId ?? "—"}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-neutral-700">
                        <div className="font-medium text-neutral-900">
                          {row.reasonLabel || row.reason}
                        </div>
                        {row.description && (
                          <div className="mt-1 max-w-[280px] text-xs text-neutral-500">
                            {row.description}
                          </div>
                        )}
                        {row.photos?.length ? (
                          <div className="mt-1 text-xs text-brand-red-700">
                            {row.photos.length} ảnh minh chứng
                          </div>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 font-semibold text-rose-600">
                        {formatCurrency(row.refundAmount)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <span
                            className={cn(
                              "inline-flex w-fit rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider",
                              state === "pending"
                                ? "border-amber-200 bg-amber-50 text-amber-700"
                                : state === "approved"
                                  ? "border-blue-200 bg-blue-50 text-blue-700"
                                  : state === "refunded"
                                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                    : "border-rose-200 bg-rose-50 text-rose-700"
                            )}
                          >
                            {state === "pending"
                              ? "Chờ duyệt"
                              : state === "approved"
                                ? "Đang xử lý"
                                : state === "refunded"
                                  ? "Đã hoàn"
                                  : "Đổi hàng"}
                          </span>
                          {row.providerRefundStatus && (
                            <span className="inline-flex w-fit rounded-full bg-neutral-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-600">
                              {row.providerRefundStatus}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-neutral-500">
                        {formatRelativeTime(
                          toDate(row.updated_at ?? row.approvedAt ?? row.refundedAt ?? row.created_at)
                            ?? new Date()
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            disabled={processingId === row.id || state === "refunded"}
                            onClick={() => handleProcess(row)}
                            className="btn-primary text-xs disabled:opacity-60"
                          >
                            {processingId === row.id ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <RefreshCw size={14} />
                            )}
                            Xử lý
                          </button>
                          {row.refundTransactionId && (
                            <span className="inline-flex items-center rounded-full bg-neutral-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-600">
                              Mã xử lý: {row.refundTransactionId}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

function MetricCard({
  label,
  value,
  icon: Icon,
  tone = "neutral",
}: {
  label: string
  value: string
  icon: LucideIcon
  tone?: "neutral" | "emerald" | "rose" | "blue" | "amber"
}) {
  const tones: Record<"neutral" | "emerald" | "rose" | "blue" | "amber", string> = {
    neutral: "bg-neutral-100 text-neutral-600",
    emerald: "bg-emerald-50 text-emerald-600",
    rose: "bg-rose-50 text-rose-600",
    blue: "bg-blue-50 text-blue-600",
    amber: "bg-amber-50 text-amber-600",
  }

  return (
    <div className="rounded-xl border border-neutral-100 bg-white p-3 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-wider text-neutral-500">{label}</p>
          <p className="mt-1 text-lg font-bold text-neutral-900">{value}</p>
        </div>
        <div className={cn("rounded-lg p-2", tones[tone])}>
          <Icon size={16} />
        </div>
      </div>
    </div>
  )
}

function InfoCard({
  label,
  value,
  tone = "neutral",
}: {
  label: string
  value: number
  tone: "neutral" | "emerald" | "rose" | "blue" | "amber"
}) {
  const classes: Record<"neutral" | "emerald" | "rose" | "blue" | "amber", string> = {
    neutral: "text-neutral-900",
    emerald: "text-emerald-600",
    rose: "text-rose-600",
    blue: "text-blue-600",
    amber: "text-amber-600",
  }

  return (
    <div className="rounded-xl border border-neutral-100 bg-white p-4 shadow-sm">
      <div className="text-[11px] uppercase tracking-wider text-neutral-500">{label}</div>
      <div className={cn("mt-1 text-lg font-bold", classes[tone])}>
        {formatCurrency(value)}
      </div>
    </div>
  )
}

function toDate(value?: Timestamp | null): Date | null {
  return value?.toDate?.() ?? null
}

function formatRelativeTime(date: Date): string {
  const diff = Date.now() - date.getTime()
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  if (diff < minute) return "vừa xong"
  if (diff < hour) return `${Math.floor(diff / minute)} phút`
  if (diff < day) return `${Math.floor(diff / hour)} giờ`
  if (diff < 7 * day) return `${Math.floor(diff / day)} ngày`
  return date.toLocaleDateString("vi-VN")
}
