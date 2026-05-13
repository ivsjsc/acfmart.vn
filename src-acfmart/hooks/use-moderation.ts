import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "../lib/acfmart-api"
import type { VendorRecord } from "./use-vendor"

export interface ModerationVendorsResponse {
  vendors: VendorRecord[]
  count: number
  counts: Record<"pending" | "active" | "suspended" | "rejected", number>
  limit: number
  offset: number
}

export interface CounterfeitReport {
  id: string
  reporter_id: string
  reporter_name: string
  reporter_email: string | null
  reporter_phone: string | null
  order_id: string | null
  product_id: string | null
  vendor_id: string | null
  verification_code_id: string | null
  title: string
  description: string
  purchase_location: string | null
  evidence_urls: string[] | null
  severity: "low" | "medium" | "high" | "critical"
  status: "submitted" | "investigating" | "verified" | "rejected" | "resolved"
  assigned_moderator: string | null
  resolution: string | null
  resolved_at: string | null
  response_to_reporter: string | null
  reward_points: number
  created_at: string
}

export interface ModerationReportsResponse {
  reports: CounterfeitReport[]
  count: number
  counts: Record<string, number>
}

/** Admin: list vendors for moderation */
export function useModerationVendors(params: {
  status?: "pending" | "active" | "suspended" | "rejected"
  q?: string
  limit?: number
  offset?: number
}) {
  return useQuery({
    queryKey: ["moderation", "vendors", params],
    queryFn: () =>
      apiClient.get<ModerationVendorsResponse>("/admin/vendors", {
        authRequired: true,
        params,
      }),
  })
}

export function useApproveVendor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: {
      id: string
      note?: string
      kyc_level?: "basic" | "verified" | "premium"
    }) =>
      apiClient.post(
        `/admin/vendors/${input.id}/approve`,
        { note: input.note, kyc_level: input.kyc_level ?? "verified" },
        { authRequired: true }
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["moderation", "vendors"] }),
  })
}

export function useRejectVendor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: { id: string; reason: string }) =>
      apiClient.post(
        `/admin/vendors/${input.id}/reject`,
        { reason: input.reason },
        { authRequired: true }
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["moderation", "vendors"] }),
  })
}

export function useSuspendVendor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: { id: string; reason: string }) =>
      apiClient.post(
        `/admin/vendors/${input.id}/suspend`,
        { reason: input.reason },
        { authRequired: true }
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["moderation", "vendors"] }),
  })
}

export function useModerationReports(params: {
  status?: string
  severity?: "low" | "medium" | "high" | "critical"
}) {
  return useQuery({
    queryKey: ["moderation", "reports", params],
    queryFn: () =>
      apiClient.get<ModerationReportsResponse>("/admin/counterfeit-reports", {
        authRequired: true,
        params,
      }),
  })
}

export function useResolveReport() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: {
      id: string
      verdict: "verified" | "rejected" | "resolved"
      resolution: string
      response_to_reporter?: string
      reward_points?: number
      suspend_vendor?: boolean
    }) =>
      apiClient.post(
        `/admin/counterfeit-reports/${input.id}/resolve`,
        {
          verdict: input.verdict,
          resolution: input.resolution,
          response_to_reporter: input.response_to_reporter,
          reward_points: input.reward_points ?? 0,
          suspend_vendor: input.suspend_vendor ?? false,
        },
        { authRequired: true }
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["moderation", "reports"] }),
  })
}
