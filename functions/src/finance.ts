import { onDocumentCreated, onDocumentUpdated } from "firebase-functions/v2/firestore"
import { defineString } from "firebase-functions/params"
import * as admin from "firebase-admin"
import * as logger from "firebase-functions/logger"

/**
 * Finance Cloud Functions - cầu nối giữa orders/earlyPayoutRequests
 * và bảng tài chính (sellerTransactions / sellerBalances / sellerPayouts).
 *
 * Trigger flow:
 *   orders/{orderId}                  ─→ onOrderPaid       ─→ ghi sellerTransactions (revenue + fees) + cập nhật sellerBalances
 *   orders/{orderId} (status update)  ─→ onOrderDelivered  ─→ chuyển pending → available
 *   earlyPayoutRequests/{reqId}       ─→ onEarlyPayoutRequest ─→ trừ available, tạo sellerPayouts scheduled
 *   sellerPayouts/{payoutId}          ─→ onPayoutPaid      ─→ ghi transaction `payout`
 *
 * Quy ước tài chính:
 *   - Phí hoa hồng = 5% gross (PLATFORM_COMMISSION_RATE)
 *   - Phí cổng thanh toán = 2.2% gross (PAYMENT_GATEWAY_FEE_RATE)
 *   - Net = gross - commission - gatewayFee
 *   - pendingBalance: net khi paymentStatus=paid nhưng chưa delivered
 *   - availableBalance: net khi delivered + qua khoảng holdDuration
 */

const db = admin.firestore()

// Params - cho phép admin override qua Firebase console mà không cần redeploy
const PLATFORM_COMMISSION_RATE = defineString("PLATFORM_COMMISSION_RATE", { default: "0.05" })
const PAYMENT_GATEWAY_FEE_RATE = defineString("PAYMENT_GATEWAY_FEE_RATE", { default: "0.022" })
const ESCROW_HOLD_DAYS = defineString("ESCROW_HOLD_DAYS", { default: "7" })

const TRANSACTIONS = "sellerTransactions"
const BALANCES = "sellerBalances"
const PAYOUTS = "sellerPayouts"

type TransactionType =
  | "order_revenue"
  | "commission"
  | "payment_gateway"
  | "ads_charge"
  | "livestream_fee"
  | "refund"
  | "adjustment"
  | "payout"

interface OrderDocData {
  shopId?: string
  shopName?: string
  code?: string
  parentCode?: string
  total?: number
  subtotal?: number
  shippingFee?: number
  status?: string
  paymentStatus?: string
  paymentMethod?: string
  channel?: string
  category?: string
  items?: Array<{ productId?: string; categoryId?: string; categoryName?: string }>
}

interface SellerBalanceDoc {
  shopId: string
  availableBalance: number
  pendingBalance: number
  holdBalance: number
  lastPayoutAt: admin.firestore.Timestamp | null
  nextPayoutAt: admin.firestore.Timestamp | null
  payoutCycle: "weekly" | "bi_weekly" | "monthly"
  totalLifetimeRevenue: number
  totalLifetimePayouts: number
  totalFeesPaid: number
  updatedAt: admin.firestore.FieldValue
}

