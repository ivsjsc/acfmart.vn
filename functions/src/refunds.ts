import { HttpsError, onCall } from "firebase-functions/v2/https"
import * as admin from "firebase-admin"
import * as logger from "firebase-functions/logger"

const db = admin.firestore()

type RefundMethod = "wallet" | "bank" | "exchange"

interface ReturnRequestData {
  orderId?: string
  orderCode?: string
  customerId?: string
  shopId?: string
  status?: string
  refundMethod?: RefundMethod
  refundAmount?: number
  reasonLabel?: string
}

interface OrderData {
  customerId?: string
  shopId?: string
  code?: string
  total?: number
  status?: string
  paymentStatus?: string
  timeline?: unknown[]
}

function stringValue(value: unknown): string {
  return typeof value === "string" ? value : ""
}

function positiveAmount(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? Math.round(value)
    : 0
}

async function assertModerator(uid: string, tokenRole: unknown): Promise<void> {
  if (["owner", "admin", "moderator"].includes(String(tokenRole))) return

  const userSnap = await db.collection("users").doc(uid).get()
  const role = userSnap.data()?.role
  if (!["owner", "admin", "moderator"].includes(String(role))) {
    throw new HttpsError("permission-denied", "Bạn không có quyền xử lý hoàn tiền")
  }
}

export const processReturnRefund = onCall(
  { region: "asia-southeast1" },
  async (request) => {
    const uid = request.auth?.uid
    if (!uid) throw new HttpsError("unauthenticated", "Bạn cần đăng nhập")
    await assertModerator(uid, request.auth?.token.role)

    const returnRequestId = stringValue(request.data?.returnRequestId)
    const note = stringValue(request.data?.note)
    if (!returnRequestId) {
      throw new HttpsError("invalid-argument", "Thiếu mã yêu cầu hoàn tiền")
    }

    const result = await db.runTransaction(async (tx) => {
      const returnRef = db.collection("returnRequests").doc(returnRequestId)
      const returnSnap = await tx.get(returnRef)
      if (!returnSnap.exists) {
        throw new HttpsError("not-found", "Yêu cầu hoàn tiền không tồn tại")
      }

      const returnRequest = returnSnap.data() as ReturnRequestData
      if (!["pending", "approved"].includes(String(returnRequest.status))) {
        throw new HttpsError("failed-precondition", "Yêu cầu này đã được xử lý")
      }

      const orderId = stringValue(returnRequest.orderId)
      const customerId = stringValue(returnRequest.customerId)
      if (!orderId || !customerId) {
        throw new HttpsError("failed-precondition", "Yêu cầu hoàn tiền thiếu dữ liệu")
      }

      const orderRef = db.collection("orders").doc(orderId)
      const orderSnap = await tx.get(orderRef)
      if (!orderSnap.exists) throw new HttpsError("not-found", "Đơn hàng không tồn tại")

      const order = orderSnap.data() as OrderData
      if (order.customerId !== customerId) {
        throw new HttpsError("failed-precondition", "Yêu cầu không khớp khách hàng")
      }

      const refundAmount = positiveAmount(returnRequest.refundAmount)
      const orderTotal = positiveAmount(order.total)
      if (refundAmount <= 0 || refundAmount > orderTotal) {
        throw new HttpsError("failed-precondition", "Số tiền hoàn không hợp lệ")
      }

      const method = returnRequest.refundMethod ?? "wallet"
      const now = admin.firestore.FieldValue.serverTimestamp()
      const timelineEvent = {
        status: method === "exchange" ? "returned" : "refunded",
        timestamp: new Date().toISOString(),
        actorId: uid,
        note: note || returnRequest.reasonLabel || "Duyệt yêu cầu trả hàng",
      }

      if (method === "exchange") {
        tx.update(returnRef, {
          status: "approved",
          approvedBy: uid,
          approvedAt: now,
          updated_at: now,
          note: note || null,
        })
        tx.update(orderRef, {
          status: "returned",
          updated_at: now,
          timeline: admin.firestore.FieldValue.arrayUnion(timelineEvent),
        })
        return { status: "approved", refundMethod: method, refundAmount }
      }

      if (method !== "wallet") {
        const refundRef = db.collection("refundTransactions").doc(returnRequestId)
        tx.set(
          refundRef,
          {
            returnRequestId,
            orderId,
            orderCode: returnRequest.orderCode ?? order.code ?? null,
            customerId,
            shopId: returnRequest.shopId ?? order.shopId ?? null,
            amount: refundAmount,
            method,
            status: "pending_provider",
            reason: returnRequest.reasonLabel ?? null,
            requestedBy: uid,
            created_at: now,
            updated_at: now,
          },
          { merge: true }
        )
        tx.update(returnRef, {
          status: "approved",
          approvedBy: uid,
          approvedAt: now,
          refundTransactionId: refundRef.id,
          updated_at: now,
          note: note || null,
        })
        return { status: "pending_provider", refundMethod: method, refundAmount }
      }

      const walletStateRef = db
        .collection("users")
        .doc(customerId)
        .collection("walletState")
        .doc("current")
      const walletStateSnap = await tx.get(walletStateRef)
      const currentBalance = positiveAmount(walletStateSnap.data()?.balance)
      const txId = `refund:${orderId}:${returnRequestId}`
      const walletTxRef = db
        .collection("users")
        .doc(customerId)
        .collection("walletTransactions")
        .doc(txId)

      tx.set(walletTxRef, {
        type: "refund",
        amount: refundAmount,
        balance: currentBalance + refundAmount,
        description: `Hoàn tiền đơn ${order.code ?? returnRequest.orderCode ?? orderId}`,
        status: "completed",
        method: "wallet",
        reference_type: "return_request",
        reference_id: returnRequestId,
        idempotency_key: txId,
        created_at: now,
        updated_at: now,
      })
      tx.set(
        walletStateRef,
        {
          customer_id: customerId,
          balance: admin.firestore.FieldValue.increment(refundAmount),
          locked_balance: walletStateSnap.data()?.locked_balance ?? 0,
          total_claimed: walletStateSnap.data()?.total_claimed ?? 0,
          total_withdrawn: walletStateSnap.data()?.total_withdrawn ?? 0,
          last_transaction_id: txId,
          updated_at: now,
          created_at: walletStateSnap.data()?.created_at ?? now,
        },
        { merge: true }
      )
      tx.update(returnRef, {
        status: "refunded",
        approvedBy: uid,
        approvedAt: now,
        refundedAt: now,
        refundTransactionId: txId,
        updated_at: now,
        note: note || null,
      })
      tx.update(orderRef, {
        status: "refunded",
        paymentStatus: "refunded",
        updated_at: now,
        timeline: admin.firestore.FieldValue.arrayUnion(timelineEvent),
      })

      return { status: "refunded", refundMethod: method, refundAmount }
    })

    logger.info("return refund processed", { returnRequestId, result })
    return result
  }
)
