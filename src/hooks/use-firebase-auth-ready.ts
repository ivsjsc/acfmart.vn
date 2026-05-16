import { useEffect, useState } from "react"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "../lib/firebase"

/**
 * Returns true once Firebase Auth has finished restoring the persisted
 * session — i.e. onAuthStateChanged has fired at least once.
 *
 * The Zustand auth-store re-hydrates synchronously from localStorage, so
 * `useAuthStore.isAuthenticated` can read `true` while `auth.currentUser`
 * is still `null`. Any Firestore query started in that window is rejected
 * by security rules (unauthenticated context), producing the empty
 * dashboards / "permission-denied" empty lists we hit on mobile reloads.
 *
 * Subscribe to this hook and gate `onSnapshot` / React Query `enabled`
 * on its boolean value to avoid the race.
 */
export function useFirebaseAuthReady(): boolean {
  // If Firebase already has a current user when we mount, we are ready
  // immediately — no need to wait for the listener to fire.
  const [ready, setReady] = useState<boolean>(() => auth.currentUser !== null)

  useEffect(() => {
    if (ready) return
    const unsubscribe = onAuthStateChanged(auth, () => {
      setReady(true)
    })
    return () => unsubscribe()
  }, [ready])

  return ready
}
