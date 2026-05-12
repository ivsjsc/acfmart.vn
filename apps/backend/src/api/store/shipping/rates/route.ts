import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { quoteShippingProviders } from "../../../../lib/shipping-providers"
import type { Address, Parcel } from "../../../../lib/shipping-types"

type RatesBody = {
  from: Address
  to: Address
  parcel: Parcel
}

export const POST = async (
  req: MedusaRequest<RatesBody>,
  res: MedusaResponse
) => {
  try {
    const rates = await quoteShippingProviders(req.body)
    res.status(200).json({ success: true, rates })
  } catch (error) {
    res.status(503).json({
      success: false,
      error: error instanceof Error ? error.message : "Shipping rates are unavailable",
    })
  }
}
