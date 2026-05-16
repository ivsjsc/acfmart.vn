import {
  arrayUnion,
  collection,
  doc,
  getDocs,
  limit,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  type QueryConstraint,
  type Unsubscribe,
} from "firebase/firestore"
import { firestore } from "./firebase"
import { writeAuditLog } from "./audit-log"
import type { CartItem } from "../stores/cart-store"
import type { SellerOrder, SellerOrderStatus } from "../features/seller/types"
import type { Order } from "../types"

export type OrderPaymentStatus = "pending" | "paid" | "cod" | "failed" | "refunded"

export interface OrderTimelineItem {
  status: SellerOrderStatus
  timestamp: string
  note?: string
  actorId?: string
}

export interface OrderDoc {
  id: string
  code: string
  parentCode: string
  customerId: string
  customerEmail?: string
  customerName: string
  customerPhone: string
  shopId: string
  shopName: string
  status: SellerOrderStatus
  paymentStatus: OrderPaymentStatus
  paymentMethod: string
  shippingMethod: string
  shippingFee: number
  codFee: number
  subtotal: number
  total: number
  items: SellerOrder["items"]
  shippingAddress: SellerOrder["shippingAddress"]
  customerNote?: string
  trackingNumber?: string
  timeline: OrderTimelineItem[]
  created_at: Timestamp
  updated_at: Timestamp
}

export interface CreateMarketplaceOrdersInput {
  orderCode: string
  customerId: string
  customerEmail?: string
  customerName: string
  customerPhone: string
  items: CartItem[]
  shippingAddress: SellerOrder["shippingAddress"]
  paymentMethod: string
  paymentStatus: OrderPaymentStatus
  shippingMethod: string
  shippingFee: number
  codFee: number
  discountTotal?: number
  customerNote?: string
  trackingNumber?: string
}

const ordersCol = collection(firestore, "orders")

function timestampToMs(value: Timestamp | null | undefined): number {
  return value?.toMillis?.() ?? 0
}

function orderCreatedAtMs(order: OrderDoc): number {
  return timestampToMs(order.created_at)
}

function mapOrderDoc(id: string, data: Record<string, any>): OrderDoc {
  return {
    id,
    code: String(data.code ?? id),
    parentCode: String(data.parentCode ?? data.code ?? id),
    customerId: String(data.customerId ?? ""),
    customerEmail: typeof data.customerEmail === "string" ? data.customerEmail : undefined,
    customerName: String(data.customerName ?? data.shippingAddress?.name ?? "Khách hàng"),
    customerPhone: String(data.customerPhone ?? data.shippingAddress?.phone ?? ""),
    shopId: String(data.shopId ?? ""),
    shopName: String(data.shopName ?? "Shop"),
    status: (data.status ?? "awaiting_confirm") as SellerOrderStatus,
    paymentStatus: (data.paymentStatus ?? "pending") as OrderPaymentStatus,
    paymentMethod: String(data.paymentMethod ?? ""),
    shippingMethod: String(data.shippingMethod ?? ""),
    shippingFee: Number(data.shippingFee ?? 0),
    codFee: Number(data.codFee ?? 0),
    subtotal: Number(data.subtotal ?? 0),
    total: Number(data.total ?? 0),
    items: Array.isArray(data.items) ? data.items : [],
    shippingAddress: data.shippingAddress ?? {
      name: "",
      phone: "",
      address: "",
      ward: "",
      district: "",
      city: "",
    },
    customerNote: typeof data.customerNote === "string" ? data.customerNote : undefined,
    trackingNumber: typeof data.trackingNumber === "string" ? data.trackingNumber : undefined,
    timeline: Array.isArray(data.timeline) ? data.timeline : [],
    created_at: data.created_at as Timestamp,
    updated_at: data.updated_at as Timestamp,
  }
}

