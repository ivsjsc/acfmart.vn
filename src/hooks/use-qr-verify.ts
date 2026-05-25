import { useMutation } from "@tanstack/react-query"
import { apiClient } from "../lib/acfmart-api"
import { verifyPublicQrToken } from "../lib/ivs-trust-api"

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
    mutationFn: async (input: {
      code: string
      latitude?: number
      longitude?: number
      city?: string
<<<<<<< HEAD
    }) => {
      const data = await verifyPublicQrToken(input.code)
      const isSuspect = data.result === "SUSPECT"
      const isInvalid = ["INVALID", "VOIDED", "EXPIRED"].includes(data.result)
      const result: QrVerifyResult["result"] =
        data.result === "GENUINE"
          ? "genuine"
          : data.result === "SUSPECT"
          ? "suspect_counterfeit"
          : data.result === "EXPIRED"
          ? "expired"
          : data.result === "VOIDED"
          ? "voided"
          : "invalid"

      return {
        result,
        message: data.warningMessage || data.supportAction || "Kết quả xác minh từ IVS Trust Platform.",
        verification: {
          id: input.code,
          code: input.code,
          product_id: data.productSummary?.publicRef || null,
          vendor_id: data.sellerSummary?.publicRef || null,
          status: isInvalid ? "invalid" : isSuspect ? "suspect" : "active",
          batch_id: data.productSummary?.batchCode || null,
          serial_number: data.productSummary?.skuCode || null,
          manufactured_at: null,
          scan_count: 0,
          first_scanned_at: null,
        },
        risk_flags: isSuspect || isInvalid ? [data.result] : [],
      } satisfies QrVerifyResult
    },
=======
    }) =>
      apiClient.get<QrVerifyResult>(`/v1/verify/${encodeURIComponent(input.code)}`, {
        authRequired: false,
      }),
>>>>>>> 1b46698e6dcab53c596f9746121b97be2d4d3612
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
