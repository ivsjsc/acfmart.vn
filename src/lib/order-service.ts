import {
  arrayUnion,
  collection,
  doc,
  getDocs,
  limit,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
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
  shippingProviderId?: string
  shippingProviderName?: string
  shippingServiceCode?: string
  shippingFee: number
  codFee: number
  subtotal: number
  total: number
  items: SellerOrder["items"]
  shippingAddress: SellerOrder["shippingAddress"]
  customerNote?: string
  trackingNumber?: string
  shippingLabelId?: string
  shippingStatusCode?: number
  shippingStatusText?: string
  shippingReasonCode?: string
  shippingReason?: string
  shippingWeight?: number
  shippingPickMoney?: number
  shippingReturnPartPackage?: number
  shippingLabelUrl?: string
  shippingUpdatedAt?: Timestamp
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
  shippingProviderId?: string
  shippingProviderName?: string
  shippingServiceCode?: string
  shippingFee: number
  codFee: number
  discountTotal?: number
  customerNote?: string
  trackingNumber?: string
}

const ordersCol = collection(firestore, "orders")
const returnRequestsCol = collection(firestore, "returnRequests")
const MAX_CLIENT_ORDER_TOTAL = 100_000_000

export type ReturnRefundMethod = "wallet" | "bank" | "exchange"

export interface CreateReturnRequestInput {
  order: OrderDoc
  customerId: string
  customerEmail?: string
  reason: string
  reasonLabel: string
  refundMethod: ReturnRefundMethod
  selectedVariantIds: string[]
  description?: string
  photoUrls: string[]
}

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
    shippingProviderId: typeof data.shippingProviderId === "string" ? data.shippingProviderId : undefined,
    shippingProviderName:
      typeof data.shippingProviderName === "string" ? data.shippingProviderName : undefined,
    shippingServiceCode:
      typeof data.shippingServiceCode === "string" ? data.shippingServiceCode : undefined,
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
    shippingLabelId: typeof data.shippingLabelId === "string" ? data.shippingLabelId : undefined,
    shippingStatusCode:
      typeof data.shippingStatusCode === "number" ? data.shippingStatusCode : undefined,
    shippingStatusText:
      typeof data.shippingStatusText === "string" ? data.shippingStatusText : undefined,
    shippingReasonCode:
      typeof data.shippingReasonCode === "string" ? data.shippingReasonCode : undefined,
    shippingReason:
      typeof data.shippingReason === "string" ? data.shippingReason : undefined,
    shippingWeight: typeof data.shippingWeight === "number" ? data.shippingWeight : undefined,
    shippingPickMoney:
      typeof data.shippingPickMoney === "number" ? data.shippingPickMoney : undefined,
    shippingReturnPartPackage:
      typeof data.shippingReturnPartPackage === "number"
        ? data.shippingReturnPartPackage
        : undefined,
    shippingLabelUrl:
      typeof data.shippingLabelUrl === "string" ? data.shippingLabelUrl : undefined,
    shippingUpdatedAt: data.shippingUpdatedAt as Timestamp | undefined,
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
    shippingProviderId: order.shippingProviderId,
    shippingProviderName: order.shippingProviderName,
    shippingServiceCode: order.shippingServiceCode,
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
    shippingProviderId: order.shippingProviderId,
    shippingReason: order.shippingReason,
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

function isNonNegativeCurrencyAmount(value: number): boolean {
  return Number.isFinite(value) && Number.isInteger(value) && value >= 0
}

function validateMarketplaceOrderInput(input: CreateMarketplaceOrdersInput): void {
  if (!input.customerId.trim()) throw new Error("Thiếu thông tin khách hàng")
  if (!input.orderCode.trim()) throw new Error("Thiếu mã đơn hàng")
  if (!Array.isArray(input.items) || input.items.length === 0) {
    throw new Error("Giỏ hàng không có sản phẩm hợp lệ")
  }

  const isCod = input.paymentMethod === "cod"
  if (isCod && input.paymentStatus !== "cod") {
    throw new Error("Đơn COD phải có trạng thái thanh toán COD")
  }
  if (!isCod && input.paymentStatus !== "pending") {
    throw new Error("Đơn online phải chờ xác nhận thanh toán từ hệ thống")
  }

  const moneyFields = [
    input.shippingFee,
    input.codFee,
    input.discountTotal ?? 0,
  ]
  if (!moneyFields.every(isNonNegativeCurrencyAmount)) {
    throw new Error("Số tiền của đơn hàng không hợp lệ")
  }

  for (const item of input.items) {
    if (!item.shopId || !item.productId || !item.title) {
      throw new Error("Sản phẩm thiếu thông tin bắt buộc")
    }
    if (!Number.isInteger(item.quantity) || item.quantity <= 0 || item.quantity > 99) {
      throw new Error("Số lượng sản phẩm không hợp lệ")
    }
    if (!isNonNegativeCurrencyAmount(item.price) || item.price > MAX_CLIENT_ORDER_TOTAL) {
      throw new Error("Giá sản phẩm không hợp lệ")
    }
  }
}

