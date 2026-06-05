import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useAuthStore } from "../stores/auth-store"
import { useFirebaseAuthReady } from "./use-firebase-auth-ready"
import {
  createSellerVnptKycSession,
  getSellerKycStatus,
  submitSellerVnptKycResult,
} from "../lib/ivs-trust-api"
import {
  getLatestVnptSessionStatus,
  getSellerFinalKycStatus,
  isTerminalKycStatus,
  type SellerKycStatusPayload,
  type StartSellerVnptKycSessionInput,
  type StartSellerVnptKycSessionResult,
} from "../lib/kyc"

export function useSellerKycStatus() {
  const authReady = useFirebaseAuthReady()
  const user = useAuthStore((s) => s.user)

  return useQuery({
    queryKey: ["kyc", "seller-status", user?.id],
    enabled: authReady && !!user?.id,
    queryFn: () => getSellerKycStatus(),
    staleTime: 10_000,
    refetchInterval: (query) => {
      const data = query.state.data as SellerKycStatusPayload | undefined
      if (!data) return false

      const finalStatus = getSellerFinalKycStatus(data)
      const sessionStatus = getLatestVnptSessionStatus(data)
      return !isTerminalKycStatus(finalStatus) || !isTerminalKycStatus(sessionStatus)
        ? 10_000
        : false
    },
  })
}

export function useStartSellerVnptKycSession() {
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)

  return useMutation({
    mutationFn: (input: StartSellerVnptKycSessionInput) =>
      createSellerVnptKycSession(input),
    onSuccess: (_result: StartSellerVnptKycSessionResult) => {
      queryClient.invalidateQueries({ queryKey: ["kyc", "seller-status", user?.id] })
      queryClient.invalidateQueries({ queryKey: ["vendor", "me", user?.id] })
      queryClient.invalidateQueries({ queryKey: ["moderation", "vendors"] })
    },
  })
}

export function useSubmitSellerVnptKycResult() {
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)

  return useMutation({
    mutationFn: (input: { sessionId: string; result: unknown }) =>
      submitSellerVnptKycResult(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kyc", "seller-status", user?.id] })
      queryClient.invalidateQueries({ queryKey: ["vendor", "me", user?.id] })
      queryClient.invalidateQueries({ queryKey: ["moderation", "vendors"] })
    },
  })
}
