import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { trackShippingProviderOrder } from "../../../../../lib/shipping-providers"
import type { ShippingProviderId } from "../../../../../lib/shipping-types"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const providerId = req.query.providerId as ShippingProviderId
    const trackingNumber = req.params.trackingNumber

    const tracking = await trackShippingProviderOrder(providerId, trackingNumber)
    res.status(200).json({ success: true, tracking })
  } catch (error) {
    res.status(503).json({
      success: false,
      error: error instanceof Error ? error.message : "Tracking is unavailable",
    })
  }
}
