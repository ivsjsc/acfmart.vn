import type { ShippingAddress } from "./shipping-service"

export interface ProductWarehouse {
  id: string
  warehouseName: string
  contactName: string
  contactPhone: string
  fullAddress: string
  ward: string
  district: string
  city: string
  latitude: number | null
  longitude: number | null
  note: string | null
  isDefault: boolean
}

export interface WarehouseRouteSelection {
  warehouse: ProductWarehouse
  routeLabel: string
  distanceKm: number | null
  selectionReason: "default" | "address-match" | "nearest"
}

export interface ShippingOriginPayload {
  warehouseId: string
  warehouseName: string
  contactName: string
  contactPhone: string
  fullAddress: string
  ward: string
  district: string
  city: string
  latitude: number | null
  longitude: number | null
  routeLabel: string
  distanceKm: number | null
  selectionReason: WarehouseRouteSelection["selectionReason"]
}

export interface VendorPickupSource {
  owner_name?: string
  owner_phone?: string
  pickup_warehouses?: unknown
  pickup_address?: {
    full_address?: string
    ward?: string
    district?: string
    city?: string
  } | null
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value.trim() : fallback
}

function optionalString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null
}

function optionalNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null
}

function normalizeLocation(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .trim()
}

function locationMatches(left: string, right: string): boolean {
  const a = normalizeLocation(left)
  const b = normalizeLocation(right)
  return a !== "" && a === b
}

