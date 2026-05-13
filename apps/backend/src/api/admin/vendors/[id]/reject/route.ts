import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"
import { VENDOR_MODULE, VendorModuleService } from "../../../../../modules/vendor"

const schema = z.object({
  reason: z.string().min(10).max(500),
})

/**
 * POST /admin/vendors/:id/reject
 * Từ chối vendor, kèm lý do để hiển thị cho seller.
 */
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const id = req.params.id as string
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({
      message: "Vui lòng nhập lý do từ chối tối thiểu 10 ký tự",
    })
  }

  const service = req.scope.resolve<VendorModuleService>(VENDOR_MODULE)
  try {
    const updated = await service.rejectVendor(id, parsed.data.reason)
    return res.json({
      vendor: updated,
      message: "Đã từ chối vendor.",
    })
  } catch (err: any) {
    return res.status(400).json({ message: err?.message ?? "Từ chối thất bại" })
  }
}
