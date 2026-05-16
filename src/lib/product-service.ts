import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  type QueryConstraint,
  type Unsubscribe,
} from "firebase/firestore"
import { firestore } from "./firebase"
import { writeAuditLog } from "./audit-log"

export type ProductStatus =
  | "draft"
  | "pending"
  | "approved"
  | "rejected"
  | "archived"

export type AcfVerifyStatus = "none" | "requested" | "approved" | "rejected"

export interface ProductVariantInput {
  id: string
  title: string
  sku: string
  price: number
  stock: number
}

export interface ProductDoc {
  id: string

  // Identity
  shopId: string // = firebase_uid of seller (matches Firestore rules)
  vendorId: string // = vendor doc id (for joining queries)
  shopName: string
  shopSlug: string

  // Content
  title: string
  handle: string
  description: string | null
  brand: string
  category: string
  thumbnail: string
  images: string[]

  // Pricing
  basePrice: number
  variants: ProductVariantInput[]

  // Inventory
  totalStock: number

  // Shipping
  weightGrams: number | null
  dimensions: { length: number; width: number; height: number } | null

  // Approval workflow
  status: ProductStatus
  rejectedReason: string | null
  submittedAt: Timestamp | null
  approvedAt: Timestamp | null
  approvedBy: string | null

  // ACF verification (anti-counterfeit registration)
  acfVerified: boolean
  acfVerifyStatus: AcfVerifyStatus

  // SEO
  metaDescription: string | null

  // Stats
  totalSold: number
  rating: number
  reviewCount: number
  views: number

  metadata: Record<string, unknown> | null
  created_at: Timestamp
  updated_at: Timestamp
}

export interface SubmitProductInput {
  shopId: string // firebase_uid
  vendorId: string // vendor doc id
  shopName: string
  shopSlug: string
  title: string
  handle?: string
  description?: string
  brand: string
  category: string
  thumbnail: string
  images: string[]
  basePrice: number
  variants?: ProductVariantInput[]
  weightGrams?: number
  dimensions?: { length: number; width: number; height: number }
  acfVerified?: boolean
  metaDescription?: string
}

const productsCol = collection(firestore, "products")
const PRODUCT_STATUSES: ProductStatus[] = [
  "draft",
  "pending",
  "approved",
  "rejected",
  "archived",
]
const ACF_VERIFY_STATUSES: AcfVerifyStatus[] = [
  "none",
  "requested",
  "approved",
  "rejected",
]

function normalizeString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback
}

function normalizeNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback
}

function normalizeStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : []
}

function normalizeVariants(value: unknown): ProductVariantInput[] {
  if (!Array.isArray(value)) return []
  return value.map((item, index) => {
    const variant = item && typeof item === "object" ? item as Record<string, unknown> : {}
    return {
      id: normalizeString(variant.id, `variant-${index}`),
      title: normalizeString(variant.title, `Phân loại ${index + 1}`),
      sku: normalizeString(variant.sku),
      price: normalizeNumber(variant.price),
      stock: normalizeNumber(variant.stock),
    }
  })
}

function normalizeProductStatus(value: unknown): ProductStatus {
  return typeof value === "string" && PRODUCT_STATUSES.includes(value as ProductStatus)
    ? value as ProductStatus
    : "draft"
}

function normalizeAcfVerifyStatus(value: unknown): AcfVerifyStatus {
  return typeof value === "string" && ACF_VERIFY_STATUSES.includes(value as AcfVerifyStatus)
    ? value as AcfVerifyStatus
    : "none"
}

function normalizeProductDoc(id: string, data: Record<string, unknown>): ProductDoc {
  const images = normalizeStringArray(data.images)
  const variants = normalizeVariants(data.variants)
  const category = normalizeString(data.category, "Chưa phân loại")
  const title = normalizeString(data.title, "Sản phẩm chưa đặt tên")
  const status = normalizeProductStatus(data.status)

  return {
    id,
    shopId: normalizeString(data.shopId),
    vendorId: normalizeString(data.vendorId),
    shopName: normalizeString(data.shopName, "Shop chưa cập nhật"),
    shopSlug: normalizeString(data.shopSlug),
    title,
    handle: normalizeString(data.handle, slugify(title)),
    description: normalizeString(data.description) || null,
    brand: normalizeString(data.brand, "Chưa cập nhật"),
    category,
    thumbnail: normalizeString(data.thumbnail, images[0] ?? ""),
    images,
    basePrice: normalizeNumber(data.basePrice ?? data.price),
    variants,
    totalStock: normalizeNumber(data.totalStock),
    weightGrams: typeof data.weightGrams === "number" ? data.weightGrams : null,
    dimensions:
      data.dimensions && typeof data.dimensions === "object"
        ? data.dimensions as ProductDoc["dimensions"]
        : null,
    status,
    rejectedReason: normalizeString(data.rejectedReason) || null,
    submittedAt: data.submittedAt as Timestamp | null ?? null,
    approvedAt: data.approvedAt as Timestamp | null ?? null,
    approvedBy: normalizeString(data.approvedBy) || null,
    acfVerified: data.acfVerified === true,
    acfVerifyStatus: normalizeAcfVerifyStatus(data.acfVerifyStatus),
    metaDescription: normalizeString(data.metaDescription) || null,
    totalSold: normalizeNumber(data.totalSold),
    rating: normalizeNumber(data.rating),
    reviewCount: normalizeNumber(data.reviewCount),
    views: normalizeNumber(data.views),
    metadata:
      data.metadata && typeof data.metadata === "object"
        ? data.metadata as Record<string, unknown>
        : null,
    created_at: data.created_at as Timestamp,
    updated_at: data.updated_at as Timestamp,
  }
}

