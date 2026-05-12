import type {
  Address,
  Parcel,
  ShippingOrder,
  ShippingProvider,
  ShippingProviderConfig,
  ShippingRateOption,
  TrackingInfo,
} from "./types"

const GHN_BASE = "https://online-gateway.ghn.vn/shiip/public-api"
const GHN_BASE_DEV = "https://dev-online-gateway.ghn.vn/shiip/public-api"

const GHN_SERVICES = {
  STANDARD: { id: 53320, code: "STANDARD", name: "Hàng nhẹ tiêu chuẩn" },
  EXPRESS: { id: 53321, code: "EXPRESS", name: "Giao nhanh" },
} as const

export class GhnProvider implements ShippingProvider {
  id = "ghn" as const
  name = "Giao Hàng Nhanh (GHN)"
  logo = "https://placehold.co/40x40/dc2626/ffffff?text=GHN"
  enabled: boolean

  private baseUrl: string
  private token: string
  private shopId: string

  constructor(private config: ShippingProviderConfig) {
    this.token = config.token ?? config.apiKey ?? ""
    this.shopId = config.shopId ?? ""
    this.baseUrl = config.baseUrl ?? (config.sandbox ? GHN_BASE_DEV : GHN_BASE)
    this.enabled = !!this.token && !!this.shopId
  }

  private async request<T = any>(path: string, body: any): Promise<T> {
    if (!this.enabled) {
      throw new Error("GHN provider chưa được cấu hình (thiếu token/shopId)")
    }
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Token: this.token,
        ShopId: this.shopId,
      },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    if (!res.ok || data.code !== 200) {
      throw new Error(data.message ?? `GHN API lỗi (${res.status})`)
    }
    return data.data as T
  }

  async quote(from: Address, to: Address, parcel: Parcel): Promise<ShippingRateOption[]> {
    const options: ShippingRateOption[] = []
    for (const svc of Object.values(GHN_SERVICES)) {
      try {
        const data = await this.request<{
          total: number
          service_fee: number
          insurance_fee: number
        }>("/v2/shipping-order/fee", {
          service_id: svc.id,
          from_district_id: parseInt(from.districtCode ?? "0"),
          to_district_id: parseInt(to.districtCode ?? "0"),
          to_ward_code: to.wardCode ?? "",
          weight: parcel.weight,
          length: parcel.length ?? 20,
          width: parcel.width ?? 15,
          height: parcel.height ?? 10,
          insurance_value: parcel.declaredValue,
        })
        options.push({
          serviceCode: svc.code,
          serviceName: svc.name,
          fee: data.service_fee,
          insuranceFee: data.insurance_fee,
          codFee: 0,
          totalFee: data.total,
          estimatedDeliveryDays: svc.code === "EXPRESS" ? { min: 1, max: 2 } : { min: 2, max: 4 },
          cutoffTime: "16:00",
        })
      } catch {
        // Skip if service not available for this route
      }
    }
    return options
  }

  async createOrder(
    from: Address,
    to: Address,
    parcel: Parcel,
    serviceCode: string,
    metadata?: Record<string, any>
  ): Promise<ShippingOrder> {
    const svc = Object.values(GHN_SERVICES).find((s) => s.code === serviceCode)
    if (!svc) throw new Error(`Service ${serviceCode} not supported`)

    const data = await this.request<{
      order_code: string
      total_fee: number
      expected_delivery_time: string
    }>("/v2/shipping-order/create", {
      payment_type_id: metadata?.codAmount > 0 ? 2 : 1, // 2 = buyer pays
      note: metadata?.note ?? "",
      required_note: "CHOXEMHANGKHONGTHU", // Cho xem hàng, không cho thử
      from_name: from.name,
      from_phone: from.phone,
      from_address: from.fullAddress,
      from_ward_name: from.wardName,
      from_district_name: from.districtName,
      from_province_name: from.provinceName,
      to_name: to.name,
      to_phone: to.phone,
      to_address: to.fullAddress,
      to_ward_name: to.wardName,
      to_district_name: to.districtName,
      to_province_name: to.provinceName,
      cod_amount: metadata?.codAmount ?? 0,
      weight: parcel.weight,
      length: parcel.length ?? 20,
      width: parcel.width ?? 15,
      height: parcel.height ?? 10,
      service_id: svc.id,
      insurance_value: parcel.declaredValue,
      items: parcel.items.map((i) => ({
        name: i.name,
        quantity: i.quantity,
        weight: i.weight,
        price: i.value,
      })),
    })

    return {
      trackingNumber: data.order_code,
      providerId: this.id,
      serviceCode,
      fee: data.total_fee,
      estimatedDeliveryDate: data.expected_delivery_time,
    }
  }

  async cancelOrder(trackingNumber: string): Promise<void> {
    await this.request("/v2/switch-status/cancel", {
      order_codes: [trackingNumber],
    })
  }

  async track(trackingNumber: string): Promise<TrackingInfo> {
    const data = await this.request<{
      status: string
      log: Array<{ status: string; updated_date: string; description: string }>
    }>("/v2/shipping-order/detail", { order_code: trackingNumber })

    return {
      trackingNumber,
      currentStatus: data.status,
      events: (data.log ?? []).map((e) => ({
        timestamp: e.updated_date,
        status: e.status,
        note: e.description,
      })),
    }
  }
}
