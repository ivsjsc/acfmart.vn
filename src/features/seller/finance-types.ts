import type { Timestamp } from "firebase/firestore"

// ─── Payouts ─────────────────────────────────────────────────────────────

export type PayoutStatus =
  | "scheduled"
  | "processing"
  | "paid"
  | "failed"
  | "on_hold"

export type PayoutCycle = "weekly" | "bi_weekly" | "monthly"

export interface PayoutDoc {
  id: string
  shopId: string
  periodStart: Timestamp
  periodEnd: Timestamp
  scheduledFor: Timestamp
  paidAt: Timestamp | null
  status: PayoutStatus
  cycle: PayoutCycle
  orderCount: number
  grossAmount: number
  commissionFee: number
  paymentGatewayFee: number
  adsFee: number
  livestreamFee: number
  adjustments: number
  netAmount: number
  bankAccount: {
    bankName: string
    accountNumber: string
    accountHolder: string
  }
  transactionRef: string | null
  failureReason: string | null
  createdAt: Timestamp
  updatedAt: Timestamp
}

// ─── Transactions (line-items inside a payout) ──────────────────────────

export type TransactionType =
  | "order_revenue"
  | "commission"
  | "payment_gateway"
  | "ads_charge"
  | "livestream_fee"
  | "refund"
  | "adjustment"
  | "payout"

export type TransactionChannel = "online" | "store" | "cloud" | "live"

export interface TransactionDoc {
  id: string
  shopId: string
  type: TransactionType
  orderId: string | null
  orderCode: string | null
  payoutId: string | null
  channel: TransactionChannel | null
  category: string | null
  productId: string | null
  amount: number
  description: string
  occurredAt: Timestamp
  createdAt: Timestamp
}

// ─── Seller balance snapshot ────────────────────────────────────────────

export interface SellerBalanceDoc {
  shopId: string
  availableBalance: number
  pendingBalance: number
  holdBalance: number
  refundLiabilityBalance?: number
  lastPayoutAt: Timestamp | null
  nextPayoutAt: Timestamp | null
  payoutCycle: PayoutCycle
  totalLifetimeRevenue: number
  totalLifetimePayouts: number
  totalFeesPaid: number
  updatedAt: Timestamp
}

// ─── VAT invoices ───────────────────────────────────────────────────────

export type VatInvoiceStatus = "draft" | "issued" | "cancelled"

export interface VatInvoiceLineItem {
  description: string
  quantity: number
  unitPrice: number
  vatRate: number
}

export interface VatInvoiceDoc {
  id: string
  shopId: string
  invoiceNumber: string
  series: string
  status: VatInvoiceStatus
  orderId: string | null
  orderCode: string | null
  issuedAt: Timestamp
  buyer: {
    name: string
    taxCode: string
    address: string
    email: string | null
  }
  seller: {
    shopName: string
    taxCode: string
    address: string
  }
  items: VatInvoiceLineItem[]
  subtotal: number
  vatAmount: number
  total: number
  paymentMethod: string
  note: string | null
  createdAt: Timestamp
}

export interface CreateVatInvoiceInput {
  shopId: string
  orderId: string | null
  orderCode: string | null
  buyer: VatInvoiceDoc["buyer"]
  seller: VatInvoiceDoc["seller"]
  items: VatInvoiceLineItem[]
  paymentMethod: string
  note: string | null
}

// ─── Aggregates for UI ──────────────────────────────────────────────────

export interface RevenueBreakdownByCategory {
  category: string
  revenue: number
  orderCount: number
}

export interface RevenueBreakdownByMonth {
  month: string
  revenue: number
  orderCount: number
}

export interface RevenueBreakdownByChannel {
  channel: TransactionChannel
  revenue: number
  orderCount: number
}

export interface RevenueBreakdownSummary {
  totalRevenue: number
  totalOrders: number
  byCategory: RevenueBreakdownByCategory[]
  byMonth: RevenueBreakdownByMonth[]
  byChannel: RevenueBreakdownByChannel[]
}

export interface FeeBreakdownRow {
  type: Exclude<TransactionType, "order_revenue" | "payout">
  label: string
  amount: number
  count: number
  percentage: number
}

export interface TaxExportRow {
  invoiceNumber: string
  issuedAt: string
  buyerName: string
  buyerTaxCode: string
  subtotal: number
  vatAmount: number
  total: number
  paymentMethod: string
}

export interface TransactionFilters {
  type?: TransactionType
  channel?: TransactionChannel
  from?: Date
  to?: Date
  limit?: number
}
