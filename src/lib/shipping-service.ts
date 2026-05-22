import { backendApiUrl, backendHeaders, postBackend } from "./api-base"

export interface ShippingOption {
  id: string
  name: string
  description: string
  price: number
  estimatedDays: number
  provider: 'GHN' | 'GHTK' | 'VTPost' | 'internal'
  logo: string
}

export interface ShippingAddress {
  name: string
  phone: string
  address: string
  ward: string
  district: string
  city: string
  latitude?: number
  longitude?: number
}

export interface ShippingRateRequest {
  from: ShippingAddress
  to: ShippingAddress
  weight: number // in grams
  value: number // insurance value
  serviceType?: 'standard' | 'express' | 'cod'
}

export interface ShippingRate {
  serviceId: string
  serviceName: string
  provider: string
  price: number
  estimatedDays: number
  insuranceFee?: number
  codFee?: number
  providerId?: string
  serviceCode?: string
}

export interface ShippingStatusInfo {
  trackingNumber: string
  providerId: string
  trackingStatus?: string
}

export interface TrackingInfo {
  trackingNumber: string
  provider: string
  status: 'pending' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'returned' | 'lost'
  statusDescription: string
  progress: Array<{
    timestamp: string
    location: string
    status: string
    description: string
  }>
}

export class ShippingService {
  /**
   * Calculate shipping rates for different providers
   */
  static async calculateRates(request: ShippingRateRequest): Promise<ShippingRate[]> {
    const data = await postBackend<{
      rates: Array<{
        serviceCode: string
        serviceName: string
        providerId: string
        providerName: string
        fee: number
        insuranceFee: number
        codFee: number
        totalFee: number
        estimatedDeliveryDays: { min: number; max: number }
      }>
    }>("/store/shipping/rates", {
      from: {
        name: request.from.name,
        phone: request.from.phone,
        fullAddress: request.from.address,
        wardName: request.from.ward,
        districtName: request.from.district,
        provinceName: request.from.city,
        latitude: request.from.latitude,
        longitude: request.from.longitude,
      },
      to: {
        name: request.to.name,
        phone: request.to.phone,
        fullAddress: request.to.address,
        wardName: request.to.ward,
        districtName: request.to.district,
        provinceName: request.to.city,
        latitude: request.to.latitude,
        longitude: request.to.longitude,
      },
      parcel: {
        weight: request.weight,
        declaredValue: request.value,
        items: [],
      },
      serviceType: request.serviceType ?? "standard",
    })

    return data.rates.map((rate) => ({
      serviceId: `${rate.providerId}:${rate.serviceCode}`,
      serviceName: rate.serviceName,
      provider: rate.providerName,
      providerId: rate.providerId,
      serviceCode: rate.serviceCode,
      price: rate.totalFee,
      estimatedDays: rate.estimatedDeliveryDays.max,
      insuranceFee: rate.insuranceFee,
      codFee: request.serviceType === "cod" ? rate.codFee : 0,
    }))
  }

  /**
   * Create a shipping order with the selected provider
   */
  static async createShippingOrder(
    rate: ShippingRate,
    from: ShippingAddress,
    to: ShippingAddress,
    items: Array<{ name: string; weight: number; value: number; quantity: number }>,
    isCod: boolean,
    note?: string
  ): Promise<{ success: boolean; trackingNumber?: string; error?: string }> {
    if (!from.name || !to.name || !from.phone || !to.phone) {
      return {
        success: false,
        error: 'Thông tin người gửi hoặc người nhận không đầy đủ'
      }
    }
    
    if (items.length === 0) {
      return {
        success: false,
        error: 'Danh sách sản phẩm trống'
      }
    }

    try {
      const providerId = rate.providerId || rate.serviceId.split(":")[0]
      const serviceCode = rate.serviceCode || rate.serviceId.split(":")[1] || rate.serviceId
      const data = await postBackend<{
        shippingOrder: {
          trackingNumber: string
        }
      }>("/store/shipping/orders", {
        providerId,
        serviceCode,
        from: {
          name: from.name,
          phone: from.phone,
          fullAddress: from.address,
          wardName: from.ward,
          districtName: from.district,
          provinceName: from.city,
          latitude: from.latitude,
          longitude: from.longitude,
        },
        to: {
          name: to.name,
          phone: to.phone,
          fullAddress: to.address,
          wardName: to.ward,
          districtName: to.district,
          provinceName: to.city,
          latitude: to.latitude,
          longitude: to.longitude,
        },
        parcel: {
          weight: items.reduce((sum, item) => sum + item.weight * item.quantity, 0),
          declaredValue: items.reduce((sum, item) => sum + item.value * item.quantity, 0),
          items,
        },
        metadata: {
          codAmount: isCod ? items.reduce((sum, item) => sum + item.value * item.quantity, 0) : 0,
          note,
          isCod,
        },
      })

      return {
        success: true,
        trackingNumber: data.shippingOrder.trackingNumber,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Tạo đơn vận chuyển thất bại",
      }
    }
  }

  /**
   * Track a shipment by tracking number
   */
  static async trackShipment(
    trackingNumber: string,
    providerId?: string
  ): Promise<TrackingInfo | null> {
    const inferredProviderId =
      providerId ||
      (trackingNumber.includes(".") || trackingNumber.startsWith("S") ? "ghtk" : "ghn")
    const res = await fetch(
      backendApiUrl(`/store/shipping/track/${trackingNumber}?providerId=${inferredProviderId}`),
      {
      headers: backendHeaders(),
      }
    )
    const data = await res.json().catch(() => null)
    if (!res.ok || !data?.tracking) return null

    return {
      trackingNumber,
      provider: inferredProviderId.toUpperCase(),
      status: "in_transit",
      statusDescription: data.tracking.currentStatus,
      progress: (data.tracking.events || []).map((event: any) => ({
        timestamp: event.timestamp,
        location: event.location || "",
        status: event.status,
        description: event.note || event.status,
      })),
    }
  }
}
