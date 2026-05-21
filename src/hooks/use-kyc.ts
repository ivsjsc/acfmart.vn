import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useAuthStore } from "../stores/auth-store"
import { useFirebaseAuthReady } from "./use-firebase-auth-ready"
import {
  isTerminalKycStatus,
  listMyVendorKycApplications,
  startVendorKyc,
  type KycApplicationRecord,
  type StartVendorKycInput,
  type StartVendorKycResult,
} from "../lib/kyc"

export function useMyVendorKycApplications(firebaseUid?: string) {
  const authReady = useFirebaseAuthReady()
  return useQuery({
    queryKey: ["kyc", "applications", firebaseUid],
    enabled: authReady && !!firebaseUid,
    queryFn: () => listMyVendorKycApplications(firebaseUid!),
    staleTime: 10_000,
    refetchInterval: (query) => {
      const data = (query.state.data ?? []) as KycApplicationRecord[]
      const latest = data[0]
      return latest && !isTerminalKycStatus(latest.status) ? 8_000 : false
    },
  })
}

export function useStartVendorKyc() {
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)

  return useMutation({
    mutationFn: (input: StartVendorKycInput) => startVendorKyc(input),
    onSuccess: (result: StartVendorKycResult, input: StartVendorKycInput) => {
      queryClient.invalidateQueries({ queryKey: ["kyc", "applications"] })
      queryClient.invalidateQueries({ queryKey: ["vendor", "me", user?.id] })
      queryClient.invalidateQueries({ queryKey: ["moderation", "vendors"] })
    },
  })
}
