import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  onSnapshot,
  Timestamp,
  type QueryConstraint,
  type Unsubscribe,
} from "firebase/firestore"
import { firestore } from "./firebase"

export type AuditAction =
  | "vendor_register"
  | "vendor_approve"
  | "vendor_reject"
  | "vendor_suspend"
  | "product_create"
  | "product_update"
  | "product_delete"
  | "product_submit"
  | "product_approve"
  | "product_reject"
  | "order_status_change"
  | "document_upload"
  | "login"
  | "logout"
  | "role_change"
  | "report_submit"
  | "report_resolve"
  | "review_submit"
  | "review_approve"
  | "review_reject"
  | "settings_change"

export interface AuditLogEntry {
  action: AuditAction
  actor_id: string
  actor_email: string
  actor_role: string
  target_type: string
  target_id: string
  details: Record<string, unknown>
  ip_address?: string
  user_agent?: string
  created_at: ReturnType<typeof serverTimestamp>
}

const auditCollection = collection(firestore, "auditLogs")

export async function writeAuditLog(entry: Omit<AuditLogEntry, "created_at">) {
  return addDoc(auditCollection, {
    ...entry,
    created_at: serverTimestamp(),
  })
}

export async function getAuditLogs(params: {
  actor_id?: string
  target_id?: string
  action?: AuditAction
  limit?: number
}) {
  const constraints: QueryConstraint[] = []
  if (params.actor_id) constraints.push(where("actor_id", "==", params.actor_id))
  if (params.target_id) constraints.push(where("target_id", "==", params.target_id))
  if (params.action) constraints.push(where("action", "==", params.action))
  constraints.push(orderBy("created_at", "desc"))
  constraints.push(limit(params.limit ?? 50))

  const q = query(auditCollection, ...constraints)
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

/**
 * Realtime audit log stream for the admin "Nhật ký hệ thống" screen.
 * Returns unsubscribe function. Errors are surfaced so the UI can show
 * actionable diagnostics (typically a Firestore rules permission issue).
 */
export function subscribeAuditLogs(
  params: {
    actor_id?: string
    target_id?: string
    action?: AuditAction
    limit?: number
  },
  onData: (logs: Array<{ id: string } & Record<string, unknown>>) => void,
  onError: (err: Error) => void
): Unsubscribe {
  const constraints: QueryConstraint[] = []
  if (params.actor_id) constraints.push(where("actor_id", "==", params.actor_id))
  if (params.target_id) constraints.push(where("target_id", "==", params.target_id))
  if (params.action) constraints.push(where("action", "==", params.action))
  constraints.push(orderBy("created_at", "desc"))
  constraints.push(limit(params.limit ?? 50))

  const q = query(auditCollection, ...constraints)
  return onSnapshot(
    q,
    (snap) => {
      onData(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    },
    (err) => {
      console.error("[subscribeAuditLogs] Firestore error:", err)
      onError(err)
    }
  )
}
