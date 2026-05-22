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
exports.onVendorStatusChanged = exports.onVendorRegistered = exports.onSupportMessageCreatedNotifyUser = exports.onSupportTicketUpdatedNotifyUser = exports.onDataRightsRequestUpdatedNotifyUser = exports.onUserAccountUpdatedNotifyUser = exports.onKycApplicationUpdatedNotifyUser = exports.onAffiliateTransactionCreatedNotifyUser = exports.onLoyaltyTransactionCreatedNotifyUser = exports.onWalletTransactionCreatedNotifyUser = exports.onRefundTransactionUpdatedNotifyCustomer = exports.onRefundTransactionCreatedNotifyCustomer = exports.onReturnRequestUpdatedNotifyCustomer = exports.onOrderCancelledNotifyBuyer = exports.zaloAuth = exports.corsOptions = exports.endLiveStream = exports.signPlaybackToken = exports.streamWebhook = exports.getStreamCredentials = exports.createLiveInput = exports.qrGuardQrConfig = exports.qrGuardProducts = exports.qrGuardVendorProfile = exports.vnptEkycWebhook = exports.startVendorKyc = exports.aivyChat = exports.processReturnRefund = exports.onAffiliateOrderPaid = exports.onAffiliateOrderCreated = exports.paymentApi = exports.ghtkWebhook = exports.registerShipment = exports.releaseHeldSellerBalances = exports.onPayoutPaid = exports.onEarlyPayoutRequest = exports.onOrderStatusChanged = exports.onOrderPaid = void 0;
const https_1 = require("firebase-functions/v2/https");
const firestore_1 = require("firebase-functions/v2/firestore");
const params_1 = require("firebase-functions/params");
const admin = __importStar(require("firebase-admin"));
admin.initializeApp();
const db = admin.firestore();
// ─── Finance Cloud Functions (orders/payouts → seller ledger) ──────────
var finance_1 = require("./finance");
Object.defineProperty(exports, "onOrderPaid", { enumerable: true, get: function () { return finance_1.onOrderPaid; } });
Object.defineProperty(exports, "onOrderStatusChanged", { enumerable: true, get: function () { return finance_1.onOrderStatusChanged; } });
Object.defineProperty(exports, "onEarlyPayoutRequest", { enumerable: true, get: function () { return finance_1.onEarlyPayoutRequest; } });
Object.defineProperty(exports, "onPayoutPaid", { enumerable: true, get: function () { return finance_1.onPayoutPaid; } });
Object.defineProperty(exports, "releaseHeldSellerBalances", { enumerable: true, get: function () { return finance_1.releaseHeldSellerBalances; } });
var shipping_1 = require("./shipping");
Object.defineProperty(exports, "registerShipment", { enumerable: true, get: function () { return shipping_1.registerShipment; } });
Object.defineProperty(exports, "ghtkWebhook", { enumerable: true, get: function () { return shipping_1.ghtkWebhook; } });
var payments_1 = require("./payments");
Object.defineProperty(exports, "paymentApi", { enumerable: true, get: function () { return payments_1.paymentApi; } });
var affiliate_1 = require("./affiliate");
Object.defineProperty(exports, "onAffiliateOrderCreated", { enumerable: true, get: function () { return affiliate_1.onAffiliateOrderCreated; } });
Object.defineProperty(exports, "onAffiliateOrderPaid", { enumerable: true, get: function () { return affiliate_1.onAffiliateOrderPaid; } });
var refunds_1 = require("./refunds");
Object.defineProperty(exports, "processReturnRefund", { enumerable: true, get: function () { return refunds_1.processReturnRefund; } });
var aivy_1 = require("./aivy");
Object.defineProperty(exports, "aivyChat", { enumerable: true, get: function () { return aivy_1.aivyChat; } });
var kyc_1 = require("./kyc");
Object.defineProperty(exports, "startVendorKyc", { enumerable: true, get: function () { return kyc_1.startVendorKyc; } });
Object.defineProperty(exports, "vnptEkycWebhook", { enumerable: true, get: function () { return kyc_1.vnptEkycWebhook; } });
// ─── QR Guard API (qr-ivs.web.app — IVS QR Guard bulk label system) ─
var qr_guard_1 = require("./qr-guard");
Object.defineProperty(exports, "qrGuardVendorProfile", { enumerable: true, get: function () { return qr_guard_1.qrGuardVendorProfile; } });
Object.defineProperty(exports, "qrGuardProducts", { enumerable: true, get: function () { return qr_guard_1.qrGuardProducts; } });
Object.defineProperty(exports, "qrGuardQrConfig", { enumerable: true, get: function () { return qr_guard_1.qrGuardQrConfig; } });
// ─── Livestream Cloud Functions (Cloudflare Stream Live integration) ───
var livestream_1 = require("./livestream");
Object.defineProperty(exports, "createLiveInput", { enumerable: true, get: function () { return livestream_1.createLiveInput; } });
Object.defineProperty(exports, "getStreamCredentials", { enumerable: true, get: function () { return livestream_1.getStreamCredentials; } });
Object.defineProperty(exports, "streamWebhook", { enumerable: true, get: function () { return livestream_1.streamWebhook; } });
Object.defineProperty(exports, "signPlaybackToken", { enumerable: true, get: function () { return livestream_1.signPlaybackToken; } });
Object.defineProperty(exports, "endLiveStream", { enumerable: true, get: function () { return livestream_1.endLiveStream; } });
// ─── Export CORS configuration ────────────────────────────────────────
var cors_1 = require("./cors");
Object.defineProperty(exports, "corsOptions", { enumerable: true, get: function () { return cors_1.corsOptions; } });
const zaloLoginSecret = (0, params_1.defineString)("ZALO_LOGIN_SECRET", { default: "" });
const ZALO_APP_ID = "1712776410811337542";
const ZALO_TOKEN_URL = "https://oauth.zaloapp.com/v4/access_token";
const ZALO_PROFILE_URL = "https://graph.zalo.me/v2.0/me";
function normalizeZaloProfile(raw) {
    const profile = raw.id || raw.user_id ? raw : raw.data ?? raw;
    const id = String(profile.id ?? profile.user_id ?? "").trim() || undefined;
    const name = profile.name ?? profile.display_name;
    const rawPicture = profile.picture;
    const picture = typeof rawPicture === "string"
        ? { data: { url: rawPicture } }
        : profile.picture?.data?.url
            ? { data: { url: profile.picture.data.url } }
            : profile.picture?.url
                ? { data: { url: profile.picture.url } }
                : profile.avatar
                    ? { data: { url: profile.avatar } }
                    : undefined;
    return {
        id,
        name,
        picture,
        error: profile.error,
        message: profile.message,
        error_name: profile.error_name,
        error_description: profile.error_description,
    };
}
function getZaloProfileError(raw) {
    return raw.error_description ?? raw.error_name ?? raw.message ?? raw.data?.message;
}
function cleanText(value) {
    return typeof value === "string" ? value.trim() : "";
}
function latestTimelineEvent(timeline, status) {
    if (!Array.isArray(timeline))
        return undefined;
    return [...timeline]
        .reverse()
        .find((item) => {
        return item && typeof item === "object" && item.status === status;
    });
}
function isCustomerCancellation(order, cancelledEvent) {
    const customerId = cleanText(order.customerId);
    const actorId = cleanText(cancelledEvent?.actorId);
    const actorRole = cleanText(cancelledEvent?.actorRole).toLowerCase();
    return actorRole === "customer" || (!!customerId && actorId === customerId);
}
function safeIdSegment(value) {
    const text = cleanText(value);
    return (text || "unknown").replace(/[^A-Za-z0-9_-]/g, "_").slice(0, 80);
}
function formatVnd(value) {
    const amount = typeof value === "number" && Number.isFinite(value) ? value : 0;
    return new Intl.NumberFormat("vi-VN").format(Math.round(amount)) + " đ";
}
function alreadyExists(error) {
    const code = error.code;
    return code === 6 || code === "already-exists" || code === "ALREADY_EXISTS";
}
async function createUserNotification(input) {
    const userId = cleanText(input.userId);
    if (!userId)
        return;
    const payload = {
        user_id: userId,
        type: input.type,
        title: input.title,
        body: input.body,
        link: input.link ?? null,
        read: false,
        metadata: input.metadata ?? {},
        created_at: admin.firestore.FieldValue.serverTimestamp(),
    };
    if (!input.id) {
        await db.collection("notifications").add(payload);
        return;
    }
    try {
        await db.collection("notifications").doc(input.id).create(payload);
    }
    catch (error) {
        if (alreadyExists(error))
            return;
        throw error;
    }
}
const ORDER_STATUS_MESSAGES = {
    payment_pending: { title: "Đơn hàng chờ thanh toán", label: "đang chờ thanh toán" },
    awaiting_confirm: { title: "Đơn hàng đang chờ xác nhận", label: "đang chờ người bán xác nhận" },
    pending: { title: "Đơn hàng đang chờ xác nhận", label: "đang chờ xác nhận" },
    confirmed: { title: "Đơn hàng đã được xác nhận", label: "đã được người bán xác nhận" },
    packed: { title: "Đơn hàng đã đóng gói", label: "đã được đóng gói" },
    ready_pickup: { title: "Đơn hàng đang chờ lấy hàng", label: "đang chờ đơn vị vận chuyển lấy hàng" },
    shipping: { title: "Đơn hàng đang giao", label: "đang được giao đến bạn" },
    delivered: { title: "Đơn hàng đã giao", label: "đã được giao thành công" },
    completed: { title: "Đơn hàng đã hoàn tất", label: "đã hoàn tất đối soát" },
    return_requested: { title: "Yêu cầu trả hàng đã được ghi nhận", label: "đang chờ xử lý trả hàng" },
    returned: { title: "Đơn hàng đã trả hàng", label: "đã được cập nhật trả hàng" },
    refunded: { title: "Đơn hàng đã hoàn tiền", label: "đã được hoàn tiền" },
    cancelled: { title: "Đơn hàng đã bị người bán hủy", label: "đã bị người bán hủy" },
};
const PAYMENT_STATUS_MESSAGES = {
    pending: { title: "Thanh toán đang chờ xử lý", label: "đang chờ xử lý" },
    paid: { title: "Thanh toán thành công", label: "đã thanh toán thành công" },
    cod: { title: "Thanh toán COD đã ghi nhận", label: "sẽ thanh toán khi nhận hàng" },
    failed: { title: "Thanh toán thất bại", label: "không thành công" },
    refunded: { title: "Thanh toán đã hoàn tiền", label: "đã được hoàn tiền" },
};
async function fetchZaloProfile(accessToken) {
    const profileUrl = `${ZALO_PROFILE_URL}?fields=id,name,picture`;
    const attempts = [
        () => fetch(profileUrl, { headers: { access_token: accessToken } }),
        () => fetch(`${profileUrl}&access_token=${encodeURIComponent(accessToken)}`),
        () => fetch(profileUrl, { headers: { Authorization: `Bearer ${accessToken}` } }),
    ];
    let lastError;
    for (const runAttempt of attempts) {
        const response = await runAttempt();
        const body = (await response.json());
        const profile = normalizeZaloProfile(body);
        if (response.ok && profile.id) {
            return { profile };
        }
        lastError = { status: response.status, body };
    }
    return { profile: {}, lastError };
}
exports.zaloAuth = (0, https_1.onRequest)({
    cors: true,
    region: "asia-southeast1",
}, async (req, res) => {
    if (req.method !== "POST") {
        res.status(405).json({ error: "Method not allowed" });
        return;
    }
    const { code, codeVerifier, redirectUri } = req.body;
    if (!code || !codeVerifier || !redirectUri) {
        res.status(400).json({ error: "Missing code, codeVerifier, or redirectUri" });
        return;
    }
    try {
        // 1. Exchange auth code for access token
        const tokenParams = new URLSearchParams({
            code,
            app_id: ZALO_APP_ID,
            grant_type: "authorization_code",
            code_verifier: codeVerifier,
        });
        tokenParams.set("redirect_uri", redirectUri);
        const tokenRes = await fetch(ZALO_TOKEN_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "secret_key": zaloLoginSecret.value(),
            },
            body: tokenParams.toString(),
        });
        const tokenData = await tokenRes.json();
        if (!tokenData.access_token) {
            res.status(401).json({
                error: "Zalo token exchange failed",
                details: tokenData.error_description ?? tokenData.error_name,
            });
            return;
        }
        // 2. Get Zalo user profile
        const { profile, lastError } = await fetchZaloProfile(tokenData.access_token);
        if (!profile.id) {
            res.status(401).json({
                error: "Failed to get Zalo profile",
                details: lastError
                    ? getZaloProfileError(lastError.body) ??
                        `Zalo profile API returned HTTP ${lastError.status}`
                    : undefined,
            });
            return;
        }
        // 3. Create Firebase custom token
        const uid = `zalo:${profile.id}`;
        const customToken = await admin.auth().createCustomToken(uid, {
            provider: "zalo",
            zaloId: profile.id,
            displayName: profile.name,
        });
        // 4. Create/update user in Firebase Auth
        try {
            await admin.auth().updateUser(uid, {
                displayName: profile.name ?? undefined,
                photoURL: profile.picture?.data?.url ?? undefined,
            });
        }
        catch {
            await admin.auth().createUser({
                uid,
                displayName: profile.name ?? undefined,
                photoURL: profile.picture?.data?.url ?? undefined,
            });
        }
        const userDocRef = db.collection("users").doc(uid);
        const userDoc = await userDocRef.get();
        await userDocRef.set({
            email: "",
            name: profile.name ?? "Zalo User",
            avatar: profile.picture?.data?.url ?? null,
            phone: "",
            auth_provider: "zalo",
            zalo_id: profile.id,
            role: userDoc.exists ? userDoc.data()?.role ?? "customer" : "customer",
            updated_at: admin.firestore.FieldValue.serverTimestamp(),
            ...(!userDoc.exists
                ? { created_at: admin.firestore.FieldValue.serverTimestamp() }
                : {}),
        }, { merge: true });
        res.json({
            customToken,
            profile: {
                id: profile.id,
                name: profile.name,
                picture: profile.picture?.data?.url,
            },
        });
    }
    catch (err) {
        console.error("Zalo auth error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});
/**
 * Notify the buyer when order data changes in a user-visible way.
 * Clients cannot create notifications for other users, so all cross-account
 * order notifications are written here with Admin SDK.
 */
exports.onOrderCancelledNotifyBuyer = (0, firestore_1.onDocumentUpdated)({
    document: "orders/{orderId}",
    region: "asia-southeast1",
}, async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();
    if (!before || !after)
        return;
    const orderId = event.params.orderId;
    const customerId = cleanText(after.customerId);
    if (!customerId) {
        console.warn("Skip buyer order notification: missing customerId", { orderId });
        return;
    }
    const orderCode = cleanText(after.code) || orderId;
    const shopName = cleanText(after.shopName) || "người bán";
    if (before.status !== after.status && after.status) {
        const status = cleanText(after.status);
        const msg = ORDER_STATUS_MESSAGES[status];
        const statusEvent = latestTimelineEvent(after.timeline, status);
        if (msg && !(status === "cancelled" && isCustomerCancellation(after, statusEvent))) {
            const note = cleanText(statusEvent?.note);
            const body = status === "cancelled" && note
                ? `Đơn ${orderCode} tại ${shopName} đã bị người bán hủy. Lý do: ${note}.`
                : `Đơn ${orderCode} tại ${shopName} ${msg.label}.`;
            await createUserNotification({
                id: status === "cancelled"
                    ? `order_cancelled_${orderId}`
                    : `order_status_${orderId}_${safeIdSegment(status)}`,
                userId: customerId,
                type: "order_update",
                title: msg.title,
                body,
                link: `/account/orders/${orderCode}`,
                metadata: {
                    orderId,
                    orderCode,
                    shopId: cleanText(after.shopId) || null,
                    shopName,
                    status,
                    reason: note || null,
                    actorId: cleanText(statusEvent?.actorId) || null,
                    actorRole: cleanText(statusEvent?.actorRole) || null,
                    source: "order_status_trigger",
                },
            });
        }
    }
    if (before.paymentStatus !== after.paymentStatus && after.paymentStatus) {
        const paymentStatus = cleanText(after.paymentStatus);
        const msg = PAYMENT_STATUS_MESSAGES[paymentStatus];
        if (msg) {
            await createUserNotification({
                id: `order_payment_${orderId}_${safeIdSegment(paymentStatus)}`,
                userId: customerId,
                type: "order_update",
                title: msg.title,
                body: `Thanh toán cho đơn ${orderCode} ${msg.label}.`,
                link: `/account/orders/${orderCode}`,
                metadata: {
                    orderId,
                    orderCode,
                    shopId: cleanText(after.shopId) || null,
                    shopName,
                    paymentStatus,
                    source: "order_payment_trigger",
                },
            });
        }
    }
    const beforeShipping = `${before.shippingStatusCode ?? ""}:${before.shippingStatusText ?? ""}`;
    const afterShipping = `${after.shippingStatusCode ?? ""}:${after.shippingStatusText ?? ""}`;
    if (beforeShipping !== afterShipping && (after.shippingStatusCode || after.shippingStatusText)) {
        const shippingText = cleanText(after.shippingStatusText) || "đã được cập nhật";
        const provider = cleanText(after.shippingProviderName) || "Đơn vị vận chuyển";
        await createUserNotification({
            id: `order_shipping_${orderId}_${safeIdSegment(after.shippingStatusCode ?? shippingText)}`,
            userId: customerId,
            type: "order_update",
            title: "Vận chuyển đơn hàng đã cập nhật",
            body: `${provider}: ${shippingText} cho đơn ${orderCode}.`,
            link: `/account/orders/${orderCode}`,
            metadata: {
                orderId,
                orderCode,
                shopId: cleanText(after.shopId) || null,
                shopName,
                shippingStatusCode: after.shippingStatusCode ?? null,
                shippingStatusText: shippingText,
                source: "order_shipping_trigger",
            },
        });
    }
});
exports.onReturnRequestUpdatedNotifyCustomer = (0, firestore_1.onDocumentUpdated)({
    document: "returnRequests/{requestId}",
    region: "asia-southeast1",
}, async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();
    if (!before || !after || before.status === after.status)
        return;
    const status = cleanText(after.status);
    const statusLabels = {
        pending: "đang chờ xử lý",
        approved: "đã được duyệt",
        refunded: "đã hoàn tiền",
        rejected: "đã bị từ chối",
        cancelled: "đã hủy",
    };
    const label = statusLabels[status];
    const customerId = cleanText(after.customerId);
    if (!label || !customerId)
        return;
    const orderCode = cleanText(after.orderCode) || cleanText(after.orderId) || event.params.requestId;
    await createUserNotification({
        id: `return_request_${event.params.requestId}_${safeIdSegment(status)}`,
        userId: customerId,
        type: "order_update",
        title: "Yêu cầu trả hàng đã cập nhật",
        body: `Yêu cầu trả hàng cho đơn ${orderCode} ${label}.`,
        link: `/account/orders/${orderCode}`,
        metadata: {
            returnRequestId: event.params.requestId,
            orderId: cleanText(after.orderId) || null,
            orderCode,
            status,
            source: "return_request_status_trigger",
        },
    });
});
exports.onRefundTransactionCreatedNotifyCustomer = (0, firestore_1.onDocumentCreated)({
    document: "refundTransactions/{refundId}",
    region: "asia-southeast1",
}, async (event) => {
    const data = event.data?.data();
    if (!data)
        return;
    const customerId = cleanText(data.customerId);
    if (!customerId)
        return;
    const status = cleanText(data.status) || "pending";
    const amount = formatVnd(data.amount);
    const orderCode = cleanText(data.orderCode) || cleanText(data.orderId) || event.params.refundId;
    await createUserNotification({
        id: `refund_tx_${event.params.refundId}_${safeIdSegment(status)}`,
        userId: customerId,
        type: "order_update",
        title: "Hoàn tiền đã được tạo",
        body: `Giao dịch hoàn tiền ${amount} cho đơn ${orderCode} đang ở trạng thái ${status}.`,
        link: `/account/orders/${orderCode}`,
        metadata: {
            refundId: event.params.refundId,
            orderId: cleanText(data.orderId) || null,
            orderCode,
            amount: typeof data.amount === "number" ? data.amount : null,
            status,
            source: "refund_transaction_created_trigger",
        },
    });
});
exports.onRefundTransactionUpdatedNotifyCustomer = (0, firestore_1.onDocumentUpdated)({
    document: "refundTransactions/{refundId}",
    region: "asia-southeast1",
}, async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();
    if (!before || !after || before.status === after.status)
        return;
    const customerId = cleanText(after.customerId);
    if (!customerId)
        return;
    const status = cleanText(after.status);
    const amount = formatVnd(after.amount);
    const orderCode = cleanText(after.orderCode) || cleanText(after.orderId) || event.params.refundId;
    await createUserNotification({
        id: `refund_tx_${event.params.refundId}_${safeIdSegment(status)}`,
        userId: customerId,
        type: "order_update",
        title: "Hoàn tiền đã cập nhật",
        body: `Giao dịch hoàn tiền ${amount} cho đơn ${orderCode} chuyển sang trạng thái ${status}.`,
        link: `/account/orders/${orderCode}`,
        metadata: {
            refundId: event.params.refundId,
            orderId: cleanText(after.orderId) || null,
            orderCode,
            amount: typeof after.amount === "number" ? after.amount : null,
            status,
            source: "refund_transaction_updated_trigger",
        },
    });
});
exports.onWalletTransactionCreatedNotifyUser = (0, firestore_1.onDocumentCreated)({
    document: "users/{userId}/walletTransactions/{transactionId}",
    region: "asia-southeast1",
}, async (event) => {
    const data = event.data?.data();
    if (!data)
        return;
    const userId = cleanText(event.params.userId);
    const type = cleanText(data.type) || "payment";
    const amount = formatVnd(data.amount);
    const description = cleanText(data.description) || "Giao dịch ví";
    await createUserNotification({
        id: `wallet_${event.params.transactionId}`,
        userId,
        type: "wallet",
        title: "Ví ACFMart đã cập nhật",
        body: `${description}: ${amount}.`,
        link: "/account/wallet",
        metadata: {
            transactionId: event.params.transactionId,
            walletType: type,
            amount: typeof data.amount === "number" ? data.amount : null,
            status: cleanText(data.status) || null,
            source: "wallet_transaction_trigger",
        },
    });
});
exports.onLoyaltyTransactionCreatedNotifyUser = (0, firestore_1.onDocumentCreated)({
    document: "users/{userId}/loyaltyTransactions/{transactionId}",
    region: "asia-southeast1",
}, async (event) => {
    const data = event.data?.data();
    if (!data)
        return;
    const points = typeof data.points === "number" ? data.points : 0;
    const description = cleanText(data.description) || "Giao dịch điểm thưởng";
    await createUserNotification({
        id: `loyalty_${event.params.transactionId}`,
        userId: event.params.userId,
        type: "loyalty",
        title: "Điểm thưởng đã cập nhật",
        body: `${description}: ${points > 0 ? "+" : ""}${points} điểm.`,
        link: "/account/loyalty",
        metadata: {
            transactionId: event.params.transactionId,
            points,
            loyaltyType: cleanText(data.type) || null,
            source: "loyalty_transaction_trigger",
        },
    });
});
exports.onAffiliateTransactionCreatedNotifyUser = (0, firestore_1.onDocumentCreated)({
    document: "users/{userId}/affiliateTransactions/{transactionId}",
    region: "asia-southeast1",
}, async (event) => {
    const data = event.data?.data();
    if (!data)
        return;
    const amount = formatVnd(data.amount);
    const description = cleanText(data.description) || "Giao dịch affiliate";
    await createUserNotification({
        id: `affiliate_${event.params.transactionId}`,
        userId: event.params.userId,
        type: "affiliate",
        title: "Affiliate đã cập nhật",
        body: `${description}: ${amount}.`,
        link: "/affiliate",
        metadata: {
            transactionId: event.params.transactionId,
            amount: typeof data.amount === "number" ? data.amount : null,
            status: cleanText(data.status) || null,
            source: "affiliate_transaction_trigger",
        },
    });
});
exports.onKycApplicationUpdatedNotifyUser = (0, firestore_1.onDocumentUpdated)({
    document: "kycApplications/{applicationId}",
    region: "asia-southeast1",
}, async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();
    if (!before || !after || before.status === after.status)
        return;
    const userId = cleanText(after.firebase_uid);
    const status = cleanText(after.status);
    if (!userId || !status)
        return;
    const statusLabels = {
        draft: "đã tạo nháp",
        submitted: "đã gửi",
        provider_pending: "đang chờ nhà cung cấp xử lý",
        approved: "đã được duyệt",
        rejected: "đã bị từ chối",
        expired: "đã hết hạn",
        failed: "xử lý thất bại",
    };
    await createUserNotification({
        id: `kyc_${event.params.applicationId}_${safeIdSegment(status)}`,
        userId,
        type: "kyc",
        title: "eKYC seller đã cập nhật",
        body: `Hồ sơ eKYC của bạn ${statusLabels[status] ?? `chuyển sang ${status}`}.`,
        link: "/seller/kyc",
        metadata: {
            applicationId: event.params.applicationId,
            vendorId: cleanText(after.vendor_id) || null,
            status,
            source: "kyc_application_status_trigger",
        },
    });
});
exports.onUserAccountUpdatedNotifyUser = (0, firestore_1.onDocumentUpdated)({
    document: "users/{userId}",
    region: "asia-southeast1",
}, async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();
    if (!before || !after)
        return;
    const userId = event.params.userId;
    const beforeRole = cleanText(before.role);
    const afterRole = cleanText(after.role);
    if (beforeRole !== afterRole && afterRole) {
        await createUserNotification({
            id: `account_role_${userId}_${safeIdSegment(afterRole)}`,
            userId,
            type: "system",
            title: "Quyền tài khoản đã cập nhật",
            body: `Vai trò tài khoản của bạn đã được cập nhật thành ${afterRole}.`,
            link: "/account",
            metadata: {
                field: "role",
                before: beforeRole || null,
                after: afterRole,
                source: "user_account_update_trigger",
            },
        });
    }
    const beforeStatus = cleanText(before.status ?? before.account_status);
    const afterStatus = cleanText(after.status ?? after.account_status);
    if (beforeStatus !== afterStatus && afterStatus) {
        await createUserNotification({
            id: `account_status_${userId}_${safeIdSegment(afterStatus)}`,
            userId,
            type: "system",
            title: "Trạng thái tài khoản đã cập nhật",
            body: `Tài khoản của bạn chuyển sang trạng thái ${afterStatus}.`,
            link: "/account/settings",
            metadata: {
                field: "status",
                before: beforeStatus || null,
                after: afterStatus,
                source: "user_account_update_trigger",
            },
        });
    }
});
exports.onDataRightsRequestUpdatedNotifyUser = (0, firestore_1.onDocumentUpdated)({
    document: "users/{userId}/dataRightsRequests/{requestId}",
    region: "asia-southeast1",
}, async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();
    if (!before || !after || before.status === after.status)
        return;
    const status = cleanText(after.status);
    await createUserNotification({
        id: `privacy_request_${event.params.requestId}_${safeIdSegment(status)}`,
        userId: event.params.userId,
        type: "privacy",
        title: "Yêu cầu dữ liệu cá nhân đã cập nhật",
        body: `Yêu cầu dữ liệu cá nhân của bạn chuyển sang trạng thái ${status}.`,
        link: "/account/settings?section=privacy",
        metadata: {
            requestId: event.params.requestId,
            status,
            requestType: cleanText(after.type) || null,
            source: "privacy_request_status_trigger",
        },
    });
});
exports.onSupportTicketUpdatedNotifyUser = (0, firestore_1.onDocumentUpdated)({
    document: "supportTickets/{ticketId}",
    region: "asia-southeast1",
}, async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();
    if (!before || !after || before.status === after.status)
        return;
    const userId = cleanText(after.userId);
    const status = cleanText(after.status);
    if (!userId || !status)
        return;
    await createUserNotification({
        id: `support_ticket_${event.params.ticketId}_${safeIdSegment(status)}`,
        userId,
        type: "support",
        title: "Yêu cầu hỗ trợ đã cập nhật",
        body: `Yêu cầu "${cleanText(after.subject) || event.params.ticketId}" chuyển sang trạng thái ${status}.`,
        link: "/account/support",
        metadata: {
            ticketId: event.params.ticketId,
            status,
            source: "support_ticket_status_trigger",
        },
    });
});
exports.onSupportMessageCreatedNotifyUser = (0, firestore_1.onDocumentCreated)({
    document: "supportTickets/{ticketId}/messages/{messageId}",
    region: "asia-southeast1",
}, async (event) => {
    const message = event.data?.data();
    if (!message)
        return;
    const senderRole = cleanText(message.senderRole).toLowerCase();
    if (!["admin", "moderator", "support", "aivy"].includes(senderRole))
        return;
    const ticketSnap = await db.collection("supportTickets").doc(event.params.ticketId).get();
    const ticket = ticketSnap.data();
    const userId = cleanText(ticket?.userId);
    if (!userId)
        return;
    await createUserNotification({
        id: `support_message_${event.params.messageId}`,
        userId,
        type: "support",
        title: "Bạn có phản hồi hỗ trợ mới",
        body: cleanText(message.content).slice(0, 140) || "Yêu cầu hỗ trợ của bạn có phản hồi mới.",
        link: "/account/support",
        metadata: {
            ticketId: event.params.ticketId,
            messageId: event.params.messageId,
            senderRole,
            source: "support_message_trigger",
        },
    });
});
/**
 * Notify moderators when a new vendor registration is created.
 * Sends email notification to all admin/moderator users.
 */
