/**
 * Affiliate Plan Service — TikTok-style affiliate system.
 *
 * Flow:
 *   1. Shop creates an AffiliatePlan (Open or Targeted) for their products
 *   2. Creator browses plans in the Affiliate Marketplace
 *   3. Creator applies → AffiliateApplication (auto-approved for Open plans)
 *   4. Approved creator generates link with shopId + planId embedded
 *   5. Buyer clicks link → conversion tracked back to shop + creator
 *
 * Collections:
 *   - affiliatePlans/{planId}
 *   - affiliateApplications/{applicationId}
 */
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  type DocumentData,
} from "firebase/firestore"
import { auth, firestore } from "./firebase"
import {
  serviceErr,
  serviceOk,
  toServiceError,
  type ServiceResult,
} from "./service-result"

// ─── Types ───────────────────────────────────────────────────────────
export type PlanType = "open" | "targeted"
export type PlanStatus = "active" | "paused" | "expired" | "draft"
export type ApplicationStatus = "pending" | "approved" | "rejected"

export interface AffiliatePlan {
  id: string
  shopId: string
  shopName: string
  shopLogo: string | null
  type: PlanType
  commissionBps: number          // basis points, e.g. 500 = 5%
  title: string
  description: string | null
  status: PlanStatus
  /** Product IDs included in this plan. Empty = all shop products. */
  productIds: string[]
  /** Snapshot of products for display (first 4) */
  productSnapshots: AffiliatePlanProductSnapshot[]
  /** For targeted plans: invited creator UIDs */
  invitedCreatorIds: string[]
  applicantCount: number
  approvedCount: number
  totalClicks: number
  totalConversions: number
  totalCommission: number
  createdAt: string
  updatedAt: string
}

export interface AffiliatePlanProductSnapshot {
  id: string
  name: string
  thumbnail: string
  price: number
}

export interface AffiliateApplication {
  id: string
  planId: string
  planTitle: string
  shopId: string
  shopName: string
  creatorId: string
  creatorName: string
  creatorAvatar: string | null
  status: ApplicationStatus
  commissionBps: number
  note: string | null
  appliedAt: string
  reviewedAt: string | null
  reviewedBy: string | null
}

export interface CreatePlanInput {
  shopId: string
  shopName: string
  shopLogo?: string
  type: PlanType
  commissionBps: number
  title: string
  description?: string
  productIds?: string[]
  productSnapshots?: AffiliatePlanProductSnapshot[]
  invitedCreatorIds?: string[]
}

export interface ApplyToPlanInput {
  planId: string
  creatorName: string
  creatorAvatar?: string
  note?: string
}

// ─── Constants ───────────────────────────────────────────────────────
const PLANS = "affiliatePlans"
const APPLICATIONS = "affiliateApplications"

// ─── Helpers ─────────────────────────────────────────────────────────
function asString(v: unknown, fb = ""): string {
  return typeof v === "string" ? v : fb
}
function asNumber(v: unknown, fb = 0): number {
  return typeof v === "number" && Number.isFinite(v) ? v : fb
}
function asTimestampIso(v: unknown): string {
  if (v instanceof Timestamp) return v.toDate().toISOString()
  if (v instanceof Date) return v.toISOString()
  if (typeof v === "string" && v.trim()) return v
  return new Date().toISOString()
}
function asStringArray(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x) => typeof x === "string") : []
}

async function requireUid(): Promise<string> {
  await auth.authStateReady()
  const uid = auth.currentUser?.uid
  if (!uid) throw new Error("Bạn cần đăng nhập")
  return uid
}

