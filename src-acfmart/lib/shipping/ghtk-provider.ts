import type {
  Address,
  Parcel,
  ShippingOrder,
  ShippingProvider,
  ShippingProviderConfig,
  ShippingRateOption,
  TrackingInfo,
} from "./types"

const GHTK_BASE = "https://services.giaohangtietkiem.vn"

/**
 * Giao Hàng Tiết Kiệm (GHTK) provider
 * Docs: https://docs.giaohangtietkiem.vn/
 */
export class GhtkProvider implements ShippingProvider {
  id = "ghtk" as const
  name = "Giao Hàng Tiết Kiệm (GHTK)"
  logo = "https://placehold.co/40x40/22c55e/ffffff?text=GHTK"
  enabled: boolean

  private baseUrl: string
  private apiKey: string

  constructor(private config: ShippingProviderConfig) {
    this.apiKey = config.apiKey ?? config.token ?? ""
    this.baseUrl = config.baseUrl ?? GHTK_BASE
    this.enabled = !!this.apiKey
  }

  private async request<T = any>(
    path: string,
    method: "GET" | "POST" = "GET",
    body?: any
  ): Promise<T> {
    if (!this.enabled) {
      throw new Error("GHTK provider chưa được cấu hình (thiếu API key)")
    }
    const res = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Token: this.apiKey,
      },
      body: body ? JSON.stringify(body) : undefined,
    })
    const data = await res.json()
    if (!res.ok || !data.success) {
      throw new Error(data.message ?? `GHTK API lỗi (${res.status})`)
    }
    return data as T
  }

  async quote(from: Address, to: Address, parcel: Parcel): Promise<ShippingRateOption[]> {
    const q = new URLSearchParams({
      pick_province: from.provinceName,
      pick_district: from.districtName,
      province: to.provinceName,
      district: to.districtName,
      address: to.fullAddress,
      weight: String(parcel.weight),
      value: String(parcel.declaredValue),
      deliver_option: "none",
      transport: "road",
    })

    const data = await this.request<{
      fee: {
        name: string
        fee: number
        insurance_fee: number
        delivery_type: string
      }
    }>(`/services/shipment/fee?${q.toString()}`)

    return [
      {
        serviceCode: "STANDARD",
        serviceName: data.fee.name ?? "Tiêu chuẩn",
        fee: data.fee.fee,
        insuranceFee: data.fee.insurance_fee,
        codFee: 0,
        totalFee: data.fee.fee + data.fee.insurance_fee,
        estimatedDeliveryDays: { min: 2, max: 4 },
      },
    ]
  }

  async createOrder(
    from: Address,
    to: Address,
    parcel: Parcel,
    _serviceCode: string,
    metadata?: Record<string, any>
  ): Promise<ShippingOrder> {
    const orderId = metadata?.orderCode ?? `ACF${Date.now()}`

    const data = await this.request<{
      order: {
        label: string
        partner_id: string
        fee: number
        tracking_id: number
        estimated_pick_time?: string
        estimated_deliver_time?: string
      }
    }>("/services/shipment/order/?ver=1.5", "POST", {
      products: parcel.items.map((i) => ({
        name: i.name,
        weight: i.weight / 1000, // grams → kg
        quantity: i.quantity,
        product_code: "",
      })),
      order: {
        id: orderId,
        pick_name: from.name,
        pick_address: from.fullAddress,
        pick_province: from.provinceName,
        pick_district: from.districtName,
        pick_ward: from.wardName,
        pick_tel: from.phone,
        tel: to.phone,
        name: to.name,
        address: to.fullAddress,
        province: to.provinceName,
        district: to.districtName,
        ward: to.wardName,
        is_freeship: "0",
        pick_money: metadata?.codAmount ?? 0,
        note: metadata?.note ?? "",
        value: parcel.declaredValue,
        transport: "road",
      },
    })

    return {
      trackingNumber: data.order.label,
      providerId: this.id,
      serviceCode: "STANDARD",
      fee: data.order.fee,
      pickupDate: data.order.estimated_pick_time,
      estimatedDeliveryDate: data.order.estimated_deliver_time,
    }
  }

  async cancelOrder(trackingNumber: string): Promise<void> {
    await this.request(
      `/services/shipment/cancel/${encodeURIComponent(trackingNumber)}`,
      "POST"
    )
  }

  async track(trackingNumber: string): Promise<TrackingInfo> {
    const data = await this.request<{
      order: {
        status_text: string
        status: number
      }
    }>(`/services/shipment/v2/${encodeURIComponent(trackingNumber)}`)

    return {
      trackingNumber,
      currentStatus: data.order.status_text,
      events: [],
    }
  }
}
