import { useQuery } from "@tanstack/react-query"
import {
  getAdminVerificationLogDetail,
  listAdminVerificationLogs,
  type IvsAdminVerificationLogsParams,
} from "../lib/ivs-trust-api"

export function useAdminVerificationLogs(params: IvsAdminVerificationLogsParams = {}) {
  return useQuery({
    queryKey: ["ivs", "admin", "verification-logs", params],
    queryFn: () => listAdminVerificationLogs(params),
    staleTime: 15_000,
  })
}

export function useAdminVerificationLogDetail(id: string | null) {
  return useQuery({
    queryKey: ["ivs", "admin", "verification-logs", id],
    queryFn: () => getAdminVerificationLogDetail(id!),
    enabled: !!id,
    staleTime: 30_000,
  })
}
