import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  activateSellerQrBatch,
  createSellerQrBatch,
  getSellerPrinterProfile,
  getSellerQrDashboard,
  listSellerQrBatches,
  listSellerSuspiciousAlerts,
  listSellerVerificationLogs,
  patchSellerPrinterProfile,
  getSellerQrBatchCodes,
  listSellerQrPrintLayouts,
  createSellerQrPrintLayout,
  listSellerQrPrintJobs,
  createSellerQrPrintJob,
  getSellerQrPrintJob,
  downloadSellerQrPrintJob,
  type IvsPrintLayout,
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

export function useIvsSellerQrBatchCodes(batchId: string | null) {
  return useQuery({
    queryKey: ["ivs", "seller", "qr", "batch-codes", batchId],
    queryFn: () => (batchId ? getSellerQrBatchCodes(batchId) : Promise.resolve([])),
    enabled: !!batchId,
  })
}

export function useIvsSellerQrPrintLayouts() {
  return useQuery({
    queryKey: ["ivs", "seller", "qr", "print-layouts"],
    queryFn: listSellerQrPrintLayouts,
  })
}

export function useCreateIvsSellerQrPrintLayout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: Partial<IvsPrintLayout>) => createSellerQrPrintLayout(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ivs", "seller", "qr", "print-layouts"] })
    },
  })
}

export function useIvsSellerQrPrintJobs() {
  return useQuery({
    queryKey: ["ivs", "seller", "qr", "print-jobs"],
    queryFn: listSellerQrPrintJobs,
  })
}

export function useCreateIvsSellerQrPrintJob() {
  return useMutation({
    mutationFn: ({ batchId, layoutId }: { batchId: string; layoutId: string }) =>
      createSellerQrPrintJob(batchId, { layoutId }),
  })
}

export function useIvsSellerQrPrintJob(jobId: string | null) {
  return useQuery({
    queryKey: ["ivs", "seller", "qr", "print-job", jobId],
    queryFn: () => (jobId ? getSellerQrPrintJob(jobId) : Promise.resolve(null)),
    enabled: !!jobId,
  })
}

export function useDownloadIvsSellerQrPrintJob() {
  return useMutation({
    mutationFn: (jobId: string) => downloadSellerQrPrintJob(jobId),
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

export function useActivateIvsSellerQrBatch() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (batchId: string) => activateSellerQrBatch(batchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ivs", "seller", "qr"] })
    },
  })
}
