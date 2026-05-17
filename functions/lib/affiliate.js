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
exports.onAffiliateOrderPaid = exports.onAffiliateOrderCreated = void 0;
const firestore_1 = require("firebase-functions/v2/firestore");
const admin = __importStar(require("firebase-admin"));
const logger = __importStar(require("firebase-functions/logger"));
const db = admin.firestore();
function stringValue(value) {
    return typeof value === "string" && value.trim() ? value.trim() : null;
}
function numberValue(value) {
    return typeof value === "number" && Number.isFinite(value) ? value : 0;
}
function firstString(...values) {
    for (const value of values) {
        const text = stringValue(value);
        if (text)
            return text;
    }
    return null;
}
function isPaidOrder(order) {
    return ["paid", "completed", "settled"].includes(String(order.paymentStatus ?? order.payment_status ?? ""));
}
function getAttribution(order) {
    const affiliate = order.affiliate ?? {};
    const referral = order.referral ?? {};
    return {
        affiliateId: firstString(order.affiliate_id, order.affiliateId, affiliate.affiliate_id, affiliate.affiliateId, referral.affiliate_id, referral.affiliateId),
        linkId: firstString(order.affiliate_link_id, order.affiliateLinkId, affiliate.link_id, affiliate.linkId, referral.link_id, referral.linkId),
        code: firstString(order.affiliate_code, order.affiliateCode, affiliate.code, affiliate.short_code, affiliate.shortCode, referral.code, referral.short_code, referral.shortCode),
    };
}
async function resolveAffiliateLink(attribution) {
    if (attribution.linkId) {
        const byId = await db.collection("affiliateLinks").doc(attribution.linkId).get();
        if (byId.exists)
            return byId;
    }
    if (attribution.code) {
        const byCode = await db
            .collection("affiliateLinks")
            .where("short_code", "==", attribution.code)
            .limit(1)
            .get();
        if (!byCode.empty)
            return byCode.docs[0];
        const byId = await db.collection("affiliateLinks").doc(attribution.code).get();
        if (byId.exists)
            return byId;
    }
    return null;
}
async function recordCommissionForOrder(orderId, eventOrder) {
    if (!isPaidOrder(eventOrder))
        return;
    const attribution = getAttribution(eventOrder);
    if (!attribution.linkId && !attribution.code) {
        logger.info("affiliate commission skipped: no attribution", { orderId });
        return;
    }
    const linkSnap = await resolveAffiliateLink(attribution);
    if (!linkSnap?.exists) {
        logger.warn("affiliate commission skipped: link not found", { orderId, attribution });
        return;
    }
    const linkData = linkSnap.data() ?? {};
    const affiliateId = attribution.affiliateId ??
        stringValue(linkData.affiliate_id) ??
        stringValue(linkData.affiliateId);
    if (!affiliateId) {
        logger.warn("affiliate commission skipped: missing affiliate owner", {
            orderId,
            linkId: linkSnap.id,
        });
        return;
    }
    if (eventOrder.customerId && eventOrder.customerId === affiliateId) {
        logger.warn("affiliate commission skipped: self-referral", {
            orderId,
            affiliateId,
        });
        return;
    }
    const idempotencyKey = `commission:${orderId}:${linkSnap.id}`;
    const txRef = db
        .collection("users")
        .doc(affiliateId)
        .collection("affiliateTransactions")
        .doc(idempotencyKey);
    const orderRef = db.collection("orders").doc(orderId);
    const linkRef = db.collection("affiliateLinks").doc(linkSnap.id);
    const profileRef = db
        .collection("users")
        .doc(affiliateId)
        .collection("affiliateProfile")
        .doc("current");
    await db.runTransaction(async (tx) => {
        const [existingTx, orderSnap, currentLinkSnap, profileSnap] = await Promise.all([
            tx.get(txRef),
            tx.get(orderRef),
            tx.get(linkRef),
            tx.get(profileRef),
        ]);
        if (existingTx.exists)
            return;
        if (!orderSnap.exists || !isPaidOrder(orderSnap.data()))
            return;
        const order = orderSnap.data();
        const currentLink = currentLinkSnap.data() ?? linkData;
        const currentProfile = profileSnap.data() ?? {};
        const owner = stringValue(currentLink.affiliate_id) ?? stringValue(currentLink.affiliateId);
        if (owner && owner !== affiliateId) {
            throw new Error(`Affiliate link owner mismatch for order ${orderId}`);
        }
        const orderTotal = numberValue(order.total ?? order.grandTotal);
        if (orderTotal <= 0)
            return;
        const rawBps = numberValue(currentLink.commission_bps) ||
            numberValue(currentLink.commissionBps) ||
            numberValue(currentProfile.default_commission_bps) ||
            numberValue(currentProfile.defaultCommissionBps) ||
            500;
        const commissionBps = Math.min(Math.max(Math.round(rawBps), 0), 10000);
        if (commissionBps <= 0)
            return;
        const amount = Math.floor((orderTotal * commissionBps) / 10000);
        if (amount <= 0)
            return;
        tx.set(txRef, {
            type: "commission",
            amount,
            status: "pending",
            description: `Hoa hồng từ đơn ${order.code ?? orderId}`,
            order_id: orderId,
            order_code: order.code ?? null,
            link_id: linkSnap.id,
            idempotency_key: idempotencyKey,
            created_at: admin.firestore.FieldValue.serverTimestamp(),
            updated_at: admin.firestore.FieldValue.serverTimestamp(),
        });
        tx.update(linkRef, {
            conversions: admin.firestore.FieldValue.increment(1),
            total_commission: admin.firestore.FieldValue.increment(amount),
            updated_at: admin.firestore.FieldValue.serverTimestamp(),
        });
        tx.set(profileRef, {
            customer_id: affiliateId,
            status: "active",
            tier: currentProfile.tier ?? "bronze",
            default_commission_bps: currentProfile.default_commission_bps ?? 500,
            pending_commission: admin.firestore.FieldValue.increment(amount),
            lifetime_commission: admin.firestore.FieldValue.increment(amount),
            total_conversions: admin.firestore.FieldValue.increment(1),
            updated_at: admin.firestore.FieldValue.serverTimestamp(),
            created_at: currentProfile.created_at ?? admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
    });
    logger.info("affiliate commission recorded", {
        orderId,
        affiliateId,
        linkId: linkSnap.id,
    });
}
exports.onAffiliateOrderCreated = (0, firestore_1.onDocumentCreated)({ document: "orders/{orderId}", region: "asia-southeast1" }, async (event) => {
    const order = event.data?.data();
    if (!order)
        return;
    await recordCommissionForOrder(event.params.orderId, order);
});
exports.onAffiliateOrderPaid = (0, firestore_1.onDocumentUpdated)({ document: "orders/{orderId}", region: "asia-southeast1" }, async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();
    if (!before || !after)
        return;
    if (isPaidOrder(before) || !isPaidOrder(after))
        return;
    await recordCommissionForOrder(event.params.orderId, after);
});
//# sourceMappingURL=affiliate.js.map