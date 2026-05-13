import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import {
  QR_VERIFICATION_MODULE,
  QrVerificationModuleService,
} from "../../../modules/qr-verification"

type VerifyBody = {
  code?: string
  qrCode?: string
  scanner_id?: string
  firebase_uid?: string
  latitude?: number
  longitude?: number
  city?: string
}

export const POST = async (
  req: MedusaRequest<VerifyBody>,
  res: MedusaResponse
) => {
  const code = (req.body.code || req.body.qrCode || "").trim()
  if (!code) {
    return res.status(400).json({
      success: false,
      message: "Thiếu mã QR cần xác thực",
    })
  }

  const service =
    req.scope.resolve<QrVerificationModuleService>(QR_VERIFICATION_MODULE)

  const result = await service.verifyCode({
    code,
    scanner_id: req.body.scanner_id,
    firebase_uid: req.body.firebase_uid,
    latitude: req.body.latitude,
    longitude: req.body.longitude,
    city: req.body.city,
    user_agent: req.headers["user-agent"],
  })

  return res.status(200).json({ success: true, ...result })
}
