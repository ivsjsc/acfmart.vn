// Shipping module types
export enum ShippingProviderId {
  GHN = "ghn",
  GHTK = "ghtk",
  JNT = "jnt",
  ViettelPost = "viettel-post",
  Ahamove = "ahamove"
}

export interface Address {
  name: string;
  phone: string;
  fullAddress: string;
  wardCode?: string;
  wardName: string;
  districtCode?: string;
  districtName: string;
  provinceCode?: string;
  provinceName: string;
}

export interface Parcel {
  weight: number;          // grams
  length?: number;         // cm
  width?: number;          // cm
  height?: number;         // cm
  declaredValue: number;   // VND, for COD/insurance
  items: Array<{
    name: string;
    quantity: number;
    weight: number;
    value: number;
  }>;
}

export interface ShippingRateOption {
  serviceCode: string;
  serviceName: string;
  providerId: ShippingProviderId;
  providerName: string;
  providerLogo: string;
  fee: number;
  insuranceFee: number;
  codFee: number;
  totalFee: number;
  estimatedDeliveryDays: { min: number; max: number };
  cutoffTime?: string;  // "16:00" pickup cutoff
}

export interface ShippingOrder {
  trackingNumber: string;
  providerId: ShippingProviderId;
  serviceCode: string;
  fee: number;
  pickupDate?: string;
  estimatedDeliveryDate?: string;
  labelUrl?: string;
}

export interface TrackingEvent {
  timestamp: string;
  status: string;
  location?: string;
  note?: string;
}

export interface TrackingInfo {
  trackingNumber: string;
  currentStatus: string;
  events: TrackingEvent[];
}