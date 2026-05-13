import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"
import { VENDOR_MODULE, VendorModuleService } from "../../../../../modules/vendor"

const schema = z.object({
  note: z.string().max(500).optional(),
  kyc_level: z.enum(["basic", "verified", "premium"]).default("verified"),
})

/**
 * POST /admin/vendors/:id/approve
 * Duyệt vendor từ pending → active. Set verified_at + kyc_level.
 */
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const id = req.params.id as string
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ message: "Dữ liệu không hợp lệ" })
  }

  const service = req.scope.resolve<VendorModuleService>(VENDOR_MODULE)
  try {
    const vendor = await service.retrieveVendor(id)
    if (vendor.status === "active") {
      return res.status(200).json({ vendor, message: "Vendor đã active từ trước" })
    }

    const updated = await service.approveVendor(id, parsed.data.note)
    return res.json({
      vendor: updated,
      message: `Đã duyệt shop "${vendor.shop_name}" lên active.`,
    })
  } catch (err: any) {
    return res.status(400).json({ message: err?.message ?? "Duyệt thất bại" })
  }
}