function productCreatedAtMs(product: ProductDoc): number {
  return product.created_at?.toMillis?.() ?? 0
}

function sortProductsNewestFirst(products: ProductDoc[]): ProductDoc[] {
  return [...products].sort(
    (a, b) => productCreatedAtMs(b) - productCreatedAtMs(a)
  )
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80)
}

function computeTotalStock(
  basePrice: number,
  variants: ProductVariantInput[] | undefined
): number {
  if (variants && variants.length > 0) {
    return variants.reduce((sum, v) => sum + (v.stock || 0), 0)
  }
  // If no variants, stock tracking is at product level (default 0; seller fills later).
  return 0
}

function buildBaseProduct(
  input: SubmitProductInput,
  status: ProductStatus
): Omit<ProductDoc, "id"> {
  const now = Timestamp.now()
  return {
    shopId: input.shopId,
    vendorId: input.vendorId,
    shopName: input.shopName,
    shopSlug: input.shopSlug,
    title: input.title,
    handle: input.handle ?? slugify(input.title) + "-" + Date.now().toString(36),
    description: input.description ?? null,
    brand: input.brand,
    category: input.category,
    thumbnail: input.thumbnail,
    images: input.images,
    basePrice: input.basePrice,
    variants: input.variants ?? [],
    totalStock: computeTotalStock(input.basePrice, input.variants),
    weightGrams: input.weightGrams ?? null,
    dimensions: input.dimensions ?? null,
    status,
    rejectedReason: null,
    submittedAt: status === "pending" ? now : null,
    approvedAt: null,
    approvedBy: null,
    acfVerified: false, // only admin can set true via separate flow
    acfVerifyStatus: input.acfVerified ? "requested" : "none",
    metaDescription: input.metaDescription ?? null,
    totalSold: 0,
    rating: 0,
    reviewCount: 0,
    views: 0,
    metadata: null,
    created_at: now,
    updated_at: now,
  }
}

/**
 * Save product as draft (seller's working copy, not visible to admin queue).
 */
export async function saveDraftProduct(
  input: SubmitProductInput
): Promise<ProductDoc> {
  const productRef = doc(productsCol)
  const payload = buildBaseProduct(input, "draft")
  await setDoc(productRef, payload)

  await writeAuditLog({
    action: "product_create",
    actor_id: input.shopId,
    actor_email: "",
    actor_role: "seller",
    target_type: "product",
    target_id: productRef.id,
    details: { title: input.title, status: "draft" },
  })

  return { id: productRef.id, ...payload }
}

/**
 * Submit product to admin moderation queue. Status: pending.
 */
export async function submitProduct(
  input: SubmitProductInput
): Promise<ProductDoc> {
  const productRef = doc(productsCol)
  const payload = buildBaseProduct(input, "pending")
  await setDoc(productRef, payload)

  await writeAuditLog({
    action: "product_submit",
    actor_id: input.shopId,
    actor_email: "",
    actor_role: "seller",
    target_type: "product",
    target_id: productRef.id,
    details: { title: input.title, basePrice: input.basePrice },
  })

  return { id: productRef.id, ...payload }
}

/**
 * Update product fields. Seller can update own draft/pending/rejected/archived;
 * Admin can update anything. Status transitions guarded by rules.
 */
export async function updateProduct(
  productId: string,
  patch: Partial<Omit<ProductDoc, "id" | "created_at" | "shopId" | "vendorId">>
): Promise<void> {
  const productRef = doc(productsCol, productId)
  await updateDoc(productRef, {
    ...patch,
    updated_at: serverTimestamp(),
  })
}