exports.onVendorRegistered = (0, firestore_1.onDocumentCreated)({
    document: "vendors/{vendorId}",
    region: "asia-southeast1",
}, async (event) => {
    const snap = event.data;
    if (!snap)
        return;
    const vendor = snap.data();
    const vendorId = event.params.vendorId;
    console.log(`New vendor registration: ${vendorId} - ${vendor.shop_name}`);
    // Get all owner/admin/moderator users
    const usersSnap = await db
        .collection("users")
        .where("role", "in", ["owner", "admin", "moderator"])
        .get();
    if (usersSnap.empty) {
        console.log("No moderators found to notify");
        return;
    }
    // Create notification documents for each moderator
    const batch = db.batch();
    for (const userDoc of usersSnap.docs) {
        const notifRef = db.collection("notifications").doc();
        batch.set(notifRef, {
            user_id: userDoc.id,
            type: "vendor_registration",
            title: "Hồ sơ seller mới cần duyệt",
            body: `${vendor.owner_name} đã đăng ký shop "${vendor.shop_name}" (${vendor.business_type}). Vui lòng duyệt tại /admin/vendors.`,
            link: `/admin/vendors`,
            vendor_id: vendorId,
            read: false,
            created_at: admin.firestore.FieldValue.serverTimestamp(),
        });
    }
    await batch.commit();
    console.log(`Notified ${usersSnap.size} moderator(s) about vendor ${vendorId}`);
});
async function syncSellerRoleFromVendor(vendorId, vendor) {
    const uid = typeof vendor.firebase_uid === "string" ? vendor.firebase_uid : "";
    if (!uid)
        return;
    const userRef = db.collection("users").doc(uid);
    const userSnap = await userRef.get();
    const userData = userSnap.data();
    const currentRole = userData?.role;
    if (typeof currentRole === "string" &&
        ["owner", "admin", "moderator"].includes(currentRole)) {
        return;
    }
    const patch = {
        role: "seller",
        email: vendor.owner_email ?? userData?.email ?? "",
        name: vendor.owner_name ?? userData?.name ?? "Người bán ACFMart",
        phone: vendor.owner_phone ?? userData?.phone ?? "",
        seller_vendor_id: vendorId,
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
    };
    if (!userSnap.exists || !userData?.created_at) {
        patch.created_at = admin.firestore.FieldValue.serverTimestamp();
    }
    await userRef.set(patch, { merge: true });
}
/**
 * Notify seller when their vendor status changes (approved/rejected/suspended).
 */
