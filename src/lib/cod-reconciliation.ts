import type { Timestamp } from "firebase/firestore"

export type CodSettlementState = "pending" | "reconciled" | "returned" | "compensation"

export interface CodSettlementOrderRow {
  id: string
  code: string
  shopName: string
  customerName: string
  paymentStatus: string
  paymentMethod: string
  shippingStatusCode?: number
  shippingStatusText?: string
  shippingPickMoney: number
  shippingProviderName?: string
  shippingProviderId?: string
  trackingNumber?: string
  status: string
  updatedAt?: Timestamp
  createdAt?: Timestamp
}

export interface CodReconciliationSummary {
  totalOrders: number
  pendingOrders: number
  reconciledOrders: number
  returnedOrders: number
  compensationOrders: number
  totalAmount: number
  pendingAmount: number
  reconciledAmount: number
  returnedAmount: number
  compensationAmount: number
  rows: CodSettlementOrderRow[]
}

export const RECONCILED_CODES = new Set([6, 11])
export const RETURNED_CODES = new Set([20, 21])
export const COMPENSATION_CODES = new Set([13])

export function deriveCodSettlementState(statusCode?: number): CodSettlementState {
  if (statusCode != null && RECONCILED_CODES.has(statusCode)) return "reconciled"
  if (statusCode != null && RETURNED_CODES.has(statusCode)) return "returned"
  if (statusCode != null && COMPENSATION_CODES.has(statusCode)) return "compensation"
  return "pending"
}

export function isCodOrder(row: Pick<CodSettlementOrderRow, "paymentStatus" | "paymentMethod">): boolean {
  return String(row.paymentStatus).toLowerCase() === "cod" ||
    String(row.paymentMethod).toLowerCase() === "cod"
}

export function isPendingCodReconciliation(row: Pick<CodSettlementOrderRow, "paymentStatus" | "paymentMethod" | "shippingStatusCode">): boolean {
  if (!isCodOrder(row)) return false
  return deriveCodSettlementState(row.shippingStatusCode) === "pending"
}

export function summarizeCodOrders(rows: CodSettlementOrderRow[]): CodReconciliationSummary {
  let totalAmount = 0
  let pendingAmount = 0
  let reconciledAmount = 0
  let returnedAmount = 0
  let compensationAmount = 0
  let pendingOrders = 0
  let reconciledOrders = 0
  let returnedOrders = 0
  let compensationOrders = 0

  for (const row of rows) {
    const amount = Math.max(0, Math.round(row.shippingPickMoney || 0))
    totalAmount += amount
    const state = deriveCodSettlementState(row.shippingStatusCode)
    if (state === "reconciled") {
      reconciledOrders += 1
      reconciledAmount += amount
    } else if (state === "returned") {
      returnedOrders += 1
      returnedAmount += amount
    } else if (state === "compensation") {
      compensationOrders += 1
      compensationAmount += amount
    } else {
      pendingOrders += 1
      pendingAmount += amount
    }
  }

  return {
    totalOrders: rows.length,
    pendingOrders,
    reconciledOrders,
    returnedOrders,
    compensationOrders,
    totalAmount,
    pendingAmount,
    reconciledAmount,
    returnedAmount,
    compensationAmount,
    rows,
  }
}

function escapeCsv(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export function codReconciliationToCsv(rows: CodSettlementOrderRow[]): string {
  const header = [
    "Mã đơn",
    "Shop",
    "Khách hàng",
    "Trạng thái COD",
    "Mã trạng thái vận chuyển",
    "Mô tả vận chuyển",
    "Số tiền COD",
    "Đơn vị vận chuyển",
    "Mã vận đơn",
    "Trạng thái đơn",
    "Cập nhật",
  ]

  const dataRows = rows.map((row) => [
    row.code,
    row.shopName,
    row.customerName,
    deriveCodSettlementState(row.shippingStatusCode),
    row.shippingStatusCode?.toString() ?? "",
    row.shippingStatusText ?? "",
    row.shippingPickMoney.toString(),
    row.shippingProviderName ?? "",
    row.trackingNumber ?? "",
    row.status,
    row.updatedAt?.toDate?.().toISOString?.() ?? "",
  ])

  const lines = dataRows.map((values) => values.map((value) => escapeCsv(value)).join(","))
  return "\ufeff" + [header.join(","), ...lines].join("\n")
}
