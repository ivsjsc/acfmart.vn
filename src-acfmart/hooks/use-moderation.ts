import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useAuthStore } from "../stores/auth-store"
import {
  listVendors,
  approveVendor,
  rejectVendor,
  suspendVendor,
  type VendorDoc,
} from "../lib/vendor-service"

export interface ModerationVendorsResponse {
  vendors: VendorDoc[]
  count: number
}

/** Admin/Moderator: list vendors for moderation */
export function useModerationVendors(params: {
  status?: "pending" | "active" | "suspended" | "rejected"
  q?: string
  limit?: number
  offset?: number
}) {
  return useQuery({
    queryKey: ["moderation", "vendors", params],
    queryFn: () =>
      listVendors({
        status: params.status,
        q: params.q,
        limitCount: params.limit ?? 50,
        offset: params.offset,
      }),
  })
}

export function useApproveVendor() {
  const qc = useQueryClient()
  const user = useAuthStore((s) => s.user)
  return useMutation({
    mutationFn: (input: {
      id: string
      note?: string
      kyc_level?: "basic" | "verified" | "premium"
    }) =>
      approveVendor(
        input.id,
        { id: user?.id ?? "", email: user?.email ?? "", role: user?.role ?? "admin" },
        input.note,
        input.kyc_level ?? "verified"
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["moderation", "vendors"] }),
  })
}

export function useRejectVendor() {
  const qc = useQueryClient()
  const user = useAuthStore((s) => s.user)
  return useMutation({
    mutationFn: (input: { id: string; reason: string }) =>
      rejectVendor(
        input.id,
        { id: user?.id ?? "", email: user?.email ?? "", role: user?.role ?? "admin" },
        input.reason
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["moderation", "vendors"] }),
  })
}

export function useSuspendVendor() {
  const qc = useQueryClient()
  const user = useAuthStore((s) => s.user)
  return useMutation({
    mutationFn: (input: { id: string; reason: string }) =>
      suspendVendor(
        input.id,
        { id: user?.id ?? "", email: user?.email ?? "", role: user?.role ?? "admin" },
        input.reason
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["moderation", "vendors"] }),
  })
}
