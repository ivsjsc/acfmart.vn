import type {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { z } from "zod"
import { registerVendorWorkflow } from "../../../../workflows/vendor/register-vendor"

const schema = z.object({
  shop_name: z.string().min(3).max(60),
  shop_slug: z
    .string()
    .min(3)
    .max(60)
    .regex(/^[a-z0-9-]+$/, "Slug chỉ chứa chữ thường, số, gạch ngang"),
  description: z.string().max(500).optional(),
  owner_name: z.string().min(2).max(100),
  owner_email: z.string().email(),
  owner_phone: z.string().min(9).max(15),
  firebase_uid: z.string().optional(),
  business_type: z.enum(["individual", "household", "company"]),
  tax_code: z.string().optional(),
  id_card_number: z.string().optional(),
  pickup_address: z.object({
    full_address: z.string(),
    ward: z.string(),
    district: z.string(),
    city: z.string(),
  }),
  bank_name: z.string().optional(),
  bank_account_number: z.string().optional(),
  bank_account_holder: z.string().optional(),
  documents: z
    .array(
      z.object({
        type: z.string(),
        file_url: z.string().url(),
        file_name: z.string().optional(),
        mime_type: z.string().optional(),
        file_size: z.number().optional(),
      })
    )
    .optional(),
})

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({
      message: "Dữ liệu không hợp lệ",
      errors: parsed.error.flatten(),
    })
  }

  try {
    const { result } = await registerVendorWorkflow(req.scope).run({
      input: parsed.data,
    })
    return res.status(201).json({
      vendor: result,
      message:
        "Đăng ký thành công. Aivy đã ghi nhận hồ sơ — admin sẽ duyệt KYC trong 24-48h.",
    })
  } catch (err: any) {
    return res.status(400).json({ message: err?.message ?? "Đăng ký thất bại" })
  }
}
