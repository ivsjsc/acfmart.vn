"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.releaseHeldSellerBalances = exports.onPayoutPaid = exports.onEarlyPayoutRequest = exports.onOrderStatusChanged = exports.onOrderPaid = void 0;
const firestore_1 = require("firebase-functions/v2/firestore");
const scheduler_1 = require("firebase-functions/v2/scheduler");
const params_1 = require("firebase-functions/params");
const admin = __importStar(require("firebase-admin"));
const logger = __importStar(require("firebase-functions/logger"));
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
const db = admin.firestore();
// Params - cho phép admin override qua Firebase console mà không cần redeploy
const PLATFORM_COMMISSION_RATE = (0, params_1.defineString)("PLATFORM_COMMISSION_RATE", { default: "0.05" });
const PAYMENT_GATEWAY_FEE_RATE = (0, params_1.defineString)("PAYMENT_GATEWAY_FEE_RATE", { default: "0.022" });
const ESCROW_HOLD_DAYS = (0, params_1.defineString)("ESCROW_HOLD_DAYS", { default: "7" });
const TRANSACTIONS = "sellerTransactions";
const BALANCES = "sellerBalances";
const PAYOUTS = "sellerPayouts";
const HOLD_RELEASE_SCAN_LIMIT = 200;
const HOLD_RELEASE_MAX_PASSES = 20;
// ─── Helpers ─────────────────────────────────────────────────────────────
function calculateFees(gross, paymentMethod = "") {
    const commissionRate = Number(PLATFORM_COMMISSION_RATE.value());
    const gatewayRate = Number(PAYMENT_GATEWAY_FEE_RATE.value());
    const commission = Math.round(gross * commissionRate);
    const gatewayFee = paymentMethod.toLowerCase() === "cod" ? 0 : Math.round(gross * gatewayRate);
    const net = gross - commission - gatewayFee;
    return { commission, gatewayFee, net };
}
function detectChannel(order) {
    const ch = (order.channel ?? "").toLowerCase();
    if (ch === "store" || ch === "cloud" || ch === "live")
        return ch;
    return "online";
}
function detectCategory(order) {
    const first = order.items?.[0];
    return first?.categoryName ?? "Khác";
}
function getEscrowHoldDays() {
    const parsed = Number(ESCROW_HOLD_DAYS.value());
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 7;
}
/**
 * Khoá đối ứng (idempotency) - tránh ghi lặp khi function retry.
 * Trả về true nếu đã processed trước đó.
 */
