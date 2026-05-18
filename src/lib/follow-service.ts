import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
  type Unsubscribe,
} from "firebase/firestore"
import { firestore } from "./firebase"

export interface UserFollowDoc {
  id: string
  followerId: string
  followeeId: string
  created_at?: unknown
}

export interface FollowState {
  followersCount: number
  followingCount: number
  isFollowing: boolean
  followsMe: boolean
  isMutual: boolean
}

const followsCol = collection(firestore, "userFollows")

export function followId(followerId: string, followeeId: string): string {
  return `${followerId}_${followeeId}`
}

export async function followUser(
  followerId: string,
  followeeId: string
): Promise<void> {
  if (!followerId || !followeeId) throw new Error("Thiếu thông tin người dùng")
  if (followerId === followeeId) throw new Error("Bạn không thể tự theo dõi chính mình")

  await setDoc(doc(followsCol, followId(followerId, followeeId)), {
    followerId,
    followeeId,
    created_at: serverTimestamp(),
  })
}

export async function unfollowUser(
  followerId: string,
  followeeId: string
): Promise<void> {
  if (!followerId || !followeeId) return
  await deleteDoc(doc(followsCol, followId(followerId, followeeId)))
}

export async function areMutualFollowers(
  userId: string,
  otherUserId: string
): Promise<boolean> {
  if (!userId || !otherUserId || userId === otherUserId) return false
  const [a, b] = await Promise.all([
    getDoc(doc(followsCol, followId(userId, otherUserId))),
    getDoc(doc(followsCol, followId(otherUserId, userId))),
  ])
  return a.exists() && b.exists()
}

export function subscribeFollowState(
  targetUserId: string,
  currentUserId: string | undefined,
  onChange: (state: FollowState) => void
): Unsubscribe {
  let followersCount = 0
  let followingCount = 0
  let isFollowing = false
  let followsMe = false

  function emit() {
    onChange({
      followersCount,
      followingCount,
      isFollowing,
      followsMe,
      isMutual: isFollowing && followsMe,
    })
  }

  const unsubs: Unsubscribe[] = []

  unsubs.push(
    onSnapshot(
      query(followsCol, where("followeeId", "==", targetUserId)),
      (snap) => {
        followersCount = snap.size
        if (currentUserId) {
          isFollowing = snap.docs.some((d) => d.data().followerId === currentUserId)
        }
        emit()
      }
    )
  )

  unsubs.push(
    onSnapshot(
      query(followsCol, where("followerId", "==", targetUserId)),
      (snap) => {
        followingCount = snap.size
        if (currentUserId) {
          followsMe = snap.docs.some((d) => d.data().followeeId === currentUserId)
        }
        emit()
      }
    )
  )

  return () => {
    unsubs.forEach((unsubscribe) => unsubscribe())
  }
}
