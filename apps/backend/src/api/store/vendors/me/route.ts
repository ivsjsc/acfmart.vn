import type {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { VENDOR_MODULE, VendorModuleService } from "../../../../modules/vendor"

/**
 * GET /store/vendors/me
 * Query params:
 *   firebase_uid - Firebase UID của user đăng nhập
 *
 * Trả về vendor record nếu user đã đăng ký shop.
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const firebaseUid = req.query.firebase_uid as string | undefined
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
