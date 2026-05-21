import { useEffect, useMemo, useState } from "react"
import { Download, Truck, Wallet, CircleCheckBig, AlertTriangle, Package, ArrowDownUp, Filter, type LucideIcon } from "lucide-react"
import { collection, onSnapshot, type Timestamp, type Unsubscribe } from "firebase/firestore"
import toast from "react-hot-toast"
import { firestore } from "../../../lib/firebase"
import { cn } from "../../../lib/cn"
import { formatCurrency, formatDateTime } from "../../../lib/format"
import {
  codReconciliationToCsv,
  deriveCodSettlementState,
  isCodOrder,
  summarizeCodOrders,
  type CodSettlementOrderRow,
  type CodSettlementState,
} from "../../../lib/cod-reconciliation"
import { useFirebaseAuthReady } from "../../../hooks/use-firebase-auth-ready"
import { useAuthStore } from "../../../stores/auth-store"

const STATE_LABEL: Record<CodSettlementState, string> = {
  pending: "Chờ đối soát",
  reconciled: "Đã đối soát",
  returned: "Đã trả hàng",
  compensation: "Bồi hoàn",
}

const STATE_TONE: Record<CodSettlementState, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  reconciled: "bg-emerald-50 text-emerald-700 border-emerald-200",
  returned: "bg-blue-50 text-blue-700 border-blue-200",
  compensation: "bg-rose-50 text-rose-700 border-rose-200",
}

type Scope = "all" | CodSettlementState