/**
 * Seller resubmits a rejected/draft product. Reset reason, set status=pending.
 */
export async function resubmitProduct(productId: string): Promise<void> {
  const productRef = doc(productsCol, productId)
  await updateDoc(productRef, {
    status: "pending",
    rejectedReason: null,
    submittedAt: serverTimestamp(),
    updated_at: serverTimestamp(),
  })
}

/**
 * Seller archives own product (hides from buyer; keep for restore).
 */
export async function archiveProduct(productId: string): Promise<void> {
  const productRef = doc(productsCol, productId)
  await updateDoc(productRef, {
    status: "archived",
    updated_at: serverTimestamp(),
  })
}

/**
 * Admin approves a pending product → status=approved, becomes visible to buyers.
 */
export async function approveProduct(
  productId: string,
  moderator: { id: string; email: string; role: string },
  note?: string
): Promise<void> {
  const productRef = doc(productsCol, productId)
  await updateDoc(productRef, {
    status: "approved",
    approvedAt: serverTimestamp(),
    approvedBy: moderator.id,
    rejectedReason: null,
    updated_at: serverTimestamp(),
  })

  await writeAuditLog({
    action: "product_approve",
    actor_id: moderator.id,
    actor_email: moderator.email,
    actor_role: moderator.role,
    target_type: "product",
    target_id: productId,
    details: { note: note ?? null },
  })
}

/**
 * Admin rejects a pending product with reason → status=rejected, hidden from buyers.
 */
export async function rejectProduct(
  productId: string,
  moderator: { id: string; email: string; role: string },
  reason: string
): Promise<void> {
  const productRef = doc(productsCol, productId)
  await updateDoc(productRef, {
    status: "rejected",
    rejectedReason: reason,
    updated_at: serverTimestamp(),
  })

  await writeAuditLog({
    action: "product_reject",
    actor_id: moderator.id,
    actor_email: moderator.email,
    actor_role: moderator.role,
    target_type: "product",
    target_id: productId,
    details: { reason },
  })
}

export async function getProduct(productId: string): Promise<ProductDoc | null> {
  const productRef = doc(productsCol, productId)
  const snap = await getDoc(productRef)
  if (!snap.exists()) return null
  return normalizeProductDoc(snap.id, snap.data())
}

/**
 * Seller-facing list — own products across all statuses.
 */
export async function listSellerProducts(params: {
  shopId: string
  status?: ProductStatus
  q?: string
  limitCount?: number
}): Promise<{ products: ProductDoc[]; count: number }> {
  const constraints: QueryConstraint[] = [
    where("shopId", "==", params.shopId),
  ]
  if (params.status) constraints.push(where("status", "==", params.status))

  const q = query(productsCol, ...constraints)
  const snap = await getDocs(q)
  let products = sortProductsNewestFirst(
    snap.docs.map((d) => normalizeProductDoc(d.id, d.data()))
  )

  if (params.q) {
    const search = params.q.toLowerCase()
    products = products.filter(
      (p) =>
        p.title.toLowerCase().includes(search) ||
        p.brand.toLowerCase().includes(search) ||
        p.category.toLowerCase().includes(search)
    )
  }

  if (params.limitCount) products = products.slice(0, params.limitCount)

  return { products, count: products.length }
}

/**
 * Admin moderation queue — products by status across all shops.
 */
export async function listModerationProducts(params: {
  status?: ProductStatus
  q?: string
  limitCount?: number
}): Promise<{ products: ProductDoc[]; count: number }> {
  const constraints: QueryConstraint[] = []
  if (params.status) constraints.push(where("status", "==", params.status))

  const q = query(productsCol, ...constraints)
  const snap = await getDocs(q)
  let products = sortProductsNewestFirst(
    snap.docs.map((d) => normalizeProductDoc(d.id, d.data()))
  )

  if (params.q) {
    const search = params.q.toLowerCase()
    products = products.filter(
      (p) =>
        p.title.toLowerCase().includes(search) ||
        p.brand.toLowerCase().includes(search) ||
        p.shopName.toLowerCase().includes(search)
    )
  }

  if (params.limitCount) products = products.slice(0, params.limitCount)

  return { products, count: products.length }
}

/**
 * Per-status count for moderation tabs badges.
 */
export async function getModerationCounts(): Promise<
  Record<ProductStatus, number>
> {
  const statuses: ProductStatus[] = [
    "draft",
    "pending",
    "approved",
    "rejected",
    "archived",
  ]
  const counts = {} as Record<ProductStatus, number>
  await Promise.all(
    statuses.map(async (s) => {
      const q = query(productsCol, where("status", "==", s))
      const snap = await getDocs(q)
      counts[s] = snap.size
    })
  )
  return counts
}

