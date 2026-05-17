import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  getShopProfile,
  saveShopProfile,
  type ShopDisplayConfig,
} from "../lib/shop-profile-service"

export function useShopProfile(shopId: string | null | undefined) {
  return useQuery({
    queryKey: ["shop-profile", shopId],
    enabled: !!shopId,
    queryFn: () => getShopProfile(shopId!),
    staleTime: 60_000,
  })
}

export function useSaveShopProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: saveShopProfile,
    onSuccess: (_, input) => {
      qc.invalidateQueries({ queryKey: ["shop-profile", input.shopId] })
      qc.invalidateQueries({ queryKey: ["vendor", "me"] })
      qc.invalidateQueries({ queryKey: ["vendor", "by-id"] })
      qc.invalidateQueries({ queryKey: ["vendor", "by-uid"] })
    },
  })
}

export type { ShopDisplayConfig }

