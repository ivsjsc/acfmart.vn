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
  Timestamp,
  DocumentSnapshot,
} from "firebase/firestore"
import { firestore } from "./firebase"
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
  disabled?: boolean
}

const usersCol = collection(firestore, "users")

export async function listUsers(params: {
  role?: UserRole
  q?: string
  limitCount?: number
  lastDoc?: DocumentSnapshot
}): Promise<{ users: UserDoc[]; count: number }> {
  const constraints = []
  if (params.role) constraints.push(where("role", "==", params.role))
  constraints.push(orderBy("created_at", "desc"))
  if (params.lastDoc) constraints.push(startAfter(params.lastDoc))
  if (params.limitCount) constraints.push(limit(params.limitCount))

  const q = query(usersCol, ...constraints)
  const snap = await getDocs(q)
  const users = snap.docs.map((d) => ({ id: d.id, ...d.data() } as UserDoc))

  if (params.q) {
    const search = params.q.toLowerCase()
    return {
      users: users.filter(
        (u) =>
          u.email?.toLowerCase().includes(search) ||
          u.name?.toLowerCase().includes(search) ||
          u.phone?.includes(search)
      ),
      count: users.length,
    }
  }

  return { users, count: users.length }
}

export async function getUserById(uid: string): Promise<UserDoc | null> {
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

export async function disableUser(
  userId: string,
  actor: { id: string; email: string; role: string }
): Promise<void> {
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
