import { useEffect, useState } from "react"
import type { Unsubscribe } from "firebase/firestore"
import {
  subscribePublicAffiliateProfile,
  type PublicAffiliateProfileDoc,
} from "../lib/public-affiliate-service"

export interface PublicAffiliateProfileState {
  profile: PublicAffiliateProfileDoc | null
  loading: boolean
  error: Error | null
}

export function usePublicAffiliateProfile(uid?: string): PublicAffiliateProfileState {
  const [profile, setProfile] = useState<PublicAffiliateProfileDoc | null>(null)
  const [loading, setLoading] = useState(Boolean(uid))
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let unsub: Unsubscribe | null = null
    let cancelled = false

    if (!uid) {
      setProfile(null)
      setLoading(false)
      setError(null)
      return undefined
    }

    setLoading(true)
    setError(null)

    unsub = subscribePublicAffiliateProfile(
      uid,
      (nextProfile) => {
        if (cancelled) return
        setProfile(nextProfile)
        setError(null)
        setLoading(false)
      },
      (err) => {
        if (cancelled) return
        setError(err)
        setLoading(false)
      }
    )

    return () => {
      cancelled = true
      unsub?.()
    }
  }, [uid])

  return { profile, loading, error }
}
