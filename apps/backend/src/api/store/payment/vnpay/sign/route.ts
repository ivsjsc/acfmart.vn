import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { env, requireEnv } from "../../../../../lib/env"
import { hmacHex, sortedQuery, vnpayDate } from "../../../../../lib/payment-security"

type VnpaySignBody = {
  orderId?: string
  amount?: number
  orderInfo?: string
  returnUrl?: string
  ipAddress?: string
  expireMinutes?: number
  params?: Record<string, string>
  baseUrl?: string
}

export const POST = async (
  req: MedusaRequest<VnpaySignBody>,
  res: MedusaResponse
) => {
  try {
    const tmnCode = requireEnv("VNPAY_TMN_CODE", "VITE_VNPAY_TMN_CODE")
    const hashSecret = requireEnv("VNPAY_HASH_SECRET", "VITE_VNPAY_HASH_SECRET")
    const paymentUrl =
      req.body.baseUrl ||
      env("VNPAY_PAYMENT_URL") ||
      "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html"

    const createdAt = vnpayDate()
    const expireAt = vnpayDate(
      new Date(Date.now() + (req.body.expireMinutes ?? 15) * 60 * 1000)
    )

    const params: Record<string, string> =
      req.body.params ??
      {
        vnp_Version: "2.1.0",
        vnp_Command: "pay",
        vnp_TmnCode: tmnCode,
        vnp_Amount: String(Math.round(Number(req.body.amount ?? 0)) * 100),
        vnp_CurrCode: "VND",
        vnp_TxnRef: req.body.orderId ?? `ACF${Date.now()}`,
        vnp_OrderInfo: (req.body.orderInfo ?? "Thanh toan don hang ACFMart")
          .replace(/[^\p{L}\p{N}\s._-]/gu, "")
          .slice(0, 255),
        vnp_OrderType: "other",
        vnp_Locale: "vn",
        vnp_ReturnUrl: req.body.returnUrl ?? `${env("STORE_URL") || ""}/order-success`,
        vnp_IpAddr: req.body.ipAddress ?? "127.0.0.1",
        vnp_CreateDate: createdAt,
        vnp_ExpireDate: expireAt,
      }

    params.vnp_TmnCode = params.vnp_TmnCode || tmnCode
    params.vnp_CreateDate = params.vnp_CreateDate || createdAt

    const signData = sortedQuery(params)
    const secureHash = hmacHex("sha512", hashSecret, signData)
    const redirectUrl = `${paymentUrl}?${signData}&vnp_SecureHash=${secureHash}`

    res.status(200).json({
      success: true,
      redirectUrl,
      providerTxnRef: params.vnp_TxnRef,
    })
  } catch (error) {
    res.status(503).json({
      success: false,
      error: error instanceof Error ? error.message : "VNPay is not configured",
    })
  }
}
