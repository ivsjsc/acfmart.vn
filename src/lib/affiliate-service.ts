import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
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
  commission_bps: number | null
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
}

const AFFILIATE_LINKS = "affiliateLinks"
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
    commission_bps: commissionBps,
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
    const linkData = {
      affiliate_id: currentUid,
      customer_id: currentUid,
      short_code: shortCode,
      title: input.title?.trim() || null,
      target_url: targetUrl,
      target_type: normalizeTargetType(input.target_type),
      target_id: input.target_id?.trim() || null,
      commission_bps: null,
      status: "active" satisfies AffiliateLinkStatus,
      clicks: 0,
      unique_clicks: 0,
      conversions: 0,
      total_commission: 0,
      last_click_at: null,
      created_at: now,
      updated_at: serverTimestamp(),
    }

    await runTransaction(firestore, async (tx) => {
      const existing = await tx.get(linkRef)
      if (existing.exists()) throw new Error("Mã affiliate bị trùng, vui lòng thử lại")

      tx.set(linkRef, linkData)
    })

    return serviceOk({ link: normalizeAffiliateLink(shortCode, linkData) })
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
 * No authentication required — Firestore rules allow list when status == 'active'.
 */
export async function listPublicShowcaseLinks(
  userId: string,
  limitCount = 50
): Promise<ServiceResult<{ links: AffiliateLink[] }>> {
  try {
    if (!userId) return serviceErr("invalid-uid", "User ID is required")

    const linksRef = collection(firestore, AFFILIATE_LINKS)
    const [snakeSnap, camelSnap] = await Promise.all([
      getDocs(
        query(
          linksRef,
          where("affiliate_id", "==", userId),
          where("status", "==", "active"),
          limit(limitCount)
        )
      ),
      getDocs(
        query(
          linksRef,
          where("affiliateId", "==", userId),
          where("status", "==", "active"),
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

    return serviceOk({
      links: sortByCreatedDesc(Array.from(byId.values())).slice(0, limitCount),
    })
  } catch (err) {
    return toServiceError(err, "Không thể tải sản phẩm trưng bày")
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
