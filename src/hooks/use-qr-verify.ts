import { useMutation } from "@tanstack/react-query"
import { apiClient } from "../lib/acfmart-api"

export interface QrVerifyResult {
  result: "genuine" | "suspect_counterfeit" | "expired" | "voided" | "invalid"
  message: string
  verification?: {
    id: string
    code: string
    product_id: string | null
    vendor_id: string | null
    status: string
    batch_id: string | null
    serial_number: string | null
    manufactured_at: string | null
    scan_count: number
    first_scanned_at: string | null
  }
  risk_flags?: string[]
}

export function useVerifyQr() {
  return useMutation({
    mutationFn: (input: {
      code: string
      latitude?: number
      longitude?: number
      city?: string
    }) =>
      apiClient.get<QrVerifyResult>(`/v1/verify/${encodeURIComponent(input.code)}`, {
        authRequired: false,
      }),
  })
}

export function useSubmitCounterfeitReport() {
  return useMutation({
    mutationFn: (input: {
      reporter_name: string
      reporter_email?: string
      reporter_phone?: string
      order_id?: string
      product_id?: string
      vendor_id?: string
      verification_code_id?: string
      title: string
      description: string
      purchase_location?: string
      evidence_urls: string[]
    }) =>
      apiClient.post("/store/counterfeit-reports", input, { authRequired: true }),
  })
}
