import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  writeBatch,
  type Unsubscribe,
} from "firebase/firestore"
import { firestore } from "./firebase"
import type { ProductDoc } from "./product-service"
import type { User } from "../stores/auth-store"

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

export async function createSocialPost(input: {
  type: SocialPostType
  content: string
  product?: SocialProductSnapshot | null
  user: User
}): Promise<string> {
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
  return post.id
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
