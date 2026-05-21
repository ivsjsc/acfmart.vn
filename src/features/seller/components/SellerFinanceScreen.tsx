import { useMemo, useState } from "react"
import { FileText, FileSpreadsheet, Sparkles } from "lucide-react"
import { Link } from "react-router-dom"
import { cn } from "../../../lib/cn"
import { useAuthStore } from "../../../stores/auth-store"
import { useMyVendor } from "../../../hooks/use-vendor"
import { PayoutScheduleCard } from "./finance/PayoutScheduleCard"
import { TransactionHistoryTable } from "./finance/TransactionHistoryTable"
import { RevenueBreakdownChart } from "./finance/RevenueBreakdownChart"
import { FeeBreakdownTable } from "./finance/FeeBreakdownTable"
import { VatInvoiceModal } from "./finance/VatInvoiceModal"
import { TaxExportModal } from "./finance/TaxExportModal"
import { SettlementSnapshotCard } from "./finance/SettlementSnapshotCard"

const RANGE_OPTIONS = [
  { id: "30d", label: "30 ngày" },
  { id: "90d", label: "90 ngày" },
  { id: "ytd", label: "Từ đầu năm" },
] as const
type RangeId = (typeof RANGE_OPTIONS)[number]["id"]

export default function SellerFinanceScreen() {
  const user = useAuthStore((s) => s.user)
  const vendorQuery = useMyVendor()
  const vendor = vendorQuery.data?.vendor

  const [range, setRange] = useState<RangeId>("30d")
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [showTaxModal, setShowTaxModal] = useState(false)

  const dateRange = useMemo(() => {
    const to = new Date()
    const from = new Date(to)
    if (range === "30d") from.setDate(to.getDate() - 30)
    else if (range === "90d") from.setDate(to.getDate() - 90)
    else from.setMonth(0, 1)
    from.setHours(0, 0, 0, 0)
    return { from, to }
  }, [range])

  const sellerInfo = {
    shopName: vendor?.shop_name ?? user?.name ?? "ACFMart Seller",
    taxCode: vendor?.tax_code ?? "",
    address: vendor?.pickup_address?.full_address ?? "",
  }

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 lg:text-3xl">Tài chính</h1>
          <p className="mt-1 text-sm text-neutral-600">
            Theo dõi doanh thu, phí dịch vụ, lịch chi trả và xuất hoá đơn VAT
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => setShowInvoiceModal(true)} className="btn-secondary text-xs">
            <FileText size={14} />
            Tạo hoá đơn VAT
          </button>
          <button onClick={() => setShowTaxModal(true)} className="btn-secondary text-xs">
            <FileSpreadsheet size={14} />
            Xuất báo cáo thuế
          </button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
        {/* Sidebar: payout */}
        <div className="space-y-5">
          <PayoutScheduleCard />

          <Link
            to="/aivy"
            className="card flex items-center justify-between p-4 hover:bg-neutral-50"
          >
            <div className="flex items-center gap-3">
              <Sparkles className="text-brand-gold-500" />
              <div>
                <div className="text-sm font-semibold text-neutral-900">Aivy có thể tư vấn tài chính</div>
                <div className="text-xs text-neutral-500">Hỏi Aivy cách giảm phí, tối ưu chi phí</div>
              </div>
            </div>
          </Link>
        </div>

        {/* Main: charts + tables */}
        <div className="space-y-5">
          {/* Range filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Khoảng:</span>
            <div className="flex rounded-lg bg-white p-1 shadow-sm ring-1 ring-neutral-200">
              {RANGE_OPTIONS.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setRange(r.id)}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
                    range === r.id
                      ? "bg-brand-red-500 text-white"
                      : "text-neutral-600 hover:bg-neutral-50",
                  )}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <RevenueBreakdownChart range={dateRange} />
          <SettlementSnapshotCard from={dateRange.from} to={dateRange.to} />
          <FeeBreakdownTable range={dateRange} />
          <TransactionHistoryTable />
        </div>
      </div>

      {/* Modals */}
      <VatInvoiceModal
        open={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        shopId={user?.id ?? ""}
        seller={sellerInfo}
      />
      <TaxExportModal
        open={showTaxModal}
        onClose={() => setShowTaxModal(false)}
        shopName={sellerInfo.shopName}
      />
    </div>
  )
}
