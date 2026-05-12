import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { env, requireEnv } from "../../../../../lib/env"
import { postForm } from "../../../../../lib/http"
import { hmacHex } from "../../../../../lib/payment-security"

type ZaloPayInitBody = {
  app_user?: string
  app_trans_id?: string
  orderId?: string
  amount: number
  item?: Array<Record<string, unknown>>
  embed_data?: Record<string, unknown>
  description?: string
  bank_code?: string
}

function zaloPayTransId(orderId?: string): string {
  const now = new Date()
  const yy = String(now.getFullYear()).slice(-2)
  const mm = String(now.getMonth() + 1).padStart(2, "0")
  const dd = String(now.getDate()).padStart(2, "0")
  return `${yy}${mm}${dd}_${orderId || Date.now()}`
}

export const POST = async (
  req: MedusaRequest<ZaloPayInitBody>,
  res: MedusaResponse
) => {
  try {
    const appId = requireEnv("ZALOPAY_APP_ID", "VITE_ZALOPAY_APP_ID")
    const key1 = requireEnv("ZALOPAY_KEY1", "VITE_ZALOPAY_KEY1")
    const endpoint =
      env("ZALOPAY_CREATE_URL") || "https://sb-openapi.zalopay.vn/v2/create"

    const appTransId = req.body.app_trans_id || zaloPayTransId(req.body.orderId)
    const appUser = req.body.app_user || "guest"
    const appTime = Date.now()
    const item = JSON.stringify(req.body.item || [])
    const embedData = JSON.stringify(req.body.embed_data || {})
    const description =
      req.body.description || `Thanh toan don hang ${req.body.orderId || appTransId}`

    const macData = [
      appId,
      appTransId,
      appUser,
      req.body.amount,
      appTime,
      embedData,
      item,
    ].join("|")

    const payload = {
      app_id: appId,
      app_user: appUser,
      app_trans_id: appTransId,
      app_time: appTime,
      amount: req.body.amount,
      item,
      embed_data: embedData,
      description,
      bank_code: req.body.bank_code || "",
      mac: hmacHex("sha256", key1, macData),
    }

    const data = await postForm<Record<string, unknown>>(endpoint, payload)

    res.status(200).json({
      success: data.return_code === 1,
      ...data,
    })
  } catch (error) {
    res.status(503).json({
      success: false,
      error: error instanceof Error ? error.message : "ZaloPay is not configured",
    })
  }
}
