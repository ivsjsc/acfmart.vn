import { Loader2, Receipt } from "lucide-react"
import { formatCurrency } from "../../../../lib/format"
import { useFeeBreakdown } from "../../../../hooks/use-seller-finance"

export function FeeBreakdownTable({ range }: { range: { from: Date; to: Date } }) {
  const fees = useFeeBreakdown(range)
  const rows = fees.data ?? []
  const total = rows.reduce((s, r) => s + r.amount, 0)

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-neutral-100 p-4">
        <div className="flex items-center gap-2 text-base font-bold text-neutral-900">
          <Receipt size={16} className="text-brand-red-500" />
          Chi tiết phí dịch vụ
        </div>
        <div className="text-xs text-neutral-500">
          Tổng: <strong className="text-brand-red-600">{formatCurrency(total)}</strong>
        </div>
      </div>

      {fees.isLoading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="animate-spin text-neutral-400" size={20} />
        </div>
      ) : total === 0 ? (
        <div className="py-12 text-center text-sm text-neutral-500">
          Không có phí nào trong khoảng thời gian này.
        </div>
      ) : (
        <table className="min-w-full divide-y divide-neutral-100 text-sm">
          <thead className="bg-neutral-50 text-xs uppercase tracking-wider text-neutral-500">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Loại phí</th>
              <th className="px-4 py-3 text-right font-semibold">Số lần</th>
              <th className="px-4 py-3 text-right font-semibold">Tỉ trọng</th>
              <th className="px-4 py-3 text-right font-semibold">Số tiền</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {rows
              .filter((r) => r.amount > 0)
              .map((r) => (
                <tr key={r.type} className="hover:bg-neutral-50">
                  <td className="px-4 py-3 font-medium text-neutral-900">{r.label}</td>
                  <td className="px-4 py-3 text-right text-neutral-600">{r.count}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-neutral-100">
                        <div
                          className="h-full bg-brand-red-500"
                          style={{ width: `${r.percentage.toFixed(1)}%` }}
                        />
                      </div>
                      <span className="w-10 text-xs font-semibold text-neutral-600">
                        {r.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-rose-600">
                    {formatCurrency(r.amount)}
                  </td>
                </tr>
              ))}
          </tbody>
          <tfoot className="bg-neutral-50">
            <tr>
              <td colSpan={3} className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-neutral-500">
                Tổng phí
              </td>
              <td className="px-4 py-3 text-right text-base font-extrabold text-brand-red-600">
                {formatCurrency(total)}
              </td>
            </tr>
          </tfoot>
        </table>
      )}
    </div>
  )
}