export function orderDocToSellerOrder(order: OrderDoc): SellerOrder {
  return {
    id: order.id,
    code: order.code,
    buyerName: order.customerName,
    buyerPhone: order.customerPhone,
    status: order.status,
    createdAt: order.created_at?.toDate?.().toISOString?.() ?? new Date().toISOString(),
    paymentStatus:
      order.paymentStatus === "cod"
        ? "cod"
        : order.paymentStatus === "paid"
          ? "paid"
          : "pending",
    paymentMethod: order.paymentMethod,
    shippingMethod: order.shippingMethod,
    shippingFee: order.shippingFee,
    total: order.total,
    items: order.items,
    shippingAddress: order.shippingAddress,
    customerNote: order.customerNote,
    trackingNumber: order.trackingNumber,
  }
}

function toBuyerStatus(status: SellerOrderStatus): Order["status"] {
  switch (status) {
    case "confirmed":
      return "confirmed"
    case "packed":
    case "ready_pickup":
      return "packed"
    case "shipping":
      return "shipping"
    case "delivered":
    case "completed":
      return "delivered"
    case "cancelled":
      return "cancelled"
    case "return_requested":
    case "returned":
    case "refunded":
      return "returned"
    case "payment_pending":
    case "awaiting_confirm":
    default:
      return "pending"
  }
}

export function orderDocToBuyerOrder(order: OrderDoc): Order {
  return {
    id: order.id,
    code: order.code,
    status: toBuyerStatus(order.status),
    createdAt: order.created_at?.toDate?.().toISOString?.() ?? new Date().toISOString(),
    total: order.total,
    shippingFee: order.shippingFee,
    items: order.items.map((item) => ({
      productId: item.productId,
      variantId: item.variantId,
      title: item.title,
      image: item.image,
      price: item.price,
      quantity: item.quantity,
      shopName: order.shopName,
    })),
    shippingAddress: order.shippingAddress,
    paymentMethod: order.paymentMethod,
    trackingNumber: order.trackingNumber,
    timeline: order.timeline.map((item) => ({
      status: item.status,
      timestamp: item.timestamp,
      note: item.note,
    })),
  }
}

function allocateAmount(total: number, weights: number[]): number[] {
  const sum = weights.reduce((acc, item) => acc + item, 0)
  if (sum <= 0) return weights.map(() => 0)

  let allocated = 0
  return weights.map((weight, index) => {
    if (index === weights.length - 1) return total - allocated
    const value = Math.round((total * weight) / sum)
    allocated += value
    return value
  })
}

export async function createMarketplaceOrders(
  input: CreateMarketplaceOrdersInput
): Promise<OrderDoc[]> {
  const groups = new Map<string, CartItem[]>()
  for (const item of input.items) {
    const current = groups.get(item.shopId) ?? []
    current.push(item)
    groups.set(item.shopId, current)
  }

  const entries = Array.from(groups.entries())
  const subtotals = entries.map(([, items]) =>
    items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  )
  const allocatedShipping = allocateAmount(input.shippingFee, subtotals)
  const allocatedCod = allocateAmount(input.codFee, subtotals)
  const allocatedDiscount = allocateAmount(input.discountTotal ?? 0, subtotals)
  const now = Timestamp.now()
  const status: SellerOrderStatus =
    input.paymentStatus === "pending" ? "payment_pending" : "awaiting_confirm"

  const created: OrderDoc[] = []
  for (const [index, [shopId, items]] of entries.entries()) {
    const orderRef = doc(ordersCol)
    const subtotal = subtotals[index]
    const order: Omit<OrderDoc, "id"> = {
      code: entries.length > 1 && index > 0 ? `${input.orderCode}-${index + 1}` : input.orderCode,
      parentCode: input.orderCode,
      customerId: input.customerId,
      customerEmail: input.customerEmail,
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      shopId,
      shopName: items[0]?.shopName ?? "Shop",
      status,
      paymentStatus: input.paymentStatus,
      paymentMethod: input.paymentMethod,
      shippingMethod: input.shippingMethod,
      shippingFee: allocatedShipping[index],
      codFee: allocatedCod[index],
      subtotal,
      total: subtotal + allocatedShipping[index] + allocatedCod[index] - allocatedDiscount[index],
      items: items.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        sku: item.variantId,
        title: item.title,
        image: item.thumbnail ?? "",
        quantity: item.quantity,
        price: item.price,
      })),
      shippingAddress: input.shippingAddress,
      customerNote: input.customerNote,
      trackingNumber: input.trackingNumber,
      timeline: [
        {
          status,
          timestamp: new Date().toISOString(),
          note: status === "payment_pending" ? "Đơn hàng chờ xác nhận thanh toán" : "Đơn hàng mới chờ seller xác nhận",
        },
      ],
      created_at: now,
      updated_at: now,
    }

    await setDoc(orderRef, order)
    created.push({ id: orderRef.id, ...order })
  }

  await writeAuditLog({
    action: "order_status_change",
    actor_id: input.customerId,
    actor_email: input.customerEmail ?? "",
    actor_role: "customer",
    target_type: "order",
    target_id: input.orderCode,
    details: { action: "create_marketplace_orders", count: created.length },
  })

  return created
}

