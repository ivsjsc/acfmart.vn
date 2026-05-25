import {
  collection,
  doc,
  deleteDoc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  Timestamp,
  where,
  type DocumentData,
} from "firebase/firestore"
import { auth, firestore } from "./firebase"
import {
  serviceErr,
  serviceOk,
  toServiceError,
  type ServiceResult,
} from "./service-result"

export type AffiliateAccountStatus = "pending" | "active" | "suspended"
export type AffiliateTier = "bronze" | "silver" | "gold" | "platinum" | "diamond"
export type AffiliateTargetType = "product" | "shop" | "category" | "campaign" | "home"
export type AffiliateLinkStatus = "active" | "paused" | "pending" | "expired"
export type AffiliateTransactionType = "commission" | "bonus" | "payout" | "adjustment"
export type AffiliateTransactionStatus = "pending" | "completed" | "failed" | "rejected"

export interface AffiliateAccount {
  id: string
  customer_id: string
  display_name: string
  status: AffiliateAccountStatus
  tier: AffiliateTier
  default_commission_bps: number
  total_clicks: number
  total_conversions: number
  lifetime_commission: number
  pending_commission: number
  paid_commission: number
}

export interface AffiliateLink {
  id: string
  short_code: string
  title: string | null
  target_url: string
  target_type: AffiliateTargetType
  target_id: string | null
  // Snapshot of the target product/shop captured at link-creation time so
  // the public showcase can render rich cards without an extra fetch per
  // link. Optional — links created before this field existed have null.
  product_image: string | null
  product_price: number | null
  commission_bps: number | null
  showcase_order: number | null
  showcase_visible: boolean
  status: AffiliateLinkStatus
  clicks: number
  unique_clicks: number
  conversions: number
  total_commission: number
  last_click_at: string | null
  created_at: string
}

export interface AffiliateTransaction {
  id: string
  date: string
  type: AffiliateTransactionType
  amount: number
  status: AffiliateTransactionStatus
  description: string
  order_code?: string
  order_id?: string
  link_id?: string
  idempotency_key?: string
}

export interface CreateAffiliateLinkInput {
  target_url: string
  target_type: AffiliateTargetType
  target_id?: string
  title?: string
  commission_bps?: number
  product_image?: string
  product_price?: number
  /** Shop that owns the product — required for commission tracking */
  shop_id?: string
  shop_name?: string
  /** Affiliate plan this link was created from */
  plan_id?: string
}

const AFFILIATE_LINKS = "affiliateLinks"
const AFFILIATE_SHOWCASE_LINKS = "affiliateShowcaseLinks"
const LEGACY_AFFILIATE_REFERRALS = "affiliateReferrals"
const AFFILIATE_PROFILE = "affiliateProfile"
const AFFILIATE_TRANSACTIONS = "affiliateTransactions"

const TARGET_TYPES: AffiliateTargetType[] = [
  "product",
  "shop",
  "category",
  "campaign",
  "home",
]
const LINK_STATUSES: AffiliateLinkStatus[] = ["active", "paused", "pending", "expired"]
const ACCOUNT_STATUSES: AffiliateAccountStatus[] = ["pending", "active", "suspended"]
const TIERS: AffiliateTier[] = ["bronze", "silver", "gold", "platinum", "diamond"]

async function requireCurrentUid(expectedUid?: string): Promise<string> {
  await auth.authStateReady()
  const currentUid = auth.currentUser?.uid
  if (!currentUid) throw new Error("Bạn cần đăng nhập để sử dụng Affiliate")
  if (expectedUid && expectedUid !== currentUid) {
    throw new Error("Bạn không có quyền truy cập dữ liệu Affiliate này")
  }
  return expectedUid ?? currentUid
}

function userAffiliateProfileRef(uid: string) {
  return doc(firestore, "users", uid, AFFILIATE_PROFILE, "current")
}

function userAffiliateTransactionRef(uid: string, id: string) {
  return doc(firestore, "users", uid, AFFILIATE_TRANSACTIONS, id)
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback
}

function asNullableString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback
}

function asTimestampIso(value: unknown, fallback = new Date(0).toISOString()): string {
  if (value instanceof Timestamp) return value.toDate().toISOString()
  if (value instanceof Date) return value.toISOString()
  if (typeof value === "string" && value.trim()) return value
  return fallback
}

function normalizeTargetType(value: unknown): AffiliateTargetType {
  return TARGET_TYPES.includes(value as AffiliateTargetType)
    ? (value as AffiliateTargetType)
    : "home"
}