exports.onVendorStatusChanged = (0, firestore_1.onDocumentUpdated)({
    document: "vendors/{vendorId}",
    region: "asia-southeast1",
}, async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();
    if (!before || !after)
        return;
    if (before.status === after.status)
        return;
    const vendorId = event.params.vendorId;
    if (after.status === "active") {
        try {
            await syncSellerRoleFromVendor(vendorId, after);
        }
        catch (err) {
            console.error(`Failed to sync seller role for vendor ${vendorId}:`, err);
        }
    }
    const statusMessages = {
        active: {
            title: "Shop đã được phê duyệt!",
            body: `Shop "${after.shop_name}" đã được phê duyệt. Bạn có thể bắt đầu đăng sản phẩm tại /seller.`,
        },
        rejected: {
            title: "Hồ sơ bị từ chối",
            body: `Shop "${after.shop_name}" đã bị từ chối. Lý do: ${after.rejected_reason || "Không đạt yêu cầu"}. Bạn có thể đăng ký lại.`,
        },
        suspended: {
            title: "Shop bị tạm khoá",
            body: `Shop "${after.shop_name}" đã bị tạm khoá. Lý do: ${after.rejected_reason || "Vi phạm chính sách"}. Liên hệ hỗ trợ để được giải quyết.`,
        },
    };
    const msg = statusMessages[after.status];
    if (!msg)
        return;
    // Create notification for the vendor owner
    await db.collection("notifications").add({
        user_id: after.firebase_uid,
        type: "vendor_status_change",
        title: msg.title,
        body: msg.body,
        link: "/seller",
        vendor_id: vendorId,
        read: false,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log(`Vendor ${vendorId} status changed: ${before.status} → ${after.status}`);
});
//# sourceMappingURL=index.js.map