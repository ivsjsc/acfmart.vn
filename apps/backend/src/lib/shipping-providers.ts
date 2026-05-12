import { env, hasEnv, requireEnv } from "./env"
import type {
  Address,
  Parcel,
  ShippingOrder,
  ShippingProviderId,
  ShippingRateOption,
  TrackingInfo,
} from "./shipping-types"

type ProviderQuote = ShippingRateOption & {
  providerId: ShippingProviderId
  providerName: string
  providerLogo: string
}

function configuredProviders(): ShippingProviderId[] {
  const providers: ShippingProviderId[] = []
  if (hasEnv("GHN_TOKEN") && hasEnv("GHN_SHOP_ID")) {
    providers.push("ghn" as ShippingProviderId)
  }
  if (hasEnv("GHTK_TOKEN")) {
    providers.push("ghtk" as ShippingProviderId)
  }
  if (hasEnv("JNT_API_KEY") && hasEnv("JNT_SECRET")) {
    providers.push("jnt" as ShippingProviderId)
  }
  return providers
}

async function requestJson<T>(
  url: string,
  options: RequestInit & { headers?: Record<string, string> }
): Promise<T> {
  const res = await fetch(url, options)
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const message =
      typeof data?.message === "string"
        ? data.message
        : typeof data?.error === "string"
        ? data.error
        : `HTTP ${res.status}`
    throw new Error(message)
  }
  return data as T
}

