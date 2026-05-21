type ShippingAddressInput = {
  name: string
  phone: string
  fullAddress: string
  wardName: string
  districtName: string
  provinceName: string
  wardCode?: string
  districtCode?: string
  provinceCode?: string
}

type ShippingParcelItem = {
  name: string
  weight: number
  quantity: number
  value: number
}

type ShippingParcelInput = {
  weight: number
  declaredValue: number
  items: ShippingParcelItem[]
}

type ShippingMetadataInput = {
  orderCode?: string
  codAmount?: number
  note?: string
  isCod?: boolean
}

type ShippingRateDto = {
  serviceCode: string
  serviceName: string
  providerId: string
  providerName: string
  fee: number
  insuranceFee: number
  codFee: number
  totalFee: number
  estimatedDeliveryDays: { min: number; max: number }
}

type ShippingOrderDto = {
  trackingNumber: string
  providerId: string
  serviceCode: string
  fee: number
  pickupDate?: string
  estimatedDeliveryDate?: string
  labelUrl?: string
}

type TrackingEventDto = {
  timestamp: string
  status: string
  location: string
  note?: string
}

type TrackingDto = {
  trackingNumber: string
  currentStatus: string
  events: TrackingEventDto[]
}

type GhtkConfig = {
  baseUrl: string
  token: string
  partnerCode: string
}

const DEFAULT_GHTK_BASE = "https://services.giaohangtietkiem.vn"
const DEFAULT_PROVIDER_ID = "ghtk"
const DEFAULT_PROVIDER_NAME = "Giao Hàng Tiết Kiệm (GHTK)"

function firstNonEmpty(...values: Array<string | undefined | null>): string {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim()
    }
  }
  return ""
}

function getGhtkConfig(): GhtkConfig {
  return {
    baseUrl: firstNonEmpty(process.env.OPEN_API, process.env.GHTK_API_BASE_URL, DEFAULT_GHTK_BASE),
    token: firstNonEmpty(process.env.API_TOKEN, process.env.GHTK_API_TOKEN),
    partnerCode: firstNonEmpty(process.env.PARTNER_CODE, process.env.GHTK_PARTNER_CODE),
  }
}

function ensureGhtkConfig(): GhtkConfig {
  const config = getGhtkConfig()
  if (!config.token || !config.partnerCode) {
    throw new Error("GHTK chưa được cấu hình đầy đủ. Thiếu API_TOKEN hoặc PARTNER_CODE.")
  }
  return config
}

function safeJsonParse(text: string): any {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

function toNumber(value: unknown, fallback = 0): number {
  const num = typeof value === "number" ? value : Number(value)
  return Number.isFinite(num) ? num : fallback
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback
}

function asOptionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined
}

function buildErrorMessage(payload: any, fallback: string): string {
  if (payload && typeof payload === "object") {
    if (typeof payload.message === "string" && payload.message.trim()) {
      return payload.message.trim()
    }
    if (typeof payload.error === "string" && payload.error.trim()) {
      return payload.error.trim()
    }
  }
  return fallback
}

function buildQueryParams(
  from: ShippingAddressInput,
  to: ShippingAddressInput,
  parcel: ShippingParcelInput
) {
  return new URLSearchParams({
    pick_province: from.provinceName,
    pick_district: from.districtName,
    province: to.provinceName,
    district: to.districtName,
    address: to.fullAddress,
    weight: String(Math.max(parcel.weight, 200)),
    value: String(Math.max(parcel.declaredValue, 0)),
    deliver_option: "none",
    transport: "road",
  })
}