function normalizeLinkStatus(value: unknown): AffiliateLinkStatus {
  return LINK_STATUSES.includes(value as AffiliateLinkStatus)
    ? (value as AffiliateLinkStatus)
    : "active"
}

function normalizeAccountStatus(value: unknown): AffiliateAccountStatus {
  return ACCOUNT_STATUSES.includes(value as AffiliateAccountStatus)
    ? (value as AffiliateAccountStatus)
    : "active"
}

function normalizeTier(value: unknown): AffiliateTier {
  return TIERS.includes(value as AffiliateTier) ? (value as AffiliateTier) : "bronze"
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}

function generateShortCode(uid: string): string {
  const safeUid = uid.replace(/[^a-zA-Z0-9]/g, "").slice(0, 6) || "acf"
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10)
  return `${safeUid}${Date.now().toString(36)}${random}`.toLowerCase()
}

function normalizeAffiliateLink(id: string, data: DocumentData): AffiliateLink {
  const createdAt =
    data.created_at ?? data.createdAt ?? data.createdAtIso ?? data.created_at_iso
  const targetUrl = data.target_url ?? data.targetUrl ?? data.originalUrl
  const shortCode = data.short_code ?? data.shortCode ?? data.code ?? id
  const commissionBps =
    typeof data.commission_bps === "number"
      ? data.commission_bps
      : typeof data.commissionBps === "number"
        ? data.commissionBps
        : typeof data.commissionRate === "number"
          ? Math.round(data.commissionRate * 100)
          : null

  const productImage =
    asNullableString(data.product_image) ??
    asNullableString(data.productImage) ??
    asNullableString(data.thumbnail) ??
    asNullableString(data.image)
  const productPriceRaw =
    typeof data.product_price === "number"
      ? data.product_price
      : typeof data.productPrice === "number"
        ? data.productPrice
        : typeof data.price === "number"
          ? data.price
          : null
  const showcaseOrderRaw =
    typeof data.showcase_order === "number"
      ? data.showcase_order
      : typeof data.showcaseOrder === "number"
        ? data.showcaseOrder
        : null
  const showcaseVisibleRaw =
    typeof data.showcase_visible === "boolean"
      ? data.showcase_visible
      : typeof data.showcaseVisible === "boolean"
        ? data.showcaseVisible
        : true

  return {
    id,
    short_code: asString(shortCode, id),
    title: asNullableString(data.title),
    target_url: asString(targetUrl),
    target_type: normalizeTargetType(data.target_type ?? data.targetType),
    target_id:
      asNullableString(data.target_id) ??
      asNullableString(data.targetId) ??
      asNullableString(data.productId) ??
      asNullableString(data.shopId),
    product_image: productImage,
    product_price: productPriceRaw,
    commission_bps: commissionBps,
    showcase_order: showcaseOrderRaw,
    showcase_visible: showcaseVisibleRaw,
    status: normalizeLinkStatus(data.status),
    clicks: asNumber(data.clicks),
    unique_clicks: asNumber(data.unique_clicks ?? data.uniqueClicks),
    conversions: asNumber(data.conversions),
    total_commission: asNumber(data.total_commission ?? data.totalCommission),
    last_click_at: data.last_click_at || data.lastClickAt
      ? asTimestampIso(data.last_click_at ?? data.lastClickAt)
      : null,
    created_at: asTimestampIso(createdAt),
  }
}

function normalizeAffiliateTransaction(id: string, data: DocumentData): AffiliateTransaction {
  return {
    id,
    date: asTimestampIso(data.date ?? data.created_at ?? data.createdAt),
    type: (["commission", "bonus", "payout", "adjustment"].includes(data.type)
      ? data.type
      : "commission") as AffiliateTransactionType,
    amount: asNumber(data.amount),
    status: (["pending", "completed", "failed", "rejected"].includes(data.status)
      ? data.status
      : "pending") as AffiliateTransactionStatus,
    description: asString(data.description, "Giao dịch affiliate"),
    order_code: asNullableString(data.order_code ?? data.orderCode) ?? undefined,
    order_id: asNullableString(data.order_id ?? data.orderId) ?? undefined,
    link_id: asNullableString(data.link_id ?? data.linkId) ?? undefined,
    idempotency_key: asNullableString(data.idempotency_key ?? data.idempotencyKey) ?? undefined,
  }
}

function sortByCreatedDesc<T extends { created_at?: string; date?: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const aDate = new Date(a.created_at ?? a.date ?? 0).getTime()
    const bDate = new Date(b.created_at ?? b.date ?? 0).getTime()
    return bDate - aDate
  })
}