interface EarlyPayoutRequestDoc {
  shopId: string
  amount?: number
  requestedBy: string
  status: "pending" | "approved" | "rejected" | "paid"
  createdAt: admin.firestore.Timestamp
  bankAccount?: {
    bankName: string
    accountNumber: string
    accountHolder: string
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────

function calculateFees(gross: number): { commission: number; gatewayFee: number; net: number } {
  const commissionRate = Number(PLATFORM_COMMISSION_RATE.value())
  const gatewayRate = Number(PAYMENT_GATEWAY_FEE_RATE.value())
  const commission = Math.round(gross * commissionRate)
  const gatewayFee = Math.round(gross * gatewayRate)
  const net = gross - commission - gatewayFee
  return { commission, gatewayFee, net }
}

function detectChannel(order: OrderDocData): "online" | "store" | "cloud" | "live" {
  const ch = (order.channel ?? "").toLowerCase()
  if (ch === "store" || ch === "cloud" || ch === "live") return ch
  return "online"
}

function detectCategory(order: OrderDocData): string {
  const first = order.items?.[0]
  return first?.categoryName ?? "Khác"
}

/**
 * Khoá đối ứng (idempotency) - tránh ghi lặp khi function retry.
 * Trả về true nếu đã processed trước đó.
 */
async function checkProcessed(orderId: string, kind: string): Promise<boolean> {
  const ref = db.collection("financeProcessed").doc(`${kind}_${orderId}`)
  const snap = await ref.get()
  if (snap.exists) return true
  await ref.set({ at: admin.firestore.FieldValue.serverTimestamp(), kind, orderId })
  return false
}

// ─── Triggers ────────────────────────────────────────────────────────────

/**
 * onOrderPaid - Khi order được tạo với paymentStatus=paid hoặc khi
 * paymentStatus chuyển từ pending → paid, ghi sellerTransactions:
 *   + order_revenue: net (cho ledger seller)
 *   - commission:    phí hoa hồng (âm)
 *   - payment_gateway: phí cổng (âm)
 * Cập nhật sellerBalances: pendingBalance += net (đợi delivered → available).
 */
export const onOrderPaid = onDocumentCreated(
  { document: "orders/{orderId}", region: "asia-southeast1" },
  async (event) => {
    const snap = event.data
    if (!snap) return
    const orderId = event.params.orderId
    const order = snap.data() as OrderDocData

    if (!order.shopId || !order.total) {
      logger.warn("onOrderPaid - thiếu shopId hoặc total", { orderId, order })
      return
    }

    // Chỉ xử lý khi đã thanh toán (online) - COD đợi delivered mới ghi nhận.
    if (order.paymentStatus !== "paid") {
      logger.info("onOrderPaid - skip (paymentStatus != paid)", { orderId, paymentStatus: order.paymentStatus })
      return
    }

    if (await checkProcessed(orderId, "order_paid")) {
      logger.info("onOrderPaid - đã xử lý trước đó", { orderId })
      return
    }

    await writeRevenueAndFees(orderId, order)
  }
)

/**
 * onOrderStatusChanged - phụ trách 2 case:
 *  1. paymentStatus pending → paid (online payment đến muộn sau khi order tạo):
 *     ghi revenue như onOrderPaid.
 *  2. status → delivered: chuyển pendingBalance → availableBalance.
 */
export const onOrderStatusChanged = onDocumentUpdated(
  { document: "orders/{orderId}", region: "asia-southeast1" },
  async (event) => {
    const before = event.data?.before.data() as OrderDocData | undefined
    const after = event.data?.after.data() as OrderDocData | undefined
    if (!before || !after) return
    const orderId = event.params.orderId

    // Case 1: payment vừa được confirm
    if (before.paymentStatus !== "paid" && after.paymentStatus === "paid") {
      if (!(await checkProcessed(orderId, "order_paid"))) {
        await writeRevenueAndFees(orderId, after)
      }
    }

    // Case 2: order vừa delivered - chuyển pending → available
    const isDelivered = after.status === "delivered" || after.status === "completed"
    const wasDelivered = before.status === "delivered" || before.status === "completed"
    if (isDelivered && !wasDelivered) {
      if (!(await checkProcessed(orderId, "order_delivered"))) {
        await transferPendingToAvailable(orderId, after)
      }
    }

    // Case 3: refund
    const isRefunded = after.paymentStatus === "refunded"
    const wasRefunded = before.paymentStatus === "refunded"
    if (isRefunded && !wasRefunded) {
      if (!(await checkProcessed(orderId, "order_refunded"))) {
        await writeRefund(orderId, after)
      }
    }
  }
)

async function writeRevenueAndFees(orderId: string, order: OrderDocData): Promise<void> {
  const gross = Number(order.total ?? 0)
  if (gross <= 0) {
    logger.warn("writeRevenueAndFees - gross <= 0", { orderId, gross })
    return
  }
  const { commission, gatewayFee, net } = calculateFees(gross)
  const shopId = order.shopId!
  const occurredAt = admin.firestore.Timestamp.now()
  const channel = detectChannel(order)
  const category = detectCategory(order)

  const batch = db.batch()

  // 1. order_revenue (net cho seller)
  const revRef = db.collection(TRANSACTIONS).doc()
  batch.set(revRef, {
    shopId,
    type: "order_revenue" as TransactionType,
    orderId,
    orderCode: order.code ?? null,
    payoutId: null,
    channel,
    category,
    productId: order.items?.[0]?.productId ?? null,
    amount: net,
    description: `Doanh thu đơn ${order.code ?? orderId}`,
    occurredAt,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  })

  // 2. commission (phí âm)
  const commRef = db.collection(TRANSACTIONS).doc()
  batch.set(commRef, {
    shopId,
    type: "commission" as TransactionType,
    orderId,
    orderCode: order.code ?? null,
    payoutId: null,
    channel,
    category,
    productId: null,
    amount: -commission,
    description: `Phí hoa hồng sàn ${(Number(PLATFORM_COMMISSION_RATE.value()) * 100).toFixed(1)}%`,
    occurredAt,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  })

  // 3. payment_gateway fee (phí âm)
  const feeRef = db.collection(TRANSACTIONS).doc()
  batch.set(feeRef, {
    shopId,
    type: "payment_gateway" as TransactionType,
    orderId,
    orderCode: order.code ?? null,
    payoutId: null,
    channel,
    category,
    productId: null,
    amount: -gatewayFee,
    description: `Phí cổng ${order.paymentMethod ?? "thanh toán"}`,
    occurredAt,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  })

  // 4. Cập nhật sellerBalances (atomic increment)
  const balanceRef = db.collection(BALANCES).doc(shopId)
  const balanceSnap = await balanceRef.get()
  if (!balanceSnap.exists) {
    const initial: SellerBalanceDoc = {
      shopId,
      availableBalance: 0,
      pendingBalance: net,
      holdBalance: 0,
      lastPayoutAt: null,
      nextPayoutAt: null,
      payoutCycle: "weekly",
      totalLifetimeRevenue: net,
      totalLifetimePayouts: 0,
      totalFeesPaid: commission + gatewayFee,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }
    batch.set(balanceRef, initial)
  } else {
    batch.update(balanceRef, {
      pendingBalance: admin.firestore.FieldValue.increment(net),
      totalLifetimeRevenue: admin.firestore.FieldValue.increment(net),
      totalFeesPaid: admin.firestore.FieldValue.increment(commission + gatewayFee),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    })
  }

  await batch.commit()
  logger.info("writeRevenueAndFees committed", { orderId, shopId, gross, net, commission, gatewayFee })
}

async function transferPendingToAvailable(orderId: string, order: OrderDocData): Promise<void> {
  const shopId = order.shopId!
  const gross = Number(order.total ?? 0)
  const { net } = calculateFees(gross)
  const holdDays = Number(ESCROW_HOLD_DAYS.value())
  const availableAt = new Date(Date.now() + holdDays * 86_400_000)

  const balanceRef = db.collection(BALANCES).doc(shopId)
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(balanceRef)
    if (!snap.exists) {
      logger.warn("transferPendingToAvailable - balance không tồn tại", { shopId })
      return
    }
    const data = snap.data() as SellerBalanceDoc
    const newPending = Math.max(0, data.pendingBalance - net)
    // holdBalance = số tiền đã delivered nhưng chưa hết escrow hold period
    // Khi qua holdDays → admin tool sẽ chuyển holdBalance → availableBalance.
    tx.update(balanceRef, {
      pendingBalance: newPending,
      holdBalance: admin.firestore.FieldValue.increment(net),
      nextPayoutAt: admin.firestore.Timestamp.fromDate(availableAt),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    })
  })
  logger.info("transferPendingToAvailable", { orderId, shopId, net, availableAt })
}