async function ghtkRequest<T>(
  path: string,
  options: {
    method?: "GET" | "POST"
    body?: unknown
    contentType?: "json" | "form"
  } = {}
): Promise<T> {
  const config = ensureGhtkConfig()
  const headers: Record<string, string> = {
    Token: config.token,
    "X-Client-Source": config.partnerCode,
  }

  let body: string | undefined
  if (options.body !== undefined) {
    if (options.contentType === "form") {
      headers["Content-Type"] = "application/x-www-form-urlencoded"
      const searchParams = new URLSearchParams()
      for (const [key, value] of Object.entries(options.body as Record<string, unknown>)) {
        if (value === undefined || value === null) continue
        searchParams.set(key, String(value))
      }
      body = searchParams.toString()
    } else {
      headers["Content-Type"] = "application/json"
      body = JSON.stringify(options.body)
    }
  }

  const res = await fetch(`${config.baseUrl.replace(/\/$/, "")}${path}`, {
    method: options.method ?? "GET",
    headers,
    body,
  })

  const text = await res.text()
  const payload = text ? safeJsonParse(text) : null

  if (!res.ok) {
    throw new Error(buildErrorMessage(payload, `GHTK API lỗi (${res.status})`))
  }

  if (payload && typeof payload === "object" && payload.success === false) {
    throw new Error(buildErrorMessage(payload, "GHTK trả lỗi xử lý"))
  }

  return payload as T
}

function parseRateResponse(payload: any): {
  name: string
  fee: number
  insuranceFee: number
  deliveryType: string
} {
  const fee = payload?.fee ?? payload?.data?.fee ?? payload?.data ?? {}
  return {
    name: asString(fee.name, "Giao hàng tiết kiệm"),
    fee: toNumber(fee.fee, 0),
    insuranceFee: toNumber(fee.insurance_fee ?? fee.insuranceFee, 0),
    deliveryType: asString(fee.delivery_type ?? fee.deliveryType, "road"),
  }
}

function mapTrackingEvents(payload: any): TrackingEventDto[] {
  const rawEvents =
    payload?.log ??
    payload?.logs ??
    payload?.history ??
    payload?.data?.log ??
    payload?.data?.logs ??
    payload?.data?.history ??
    []

  if (!Array.isArray(rawEvents)) return []

  return rawEvents.map((event) => ({
    timestamp: asString(
      event.updated_date ?? event.updated_at ?? event.timestamp ?? event.time ?? event.created_at,
      new Date().toISOString()
    ),
    status: asString(event.status ?? event.state ?? event.status_text, "unknown"),
    location: asString(event.location ?? event.current_location ?? event.address, ""),
    note: asOptionalString(event.description ?? event.note ?? event.message),
  }))
}

