import type {
  PaymentInitInput,
  PaymentInitResult,
  PaymentProvider,
  PaymentProviderConfig,
  PaymentStatus,
  PaymentVerifyInput,
} from "./types"

const ZALOPAY_BASE = "https://openapi.zalopay.vn"
const ZALOPAY_SANDBOX = "https://sb-openapi.zalopay.vn"

/**
 * ZaloPay payment provider
 * Docs: https://docs.zalopay.vn/v2/general/overview.html
 */
export class ZalopayProvider implements PaymentProvider {
  id = "zalopay" as const
  name = "ZaloPay"
  logo = "https://placehold.co/40x40/008fe5/ffffff?text=Zp"
  enabled: boolean
  supportsCod = false
  supportsQr = true
  supportsRefund = true

  private baseUrl: string

  constructor(private config: PaymentProviderConfig) {
    this.baseUrl = config.baseUrl ?? (config.sandbox ? ZALOPAY_SANDBOX : ZALOPAY_BASE)
    this.enabled = !!(config.appId && config.apiKey && config.secretKey)
  }

  async initPayment(input: PaymentInitInput): Promise<PaymentInitResult> {
    if (!this.enabled) {
      return { success: false, error: "ZaloPay chưa được cấu hình" }
    }

    try {
      // ZaloPay cần MAC (HMAC SHA256) - phải build từ backend
      const res = await fetch("/api/payment/zalopay/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          app_user: input.buyerEmail ?? input.buyerPhone ?? "guest",
          app_trans_id: input.orderCode,
          amount: input.amount,
          item: [{ name: input.description, quantity: 1, price: input.amount }],
          embed_data: {
            redirecturl: input.returnUrl,
          },
          description: input.description,
          bank_code: "",
        }),
      })

      if (!res.ok) throw new Error("Backend ZaloPay init failed")
      const data = await res.json()

      return {
        success: data.return_code === 1,
        redirectUrl: data.order_url,
        qrData: data.qr_code,
        deeplink: data.zp_trans_token
          ? `zalopay://app?token=${data.zp_trans_token}`
          : undefined,
        providerTxnRef: data.zp_trans_token,
        error: data.return_code !== 1 ? data.return_message : undefined,
      }
    } catch (err) {
      return {
        success: false,
        error:
          "Cần backend endpoint POST /api/payment/zalopay/init để ký MAC. " +
          "Xem docs/payment-integration.md",
      }
    }
  }

  async verifyPayment(input: PaymentVerifyInput): Promise<PaymentStatus> {
    const q = input.query
    const orderCode = q.apptransid ?? q.app_trans_id ?? ""
    const status = q.status === "1" ? "paid" : q.status === "2" ? "failed" : "cancelled"

    return {
      orderCode,
      status,
      amount: parseInt(q.amount ?? "0"),
      paidAt: status === "paid" ? new Date().toISOString() : undefined,
      providerTxnRef: q.apptransid ?? q.zp_trans_id,
      raw: q,
    }
  }
}
