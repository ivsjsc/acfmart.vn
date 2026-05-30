import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  activateSellerQrBatch,
  createSellerQrBatch,
  getSellerPrinterProfile,
  getSellerQrBatchPrintFile,
  getSellerQrDashboard,
  listSellerQrBatches,
  listSellerSuspiciousAlerts,
  listSellerVerificationLogs,
  patchSellerPrinterProfile,
} from "../lib/ivs-trust-api"

export function useIvsSellerQrDashboard() {
  return useQuery({
    queryKey: ["ivs", "seller", "qr", "dashboard"],
    queryFn: getSellerQrDashboard,
    staleTime: 30_000,
  })
}

export function useIvsSellerQrBatches(params: { page?: number; limit?: number } = {}) {
  return useQuery({
    queryKey: ["ivs", "seller", "qr", "batches", params],
    queryFn: () => listSellerQrBatches(params),
  })
}

export function useCreateIvsSellerQrBatch() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createSellerQrBatch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ivs", "seller", "qr"] })
    },
  })
}

export function useIvsSellerVerificationLogs(params: { page?: number; limit?: number } = {}) {
  return useQuery({
    queryKey: ["ivs", "seller", "qr", "verification-logs", params],
    queryFn: () => listSellerVerificationLogs(params),
  })
}

export function useIvsSellerSuspiciousAlerts(params: { page?: number; limit?: number } = {}) {
  return useQuery({
    queryKey: ["ivs", "seller", "qr", "suspicious-alerts", params],
    queryFn: () => listSellerSuspiciousAlerts(params),
  })
}

export function useIvsSellerPrinterProfile() {
  return useQuery({
    queryKey: ["ivs", "seller", "qr", "printer-profile"],
    queryFn: getSellerPrinterProfile,
  })
}

export function usePatchIvsSellerPrinterProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: patchSellerPrinterProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ivs", "seller", "qr", "printer-profile"] })
    },
  })
}

export function useDownloadIvsSellerQrPrintFile() {
  return useMutation({
    mutationFn: (batchId: string) => getSellerQrBatchPrintFile(batchId),
  })
}

export function useActivateIvsSellerQrBatch() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (batchId: string) => activateSellerQrBatch(batchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ivs", "seller", "qr"] })
    },
  })
}
