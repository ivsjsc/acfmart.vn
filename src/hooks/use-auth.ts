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

export function useStartPhoneLogin() {
  return useMutation({
    mutationFn: (phone: string) => authService.startPhoneSignIn(phone),
  })
}

export function useVerifyPhoneLogin() {
  return useMutation({
    mutationFn: (otp: string) => authService.confirmPhoneSignIn(otp),
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
  return useMutation({ mutationFn: (redirectTo?: string) => authService.signInWithGoogle(redirectTo) })
}

export function useFacebookLogin() {
  return useMutation({ mutationFn: (redirectTo?: string) => authService.signInWithFacebook(redirectTo) })
}

export function useLinkGoogleAccount() {
  return useMutation({ mutationFn: () => authService.linkGoogleAccount() })
}

export function useLinkFacebookAccount() {
  return useMutation({ mutationFn: () => authService.linkFacebookAccount() })
}

export function useOAuthRedirectLogin() {
  return useMutation({ mutationFn: () => authService.completeOAuthRedirect() })
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
