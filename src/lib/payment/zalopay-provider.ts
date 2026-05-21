import type {
  PaymentInitInput,
  PaymentInitResult,
  PaymentProvider,
  PaymentProviderConfig,
  PaymentStatus,
  PaymentVerifyInput,
} from "./types"
import { postPaymentBackend } from "../payment-backend"

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
      const data = await postPaymentBackend<{
        redirectUrl?: string
        qrData?: string
        deeplink?: string
        providerTxnRef?: string
        error?: string
      }>("/store/payment/zalopay/init", {
        orderCode: input.orderCode,
        amount: input.amount,
        orderInfo: input.description,
        returnUrl: input.returnUrl,
        cancelUrl: input.cancelUrl,
        buyerEmail: input.buyerEmail,
        buyerPhone: input.buyerPhone,
        metadata: input.metadata ?? null,
      })

      return {
        success: !!data.redirectUrl || !!data.qrData,
        redirectUrl: data.redirectUrl,
        qrData: data.qrData,
        deeplink: data.deeplink,
        providerTxnRef: data.providerTxnRef,
        error: data.error,
      }
    } catch (err) {
      return {
        success: false,
        error:
          "Cần backend endpoint POST /store/payment/zalopay/init để ký MAC. " +
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
