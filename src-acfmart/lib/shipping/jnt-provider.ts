import type {
  Address,
  Parcel,
  ShippingOrder,
  ShippingProvider,
  ShippingProviderConfig,
  ShippingRateOption,
  TrackingInfo,
} from "./types"

const JNT_BASE = "https://open.jtexpress.com.vn/webopenplatformapi/api"

/**
 * J&T Express provider
 * Docs: https://open.jtexpress.vn/
 *
 * Note: J&T public API yêu cầu signature HMAC-SHA256 cho mỗi request.
 * Hiện tại provider này là STUB - cần backend ký request hộ
 * (vì SHA hashing trong browser cần Web Crypto, nhưng api key/secret
 * không nên expose ra client).
 */
export class JntProvider implements ShippingProvider {
  id = "jnt" as const
  name = "J&T Express"
  logo = "https://placehold.co/40x40/dc2626/ffffff?text=J%26T"
  enabled: boolean

  constructor(private config: ShippingProviderConfig) {
    this.enabled = !!(config.apiKey && config.token)
  }

  async quote(_from: Address, _to: Address, parcel: Parcel): Promise<ShippingRateOption[]> {
    if (!this.enabled) {
      return []
    }
    // Stub: trong production, gọi /jts.order.getPriceQuery
    // Cần backend làm signature
    return [
      {
        serviceCode: "EZ",
        serviceName: "J&T Express",
        fee: parcel.weight < 500 ? 35000 : 40000 + Math.ceil(parcel.weight / 500) * 5000,
        insuranceFee: Math.floor(parcel.declaredValue * 0.005),
        codFee: 0,
        totalFee: 0,
        estimatedDeliveryDays: { min: 2, max: 4 },
      },
    ].map((r) => ({ ...r, totalFee: r.fee + r.insuranceFee }))
  }

  async createOrder(
    _from: Address,
    _to: Address,
    _parcel: Parcel,
    _serviceCode: string,
    _metadata?: Record<string, any>
  ): Promise<ShippingOrder> {
    if (!this.enabled) {
      throw new Error("J&T provider chưa được cấu hình")
    }
    // Stub: gọi /jts.order.add với signature từ backend
    throw new Error("J&T createOrder: cần backend ký request HMAC trước khi gọi API thật")
  }

  async cancelOrder(_trackingNumber: string): Promise<void> {
    throw new Error("J&T cancelOrder: cần backend ký request")
  }

  async track(trackingNumber: string): Promise<TrackingInfo> {
    if (!this.enabled) {
      throw new Error("J&T provider chưa được cấu hình")
    }
    // Public tracking URL: https://www.jtexpress.vn/track/<trackingNumber>
    return {
      trackingNumber,
      currentStatus: "Cần tích hợp qua backend để tra cứu",
      events: [],
    }
  }
}
