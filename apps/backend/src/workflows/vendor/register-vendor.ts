import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { VENDOR_MODULE, VendorModuleService } from "../../modules/vendor"

export type RegisterVendorInput = {
  shop_name: string
  shop_slug: string
  description?: string
  owner_name: string
  owner_email: string
  owner_phone: string
  firebase_uid?: string
  business_type: "individual" | "household" | "company"
  tax_code?: string
  id_card_number?: string
  pickup_address: {
    full_address: string
    ward: string
    district: string
    city: string
  }
  bank_name?: string
  bank_account_number?: string
  bank_account_holder?: string
  documents?: Array<{
    type: string
    file_url: string
    file_name?: string
    mime_type?: string
    file_size?: number
  }>
}

const createVendorStep = createStep(
  "create-vendor",
  async (input: RegisterVendorInput, { container }) => {
    const service = container.resolve<VendorModuleService>(VENDOR_MODULE)

    const existingSlug = await service.findBySlug(input.shop_slug)
    if (existingSlug) {
      throw new Error(`Slug "${input.shop_slug}" đã được sử dụng`)
    }
    if (input.firebase_uid) {
      const existingOwner = await service.findByFirebaseUid(input.firebase_uid)
      if (existingOwner) {
        throw new Error("Tài khoản này đã đăng ký shop trước đó")
      }
    }

    const vendor = await service.createVendors({
      shop_name: input.shop_name,
      shop_slug: input.shop_slug,
      description: input.description,
      owner_name: input.owner_name,
      owner_email: input.owner_email,
      owner_phone: input.owner_phone,
      firebase_uid: input.firebase_uid,
      business_type: input.business_type,
      tax_code: input.tax_code,
      id_card_number: input.id_card_number,
      pickup_address: input.pickup_address,
      bank_name: input.bank_name,
      bank_account_number: input.bank_account_number,
      bank_account_holder: input.bank_account_holder,
      status: "pending",
      kyc_level: "basic",
    })

    if (input.documents?.length) {
      await service.createVendorDocuments(
        input.documents.map((d) => ({
          type: d.type as any,
          file_url: d.file_url,
          file_name: d.file_name,
          mime_type: d.mime_type,
          file_size: d.file_size,
          vendor_id: vendor.id,
        }))
      )
    }

    return new StepResponse(vendor, vendor.id)
  },
  async (vendorId, { container }) => {
    if (!vendorId) return
    const service = container.resolve<VendorModuleService>(VENDOR_MODULE)
    await service.deleteVendors(vendorId)
  }
)

export const registerVendorWorkflow = createWorkflow(
  "register-vendor",
  (input: RegisterVendorInput) => {
    const vendor = createVendorStep(input)
    return new WorkflowResponse(vendor)
  }
)
