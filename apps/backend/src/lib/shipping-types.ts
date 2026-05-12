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
  weight: number
  length?: number
  width?: number
  height?: number
  declaredValue: number
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
  providerId: ShippingProviderId
  providerName: string
  providerLogo: string
  fee: number
  insuranceFee: number
  codFee: number
  totalFee: number
  estimatedDeliveryDays: { min: number; max: number }
  cutoffTime?: string
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

export interface TrackingInfo {
  trackingNumber: string
  currentStatus: string
  events: Array<{
    timestamp: string
    status: string
    location?: string
    note?: string
  }>
}