export const shippingService = {
  getProviders() {
    return [
      {
        id: DEFAULT_PROVIDER_ID,
        name: DEFAULT_PROVIDER_NAME,
        description: "Dịch vụ giao hàng tiết kiệm tích hợp qua OpenAPI GHTK.",
        logo: "/shipping-logos/ghtk.png",
      },
    ]
  },

  async testGhtkConnection() {
    const payload = await ghtkRequest<any>("/services/authenticated", {
      method: "GET",
    })

    return {
      authenticated: true,
      providerId: DEFAULT_PROVIDER_ID,
      message: payload?.message ?? "Kết nối GHTK thành công",
      log_id: payload?.log_id ?? null,
    }
  },

  async calculateGhtkFee(input: {
    from: ShippingAddressInput
    to: ShippingAddressInput
    parcel: ShippingParcelInput
  }): Promise<ShippingRateDto> {
    const query = buildQueryParams(input.from, input.to, input.parcel)
    const payload = await ghtkRequest<any>(`/services/shipment/fee?${query.toString()}`)
    const rate = parseRateResponse(payload)

    return {
      serviceCode: "STANDARD",
      serviceName: rate.name,
      providerId: DEFAULT_PROVIDER_ID,
      providerName: DEFAULT_PROVIDER_NAME,
      fee: rate.fee,
      insuranceFee: rate.insuranceFee,
      codFee: 0,
      totalFee: rate.fee + rate.insuranceFee,
      estimatedDeliveryDays: { min: 2, max: 4 },
    }
  },

  async calculateRates(input: {
    from: ShippingAddressInput
    to: ShippingAddressInput
    parcel: ShippingParcelInput
    serviceType?: string
  }) {
    const rate = await this.calculateGhtkFee({
      from: input.from,
      to: input.to,
      parcel: input.parcel,
    })

    return [rate]
  },

  async createShippingOrder(input: {
    providerId: string
    serviceCode: string
    from: ShippingAddressInput
    to: ShippingAddressInput
    parcel: ShippingParcelInput
    metadata?: ShippingMetadataInput
  }): Promise<{ shippingOrder: ShippingOrderDto }> {
    if (input.providerId !== DEFAULT_PROVIDER_ID) {
      throw new Error(`Hệ thống hiện mới hỗ trợ ${DEFAULT_PROVIDER_NAME}`)
    }

    const orderCode = input.metadata?.orderCode ?? `ACF${Date.now()}`
    const payload = await ghtkRequest<any>(
      "/services/shipment/order/?ver=1.5",
      {
        method: "POST",
        body: {
          products: input.parcel.items.map((item) => ({
            name: item.name,
            weight: item.weight / 1000,
            quantity: item.quantity,
            product_code: "",
          })),
          order: {
            id: orderCode,
            pick_name: input.from.name,
            pick_address: input.from.fullAddress,
            pick_province: input.from.provinceName,
            pick_district: input.from.districtName,
            pick_ward: input.from.wardName,
            pick_tel: input.from.phone,
            tel: input.to.phone,
            name: input.to.name,
            address: input.to.fullAddress,
            province: input.to.provinceName,
            district: input.to.districtName,
            ward: input.to.wardName,
            is_freeship: input.metadata?.isCod ? "0" : "1",
            pick_money: input.metadata?.isCod
              ? Math.max(toNumber(input.metadata?.codAmount, 0), 0)
              : 0,
            note: input.metadata?.note ?? "",
            value: Math.max(input.parcel.declaredValue, 0),
            transport: "road",
          },
        },
        contentType: "json",
      }
    )

    const order = payload?.order ?? payload?.data?.order ?? payload?.data ?? {}
    const trackingNumber = asString(order.label ?? order.order_code ?? order.partner_id, "")
    if (!trackingNumber) {
      throw new Error("GHTK không trả về mã vận đơn")
    }

    return {
      shippingOrder: {
        trackingNumber,
        providerId: DEFAULT_PROVIDER_ID,
        serviceCode: input.serviceCode || "STANDARD",
        fee: toNumber(order.fee, 0),
        pickupDate: asOptionalString(order.estimated_pick_time),
        estimatedDeliveryDate: asOptionalString(order.estimated_deliver_time),
        labelUrl: asOptionalString(order.label),
      },
    }
  },

  async trackShippingOrder(trackingNumber: string): Promise<{ tracking: TrackingDto }> {
    const payload = await ghtkRequest<any>(`/services/shipment/v2/${encodeURIComponent(trackingNumber)}`)
    const order = payload?.order ?? payload?.data?.order ?? payload?.data ?? {}
    const currentStatus = asString(order.status_text ?? order.status, "unknown")

    return {
      tracking: {
        trackingNumber,
        currentStatus,
        events: mapTrackingEvents(order),
      },
    }
  },

  async cancelShippingOrder(trackingNumber: string): Promise<void> {
    await ghtkRequest(`/services/shipment/cancel/${encodeURIComponent(trackingNumber)}`, {
      method: "POST",
    })
  },

  async getGhtkFeePayload(input: {
    pick_province: string
    pick_district: string
    province: string
    district: string
    address: string
    weight: number
    value: number
    transport: string
    deliver_option: string[] | string
  }) {
    const payload = await ghtkRequest<any>(
      `/services/shipment/fee?${new URLSearchParams({
        pick_province: input.pick_province,
        pick_district: input.pick_district,
        province: input.province,
        district: input.district,
        address: input.address,
        weight: String(Math.max(input.weight, 200)),
        value: String(Math.max(input.value, 0)),
        deliver_option: Array.isArray(input.deliver_option)
          ? input.deliver_option[0] ?? "none"
          : input.deliver_option || "none",
        transport: input.transport || "road",
      }).toString()}`
    )

    const rate = parseRateResponse(payload)
    return {
      success: true,
      message: payload?.message ?? "OK",
      data: {
        fee: rate.fee,
        insurance_fee: rate.insuranceFee,
        transport: rate.deliveryType,
        service_id: "STANDARD",
        delivery_time: "2-4 ngày",
      },
    }
  },
}

export type {
  ShippingAddressInput,
  ShippingParcelInput,
  ShippingMetadataInput,
  ShippingRateDto,
  ShippingOrderDto,
  TrackingDto,
}
