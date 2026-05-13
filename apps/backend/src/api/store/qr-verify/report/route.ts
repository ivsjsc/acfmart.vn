import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"
import {
  QR_VERIFICATION_MODULE,
  QrVerificationModuleService,
} from "../../../../modules/qr-verification"

const schema = z.object({
  reporter_id: z.string().default("guest"),
  reporter_name: z.string().min(2).default("Khách hàng"),
  reporter_email: z.string().email().optional(),
  reporter_phone: z.string().optional(),
  order_id: z.string().optional(),
  product_id: z.string().optional(),
  vendor_id: z.string().optional(),
  verification_code_id: z.string().optional(),
  title: z.string().min(3).default("Báo cáo nghi vấn hàng giả"),
  description: z.string().min(5),
  purchase_location: z.string().optional(),
  evidence_urls: z.array(z.string().url()).default([]),
})

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: "Dữ liệu báo cáo không hợp lệ",
      errors: parsed.error.flatten(),
    })
  }

  const service =
    req.scope.resolve<QrVerificationModuleService>(QR_VERIFICATION_MODULE)
  const report = await service.submitCounterfeitReport(parsed.data)

  return res.status(201).json({
    success: true,
    report,
    message:
      "Báo cáo đã được gửi tới đội kiểm định. Bảo mật bởi IVS & Quỹ Chống Hàng Giả VN.",
  })
}
