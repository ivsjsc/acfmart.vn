import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "../lib/acfmart-api"

export interface AffiliateAccount {
  id: string
  customer_id: string
  display_name: string
  status: "pending" | "active" | "suspended"
  tier: "bronze" | "silver" | "gold" | "platinum" | "diamond"
  default_commission_bps: number
  total_clicks: number
  total_conversions: number
  lifetime_commission: number
  pending_commission: number
  paid_commission: number
}

export interface AffiliateLink {
  id: string
  short_code: string
  title: string | null
  target_url: string
  target_type: "product" | "shop" | "category" | "campaign" | "home"
  target_id: string | null
  commission_bps: number | null
  status: "active" | "paused" | "pending" | "expired"
  clicks: number
  unique_clicks: number
  conversions: number
  total_commission: number
  last_click_at: string | null
  created_at: string
}

export function useAffiliateAccount() {
  return useQuery({
    queryKey: ["affiliate", "account"],
    queryFn: () =>
      apiClient.get<{ account: AffiliateAccount }>("/store/affiliate/account", {
        authRequired: true,
      }),
  })
}

export function useAffiliateLinks() {
  return useQuery({
    queryKey: ["affiliate", "links"],
    queryFn: () =>
      apiClient.get<{ links: AffiliateLink[] }>("/store/affiliate/links", {
        authRequired: true,
      }),
  })
}

export function useCreateAffiliateLink() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: {
      target_url: string
      target_type: AffiliateLink["target_type"]
      target_id?: string
      title?: string
    }) =>
      apiClient.post<{ link: AffiliateLink }>("/store/affiliate/links", input, {
        authRequired: true,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["affiliate", "links"] }),
  })
}
