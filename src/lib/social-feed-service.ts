import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getCountFromServer,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
  type Unsubscribe,
} from "firebase/firestore"
import { firestore } from "./firebase"
import type { ProductDoc } from "./product-service"
import type { User } from "../stores/auth-store"

/**
 * New Feed posting quotas (rolling 7-day window per author).
 *  - Regular accounts (customer / unverified seller): 3 posts / 7 days
 *  - Premium shops (seller with `isPremium`): 30 posts / 7 days
 *  - Admins / owners / moderators: unlimited
 *
 * Limits are enforced client-side here; the backing Firestore rule
 * (`isValidSocialPostCreate`) still validates schema. A Cloud Function
 * audit job can be added later for hard server-side enforcement.
 */
export const SOCIAL_POST_QUOTA_REGULAR = 3
export const SOCIAL_POST_QUOTA_PREMIUM = 30
export const SOCIAL_POST_QUOTA_WINDOW_MS = 7 * 24 * 60 * 60 * 1000

export type SocialPostQuotaTier = "unlimited" | "premium" | "regular"

export interface SocialPostQuota {
  tier: SocialPostQuotaTier
  used: number
  limit: number | null // null when unlimited
  remaining: number | null // null when unlimited
  resetsAt: Date | null // earliest time when used count will decrease, null when unlimited or no posts
}

export class SocialPostQuotaError extends Error {
  constructor(public readonly quota: SocialPostQuota) {
    super(
      quota.tier === "premium"
        ? `Bạn đã đăng ${quota.used}/${quota.limit} bài trong 7 ngày qua. Vui lòng đợi đến khi quota làm mới.`
        : `Mỗi tài khoản chỉ được đăng tối đa ${quota.limit} bài / 7 ngày. Nâng cấp Premium để đăng nhiều hơn.`
    )
    this.name = "SocialPostQuotaError"
  }
}

export type SocialPostType = "status" | "question" | "product_share"

export interface SocialProductSnapshot {
  id: string
  handle: string
  title: string
  image: string
  price: number
  shopName: string
}

export interface SocialPost {
  id: string
  type: SocialPostType
  authorId: string
  authorName: string
  authorAvatar?: string
  content: string
  product: SocialProductSnapshot | null
  likedBy: string[]
  likeCount: number
  commentCount: number
  shareCount: number
  createdAt: Date
  updatedAt: Date | null
}

export interface SocialComment {
  id: string
  postId: string
  authorId: string
  authorName: string
  authorAvatar?: string
  content: string
  createdAt: Date
}

const postsCol = collection(firestore, "socialPosts")

function timestampToDate(value: unknown): Date {
  if (value instanceof Timestamp) return value.toDate()
  if (value && typeof value === "object" && "toDate" in value) {
    return (value as { toDate: () => Date }).toDate()
  }
  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value)
    if (!Number.isNaN(date.getTime())) return date
  }
  return new Date()
}

function normalizeString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback
}

function normalizeNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback
}

function normalizePostType(value: unknown): SocialPostType {
  return value === "question" || value === "product_share" ? value : "status"
}

function normalizeProduct(value: unknown): SocialProductSnapshot | null {
  if (!value || typeof value !== "object") return null
  const product = value as Record<string, unknown>
  const id = normalizeString(product.id)
  const handle = normalizeString(product.handle)
  const title = normalizeString(product.title)
  if (!id || !handle || !title) return null
  return {
    id,
    handle,
    title,
    image: normalizeString(product.image),
    price: normalizeNumber(product.price),
    shopName: normalizeString(product.shopName, "Shop"),
  }
}

function normalizePost(id: string, data: Record<string, unknown>): SocialPost {
  const likedBy = Array.isArray(data.likedBy)
    ? data.likedBy.filter((item): item is string => typeof item === "string")
    : []

  return {
    id,
    type: normalizePostType(data.type),
    authorId: normalizeString(data.authorId),
    authorName: normalizeString(data.authorName, "Người dùng ACFMart"),
    authorAvatar: normalizeString(data.authorAvatar) || undefined,
    content: normalizeString(data.content),
    product: normalizeProduct(data.product),
    likedBy,
    likeCount: normalizeNumber(data.likeCount, likedBy.length),
    commentCount: normalizeNumber(data.commentCount),
    shareCount: normalizeNumber(data.shareCount),
    createdAt: timestampToDate(data.created_at),
    updatedAt: data.updated_at ? timestampToDate(data.updated_at) : null,
  }
}

function normalizeComment(
  postId: string,
  id: string,
  data: Record<string, unknown>
): SocialComment {
  return {
    id,
    postId,
    authorId: normalizeString(data.authorId),
    authorName: normalizeString(data.authorName, "Người dùng ACFMart"),
    authorAvatar: normalizeString(data.authorAvatar) || undefined,
    content: normalizeString(data.content),
    createdAt: timestampToDate(data.created_at),
  }
}

function authorPayload(user: User) {
  return {
    authorId: user.id,
    authorName: user.name || user.email || "Người dùng ACFMart",
    authorAvatar: user.avatar ?? null,
  }
}

export function productToSocialSnapshot(
  product: ProductDoc
): SocialProductSnapshot {
  const image = product.thumbnail || product.images[0] || ""
  return {
    id: product.id,
    handle: product.handle,
    title: product.title,
    image,
    price: product.basePrice,
    shopName: product.shopName,
  }
}

