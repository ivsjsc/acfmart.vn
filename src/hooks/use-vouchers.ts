import { useEffect, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  createVoucher,
  deleteVoucher,
  listAvailableVouchers,
  subscribeShopVouchers,
  updateVoucher,
  setVoucherActive,
  type CreateVoucherInput,
  type UpdateVoucherInput,
  type VoucherDoc,
} from "../lib/voucher-service"

/**
 * Realtime list of vouchers owned by the seller. Stream keeps the seller
 * dashboard in sync as voucher status flips (e.g. usedCount increment by
 * the backend after an order).
 */
export function useShopVouchers(shopId: string | null | undefined): {
  vouchers: VoucherDoc[]
  loading: boolean
  error: string | null
} {
  const [vouchers, setVouchers] = useState<VoucherDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!shopId) {
      setVouchers([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    const unsub = subscribeShopVouchers(
      shopId,
      (next) => {
        setVouchers(next)
        setLoading(false)
      },
      (err) => {
        setError(err.message)
        setLoading(false)
      }
    )
    return () => unsub()
  }, [shopId])

  return { vouchers, loading, error }
}

/**
 * Buyer-facing list of currently usable vouchers. Optionally scoped to a
 * single shop (when used inside a shop page). Cached via React Query.
 */
export function useAvailableVouchers(params?: {
  shopId?: string
  limitCount?: number
}) {
  return useQuery({
    queryKey: ["available-vouchers", params?.shopId ?? "all", params?.limitCount ?? null],
    queryFn: () => listAvailableVouchers(params),
    staleTime: 60_000,
  })
}

export function useCreateVoucher(shopId: string | null | undefined) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateVoucherInput) => createVoucher(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["available-vouchers"] })
      if (shopId) qc.invalidateQueries({ queryKey: ["shop-vouchers", shopId] })
    },
  })
}

export function useUpdateVoucher(shopId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: { voucherId: string; patch: UpdateVoucherInput }) =>
      updateVoucher(input.voucherId, shopId, input.patch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["available-vouchers"] })
      qc.invalidateQueries({ queryKey: ["shop-vouchers", shopId] })
    },
  })
}

export function useDeleteVoucher(shopId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (voucherId: string) => deleteVoucher(voucherId, shopId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["available-vouchers"] })
      qc.invalidateQueries({ queryKey: ["shop-vouchers", shopId] })
    },
  })
}

export function useToggleVoucherActive(shopId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: { voucherId: string; isActive: boolean }) =>
      setVoucherActive(input.voucherId, shopId, input.isActive),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["available-vouchers"] })
      qc.invalidateQueries({ queryKey: ["shop-vouchers", shopId] })
    },
  })
}