async function ghnRequest<T>(path: string, body: unknown): Promise<T> {
  const token = requireEnv("GHN_TOKEN")
  const shopId = requireEnv("GHN_SHOP_ID")
  const baseUrl =
    env("GHN_BASE_URL") || "https://online-gateway.ghn.vn/shiip/public-api"

  const data = await requestJson<{ code: number; message?: string; data: T }>(
    `${baseUrl}${path}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Token: token,
        ShopId: shopId,
      },
      body: JSON.stringify(body),
    }
  )

  if (data.code !== 200) {
    throw new Error(data.message || "GHN request failed")
  }

  return data.data
}

async function quoteGhn(
  from: Address,
  to: Address,
  parcel: Parcel
): Promise<ProviderQuote[]> {
  const services = [
    { id: Number(env("GHN_STANDARD_SERVICE_ID") || 53320), code: "STANDARD", name: "GHN tiêu chuẩn" },
    { id: Number(env("GHN_EXPRESS_SERVICE_ID") || 53321), code: "EXPRESS", name: "GHN giao nhanh" },
  ]

  const quotes = await Promise.allSettled(
    services.map(async (service) => {
      const data = await ghnRequest<{
        total: number
        service_fee: number
        insurance_fee: number
      }>("/v2/shipping-order/fee", {
        service_id: service.id,
        from_district_id: Number(from.districtCode || 0),
        to_district_id: Number(to.districtCode || 0),
        to_ward_code: to.wardCode || "",
        weight: parcel.weight,
        length: parcel.length || 20,
        width: parcel.width || 15,
        height: parcel.height || 10,
        insurance_value: parcel.declaredValue,
      })

      return {
        serviceCode: service.code,
        serviceName: service.name,
        providerId: "ghn" as ShippingProviderId,
        providerName: "Giao Hàng Nhanh",
        providerLogo: "https://placehold.co/40x40/dc2626/ffffff?text=GHN",
        fee: data.service_fee,
        insuranceFee: data.insurance_fee,
        codFee: 0,
        totalFee: data.total,
        estimatedDeliveryDays:
          service.code === "EXPRESS" ? { min: 1, max: 2 } : { min: 2, max: 4 },
        cutoffTime: "16:00",
      }
    })
  )

  return quotes.flatMap((quote) => (quote.status === "fulfilled" ? [quote.value] : []))
}

async function createGhnOrder(input: {
  from: Address
  to: Address
  parcel: Parcel
  serviceCode: string
  metadata?: Record<string, any>
}): Promise<ShippingOrder> {
  const serviceId =
    input.serviceCode === "EXPRESS"
      ? Number(env("GHN_EXPRESS_SERVICE_ID") || 53321)
      : Number(env("GHN_STANDARD_SERVICE_ID") || 53320)

  const data = await ghnRequest<{
    order_code: string
    total_fee: number
    expected_delivery_time?: string
  }>("/v2/shipping-order/create", {
    payment_type_id: input.metadata?.codAmount > 0 ? 2 : 1,
    note: input.metadata?.note || "",
    required_note: "CHOXEMHANGKHONGTHU",
    from_name: input.from.name,
    from_phone: input.from.phone,
    from_address: input.from.fullAddress,
    from_ward_name: input.from.wardName,
    from_district_name: input.from.districtName,
    from_province_name: input.from.provinceName,
    to_name: input.to.name,
    to_phone: input.to.phone,
    to_address: input.to.fullAddress,
    to_ward_name: input.to.wardName,
    to_district_name: input.to.districtName,
    to_province_name: input.to.provinceName,
    cod_amount: input.metadata?.codAmount || 0,
    weight: input.parcel.weight,
    length: input.parcel.length || 20,
    width: input.parcel.width || 15,
    height: input.parcel.height || 10,
    service_id: serviceId,
    insurance_value: input.parcel.declaredValue,
    items: input.parcel.items.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      weight: item.weight,
      price: item.value,
    })),
  })

  return {
    trackingNumber: data.order_code,
    providerId: "ghn" as ShippingProviderId,
    serviceCode: input.serviceCode,
    fee: data.total_fee,
    estimatedDeliveryDate: data.expected_delivery_time,
  }
}

async function trackGhn(trackingNumber: string): Promise<TrackingInfo> {
  const data = await ghnRequest<{
    status: string
    log?: Array<{ status: string; updated_date: string; description?: string }>
  }>("/v2/shipping-order/detail", { order_code: trackingNumber })

  return {
    trackingNumber,
    currentStatus: data.status,
    events: (data.log || []).map((event) => ({
      timestamp: event.updated_date,
      status: event.status,
      note: event.description,
    })),
  }
}

async function ghtkRequest<T>(
  path: string,
  method: "GET" | "POST" = "GET",
  body?: unknown
): Promise<T> {
  const token = requireEnv("GHTK_TOKEN")
  const baseUrl = env("GHTK_BASE_URL") || "https://services.giaohangtietkiem.vn"
  const data = await requestJson<T>(`${baseUrl}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Token: token,
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  if ((data as any).success === false) {
    throw new Error((data as any).message || "GHTK request failed")
  }

  return data
}

async function quoteGhtk(
  from: Address,
  to: Address,
  parcel: Parcel
): Promise<ProviderQuote[]> {
  const query = new URLSearchParams({
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

  const data = await ghtkRequest<{
    fee: {
      name?: string
      fee: number
      insurance_fee?: number
    }
  }>(`/services/shipment/fee?${query.toString()}`)

  return [
    {
      serviceCode: "STANDARD",
      serviceName: data.fee.name || "GHTK tiêu chuẩn",
      providerId: "ghtk" as ShippingProviderId,
      providerName: "Giao Hàng Tiết Kiệm",
      providerLogo: "https://placehold.co/40x40/22c55e/ffffff?text=GHTK",
      fee: data.fee.fee,
      insuranceFee: data.fee.insurance_fee || 0,
      codFee: 0,
      totalFee: data.fee.fee + (data.fee.insurance_fee || 0),
      estimatedDeliveryDays: { min: 2, max: 4 },
    },
  ]
}

async function createGhtkOrder(input: {
  from: Address
  to: Address
  parcel: Parcel
  metadata?: Record<string, any>
}): Promise<ShippingOrder> {
  const orderCode = input.metadata?.orderCode || `ACF${Date.now()}`
  const data = await ghtkRequest<{
    order: {
      label: string
      fee: number
      estimated_pick_time?: string
      estimated_deliver_time?: string
    }
  }>("/services/shipment/order/?ver=1.5", "POST", {
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
      is_freeship: "0",
      pick_money: input.metadata?.codAmount || 0,
      note: input.metadata?.note || "",
      value: input.parcel.declaredValue,
      transport: "road",
    },
  })

  return {
    trackingNumber: data.order.label,
    providerId: "ghtk" as ShippingProviderId,
    serviceCode: "STANDARD",
    fee: data.order.fee,
    pickupDate: data.order.estimated_pick_time,
    estimatedDeliveryDate: data.order.estimated_deliver_time,
  }
}

async function trackGhtk(trackingNumber: string): Promise<TrackingInfo> {
  const data = await ghtkRequest<{
    order: {
      status_text: string
    }
  }>(`/services/shipment/v2/${encodeURIComponent(trackingNumber)}`)

  return {
    trackingNumber,
    currentStatus: data.order.status_text,
    events: [],
  }
}

export async function quoteShippingProviders(input: {
  from: Address
  to: Address
  parcel: Parcel
}): Promise<ProviderQuote[]> {
  const providers = configuredProviders()
  if (!providers.length) {
    throw new Error("No shipping providers are configured")
  }

  const requests = providers
    .filter((provider) => provider !== ("jnt" as ShippingProviderId))
    .map((provider) =>
      provider === ("ghn" as ShippingProviderId)
        ? quoteGhn(input.from, input.to, input.parcel)
        : quoteGhtk(input.from, input.to, input.parcel)
    )

  const settled = await Promise.allSettled(requests)
  const rates = settled
    .flatMap((result) => (result.status === "fulfilled" ? result.value : []))
    .sort((a, b) => a.totalFee - b.totalFee)

  if (!rates.length) {
    throw new Error("No shipping rates are available for this route")
  }

  return rates
}

export async function createShippingProviderOrder(input: {
  providerId: ShippingProviderId
  from: Address
  to: Address
  parcel: Parcel
  serviceCode: string
  metadata?: Record<string, any>
}): Promise<ShippingOrder> {
  if (input.providerId === ("ghn" as ShippingProviderId)) {
    return createGhnOrder(input)
  }
  if (input.providerId === ("ghtk" as ShippingProviderId)) {
    return createGhtkOrder(input)
  }
  throw new Error("J&T order creation requires a signed server integration and is not enabled")
}

export async function trackShippingProviderOrder(
  providerId: ShippingProviderId,
  trackingNumber: string
): Promise<TrackingInfo> {
  if (providerId === ("ghn" as ShippingProviderId)) {
    return trackGhn(trackingNumber)
  }
  if (providerId === ("ghtk" as ShippingProviderId)) {
    return trackGhtk(trackingNumber)
  }
  throw new Error("Tracking for this provider is not enabled")
}
