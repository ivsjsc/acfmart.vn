import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit as fsLimit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  type QueryConstraint,
  type Unsubscribe,
} from "firebase/firestore"
import { auth, firestore } from "./firebase"
import { writeAuditLog } from "./audit-log"

/**
 * A single product review submitted after a delivered order. Stored in the
 * Firestore collection `productReviews`. One review per order item — i.e.
 * the document id is `${orderId}_${variantId}` so we cannot create
 * duplicates client-side.
 *
 * Visibility:
 *   - "public": shown on the product page, on the reviewer's public profile
 *     timeline, and counted toward the shop's public rating.
 *   - "private": invisible to other shoppers. Visible to the reviewer
 *     themselves, the shop owner of the reviewed item, and admins. Still
 *     counted toward the shop's *internal* rating (admin only).
 *
 * Status workflow:
 *   - "pending": just submitted, awaiting auto-moderation (e.g. profanity,
 *     spam checks). Public reviews stay hidden from other users until
 *     approved.
 *   - "approved": passes moderation, fully published per visibility rules.
 *   - "rejected": violates community guidelines. Reviewer is notified.
 */

export type ReviewVisibility = "public" | "private"
export type ReviewStatus = "pending" | "approved" | "rejected"

export interface ReviewDoc {
  id: string
  // Reviewer
  userId: string
  userName: string
  userAvatar?: string
  anonymous: boolean
  // Source order
  orderId: string
  orderCode: string
  variantId: string
  // Reviewed product / shop
  productId: string
  productTitle: string
  productThumbnail?: string
  shopId: string
  shopName: string
  // Content
  rating: number // 1..5
  comment: string
  photos: string[]
  tags: string[]
  // Privacy + moderation
  visibility: ReviewVisibility
  status: ReviewStatus
  rejectedReason?: string
  // Timestamps
  createdAt: Timestamp | null
  updatedAt: Timestamp | null
  approvedAt: Timestamp | null
}

export interface CreateReviewInput {
  orderId: string
  orderCode: string
  variantId: string
  productId: string
  productTitle: string
  productThumbnail?: string
  shopId: string
  shopName: string
  rating: number
  comment: string
  photos: string[]
  tags: string[]
  visibility: ReviewVisibility
  anonymous: boolean
  // Reviewer identity is taken from auth.currentUser to prevent spoofing.
}

const reviewsCol = collection(firestore, "productReviews")

async function waitForAuthReady() {
  await auth.authStateReady()
}

function reviewDocId(orderId: string, variantId: string): string {
  // Deterministic id → cannot create more than one review per item from the
  // same order. Updates go through updateReview() below.
  return `${orderId}_${variantId}`
}

function mapReviewDoc(id: string, data: Record<string, any>): ReviewDoc {
  return {
    id,
    userId: String(data.userId ?? ""),
    userName: String(data.userName ?? "Khách hàng"),
    userAvatar: typeof data.userAvatar === "string" ? data.userAvatar : undefined,
    anonymous: Boolean(data.anonymous ?? false),
    orderId: String(data.orderId ?? ""),
    orderCode: String(data.orderCode ?? data.orderId ?? ""),
    variantId: String(data.variantId ?? ""),
    productId: String(data.productId ?? ""),
    productTitle: String(data.productTitle ?? ""),
    productThumbnail:
      typeof data.productThumbnail === "string" ? data.productThumbnail : undefined,
    shopId: String(data.shopId ?? ""),
    shopName: String(data.shopName ?? ""),
    rating: Number(data.rating ?? 0),
    comment: String(data.comment ?? ""),
    photos: Array.isArray(data.photos) ? data.photos : [],
    tags: Array.isArray(data.tags) ? data.tags : [],
    visibility: (data.visibility ?? "public") as ReviewVisibility,
    status: (data.status ?? "pending") as ReviewStatus,
    rejectedReason:
      typeof data.rejectedReason === "string" ? data.rejectedReason : undefined,
    createdAt: (data.createdAt as Timestamp) ?? null,
    updatedAt: (data.updatedAt as Timestamp) ?? null,
    approvedAt: (data.approvedAt as Timestamp) ?? null,
  }
}

function timestampToMs(value: Timestamp | null | undefined): number {
  return value?.toMillis?.() ?? 0
}

function sortByCreatedAtDesc(a: ReviewDoc, b: ReviewDoc): number {
  return timestampToMs(b.createdAt) - timestampToMs(a.createdAt)
}

// ─── Mutations ────────────────────────────────────────────────────────────

/**
 * Submit a review for a delivered order item. Throws if the caller is not
 * authenticated or the rating is out of range; Firestore rules enforce the
 * same constraints server-side.
 *
 * Reviews start in `status: "pending"` and become "approved" via a
 * background moderation pass (admin or Aivy). Until then, public reviews
 * are not shown to other shoppers.
 */
