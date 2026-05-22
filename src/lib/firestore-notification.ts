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

interface OrderCancellationData {
  code?: string
  customerId?: string
  shopId?: string
  shopName?: string
  status?: string
  timeline?: Array<{
    status?: string
    timestamp?: string
    note?: string
    actorId?: string
    actorRole?: string
  }>
  created_at?: unknown
  updated_at?: unknown
}

const DERIVED_CANCELLED_ORDER_PREFIX = "derived:order-cancelled:"
const DERIVED_READ_PREFIX = "acfmart:derived-notification-read:"
const DERIVED_READ_EVENT = "acfmart:derived-notification-read"
const derivedNotificationIdsByUser = new Map<string, Set<string>>()

function tsToDate(ts: any): Date {
  if (ts instanceof Timestamp) return ts.toDate()
  if (ts?.toDate) return ts.toDate()
  return new Date(ts ?? Date.now())
}

function getDerivedReadKey(notificationId: string): string {
  return `${DERIVED_READ_PREFIX}${notificationId}`
}

function isDerivedNotificationId(notificationId: string): boolean {
  return notificationId.startsWith(DERIVED_CANCELLED_ORDER_PREFIX)
}

function isDerivedNotificationRead(notificationId: string): boolean {
  if (typeof window === "undefined") return false
  return window.localStorage.getItem(getDerivedReadKey(notificationId)) === "1"
}

function setDerivedNotificationRead(notificationId: string): boolean {
  if (typeof window === "undefined") return false
  const key = getDerivedReadKey(notificationId)
  if (window.localStorage.getItem(key) === "1") return false
  window.localStorage.setItem(key, "1")
  window.dispatchEvent(new CustomEvent(DERIVED_READ_EVENT))
  return true
}

function latestCancelledTimeline(order: OrderCancellationData) {
  if (!Array.isArray(order.timeline)) return undefined
  return [...order.timeline].reverse().find((item) => item?.status === "cancelled")
}

function isCustomerCancellation(order: OrderCancellationData): boolean {
  const event = latestCancelledTimeline(order)
  const actorRole = String(event?.actorRole ?? "").toLowerCase()
  const actorId = String(event?.actorId ?? "").trim()
  const customerId = String(order.customerId ?? "").trim()
  return actorRole === "customer" || (!!actorId && !!customerId && actorId === customerId)
}

function mapNotificationDoc(id: string, data: Record<string, any>): NotificationDoc {
  return {
    id,
    userId: data.user_id,
    type: data.type,
    title: data.title,
    body: data.body,
    link: data.link,
    read: data.read ?? false,
    createdAt: tsToDate(data.created_at),
    metadata: data.metadata,
  }
}

function mapCancelledOrderNotification(
  id: string,
  data: OrderCancellationData,
  userId: string
): NotificationDoc | null {
  if (data.status !== "cancelled") return null
  if (String(data.customerId ?? "") !== userId) return null
  if (isCustomerCancellation(data)) return null

  const event = latestCancelledTimeline(data)
  const orderCode = String(data.code ?? id).trim() || id
  const shopName = String(data.shopName ?? "người bán").trim() || "người bán"
  const note = String(event?.note ?? "").trim()
  const notificationId = `${DERIVED_CANCELLED_ORDER_PREFIX}${id}`

  return {
    id: notificationId,
    userId,
    type: "order_update",
    title: "Đơn hàng đã bị người bán hủy",
    body: note
      ? `Đơn ${orderCode} tại ${shopName} đã bị người bán hủy. Lý do: ${note}.`
      : `Đơn ${orderCode} tại ${shopName} đã bị người bán hủy. Vui lòng xem chi tiết đơn hàng.`,
    link: `/account/orders/${orderCode}`,
    read: isDerivedNotificationRead(notificationId),
    createdAt: event?.timestamp ? new Date(event.timestamp) : tsToDate(data.updated_at ?? data.created_at),
    metadata: {
      orderId: id,
      orderCode,
      shopId: data.shopId,
      shopName,
      status: "cancelled",
      reason: note || null,
      source: "orders_fallback",
    },
  }
}

function mergeNotifications(
  persisted: NotificationDoc[],
  derived: NotificationDoc[]
): NotificationDoc[] {
  const persistedOrderIds = new Set(
    persisted
      .map((n) => String(n.metadata?.orderId ?? n.metadata?.order_id ?? "").trim())
      .filter(Boolean)
  )
  return [...persisted, ...derived.filter((n) => !persistedOrderIds.has(String(n.metadata?.orderId ?? "")))]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 50)
}

// Firestore stores notifications with snake_case fields (matches firestore.rules
// and Cloud Functions writers). We map to camelCase here so React components
// stay in camelCase.
export const notificationService = {
  subscribe(userId: string, onChange: (n: NotificationDoc[]) => void): Unsubscribe {
    const q = query(
      collection(firestore, "notifications"),
      where("user_id", "==", userId),
      orderBy("created_at", "desc"),
      limit(50)
    )
    const ordersQ = query(collection(firestore, "orders"), where("customerId", "==", userId))
    let persisted: NotificationDoc[] = []
    let derived: NotificationDoc[] = []
    let disposed = false

    const emit = () => {
      if (disposed) return
      derivedNotificationIdsByUser.set(userId, new Set(derived.map((n) => n.id)))
      onChange(mergeNotifications(persisted, derived))
    }

    const refreshDerivedReadState = () => {
      derived = derived.map((n) => ({
        ...n,
        read: isDerivedNotificationRead(n.id),
      }))
      emit()
    }

    if (typeof window !== "undefined") {
      window.addEventListener(DERIVED_READ_EVENT, refreshDerivedReadState)
      window.addEventListener("storage", refreshDerivedReadState)
    }

    const unsubscribeNotifications = onSnapshot(q, (snap) => {
      persisted = snap.docs.map((d) => mapNotificationDoc(d.id, d.data()))
      emit()
    })

    const unsubscribeOrders = onSnapshot(ordersQ, (snap) => {
      derived = snap.docs
        .map((d) => mapCancelledOrderNotification(d.id, d.data(), userId))
        .filter((n): n is NotificationDoc => Boolean(n))
      emit()
    })

    return () => {
      disposed = true
      unsubscribeNotifications()
      unsubscribeOrders()
      derivedNotificationIdsByUser.delete(userId)
      if (typeof window !== "undefined") {
        window.removeEventListener(DERIVED_READ_EVENT, refreshDerivedReadState)
        window.removeEventListener("storage", refreshDerivedReadState)
      }
    }
  },

  async markRead(notificationId: string): Promise<void> {
    if (isDerivedNotificationId(notificationId)) {
      setDerivedNotificationRead(notificationId)
      return
    }
    await updateDoc(doc(firestore, "notifications", notificationId), { read: true })
  },

  async markAllRead(userId: string): Promise<number> {
    const localIds = derivedNotificationIdsByUser.get(userId) ?? new Set<string>()
    let localUpdated = 0
    localIds.forEach((id) => {
      if (setDerivedNotificationRead(id)) localUpdated += 1
    })

    const q = query(
      collection(firestore, "notifications"),
      where("user_id", "==", userId),
      where("read", "==", false),
      limit(100)
    )
    const snap = await getDocs(q)
    if (snap.empty) return localUpdated
    const batch = writeBatch(firestore)
    snap.docs.forEach((d) => batch.update(d.ref, { read: true }))
    await batch.commit()
    return snap.size + localUpdated
  },
}
