import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  createTopupIntent,
  getWallet,
  withdrawWallet,
  type CreateTopupIntentInput,
  type WithdrawWalletInput,
} from "../lib/wallet-service"
import { unwrapServiceResult } from "../lib/service-result"
import { useAuthStore } from "../stores/auth-store"
import { useFirebaseAuthReady } from "./use-firebase-auth-ready"

export type {
  WalletAccount,
  WalletMethod,
  WalletTransaction,
  WalletTransactionStatus,
  WalletTransactionType,
} from "../lib/wallet-service"

export function useWallet(limitCount = 100) {
  const uid = useAuthStore((s) => s.user?.id)
  const authReady = useFirebaseAuthReady()

  return useQuery({
    queryKey: ["wallet", uid, limitCount],
    enabled: authReady && !!uid,
    queryFn: async () => unwrapServiceResult(await getWallet(uid!, limitCount)),
    staleTime: 60_000,
  })
}

export function useCreateTopupIntent() {
  const qc = useQueryClient()
  const uid = useAuthStore((s) => s.user?.id)

  return useMutation({
    mutationFn: async (
      input: Omit<CreateTopupIntentInput, "user_id"> & { user_id?: string }
    ) => {
      if (!uid) throw new Error("Bạn cần đăng nhập để nạp ví")
      return unwrapServiceResult(
        await createTopupIntent({
          ...input,
          user_id: input.user_id ?? uid,
        })
      )
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["wallet"] }),
  })
}

export function useWithdrawWallet() {
  const qc = useQueryClient()
  const uid = useAuthStore((s) => s.user?.id)

  return useMutation({
    mutationFn: async (
      input: Omit<WithdrawWalletInput, "user_id"> & { user_id?: string }
    ) => {
      if (!uid) throw new Error("Bạn cần đăng nhập để rút tiền")
      return unwrapServiceResult(
        await withdrawWallet({
          ...input,
          user_id: input.user_id ?? uid,
        })
      )
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["wallet"] }),
  })
}
