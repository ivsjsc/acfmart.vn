import type {
  PaymentInitInput,
  PaymentInitResult,
  PaymentProvider,
  PaymentProviderConfig,
  PaymentStatus,
  PaymentVerifyInput,
} from "./types"

const MOMO_BASE = "https://payment.momo.vn"
const MOMO_SANDBOX = "https://test-payment.momo.vn"

/**
 * Momo payment provider
 * Docs: https://developers.momo.vn/v3/docs/payment/api/payment-method/onetime
 */
export class MomoProvider implements PaymentProvider {
  id = "momo" as const
  name = "Momo"
  logo = "https://placehold.co/40x40/a50064/ffffff?text=Mo"
  enabled: boolean
  supportsCod = false
  supportsQr = true
  supportsRefund = true

  private baseUrl: string

  constructor(private config: PaymentProviderConfig) {
    this.baseUrl = config.baseUrl ?? (config.sandbox ? MOMO_SANDBOX : MOMO_BASE)
    this.enabled = !!(config.partnerCode && config.accessKey && config.secretKey)
  }

  async initPayment(input: PaymentInitInput): Promise<PaymentInitResult> {
    if (!this.enabled) {
      return { success: false, error: "Momo chưa được cấu hình" }
    }

    try {
      // Momo cần signature HMAC-SHA256 - phải build từ backend
      const res = await fetch("/api/payment/momo/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: input.orderCode,
          amount: input.amount,
          orderInfo: input.description,
          redirectUrl: input.returnUrl,
          ipnUrl: input.metadata?.webhookUrl,
          extraData: input.metadata?.extra ?? "",
          autoCapture: true,
          requestType: "payWithMethod",
        }),
      })

      if (!res.ok) throw new Error("Backend Momo init failed")
      const data = await res.json()

      return {
        success: data.resultCode === 0,
        redirectUrl: data.payUrl,
        qrData: data.qrCodeUrl,
        deeplink: data.deeplink,
        providerTxnRef: data.requestId,
        error: data.resultCode !== 0 ? data.message : undefined,
      }
    } catch (err) {
      return {
        success: false,
        error:
          "Cần backend endpoint POST /api/payment/momo/init để ký HMAC-SHA256. " +
          "Xem docs/payment-integration.md",
      }
    }
  }

  async verifyPayment(input: PaymentVerifyInput): Promise<PaymentStatus> {
    const q = input.query
    const orderCode = q.orderId ?? ""
    const resultCode = q.resultCode

    let status: PaymentStatus["status"] = "failed"
    if (resultCode === "0") status = "paid"
    else if (resultCode === "1006") status = "cancelled"
    else if (resultCode === "1005") status = "expired"

    return {
      orderCode,
      status,
      amount: parseInt(q.amount ?? "0"),
      paidAt: status === "paid" ? new Date().toISOString() : undefined,
      providerTxnRef: q.transId,
      raw: q,
    }
  }
}
