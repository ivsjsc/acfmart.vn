import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { VENDOR_MODULE, VendorModuleService } from "../../../../modules/vendor"

/** GET /admin/vendors/:id — chi tiết 1 vendor + giấy tờ KYC */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const id = req.params.id as string
  const service = req.scope.resolve<VendorModuleService>(VENDOR_MODULE)

  try {
    const vendor = await service.retrieveVendor(id)
    const documents = await service.listVendorDocuments({ vendor_id: id })
    return res.json({ vendor, documents })
  } catch {
    return res.status(404).json({ message: "Không tìm thấy vendor" })
  }
}
