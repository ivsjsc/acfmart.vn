import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
  type Unsubscribe,
} from "firebase/firestore"
import { firestore } from "./firebase"

export interface VerificationCabinetItem {
  id: string
  userId: string
  isValid: boolean
  qrCode: string
  productId: string
  productName: string
  brand: string
  manufacturingDate: string
  batchNumber: string
  isCounterfeit: boolean
  authenticityScore: number
  verificationDate: string
  additionalInfo?: string
  notes?: string
  addedAt: string
  source?: "backend" | "offline"
}

export type VerificationCabinetInput = Omit<VerificationCabinetItem, "id" | "userId">

const cabinetCol = collection(firestore, "verificationCabinet")

function cabinetDocId(userId: string, qrCode: string): string {
  const normalized = qrCode.trim().replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 120)
  return `${userId}_${normalized || Date.now()}`
}

function normalizeItem(id: string, data: Record<string, any>): VerificationCabinetItem {
  return {
    id,
    userId: String(data.userId ?? ""),
    isValid: data.isValid !== false,
    qrCode: String(data.qrCode ?? data.productId ?? ""),
    productId: String(data.productId ?? ""),
    productName: String(data.productName ?? "Sản phẩm đã xác thực"),
    brand: String(data.brand ?? "Thương hiệu"),
    manufacturingDate: String(data.manufacturingDate ?? new Date().toISOString()),
    batchNumber: String(data.batchNumber ?? ""),
    isCounterfeit: data.isCounterfeit === true,
    authenticityScore: Number(data.authenticityScore ?? 0),
    verificationDate: String(data.verificationDate ?? new Date().toISOString()),
    additionalInfo: typeof data.additionalInfo === "string" ? data.additionalInfo : undefined,
    notes: typeof data.notes === "string" ? data.notes : undefined,
    addedAt: String(data.addedAt ?? new Date().toISOString()),
    source: data.source === "backend" ? "backend" : data.source === "offline" ? "offline" : undefined,
  }
}

export function subscribeVerificationCabinet(
  userId: string,
  onData: (items: VerificationCabinetItem[]) => void,
  onError: (error: Error) => void
): Unsubscribe {
  return onSnapshot(
    query(cabinetCol, where("userId", "==", userId)),
    (snap) => {
      onData(
        snap.docs
          .map((d) => normalizeItem(d.id, d.data()))
          .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime())
      )
    },
    onError
  )
}

export async function saveVerificationCabinetItem(
  userId: string,
  input: VerificationCabinetInput
): Promise<void> {
  if (!userId) throw new Error("Bạn cần đăng nhập để lưu tủ xác thực")
  const qrCode = input.qrCode || input.productId
  await setDoc(
    doc(cabinetCol, cabinetDocId(userId, qrCode)),
    {
      ...input,
      qrCode,
      userId,
      addedAt: input.addedAt || new Date().toISOString(),
      updated_at: serverTimestamp(),
      created_at: serverTimestamp(),
    },
    { merge: true }
  )
}

export async function removeVerificationCabinetItem(
  itemId: string
): Promise<void> {
  await deleteDoc(doc(cabinetCol, itemId))
}
