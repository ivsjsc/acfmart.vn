import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { env, requireEnv } from "../../../../../lib/env"
import { hmacHex, sortedQuery } from "../../../../../lib/payment-security"

type WebhookBody = {
  provider?: "vnpay" | "momo" | "zalopay"
  payload?: Record<string, any>
  [key: string]: any
}

function verifyVNPay(payload: Record<string, string>) {
  const hashSecret = requireEnv("VNPAY_HASH_SECRET", "VITE_VNPAY_HASH_SECRET")
  const secureHash = payload.vnp_SecureHash
  const unsigned = { ...payload }
  delete unsigned.vnp_SecureHash
  delete unsigned.vnp_SecureHashType

  const expected = hmacHex("sha512", hashSecret, sortedQuery(unsigned))
  if (expected !== secureHash) {
    throw new Error("Invalid VNPay signature")
  }

  return {
    provider: "vnpay",
    orderId: payload.vnp_TxnRef,
    status: payload.vnp_ResponseCode === "00" ? "paid" : "failed",
    providerTxnRef: payload.vnp_TransactionNo,
    amount: Number(payload.vnp_Amount || 0) / 100,
  }
}

function verifyMomo(payload: Record<string, any>) {
  const secretKey = requireEnv("MOMO_SECRET_KEY", "VITE_MOMO_SECRET_KEY")
  const signature = payload.signature
  const rawSignature = [
    `accessKey=${env("MOMO_ACCESS_KEY", "VITE_MOMO_ACCESS_KEY")}`,
    `amount=${payload.amount}`,
    `extraData=${payload.extraData || ""}`,
    `message=${payload.message || ""}`,
    `orderId=${payload.orderId}`,
    `orderInfo=${payload.orderInfo || ""}`,
    `orderType=${payload.orderType || ""}`,
    `partnerCode=${payload.partnerCode}`,
    `payType=${payload.payType || ""}`,
    `requestId=${payload.requestId}`,
    `responseTime=${payload.responseTime}`,
    `resultCode=${payload.resultCode}`,
    `transId=${payload.transId}`,
  ].join("&")

  const expected = hmacHex("sha256", secretKey, rawSignature)
  if (signature && expected !== signature) {
    throw new Error("Invalid MoMo signature")
  }

  return {
    provider: "momo",
    orderId: payload.orderId,
    status: Number(payload.resultCode) === 0 ? "paid" : "failed",
    providerTxnRef: payload.transId,
    amount: Number(payload.amount || 0),
  }
}

function verifyZaloPay(payload: Record<string, any>) {
  const key2 = requireEnv("ZALOPAY_KEY2", "VITE_ZALOPAY_KEY2")
  const data = typeof payload.data === "string" ? payload.data : JSON.stringify(payload.data)
  const expected = hmacHex("sha256", key2, data)
  if (payload.mac && expected !== payload.mac) {
    throw new Error("Invalid ZaloPay signature")
  }

  const parsed = typeof payload.data === "string" ? JSON.parse(payload.data) : payload.data
  return {
    provider: "zalopay",
    orderId: parsed?.app_trans_id,
    status: Number(payload.type) === 1 ? "paid" : "failed",
    providerTxnRef: parsed?.zp_trans_id,
    amount: Number(parsed?.amount || 0),
  }
}

export const POST = async (
  req: MedusaRequest<WebhookBody>,
  res: MedusaResponse
) => {
  try {
    const provider = req.body.provider
    const payload = req.body.payload || req.body

    const result =
      provider === "vnpay"
        ? verifyVNPay(payload)
        : provider === "momo"
        ? verifyMomo(payload)
        : provider === "zalopay"
        ? verifyZaloPay(payload)
        : payload.vnp_TxnRef
        ? verifyVNPay(payload)
        : payload.partnerCode
        ? verifyMomo(payload)
        : verifyZaloPay(payload)

    req.scope.resolve("logger").info(`Payment webhook accepted: ${JSON.stringify(result)}`)

    res.status(200).json({
      success: true,
      payment: result,
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : "Invalid payment webhook",
    })
  }
}