/**
 * Realtime moderation queue. Same query as listModerationProducts but
 * streams updates via onSnapshot so admin sees seller submissions and
 * status changes without manual refresh.
 */
export function subscribeModerationProducts(
  params: { status?: ProductStatus; q?: string; limitCount?: number },
  onData: (result: { products: ProductDoc[]; count: number }) => void,
  onError: (err: Error) => void
): Unsubscribe {
  const constraints: QueryConstraint[] = []
  if (params.status) constraints.push(where("status", "==", params.status))
  if (params.limitCount) constraints.push(limit(params.limitCount))

  // Sort client-side to avoid dropping docs missing `created_at` (legacy data).
  const q = query(productsCol, ...constraints)

  return onSnapshot(
    q,
    (snap) => {
      let products = snap.docs
        .map((d) => normalizeProductDoc(d.id, d.data()))
        .sort((a, b) => {
          const ta = a.created_at?.toMillis?.() ?? 0
          const tb = b.created_at?.toMillis?.() ?? 0
          return tb - ta
        })
      if (params.q) {
        const search = params.q.toLowerCase()
        products = products.filter(
          (p) =>
            p.title.toLowerCase().includes(search) ||
            p.brand.toLowerCase().includes(search) ||
            p.shopName.toLowerCase().includes(search)
        )
      }
      onData({ products, count: products.length })
    },
    (err) => {
      console.error("[subscribeModerationProducts] Firestore error:", err)
      onError(err)
    }
  )
}

/**
 * Realtime per-status counts. Streams all products and tallies in-memory
 * because Firestore does not support count aggregations on the client.
 * For large catalogs replace with a Cloud Function-maintained counter doc.
 */
export function subscribeModerationCounts(
  onData: (counts: Record<ProductStatus, number>) => void,
  onError: (err: Error) => void
): Unsubscribe {
  return onSnapshot(
    productsCol,
    (snap) => {
      const counts: Record<ProductStatus, number> = {
        draft: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        archived: 0,
      }
      for (const d of snap.docs) {
        const status = d.data().status as ProductStatus | undefined
        if (status && status in counts) counts[status]++
      }
      onData(counts)
    },
    (err) => {
      console.error("[subscribeModerationCounts] Firestore error:", err)
      onError(err)
    }
  )
}

/**
 * Buyer-facing — approved products only. Optional category filter.
 */
export async function listApprovedProducts(params: {
  category?: string
  limitCount?: number
}): Promise<ProductDoc[]> {
  const constraints: QueryConstraint[] = [
    where("status", "==", "approved"),
  ]
  if (params.category) constraints.push(where("category", "==", params.category))

  const q = query(productsCol, ...constraints)
  const snap = await getDocs(q)
  const products = sortProductsNewestFirst(
    snap.docs.map((d) => normalizeProductDoc(d.id, d.data()))
  )
  return params.limitCount ? products.slice(0, params.limitCount) : products
}

export async function getApprovedProductByHandle(
  handle: string
): Promise<ProductDoc | null> {
  const q = query(
    productsCol,
    where("handle", "==", handle),
    where("status", "==", "approved"),
    limit(1)
  )
  const snap = await getDocs(q)
  if (snap.empty) return null
  const productDoc = snap.docs[0]
  return normalizeProductDoc(productDoc.id, productDoc.data())
}

/**
 * Convert ProductDoc to the shape consumed by existing ProductCard
 * (MockProduct from mock-data). Allows seamless display of real seller
 * products in buyer browsing without changing the card component.
 */
export function productDocToCardShape(p: ProductDoc) {
  const categorySlug = p.category
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
  const images = p.images.length > 0
    ? p.images
    : p.thumbnail
      ? [p.thumbnail]
      : ["https://placehold.co/600x600/f5f5f5/a3a3a3?text=ACFMart"]

  return {
    id: p.id,
    handle: p.handle,
    name: p.title,
    title: p.title,
    description: p.description ?? "",
    price: p.basePrice,
    images,
    thumbnail: p.thumbnail || images[0],
    rating: p.rating,
    reviewCount: p.reviewCount,
    shopId: p.shopId,
    categoryIds: [p.category],
    categorySlug,
    attributes: {},
    inventory: p.totalStock,
    qrCode: "",
    certifications: p.acfVerifyStatus === "approved" ? ["ACF"] : [],
    shippingInfo: {
      freeShip: false,
      expressDelivery: false,
      estimatedArrival: "",
    },
    sold: p.totalSold,
    brand: p.brand ?? "",
    verified: p.acfVerifyStatus === "approved",
    shopName: p.shopName,
  }
}