async function checkProcessed(orderId, kind) {
    const ref = db.collection("financeProcessed").doc(`${kind}_${orderId}`);
    try {
        await ref.create({ at: admin.firestore.FieldValue.serverTimestamp(), kind, orderId });
        return false;
    }
    catch (error) {
        const code = error.code;
        if (code === 6 || code === "already-exists" || code === "ALREADY_EXISTS") {
            return true;
        }
        throw error;
    }
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
exports.onOrderPaid = (0, firestore_1.onDocumentCreated)({ document: "orders/{orderId}", region: "asia-southeast1" }, async (event) => {
    const snap = event.data;
    if (!snap)
        return;
    const orderId = event.params.orderId;
    const order = snap.data();
    if (!order.shopId || !order.total) {
        logger.warn("onOrderPaid - thiếu shopId hoặc total", { orderId, order });
        return;
    }
    // Chỉ xử lý khi đã thanh toán (online) - COD đợi delivered mới ghi nhận.
    if (order.paymentStatus !== "paid") {
        logger.info("onOrderPaid - skip (paymentStatus != paid)", { orderId, paymentStatus: order.paymentStatus });
        return;
    }
    if (await checkProcessed(orderId, "order_paid")) {
        logger.info("onOrderPaid - đã xử lý trước đó", { orderId });
        return;
    }
    await writeRevenueAndFees(orderId, order);
});
/**
 * onOrderStatusChanged - phụ trách 2 case:
 *  1. paymentStatus pending → paid (online payment đến muộn sau khi order tạo):
 *     ghi revenue như onOrderPaid.
 *  2. status → delivered: chuyển pendingBalance → availableBalance.
 */
exports.onOrderStatusChanged = (0, firestore_1.onDocumentUpdated)({ document: "orders/{orderId}", region: "asia-southeast1" }, async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();
    if (!before || !after)
        return;
    const orderId = event.params.orderId;
    // Case 1: payment vừa được confirm
    if (before.paymentStatus !== "paid" && after.paymentStatus === "paid") {
        if (!(await checkProcessed(orderId, "order_paid"))) {
            await writeRevenueAndFees(orderId, after);
        }
    }
    // Case 1b: COD vừa được carrier đối soát xong
    const beforeCompleted = before.status === "completed";
    const afterCompleted = after.status === "completed";
    const isCodPayment = String(after.paymentStatus ?? "").toLowerCase() === "cod";
    if (isCodPayment && afterCompleted && !beforeCompleted) {
        if (!(await checkProcessed(orderId, "cod_settled"))) {
            const gross = Number(after.shippingPickMoney ?? after.total ?? 0);
            await writeRevenueAndFees(orderId, after, {
                gross,
                paymentMethod: "cod",
            });
        }
    }
    // Case 2: order vừa delivered - chuyển pending → available
    const isDelivered = after.status === "delivered" || after.status === "completed";
    const wasDelivered = before.status === "delivered" || before.status === "completed";
    if (isDelivered && !wasDelivered) {
        if (!(await checkProcessed(orderId, "order_delivered"))) {
            await transferPendingToAvailable(orderId, after);
        }
    }
    // Case 3: refund
    const isRefunded = after.paymentStatus === "refunded";
    const wasRefunded = before.paymentStatus === "refunded";
    if (isRefunded && !wasRefunded) {
        if (!(await checkProcessed(orderId, "order_refunded"))) {
            await writeRefund(orderId, after);
        }
    }
});
async function writeRevenueAndFees(orderId, order, options = {}) {
    const gross = Number(options.gross ?? order.total ?? 0);
    if (gross <= 0) {
        logger.warn("writeRevenueAndFees - gross <= 0", { orderId, gross });
        return;
    }
    const paymentMethod = String(options.paymentMethod ?? order.paymentMethod ?? "").toLowerCase();
    const { commission, gatewayFee, net } = calculateFees(gross, paymentMethod);
    const shopId = order.shopId;
    const occurredAt = admin.firestore.Timestamp.now();
    const channel = detectChannel(order);
    const category = detectCategory(order);
    const batch = db.batch();
    // 1. order_revenue (net cho seller)
    const revRef = db.collection(TRANSACTIONS).doc();
    batch.set(revRef, {
        shopId,
        type: "order_revenue",
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
    });
    // 2. commission (phí âm)
    const commRef = db.collection(TRANSACTIONS).doc();
    batch.set(commRef, {
        shopId,
        type: "commission",
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
    });
    // 3. payment_gateway fee (phí âm)
    if (gatewayFee > 0) {
        const feeRef = db.collection(TRANSACTIONS).doc();
        batch.set(feeRef, {
            shopId,
            type: "payment_gateway",
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
        });
    }
    // 4. Cập nhật sellerBalances (atomic increment)
    const balanceRef = db.collection(BALANCES).doc(shopId);
    const balanceSnap = await balanceRef.get();
    if (!balanceSnap.exists) {
        const initial = {
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
        };
        batch.set(balanceRef, initial);
    }
    else {
        batch.update(balanceRef, {
            pendingBalance: admin.firestore.FieldValue.increment(net),
            totalLifetimeRevenue: admin.firestore.FieldValue.increment(net),
            totalFeesPaid: admin.firestore.FieldValue.increment(commission + gatewayFee),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
    }
    await batch.commit();
    logger.info("writeRevenueAndFees committed", { orderId, shopId, gross, net, commission, gatewayFee });
}
async function transferPendingToAvailable(orderId, order) {
    const shopId = order.shopId;
    const gross = Number(order.shippingPickMoney ?? order.total ?? 0);
    const { net } = calculateFees(gross, String(order.paymentMethod ?? ""));
    const holdDays = getEscrowHoldDays();
    const availableAt = new Date(Date.now() + holdDays * 86_400_000);
    const balanceRef = db.collection(BALANCES).doc(shopId);
    await db.runTransaction(async (tx) => {
        const snap = await tx.get(balanceRef);
        if (!snap.exists) {
            logger.warn("transferPendingToAvailable - balance không tồn tại", { shopId });
            return;
        }
        const data = snap.data();
        const newPending = Math.max(0, data.pendingBalance - net);
        // holdBalance = số tiền đã delivered nhưng chưa hết escrow hold period
        // Khi qua holdDays → admin tool sẽ chuyển holdBalance → availableBalance.
        tx.update(balanceRef, {
            pendingBalance: newPending,
            holdBalance: admin.firestore.FieldValue.increment(net),
            nextPayoutAt: admin.firestore.Timestamp.fromDate(availableAt),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
    });
    logger.info("transferPendingToAvailable", { orderId, shopId, net, availableAt });
}
async function releaseDueHeldBalances(limitCount = HOLD_RELEASE_SCAN_LIMIT) {
    const now = admin.firestore.Timestamp.now();
    const querySnap = await db
        .collection(BALANCES)
        .where("nextPayoutAt", "<=", now)
        .orderBy("nextPayoutAt", "asc")
        .limit(limitCount)
        .get();
    if (querySnap.empty) {
        return { examined: 0, releasedCount: 0, releasedAmount: 0 };
    }
    let releasedCount = 0;
    let releasedAmount = 0;
    const holdDays = getEscrowHoldDays();
    for (const docSnap of querySnap.docs) {
        const released = await db.runTransaction(async (tx) => {
            const balanceSnap = await tx.get(docSnap.ref);
            if (!balanceSnap.exists)
                return 0;
            const balance = balanceSnap.data();
            const holdAmount = Math.max(0, Math.round(balance.holdBalance ?? 0));
            const dueAt = balance.nextPayoutAt?.toMillis?.() ?? 0;
            if (!balance.nextPayoutAt || dueAt > now.toMillis()) {
                return 0;
            }
            if (holdAmount <= 0) {
                tx.update(docSnap.ref, {
                    nextPayoutAt: null,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                });
                return 0;
            }
            const releaseRef = db.collection(TRANSACTIONS).doc();
            tx.set(releaseRef, {
                shopId: balance.shopId,
                type: "adjustment",
                orderId: null,
                orderCode: null,
                payoutId: null,
                channel: null,
                category: "Escrow",
                productId: null,
                amount: holdAmount,
                description: `Giải phóng hold tự động sau ${holdDays} ngày`,
                occurredAt: now,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            tx.update(docSnap.ref, {
                availableBalance: admin.firestore.FieldValue.increment(holdAmount),
                holdBalance: admin.firestore.FieldValue.increment(-holdAmount),
                nextPayoutAt: null,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            return holdAmount;
        });
        if (released > 0) {
            releasedCount += 1;
            releasedAmount += released;
        }
    }
    return {
        examined: querySnap.size,
        releasedCount,
        releasedAmount,
    };
}
async function writeRefund(orderId, order) {
    const shopId = order.shopId;
    const gross = Number(order.shippingPickMoney ?? order.total ?? 0);
    const { net } = calculateFees(gross, String(order.paymentMethod ?? ""));
    if (net <= 0) {
        logger.warn("writeRefund - net <= 0", { orderId, gross, net });
        return;
    }
    const balanceRef = db.collection(BALANCES).doc(shopId);
    await db.runTransaction(async (tx) => {
        const balanceSnap = await tx.get(balanceRef);
        if (!balanceSnap.exists) {
            logger.warn("writeRefund - balance không tồn tại", { orderId, shopId });
            return;
        }
        const balance = balanceSnap.data();
        let remaining = net;
        const fromPending = Math.min(Math.max(0, balance.pendingBalance ?? 0), remaining);
        remaining -= fromPending;
        const fromHold = Math.min(Math.max(0, balance.holdBalance ?? 0), remaining);
        remaining -= fromHold;
        const fromAvailable = Math.min(Math.max(0, balance.availableBalance ?? 0), remaining);
        remaining -= fromAvailable;
        const refundRef = db.collection(TRANSACTIONS).doc();
        tx.set(refundRef, {
            shopId,
            type: "refund",
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
            allocation: {
                pending: fromPending,
                hold: fromHold,
                available: fromAvailable,
                liability: remaining,
            },
        });
        tx.update(balanceRef, {
            pendingBalance: Math.max(0, (balance.pendingBalance ?? 0) - fromPending),
            holdBalance: Math.max(0, (balance.holdBalance ?? 0) - fromHold),
            availableBalance: Math.max(0, (balance.availableBalance ?? 0) - fromAvailable),
            refundLiabilityBalance: Math.max(0, balance.refundLiabilityBalance ?? 0) + remaining,
            totalLifetimeRevenue: admin.firestore.FieldValue.increment(-net),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
    });
    logger.info("writeRefund committed", { orderId, shopId, refundAmount: net });
}
/**
 * onEarlyPayoutRequest - Khi seller submit earlyPayoutRequests, tạo
 * sellerPayouts document `scheduled` + trừ availableBalance (giữ chỗ).
 *
 * Admin sau đó review → approve qua /admin/payouts hoặc reject.
 */
exports.onEarlyPayoutRequest = (0, firestore_1.onDocumentCreated)({ document: "earlyPayoutRequests/{requestId}", region: "asia-southeast1" }, async (event) => {
    const snap = event.data;
    if (!snap)
        return;
    const requestId = event.params.requestId;
    const req = snap.data();
    if (req.status !== "pending") {
        logger.info("onEarlyPayoutRequest - skip (status != pending)", { requestId });
        return;
    }
    const balanceRef = db.collection(BALANCES).doc(req.shopId);
    const balanceSnap = await balanceRef.get();
    if (!balanceSnap.exists) {
        logger.warn("onEarlyPayoutRequest - balance không tồn tại", { shopId: req.shopId });
        return;
    }
    const balance = balanceSnap.data();
    // Amount: dùng số trong request hoặc full availableBalance
    const amount = req.amount ?? balance.availableBalance;
    if (amount <= 0 || amount > balance.availableBalance) {
        logger.warn("onEarlyPayoutRequest - số tiền không hợp lệ", {
            requestId,
            amount,
            available: balance.availableBalance,
        });
        await db.collection("earlyPayoutRequests").doc(requestId).update({
            status: "rejected",
            rejected_reason: "Số dư khả dụng không đủ",
        });
        return;
    }
    const now = admin.firestore.Timestamp.now();
    const scheduledFor = admin.firestore.Timestamp.fromDate(new Date(Date.now() + 86_400_000));
    const batch = db.batch();
    const payoutRef = db.collection(PAYOUTS).doc();
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
    });
    batch.update(balanceRef, {
        availableBalance: admin.firestore.FieldValue.increment(-amount),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    batch.update(snap.ref, {
        status: "approved",
        payoutId: payoutRef.id,
        processedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    await batch.commit();
    logger.info("onEarlyPayoutRequest - payout scheduled", {
        requestId,
        payoutId: payoutRef.id,
        amount,
    });
});
/**
 * onPayoutPaid - Khi sellerPayouts.status chuyển sang `paid`, ghi
 * sellerTransactions type=payout (âm) + update sellerBalances.totalLifetimePayouts.
 *
 * Trigger từ admin tool sau khi confirm chuyển khoản ngân hàng thành công.
 */
exports.onPayoutPaid = (0, firestore_1.onDocumentUpdated)({ document: "sellerPayouts/{payoutId}", region: "asia-southeast1" }, async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();
    if (!before || !after)
        return;
    if (before.status === "paid" || after.status !== "paid")
        return;
    const payoutId = event.params.payoutId;
    const shopId = after.shopId;
    const amount = Number(after.netAmount ?? after.grossAmount ?? 0);
    if (amount <= 0) {
        logger.warn("onPayoutPaid - amount <= 0", { payoutId });
        return;
    }
    const batch = db.batch();
    const txRef = db.collection(TRANSACTIONS).doc();
    batch.set(txRef, {
        shopId,
        type: "payout",
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
    });
    const balanceRef = db.collection(BALANCES).doc(shopId);
    batch.update(balanceRef, {
        totalLifetimePayouts: admin.firestore.FieldValue.increment(amount),
        lastPayoutAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    await batch.commit();
    logger.info("onPayoutPaid - transaction + balance updated", { payoutId, shopId, amount });
});
exports.releaseHeldSellerBalances = (0, scheduler_1.onSchedule)({
    schedule: "every 1 hours",
    region: "asia-southeast1",
    timeZone: "Asia/Ho_Chi_Minh",
}, async () => {
    let passes = 0;
    let totalReleasedCount = 0;
    let totalReleasedAmount = 0;
    while (passes < HOLD_RELEASE_MAX_PASSES) {
        const result = await releaseDueHeldBalances();
        totalReleasedCount += result.releasedCount;
        totalReleasedAmount += result.releasedAmount;
        if (result.examined < HOLD_RELEASE_SCAN_LIMIT) {
            break;
        }
        passes += 1;
    }
    logger.info("releaseHeldSellerBalances completed", {
        passes: passes + 1,
        totalReleasedCount,
        totalReleasedAmount,
    });
});
//# sourceMappingURL=finance.js.map