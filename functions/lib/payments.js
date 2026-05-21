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
exports.paymentApi = void 0;
const https_1 = require("firebase-functions/v2/https");
const params_1 = require("firebase-functions/params");
const admin = __importStar(require("firebase-admin"));
const crypto_1 = require("crypto");
const region = "asia-southeast1";
const db = admin.firestore();
const paymentPublicBaseUrl = (0, params_1.defineString)("PAYMENT_PUBLIC_BASE_URL", { default: "" });
const vnpayTmnCode = (0, params_1.defineString)("VNPAY_TMN_CODE", { default: "" });
const vnpayHashSecret = (0, params_1.defineString)("VNPAY_HASH_SECRET", { default: "" });
const vnpayApiUrl = (0, params_1.defineString)("VNPAY_API_URL", {
    default: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
});
const momoPartnerCode = (0, params_1.defineString)("MOMO_PARTNER_CODE", { default: "" });
const momoAccessKey = (0, params_1.defineString)("MOMO_ACCESS_KEY", { default: "" });
const momoSecretKey = (0, params_1.defineString)("MOMO_SECRET_KEY", { default: "" });
const momoApiUrl = (0, params_1.defineString)("MOMO_API_URL", {
    default: "https://test-payment.momo.vn/v2/gateway/api/create",
});
const zaloAppId = (0, params_1.defineString)("ZALOPAY_APP_ID", { default: "" });
const zaloKey1 = (0, params_1.defineString)("ZALOPAY_KEY1", { default: "" });
const zaloKey2 = (0, params_1.defineString)("ZALOPAY_KEY2", { default: "" });
const zaloApiUrl = (0, params_1.defineString)("ZALOPAY_API_URL", {
    default: "https://sb-openapi.zalopay.vn/v2/create",
});
function asString(value, fallback = "") {
    return typeof value === "string" && value.trim() ? value.trim() : fallback;
}
function asNumber(value, fallback = 0) {
    const num = typeof value === "number" ? value : Number(value);
    return Number.isFinite(num) ? num : fallback;
}
function toRecord(value) {
    if (!value || typeof value !== "object" || Array.isArray(value))
        return null;
    return value;
}
function paymentMethods() {
    return [
        {
            id: "cod",
            name: "Thanh toán khi nhận hàng",
            description: "Thanh toán trực tiếp cho shipper khi nhận hàng",
            logo: "",
            enabled: true,
        },
        {
            id: "vnpay",
            name: "VNPay",
            description: "Thanh toán qua cổng VNPay",
            logo: "",
            enabled: true,
        },
        {
            id: "momo",
            name: "MoMo",
            description: "Thanh toán qua ví MoMo",
            logo: "",
            enabled: true,
        },
        {
            id: "zalopay",
            name: "ZaloPay",
            description: "Thanh toán qua ví ZaloPay",
            logo: "",
            enabled: true,
        },
    ];
}
function hmacSha256(secret, data) {
    return (0, crypto_1.createHmac)("sha256", secret).update(data, "utf8").digest("hex");
}
function hmacSha512(secret, data) {
    return (0, crypto_1.createHmac)("sha512", secret).update(data, "utf8").digest("hex");
}
function timingSafeEqualHex(left, right) {
    if (!left || !right || left.length !== right.length)
        return false;
    try {
        return (0, crypto_1.timingSafeEqual)(Buffer.from(left, "hex"), Buffer.from(right, "hex"));
    }
    catch {
        return false;
    }
}
function buildSortedQuery(params) {
    return Object.keys(params)
        .filter((key) => params[key] !== undefined && params[key] !== null && params[key] !== "")
        .sort()
        .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(String(params[key]))}`)
        .join("&");
}
function formatVnpDate(date) {
    const tz = new Date(date.getTime() + 7 * 60 * 60 * 1000);
    const pad = (n) => String(n).padStart(2, "0");
    return (`${tz.getUTCFullYear()}` +
        `${pad(tz.getUTCMonth() + 1)}` +
        `${pad(tz.getUTCDate())}` +
        `${pad(tz.getUTCHours())}` +
        `${pad(tz.getUTCMinutes())}` +
        `${pad(tz.getUTCSeconds())}`);
}
function resolvePaymentPublicBaseUrl() {
    const configured = paymentPublicBaseUrl.value().trim();
    if (configured)
        return configured.replace(/\/$/, "");
    const projectId = (process.env.GCLOUD_PROJECT ?? "").trim();
    const target = (process.env.FUNCTION_TARGET ?? "paymentApi").trim();
    if (!projectId)
        return "";
    return `https://${region}-${projectId}.cloudfunctions.net/${target}`;
}
function getWebhookUrl(provider) {
    const base = resolvePaymentPublicBaseUrl();
    return base ? `${base}/store/payment/webhook/${provider}` : "";
}
function getPaymentCredentials(provider) {
    if (provider === "vnpay") {
        return {
            tmnCode: vnpayTmnCode.value().trim(),
            hashSecret: vnpayHashSecret.value().trim(),
            apiUrl: vnpayApiUrl.value().trim(),
        };
    }
    if (provider === "momo") {
        return {
            partnerCode: momoPartnerCode.value().trim(),
            accessKey: momoAccessKey.value().trim(),
            secretKey: momoSecretKey.value().trim(),
            apiUrl: momoApiUrl.value().trim(),
        };
    }
    return {
        appId: zaloAppId.value().trim(),
        key1: zaloKey1.value().trim(),
        key2: zaloKey2.value().trim(),
        apiUrl: zaloApiUrl.value().trim(),
    };
}
function ensureConfigured(provider) {
    const cfg = getPaymentCredentials(provider);
    if (provider === "vnpay" && (!cfg.tmnCode || !cfg.hashSecret || !cfg.apiUrl)) {
        throw new Error("VNPay chưa được cấu hình");
    }
    if (provider === "momo" && (!cfg.partnerCode || !cfg.accessKey || !cfg.secretKey || !cfg.apiUrl)) {
        throw new Error("MoMo chưa được cấu hình");
    }
    if (provider === "zalopay" && (!cfg.appId || !cfg.key1 || !cfg.key2 || !cfg.apiUrl)) {
        throw new Error("ZaloPay chưa được cấu hình");
    }
}
function normalizeBody(input) {
    const body = toRecord(input) ?? {};
    return {
        orderId: asString(body.orderId ?? body.order_id ?? body.orderCode ?? body.order_code),
        orderCode: asString(body.orderCode ?? body.order_code ?? body.orderId ?? body.order_id),
        orderInfo: asString(body.orderInfo ?? body.description),
        description: asString(body.description ?? body.orderInfo),
        amount: body.amount,
        currency: asString(body.currency, "VND"),
        returnUrl: asString(body.returnUrl ?? body.return_url),
        return_url: asString(body.return_url ?? body.returnUrl),
        cancelUrl: asString(body.cancelUrl ?? body.cancel_url),
        cancel_url: asString(body.cancel_url ?? body.cancelUrl),
        redirectUrl: asString(body.redirectUrl),
        buyerEmail: asString(body.buyerEmail),
        buyerPhone: asString(body.buyerPhone),
        app_user: asString(body.app_user),
        metadata: toRecord(body.metadata) ?? undefined,
        embed_data: body.embed_data,
    };
}
async function createPaymentSession(input) {
    const ref = db.collection("paymentSessions").doc();
    await ref.set({
        id: ref.id,
        orderCode: input.orderCode,
        provider: input.provider,
        status: "pending",
        amount: input.amount,
        currency: input.currency,
        returnUrl: input.returnUrl,
        cancelUrl: input.cancelUrl ?? null,
        providerExternalTxnRef: ref.id,
        requestPayload: input.requestPayload,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return ref;
}
async function patchPaymentSession(sessionId, patch) {
    await db.collection("paymentSessions").doc(sessionId).set({
        ...patch,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
}
async function updateOrdersByCode(orderCode, patcher) {
    const collection = db.collection("orders");
    const byParent = await collection.where("parentCode", "==", orderCode).get();
    const snap = byParent.empty ? await collection.where("code", "==", orderCode).get() : byParent;
    if (snap.empty)
        return 0;
    const batch = db.batch();
    for (const docSnap of snap.docs) {
        batch.update(docSnap.ref, patcher(docSnap.data()));
    }
    await batch.commit();
    return snap.size;
}
async function updatePaymentOrdersFromSession(input) {
    const updated = await updateOrdersByCode(input.orderCode, (data) => {
        const timelineStatus = input.nextStatus === "paid"
            ? data.status === "payment_pending"
                ? "awaiting_confirm"
                : String(data.status ?? "awaiting_confirm")
            : input.nextStatus === "pending"
                ? String(data.status ?? "payment_pending")
                : input.nextStatus === "cancelled" || input.nextStatus === "failed" || input.nextStatus === "expired"
                    ? String(data.status ?? "payment_pending") === "payment_pending"
                        ? "cancelled"
                        : String(data.status ?? "cancelled")
                    : String(data.status ?? "awaiting_confirm");
        const patch = {
            paymentStatus: input.nextStatus === "paid"
                ? "paid"
                : input.nextStatus === "pending"
                    ? String(data.paymentStatus ?? "pending")
                    : "failed",
            paymentProvider: input.provider,
            paymentProviderTxnRef: input.sessionId,
            paymentProviderExternalTxnId: input.providerTxnId ?? null,
            paymentWebhookAt: admin.firestore.FieldValue.serverTimestamp(),
            updated_at: admin.firestore.FieldValue.serverTimestamp(),
            timeline: admin.firestore.FieldValue.arrayUnion({
                status: timelineStatus,
                timestamp: new Date().toISOString(),
                note: input.note,
            }),
        };
        if (input.nextStatus === "paid") {
            patch.status = timelineStatus;
            patch.paymentConfirmedAt = admin.firestore.FieldValue.serverTimestamp();
        }
        else if (timelineStatus === "cancelled") {
            patch.status = timelineStatus;
            patch.paymentFailedAt = admin.firestore.FieldValue.serverTimestamp();
        }
        if (input.rawPayload) {
            patch.paymentGatewayRaw = input.rawPayload;
        }
        return patch;
    });
    await patchPaymentSession(input.sessionId, {
        status: input.nextStatus,
        providerTxnId: input.providerTxnId ?? null,
        webhookPayload: input.rawPayload ?? null,
        ...(input.nextStatus === "paid"
            ? { paidAt: admin.firestore.FieldValue.serverTimestamp() }
            : input.nextStatus === "failed" || input.nextStatus === "expired" || input.nextStatus === "cancelled"
                ? { failedAt: admin.firestore.FieldValue.serverTimestamp() }
                : {}),
    });
    return updated;
}
async function handleVnpayInit(req, body) {
    ensureConfigured("vnpay");
    const cfg = getPaymentCredentials("vnpay");
    const orderCode = body.orderCode || body.orderId;
    const amount = asNumber(body.amount, 0);
    const returnUrl = body.returnUrl || body.return_url;
    if (!orderCode || amount <= 0 || !returnUrl) {
        throw new Error("Thiếu orderCode, amount hoặc returnUrl");
    }
    const sessionRef = await createPaymentSession({
        orderCode,
        provider: "vnpay",
        amount,
        currency: asString(body.currency, "VND"),
        returnUrl,
        cancelUrl: body.cancelUrl || body.cancel_url || undefined,
        requestPayload: {
            orderCode,
            amount,
            description: body.orderInfo || body.description || "",
            returnUrl,
            cancelUrl: body.cancelUrl || body.cancel_url || "",
            buyerEmail: body.buyerEmail || "",
            buyerPhone: body.buyerPhone || "",
            metadata: body.metadata ?? null,
        },
    });
    const createDate = formatVnpDate(new Date());
    const expireDate = formatVnpDate(new Date(Date.now() + 15 * 60 * 1000));
    const tmnCode = asString(cfg.tmnCode);
    const hashSecret = asString(cfg.hashSecret);
    const apiUrl = asString(cfg.apiUrl);
    const params = {
        vnp_Version: "2.1.0",
        vnp_Command: "pay",
        vnp_TmnCode: tmnCode,
        vnp_Amount: String(Math.round(amount * 100)),
        vnp_CurrCode: "VND",
        vnp_TxnRef: sessionRef.id,
        vnp_OrderInfo: (body.orderInfo || body.description || `Thanh toan don hang ${orderCode}`).slice(0, 255),
        vnp_OrderType: "other",
        vnp_Locale: "vn",
        vnp_ReturnUrl: returnUrl,
        vnp_IpAddr: "127.0.0.1",
        vnp_CreateDate: createDate,
        vnp_ExpireDate: expireDate,
    };
    const sortedQuery = buildSortedQuery(params);
    const secureHash = hmacSha512(hashSecret, sortedQuery);
    const redirectUrl = `${apiUrl}?${sortedQuery}&vnp_SecureHash=${secureHash}`;
    await patchPaymentSession(sessionRef.id, {
        paymentUrl: redirectUrl,
        responsePayload: {
            redirectUrl,
            sessionId: sessionRef.id,
            providerTxnRef: sessionRef.id,
        },
    });
    return {
        redirectUrl,
        providerTxnRef: sessionRef.id,
        paymentSessionId: sessionRef.id,
    };
}
async function handleMomoInit(req, body) {
    ensureConfigured("momo");
    const cfg = getPaymentCredentials("momo");
    const orderCode = body.orderCode || body.orderId;
    const amount = asNumber(body.amount, 0);
    const returnUrl = body.redirectUrl || body.returnUrl || body.return_url;
    if (!orderCode || amount <= 0 || !returnUrl) {
        throw new Error("Thiếu orderCode, amount hoặc returnUrl");
    }
    const sessionRef = await createPaymentSession({
        orderCode,
        provider: "momo",
        amount,
        currency: asString(body.currency, "VND"),
        returnUrl,
        cancelUrl: body.cancelUrl || body.cancel_url || undefined,
        requestPayload: {
            orderCode,
            amount,
            description: body.orderInfo || body.description || "",
            returnUrl,
            buyerEmail: body.buyerEmail || "",
            buyerPhone: body.buyerPhone || "",
            metadata: body.metadata ?? null,
        },
    });
    const requestId = `${sessionRef.id}_${Date.now()}`;
    const extraData = Buffer.from(JSON.stringify(body.metadata ?? {}), "utf8").toString("base64");
    const partnerCode = asString(cfg.partnerCode);
    const accessKey = asString(cfg.accessKey);
    const secretKey = asString(cfg.secretKey);
    const apiUrl = asString(cfg.apiUrl);
    const rawSignature = [
        `accessKey=${accessKey}`,
        `amount=${Math.round(amount)}`,
        `extraData=${extraData}`,
        `ipnUrl=${getWebhookUrl("momo")}`,
        `orderId=${sessionRef.id}`,
        `orderInfo=${body.orderInfo || body.description || `Thanh toan don hang ${orderCode}`}`,
        `partnerCode=${partnerCode}`,
        `redirectUrl=${returnUrl}`,
        `requestId=${requestId}`,
        `requestType=payWithMethod`,
    ].join("&");
    const signature = hmacSha256(secretKey, rawSignature);
    const payload = {
        partnerCode,
        partnerName: "ACFMart",
        storeId: "ACFMart Store",
        requestId,
        amount: Math.round(amount),
        orderId: sessionRef.id,
        orderInfo: body.orderInfo || body.description || `Thanh toan don hang ${orderCode}`,
        redirectUrl: returnUrl,
        ipnUrl: getWebhookUrl("momo"),
        lang: "vi",
        requestType: "payWithMethod",
        autoCapture: true,
        extraData,
        signature,
    };
    const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        throw new Error(`MoMo HTTP ${res.status}`);
    }
    if (!data?.payUrl) {
        throw new Error(data?.message ?? "MoMo trả về thiếu payUrl");
    }
    const redirectUrl = data.payUrl;
    await patchPaymentSession(sessionRef.id, {
        providerTxnId: String(data.transId ?? sessionRef.id),
        paymentUrl: redirectUrl,
        responsePayload: data,
    });
    return {
        redirectUrl,
        providerTxnRef: sessionRef.id,
        paymentSessionId: sessionRef.id,
        qrCodeData: data.qrCodeUrl,
        deeplink: data.deeplink,
    };
}
async function handleZaloInit(req, body) {
    ensureConfigured("zalopay");
    const cfg = getPaymentCredentials("zalopay");
    const orderCode = body.orderCode || body.orderId;
    const amount = asNumber(body.amount, 0);
    const returnUrl = body.embed_data && typeof body.embed_data === "object"
        ? asString(body.embed_data.redirecturl)
        : body.returnUrl || body.return_url || body.redirectUrl;
    if (!orderCode || amount <= 0 || !returnUrl) {
        throw new Error("Thiếu orderCode, amount hoặc returnUrl");
    }
    const sessionRef = await createPaymentSession({
        orderCode,
        provider: "zalopay",
        amount,
        currency: asString(body.currency, "VND"),
        returnUrl,
        cancelUrl: body.cancelUrl || body.cancel_url || undefined,
        requestPayload: {
            orderCode,
            amount,
            description: body.orderInfo || body.description || "",
            returnUrl,
            buyerEmail: body.buyerEmail || "",
            buyerPhone: body.buyerPhone || "",
            metadata: body.metadata ?? null,
        },
    });
    const appTime = Date.now();
    const dateStr = new Date(appTime).toISOString().slice(2, 10).replace(/-/g, "");
    const appTransId = `${dateStr}_${sessionRef.id}`;
    const appId = asString(cfg.appId);
    const key1 = asString(cfg.key1);
    const appUser = asString(body.app_user, body.buyerEmail || body.buyerPhone || "guest");
    const embedData = typeof body.embed_data === "string"
        ? body.embed_data
        : JSON.stringify({
            redirecturl: returnUrl,
            ...(body.metadata ?? {}),
        });
    const item = "[]";
    const rawSignature = `${appId}|${appTransId}|${appUser}|${Math.round(amount)}|${appTime}|${embedData}|${item}`;
    const mac = hmacSha256(key1, rawSignature);
    const payload = {
        app_id: Number(appId),
        app_trans_id: appTransId,
        app_user: appUser,
        app_time: appTime,
        amount: Math.round(amount),
        item,
        embed_data: embedData,
        description: body.orderInfo || body.description || `Thanh toan don hang ${orderCode}`,
        bank_code: "",
        callback_url: getWebhookUrl("zalopay"),
        mac,
    };
    const apiUrl = asString(cfg.apiUrl);
    const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        throw new Error(`ZaloPay HTTP ${res.status}`);
    }
    if (Number(data?.return_code ?? 0) !== 1) {
        throw new Error(data?.return_message ?? "ZaloPay từ chối khởi tạo giao dịch");
    }
    const redirectUrl = asString(data.order_url);
    await patchPaymentSession(sessionRef.id, {
        providerExternalTxnRef: appTransId,
        providerTxnId: String(data.zp_trans_token ?? sessionRef.id),
        paymentUrl: redirectUrl || null,
        responsePayload: data,
    });
    return {
        redirectUrl: redirectUrl || undefined,
        providerTxnRef: sessionRef.id,
        paymentSessionId: sessionRef.id,
        qrData: asString(data.qr_code) || undefined,
        deeplink: data.zp_trans_token ? `zalopay://app?token=${data.zp_trans_token}` : undefined,
    };
}
function isSuccessStatus(provider, body) {
    if (provider === "vnpay") {
        return asString(body.vnp_ResponseCode) === "00" && asString(body.vnp_TransactionStatus) === "00";
    }
    if (provider === "momo") {
        return asNumber(body.resultCode, -1) === 0;
    }
    if (provider === "zalopay") {
        return true;
    }
    return false;
}
function normalizeWebhookProvider(provider) {
    if (provider === "vnpay" || provider === "momo" || provider === "zalopay")
        return provider;
    return null;
}
async function handlePaymentWebhook(provider, req) {
    const rawBody = req.body && typeof req.body === "object" && !Array.isArray(req.body)
        ? req.body
        : {};
    if (provider === "vnpay") {
        const body = (Object.keys(rawBody).length > 0 ? rawBody : req.query);
        const receivedHash = asString(body.vnp_SecureHash);
        const params = {};
        for (const [key, value] of Object.entries(body)) {
            if (key === "vnp_SecureHash" || key === "vnp_SecureHashType")
                continue;
            if (Array.isArray(value)) {
                params[key] = value[0] ?? "";
            }
            else if (typeof value !== "undefined" && value !== null) {
                params[key] = String(value);
            }
        }
        const cfg = getPaymentCredentials("vnpay");
        const expectedHash = hmacSha512(asString(cfg.hashSecret), buildSortedQuery(params));
        if (!timingSafeEqualHex(receivedHash.toLowerCase(), expectedHash.toLowerCase())) {
            return { accepted: false, status: "failed" };
        }
        const sessionId = asString(body.vnp_TxnRef);
        const sessionSnap = await db.collection("paymentSessions").doc(sessionId).get();
        if (!sessionSnap.exists) {
            return { accepted: false, status: "failed" };
        }
        const session = sessionSnap.data();
        const nextStatus = isSuccessStatus("vnpay", body)
            ? "paid"
            : asString(body.vnp_ResponseCode) === "24"
                ? "cancelled"
                : asString(body.vnp_ResponseCode) === "11"
                    ? "expired"
                    : "failed";
        await updatePaymentOrdersFromSession({
            sessionId,
            orderCode: session.orderCode,
            provider: "vnpay",
            nextStatus,
            providerTxnId: asString(body.vnp_TransactionNo) || undefined,
            rawPayload: body,
            note: nextStatus === "paid"
                ? "Thanh toán VNPay thành công"
                : `VNPay phản hồi: ${asString(body.vnp_ResponseCode, "unknown")}`,
        });
        return {
            accepted: true,
            status: nextStatus,
            sessionId,
            orderCode: session.orderCode,
            providerTxnId: asString(body.vnp_TransactionNo) || undefined,
        };
    }
    if (provider === "momo") {
        const body = rawBody;
        const cfg = getPaymentCredentials("momo");
        const receivedSignature = asString(body.signature);
        const rawSignature = [
            `accessKey=${cfg.accessKey}`,
            `amount=${body.amount}`,
            `extraData=${body.extraData}`,
            `message=${body.message}`,
            `orderId=${body.orderId}`,
            `orderInfo=${body.orderInfo}`,
            `orderType=${body.orderType}`,
            `partnerCode=${body.partnerCode}`,
            `payType=${body.payType}`,
            `requestId=${body.requestId}`,
            `responseTime=${body.responseTime}`,
            `resultCode=${body.resultCode}`,
            `transId=${body.transId}`,
        ].join("&");
        const expectedSignature = hmacSha256(asString(cfg.secretKey), rawSignature);
        if (!timingSafeEqualHex(receivedSignature, expectedSignature)) {
            return { accepted: false, status: "failed" };
        }
        const sessionId = asString(body.orderId);
        const sessionSnap = await db.collection("paymentSessions").doc(sessionId).get();
        if (!sessionSnap.exists) {
            return { accepted: false, status: "failed" };
        }
        const session = sessionSnap.data();
        const resultCode = asNumber(body.resultCode, -1);
        const nextStatus = resultCode === 0 ? "paid" : resultCode === 9000 ? "pending" : resultCode === 1005 ? "expired" : resultCode === 1006 ? "cancelled" : "failed";
        await updatePaymentOrdersFromSession({
            sessionId,
            orderCode: session.orderCode,
            provider: "momo",
            nextStatus,
            providerTxnId: asString(body.transId) || undefined,
            rawPayload: body,
            note: nextStatus === "paid"
                ? "Thanh toán MoMo thành công"
                : `MoMo phản hồi: ${asString(body.message, "unknown")}`,
        });
        return {
            accepted: true,
            status: nextStatus,
            sessionId,
            orderCode: session.orderCode,
            providerTxnId: asString(body.transId) || undefined,
        };
    }
    const body = rawBody;
    const cfg = getPaymentCredentials("zalopay");
    const key2 = asString(cfg.key2);
    const data = asString(body.data);
    const receivedMac = asString(body.mac);
    const expectedMac = hmacSha256(key2, data);
    if (!timingSafeEqualHex(receivedMac, expectedMac)) {
        return { accepted: false, status: "failed" };
    }
    let parsed = {};
    try {
        parsed = JSON.parse(data);
    }
    catch {
        return { accepted: false, status: "failed" };
    }
    const appTransId = asString(parsed.app_trans_id);
    const sessionId = appTransId.includes("_") ? appTransId.split("_").slice(1).join("_") : appTransId;
    const sessionSnap = await db.collection("paymentSessions").doc(sessionId).get();
    if (!sessionSnap.exists) {
        return { accepted: false, status: "failed" };
    }
    const session = sessionSnap.data();
    await updatePaymentOrdersFromSession({
        sessionId,
        orderCode: session.orderCode,
        provider: "zalopay",
        nextStatus: "paid",
        providerTxnId: asString(parsed.zp_trans_id) || undefined,
        rawPayload: parsed,
        note: "Thanh toán ZaloPay thành công",
    });
    return {
        accepted: true,
        status: "paid",
        sessionId,
        orderCode: session.orderCode,
        providerTxnId: asString(parsed.zp_trans_id) || undefined,
    };
}
async function handleStatusLookup(paymentId) {
    const sessionSnap = await db.collection("paymentSessions").doc(paymentId).get();
    if (sessionSnap.exists) {
        const session = sessionSnap.data();
        return {
            status: session.status === "paid" ? "confirmed" : session.status,
            transactionId: session.providerTxnId ?? session.id,
            amount: session.amount,
            currency: session.currency,
            paymentMethod: session.provider,
            paidAt: session.paidAt?.toDate?.()?.toISOString?.(),
        };
    }
    const fallback = await db
        .collection("paymentSessions")
        .where("providerTxnId", "==", paymentId)
        .limit(1)
        .get();
    if (!fallback.empty) {
        const session = fallback.docs[0].data();
        return {
            status: session.status === "paid" ? "confirmed" : session.status,
            transactionId: session.providerTxnId ?? session.id,
            amount: session.amount,
            currency: session.currency,
            paymentMethod: session.provider,
            paidAt: session.paidAt?.toDate?.()?.toISOString?.(),
        };
    }
    const orderSnap = await db
        .collection("orders")
        .where("code", "==", paymentId)
        .limit(1)
        .get();
    if (!orderSnap.empty) {
        const order = orderSnap.docs[0].data();
        return {
            status: asString(order.paymentStatus) === "paid" ? "confirmed" : "pending",
            transactionId: asString(order.paymentProviderTxnRef, paymentId),
            amount: asNumber(order.total, 0),
            currency: "VND",
            paymentMethod: asString(order.paymentMethod),
            paidAt: asString(order.paymentConfirmedAt) || undefined,
        };
    }
    return null;
}
async function handleRefund(body) {
    const paymentId = asString(body.paymentId ?? body.payment_id);
    const amount = asNumber(body.amount, 0);
    const reason = asString(body.reason);
    if (!paymentId || amount <= 0 || !reason) {
        throw new Error("Thiếu paymentId, amount hoặc reason");
    }
    const sessionSnap = await db.collection("paymentSessions").doc(paymentId).get();
    if (!sessionSnap.exists) {
        throw new Error("Không tìm thấy payment session");
    }
    const session = sessionSnap.data();
    await patchPaymentSession(paymentId, {
        status: "refunded",
        responsePayload: {
            refundRequested: true,
            reason,
            amount,
        },
    });
    await updateOrdersByCode(session.orderCode, (data) => ({
        paymentStatus: "refunded",
        paymentRefundReason: reason,
        paymentRefundAmount: amount,
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
        timeline: admin.firestore.FieldValue.arrayUnion({
            status: "refunded",
            timestamp: new Date().toISOString(),
            note: `Hoàn tiền: ${reason}`,
        }),
    }));
    return {
        success: true,
        refundId: `refund_${paymentId}_${Date.now()}`,
        status: "pending",
        message: "Refund request đã được ghi nhận. Hệ thống carrier/finance sẽ xử lý theo policy.",
    };
}
exports.paymentApi = (0, https_1.onRequest)({ region, cors: false }, async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-publishable-api-key, idempotency-key");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    if (req.method === "OPTIONS") {
        res.status(204).send("");
        return;
    }
    try {
        const path = req.path.replace(/\/+$/, "") || "/";
        if (req.method === "GET" && path === "/store/payment/methods") {
            res.json({ success: true, methods: paymentMethods() });
            return;
        }
        if (req.method === "POST" && path === "/store/payment/vnpay/sign") {
            const result = await handleVnpayInit(req, normalizeBody(req.body));
            res.json({ success: true, ...result });
            return;
        }
        if (req.method === "POST" && path === "/store/payment/momo/init") {
            const result = await handleMomoInit(req, normalizeBody(req.body));
            res.json({ success: true, ...result });
            return;
        }
        if (req.method === "POST" && path === "/store/payment/zalopay/init") {
            const result = await handleZaloInit(req, normalizeBody(req.body));
            res.json({ success: true, ...result });
            return;
        }
        const webhookMatch = path.match(/^\/store\/payment\/webhook\/([^/]+)$/);
        if (webhookMatch && (req.method === "POST" || req.method === "GET")) {
            const provider = normalizeWebhookProvider(webhookMatch[1] ?? "");
            if (!provider) {
                res.status(404).json({ success: false, message: "Provider không hỗ trợ" });
                return;
            }
            const result = await handlePaymentWebhook(provider, req);
            if (provider === "vnpay") {
                res.status(200).json({
                    RspCode: result.accepted ? "00" : "97",
                    Message: result.accepted ? "Confirm Success" : "Invalid Signature",
                });
                return;
            }
            if (provider === "momo") {
                res.status(result.accepted ? 204 : 401).send("");
                return;
            }
            res.status(200).json({
                return_code: result.accepted ? 1 : 2,
                return_message: result.accepted ? "Success" : "Invalid",
            });
            return;
        }
        const statusMatch = path.match(/^\/store\/payment\/status\/([^/]+)$/);
        if (req.method === "GET" && statusMatch) {
            const paymentId = decodeURIComponent(statusMatch[1] ?? "");
            const status = await handleStatusLookup(paymentId);
            if (!status) {
                res.status(404).json({ success: false, message: "Không tìm thấy payment session" });
                return;
            }
            res.json({ success: true, ...status });
            return;
        }
        if (req.method === "POST" && path === "/store/payment/refund") {
            const result = await handleRefund(normalizeBody(req.body));
            res.json(result);
            return;
        }
        if (req.method === "POST" && path === "/store/payment/webhook/validate") {
            res.json({ success: true, valid: true });
            return;
        }
        res.status(404).json({ success: false, message: "Endpoint payment không tồn tại" });
    }
    catch (error) {
        console.error("Payment API error:", error);
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : "Lỗi server nội bộ",
        });
    }
});
//# sourceMappingURL=payments.js.map