export function CodReconciliationScreen() {
  const user = useAuthStore((s) => s.user)
  const authReady = useFirebaseAuthReady()
  const [rows, setRows] = useState<CodSettlementOrderRow[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const [scope, setScope] = useState<Scope>("all")

  useEffect(() => {
    if (!authReady || !user) return

    const failureMessages = new Set<string>()
    const guard = (label: string) => (err: Error) => {
      console.error(`[CodReconciliation] ${label} subscription error:`, err)
      failureMessages.add(`${label}: ${err.message}`)
      setErrors(Array.from(failureMessages))
    }

    const unsubs: Unsubscribe[] = [
      onSnapshot(
        collection(firestore, "orders"),
        (snap) => {
          const codRows: CodSettlementOrderRow[] = []
          for (const docSnap of snap.docs) {
            const data = docSnap.data()
            if (!isCodOrder({
              paymentStatus: String(data.paymentStatus ?? ""),
              paymentMethod: String(data.paymentMethod ?? ""),
            })) {
              continue
            }

            codRows.push({
              id: docSnap.id,
              code: String(data.code ?? docSnap.id),
              shopName: String(data.shopName ?? "Shop"),
              customerName: String(data.customerName ?? data.shippingAddress?.name ?? "Khách hàng"),
              paymentStatus: String(data.paymentStatus ?? ""),
              paymentMethod: String(data.paymentMethod ?? ""),
              shippingStatusCode:
                typeof data.shippingStatusCode === "number" ? data.shippingStatusCode : undefined,
              shippingStatusText:
                typeof data.shippingStatusText === "string" ? data.shippingStatusText : undefined,
              shippingPickMoney: Number(data.shippingPickMoney ?? data.codFee ?? data.total ?? 0),
              shippingProviderName:
                typeof data.shippingProviderName === "string"
                  ? data.shippingProviderName
                  : undefined,
              shippingProviderId:
                typeof data.shippingProviderId === "string" ? data.shippingProviderId : undefined,
              trackingNumber:
                typeof data.trackingNumber === "string" ? data.trackingNumber : undefined,
              status: String(data.status ?? ""),
              updatedAt: (data.updated_at ?? data.updatedAt) as Timestamp | undefined,
              createdAt: (data.created_at ?? data.createdAt) as Timestamp | undefined,
            })
          }

          codRows.sort((left, right) => {
            const leftMs = left.updatedAt?.toMillis?.() ?? left.createdAt?.toMillis?.() ?? 0
            const rightMs = right.updatedAt?.toMillis?.() ?? right.createdAt?.toMillis?.() ?? 0
            return rightMs - leftMs
          })
          setRows(codRows)
        },
        guard("orders"),
      ),
    ]

    return () => {
      for (const unsub of unsubs) unsub()
    }
  }, [authReady, user])

  const summary = useMemo(() => summarizeCodOrders(rows), [rows])
  const filteredRows = useMemo(() => {
    if (scope === "all") return rows
    return rows.filter((row) => deriveCodSettlementState(row.shippingStatusCode) === scope)
  }, [rows, scope])

  const handleExport = () => {
    if (filteredRows.length === 0) {
      toast.error("Không có dữ liệu để xuất")
      return
    }
    const csv = codReconciliationToCsv(filteredRows)
    const filename = `cod-reconciliation-${new Date().toISOString().slice(0, 10)}.csv`
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success("Đã xuất danh sách COD")
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Đối soát COD</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Theo dõi tiền thu hộ GHTK, trạng thái đối soát và các trường hợp trả hàng/bồi hoàn.
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
        <MetricCard
          label="Tổng COD"
          value={summary.totalOrders.toLocaleString("vi-VN")}
          icon={Package}
        />
        <MetricCard
          label="Chờ đối soát"
          value={summary.pendingOrders.toLocaleString("vi-VN")}
          icon={AlertTriangle}
          tone="amber"
        />
        <MetricCard
          label="Đã đối soát"
          value={summary.reconciledOrders.toLocaleString("vi-VN")}
          icon={CircleCheckBig}
          tone="emerald"
        />
        <MetricCard
          label="Trả hàng"
          value={summary.returnedOrders.toLocaleString("vi-VN")}
          icon={Truck}
          tone="blue"
        />
        <MetricCard
          label="Bồi hoàn"
          value={summary.compensationOrders.toLocaleString("vi-VN")}
          icon={Wallet}
          tone="rose"
        />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-4">
        <InfoCard label="Tiền chờ đối soát" value={summary.pendingAmount} tone="amber" />
        <InfoCard label="Tiền đã đối soát" value={summary.reconciledAmount} tone="emerald" />
        <InfoCard label="Tiền trả hàng" value={summary.returnedAmount} tone="blue" />
        <InfoCard label="Tiền bồi hoàn" value={summary.compensationAmount} tone="rose" />
      </div>

      <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
            <ArrowDownUp size={16} className="text-brand-red-500" />
            Danh sách COD
          </div>
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-neutral-500" />
            <select
              value={scope}
              onChange={(e) => setScope(e.target.value as Scope)}
              className="input h-9 text-xs"
            >
              <option value="all">Tất cả</option>
              <option value="pending">Chờ đối soát</option>
              <option value="reconciled">Đã đối soát</option>
              <option value="returned">Đã trả hàng</option>
              <option value="compensation">Bồi hoàn</option>
            </select>
          </div>
        </div>

        <p className="mt-2 text-xs text-neutral-500">
          Quy ước: 6 = đối soát xong, 11 = đối soát công nợ trả hàng, 13 = bồi hoàn, 20/21 = trả hàng.
        </p>

        <div className="mt-4 overflow-x-auto">
          {filteredRows.length === 0 ? (
            <div className="py-12 text-center text-sm text-neutral-500">
              Chưa có đơn COD phù hợp bộ lọc.
            </div>
          ) : (
            <table className="min-w-full divide-y divide-neutral-100 text-sm">
              <thead className="bg-neutral-50 text-xs uppercase tracking-wider text-neutral-500">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Đơn</th>
                  <th className="px-4 py-3 text-left font-semibold">Shop</th>
                  <th className="px-4 py-3 text-left font-semibold">COD</th>
                  <th className="px-4 py-3 text-left font-semibold">Trạng thái</th>
                  <th className="px-4 py-3 text-left font-semibold">Vận đơn</th>
                  <th className="px-4 py-3 text-left font-semibold">Cập nhật</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 bg-white">
                {filteredRows.map((row) => {
                  const state = deriveCodSettlementState(row.shippingStatusCode)
                  return (
                    <tr key={row.id} className="hover:bg-neutral-50">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-neutral-900">{row.code}</div>
                        <div className="text-xs text-neutral-500">{row.customerName}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-neutral-700">{row.shopName}</td>
                      <td className="px-4 py-3 font-semibold text-rose-600">
                        {formatCurrency(row.shippingPickMoney)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider",
                            STATE_TONE[state],
                          )}
                        >
                          {STATE_LABEL[state]}
                        </span>
                        {row.shippingStatusText && (
                          <div className="mt-1 text-xs text-neutral-500">
                            {row.shippingStatusText}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-neutral-600">
                        <div>{row.shippingProviderName ?? "GHTK"}</div>
                        <div className="font-mono text-[11px] text-neutral-400">
                          {row.trackingNumber ?? "Chưa có vận đơn"}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-neutral-500">
                        {row.updatedAt?.toDate?.()
                          ? formatDateTime(row.updatedAt.toDate())
                          : row.createdAt?.toDate?.()
                            ? formatDateTime(row.createdAt.toDate())
                            : "—"}
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
  const toneClasses: Record<"neutral" | "emerald" | "rose" | "blue" | "amber", string> = {
    neutral: "bg-neutral-100 text-neutral-600",
    emerald: "bg-emerald-50 text-emerald-600",
    rose: "bg-rose-50 text-rose-600",
    blue: "bg-blue-50 text-blue-600",
    amber: "bg-amber-50 text-amber-600",
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs text-neutral-500">{label}</p>
          <p className="mt-1 text-2xl font-bold text-neutral-900">{value}</p>
        </div>
        <div className={cn("rounded-lg p-2", toneClasses[tone])}>
          <Icon size={18} />
        </div>
      </div>
    </div>
  )
}

function InfoCard({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone: "neutral" | "emerald" | "rose" | "blue" | "amber"
}) {
  const toneClasses: Record<"neutral" | "emerald" | "rose" | "blue" | "amber", string> = {
    neutral: "text-neutral-900",
    emerald: "text-emerald-600",
    rose: "text-rose-600",
    blue: "text-blue-600",
    amber: "text-amber-600",
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4">
      <p className="text-xs text-neutral-500">{label}</p>
      <p className={cn("mt-1 text-xl font-bold", toneClasses[tone])}>
        {formatCurrency(value)}
      </p>
    </div>
  )
}
