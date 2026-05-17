import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  type Timestamp,
} from "firebase/firestore"
import { firestore } from "./firebase"

export type ShopDisplayLayout = "grid" | "carousel"

export type ShopDisplayModuleId =
  | "banner"
  | "best_sellers"
  | "flash_sale"
  | "categories"
  | "new_arrivals"
  | "reviews"
  | "about"

export interface ShopDisplayConfig {
  layout: ShopDisplayLayout
  moduleOrder: ShopDisplayModuleId[]
  enabledModules: ShopDisplayModuleId[]
  pinnedProductIds: string[]
}

export interface ShopProfileDoc {
  id: string
  shopId: string
  vendorId: string
  shopName: string
  shopSlug: string
  logoUrl: string | null
  bannerUrl: string | null
  displayConfig: ShopDisplayConfig
  affiliateCommissionBps: number
  updatedAt: Timestamp | null
  createdAt?: Timestamp | null
}

export const SHOP_DISPLAY_MODULES: Array<{
  id: ShopDisplayModuleId
  label: string
  description: string
}> = [
  {
    id: "banner",
    label: "Banner chính",
    description: "Ảnh bìa, nhận diện và thông điệp của shop.",
  },
  {
    id: "best_sellers",
    label: "Bán chạy",
    description: "Sản phẩm có doanh số cao nhất của shop.",
  },
  {
    id: "flash_sale",
    label: "Flash Sale",
    description: "Voucher/ưu đãi đang chạy hoặc sắp chạy.",
  },
  {
    id: "categories",
    label: "Theo danh mục",
    description: "Nhóm sản phẩm theo danh mục chính.",
  },
  {
    id: "new_arrivals",
    label: "Hàng mới",
    description: "Sản phẩm mới được duyệt gần đây.",
  },
  {
    id: "reviews",
    label: "Đánh giá",
    description: "Tín hiệu uy tín từ khách mua.",
  },
  {
    id: "about",
    label: "Câu chuyện shop",
    description: "Giới thiệu, chứng nhận và cam kết.",
  },
]

export const DEFAULT_SHOP_DISPLAY_CONFIG: ShopDisplayConfig = {
  layout: "grid",
  moduleOrder: SHOP_DISPLAY_MODULES.map((module) => module.id),
  enabledModules: ["banner", "best_sellers", "flash_sale", "categories", "new_arrivals", "reviews"],
  pinnedProductIds: [],
}

const shopProfilesCol = "shopProfiles"
const moduleIds = new Set(SHOP_DISPLAY_MODULES.map((module) => module.id))

function normalizeDisplayConfig(value: unknown): ShopDisplayConfig {
  if (!value || typeof value !== "object") return DEFAULT_SHOP_DISPLAY_CONFIG
  const data = value as Partial<ShopDisplayConfig>
  const layout = data.layout === "carousel" ? "carousel" : "grid"
  const moduleOrder = Array.isArray(data.moduleOrder)
    ? data.moduleOrder.filter((id): id is ShopDisplayModuleId => moduleIds.has(id as ShopDisplayModuleId))
    : []
  const enabledModules = Array.isArray(data.enabledModules)
    ? data.enabledModules.filter((id): id is ShopDisplayModuleId => moduleIds.has(id as ShopDisplayModuleId))
    : []
  const pinnedProductIds = Array.isArray(data.pinnedProductIds)
    ? data.pinnedProductIds
        .filter((id): id is string => typeof id === "string" && id.length <= 180)
        .slice(0, 12)
    : []

  return {
    layout,
    moduleOrder: moduleOrder.length > 0 ? moduleOrder : DEFAULT_SHOP_DISPLAY_CONFIG.moduleOrder,
    enabledModules:
      enabledModules.length > 0 ? enabledModules : DEFAULT_SHOP_DISPLAY_CONFIG.enabledModules,
    pinnedProductIds,
  }
}

function normalizeShopProfile(id: string, data: Record<string, unknown>): ShopProfileDoc {
  return {
    id,
    shopId: typeof data.shopId === "string" ? data.shopId : id,
    vendorId: typeof data.vendorId === "string" ? data.vendorId : "",
    shopName: typeof data.shopName === "string" ? data.shopName : "Shop",
    shopSlug: typeof data.shopSlug === "string" ? data.shopSlug : "",
    logoUrl: typeof data.logoUrl === "string" ? data.logoUrl : null,
    bannerUrl: typeof data.bannerUrl === "string" ? data.bannerUrl : null,
    displayConfig: normalizeDisplayConfig(data.displayConfig),
    affiliateCommissionBps:
      typeof data.affiliateCommissionBps === "number" &&
      Number.isFinite(data.affiliateCommissionBps)
        ? data.affiliateCommissionBps
        : 500,
    updatedAt: (data.updatedAt as Timestamp | null) ?? null,
    createdAt: (data.createdAt as Timestamp | null) ?? null,
  }
}

export async function getShopProfile(shopId: string): Promise<ShopProfileDoc | null> {
  const snap = await getDoc(doc(firestore, shopProfilesCol, shopId))
  if (!snap.exists()) return null
  return normalizeShopProfile(snap.id, snap.data())
}

export async function saveShopProfile(input: {
  shopId: string
  vendorId: string
  shopName: string
  shopSlug: string
  logoUrl?: string | null
  bannerUrl?: string | null
  displayConfig: ShopDisplayConfig
  affiliateCommissionBps: number
}): Promise<void> {
  const commission = Math.max(0, Math.min(10000, Math.round(input.affiliateCommissionBps)))
  await setDoc(
    doc(firestore, shopProfilesCol, input.shopId),
    {
      shopId: input.shopId,
      vendorId: input.vendorId,
      shopName: input.shopName,
      shopSlug: input.shopSlug,
      logoUrl: input.logoUrl ?? null,
      bannerUrl: input.bannerUrl ?? null,
      displayConfig: {
        layout: input.displayConfig.layout,
        moduleOrder: input.displayConfig.moduleOrder,
        enabledModules: input.displayConfig.enabledModules,
        pinnedProductIds: input.displayConfig.pinnedProductIds.slice(0, 12),
      },
      affiliateCommissionBps: commission,
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    },
    { merge: true }
  )
}

