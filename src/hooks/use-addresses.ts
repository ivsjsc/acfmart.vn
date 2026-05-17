import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  addOrUpdateAddress,
  deleteAddress,
  listAddresses,
  setDefaultAddress,
  type SaveAddressInput,
} from "../lib/address-service"
import { unwrapServiceResult } from "../lib/service-result"
import { useAuthStore } from "../stores/auth-store"
import { useFirebaseAuthReady } from "./use-firebase-auth-ready"

export type { UserAddress, SaveAddressInput } from "../lib/address-service"

export function useAddresses() {
  const uid = useAuthStore((s) => s.user?.id)
  const authReady = useFirebaseAuthReady()

  return useQuery({
    queryKey: ["addresses", uid],
    enabled: authReady && !!uid,
    queryFn: async () => unwrapServiceResult(await listAddresses(uid!)),
    staleTime: 60_000,
  })
}

export function useSaveAddress() {
  const qc = useQueryClient()
  const uid = useAuthStore((s) => s.user?.id)

  return useMutation({
    mutationFn: async (input: { addressId?: string | null; data: SaveAddressInput }) =>
      unwrapServiceResult(await addOrUpdateAddress(input.addressId ?? null, input.data, uid)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["addresses"] }),
  })
}

export function useSetDefaultAddress() {
  const qc = useQueryClient()
  const uid = useAuthStore((s) => s.user?.id)

  return useMutation({
    mutationFn: async (addressId: string) =>
      unwrapServiceResult(await setDefaultAddress(addressId, uid)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["addresses"] }),
  })
}

export function useDeleteAddress() {
  const qc = useQueryClient()
  const uid = useAuthStore((s) => s.user?.id)

  return useMutation({
    mutationFn: async (addressId: string) =>
      unwrapServiceResult(await deleteAddress(addressId, uid)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["addresses"] }),
  })
}
