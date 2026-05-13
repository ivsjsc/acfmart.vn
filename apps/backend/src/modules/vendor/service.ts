import { MedusaService } from "@medusajs/framework/utils"
import { Vendor } from "./models/vendor"
import { VendorDocument } from "./models/vendor-document"

class VendorModuleService extends MedusaService({
  Vendor,
  VendorDocument,
}) {
  /** Tìm vendor theo Firebase UID — dùng khi seller login */
  async findByFirebaseUid(firebaseUid: string) {
    const [vendor] = await this.listVendors({ firebase_uid: firebaseUid })
    return vendor ?? null
  }

  async findBySlug(slug: string) {
    const [vendor] = await this.listVendors({ shop_slug: slug })
    return vendor ?? null
  }

  /** Đặt status sang active sau khi admin duyệt KYC */
  async approveVendor(vendorId: string, reviewerNote?: string) {
    return this.updateVendors({
      id: vendorId,
      status: "active",
      verified_at: new Date(),
      kyc_level: "verified",
      metadata: reviewerNote ? { approve_note: reviewerNote } : undefined,
    })
  }

  async rejectVendor(vendorId: string, reason: string) {
    return this.updateVendors({
      id: vendorId,
      status: "rejected",
      rejected_reason: reason,
    })
  }

  async suspendVendor(vendorId: string, reason?: string) {
    return this.updateVendors({
      id: vendorId,
      status: "suspended",
      suspended_at: new Date(),
      metadata: reason ? { suspend_reason: reason } : undefined,
    })
  }
}

export default VendorModuleService
