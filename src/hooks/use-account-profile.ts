import { useEffect, useState } from "react"
import { doc, onSnapshot, Timestamp, type Unsubscribe } from "firebase/firestore"
import { firestore } from "../lib/firebase"
import { useAuthStore } from "../stores/auth-store"
import {
  normalizeLinkedAccountList,
  normalizeProfileSources,
  type AccountProfileDoc,
} from "../lib/account-identity"

export interface AccountProfileState {
  profile: AccountProfileDoc | null
  loading: boolean
  error: Error | null
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined
}

function normalizeAccountProfile(id: string, data: Record<string, unknown>): AccountProfileDoc {
  const name = asString(data.name) ?? asString(data.displayName)
  const authProviders = normalizeLinkedAccountList(data.auth_providers ?? data.authProviders)

  return {
    id,
    email: asString(data.email),
    name,
    displayName: asString(data.displayName) ?? name,
    phone: asString(data.phone),
    avatar: asString(data.avatar),
    role: asString(data.role),
    authProvider: asString(data.auth_provider ?? data.authProvider),
    primaryAuthProvider: asString(data.primary_auth_provider ?? data.primaryAuthProvider),
    lastAuthProvider: asString(data.last_auth_provider ?? data.lastAuthProvider),
    authProviders,
    profileSources: normalizeProfileSources(data.profile_sources ?? data.profileSources),
    lastLoginAt:
      data.last_login_at instanceof Timestamp
        ? data.last_login_at
        : data.lastLoginAt instanceof Timestamp
          ? data.lastLoginAt
          : undefined,
    createdAt:
      data.created_at instanceof Timestamp
        ? data.created_at
        : data.createdAt instanceof Timestamp
          ? data.createdAt
          : undefined,
    birthDate:
      asString(data.birth_date) ?? asString(data.birthday) ?? undefined,
    updatedAt:
      data.updated_at instanceof Timestamp
        ? data.updated_at
        : data.updatedAt instanceof Timestamp
          ? data.updatedAt
          : undefined,
    disabled: typeof data.disabled === "boolean" ? data.disabled : undefined,
  }
}

export function useAccountProfile(): AccountProfileState {
  const userId = useAuthStore((state) => state.user?.id)
  const [profile, setProfile] = useState<AccountProfileDoc | null>(null)
  const [loading, setLoading] = useState(Boolean(userId))
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let unsub: Unsubscribe | null = null
    let cancelled = false

    if (!userId) {
      setProfile(null)
      setLoading(false)
      setError(null)
      return undefined
    }

    setLoading(true)
    setError(null)

    unsub = onSnapshot(
      doc(firestore, "users", userId),
      (snapshot) => {
        if (cancelled) return
        if (!snapshot.exists()) {
          setProfile(null)
          setError(null)
          setLoading(false)
          return
        }
        setError(null)
        setProfile(normalizeAccountProfile(snapshot.id, snapshot.data() as Record<string, unknown>))
        setLoading(false)
      },
      (err) => {
        if (cancelled) return
        const nextError = err instanceof Error ? err : new Error("Không tải được hồ sơ tài khoản")
        setError(nextError)
        setLoading(false)
      }
    )

    return () => {
      cancelled = true
      unsub?.()
    }
  }, [userId])

  return { profile, loading, error }
}
