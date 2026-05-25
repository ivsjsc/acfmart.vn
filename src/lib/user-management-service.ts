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
import {
  normalizeLinkedAccountList,
  normalizeProfileSources,
  type LinkedAccountIdentity,
  type ProfileSources,
} from "./account-identity"

const VALID_ROLES: UserRole[] = [
  "customer",
  "seller",
  "carrier",
  "moderator",
  "manager",
  "admin",
  "owner",
]

export interface UserDoc {
  id: string
  email?: string
  name: string
  phone?: string
  birth_date?: string
  role: UserRole
  avatar?: string
  address?: string
  note?: string
  auth_provider?: string
  last_auth_provider?: string
  primary_auth_provider?: string
  auth_providers?: LinkedAccountIdentity[]
  profile_sources?: ProfileSources
  created_at?: Timestamp
  updated_at?: Timestamp
  last_login_at?: Timestamp
  disabled?: boolean
}

export interface UpdateUserProfileInput {
  name?: string
  email?: string
  phone?: string
  birthDate?: string
  avatar?: string
  address?: string
  note?: string
  disabled?: boolean
  profileSources?: ProfileSources
}

const usersCol = collection(firestore, "users")
const userDirectoryCol = collection(firestore, "userDirectory")

async function waitForAuthReady() {
  await auth.authStateReady()
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value.trim() : fallback
}

function normalizeRole(value: unknown): UserRole {
  const lower = asString(value).toLowerCase() as UserRole
  return VALID_ROLES.includes(lower) ? lower : "customer"
}

function normalizeUserDoc(id: string, data: Record<string, unknown>): UserDoc {
  return {
    id,
    email: typeof data.email === "string" ? data.email : undefined,
    name: asString(data.name ?? data.displayName, "Chưa đặt tên"),
    phone: typeof data.phone === "string" && data.phone ? data.phone : undefined,
    birth_date: typeof data.birth_date === "string" && data.birth_date ? data.birth_date : typeof data.birthday === "string" && data.birthday ? data.birthday : undefined,
    role: normalizeRole(data.role),
    avatar: typeof data.avatar === "string" && data.avatar ? data.avatar : undefined,
    address: asString(data.address) || undefined,
    note: asString(data.note) || undefined,
    auth_provider: asString(data.auth_provider ?? data.authProvider) || undefined,
    last_auth_provider: asString(data.last_auth_provider ?? data.lastAuthProvider) || undefined,
    primary_auth_provider: asString(data.primary_auth_provider ?? data.primaryAuthProvider) || undefined,
    auth_providers: normalizeLinkedAccountList(data.auth_providers ?? data.authProviders),
    profile_sources: normalizeProfileSources(data.profile_sources ?? data.profileSources),
    created_at:
      data.created_at instanceof Timestamp
        ? data.created_at
        : data.createdAt instanceof Timestamp
          ? data.createdAt
          : undefined,
    updated_at:
      data.updated_at instanceof Timestamp
        ? data.updated_at
        : data.updatedAt instanceof Timestamp
          ? data.updatedAt
          : undefined,
    last_login_at:
      data.last_login_at instanceof Timestamp
        ? data.last_login_at
        : data.lastLoginAt instanceof Timestamp
          ? data.lastLoginAt
          : undefined,
    disabled: typeof data.disabled === "boolean" ? data.disabled : undefined,
  }
}

function normalizeUserDirectoryDoc(id: string, data: Record<string, unknown>): UserDoc {
  return {
    id,
    name: asString(data.name ?? data.displayName, "Chưa đặt tên"),
    role: normalizeRole(data.role),
    avatar: typeof data.avatar === "string" && data.avatar ? data.avatar : undefined,
    address: asString(data.address) || undefined,
    note: asString(data.note) || undefined,
    created_at:
      data.created_at instanceof Timestamp
        ? data.created_at
        : data.createdAt instanceof Timestamp
          ? data.createdAt
          : undefined,
    updated_at:
      data.updated_at instanceof Timestamp
        ? data.updated_at
        : data.updatedAt instanceof Timestamp
          ? data.updatedAt
          : undefined,
    disabled: typeof data.disabled === "boolean" ? data.disabled : undefined,
  }
}