function sortByShowcaseOrder(links: AffiliateLink[]): AffiliateLink[] {
  return [...links].sort((a, b) => {
    const aVisible = a.showcase_visible !== false
    const bVisible = b.showcase_visible !== false
    if (aVisible !== bVisible) return aVisible ? -1 : 1

    const aOrder = typeof a.showcase_order === "number" ? a.showcase_order : Number.MAX_SAFE_INTEGER
    const bOrder = typeof b.showcase_order === "number" ? b.showcase_order : Number.MAX_SAFE_INTEGER
    if (aOrder !== bOrder) return aOrder - bOrder

    const aDate = new Date(a.created_at ?? 0).getTime()
    const bDate = new Date(b.created_at ?? 0).getTime()
    if (aDate !== bDate) return bDate - aDate

    return a.title?.localeCompare(b.title ?? "", "vi") ?? 0
  })
}

function publicShowcaseLinkRef(uid: string, linkId: string) {
  return doc(firestore, "publicProfiles", uid, AFFILIATE_SHOWCASE_LINKS, linkId)
}

function buildPublicShowcaseLinkPayload(link: AffiliateLink): Record<string, unknown> {
  return {
    short_code: link.short_code,
    title: link.title,
    target_url: link.target_url,
    target_type: link.target_type,
    target_id: link.target_id,
    product_image: link.product_image,
    product_price: link.product_price,
    commission_bps: link.commission_bps,
    showcase_order: link.showcase_order ?? 0,
    showcase_visible: link.showcase_visible !== false,
    status: link.status,
    clicks: link.clicks,
    unique_clicks: link.unique_clicks,
    conversions: link.conversions,
    total_commission: link.total_commission,
    last_click_at: link.last_click_at ?? null,
    created_at: link.created_at,
    updated_at: new Date().toISOString(),
  }
}

async function syncPublicShowcaseLink(uid: string, link: AffiliateLink): Promise<void> {
  const mirrorRef = publicShowcaseLinkRef(uid, link.id)
  if (link.status !== "active" || link.showcase_visible === false) {
    await deleteDoc(mirrorRef).catch(() => undefined)
    return
  }
  await setDoc(mirrorRef, buildPublicShowcaseLinkPayload(link), { merge: true })
}

async function syncPublicShowcaseLinks(uid: string, links: AffiliateLink[]): Promise<void> {
  await Promise.all(links.map((link) => syncPublicShowcaseLink(uid, link)))
}

async function listAffiliateLinksCore(uid: string, limitCount = 100): Promise<AffiliateLink[]> {
  const linksRef = collection(firestore, AFFILIATE_LINKS)
  const [snakeSnap, camelSnap, legacySnap] = await Promise.all([
    getDocs(query(linksRef, where("affiliate_id", "==", uid), limit(limitCount))),
    getDocs(query(linksRef, where("affiliateId", "==", uid), limit(limitCount))),
    getDocs(
      query(
        collection(firestore, LEGACY_AFFILIATE_REFERRALS),
        where("affiliateId", "==", uid),
        limit(limitCount)
      )
    ),
  ])

  const byId = new Map<string, AffiliateLink>()
  snakeSnap.docs.forEach((linkDoc) =>
    byId.set(linkDoc.id, normalizeAffiliateLink(linkDoc.id, linkDoc.data()))
  )
  camelSnap.docs.forEach((linkDoc) =>
    byId.set(linkDoc.id, normalizeAffiliateLink(linkDoc.id, linkDoc.data()))
  )
  legacySnap.docs.forEach((linkDoc) => {
    const data = linkDoc.data()
    byId.set(
      `legacy-${linkDoc.id}`,
      normalizeAffiliateLink(`legacy-${linkDoc.id}`, {
        ...data,
        target_url: data.targetUrl ?? data.referralUrl ?? data.url,
        short_code: data.shortCode ?? data.code ?? linkDoc.id,
        target_type: data.targetType ?? "home",
        status: data.status ?? "active",
      })
    )
  })

  return sortByCreatedDesc(Array.from(byId.values())).slice(0, limitCount)
}

