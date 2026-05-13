import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { VENDOR_MODULE, VendorModuleService } from "../../../../modules/vendor"

/**
 * GET /store/vendors/me?firebase_uid=...
 * Returns vendor record if logged-in user has registered a shop.
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const firebaseUid =
    (req.firebaseUser?.uid as string | undefined) ??
    (req.query.firebase_uid as string | undefined)

  if (!firebaseUid) {
    return res
      .status(400)
      .json({ message: "Thiếu firebase_uid - vui lòng đăng nhập trước" })
  }

  const service = req.scope.resolve<VendorModuleService>(VENDOR_MODULE)
  const vendor = await service.findByFirebaseUid(firebaseUid)

  if (!vendor) {
    return res.status(404).json({
      message: "Tài khoản chưa đăng ký shop",
      registered: false,
    })
  }

  return res.json({ vendor, registered: true })
}
