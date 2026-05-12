import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { createShippingProviderOrder } from "../../../../lib/shipping-providers"
import type {
  Address,
  Parcel,
  ShippingProviderId,
} from "../../../../lib/shipping-types"

type CreateShippingOrderBody = {
  providerId: ShippingProviderId
  serviceCode: string
  from: Address
  to: Address
  parcel: Parcel
  metadata?: Record<string, any>
}

export const POST = async (
  req: MedusaRequest<CreateShippingOrderBody>,
  res: MedusaResponse
) => {
  try {
    const shippingOrder = await createShippingProviderOrder(req.body)
    res.status(200).json({ success: true, shippingOrder })
  } catch (error) {
    res.status(503).json({
      success: false,
      error: error instanceof Error ? error.message : "Shipping order creation failed",
    })
  }
}