function buildAccountFromData(
  uid: string,
  profile: DocumentData | null,
  userProfile: DocumentData | null,
  links: AffiliateLink[]
): AffiliateAccount | null {
  if (!profile && links.length === 0) return null

  const totalClicks = links.reduce((sum, link) => sum + link.clicks, 0)
  const totalConversions = links.reduce((sum, link) => sum + link.conversions, 0)
  const totalCommission = links.reduce((sum, link) => sum + link.total_commission, 0)

  return {
    id: "current",
    customer_id: uid,
    display_name:
      asString(profile?.display_name) ||
      asString(profile?.displayName) ||
      asString(userProfile?.name) ||
      asString(userProfile?.displayName) ||
      asString(userProfile?.email) ||
      auth.currentUser?.email ||
      "Affiliate",
    status: normalizeAccountStatus(profile?.status),
    tier: normalizeTier(profile?.tier),
    default_commission_bps: asNumber(profile?.default_commission_bps ?? profile?.defaultCommissionBps, 500),
    total_clicks: asNumber(profile?.total_clicks ?? profile?.totalClicks, totalClicks),
    total_conversions: asNumber(
      profile?.total_conversions ?? profile?.totalConversions,
      totalConversions
    ),
    lifetime_commission: asNumber(
      profile?.lifetime_commission ?? profile?.lifetimeCommission,
      totalCommission
    ),
    pending_commission: asNumber(profile?.pending_commission ?? profile?.pendingCommission),
    paid_commission: asNumber(profile?.paid_commission ?? profile?.paidCommission),
  }
}

export async function getAffiliateAccount(
  uid?: string
): Promise<ServiceResult<{ account: AffiliateAccount | null }>> {
  try {
    const currentUid = await requireCurrentUid(uid)
    const [profileSnap, userSnap, links] = await Promise.all([
      getDoc(userAffiliateProfileRef(currentUid)),
      getDoc(doc(firestore, "users", currentUid)),
      listAffiliateLinksCore(currentUid, 200),
    ])

    const account = buildAccountFromData(
      currentUid,
      profileSnap.exists() ? profileSnap.data() : null,
      userSnap.exists() ? userSnap.data() : null,
      links
    )

    void syncPublicShowcaseLinks(currentUid, links).catch(() => undefined)

    return serviceOk({ account })
  } catch (err) {
    return toServiceError(err, "Không thể tải tài khoản Affiliate")
  }
}

export async function listAffiliateLinks(
  uid?: string,
  limitCount = 100
): Promise<ServiceResult<{ links: AffiliateLink[] }>> {
  try {
    const currentUid = await requireCurrentUid(uid)
    const links = await listAffiliateLinksCore(currentUid, limitCount)
    void syncPublicShowcaseLinks(currentUid, links).catch(() => undefined)
    return serviceOk({ links })
  } catch (err) {
    return toServiceError(err, "Không thể tải link Affiliate")
  }
}

export async function createAffiliateLink(
  input: CreateAffiliateLinkInput,
  uid?: string
): Promise<ServiceResult<{ link: AffiliateLink }>> {
  try {
    const currentUid = await requireCurrentUid(uid)
    const targetUrl = input.target_url.trim()
    if (!isHttpUrl(targetUrl)) {
      return serviceErr("invalid-url", "URL affiliate phải bắt đầu bằng http hoặc https")
    }

    const shortCode = generateShortCode(currentUid)
    const linkRef = doc(firestore, AFFILIATE_LINKS, shortCode)
    const now = Timestamp.now()
    const productImage = input.product_image?.trim() || null
    const productPrice =
      typeof input.product_price === "number" && Number.isFinite(input.product_price)
        ? input.product_price
        : null
    const linkData = {
      affiliate_id: currentUid,
      customer_id: currentUid,
      short_code: shortCode,
      title: input.title?.trim() || null,
      target_url: targetUrl,
      target_type: normalizeTargetType(input.target_type),
      target_id: input.target_id?.trim() || null,
      shop_id: input.shop_id?.trim() || null,
      shop_name: input.shop_name?.trim() || null,
      plan_id: input.plan_id?.trim() || null,
      product_image: productImage,
      product_price: productPrice,
      commission_bps: typeof input.commission_bps === "number" ? input.commission_bps : null,
      showcase_order: Timestamp.now().toMillis(),
      showcase_visible: true,
      status: "active" satisfies AffiliateLinkStatus,
      clicks: 0,
      unique_clicks: 0,
      conversions: 0,
      total_commission: 0,
      last_click_at: null,
      created_at: now,
      updated_at: serverTimestamp(),
    }

    await setDoc(linkRef, linkData)
    const link = normalizeAffiliateLink(shortCode, linkData)
    await syncPublicShowcaseLink(currentUid, link)

    return serviceOk({ link })
  } catch (err) {
    return toServiceError(err, "Không thể tạo link Affiliate")
  }
}

