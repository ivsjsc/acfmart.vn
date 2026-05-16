import {
  collection,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  updateDoc,
  serverTimestamp,
  type Timestamp,
} from "firebase/firestore"
import { firestore } from "./firebase"
import { writeAuditLog } from "./audit-log"

export type CounterfeitReportStatus =
  | "pending"
  | "reviewing"
  | "resolved"
  | "rejected"

export interface CounterfeitReportDoc {
  id: string
  reporterId: string
  productId: string
  description: string
  status: CounterfeitReportStatus
  qrCode?: string
  shopHint?: string
  created_at?: Timestamp
  updated_at?: Timestamp
  resolved_at?: Timestamp | null
  resolved_by_id?: string | null
  resolved_by_email?: string | null
  resolution_note?: string | null
}

const col = collection(firestore, "counterfeitReports")

export async function listCounterfeitReports(params: {
  status?: CounterfeitReportStatus
  limitCount?: number
}): Promise<CounterfeitReportDoc[]> {
  const constraints = []
  if (params.status) constraints.push(where("status", "==", params.status))
  constraints.push(orderBy("created_at", "desc"))
  constraints.push(limit(params.limitCount ?? 100))

  const snap = await getDocs(query(col, ...constraints))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as CounterfeitReportDoc))
}

export async function updateCounterfeitReportStatus(
  reportId: string,
  input: {
    status: CounterfeitReportStatus
    resolution_note?: string
    actor: { id: string; email: string; role: string }
  },
): Promise<void> {
  const ref = doc(firestore, "counterfeitReports", reportId)
  const now = serverTimestamp()
  const patch: Record<string, unknown> = {
    status: input.status,
    updated_at: now,
    resolution_note: input.resolution_note ?? null,
  }

  if (input.status === "resolved" || input.status === "rejected") {
    patch.resolved_at = now
    patch.resolved_by_id = input.actor.id
    patch.resolved_by_email = input.actor.email
  } else {
    patch.resolved_at = null
    patch.resolved_by_id = null
    patch.resolved_by_email = null
  }

  await updateDoc(ref, patch)

  await writeAuditLog({
    action: "report_resolve",
    actor_id: input.actor.id,
    actor_email: input.actor.email,
    actor_role: input.actor.role,
    target_type: "counterfeit_report",
    target_id: reportId,
    details: {
      status: input.status,
      note: input.resolution_note ?? "",
    },
  })
}