export async function createReview(input: CreateReviewInput): Promise<string> {
  await waitForAuthReady()
  const fbUser = auth.currentUser
  if (!fbUser) throw new Error("Bạn cần đăng nhập để gửi đánh giá")
  if (input.rating < 1 || input.rating > 5) {
    throw new Error("Điểm đánh giá phải từ 1 đến 5")
  }
  if (input.rating <= 3 && !input.comment.trim()) {
    throw new Error("Đánh giá dưới 3 sao cần kèm bình luận")
  }

  const id = reviewDocId(input.orderId, input.variantId)
  const ref = doc(reviewsCol, id)

  await setDoc(ref, {
    userId: fbUser.uid,
    userName: fbUser.displayName ?? "Khách hàng",
    userAvatar: fbUser.photoURL ?? null,
    anonymous: input.anonymous,
    orderId: input.orderId,
    orderCode: input.orderCode,
    variantId: input.variantId,
    productId: input.productId,
    productTitle: input.productTitle,
    productThumbnail: input.productThumbnail ?? null,
    shopId: input.shopId,
    shopName: input.shopName,
    rating: input.rating,
    comment: input.comment.trim(),
    photos: input.photos,
    tags: input.tags,
    visibility: input.visibility,
    status: "pending" as ReviewStatus,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    approvedAt: null,
  })

  await writeAuditLog({
    action: "review_submit",
    target_type: "review",
    target_id: id,
    actor_id: fbUser.uid,
    actor_email: fbUser.email ?? "",
    actor_role: "customer",
    details: {
      productId: input.productId,
      rating: input.rating,
      visibility: input.visibility,
    },
  })

  return id
}

/**
 * Mark a review as approved (admin / moderator only — enforced by rules).
 */
export async function approveReview(reviewId: string): Promise<void> {
  await waitForAuthReady()
  const ref = doc(reviewsCol, reviewId)
  await updateDoc(ref, {
    status: "approved" as ReviewStatus,
    approvedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

/**
 * Mark a review as rejected with a reason. Admin / moderator only.
 */
export async function rejectReview(
  reviewId: string,
  reason: string
): Promise<void> {
  await waitForAuthReady()
  const ref = doc(reviewsCol, reviewId)
  await updateDoc(ref, {
    status: "rejected" as ReviewStatus,
    rejectedReason: reason,
    updatedAt: serverTimestamp(),
  })
}

/**
 * Reviewer can toggle their own review between public and private even
 * after publication. Rules only allow the reviewer themselves to update
 * `visibility`.
 */
export async function setReviewVisibility(
  reviewId: string,
  visibility: ReviewVisibility
): Promise<void> {
  await waitForAuthReady()
  const ref = doc(reviewsCol, reviewId)
  await updateDoc(ref, {
    visibility,
    updatedAt: serverTimestamp(),
  })
}

// ─── Queries ──────────────────────────────────────────────────────────────

/**
 * Public-facing list of approved reviews for a product. Used on the product
 * detail page and shop page.
 */
export async function listProductReviews(params: {
  productId: string
  limitCount?: number
}): Promise<ReviewDoc[]> {
  const constraints: QueryConstraint[] = [
    where("productId", "==", params.productId),
    where("visibility", "==", "public"),
    where("status", "==", "approved"),
  ]
  if (params.limitCount) constraints.push(fsLimit(params.limitCount))
  const snap = await getDocs(query(reviewsCol, ...constraints))
  return snap.docs.map((d) => mapReviewDoc(d.id, d.data())).sort(sortByCreatedAtDesc)
}

/**
 * Public-facing list of approved public reviews by a user. Used on the
 * `/u/:userId` profile timeline.
 */
export async function listUserPublicReviews(params: {
  userId: string
  limitCount?: number
}): Promise<ReviewDoc[]> {
  const constraints: QueryConstraint[] = [
    where("userId", "==", params.userId),
    where("visibility", "==", "public"),
    where("status", "==", "approved"),
  ]
  if (params.limitCount) constraints.push(fsLimit(params.limitCount))
  const snap = await getDocs(query(reviewsCol, ...constraints))
  return snap.docs.map((d) => mapReviewDoc(d.id, d.data())).sort(sortByCreatedAtDesc)
}

/**
 * Reviewer's own history, including private reviews. Used on
 * `/account/timeline`. Realtime subscription so the screen updates when a
 * pending review flips to approved.
 */
export function subscribeUserReviews(
  userId: string,
  onData: (reviews: ReviewDoc[]) => void,
  onError: (err: Error) => void
): Unsubscribe {
  let unsub: Unsubscribe | null = null
  let cancelled = false

  waitForAuthReady()
    .then(() => {
      if (cancelled) return
      const q = query(reviewsCol, where("userId", "==", userId))
      unsub = onSnapshot(
        q,
        (snap) => {
          const reviews = snap.docs
            .map((d) => mapReviewDoc(d.id, d.data()))
            .sort(sortByCreatedAtDesc)
          onData(reviews)
        },
        (err) => {
          console.error("[subscribeUserReviews] Firestore error:", err)
          onError(err)
        }
      )
    })
    .catch((err) => {
      console.error("[subscribeUserReviews] auth wait error:", err)
      onError(err instanceof Error ? err : new Error("Không tải được đánh giá"))
    })

  return () => {
    cancelled = true
    if (unsub) unsub()
  }
}

/**
 * Shop-facing list — every review for products belonging to the shop,
 * including private ones (rules allow the shop owner to read them).
 */
export async function listShopReviews(params: {
  shopId: string
  limitCount?: number
}): Promise<ReviewDoc[]> {
  const constraints: QueryConstraint[] = [
    where("shopId", "==", params.shopId),
  ]
  if (params.limitCount) constraints.push(fsLimit(params.limitCount))
  const snap = await getDocs(query(reviewsCol, ...constraints))
  return snap.docs.map((d) => mapReviewDoc(d.id, d.data())).sort(sortByCreatedAtDesc)
}

/**
 * Lookup a single review by deterministic id (orderId_variantId). Used by
 * OrderReviewScreen to decide between "create" and "edit" mode.
 */
export async function getReviewForOrderItem(
  orderId: string,
  variantId: string
): Promise<ReviewDoc | null> {
  const id = reviewDocId(orderId, variantId)
  const snap = await getDoc(doc(reviewsCol, id))
  if (!snap.exists()) return null
  return mapReviewDoc(snap.id, snap.data())
}