export function subscribeSocialPosts(
  onData: (posts: SocialPost[]) => void,
  onError: (error: Error) => void
): Unsubscribe {
  const q = query(postsCol, orderBy("created_at", "desc"), limit(50))
  return onSnapshot(
    q,
    (snap) => {
      onData(snap.docs.map((item) => normalizePost(item.id, item.data())))
    },
    (error) => {
      console.error("[subscribeSocialPosts] Firestore error:", error)
      onError(error)
    }
  )
}

/**
 * Resolve the posting tier for a user.
 * - Admins / owners / moderators bypass the quota (`unlimited`).
 * - Sellers with `isPremium === true` get the premium quota.
 * - Everyone else (including non-premium sellers) gets the regular quota.
 */
export function resolveSocialPostTier(user: User): SocialPostQuotaTier {
  if (
    user.role === "admin" ||
    user.role === "owner" ||
    user.role === "moderator"
  ) {
    return "unlimited"
  }
  if (user.isPremium) return "premium"
  return "regular"
}

function quotaLimitForTier(tier: SocialPostQuotaTier): number | null {
  if (tier === "unlimited") return null
  if (tier === "premium") return SOCIAL_POST_QUOTA_PREMIUM
  return SOCIAL_POST_QUOTA_REGULAR
}

/**
 * Compute a user's current posting quota usage in the rolling 7-day window.
 * Uses `getCountFromServer` so it scales with millions of posts without
 * paying read cost per document.
 */
export async function fetchSocialPostQuota(
  user: User
): Promise<SocialPostQuota> {
  const tier = resolveSocialPostTier(user)
  const limitValue = quotaLimitForTier(tier)

  if (limitValue === null) {
    return { tier, used: 0, limit: null, remaining: null, resetsAt: null }
  }

  const windowStart = new Date(Date.now() - SOCIAL_POST_QUOTA_WINDOW_MS)
  const windowQuery = query(
    postsCol,
    where("authorId", "==", user.id),
    where("created_at", ">=", Timestamp.fromDate(windowStart))
  )
  const snap = await getCountFromServer(windowQuery)
  const used = snap.data().count

  // For a precise reset time we'd need the oldest post's createdAt;
  // approximating as windowStart + window is good enough for UX text.
  const resetsAt =
    used > 0 ? new Date(windowStart.getTime() + SOCIAL_POST_QUOTA_WINDOW_MS) : null

  return {
    tier,
    used,
    limit: limitValue,
    remaining: Math.max(0, limitValue - used),
    resetsAt,
  }
}

export async function createSocialPost(input: {
  type: SocialPostType
  content: string
  product?: SocialProductSnapshot | null
  user: User
}): Promise<{ id: string; quota: SocialPostQuota }> {
  const quota = await fetchSocialPostQuota(input.user)
  if (quota.limit !== null && quota.used >= quota.limit) {
    throw new SocialPostQuotaError(quota)
  }

  const post = await addDoc(postsCol, {
    type: input.type,
    content: input.content.trim(),
    product: input.type === "product_share" ? input.product ?? null : null,
    ...authorPayload(input.user),
    likedBy: [],
    likeCount: 0,
    commentCount: 0,
    shareCount: 0,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  })

  const nextUsed = quota.used + 1
  const nextQuota: SocialPostQuota =
    quota.limit === null
      ? quota
      : {
          ...quota,
          used: nextUsed,
          remaining: Math.max(0, quota.limit - nextUsed),
        }
  return { id: post.id, quota: nextQuota }
}

export async function toggleSocialPostLike(
  post: SocialPost,
  userId: string
): Promise<void> {
  const liked = post.likedBy.includes(userId)
  await updateDoc(doc(postsCol, post.id), {
    likedBy: liked ? arrayRemove(userId) : arrayUnion(userId),
    likeCount: increment(liked ? -1 : 1),
    updated_at: serverTimestamp(),
  })
}

export async function shareSocialPost(postId: string): Promise<void> {
  await updateDoc(doc(postsCol, postId), {
    shareCount: increment(1),
    updated_at: serverTimestamp(),
  })
}

export function subscribeSocialComments(
  postId: string,
  onData: (comments: SocialComment[]) => void,
  onError: (error: Error) => void
): Unsubscribe {
  const q = query(
    collection(firestore, "socialPosts", postId, "comments"),
    orderBy("created_at", "asc"),
    limit(100)
  )
  return onSnapshot(
    q,
    (snap) => {
      onData(
        snap.docs.map((item) => normalizeComment(postId, item.id, item.data()))
      )
    },
    (error) => {
      console.error("[subscribeSocialComments] Firestore error:", error)
      onError(error)
    }
  )
}

export async function addSocialComment(input: {
  postId: string
  content: string
  user: User
}): Promise<void> {
  const batch = writeBatch(firestore)
  const commentRef = doc(
    collection(firestore, "socialPosts", input.postId, "comments")
  )

  batch.set(commentRef, {
    postId: input.postId,
    content: input.content.trim(),
    ...authorPayload(input.user),
    created_at: serverTimestamp(),
  })
  batch.update(doc(postsCol, input.postId), {
    commentCount: increment(1),
    updated_at: serverTimestamp(),
  })

  await batch.commit()
}
