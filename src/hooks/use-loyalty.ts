import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "../lib/acfmart-api"

export interface LoyaltyAccount {
  id: string
  customer_id: string
  balance: number
  total_earned: number
  total_redeemed: number
  total_expired: number
  lifetime_spend: number
  tier: "silver" | "gold" | "platinum" | "diamond"
  tier_anniversary: string | null
}

export interface LoyaltyTransaction {
  id: string
  type: "earn" | "redeem" | "expire" | "adjust"
  points: number
  description: string
  reference_type: string | null
  reference_id: string | null
  expires_at: string | null
  expired_at: string | null
  created_at: string
}

export function useLoyalty() {
  return useQuery({
    queryKey: ["loyalty", "me"],
    queryFn: () =>
      apiClient.get<{ account: LoyaltyAccount; transactions: LoyaltyTransaction[] }>(
        "/store/loyalty/me",
        { authRequired: true }
      ),
  })
}

export function useRedeemPoints() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (optionId: string) =>
      apiClient.post(
        "/store/loyalty/redeem",
        { option_id: optionId },
        { authRequired: true }
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["loyalty", "me"] }),
  })
}