export async function listAffiliateTransactions(
  uid?: string,
  limitCount = 100
): Promise<ServiceResult<{ transactions: AffiliateTransaction[] }>> {
  try {
    const currentUid = await requireCurrentUid(uid)
    const [userTxSnap, legacySnap] = await Promise.all([
      getDocs(
        query(
          collection(firestore, "users", currentUid, AFFILIATE_TRANSACTIONS),
          limit(limitCount)
        )
      ),
      getDocs(
        query(
          collection(firestore, LEGACY_AFFILIATE_REFERRALS),
          where("affiliateId", "==", currentUid),
          limit(limitCount)
        )
      ),
    ])

    const byId = new Map<string, AffiliateTransaction>()
    userTxSnap.docs.forEach((txDoc) =>
      byId.set(txDoc.id, normalizeAffiliateTransaction(txDoc.id, txDoc.data()))
    )
    legacySnap.docs.forEach((txDoc) => {
      const data = txDoc.data()
      byId.set(
        `legacy-${txDoc.id}`,
        normalizeAffiliateTransaction(`legacy-${txDoc.id}`, {
          ...data,
          type: data.type ?? "commission",
          amount: data.amount ?? data.commission ?? data.commissionAmount,
          order_id: data.orderId,
          link_id: data.linkId,
          created_at: data.createdAt ?? data.created_at,
        })
      )
    })

    const transactions = sortByCreatedDesc(Array.from(byId.values())).slice(0, limitCount)
    return serviceOk({ transactions })
  } catch (err) {
    return toServiceError(err, "Không thể tải giao dịch Affiliate")
  }
}

/**
 * List active affiliate links for any user (public showcase).
 * No authentication required — reads from the public showcase mirror
 * under /publicProfiles/{uid}/affiliateShowcaseLinks.
 */
export async function listPublicShowcaseLinks(
  userId: string,
  limitCount = 50
): Promise<ServiceResult<{ links: AffiliateLink[] }>> {
  try {
    if (!userId) return serviceErr("invalid-uid", "User ID is required")

    const showcaseRef = collection(
      firestore,
      "publicProfiles",
      userId,
      AFFILIATE_SHOWCASE_LINKS
    )
    const snap = await getDocs(
      query(showcaseRef, orderBy("showcase_order", "asc"), limit(limitCount))
    )

    return serviceOk({
      links: sortByShowcaseOrder(
        snap.docs.map((linkDoc) => normalizeAffiliateLink(linkDoc.id, linkDoc.data()))
      ).slice(0, limitCount),
    })
  } catch (err) {
    return toServiceError(err, "Không thể tải sản phẩm trưng bày")
  }
}

export async function updateAffiliateLinkDisplay(
  linkId: string,
  input: { showcase_order?: number; showcase_visible?: boolean; title?: string },
  uid?: string
): Promise<ServiceResult<{ link: AffiliateLink }>> {
  try {
    const currentUid = await requireCurrentUid(uid)
    const ref = doc(firestore, AFFILIATE_LINKS, linkId)
    const snap = await getDoc(ref)
    if (!snap.exists()) {
      return serviceErr("not-found", "Không tìm thấy link affiliate")
    }
    const existing = snap.data() as DocumentData
    const ownerUid = asString(existing.affiliate_id ?? existing.affiliateId)
    if (ownerUid !== currentUid) {
      return serviceErr("forbidden", "Bạn không có quyền cập nhật link này")
    }

    const patch: Record<string, unknown> = {
      updated_at: serverTimestamp(),
    }
    if (input.title !== undefined) patch.title = input.title.trim()
    if (input.showcase_order !== undefined) patch.showcase_order = input.showcase_order
    if (input.showcase_visible !== undefined) patch.showcase_visible = input.showcase_visible

    await updateDoc(ref, patch)
    const nextLink = normalizeAffiliateLink(linkId, { ...existing, ...patch })
    await syncPublicShowcaseLink(currentUid, nextLink)

    return serviceOk({
      link: nextLink,
    })
  } catch (err) {
    return toServiceError(err, "Không thể cập nhật hiển thị link affiliate")
  }
}

export async function ensureAffiliateProfile(uid?: string): Promise<ServiceResult<void>> {
  try {
    const currentUid = await requireCurrentUid(uid)
    await setDoc(
      userAffiliateProfileRef(currentUid),
      {
        customer_id: currentUid,
        status: "active",
        tier: "bronze",
        default_commission_bps: 500,
        total_clicks: 0,
        total_conversions: 0,
        lifetime_commission: 0,
        pending_commission: 0,
        paid_commission: 0,
        updated_at: serverTimestamp(),
        created_at: serverTimestamp(),
      },
      { merge: true }
    )
    return serviceOk(undefined)
  } catch (err) {
    return toServiceError(err, "Không thể khởi tạo hồ sơ Affiliate")
  }
}