function sortByCreatedAtDesc(a: UserDoc, b: UserDoc): number {
  const ta = a.created_at?.toMillis?.() ?? 0
  const tb = b.created_at?.toMillis?.() ?? 0
  if (ta !== tb) return tb - ta
  return (a.email ?? a.name ?? "").localeCompare(b.email ?? b.name ?? "")
}

function applySearch(users: UserDoc[], q?: string, mode: "full" | "directory" = "full"): UserDoc[] {
  if (!q) return users
  const search = q.toLowerCase()
  return users.filter(
    (u) => {
      const fullMatch =
        u.email?.toLowerCase().includes(search) ||
        u.name?.toLowerCase().includes(search) ||
        u.phone?.includes(search) ||
        u.id?.toLowerCase().includes(search)
      const directoryMatch =
        u.name?.toLowerCase().includes(search) ||
        u.address?.toLowerCase().includes(search) ||
        u.note?.toLowerCase().includes(search) ||
        u.id?.toLowerCase().includes(search)
      return mode === "directory" ? directoryMatch : fullMatch
    }
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
    .map((d) => normalizeUserDoc(d.id, d.data()))
    .sort(sortByCreatedAtDesc)

  const filtered = applySearch(users, params.q, "full")
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
            .map((d) => normalizeUserDoc(d.id, d.data()))
            .sort(sortByCreatedAtDesc)
          onData(applySearch(users, params.q, "full"))
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

export function subscribeUserDirectory(
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

      const q = query(userDirectoryCol, ...constraints)
      unsub = onSnapshot(
        q,
        (snap) => {
          const users = snap.docs
            .map((d) => normalizeUserDirectoryDoc(d.id, d.data()))
            .sort(sortByCreatedAtDesc)
          onData(applySearch(users, params.q, "directory"))
        },
        (err) => {
          console.error("[subscribeUserDirectory] Firestore error:", err)
          onError(err)
        }
      )
    })
    .catch((err) => {
      console.error("[subscribeUserDirectory] auth restore error:", err)
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
  return normalizeUserDoc(snap.id, snap.data())
}

export async function updateUserRole(
  userId: string,
  newRole: UserRole,
  actor: { id: string; email: string; role: string }
): Promise<void> {
  await waitForAuthReady()
  const userRef = doc(usersCol, userId)
  const directoryRef = doc(userDirectoryCol, userId)
  const userSnap = await getDoc(userRef)

  if (!userSnap.exists()) {
    throw new Error("Không tìm thấy user")
  }

  // Always persist roles in lowercase so Firestore rules (case-sensitive
  // equality) stay consistent. Legacy "Owner" / "ADMIN" docs get rewritten
  // here when a privileged actor performs the next role change.
  const normalizedNewRole = (newRole as string).trim().toLowerCase() as UserRole
  const rawOldRole = userSnap.data()?.role
  const oldRole =
    typeof rawOldRole === "string" ? rawOldRole.trim().toLowerCase() : "customer"

  const now = Timestamp.now()
  await updateDoc(userRef, {
    role: normalizedNewRole,
    updated_at: now,
  })
  await setDoc(
    directoryRef,
    {
      name:
        typeof userSnap.data()?.name === "string"
          ? userSnap.data()?.name
          : userSnap.data()?.displayName ?? "Chưa đặt tên",
      avatar: typeof userSnap.data()?.avatar === "string" ? userSnap.data()?.avatar : null,
      role: normalizedNewRole,
      updated_at: now,
    },
    { merge: true }
  )

  await writeAuditLog({
    action: "role_change",
    actor_id: actor.id,
    actor_email: actor.email,
    actor_role: actor.role,
    target_type: "user",
    target_id: userId,
    details: { old_role: oldRole, new_role: normalizedNewRole },
  })
}

export async function updateUserProfile(
  userId: string,
  patch: UpdateUserProfileInput,
  actor: { id: string; email: string; role: string }
): Promise<void> {
  await waitForAuthReady()
  const userRef = doc(usersCol, userId)
  const directoryRef = doc(userDirectoryCol, userId)
  const userSnap = await getDoc(userRef)

  if (!userSnap.exists()) {
    throw new Error("Không tìm thấy user")
  }

  const cleaned: UpdateUserProfileInput = {}
  if (patch.name !== undefined) cleaned.name = patch.name.trim()
  if (patch.email !== undefined) cleaned.email = patch.email.trim()
  if (patch.phone !== undefined) cleaned.phone = patch.phone.trim()
  if (patch.birthDate !== undefined) cleaned.birthDate = patch.birthDate.trim()
  if (patch.avatar !== undefined) cleaned.avatar = patch.avatar.trim()
  if (patch.address !== undefined) cleaned.address = patch.address.trim()
  if (patch.note !== undefined) cleaned.note = patch.note.trim()
  if (patch.disabled !== undefined) cleaned.disabled = patch.disabled

  const now = Timestamp.now()
  const userPatch: Record<string, unknown> = {
    email: cleaned.email ?? userSnap.data()?.email ?? "",
    name: cleaned.name ?? userSnap.data()?.name ?? userSnap.data()?.displayName ?? "Chưa đặt tên",
    displayName: cleaned.name ?? userSnap.data()?.displayName ?? userSnap.data()?.name ?? "Chưa đặt tên",
    phone: cleaned.phone ?? userSnap.data()?.phone ?? "",
    birth_date:
      (cleaned.birthDate ?? asString(userSnap.data()?.birth_date ?? userSnap.data()?.birthday)) ||
      null,
    avatar: cleaned.avatar ?? userSnap.data()?.avatar ?? null,
    address: cleaned.address ?? userSnap.data()?.address ?? null,
    note: cleaned.note ?? userSnap.data()?.note ?? null,
    disabled: cleaned.disabled ?? userSnap.data()?.disabled ?? false,
    role: normalizeRole(userSnap.data()?.role),
    updated_at: now,
  }
  if (cleaned.profileSources !== undefined) {
    userPatch.profile_sources = cleaned.profileSources
  }

  await updateDoc(userRef, userPatch)
  await setDoc(
    directoryRef,
    {
      name: cleaned.name ?? userSnap.data()?.name ?? userSnap.data()?.displayName ?? "Chưa đặt tên",
      avatar: cleaned.avatar ?? userSnap.data()?.avatar ?? null,
      role: normalizeRole(userSnap.data()?.role),
      address: cleaned.address ?? userSnap.data()?.address ?? null,
      note: cleaned.note ?? userSnap.data()?.note ?? null,
      disabled: cleaned.disabled ?? userSnap.data()?.disabled ?? false,
      updated_at: now,
    },
    { merge: true }
  )

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
  const directoryRef = doc(userDirectoryCol, userId)
  const userSnap = await getDoc(userRef)
  if (!userSnap.exists()) {
    throw new Error("Không tìm thấy user")
  }
  const userData = userSnap.data() as Record<string, unknown>
  const now = Timestamp.now()
  await updateDoc(userRef, {
    disabled: true,
    updated_at: now,
  })
  await setDoc(
    directoryRef,
    {
      name: asString(userData.name ?? userData.displayName, "Chưa đặt tên"),
      avatar: typeof userData.avatar === "string" ? userData.avatar : null,
      role: normalizeRole(userData.role),
      disabled: true,
      updated_at: now,
    },
    { merge: true }
  )

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
  const directoryRef = doc(userDirectoryCol, userId)
  const userSnap = await getDoc(userRef)
  if (!userSnap.exists()) {
    throw new Error("Không tìm thấy user")
  }
  const userData = userSnap.data() as Record<string, unknown>
  const now = Timestamp.now()
  await updateDoc(userRef, {
    disabled: false,
    updated_at: now,
  })
  await setDoc(
    directoryRef,
    {
      name: asString(userData.name ?? userData.displayName, "Chưa đặt tên"),
      avatar: typeof userData.avatar === "string" ? userData.avatar : null,
      role: normalizeRole(userData.role),
      disabled: false,
      updated_at: now,
    },
    { merge: true }
  )

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
