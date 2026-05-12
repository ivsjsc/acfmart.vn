import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { backendUrl, env, requireEnv } from "../../../../../lib/env"
import { postJson } from "../../../../../lib/http"
import { hmacHex } from "../../../../../lib/payment-security"

type MomoInitBody = {
  orderId: string
  amount: number
  orderInfo?: string
  redirectUrl: string
  ipnUrl?: string
  extraData?: string
  requestType?: string
}

export const POST = async (
  req: MedusaRequest<MomoInitBody>,
  res: MedusaResponse
) => {
  try {
    const partnerCode = requireEnv("MOMO_PARTNER_CODE")
    const accessKey = requireEnv("MOMO_ACCESS_KEY")
    const secretKey = requireEnv("MOMO_SECRET_KEY")
    const endpoint =
      env("MOMO_CREATE_URL") || "https://test-payment.momo.vn/v2/gateway/api/create"

    const orderId = req.body.orderId || `ACF${Date.now()}`
    const requestId = `${orderId}_${Date.now()}`
    const requestType = req.body.requestType || "payWithMethod"
    const extraData = req.body.extraData || ""
    const ipnUrl =
      req.body.ipnUrl || `${backendUrl().replace(/\/$/, "")}/store/payment/webhooks`
    const orderInfo = req.body.orderInfo || `Thanh toan don hang ${orderId}`

    const rawSignature = [
      `accessKey=${accessKey}`,
      `amount=${req.body.amount}`,
      `extraData=${extraData}`,
      `ipnUrl=${ipnUrl}`,
      `orderId=${orderId}`,
      `orderInfo=${orderInfo}`,
      `partnerCode=${partnerCode}`,
      `redirectUrl=${req.body.redirectUrl}`,
      `requestId=${requestId}`,
      `requestType=${requestType}`,
    ].join("&")

    const payload = {
      partnerCode,
      partnerName: env("MOMO_PARTNER_NAME") || "ACFMart",
      storeId: env("MOMO_STORE_ID") || "ACFMart",
      requestId,
      amount: req.body.amount,
      orderId,
      orderInfo,
      redirectUrl: req.body.redirectUrl,
      ipnUrl,
      lang: "vi",
      requestType,
      autoCapture: true,
      extraData,
      signature: hmacHex("sha256", secretKey, rawSignature),
    }

    const data = await postJson<Record<string, unknown>>(endpoint, payload)

    res.status(200).json({
      success: data.resultCode === 0,
      ...data,
    })
  } catch (error) {
    res.status(503).json({
      success: false,
      error: error instanceof Error ? error.message : "MoMo is not configured",
    })
  }
}
