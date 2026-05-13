import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { hasEnv } from "../../../lib/env"

export const GET = async (_req: MedusaRequest, res: MedusaResponse) => {
  res.status(200).json({
    providers: [
      {
        id: "vnpay",
        configured:
          hasEnv("VNPAY_TMN_CODE", "VITE_VNPAY_TMN_CODE") &&
          hasEnv("VNPAY_HASH_SECRET", "VITE_VNPAY_HASH_SECRET"),
      },
      {
        id: "momo",
        configured:
          hasEnv("MOMO_PARTNER_CODE", "VITE_MOMO_PARTNER_CODE") &&
          hasEnv("MOMO_ACCESS_KEY", "VITE_MOMO_ACCESS_KEY") &&
          hasEnv("MOMO_SECRET_KEY", "VITE_MOMO_SECRET_KEY"),
      },
      {
        id: "zalopay",
        configured:
          hasEnv("ZALOPAY_APP_ID", "VITE_ZALOPAY_APP_ID") &&
          hasEnv("ZALOPAY_KEY1", "VITE_ZALOPAY_KEY1") &&
          hasEnv("ZALOPAY_KEY2", "VITE_ZALOPAY_KEY2"),
      },
    ],
  })
}
