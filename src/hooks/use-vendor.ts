import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useAuthStore } from "../stores/auth-store"
import { useFirebaseAuthReady } from "./use-firebase-auth-ready"
import {
  getMyVendor,
  getVendorById,
  getVendorByFirebaseUid,
  registerVendor,
  updateMyVendor,
  type UpdateVendorInput,
  type VendorDoc,
  type RegisterVendorInput,
} from "../lib/vendor-service"

export type { VendorDoc as VendorRecord }

export type RegisterVendorPayload = Omit<RegisterVendorInput, "firebase_uid">

/** Get current logged-in user's vendor record (if any).
 *
 * Waits for `onAuthStateChanged` to fire before issuing the Firestore
 * read, otherwise the request is sent unauthenticated on a cold reload
 * and rules deny it — which presents to the user as the seller portal
 * being unable to load their profile.
 */
export function useMyVendor() {
  const firebaseUid = useAuthStore((s) => s.user?.id)
  const authReady = useFirebaseAuthReady()
  return useQuery({
    queryKey: ["vendor", "me", firebaseUid],
    enabled: authReady && !!firebaseUid,
    queryFn: () => getMyVendor(firebaseUid!),
  })
}

/** Lookup vendor by Firestore doc id (buyer-facing) */
export function useVendorById(vendorId: string | undefined) {
  return useQuery({
    queryKey: ["vendor", "by-id", vendorId],
    enabled: !!vendorId,
    queryFn: () => getVendorById(vendorId!),
  })
}

/** Lookup vendor by firebase_uid (shopId in products) */
export function useVendorByUid(uid: string | undefined) {
  return useQuery({
    queryKey: ["vendor", "by-uid", uid],
    enabled: !!uid,
    queryFn: () => getVendorByFirebaseUid(uid!),
  })
}

/** Self-update vendor profile (settings screen) */
export function useUpdateMyVendor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: { vendorId: string; patch: UpdateVendorInput }) =>
      updateMyVendor(input.vendorId, input.patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor", "me"] })
      queryClient.invalidateQueries({ queryKey: ["vendor", "by-id"] })
      queryClient.invalidateQueries({ queryKey: ["vendor", "by-uid"] })
    },
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
