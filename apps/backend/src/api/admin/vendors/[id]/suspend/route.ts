import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"
import { VENDOR_MODULE, VendorModuleService } from "../../../../../modules/vendor"

const schema = z.object({
  reason: z.string().min(10).max(500),
})

/**
 * POST /admin/vendors/:id/suspend
 * Tạm khoá shop đang active vì vi phạm. Shop có thể appeal sau.
 */
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const id = req.params.id as string
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ message: "Cần nhập lý do tạm khoá" })
  }

  const service = req.scope.resolve<VendorModuleService>(VENDOR_MODULE)
  try {
    const updated = await service.suspendVendor(id, parsed.data.reason)
    return res.json({
      vendor: updated,
      message: "Đã tạm khoá vendor.",
    })
  } catch (err: any) {
    return res.status(400).json({ message: err?.message ?? "Suspend thất bại" })
  }
}
