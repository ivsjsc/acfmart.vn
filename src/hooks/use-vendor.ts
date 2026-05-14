import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useAuthStore } from "../stores/auth-store"
import {
  getMyVendor,
  registerVendor,
  type VendorDoc,
  type RegisterVendorInput,
} from "../lib/vendor-service"

export type { VendorDoc as VendorRecord }

export type RegisterVendorPayload = Omit<RegisterVendorInput, "firebase_uid">

/** Get current logged-in user's vendor record (if any) */
export function useMyVendor() {
  const firebaseUid = useAuthStore((s) => s.user?.id)
  return useQuery({
    queryKey: ["vendor", "me", firebaseUid],
    enabled: !!firebaseUid,
    queryFn: () => getMyVendor(firebaseUid!),
  })
}

/** Register as a new vendor */
export function useRegisterVendor() {
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)
  return useMutation({
    mutationFn: (payload: RegisterVendorPayload) =>
      registerVendor({
        ...payload,
        firebase_uid: user?.id ?? "",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor", "me"] })
    },
  })
}
