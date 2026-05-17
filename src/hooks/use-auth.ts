import { useMutation } from "@tanstack/react-query"
import { useEffect } from "react"
import { authService, type SignUpInput } from "../lib/auth-service"
import { useAuthStore } from "../stores/auth-store"
import { redirectToZaloLogin } from "../lib/zalo-auth"

/**
 * Hook for sign-in mutation (email + password).
 */
export function useEmailLogin() {
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authService.signInWithEmail(email, password),
  })
}

/**
 * Hook for sign-in mutation (phone + password).
 */
export function usePhoneLogin() {
  return useMutation({
    mutationFn: ({ phone, password }: { phone: string; password: string }) =>
      authService.signInWithPhone(phone, password),
  })
}

/**
 * Hook for sign-up mutation.
 */
export function useEmailSignup() {
  return useMutation({
    mutationFn: (input: SignUpInput) => authService.signUpWithEmail(input),
  })
}

export function useGoogleLogin() {
  return useMutation({ mutationFn: () => authService.signInWithGoogle() })
}

export function useFacebookLogin() {
  return useMutation({ mutationFn: () => authService.signInWithFacebook() })
}

export function useZaloLogin() {
  return useMutation({ mutationFn: (redirectTo?: string) => redirectToZaloLogin(redirectTo) })
}

export function usePasswordReset() {
  return useMutation({
    mutationFn: (email: string) => authService.sendPasswordReset(email),
  })
}

export function useLogout() {
  return useMutation({ mutationFn: () => authService.signOut() })
}

/**
 * One-shot subscription to Firebase auth state. Mount in App.tsx so the
 * Zustand store reflects login status after page refresh / token expiry.
 */
export function useAuthSubscription() {
  useEffect(() => {
    const unsubscribe = authService.subscribe()
    return unsubscribe
  }, [])
}

export function useCurrentUser() {
  return useAuthStore((s) => s.user)
}

export function useIsAuthenticated() {
  return useAuthStore((s) => s.isAuthenticated)
}
