import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { REDEEM_OPTIONS } from "../features/account/loyalty-data"
import { getLoyalty, redeemPoints } from "../lib/loyalty-service"
import { unwrapServiceResult } from "../lib/service-result"
import { useAuthStore } from "../stores/auth-store"
import { useFirebaseAuthReady } from "./use-firebase-auth-ready"
import type { LoyaltyAccount, LoyaltyTransaction } from "../lib/loyalty-service"

export type {
  LoyaltyAccount,
  LoyaltyTransaction,
} from "../lib/loyalty-service"

export type RedeemPointsPayload =
  | string
  | {
      optionId: string
      idempotencyKey?: string
    }

type LoyaltyQueryData = {
  account: LoyaltyAccount
  transactions: LoyaltyTransaction[]
}

function newIdempotencyKey(uid: string, optionId: string): string {
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2)
  return `redeem:${uid}:${optionId}:${random}`
}

export function useLoyalty() {
  const uid = useAuthStore((s) => s.user?.id)
  const authReady = useFirebaseAuthReady()

  return useQuery({
    queryKey: ["loyalty", "me", uid],
    enabled: authReady && !!uid,
    queryFn: async () => unwrapServiceResult(await getLoyalty(uid!)),
    staleTime: 60_000,
  })
}

export function useRedeemPoints() {
  const qc = useQueryClient()
  const uid = useAuthStore((s) => s.user?.id)

  return useMutation({
    mutationFn: async (payload: RedeemPointsPayload) => {
      if (!uid) throw new Error("Bạn cần đăng nhập để đổi điểm")

      const optionId = typeof payload === "string" ? payload : payload.optionId
      const option = REDEEM_OPTIONS.find((item) => item.id === optionId)
      if (!option) throw new Error("Gói đổi điểm không hợp lệ")

      return unwrapServiceResult(
        await redeemPoints({
          user_id: uid,
          option_id: option.id,
          points_cost: option.pointsCost,
          voucher_code: option.voucherCode,
          voucher_value: option.voucherValue,
          reward_type: option.type,
          idempotency_key:
            typeof payload === "string"
              ? newIdempotencyKey(uid, option.id)
              : payload.idempotencyKey ?? newIdempotencyKey(uid, option.id),
        })
      )
    },
    onMutate: async (payload) => {
      if (!uid) return undefined
      const optionId = typeof payload === "string" ? payload : payload.optionId
      const option = REDEEM_OPTIONS.find((item) => item.id === optionId)
      if (!option) return undefined

      const queryKey = ["loyalty", "me", uid]
      await qc.cancelQueries({ queryKey })
      const previous = qc.getQueryData<LoyaltyQueryData>(queryKey)

      qc.setQueryData<LoyaltyQueryData>(queryKey, (current) => {
        if (!current || current.account.balance < option.pointsCost) return current
        return {
          ...current,
          account: {
            ...current.account,
            balance: current.account.balance - option.pointsCost,
            total_redeemed: current.account.total_redeemed + option.pointsCost,
          },
        }
      })

      return { previous, queryKey }
    },
    onError: (_err, _payload, context) => {
      if (context?.previous && context?.queryKey) {
        qc.setQueryData(context.queryKey, context.previous)
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["loyalty", "me"] }),
  })
}
