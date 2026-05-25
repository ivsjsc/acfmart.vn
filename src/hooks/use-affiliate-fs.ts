import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  createAffiliateLink,
  ensureAffiliateProfile,
  getAffiliateAccount,
  listAffiliateLinks,
  listAffiliateTransactions,
  updateAffiliateLinkDisplay,
  type CreateAffiliateLinkInput,
} from "../lib/affiliate-service"
import { unwrapServiceResult } from "../lib/service-result"
import { useAuthStore } from "../stores/auth-store"
import { useFirebaseAuthReady } from "./use-firebase-auth-ready"

export type {
  AffiliateAccount,
  AffiliateLink,
  AffiliateTransaction,
} from "../lib/affiliate-service"

export function useAffiliateAccountFs() {
  const uid = useAuthStore((s) => s.user?.id)
  const authReady = useFirebaseAuthReady()

  return useQuery({
    queryKey: ["affiliate", "fs", "account", uid],
    enabled: authReady && !!uid,
    queryFn: async () => unwrapServiceResult(await getAffiliateAccount(uid!)),
    staleTime: 60_000,
  })
}

export function useAffiliateLinksFs(limitCount = 100) {
  const uid = useAuthStore((s) => s.user?.id)
  const authReady = useFirebaseAuthReady()

  return useQuery({
    queryKey: ["affiliate", "fs", "links", uid, limitCount],
    enabled: authReady && !!uid,
    queryFn: async () => unwrapServiceResult(await listAffiliateLinks(uid!, limitCount)),
    staleTime: 60_000,
  })
}

export function useAffiliateTransactionsFs(limitCount = 100) {
  const uid = useAuthStore((s) => s.user?.id)
  const authReady = useFirebaseAuthReady()

  return useQuery({
    queryKey: ["affiliate", "fs", "transactions", uid, limitCount],
    enabled: authReady && !!uid,
    queryFn: async () =>
      unwrapServiceResult(await listAffiliateTransactions(uid!, limitCount)),
    staleTime: 60_000,
  })
}

export function useCreateAffiliateLinkFs() {
  const qc = useQueryClient()
  const uid = useAuthStore((s) => s.user?.id)

  return useMutation({
    mutationFn: async (input: CreateAffiliateLinkInput) =>
      unwrapServiceResult(await createAffiliateLink(input, uid)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["affiliate", "fs", "account"] })
      qc.invalidateQueries({ queryKey: ["affiliate", "fs", "links"] })
    },
  })
}

export function useUpdateAffiliateLinkDisplayFs() {
  const qc = useQueryClient()
  const uid = useAuthStore((s) => s.user?.id)

  return useMutation({
    mutationFn: async (input: { linkId: string; showcase_order?: number; showcase_visible?: boolean; title?: string }) =>
      unwrapServiceResult(
        await updateAffiliateLinkDisplay(
          input.linkId,
          {
            showcase_order: input.showcase_order,
            showcase_visible: input.showcase_visible,
            title: input.title,
          },
          uid
        )
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["affiliate", "fs", "account"] })
      qc.invalidateQueries({ queryKey: ["affiliate", "fs", "links"] })
    },
  })
}

export function useEnsureAffiliateProfileFs() {
  const qc = useQueryClient()
  const uid = useAuthStore((s) => s.user?.id)

  return useMutation({
    mutationFn: async () => unwrapServiceResult(await ensureAffiliateProfile(uid)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["affiliate", "fs", "account"] })
    },
  })
}

export const useAffiliateAccount = useAffiliateAccountFs
export const useAffiliateLinks = useAffiliateLinksFs
export const useAffiliateTransactions = useAffiliateTransactionsFs
export const useCreateAffiliateLink = useCreateAffiliateLinkFs
export const useUpdateAffiliateLinkDisplay = useUpdateAffiliateLinkDisplayFs