async function writeRefund(orderId: string, order: OrderDocData): Promise<void> {
  const shopId = order.shopId!
  const gross = Number(order.total ?? 0)
  const { net } = calculateFees(gross)

  const batch = db.batch()

  const refundRef = db.collection(TRANSACTIONS).doc()
  batch.set(refundRef, {
    shopId,
    type: "refund" as TransactionType,
    orderId,
    orderCode: order.code ?? null,
    payoutId: null,
    channel: detectChannel(order),
    category: detectCategory(order),
    productId: null,
    amount: -net,
    description: `Hoàn tiền đơn ${order.code ?? orderId}`,
    occurredAt: admin.firestore.Timestamp.now(),
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  })

  const balanceRef = db.collection(BALANCES).doc(shopId)
  batch.update(balanceRef, {
    pendingBalance: admin.firestore.FieldValue.increment(-net),
    totalLifetimeRevenue: admin.firestore.FieldValue.increment(-net),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  })

  await batch.commit()
  logger.info("writeRefund committed", { orderId, shopId, refundAmount: net })
}

/**
 * onEarlyPayoutRequest - Khi seller submit earlyPayoutRequests, tạo
 * sellerPayouts document `scheduled` + trừ availableBalance (giữ chỗ).
 *
 * Admin sau đó review → approve qua /admin/payouts hoặc reject.
 */
