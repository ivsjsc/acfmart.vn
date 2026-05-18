import { postBackend, getBackend } from "../api-base"
import type {
  Address,
  Parcel,
  ShippingOrder,
  ShippingProvider,
  ShippingProviderConfig,
  ShippingRateOption,
  TrackingInfo,
} from "./types"

export class JntProvider implements ShippingProvider {
  id = "jnt" as const
  name = "J&T Express"
  logo = "https://placehold.co/40x40/dc2626/ffffff?text=J%26T"
  enabled: boolean

  constructor(private config: ShippingProviderConfig) {
    this.enabled = !!(config.apiKey && config.token)
  }

  async quote(from: Address, to: Address, parcel: Parcel): Promise<ShippingRateOption[]> {
    if (!this.enabled) return []

    const data = await postBackend<{ rates: ShippingRateOption[] }>("/store/shipping/jnt/quote", {
      from,
      to,
      parcel,
    })
    return data.rates
  }

  async createOrder(
    from: Address,
    to: Address,
    parcel: Parcel,
    serviceCode: string,
    metadata?: Record<string, any>
  ): Promise<ShippingOrder> {
    if (!this.enabled) {
      throw new Error("J&T provider chưa được cấu hình")
    }

    return postBackend<ShippingOrder>("/store/shipping/jnt/orders", {
      from,
      to,
      parcel,
      serviceCode,
      metadata,
    })
  }

  async cancelOrder(trackingNumber: string): Promise<void> {
    await postBackend("/store/shipping/jnt/orders/cancel", { trackingNumber })
  }

  async track(trackingNumber: string): Promise<TrackingInfo> {
    if (!this.enabled) {
      throw new Error("J&T provider chưa được cấu hình")
    }

    return getBackend<TrackingInfo>(`/store/shipping/jnt/track/${trackingNumber}`)
  }
}
