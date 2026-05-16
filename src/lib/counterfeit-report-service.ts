import {
  collection,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  type Unsubscribe,
} from "firebase/firestore"
import { firestore } from "./firebase"

export type CounterfeitReportStatus =
  | "pending"
  | "investigating"
  | "verified_counterfeit"
  | "false_alarm"
  | "resolved"
  | "rejected"

export interface CounterfeitReport {
  id: string
  status: CounterfeitReportStatus | string
  title: string
  description: string
  reporterId?: string
  reporterName?: string
  reporterEmail?: string
  reporterPhone?: string
  productId?: string
  productName?: string
  vendorId?: string
  orderId?: string
  qrCode?: string
  verificationCodeId?: string
  purchaseLocation?: string
  evidenceUrls: string[]
  moderatorNote?: string
  resolutionNote?: string
  createdAt?: unknown
  updatedAt?: unknown
  resolvedAt?: unknown
  raw: Record<string, unknown>
}

const reportsCollection = collection(firestore, "counterfeitReports")

function firstString(data: Record<string, unknown>, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = data[key]
    if (typeof value === "string" && value.trim()) return value
  }
  return undefined
}

function firstStringArray(data: Record<string, unknown>, keys: string[]): string[] {
  for (const key of keys) {
    const value = data[key]
    if (Array.isArray(value)) return value.filter((item): item is string => typeof item === "string")
  }
  return []
}

function mapReport(id: string, data: Record<string, unknown>): CounterfeitReport {
  return {
    id,
    status: firstString(data, ["status"]) ?? "pending",
    title: firstString(data, ["title"]) ?? "Báo cáo nghi vấn hàng giả",
    description: firstString(data, ["description", "reportDetails", "details"]) ?? "",
    reporterId: firstString(data, ["reporterId", "reporter_id"]),
    reporterName: firstString(data, ["reporterName", "reporter_name", "customerName"]),
    reporterEmail: firstString(data, ["reporterEmail", "reporter_email", "email"]),
    reporterPhone: firstString(data, ["reporterPhone", "reporter_phone", "phone"]),
    productId: firstString(data, ["productId", "product_id"]),
    productName: firstString(data, ["productName", "product_name"]),
    vendorId: firstString(data, ["vendorId", "vendor_id"]),
    orderId: firstString(data, ["orderId", "order_id"]),
    qrCode: firstString(data, ["qrCode", "qr_code", "code"]),
    verificationCodeId: firstString(data, ["verificationCodeId", "verification_code_id"]),
    purchaseLocation: firstString(data, ["purchaseLocation", "purchase_location"]),
    evidenceUrls: firstStringArray(data, ["evidenceUrls", "evidence_urls", "images"]),
    moderatorNote: firstString(data, ["moderatorNote", "moderator_note"]),
    resolutionNote: firstString(data, ["resolutionNote", "resolution_note"]),
    createdAt: data.createdAt ?? data.created_at ?? data.created_at_ms,
    updatedAt: data.updatedAt ?? data.updated_at,
    resolvedAt: data.resolvedAt ?? data.resolved_at,
    raw: data,
  }
}

export function subscribeCounterfeitReports(
  onData: (reports: CounterfeitReport[]) => void,
  onError: (err: Error) => void
): Unsubscribe {
  return onSnapshot(
    reportsCollection,
    (snap) => {
      onData(snap.docs.map((item) => mapReport(item.id, item.data())))
    },
    (err) => {
      console.error("[subscribeCounterfeitReports] Firestore error:", err)
      onError(err)
    }
  )
}

export async function updateCounterfeitReportStatus(
  id: string,
  input: {
    status: CounterfeitReportStatus
    moderatorNote?: string
  }
) {
  const terminalStatuses: CounterfeitReportStatus[] = [
    "verified_counterfeit",
    "false_alarm",
    "resolved",
    "rejected",
  ]

  await updateDoc(doc(firestore, "counterfeitReports", id), {
    status: input.status,
    moderatorNote: input.moderatorNote ?? "",
    resolutionNote: input.moderatorNote ?? "",
    updatedAt: serverTimestamp(),
    ...(terminalStatuses.includes(input.status) ? { resolvedAt: serverTimestamp() } : {}),
  })
}
