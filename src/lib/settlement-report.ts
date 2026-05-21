import type { SellerBalanceDoc, TransactionDoc, TransactionType } from "../features/seller/finance-types"

const HOLD_RELEASE_PREFIX = "Giải phóng hold tự động"

export interface SettlementBalanceSnapshot {
  availableBalance: number
  pendingBalance: number
  holdBalance: number
  refundLiabilityBalance: number
}

export interface SettlementSnapshotSummary {
  periodStart: Date
  periodEnd: Date
  transactionCount: number
  payoutCount: number
  revenue: number
  commissionFee: number
  paymentGatewayFee: number
  adsFee: number
  livestreamFee: number
  refunds: number
  payouts: number
  manualAdjustments: number
  holdReleased: number
  netMovement: number
  openingNetBalance: number
  closingNetBalance: number
  balance: SettlementBalanceSnapshot
}

function toNumber(value: unknown): number {
  const num = typeof value === "number" ? value : Number(value)
  return Number.isFinite(num) ? num : 0
}

function sumAbsByType(rows: TransactionDoc[], type: TransactionType): number {
  return rows
    .filter((row) => row.type === type)
    .reduce((sum, row) => sum + Math.abs(toNumber(row.amount)), 0)
}

function isHoldRelease(row: TransactionDoc): boolean {
  return row.type === "adjustment" && row.description.includes(HOLD_RELEASE_PREFIX)
}

export function buildSettlementSnapshotSummary(input: {
  from: Date
  to: Date
  transactions: TransactionDoc[]
  balance: SellerBalanceDoc | null
}): SettlementSnapshotSummary {
  const transactions = [...input.transactions].sort(
    (left, right) => left.occurredAt.toMillis() - right.occurredAt.toMillis(),
  )

  const revenue = sumAbsByType(transactions, "order_revenue")
  const commissionFee = sumAbsByType(transactions, "commission")
  const paymentGatewayFee = sumAbsByType(transactions, "payment_gateway")
  const adsFee = sumAbsByType(transactions, "ads_charge")
  const livestreamFee = sumAbsByType(transactions, "livestream_fee")
  const refunds = sumAbsByType(transactions, "refund")
  const payouts = sumAbsByType(transactions, "payout")
  const holdReleased = transactions
    .filter(isHoldRelease)
    .reduce((sum, row) => sum + Math.abs(toNumber(row.amount)), 0)
  const manualAdjustments = transactions
    .filter((row) => row.type === "adjustment" && !isHoldRelease(row))
    .reduce((sum, row) => sum + toNumber(row.amount), 0)

  const netMovement =
    revenue -
    commissionFee -
    paymentGatewayFee -
    adsFee -
    livestreamFee -
    refunds -
    payouts +
    manualAdjustments

  const balanceSnapshot: SettlementBalanceSnapshot = {
    availableBalance: toNumber(input.balance?.availableBalance),
    pendingBalance: toNumber(input.balance?.pendingBalance),
    holdBalance: toNumber(input.balance?.holdBalance),
    refundLiabilityBalance: toNumber(input.balance?.refundLiabilityBalance),
  }

  const closingNetBalance =
    balanceSnapshot.availableBalance +
    balanceSnapshot.pendingBalance +
    balanceSnapshot.holdBalance -
    balanceSnapshot.refundLiabilityBalance
  const openingNetBalance = closingNetBalance - netMovement

  return {
    periodStart: input.from,
    periodEnd: input.to,
    transactionCount: transactions.length,
    payoutCount: transactions.filter((row) => row.type === "payout").length,
    revenue,
    commissionFee,
    paymentGatewayFee,
    adsFee,
    livestreamFee,
    refunds,
    payouts,
    manualAdjustments,
    holdReleased,
    netMovement,
    openingNetBalance,
    closingNetBalance,
    balance: balanceSnapshot,
  }
}

function escapeCsv(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

function formatNumber(value: number): string {
  return Math.round(value).toString()
}

export function settlementSnapshotToCsv(summary: SettlementSnapshotSummary): string {
  const rows: Array<[string, string]> = [
    ["Kỳ báo cáo", `${summary.periodStart.toISOString()} → ${summary.periodEnd.toISOString()}`],
    ["Số giao dịch", formatNumber(summary.transactionCount)],
    ["Số payout", formatNumber(summary.payoutCount)],
    ["Doanh thu phát sinh", formatNumber(summary.revenue)],
    ["Phí hoa hồng", formatNumber(summary.commissionFee)],
    ["Phí cổng thanh toán", formatNumber(summary.paymentGatewayFee)],
    ["Phí quảng cáo", formatNumber(summary.adsFee)],
    ["Phí livestream", formatNumber(summary.livestreamFee)],
    ["Tổng phí", formatNumber(summary.commissionFee + summary.paymentGatewayFee + summary.adsFee + summary.livestreamFee)],
    ["Hoàn tiền", formatNumber(summary.refunds)],
    ["Chi trả seller", formatNumber(summary.payouts)],
    ["Điều chỉnh thủ công", formatNumber(summary.manualAdjustments)],
    ["Giải phóng hold tự động", formatNumber(summary.holdReleased)],
    ["Dòng ròng trong kỳ", formatNumber(summary.netMovement)],
    ["Số dư ròng đầu kỳ", formatNumber(summary.openingNetBalance)],
    ["Số dư ròng cuối kỳ", formatNumber(summary.closingNetBalance)],
    ["Khả dụng hiện tại", formatNumber(summary.balance.availableBalance)],
    ["Đang chờ", formatNumber(summary.balance.pendingBalance)],
    ["Đang giữ", formatNumber(summary.balance.holdBalance)],
    ["Nghĩa vụ hoàn tiền", formatNumber(summary.balance.refundLiabilityBalance)],
  ]

  const header = ["Hạng mục", "Giá trị"]
  const lines = rows.map(([label, value]) => `${escapeCsv(label)},${escapeCsv(value)}`)
  return "\ufeff" + [header.join(","), ...lines].join("\n")
}
