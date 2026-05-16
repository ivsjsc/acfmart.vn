import { useEffect, useState } from "react"
import { auth } from "../lib/firebase"

/**
 * Returns true once Firebase Auth has finished restoring the persisted
 * session — i.e. `auth.authStateReady()` has resolved.
 *
 * The Zustand auth-store re-hydrates synchronously from localStorage, so
 * `useAuthStore.isAuthenticated` can read `true` while `auth.currentUser`
 * is still `null`. Any Firestore query started in that window is rejected
 * by security rules (unauthenticated context), producing the empty
 * dashboards / "permission-denied" empty lists we hit on mobile reloads.
 *
 * We use the official `authStateReady()` promise (matches the pattern in
 * `vendor-service.ts` and `user-management-service.ts`) rather than
 * `onAuthStateChanged`, because:
 *   1. authStateReady resolves exactly once, after persistence restore,
 *      regardless of whether the user is signed in or not.
 *   2. onAuthStateChanged can fire multiple times during sign-in/out
 *      transitions, making the "ready" semantics fuzzy.
 *   3. Service-level callers already wait via `auth.authStateReady()`;
 *      using the same primitive here keeps the timing identical.
 *
 * Gate `useEffect` Firestore subscriptions and React Query `enabled` on
 * this boolean to avoid the race.
 */
export function useFirebaseAuthReady(): boolean {
  // If Firebase already has a current user when we mount, we are ready
  // immediately — no need to await the promise.
  const [ready, setReady] = useState<boolean>(() => auth.currentUser !== null)

  useEffect(() => {
    if (ready) return
    let cancelled = false
    auth
      .authStateReady()
      .then(() => {
        if (!cancelled) setReady(true)
      })
      .catch((err) => {
        // Treat a failed state restore as "ready with no user" so the
        // component can render its unauthenticated branch instead of
        // hanging on a loading spinner forever.
        console.error("[useFirebaseAuthReady] authStateReady failed:", err)
        if (!cancelled) setReady(true)
      })
    return () => {
      cancelled = true
    }
  }, [ready])

  return ready
}
