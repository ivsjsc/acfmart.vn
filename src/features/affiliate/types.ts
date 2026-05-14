export type AffiliateLinkStatus = "active" | "paused" | "pending"
export type AffiliateTxnStatus = "pending" | "completed" | "failed" | "rejected"
export type AffiliateTxnType = "commission" | "bonus" | "payout" | "adjustment"
export type PayoutMethod = "bank" | "momo" | "zalopay" | "wallet"

export interface AffiliateLink {
  id: string
  title: string
  productId?: string
  shopId?: string
  shortUrl: string
  originalUrl: string
  clicks: number
  uniqueClicks: number
  conversions: number
  conversionRate: number
  totalCommission: number
  commissionRate: number
  status: AffiliateLinkStatus
  createdAt: string
  lastClickAt?: string
}

export interface AffiliateTransaction {
  id: string
  date: string
  type: AffiliateTxnType
  amount: number
  status: AffiliateTxnStatus
  description: string
  orderCode?: string
  linkId?: string
}

export interface AffiliateStats {
  totalEarned: number
  totalPaid: number
  pendingCommission: number
  availableBalance: number
  totalClicks: number
  totalConversions: number
  conversionRate: number
  activeLinks: number
}

export interface AffiliatePayout {
  id: string
  requestedAt: string
  processedAt?: string
  amount: number
  method: PayoutMethod
  status: "pending" | "processing" | "completed" | "rejected"
  accountInfo: string
}
