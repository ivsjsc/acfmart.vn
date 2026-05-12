export type PaymentProviderId = "vnpay" | "momo" | "zalopay" | "stripe" | "cod" | "wallet"

export interface PaymentInitInput {
  orderCode: string
  amount: number             // VND, integer (no decimal)
  description: string
  returnUrl: string          // Where to redirect after payment
  cancelUrl?: string         // Where to redirect on cancel
  buyerName?: string
  buyerEmail?: string
  buyerPhone?: string
  ipAddress?: string
  expireMinutes?: number     // Default 15
  metadata?: Record<string, any>
}

export interface PaymentInitResult {
  success: boolean
  /** Redirect URL where user is sent to complete payment */
  redirectUrl?: string
  /** QR code data string (for Momo/ZaloPay deeplink) */
  qrData?: string
  /** Mobile deeplink to open app directly */
  deeplink?: string
  /** Provider transaction reference */
  providerTxnRef?: string
  error?: string
}

export interface PaymentStatus {
  orderCode: string
  status: "pending" | "paid" | "failed" | "cancelled" | "refunded" | "expired"
  amount: number
  paidAt?: string
  providerTxnRef?: string
  raw?: any
}

export interface PaymentVerifyInput {
  query: Record<string, string>  // Query params from return URL
  /** For server-side webhook verification */
  body?: any
  signature?: string
}

export interface PaymentRefundInput {
  orderCode: string
  amount: number              // Partial refund supported
  reason: string
  providerTxnRef: string
}

export interface PaymentRefundResult {
  success: boolean
  refundTxnRef?: string
  refundedAt?: string
  error?: string
}

export interface PaymentProvider {
  id: PaymentProviderId
  name: string
  logo: string
  enabled: boolean
  supportsCod: boolean
  supportsQr: boolean
  supportsRefund: boolean

  /** Create payment session; user is redirected to provider gateway */
  initPayment(input: PaymentInitInput): Promise<PaymentInitResult>

  /** Verify payment after return / webhook */
  verifyPayment(input: PaymentVerifyInput): Promise<PaymentStatus>

  /** Refund (full or partial) */
  refund?(input: PaymentRefundInput): Promise<PaymentRefundResult>
}

export interface PaymentProviderConfig {
  baseUrl?: string
  merchantId?: string
  apiKey?: string
  secretKey?: string
  hashSecret?: string
  partnerCode?: string
  accessKey?: string
  appId?: string
  sandbox?: boolean
}