export const onEarlyPayoutRequest = onDocumentCreated(
  { document: "earlyPayoutRequests/{requestId}", region: "asia-southeast1" },
  async (event) => {
    const snap = event.data
    if (!snap) return
    const requestId = event.params.requestId
    const req = snap.data() as EarlyPayoutRequestDoc

    if (req.status !== "pending") {
      logger.info("onEarlyPayoutRequest - skip (status != pending)", { requestId })
      return
    }

    const balanceRef = db.collection(BALANCES).doc(req.shopId)
    const balanceSnap = await balanceRef.get()
    if (!balanceSnap.exists) {
      logger.warn("onEarlyPayoutRequest - balance không tồn tại", { shopId: req.shopId })
      return
    }
    const balance = balanceSnap.data() as SellerBalanceDoc

    // Amount: dùng số trong request hoặc full availableBalance
    const amount = req.amount ?? balance.availableBalance
    if (amount <= 0 || amount > balance.availableBalance) {
      logger.warn("onEarlyPayoutRequest - số tiền không hợp lệ", {
        requestId,
        amount,
        available: balance.availableBalance,
      })
      await db.collection("earlyPayoutRequests").doc(requestId).update({
        status: "rejected",
        rejected_reason: "Số dư khả dụng không đủ",
      })
      return
    }

    const now = admin.firestore.Timestamp.now()
    const scheduledFor = admin.firestore.Timestamp.fromDate(new Date(Date.now() + 86_400_000))

    const batch = db.batch()
    const payoutRef = db.collection(PAYOUTS).doc()

    batch.set(payoutRef, {
      shopId: req.shopId,
      periodStart: now,
      periodEnd: now,
      scheduledFor,
      paidAt: null,
      status: "scheduled",
      cycle: "weekly",
      orderCount: 0,
      grossAmount: amount,
      commissionFee: 0,
      paymentGatewayFee: 0,
      adsFee: 0,
      livestreamFee: 0,
      adjustments: 0,
      netAmount: amount,
      bankAccount: req.bankAccount ?? null,
      transactionRef: null,
      failureReason: null,
      requestId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    })

    batch.update(balanceRef, {
      availableBalance: admin.firestore.FieldValue.increment(-amount),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    })

    batch.update(snap.ref, {
      status: "approved",
      payoutId: payoutRef.id,
      processedAt: admin.firestore.FieldValue.serverTimestamp(),
    })

    await batch.commit()
    logger.info("onEarlyPayoutRequest - payout scheduled", {
      requestId,
      payoutId: payoutRef.id,
      amount,
    })
  }
)

/**
 * onPayoutPaid - Khi sellerPayouts.status chuyển sang `paid`, ghi
 * sellerTransactions type=payout (âm) + update sellerBalances.totalLifetimePayouts.
 *
 * Trigger từ admin tool sau khi confirm chuyển khoản ngân hàng thành công.
 */
export const onPayoutPaid = onDocumentUpdated(
  { document: "sellerPayouts/{payoutId}", region: "asia-southeast1" },
  async (event) => {
    const before = event.data?.before.data()
    const after = event.data?.after.data()
    if (!before || !after) return
    if (before.status === "paid" || after.status !== "paid") return

    const payoutId = event.params.payoutId
    const shopId = after.shopId as string
    const amount = Number(after.netAmount ?? after.grossAmount ?? 0)
    if (amount <= 0) {
      logger.warn("onPayoutPaid - amount <= 0", { payoutId })
      return
    }

    const batch = db.batch()

    const txRef = db.collection(TRANSACTIONS).doc()
    batch.set(txRef, {
      shopId,
      type: "payout" as TransactionType,
      orderId: null,
      orderCode: null,
      payoutId,
      channel: null,
      category: null,
      productId: null,
      amount: -amount,
      description: `Chi trả payout ${payoutId}`,
      occurredAt: admin.firestore.Timestamp.now(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    })

    const balanceRef = db.collection(BALANCES).doc(shopId)
    batch.update(balanceRef, {
      totalLifetimePayouts: admin.firestore.FieldValue.increment(amount),
      lastPayoutAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    })

    await batch.commit()
    logger.info("onPayoutPaid - transaction + balance updated", { payoutId, shopId, amount })
  }
)
