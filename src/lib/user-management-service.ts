import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  Timestamp,
  DocumentSnapshot,
  QueryConstraint,
  Unsubscribe,
} from "firebase/firestore"
import { auth, firestore } from "./firebase"
import { writeAuditLog } from "./audit-log"
import type { UserRole } from "../stores/auth-store"

export interface UserDoc {
  id: string
  email: string
  name: string
  phone?: string
  role: UserRole
  avatar?: string
  created_at?: Timestamp
  updated_at?: Timestamp
  last_login_at?: Timestamp
  disabled?: boolean
}

export interface UpdateUserProfileInput {
  name?: string
  email?: string
  phone?: string
  avatar?: string
  disabled?: boolean
}

const usersCol = collection(firestore, "users")

async function waitForAuthReady() {
  await auth.authStateReady()
}

function sortByCreatedAtDesc(a: UserDoc, b: UserDoc): number {
  const ta = a.created_at?.toMillis?.() ?? 0
  const tb = b.created_at?.toMillis?.() ?? 0
  if (ta !== tb) return tb - ta
  return (a.email ?? "").localeCompare(b.email ?? "")
}

function applySearch(users: UserDoc[], q?: string): UserDoc[] {
  if (!q) return users
  const search = q.toLowerCase()
  return users.filter(
    (u) =>
      u.email?.toLowerCase().includes(search) ||
      u.name?.toLowerCase().includes(search) ||
      u.phone?.includes(search) ||
      u.id?.toLowerCase().includes(search)
  )
}

export async function listUsers(params: {
  role?: UserRole
  q?: string
  limitCount?: number
  lastDoc?: DocumentSnapshot
}): Promise<{ users: UserDoc[]; count: number }> {
  await waitForAuthReady()
  const constraints: QueryConstraint[] = []
  if (params.role) constraints.push(where("role", "==", params.role))
  if (params.lastDoc) constraints.push(startAfter(params.lastDoc))
  if (params.limitCount) constraints.push(limit(params.limitCount))

  // Skip orderBy("created_at") because legacy user docs may be missing it,
  // which would silently drop them from results. Sort client-side instead.
  const q = query(usersCol, ...constraints)
  const snap = await getDocs(q)
  const users = snap.docs
    .map((d) => ({ id: d.id, ...d.data() } as UserDoc))
    .sort(sortByCreatedAtDesc)

  const filtered = applySearch(users, params.q)
  return { users: filtered, count: filtered.length }
}

/**
 * Subscribe to users collection in real-time.
 * Returns unsubscribe function. Errors are surfaced via onError callback
 * so the UI can show actionable messages instead of swallowing them.
 */
export function subscribeUsers(
  params: { role?: UserRole; q?: string; limitCount?: number },
  onData: (users: UserDoc[]) => void,
  onError: (err: Error) => void
): Unsubscribe {
  let unsub: Unsubscribe | null = null
  let cancelled = false

  waitForAuthReady()
    .then(() => {
      if (cancelled) return

      const constraints: QueryConstraint[] = []
      if (params.role) constraints.push(where("role", "==", params.role))
      if (params.limitCount) constraints.push(limit(params.limitCount))

      const q = query(usersCol, ...constraints)
      unsub = onSnapshot(
        q,
        (snap) => {
          const users = snap.docs
            .map((d) => ({ id: d.id, ...d.data() } as UserDoc))
            .sort(sortByCreatedAtDesc)
          onData(applySearch(users, params.q))
        },
        (err) => {
          console.error("[subscribeUsers] Firestore error:", err)
          onError(err)
        }
      )
    })
    .catch((err) => {
      console.error("[subscribeUsers] auth restore error:", err)
      onError(err instanceof Error ? err : new Error("Không thể khôi phục phiên đăng nhập"))
    })

  return () => {
    cancelled = true
    unsub?.()
  }
}

export async function getUserById(uid: string): Promise<UserDoc | null> {
  await waitForAuthReady()
  const docRef = doc(usersCol, uid)
  const snap = await getDoc(docRef)
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as UserDoc
}

export async function updateUserRole(
  userId: string,
  newRole: UserRole,
  actor: { id: string; email: string; role: string }
): Promise<void> {
  await waitForAuthReady()
  const userRef = doc(usersCol, userId)
  const userSnap = await getDoc(userRef)

  if (!userSnap.exists()) {
    throw new Error("Không tìm thấy user")
  }

  const oldRole = userSnap.data()?.role ?? "customer"

  await updateDoc(userRef, {
    role: newRole,
    updated_at: Timestamp.now(),
  })

  await writeAuditLog({
    action: "role_change",
    actor_id: actor.id,
    actor_email: actor.email,
    actor_role: actor.role,
    target_type: "user",
    target_id: userId,
    details: { old_role: oldRole, new_role: newRole },
  })
}

export async function updateUserProfile(
  userId: string,
  patch: UpdateUserProfileInput,
  actor: { id: string; email: string; role: string }
): Promise<void> {
  await waitForAuthReady()
  const userRef = doc(usersCol, userId)
  const userSnap = await getDoc(userRef)

  if (!userSnap.exists()) {
    throw new Error("Không tìm thấy user")
  }

  const cleaned: UpdateUserProfileInput = {}
  if (patch.name !== undefined) cleaned.name = patch.name.trim()
  if (patch.email !== undefined) cleaned.email = patch.email.trim()
  if (patch.phone !== undefined) cleaned.phone = patch.phone.trim()
  if (patch.avatar !== undefined) cleaned.avatar = patch.avatar.trim()
  if (patch.disabled !== undefined) cleaned.disabled = patch.disabled

  await updateDoc(userRef, {
    ...cleaned,
    updated_at: Timestamp.now(),
  })

  await writeAuditLog({
    action: "settings_change",
    actor_id: actor.id,
    actor_email: actor.email,
    actor_role: actor.role,
    target_type: "user",
    target_id: userId,
    details: { action: "update_user_profile", fields: Object.keys(cleaned) },
  })
}

export async function disableUser(
  userId: string,
  actor: { id: string; email: string; role: string }
): Promise<void> {
  await waitForAuthReady()
  const userRef = doc(usersCol, userId)
  await updateDoc(userRef, {
    disabled: true,
    updated_at: Timestamp.now(),
  })

  await writeAuditLog({
    action: "settings_change",
    actor_id: actor.id,
    actor_email: actor.email,
    actor_role: actor.role,
    target_type: "user",
    target_id: userId,
    details: { action: "disable_user" },
  })
}

export async function enableUser(
  userId: string,
  actor: { id: string; email: string; role: string }
): Promise<void> {
  await waitForAuthReady()
  const userRef = doc(usersCol, userId)
  await updateDoc(userRef, {
    disabled: false,
    updated_at: Timestamp.now(),
  })

  await writeAuditLog({
    action: "settings_change",
    actor_id: actor.id,
    actor_email: actor.email,
    actor_role: actor.role,
    target_type: "user",
    target_id: userId,
    details: { action: "enable_user" },
  })
}
