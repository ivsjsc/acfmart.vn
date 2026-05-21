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
exports.ghtkWebhook = exports.registerShipment = void 0;
const https_1 = require("firebase-functions/v2/https");
const admin = __importStar(require("firebase-admin"));
const db = admin.firestore();
const GHTK_WEBHOOK_HASH = (process.env.GHTK_WEBHOOK_HASH ?? "").trim();
function asString(value, fallback = "") {
    return typeof value === "string" && value.trim() ? value.trim() : fallback;
}
function asNumber(value, fallback = 0) {
    const num = typeof value === "number" ? value : Number(value);
    return Number.isFinite(num) ? num : fallback;
}
function normalizeWebhookBody(req) {
    if (req.body && typeof req.body === "object" && !Array.isArray(req.body)) {
        return req.body;
    }
    const raw = typeof req.body === "string"
        ? req.body
        : req.rawBody?.toString("utf8") ?? "";
    if (!raw.trim())
        return {};
    const params = new URLSearchParams(raw);
    return {
        label_id: params.get("label_id") ?? undefined,
        partner_id: params.get("partner_id") ?? undefined,
        status_id: params.get("status_id") ?? undefined,
        action_time: params.get("action_time") ?? undefined,
        reason_code: params.get("reason_code") ?? undefined,
        reason: params.get("reason") ?? undefined,
        weight: params.get("weight") ?? undefined,
        fee: params.get("fee") ?? undefined,
        pick_money: params.get("pick_money") ?? undefined,
        return_part_package: params.get("return_part_package") ?? undefined,
    };
}
function mapGhtkStatus(statusId) {
    switch (statusId) {
        case -1:
            return { orderStatus: "cancelled", label: "Hủy đơn hàng" };
        case 1:
            return { orderStatus: "ready_pickup", label: "Chưa tiếp nhận" };
        case 2:
            return { orderStatus: "ready_pickup", label: "Đã tiếp nhận" };
        case 3:
            return { orderStatus: "shipping", label: "Đã lấy hàng / Đã nhập kho" };
        case 4:
            return { orderStatus: "shipping", label: "Đang giao hàng" };
        case 5:
            return { orderStatus: "delivered", label: "Đã giao hàng" };
        case 6:
            return { orderStatus: "completed", label: "Đã đối soát" };
        case 7:
            return { orderStatus: "ready_pickup", label: "Không lấy được hàng" };
        case 8:
            return { orderStatus: "ready_pickup", label: "Hoãn lấy hàng" };
        case 9:
            return { orderStatus: "shipping", label: "Không giao được hàng" };
        case 10:
            return { orderStatus: "shipping", label: "Delay giao hàng" };
        case 11:
            return { orderStatus: "returned", label: "Đã đối soát công nợ trả hàng" };
        case 12:
            return { orderStatus: "ready_pickup", label: "Đang lấy hàng" };
        case 13:
            return { orderStatus: "refunded", label: "Đơn hàng bồi hoàn" };
        case 20:
            return { orderStatus: "returned", label: "Đang trả hàng" };
        case 21:
            return { orderStatus: "returned", label: "Đã trả hàng" };
        case 123:
            return { orderStatus: "ready_pickup", label: "Shipper báo đã lấy hàng" };
        case 127:
            return { orderStatus: "ready_pickup", label: "Shipper báo không lấy được hàng" };
        case 128:
            return { orderStatus: "ready_pickup", label: "Shipper báo hoãn lấy hàng" };
        case 45:
            return { orderStatus: "delivered", label: "Shipper báo giao thành công" };
        case 49:
            return { orderStatus: "shipping", label: "Shipper báo giao thất bại" };
        case 410:
            return { orderStatus: "shipping", label: "Shipper báo giao delay" };
        default:
            return { label: "Không xác định" };
    }
}
async function updateOrdersByParentCode(parentCode, updater) {
    const collection = db.collection("orders");
    const primarySnap = await collection.where("parentCode", "==", parentCode).get();
    const snap = primarySnap.empty
        ? await collection.where("code", "==", parentCode).get()
        : primarySnap;
    if (snap.empty)
        return 0;
    const batch = db.batch();
    for (const docSnap of snap.docs) {
        batch.update(docSnap.ref, updater(docSnap.ref, docSnap.data()));
    }
    await batch.commit();
    return snap.size;
}
exports.registerShipment = (0, https_1.onCall)({ region: "asia-southeast1" }, async (request) => {
    if (!request.auth?.uid) {
        throw new https_1.HttpsError("unauthenticated", "Vui lòng đăng nhập để đồng bộ vận đơn");
    }
    const input = request.data;
    const orderCode = asString(input?.orderCode);
    const trackingNumber = asString(input?.trackingNumber);
    const providerId = asString(input?.providerId, "ghtk");
    const providerName = asString(input?.providerName, providerId === "ghtk" ? "Giao Hàng Tiết Kiệm (GHTK)" : providerId.toUpperCase());
    const serviceCode = asString(input?.serviceCode);
    if (!orderCode || !trackingNumber) {
        throw new https_1.HttpsError("invalid-argument", "Thiếu orderCode hoặc trackingNumber");
    }
    const updatedCount = await updateOrdersByParentCode(orderCode, (_ref, data) => {
        if (data.customerId && data.customerId !== request.auth.uid) {
            throw new https_1.HttpsError("permission-denied", "Bạn không có quyền cập nhật đơn này");
        }
        const note = asString(input?.note, `Đã tạo vận đơn ${providerName} ${trackingNumber}`);
        const paymentStatus = input?.paymentStatus === "paid" ? "paid" : "cod";
        return {
            trackingNumber,
            shippingProviderId: providerId,
            shippingProviderName: providerName,
            shippingServiceCode: serviceCode || null,
            shippingFee: asNumber(input?.fee, data.shippingFee ?? 0),
            shippingLabelUrl: asString(input?.labelUrl) || null,
            shippingUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
            shippingStatusCode: asNumber(input?.statusCode, 2),
            shippingStatusText: asString(input?.statusText, "Đã tạo vận đơn"),
            paymentStatus,
            status: "ready_pickup",
            updated_at: admin.firestore.FieldValue.serverTimestamp(),
            timeline: admin.firestore.FieldValue.arrayUnion({
                status: "ready_pickup",
                timestamp: new Date().toISOString(),
                actorId: request.auth.uid,
                note,
            }),
        };
    });
    if (updatedCount === 0) {
        throw new https_1.HttpsError("not-found", "Không tìm thấy đơn hàng cần đồng bộ vận đơn");
    }
    return {
        success: true,
        orderCode,
        trackingNumber,
        updatedCount,
    };
});
exports.ghtkWebhook = (0, https_1.onRequest)({ region: "asia-southeast1" }, async (req, res) => {
    if (req.method !== "POST") {
        res.status(405).json({ success: false, message: "Method not allowed" });
        return;
    }
    if (GHTK_WEBHOOK_HASH) {
        const queryHash = asString(req.query.hash);
        if (!queryHash || queryHash !== GHTK_WEBHOOK_HASH) {
            res.status(401).json({ success: false, message: "Invalid webhook hash" });
            return;
        }
    }
    const payload = normalizeWebhookBody(req);
    const partnerId = asString(payload.partner_id);
    const labelId = asString(payload.label_id);
    const statusId = asNumber(payload.status_id, Number.NaN);
    if (!partnerId || !labelId || !Number.isFinite(statusId)) {
        res.status(400).json({ success: false, message: "Thiếu dữ liệu webhook GHTK" });
        return;
    }
    const status = mapGhtkStatus(statusId);
    const updatedCount = await updateOrdersByParentCode(partnerId, (_ref, data) => {
        const timelineStatus = status.orderStatus ?? String(data.status ?? "shipping");
        const noteParts = [
            `GHTK: ${status.label}`,
            asString(payload.reason_code) ? `Mã lý do ${asString(payload.reason_code)}` : "",
            asString(payload.reason) ? asString(payload.reason) : "",
        ].filter(Boolean);
        return {
            trackingNumber: labelId,
            shippingProviderId: "ghtk",
            shippingProviderName: "Giao Hàng Tiết Kiệm (GHTK)",
            shippingLabelId: labelId,
            shippingStatusCode: statusId,
            shippingStatusText: status.label,
            shippingReasonCode: asString(payload.reason_code) || null,
            shippingReason: asString(payload.reason) || null,
            shippingWeight: asNumber(payload.weight, 0),
            shippingFee: asNumber(payload.fee, data.shippingFee ?? 0),
            shippingPickMoney: asNumber(payload.pick_money, 0),
            shippingReturnPartPackage: asNumber(payload.return_part_package, 0),
            shippingUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
            updated_at: admin.firestore.FieldValue.serverTimestamp(),
            ...(status.orderStatus
                ? {
                    status: timelineStatus,
                    timeline: admin.firestore.FieldValue.arrayUnion({
                        status: timelineStatus,
                        timestamp: asString(payload.action_time, new Date().toISOString()),
                        note: noteParts.join(" · "),
                    }),
                }
                : {}),
        };
    });
    if (updatedCount === 0) {
        res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng" });
        return;
    }
    res.status(200).json({
        success: true,
        updatedCount,
        partner_id: partnerId,
        label_id: labelId,
        status_id: statusId,
    });
});
//# sourceMappingURL=shipping.js.map