// ─── Normalize ───────────────────────────────────────────────────────
function normalizePlan(id: string, d: DocumentData): AffiliatePlan {
  return {
    id,
    shopId: asString(d.shopId),
    shopName: asString(d.shopName, "Shop"),
    shopLogo: typeof d.shopLogo === "string" ? d.shopLogo : null,
    type: d.type === "targeted" ? "targeted" : "open",
    commissionBps: asNumber(d.commissionBps, 500),
    title: asString(d.title, "Kế hoạch Affiliate"),
    description: typeof d.description === "string" ? d.description : null,
    status: (["active", "paused", "expired", "draft"] as PlanStatus[]).includes(d.status)
      ? d.status : "active",
    productIds: asStringArray(d.productIds),
    productSnapshots: Array.isArray(d.productSnapshots)
      ? d.productSnapshots.map((p: any) => ({
          id: asString(p.id),
          name: asString(p.name),
          thumbnail: asString(p.thumbnail),
          price: asNumber(p.price),
        }))
      : [],
    invitedCreatorIds: asStringArray(d.invitedCreatorIds),
    applicantCount: asNumber(d.applicantCount),
    approvedCount: asNumber(d.approvedCount),
    totalClicks: asNumber(d.totalClicks),
    totalConversions: asNumber(d.totalConversions),
    totalCommission: asNumber(d.totalCommission),
    createdAt: asTimestampIso(d.createdAt ?? d.created_at),
    updatedAt: asTimestampIso(d.updatedAt ?? d.updated_at),
  }
}

function normalizeApplication(id: string, d: DocumentData): AffiliateApplication {
  return {
    id,
    planId: asString(d.planId),
    planTitle: asString(d.planTitle),
    shopId: asString(d.shopId),
    shopName: asString(d.shopName),
    creatorId: asString(d.creatorId),
    creatorName: asString(d.creatorName, "Creator"),
    creatorAvatar: typeof d.creatorAvatar === "string" ? d.creatorAvatar : null,
    status: (["pending", "approved", "rejected"] as ApplicationStatus[]).includes(d.status)
      ? d.status : "pending",
    commissionBps: asNumber(d.commissionBps),
    note: typeof d.note === "string" ? d.note : null,
    appliedAt: asTimestampIso(d.appliedAt ?? d.applied_at),
    reviewedAt: d.reviewedAt ? asTimestampIso(d.reviewedAt) : null,
    reviewedBy: typeof d.reviewedBy === "string" ? d.reviewedBy : null,
  }
}

// ─── Plan CRUD (Seller) ──────────────────────────────────────────────

