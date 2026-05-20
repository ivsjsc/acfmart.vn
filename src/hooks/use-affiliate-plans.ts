import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  createAffiliatePlan,
  updateAffiliatePlan,
  deleteAffiliatePlan,
  listShopPlans,
  listMarketplacePlans,
  getAffiliatePlan,
  applyToPlan,
  listPlanApplications,
  listMyApplications,
  reviewApplication,
  type CreatePlanInput,
  type ApplyToPlanInput,
  type AffiliatePlan,
} from "../lib/affiliate-plan-service"
import { unwrapServiceResult } from "../lib/service-result"
import { useAuthStore } from "../stores/auth-store"
import { useFirebaseAuthReady } from "./use-firebase-auth-ready"

export type { AffiliatePlan, AffiliateApplication } from "../lib/affiliate-plan-service"

// ─── Seller hooks ────────────────────────────────────────────────────

/** List affiliate plans for seller's shop */
export function useShopAffiliatePlans(shopId: string | null) {
  const authReady = useFirebaseAuthReady()
  return useQuery({
    queryKey: ["affiliate-plans", "shop", shopId],
    enabled: authReady && !!shopId,
    queryFn: async () => unwrapServiceResult(await listShopPlans(shopId!)),
    staleTime: 30_000,
  })
}

/** Create a new affiliate plan */
export function useCreateAffiliatePlan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreatePlanInput) =>
      unwrapServiceResult(await createAffiliatePlan(input)),
    onSuccess: (_data, input) => {
      qc.invalidateQueries({ queryKey: ["affiliate-plans", "shop", input.shopId] })
      qc.invalidateQueries({ queryKey: ["affiliate-plans", "marketplace"] })
    },
  })
}

/** Update an existing plan */
export function useUpdateAffiliatePlan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ planId, ...updates }: { planId: string } & Partial<Pick<AffiliatePlan, "status" | "commissionBps" | "title" | "description" | "productIds" | "productSnapshots">>) =>
      unwrapServiceResult(await updateAffiliatePlan(planId, updates)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["affiliate-plans"] })
    },
  })
}

/** Delete a plan */
export function useDeleteAffiliatePlan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (planId: string) =>
      unwrapServiceResult(await deleteAffiliatePlan(planId)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["affiliate-plans"] })
    },
  })
}

/** List applications for a specific plan (seller) */
export function usePlanApplications(planId: string | null) {
  const authReady = useFirebaseAuthReady()
  return useQuery({
    queryKey: ["affiliate-plans", "applications", planId],
    enabled: authReady && !!planId,
    queryFn: async () => unwrapServiceResult(await listPlanApplications(planId!)),
    staleTime: 30_000,
  })
}

/** Review (approve/reject) an application */
export function useReviewApplication() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ applicationId, decision }: { applicationId: string; decision: "approved" | "rejected" }) =>
      unwrapServiceResult(await reviewApplication(applicationId, decision)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["affiliate-plans", "applications"] })
      qc.invalidateQueries({ queryKey: ["affiliate-plans", "shop"] })
    },
  })
}

// ─── Creator hooks ───────────────────────────────────────────────────

/** Browse affiliate marketplace (open plans) */
export function useAffiliateMarketplace(limitCount = 50) {
  const authReady = useFirebaseAuthReady()
  return useQuery({
    queryKey: ["affiliate-plans", "marketplace", limitCount],
    enabled: authReady,
    queryFn: async () => unwrapServiceResult(await listMarketplacePlans(limitCount)),
    staleTime: 60_000,
  })
}

/** Get a single plan by ID */
export function useAffiliatePlan(planId: string | null) {
  const authReady = useFirebaseAuthReady()
  return useQuery({
    queryKey: ["affiliate-plans", "detail", planId],
    enabled: authReady && !!planId,
    queryFn: async () => unwrapServiceResult(await getAffiliatePlan(planId!)),
    staleTime: 30_000,
  })
}

/** Apply to a plan (creator) */
export function useApplyToPlan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: ApplyToPlanInput) =>
      unwrapServiceResult(await applyToPlan(input)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["affiliate-plans", "my-applications"] })
      qc.invalidateQueries({ queryKey: ["affiliate-plans", "marketplace"] })
    },
  })
}

/** List my applications as a creator */
export function useMyAffiliateApplications() {
  const uid = useAuthStore((s) => s.user?.id)
  const authReady = useFirebaseAuthReady()
  return useQuery({
    queryKey: ["affiliate-plans", "my-applications", uid],
    enabled: authReady && !!uid,
    queryFn: async () => unwrapServiceResult(await listMyApplications()),
    staleTime: 30_000,
  })
}