function haversineKm(
  leftLat: number,
  leftLng: number,
  rightLat: number,
  rightLng: number
): number {
  const earthRadiusKm = 6371
  const lat1 = (leftLat * Math.PI) / 180
  const lat2 = (rightLat * Math.PI) / 180
  const dLat = ((rightLat - leftLat) * Math.PI) / 180
  const dLng = ((rightLng - leftLng) * Math.PI) / 180

  const sinLat = Math.sin(dLat / 2)
  const sinLng = Math.sin(dLng / 2)
  const a =
    sinLat * sinLat +
    Math.cos(lat1) * Math.cos(lat2) * sinLng * sinLng
  return 2 * earthRadiusKm * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function routeSummary(warehouse: ProductWarehouse, destination: ShippingAddress): string {
  const destinationSummary = [destination.district, destination.city]
    .filter(Boolean)
    .join(", ")
  const warehouseSummary = [warehouse.district, warehouse.city]
    .filter(Boolean)
    .join(", ")
  return `Kho ${warehouse.warehouseName} · ${warehouseSummary} → ${destinationSummary}`.trim()
}

export function normalizeWarehouse(
  value: unknown,
  fallback: Partial<ProductWarehouse> = {}
): ProductWarehouse | null {
  if (!value || typeof value !== "object") return null
  const data = value as Record<string, unknown>
  const warehouseName = asString(
    data.warehouseName ?? data.label ?? data.name,
    fallback.warehouseName ?? "Kho hàng"
  )
  const fullAddress = asString(
    data.fullAddress ?? data.address ?? data.full_address,
    fallback.fullAddress ?? ""
  )
  const contactPhone = asString(
    data.contactPhone ?? data.contact_phone ?? data.owner_phone ?? data.phone,
    fallback.contactPhone ?? ""
  )
  const ward = asString(data.ward, fallback.ward ?? "")
  const district = asString(data.district, fallback.district ?? "")
  const city = asString(data.city, fallback.city ?? "")

  if (!warehouseName || !fullAddress || !contactPhone || !ward || !district || !city) {
    return null
  }

  return {
    id: asString(data.id ?? data.warehouseId ?? fallback.id ?? `${Date.now()}`),
    warehouseName,
    contactName: asString(
      data.contactName ?? data.contact_name ?? data.owner_name ?? data.name,
      fallback.contactName ?? ""
    ),
    contactPhone,
    fullAddress,
    ward,
    district,
    city,
    latitude: optionalNumber(data.latitude ?? data.lat),
    longitude: optionalNumber(data.longitude ?? data.lng ?? data.lon),
    note: optionalString(data.note),
    isDefault: data.isDefault === true || data.default === true,
  }
}

export function normalizeWarehouseList(
  value: unknown,
  fallback: Partial<ProductWarehouse> = {}
): ProductWarehouse[] {
  const source = Array.isArray(value)
    ? value
    : value && typeof value === "object"
      ? [value]
      : []

  const normalized = source
    .map((item, index) =>
      normalizeWarehouse(item, {
        ...fallback,
        id: fallback.id ?? `warehouse-${index}`,
        warehouseName: fallback.warehouseName ?? `Kho ${index + 1}`,
      })
    )
    .filter((item): item is ProductWarehouse => !!item)
    .map((item, index) => ({
      ...item,
      id: item.id || `${fallback.id ?? "warehouse"}-${index}`,
    }))

  if (normalized.length === 0) return []

  const defaultIndex = normalized.findIndex((item) => item.isDefault)
  if (defaultIndex >= 0) {
    return normalized.map((item, index) => ({
      ...item,
      isDefault: index === defaultIndex,
    }))
  }

  return normalized.map((item, index) => ({
    ...item,
    isDefault: index === 0,
  }))
}

export function warehouseToShippingAddress(warehouse: ProductWarehouse): ShippingAddress {
  return {
    name: warehouse.contactName || warehouse.warehouseName,
    phone: warehouse.contactPhone,
    address: warehouse.fullAddress,
    ward: warehouse.ward,
    district: warehouse.district,
    city: warehouse.city,
    latitude: warehouse.latitude ?? undefined,
    longitude: warehouse.longitude ?? undefined,
  }
}

export function vendorPickupToWarehouse(
  vendor: VendorPickupSource,
  fallbackId = "vendor-pickup"
): ProductWarehouse | null {
  const pickup = vendor.pickup_address
  const contactPhone = asString(vendor.owner_phone, "")
  if (!pickup?.full_address || !pickup.ward || !pickup.district || !pickup.city || !contactPhone) {
    return null
  }

  return {
    id: fallbackId,
    warehouseName: "Kho mặc định",
    contactName: asString(vendor.owner_name, "Kho hàng"),
    contactPhone,
    fullAddress: pickup.full_address.trim(),
    ward: pickup.ward.trim(),
    district: pickup.district.trim(),
    city: pickup.city.trim(),
    latitude: null,
    longitude: null,
    note: null,
    isDefault: true,
  }
}

export function vendorPickupWarehouses(vendor: VendorPickupSource): ProductWarehouse[] {
  const warehouses = normalizeWarehouseList(vendor.pickup_warehouses)
  if (warehouses.length > 0) return warehouses

  const fallback = vendorPickupToWarehouse(vendor)
  return fallback ? [fallback] : []
}

export function selectBestWarehouse(
  warehouses: ProductWarehouse[],
  destination: Pick<ShippingAddress, "ward" | "district" | "city" | "latitude" | "longitude">
): WarehouseRouteSelection | null {
  if (warehouses.length === 0) return null

  const withScores = warehouses.map((warehouse) => {
    const hasCoordinates =
      typeof warehouse.latitude === "number" &&
      typeof warehouse.longitude === "number" &&
      typeof destination.latitude === "number" &&
      typeof destination.longitude === "number"

    const distanceKm = hasCoordinates
      ? haversineKm(
          warehouse.latitude as number,
          warehouse.longitude as number,
          destination.latitude as number,
          destination.longitude as number
        )
      : null

    const addressScore =
      (locationMatches(warehouse.city, destination.city) ? 100 : 0) +
      (locationMatches(warehouse.district, destination.district) ? 30 : 0) +
      (locationMatches(warehouse.ward, destination.ward) ? 10 : 0) +
      (warehouse.isDefault ? 5 : 0)

    const score = distanceKm != null ? 1000 - distanceKm : addressScore

    return {
      warehouse,
      distanceKm,
      score,
      addressScore,
    }
  })

  withScores.sort((left, right) => {
    if (left.score !== right.score) return right.score - left.score
    if (left.distanceKm != null && right.distanceKm != null && left.distanceKm !== right.distanceKm) {
      return left.distanceKm - right.distanceKm
    }
    if (left.warehouse.isDefault !== right.warehouse.isDefault) {
      return left.warehouse.isDefault ? -1 : 1
    }
    return left.warehouse.warehouseName.localeCompare(right.warehouse.warehouseName)
  })

  const selected = withScores[0]
  const selectionReason: WarehouseRouteSelection["selectionReason"] =
    selected.distanceKm != null
      ? "nearest"
      : selected.addressScore > 0
        ? "address-match"
        : "default"

  return {
    warehouse: selected.warehouse,
    routeLabel: routeSummary(selected.warehouse, destination as ShippingAddress),
    distanceKm: selected.distanceKm != null ? Math.round(selected.distanceKm * 10) / 10 : null,
    selectionReason,
  }
}

export function buildShippingOriginPayload(
  selection: WarehouseRouteSelection
): ShippingOriginPayload {
  return {
    warehouseId: selection.warehouse.id,
    warehouseName: selection.warehouse.warehouseName,
    contactName: selection.warehouse.contactName,
    contactPhone: selection.warehouse.contactPhone,
    fullAddress: selection.warehouse.fullAddress,
    ward: selection.warehouse.ward,
    district: selection.warehouse.district,
    city: selection.warehouse.city,
    latitude: selection.warehouse.latitude,
    longitude: selection.warehouse.longitude,
    routeLabel: selection.routeLabel,
    distanceKm: selection.distanceKm,
    selectionReason: selection.selectionReason,
  }
}
