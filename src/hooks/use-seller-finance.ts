import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useAuthStore } from "../stores/auth-store"
import {
  createVatInvoice,
  getFeeBreakdown,
  getNextPayout,
  getRevenueBreakdown,
  getSellerBalance,
  getTaxExportRows,
  listPayouts,
  listPayoutTransactions,
  listTransactions,
  listVatInvoices,
  requestEarlyPayout,
} from "../lib/seller-finance-service"
import type {
  CreateVatInvoiceInput,
  PayoutDoc,
  TransactionFilters,
} from "../features/seller/finance-types"

// ─── Queries ────────────────────────────────────────────────────────────

export function useSellerBalance() {
  const uid = useAuthStore((s) => s.user?.id)
  return useQuery({
    queryKey: ["seller", "finance", "balance", uid],
    enabled: !!uid,
    queryFn: () => getSellerBalance(uid!),
    staleTime: 60_000,
  })
}

export function useNextPayout() {
  const uid = useAuthStore((s) => s.user?.id)
  return useQuery({
    queryKey: ["seller", "finance", "next-payout", uid],
    enabled: !!uid,
    queryFn: () => getNextPayout(uid!),
    staleTime: 60_000,
  })
}

export function usePayoutHistory(params: {
  status?: PayoutDoc["status"]
  from?: Date
  to?: Date
  limit?: number
}) {
  const uid = useAuthStore((s) => s.user?.id)
  return useQuery({
    queryKey: ["seller", "finance", "payouts", uid, params],
    enabled: !!uid,
    queryFn: () =>
      listPayouts({
        shopId: uid!,
        status: params.status,
        from: params.from,
        to: params.to,
        limitCount: params.limit ?? 50,
      }),
  })
}

export function usePayoutTransactions(payoutId: string | null) {
  return useQuery({
    queryKey: ["seller", "finance", "payout-tx", payoutId],
    enabled: !!payoutId,
    queryFn: () => listPayoutTransactions(payoutId!),
  })
}

export function useTransactionHistory(filters: TransactionFilters) {
  const uid = useAuthStore((s) => s.user?.id)
  return useQuery({
    queryKey: ["seller", "finance", "transactions", uid, filters],
    enabled: !!uid,
    queryFn: () => listTransactions({ shopId: uid!, filters }),
  })
}

export function useRevenueBreakdown(range: { from: Date; to: Date }) {
  const uid = useAuthStore((s) => s.user?.id)
  return useQuery({
    queryKey: [
      "seller",
      "finance",
      "revenue-breakdown",
      uid,
      range.from.toISOString(),
      range.to.toISOString(),
    ],
    enabled: !!uid,
    queryFn: () => getRevenueBreakdown({ shopId: uid!, from: range.from, to: range.to }),
    staleTime: 5 * 60_000,
  })
}

export function useFeeBreakdown(range: { from: Date; to: Date }) {
  const uid = useAuthStore((s) => s.user?.id)
  return useQuery({
    queryKey: [
      "seller",
      "finance",
      "fee-breakdown",
      uid,
      range.from.toISOString(),
      range.to.toISOString(),
    ],
    enabled: !!uid,
    queryFn: () => getFeeBreakdown({ shopId: uid!, from: range.from, to: range.to }),
    staleTime: 5 * 60_000,
  })
}

export function useVatInvoices(params: {
  from?: Date
  to?: Date
  limit?: number
}) {
  const uid = useAuthStore((s) => s.user?.id)
  return useQuery({
    queryKey: ["seller", "finance", "vat-invoices", uid, params],
    enabled: !!uid,
    queryFn: () =>
      listVatInvoices({
        shopId: uid!,
        from: params.from,
        to: params.to,
        limitCount: params.limit ?? 50,
      }),
  })
}

// ─── Mutations ──────────────────────────────────────────────────────────

export function useCreateVatInvoice() {
  const qc = useQueryClient()
  const user = useAuthStore((s) => s.user)
  return useMutation({
    mutationFn: (input: CreateVatInvoiceInput) =>
      createVatInvoice({
        ...input,
        actorId: user?.id ?? "",
        actorEmail: user?.email ?? "",
        actorRole: user?.role ?? "seller",
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["seller", "finance", "vat-invoices"] })
    },
  })
}

export function useRequestEarlyPayout() {
  const qc = useQueryClient()
  const user = useAuthStore((s) => s.user)
  return useMutation({
    mutationFn: () =>
      requestEarlyPayout({
        shopId: user?.id ?? "",
        actorId: user?.id ?? "",
        actorEmail: user?.email ?? "",
        actorRole: user?.role ?? "seller",
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["seller", "finance", "next-payout"] })
    },
  })
}

export function useTaxExport() {
  const uid = useAuthStore((s) => s.user?.id)
  return useMutation({
    mutationFn: (range: { from: Date; to: Date }) =>
      getTaxExportRows({ shopId: uid!, from: range.from, to: range.to }),
  })
}