/** Create a new affiliate plan (seller only) */
export async function createAffiliatePlan(
  input: CreatePlanInput
): Promise<ServiceResult<{ plan: AffiliatePlan }>> {
  try {
    const uid = await requireUid()
    if (uid !== input.shopId) {
      return serviceErr("forbidden", "Bạn chỉ có thể tạo kế hoạch cho shop của mình")
    }

    const ref = doc(collection(firestore, PLANS))
    const data = {
      shopId: input.shopId,
      shopName: input.shopName,
      shopLogo: input.shopLogo || null,
      type: input.type,
      commissionBps: Math.max(0, Math.min(5000, input.commissionBps)),
      title: input.title.trim(),
      description: input.description?.trim() || null,
      status: "active" as PlanStatus,
      productIds: input.productIds ?? [],
      productSnapshots: (input.productSnapshots ?? []).slice(0, 8),
      invitedCreatorIds: input.invitedCreatorIds ?? [],
      applicantCount: 0,
      approvedCount: 0,
      totalClicks: 0,
      totalConversions: 0,
      totalCommission: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    await setDoc(ref, data)
    return serviceOk({ plan: normalizePlan(ref.id, { ...data, createdAt: new Date(), updatedAt: new Date() }) })
  } catch (err) {
    return toServiceError(err, "Không thể tạo kế hoạch affiliate")
  }
}

/** List plans for a shop (seller view) */
export async function listShopPlans(
  shopId: string,
  limitCount = 50
): Promise<ServiceResult<{ plans: AffiliatePlan[] }>> {
  try {
    await requireUid()
    const snap = await getDocs(
      query(
        collection(firestore, PLANS),
        where("shopId", "==", shopId),
        orderBy("createdAt", "desc"),
        limit(limitCount)
      )
    )
    const plans = snap.docs.map((d) => normalizePlan(d.id, d.data()))
    return serviceOk({ plans })
  } catch (err) {
    return toServiceError(err, "Không thể tải kế hoạch affiliate")
  }
}

/** Update plan status or commission (seller only) */
export async function updateAffiliatePlan(
  planId: string,
  updates: Partial<Pick<AffiliatePlan, "status" | "commissionBps" | "title" | "description" | "productIds" | "productSnapshots">>
): Promise<ServiceResult<void>> {
  try {
    const uid = await requireUid()
    const ref = doc(firestore, PLANS, planId)
    const snap = await getDoc(ref)
    if (!snap.exists()) return serviceErr("not-found", "Kế hoạch không tồn tại")
    if (snap.data().shopId !== uid) return serviceErr("forbidden", "Không có quyền")

    const patch: Record<string, any> = { updatedAt: serverTimestamp() }
    if (updates.status) patch.status = updates.status
    if (typeof updates.commissionBps === "number") {
      patch.commissionBps = Math.max(0, Math.min(5000, updates.commissionBps))
    }
    if (updates.title) patch.title = updates.title.trim()
    if (typeof updates.description === "string") patch.description = updates.description.trim() || null
    if (updates.productIds) patch.productIds = updates.productIds
    if (updates.productSnapshots) patch.productSnapshots = updates.productSnapshots.slice(0, 8)

    await updateDoc(ref, patch)
    return serviceOk(undefined)
  } catch (err) {
    return toServiceError(err, "Không thể cập nhật kế hoạch")
  }
}

/** Delete a plan (seller only, soft delete via status) */
export async function deleteAffiliatePlan(planId: string): Promise<ServiceResult<void>> {
  try {
    const uid = await requireUid()
    const ref = doc(firestore, PLANS, planId)
    const snap = await getDoc(ref)
    if (!snap.exists()) return serviceErr("not-found", "Kế hoạch không tồn tại")
    if (snap.data().shopId !== uid) return serviceErr("forbidden", "Không có quyền")

    await deleteDoc(ref)
    return serviceOk(undefined)
  } catch (err) {
    return toServiceError(err, "Không thể xóa kế hoạch")
  }
}

// ─── Marketplace (Creator) ───────────────────────────────────────────

/** List active open plans (affiliate marketplace) */
export async function listMarketplacePlans(
  limitCount = 50
): Promise<ServiceResult<{ plans: AffiliatePlan[] }>> {
  try {
    const snap = await getDocs(
      query(
        collection(firestore, PLANS),
        where("status", "==", "active"),
        where("type", "==", "open"),
        orderBy("createdAt", "desc"),
        limit(limitCount)
      )
    )
    const plans = snap.docs.map((d) => normalizePlan(d.id, d.data()))
    return serviceOk({ plans })
  } catch (err) {
    return toServiceError(err, "Không thể tải marketplace affiliate")
  }
}

/** Get a single plan by ID */
export async function getAffiliatePlan(
  planId: string
): Promise<ServiceResult<{ plan: AffiliatePlan | null }>> {
  try {
    const snap = await getDoc(doc(firestore, PLANS, planId))
    if (!snap.exists()) return serviceOk({ plan: null })
    return serviceOk({ plan: normalizePlan(snap.id, snap.data()) })
  } catch (err) {
    return toServiceError(err, "Không thể tải kế hoạch")
  }
}

// ─── Applications (Creator ↔ Seller) ─────────────────────────────────

/** Creator applies to a plan */
export async function applyToPlan(
  input: ApplyToPlanInput
): Promise<ServiceResult<{ application: AffiliateApplication }>> {
  try {
    const uid = await requireUid()

    // Get plan
    const planSnap = await getDoc(doc(firestore, PLANS, input.planId))
    if (!planSnap.exists()) return serviceErr("not-found", "Kế hoạch không tồn tại")
    const plan = planSnap.data()

    if (plan.status !== "active") {
      return serviceErr("inactive", "Kế hoạch này không còn hoạt động")
    }

    // Shop cannot apply to own plan
    if (plan.shopId === uid) {
      return serviceErr("self-apply", "Shop không thể tự apply kế hoạch của mình")
    }

    // Check duplicate
    const existing = await getDocs(
      query(
        collection(firestore, APPLICATIONS),
        where("planId", "==", input.planId),
        where("creatorId", "==", uid),
        limit(1)
      )
    )
    if (!existing.empty) {
      return serviceErr("duplicate", "Bạn đã đăng ký kế hoạch này rồi")
    }

    // Auto-approve for open plans
    const autoApproved = plan.type === "open"

    const ref = doc(collection(firestore, APPLICATIONS))
    const appData = {
      planId: input.planId,
      planTitle: asString(plan.title),
      shopId: plan.shopId,
      shopName: asString(plan.shopName),
      creatorId: uid,
      creatorName: input.creatorName,
      creatorAvatar: input.creatorAvatar || null,
      status: autoApproved ? "approved" : "pending",
      commissionBps: asNumber(plan.commissionBps),
      note: input.note?.trim() || null,
      appliedAt: serverTimestamp(),
      reviewedAt: autoApproved ? serverTimestamp() : null,
      reviewedBy: autoApproved ? "system" : null,
    }

    await setDoc(ref, appData)

    // Update plan counters
    const planRef = doc(firestore, PLANS, input.planId)
    const counterPatch: Record<string, any> = {
      applicantCount: (plan.applicantCount ?? 0) + 1,
      updatedAt: serverTimestamp(),
    }
    if (autoApproved) {
      counterPatch.approvedCount = (plan.approvedCount ?? 0) + 1
    }
    await updateDoc(planRef, counterPatch)

    return serviceOk({
      application: normalizeApplication(ref.id, {
        ...appData,
        appliedAt: new Date(),
        reviewedAt: autoApproved ? new Date() : null,
      }),
    })
  } catch (err) {
    return toServiceError(err, "Không thể đăng ký kế hoạch affiliate")
  }
}

/** List applications for a plan (seller view) */
export async function listPlanApplications(
  planId: string,
  limitCount = 100
): Promise<ServiceResult<{ applications: AffiliateApplication[] }>> {
  try {
    await requireUid()
    const snap = await getDocs(
      query(
        collection(firestore, APPLICATIONS),
        where("planId", "==", planId),
        orderBy("appliedAt", "desc"),
        limit(limitCount)
      )
    )
    const apps = snap.docs.map((d) => normalizeApplication(d.id, d.data()))
    return serviceOk({ applications: apps })
  } catch (err) {
    return toServiceError(err, "Không thể tải danh sách đăng ký")
  }
}

/** List my applications (creator view) */
export async function listMyApplications(
  limitCount = 100
): Promise<ServiceResult<{ applications: AffiliateApplication[] }>> {
  try {
    const uid = await requireUid()
    const snap = await getDocs(
      query(
        collection(firestore, APPLICATIONS),
        where("creatorId", "==", uid),
        orderBy("appliedAt", "desc"),
        limit(limitCount)
      )
    )
    const apps = snap.docs.map((d) => normalizeApplication(d.id, d.data()))
    return serviceOk({ applications: apps })
  } catch (err) {
    return toServiceError(err, "Không thể tải danh sách đăng ký của bạn")
  }
}

/** Seller approves/rejects an application */
export async function reviewApplication(
  applicationId: string,
  decision: "approved" | "rejected"
): Promise<ServiceResult<void>> {
  try {
    const uid = await requireUid()
    const ref = doc(firestore, APPLICATIONS, applicationId)
    const snap = await getDoc(ref)
    if (!snap.exists()) return serviceErr("not-found", "Đơn đăng ký không tồn tại")

    const data = snap.data()
    if (data.shopId !== uid) return serviceErr("forbidden", "Không có quyền duyệt")
    if (data.status !== "pending") return serviceErr("invalid", "Đơn đã được xử lý")

    await updateDoc(ref, {
      status: decision,
      reviewedAt: serverTimestamp(),
      reviewedBy: uid,
    })

    // Update plan approved count
    if (decision === "approved") {
      const planRef = doc(firestore, PLANS, data.planId)
      const planSnap = await getDoc(planRef)
      if (planSnap.exists()) {
        await updateDoc(planRef, {
          approvedCount: (planSnap.data().approvedCount ?? 0) + 1,
          updatedAt: serverTimestamp(),
        })
      }
    }

    return serviceOk(undefined)
  } catch (err) {
    return toServiceError(err, "Không thể duyệt đơn đăng ký")
  }
}