export function subscribeSellerOrders(
  params: { shopId: string; status?: SellerOrderStatus; q?: string },
  onData: (orders: OrderDoc[]) => void,
  onError: (err: Error) => void
): Unsubscribe {
  const constraints: QueryConstraint[] = [where("shopId", "==", params.shopId)]
  if (params.status) constraints.push(where("status", "==", params.status))

  return onSnapshot(
    query(ordersCol, ...constraints),
    (snap) => {
      let orders = snap.docs
        .map((d) => mapOrderDoc(d.id, d.data()))
        .sort((a, b) => orderCreatedAtMs(b) - orderCreatedAtMs(a))

      if (params.q) {
        const search = params.q.toLowerCase()
        orders = orders.filter(
          (order) =>
            order.code.toLowerCase().includes(search) ||
            order.customerName.toLowerCase().includes(search) ||
            order.items.some((item) => item.title.toLowerCase().includes(search))
        )
      }

      onData(orders)
    },
    (err) => {
      console.error("[subscribeSellerOrders] Firestore error:", err)
      onError(err)
    }
  )
}

export function subscribeBuyerOrders(
  params: { customerId: string },
  onData: (orders: OrderDoc[]) => void,
  onError: (err: Error) => void
): Unsubscribe {
  return onSnapshot(
    query(ordersCol, where("customerId", "==", params.customerId)),
    (snap) => {
      const orders = snap.docs
        .map((d) => mapOrderDoc(d.id, d.data()))
        .sort((a, b) => orderCreatedAtMs(b) - orderCreatedAtMs(a))
      onData(orders)
    },
    (err) => {
      console.error("[subscribeBuyerOrders] Firestore error:", err)
      onError(err)
    }
  )
}

export async function getSellerOrderByCode(
  code: string,
  shopId: string
): Promise<OrderDoc | null> {
  const snap = await getDocs(
    query(ordersCol, where("code", "==", code), where("shopId", "==", shopId), limit(1))
  )
  if (snap.empty) return null
  const order = snap.docs[0]
  return mapOrderDoc(order.id, order.data())
}

export async function getBuyerOrderByCode(
  code: string,
  customerId: string
): Promise<OrderDoc | null> {
  const snap = await getDocs(
    query(
      ordersCol,
      where("code", "==", code),
      where("customerId", "==", customerId),
      limit(1)
    )
  )
  if (snap.empty) return null
  const order = snap.docs[0]
  return mapOrderDoc(order.id, order.data())
}

export async function updateSellerOrderStatus(
  orderId: string,
  nextStatus: SellerOrderStatus,
  actor: { id: string; email: string; role: string },
  note?: string
): Promise<void> {
  await updateDoc(doc(ordersCol, orderId), {
    status: nextStatus,
    updated_at: serverTimestamp(),
    timeline: arrayUnion({
      status: nextStatus,
      timestamp: new Date().toISOString(),
      actorId: actor.id,
      note,
    }),
  })

  await writeAuditLog({
    action: "order_status_change",
    actor_id: actor.id,
    actor_email: actor.email,
    actor_role: actor.role,
    target_type: "order",
    target_id: orderId,
    details: { status: nextStatus, note: note ?? null },
  })
}