export async function createMarketplaceOrders(
  input: CreateMarketplaceOrdersInput
): Promise<OrderDoc[]> {
  validateMarketplaceOrderInput(input)

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
  const batch = writeBatch(firestore)

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
      shippingProviderId: input.shippingProviderId,
      shippingProviderName: input.shippingProviderName,
      shippingServiceCode: input.shippingServiceCode,
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
      shippingLabelId: undefined,
      shippingStatusCode: undefined,
      shippingStatusText: undefined,
      shippingReasonCode: undefined,
      shippingReason: undefined,
      shippingWeight: undefined,
      shippingPickMoney: undefined,
      shippingReturnPartPackage: undefined,
      shippingLabelUrl: undefined,
      shippingUpdatedAt: undefined,
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

    if (order.total < 0 || order.total > MAX_CLIENT_ORDER_TOTAL) {
      throw new Error("Tổng tiền của đơn hàng không hợp lệ")
    }

    batch.set(orderRef, order)
    created.push({ id: orderRef.id, ...order })
  }

  await batch.commit()

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

export async function listBuyerOrders(params: {
  customerId: string
  limitCount?: number
}): Promise<OrderDoc[]> {
  const snap = await getDocs(
    query(ordersCol, where("customerId", "==", params.customerId))
  )
  return snap.docs
    .map((d) => mapOrderDoc(d.id, d.data()))
    .sort((a, b) => orderCreatedAtMs(b) - orderCreatedAtMs(a))
    .slice(0, params.limitCount ?? 5)
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

export async function createReturnRequest(
  input: CreateReturnRequestInput
): Promise<{ id: string; refundAmount: number }> {
  if (input.order.customerId !== input.customerId) {
    throw new Error("Bạn không có quyền tạo yêu cầu cho đơn hàng này")
  }
  if (!["shipping", "delivered", "completed"].includes(input.order.status)) {
    throw new Error("Đơn hàng chưa đủ điều kiện trả hàng")
  }
  if (input.selectedVariantIds.length === 0) {
    throw new Error("Vui lòng chọn sản phẩm cần trả")
  }
  if (!input.reason.trim() || !input.reasonLabel.trim()) {
    throw new Error("Vui lòng chọn lý do trả hàng")
  }
  if (input.photoUrls.length > 6) {
    throw new Error("Tối đa 6 ảnh minh chứng")
  }

  const selected = input.order.items.filter((item) =>
    input.selectedVariantIds.includes(item.variantId || item.sku || item.productId)
  )
  if (selected.length === 0) {
    throw new Error("Sản phẩm trả hàng không hợp lệ")
  }

  const refundAmount = selected.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )
  if (!isNonNegativeCurrencyAmount(refundAmount) || refundAmount <= 0) {
    throw new Error("Số tiền hoàn không hợp lệ")
  }
  if (refundAmount > input.order.total) {
    throw new Error("Số tiền hoàn vượt quá giá trị đơn hàng")
  }

  const requestRef = doc(returnRequestsCol)
  const orderRef = doc(ordersCol, input.order.id)
  const timelineEvent = {
    status: "return_requested" satisfies SellerOrderStatus,
    timestamp: new Date().toISOString(),
    actorId: input.customerId,
    note: input.reasonLabel,
  }

  await runTransaction(firestore, async (tx) => {
    const latestOrderSnap = await tx.get(orderRef)
    if (!latestOrderSnap.exists()) throw new Error("Đơn hàng không tồn tại")

    const latestOrder = mapOrderDoc(latestOrderSnap.id, latestOrderSnap.data())
    if (latestOrder.customerId !== input.customerId) {
      throw new Error("Bạn không có quyền tạo yêu cầu cho đơn hàng này")
    }
    if (!["shipping", "delivered", "completed"].includes(latestOrder.status)) {
      throw new Error("Đơn hàng đã có yêu cầu trả hàng hoặc không còn đủ điều kiện")
    }
    if (refundAmount > latestOrder.total) {
      throw new Error("Số tiền hoàn vượt quá giá trị đơn hàng")
    }

    const now = serverTimestamp()
    tx.set(requestRef, {
      orderId: input.order.id,
      orderCode: input.order.code,
      customerId: input.customerId,
      customerEmail: input.customerEmail ?? null,
      shopId: input.order.shopId,
      shopName: input.order.shopName,
      items: selected.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        sku: item.sku,
        title: item.title,
        quantity: item.quantity,
        price: item.price,
      })),
      reason: input.reason,
      reasonLabel: input.reasonLabel,
      refundMethod: input.refundMethod,
      refundAmount,
      description: input.description?.trim() || null,
      photos: input.photoUrls,
      status: "pending",
      created_at: now,
      updated_at: now,
    })
    tx.update(orderRef, {
      status: "return_requested",
      returnRequestId: requestRef.id,
      updated_at: now,
      timeline: arrayUnion(timelineEvent),
    })
  })

  await writeAuditLog({
    action: "order_status_change",
    actor_id: input.customerId,
    actor_email: input.customerEmail ?? "",
    actor_role: "customer",
    target_type: "order",
    target_id: input.order.id,
    details: {
      action: "create_return_request",
      returnRequestId: requestRef.id,
      refundAmount,
      reason: input.reason,
    },
  })

  return { id: requestRef.id, refundAmount }
}
