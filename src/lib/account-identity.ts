export type AuthProviderKey =
  | "password"
  | "phone"
  | "google"
  | "facebook"
  | "zalo"
  | "custom"
  | "unknown"

export type ProfileSourceValue = AuthProviderKey | "manual" | "system"

export interface LinkedAccountIdentity {
  providerId: AuthProviderKey
  rawProviderId?: string
  email?: string | null
  displayName?: string | null
  photoURL?: string | null
  phoneNumber?: string | null
  emailVerified: boolean
  phoneVerified: boolean
  linkedAt?: unknown
  lastLoginAt?: unknown
  isPrimary: boolean
}

export interface ProfileSources {
  name?: ProfileSourceValue
  avatar?: ProfileSourceValue
  phone?: ProfileSourceValue
  email?: ProfileSourceValue
  birthDate?: ProfileSourceValue
}

export interface AccountProfileDoc {
  id: string
  email?: string
  name?: string
  displayName?: string
  phone?: string
  birthDate?: string
  avatar?: string
  role?: string
  authProvider?: string
  primaryAuthProvider?: string
  lastAuthProvider?: string
  authProviders: LinkedAccountIdentity[]
  profileSources: ProfileSources
  lastLoginAt?: unknown
  createdAt?: unknown
  updatedAt?: unknown
  disabled?: boolean
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined
}

export function normalizeAuthProviderId(provider: string | null | undefined): AuthProviderKey {
  switch ((provider ?? "").trim()) {
    case "google.com":
    case "google":
      return "google"
    case "facebook.com":
    case "facebook":
      return "facebook"
    case "phone":
      return "phone"
    case "zalo":
      return "zalo"
    case "password":
      return "password"
    case "custom":
      return "custom"
    default:
      return provider ? "unknown" : "password"
  }
}

export function authProviderLabel(provider: string | null | undefined): string {
  switch (normalizeAuthProviderId(provider)) {
    case "google":
      return "Google"
    case "facebook":
      return "Facebook"
    case "phone":
      return "Số điện thoại"
    case "zalo":
      return "Zalo"
    case "password":
      return "Mật khẩu / Email"
    case "custom":
      return "Tuỳ chỉnh"
    default:
      return "Không rõ"
  }
}

export function profileSourceLabel(source: string | null | undefined): string {
  if (!source) return "Chưa xác định"
  if (source === "manual") return "Tự nhập"
  if (source === "system") return "Hệ thống"
  return authProviderLabel(source)
}

export function buildLinkedAccountIdentity(input: {
  providerId: string | null | undefined
  rawProviderId?: string | null
  email?: string | null
  displayName?: string | null
  photoURL?: string | null
  phoneNumber?: string | null
  emailVerified?: boolean
  phoneVerified?: boolean
  linkedAt?: unknown
  lastLoginAt?: unknown
  isPrimary?: boolean
}): LinkedAccountIdentity {
  const providerId = normalizeAuthProviderId(input.providerId)
  return {
    providerId,
    rawProviderId: asString(input.rawProviderId) ?? asString(input.providerId),
    email: input.email ?? null,
    displayName: input.displayName ?? null,
    photoURL: input.photoURL ?? null,
    phoneNumber: input.phoneNumber ?? null,
    emailVerified: Boolean(input.emailVerified),
    phoneVerified: Boolean(input.phoneVerified),
    linkedAt: input.linkedAt,
    lastLoginAt: input.lastLoginAt,
    isPrimary: Boolean(input.isPrimary),
  }
}

export function normalizeLinkedAccountIdentity(value: unknown): LinkedAccountIdentity | null {
  if (!value || typeof value !== "object") return null
  const data = value as Record<string, unknown>
  const providerId = normalizeAuthProviderId(
    typeof data.providerId === "string"
      ? data.providerId
      : typeof data.rawProviderId === "string"
        ? data.rawProviderId
        : undefined
  )

  return {
    providerId,
    rawProviderId: asString(data.rawProviderId) ?? asString(data.providerId),
    email: typeof data.email === "string" ? data.email : null,
    displayName: typeof data.displayName === "string" ? data.displayName : null,
    photoURL: typeof data.photoURL === "string" ? data.photoURL : null,
    phoneNumber: typeof data.phoneNumber === "string" ? data.phoneNumber : null,
    emailVerified: Boolean(data.emailVerified),
    phoneVerified: Boolean(data.phoneVerified),
    linkedAt: data.linkedAt ?? data.linked_at ?? null,
    lastLoginAt: data.lastLoginAt ?? data.last_login_at ?? null,
    isPrimary: Boolean(data.isPrimary),
  }
}

export function normalizeLinkedAccountList(value: unknown): LinkedAccountIdentity[] {
  if (!Array.isArray(value)) return []
  return value.map(normalizeLinkedAccountIdentity).filter(
    (item): item is LinkedAccountIdentity => Boolean(item)
  )
}

export function mergeLinkedAccountIdentities(
  existing: unknown,
  next: LinkedAccountIdentity
): LinkedAccountIdentity[] {
  const map = new Map<string, LinkedAccountIdentity>()
  for (const identity of normalizeLinkedAccountList(existing)) {
    map.set(identity.providerId, identity)
  }

  const current = map.get(next.providerId)
  map.set(next.providerId, {
    ...current,
    ...next,
    rawProviderId: next.rawProviderId ?? current?.rawProviderId ?? next.providerId,
    linkedAt: current?.linkedAt ?? next.linkedAt,
    lastLoginAt: next.lastLoginAt ?? current?.lastLoginAt,
    isPrimary: Boolean(next.isPrimary || current?.isPrimary),
  })

  const identities = Array.from(map.values())
  if (!identities.some((identity) => identity.isPrimary) && identities.length > 0) {
    identities[0] = { ...identities[0], isPrimary: true }
  }
  return identities
}

export function mergeLinkedAccountIdentityList(
  existing: unknown,
  nextList: LinkedAccountIdentity[]
): LinkedAccountIdentity[] {
  return nextList.reduce<LinkedAccountIdentity[]>(
    (current, next) => mergeLinkedAccountIdentities(current, next),
    normalizeLinkedAccountList(existing)
  )
}

export function setPrimaryLinkedAccount(
  existing: unknown,
  providerId: string | null | undefined
): LinkedAccountIdentity[] {
  const normalizedProvider = normalizeAuthProviderId(providerId)
  const identities = normalizeLinkedAccountList(existing).map((identity) => ({
    ...identity,
    isPrimary: identity.providerId === normalizedProvider,
  }))

  if (identities.length === 0) return identities
  if (!identities.some((identity) => identity.isPrimary)) {
    identities[0] = { ...identities[0], isPrimary: true }
  }
  return identities
}

export function normalizeProfileSources(value: unknown): ProfileSources {
  if (!value || typeof value !== "object") return {}
  const data = value as Record<string, unknown>
  const result: ProfileSources = {}
  if (typeof data.name === "string") result.name = data.name as ProfileSourceValue
  if (typeof data.avatar === "string") result.avatar = data.avatar as ProfileSourceValue
  if (typeof data.phone === "string") result.phone = data.phone as ProfileSourceValue
  if (typeof data.email === "string") result.email = data.email as ProfileSourceValue
  if (typeof data.birthDate === "string") result.birthDate = data.birthDate as ProfileSourceValue
  if (typeof data.birth_date === "string") result.birthDate = data.birth_date as ProfileSourceValue
  return result
}
