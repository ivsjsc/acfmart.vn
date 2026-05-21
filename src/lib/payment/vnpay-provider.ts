import type {
  PaymentInitInput,
  PaymentInitResult,
  PaymentProvider,
  PaymentProviderConfig,
  PaymentStatus,
  PaymentVerifyInput,
} from "./types"
import { postPaymentBackend } from "../payment-backend"

const VNPAY_BASE = "https://pay.vnpay.vn/vpcpay.html"
const VNPAY_SANDBOX = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html"

/**
 * VNPay payment provider
 * Docs: https://sandbox.vnpayment.vn/apis/docs/thanh-toan-pay/pay.html
 *
 * SECURITY NOTE:
 * - `initPayment` builds the redirect URL **server-side only** in production
 *   because the HMAC secret cannot leak to the browser.
 * - In this implementation, we expose `buildUnsignedUrl` for testing and
 *   require the backend to call `signParams` before redirecting.
 */
export class VnpayProvider implements PaymentProvider {
  id = "vnpay" as const
  name = "VNPay"
  logo = "https://placehold.co/40x40/0066b3/ffffff?text=VN"
  enabled: boolean
  supportsCod = false
  supportsQr = false
  supportsRefund = true

  private baseUrl: string
  private tmnCode: string

  constructor(private config: PaymentProviderConfig) {
    this.tmnCode = config.merchantId ?? ""
    this.baseUrl = config.baseUrl ?? (config.sandbox ? VNPAY_SANDBOX : VNPAY_BASE)
    this.enabled = !!(this.tmnCode && config.hashSecret)
  }

  async initPayment(input: PaymentInitInput): Promise<PaymentInitResult> {
    if (!this.enabled) {
      return { success: false, error: "VNPay chưa được cấu hình" }
    }

    // VNPay yêu cầu signature SHA512 với secret key.
    // Trong production phải gọi backend để build URL có signed query.
    // Ở đây chỉ build các param gốc và yêu cầu backend sign.

    const params: Record<string, string> = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode: this.tmnCode,
      vnp_Amount: String(input.amount * 100), // VNPay amount = VND × 100
      vnp_CurrCode: "VND",
      vnp_TxnRef: input.orderCode,
      vnp_OrderInfo: input.description.replace(/[^a-zA-Z0-9 ]/g, "").slice(0, 255),
      vnp_OrderType: "other",
      vnp_Locale: "vn",
      vnp_ReturnUrl: input.returnUrl,
      vnp_IpAddr: input.ipAddress ?? "127.0.0.1",
      vnp_CreateDate: this.formatDate(new Date()),
      vnp_ExpireDate: this.formatDate(
        new Date(Date.now() + (input.expireMinutes ?? 15) * 60 * 1000)
      ),
    }

    try {
      const data = await postPaymentBackend<{
        redirectUrl: string
        providerTxnRef?: string
      }>("/store/payment/vnpay/sign", {
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
        success: true,
        redirectUrl: data.redirectUrl,
        providerTxnRef: data.providerTxnRef ?? input.orderCode,
      }
    } catch (err) {
      return {
        success: false,
        error:
          "Cần backend endpoint POST /store/payment/vnpay/sign để ký HMAC. " +
          "Xem docs/payment-integration.md",
      }
    }
  }

  async verifyPayment(input: PaymentVerifyInput): Promise<PaymentStatus> {
    const q = input.query
    const orderCode = q.vnp_TxnRef ?? ""
    const responseCode = q.vnp_ResponseCode
    const amount = parseInt(q.vnp_Amount ?? "0") / 100

    let status: PaymentStatus["status"] = "failed"
    if (responseCode === "00") status = "paid"
    else if (responseCode === "24") status = "cancelled"

    return {
      orderCode,
      status,
      amount,
      paidAt: status === "paid" ? this.parseDate(q.vnp_PayDate) : undefined,
      providerTxnRef: q.vnp_TransactionNo,
      raw: q,
    }
  }

  private formatDate(d: Date): string {
    const pad = (n: number) => String(n).padStart(2, "0")
    return (
      d.getFullYear().toString() +
      pad(d.getMonth() + 1) +
      pad(d.getDate()) +
      pad(d.getHours()) +
      pad(d.getMinutes()) +
      pad(d.getSeconds())
    )
  }

  private parseDate(s?: string): string | undefined {
    if (!s) return undefined
    const y = s.slice(0, 4)
    const mo = s.slice(4, 6)
    const d = s.slice(6, 8)
    const h = s.slice(8, 10)
    const mi = s.slice(10, 12)
    const se = s.slice(12, 14)
    return `${y}-${mo}-${d}T${h}:${mi}:${se}+07:00`
  }
}
