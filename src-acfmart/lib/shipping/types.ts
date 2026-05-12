export type ShippingProviderId = "ghn" | "ghtk" | "jnt" | "viettel-post" | "ahamove"

export interface Address {
  name: string
  phone: string
  fullAddress: string
  wardCode?: string
  wardName: string
  districtCode?: string
  districtName: string
  provinceCode?: string
  provinceName: string
}

export interface Parcel {
  weight: number          // grams
  length?: number         // cm
  width?: number          // cm
  height?: number         // cm
  declaredValue: number   // VND, for COD/insurance
  items: Array<{
    name: string
    quantity: number
    weight: number
    value: number
  }>
}

export interface ShippingRateOption {
  serviceCode: string
  serviceName: string
  fee: number
  insuranceFee: number
  codFee: number
  totalFee: number
  estimatedDeliveryDays: { min: number; max: number }
  cutoffTime?: string  // "16:00" pickup cutoff
}

export interface ShippingOrder {
  trackingNumber: string
  providerId: ShippingProviderId
  serviceCode: string
  fee: number
  pickupDate?: string
  estimatedDeliveryDate?: string
  labelUrl?: string
}

export interface TrackingEvent {
  timestamp: string
  status: string
  location?: string
  note?: string
}

export interface TrackingInfo {
  trackingNumber: string
  currentStatus: string
  events: TrackingEvent[]
}

export interface ShippingProvider {
  id: ShippingProviderId
  name: string
  logo: string
  enabled: boolean

  /** Quote shipping rates for a parcel */
  quote(from: Address, to: Address, parcel: Parcel): Promise<ShippingRateOption[]>

  /** Create a shipping order, returns tracking number + label */
  createOrder(
    from: Address,
    to: Address,
    parcel: Parcel,
    serviceCode: string,
    metadata?: Record<string, any>
  ): Promise<ShippingOrder>

  /** Cancel a shipping order */
  cancelOrder(trackingNumber: string): Promise<void>

  /** Fetch tracking info */
  track(trackingNumber: string): Promise<TrackingInfo>
}

export interface ShippingProviderConfig {
  baseUrl?: string
  apiKey?: string
  shopId?: string
  token?: string
  sandbox?: boolean
}
