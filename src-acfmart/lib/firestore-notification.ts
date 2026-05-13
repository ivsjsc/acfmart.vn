import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  writeBatch,
  Timestamp,
  limit,
  getDocs,
  type Unsubscribe,
} from "firebase/firestore"
import { firestore } from "./firebase"

export type NotificationType =
  | "order_update"
  | "shop_update"
  | "voucher"
  | "system"
  | "report_update"
  | "affiliate"
  | "loyalty"

export interface NotificationDoc {
  id: string
  userId: string
  type: NotificationType
  title: string
  body: string
  link?: string
  read: boolean
  createdAt: Date
  metadata?: Record<string, any>
}

function tsToDate(ts: any): Date {
  if (ts instanceof Timestamp) return ts.toDate()
  if (ts?.toDate) return ts.toDate()
  return new Date(ts ?? Date.now())
}

export const notificationService = {
  subscribe(userId: string, onChange: (n: NotificationDoc[]) => void): Unsubscribe {
    const q = query(
      collection(firestore, "notifications"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(50)
    )
    return onSnapshot(q, (snap) => {
      onChange(
        snap.docs.map((d) => {
          const data = d.data()
          return {
            id: d.id,
            userId: data.userId,
            type: data.type,
            title: data.title,
            body: data.body,
            link: data.link,
            read: data.read ?? false,
            createdAt: tsToDate(data.createdAt),
            metadata: data.metadata,
          }
        })
      )
    })
  },

  async markRead(notificationId: string): Promise<void> {
    await updateDoc(doc(firestore, "notifications", notificationId), { read: true })
  },

  async markAllRead(userId: string): Promise<number> {
    const q = query(
      collection(firestore, "notifications"),
      where("userId", "==", userId),
      where("read", "==", false),
      limit(100)
    )
    const snap = await getDocs(q)
    if (snap.empty) return 0
    const batch = writeBatch(firestore)
    snap.docs.forEach((d) => batch.update(d.ref, { read: true }))
    await batch.commit()
    return snap.size
  },
}
