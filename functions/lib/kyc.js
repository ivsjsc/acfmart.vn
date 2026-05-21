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
exports.vnptEkycWebhook = exports.startVendorKyc = void 0;
const https_1 = require("firebase-functions/v2/https");
const params_1 = require("firebase-functions/params");
const admin = __importStar(require("firebase-admin"));
const region = "asia-southeast1";
const db = () => admin.firestore();
const vnptApiKey = (0, params_1.defineSecret)("VNPT_EKYC_API_KEY");
const vnptWebhookSecret = (0, params_1.defineSecret)("VNPT_EKYC_WEBHOOK_SECRET");
const ACTIVE_KYC_STATUSES = ["draft", "submitted", "provider_pending"];
function env(name, fallback = "") {
    return (process.env[name] ?? fallback).trim();
}
function boolEnv(name, fallback = false) {
    const raw = env(name);
    if (!raw)
        return fallback;
    return ["1", "true", "yes", "on"].includes(raw.toLowerCase());
}
function requireAuth(uid) {
    if (!uid)
        throw new https_1.HttpsError("unauthenticated", "Bạn cần đăng nhập");
    return uid;
}
function requireValue(name, value) {
    const trimmed = value?.trim() ?? "";
    if (!trimmed) {
        throw new https_1.HttpsError("failed-precondition", `Thiếu cấu hình ${name} cho VNPT eKYC.`);
    }
    return trimmed;
}
function normalizeProvider(value) {
    return value === "fpt" ? "fpt" : value === "manual" ? "manual" : "vnpt";
}
function normalizeKycLevel(value, fallback = "verified") {
    return value === "basic" || value === "verified" || value === "premium" || value === "none"
        ? value
        : fallback;
}
function normalizeStatus(value) {
    const raw = String(value ?? "").trim().toLowerCase();
    if (!raw)
        return "provider_pending";
    if (["approved", "verified", "success", "passed", "done", "complete", "completed"].includes(raw)) {
        return "approved";
    }
    if (["rejected", "reject", "declined", "denied", "mismatch", "failed-check"].includes(raw)) {
        return "rejected";
    }
    if (["expired", "timeout", "timed_out", "time_out", "stale"].includes(raw)) {
        return "expired";
    }
    if (["failed", "error", "exception", "internal_error", "system_error"].includes(raw)) {
        return "failed";
    }
    if (["draft", "created"].includes(raw)) {
        return "draft";
    }
    if (["submitted", "pending", "processing", "in_review", "reviewing", "waiting"].includes(raw)) {
        return "submitted";
    }
    return "provider_pending";
}
function rankKycLevel(level) {
    switch (level) {
        case "premium":
            return 3;
        case "verified":
            return 2;
        case "basic":
            return 1;
        default:
            return 0;
    }
}
function upgradeKycLevel(current, next) {
    const existing = current ?? "none";
    return rankKycLevel(next) > rankKycLevel(existing) ? next : existing;
}
function getRequiredVendorDocumentTypes(vendor) {
    const required = [
        "seller_registration_form",
        "seller_contract",
        "id_card_front",
        "id_card_back",
    ];
    if (vendor.business_type !== "individual") {
        required.push("business_license");
    }
    if (vendor.requires_special_license) {
        required.push("special_goods_license");
    }
    return required;
}
function getMissingVendorDocuments(vendor) {
    const existing = new Set((vendor.documents ?? []).map((doc) => doc.type).filter(Boolean));
    return getRequiredVendorDocumentTypes(vendor).filter((type) => !existing.has(type));
}
function toObject(value) {
    if (!value || typeof value !== "object" || Array.isArray(value))
        return null;
    return value;
}
function pickString(value) {
    if (typeof value !== "string")
        return null;
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
}
function pickFirstString(...values) {
    for (const value of values) {
        const picked = pickString(value);
        if (picked)
            return picked;
    }
    return null;
}
function readNestedString(source, path) {
    let cursor = source;
    for (const segment of path) {
        cursor = toObject(cursor)?.[segment];
    }
    return pickString(cursor);
}
function readNestedObject(source, path) {
    let cursor = source;
    for (const segment of path) {
        cursor = toObject(cursor)?.[segment];
    }
    return toObject(cursor);
}
function normalizeWebhookPayload(payload) {
    const obj = toObject(payload) ?? {};
    const container = toObject(obj.data) ??
        toObject(obj.result) ??
        obj;
    const providerStatus = normalizeStatus(pickFirstString(obj.status, obj.verification_status, obj.result_status, container.status, container.verification_status, container.result_status, container.state));
    return {
        raw: obj,
        container,
        providerStatus,
        providerApplicationId: pickFirstString(obj.application_id, obj.applicationId, obj.request_id, obj.requestId, obj.session_id, obj.sessionId, obj.transaction_id, obj.transactionId, obj.reference_id, obj.referenceId, container.application_id, container.applicationId, container.request_id, container.requestId, container.session_id, container.sessionId, container.reference_id, container.referenceId),
        vendorId: pickFirstString(obj.vendor_id, obj.vendorId, container.vendor_id, container.vendorId),
        firebaseUid: pickFirstString(obj.firebase_uid, obj.firebaseUid, container.firebase_uid, container.firebaseUid),
        fullName: pickFirstString(container.full_name, container.fullName, readNestedString(container, ["customer", "full_name"]), readNestedString(container, ["customer", "fullName"])),
        idNumber: pickFirstString(container.id_number, container.idNumber, container.identity_number, readNestedString(container, ["customer", "id_number"]), readNestedString(container, ["customer", "identity_number"])),
        idNumberMasked: pickFirstString(container.id_number_masked, container.idNumberMasked, container.masked_id_number),
        faceMatchScore: Number(pickFirstString(container.face_match_score, container.faceMatchScore, container.face_score, readNestedString(container, ["scores", "face_match"])) ?? ""),
        livenessScore: Number(pickFirstString(container.liveness_score, container.livenessScore, container.live_score, readNestedString(container, ["scores", "liveness"])) ?? ""),
        providerMessage: pickFirstString(obj.message, obj.provider_message, obj.providerMessage, container.message, container.provider_message, container.providerMessage, readNestedString(container, ["result", "message"])),
        providerCode: pickFirstString(obj.code, obj.error_code, obj.errorCode, container.code, container.error_code, container.errorCode),
        resultRaw: readNestedObject(container, ["result"]) ?? readNestedObject(obj, ["result"]),
    };
}
async function getLatestApplicationForVendor(vendorId) {
    const snap = await db()
        .collection("kycApplications")
        .where("vendor_id", "==", vendorId)
        .limit(10)
        .get();
    if (snap.empty)
        return null;
    const records = snap.docs.map((docSnap) => ({
        ...docSnap.data(),
        ref: docSnap.ref,
        id: docSnap.id,
    }));
    records.sort((a, b) => (b.updated_at?.toMillis?.() ??
        b.created_at?.toMillis?.() ??
        0) -
        (a.updated_at?.toMillis?.() ??
            a.created_at?.toMillis?.() ??
            0));
    return records[0] ?? null;
}
function buildStartPayload(params) {
    return {
        reference_id: params.applicationId,
        application_id: params.applicationId,
        request_id: params.applicationId,
        vendor_id: params.vendor.id,
        firebase_uid: params.vendor.firebase_uid,
        return_url: params.returnUrl,
        webhook_url: params.webhookUrl,
        provider: "vnpt",
        requested_level: params.requestedLevel,
        customer: {
            full_name: params.vendor.owner_name,
            phone: params.vendor.owner_phone,
            email: params.vendor.owner_email,
        },
        shop: {
            id: params.vendor.id,
            name: params.vendor.shop_name,
            slug: params.vendor.shop_slug,
        },
        metadata: {
            source: "acfmart",
            flow: "seller_kyc",
        },
    };
}
async function vnptStartSession(body) {
    const apiBaseUrl = requireValue("VNPT_EKYC_API_BASE_URL", env("VNPT_EKYC_API_BASE_URL"));
    const startPath = requireValue("VNPT_EKYC_START_PATH", env("VNPT_EKYC_START_PATH"));
    const apiKey = requireValue("VNPT_EKYC_API_KEY", vnptApiKey.value());
    const authHeader = env("VNPT_EKYC_AUTH_HEADER", "x-api-key");
    const authPrefix = env("VNPT_EKYC_AUTH_PREFIX");
    const timeoutMs = Number(env("VNPT_EKYC_TIMEOUT_MS", "20000")) || 20000;
    const url = new URL(startPath, apiBaseUrl).toString();
    const headers = {
        "Content-Type": "application/json",
    };
    headers[authHeader] = authPrefix ? `${authPrefix}${apiKey}` : apiKey;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const response = await fetch(url, {
            method: "POST",
            headers,
            body: JSON.stringify(body),
            signal: controller.signal,
        });
        const text = await response.text();
        let parsed = null;
        if (text) {
            try {
                parsed = JSON.parse(text);
            }
            catch {
                parsed = text;
            }
        }
        if (!response.ok) {
            throw new https_1.HttpsError("internal", `VNPT eKYC trả lỗi HTTP ${response.status}.`);
        }
        return parsed;
    }
    finally {
        clearTimeout(timer);
    }
}
async function upsertVendorKycState(vendorRef, patch) {
    await vendorRef.set({
        ...patch,
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
}
async function writeAuditLog(entry) {
    await db().collection("auditLogs").add({
        ...entry,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
    });
}
async function syncApprovedSellerRole(vendor, actor) {
    const userRef = db().collection("users").doc(vendor.firebase_uid);
    const userSnap = await userRef.get();
    if (!userSnap.exists)
        return;
    const currentRole = String(userSnap.data()?.role ?? "customer").toLowerCase();
    if (["owner", "admin", "moderator"].includes(currentRole))
        return;
    await userRef.set({
        role: "seller",
        email: vendor.owner_email,
        name: vendor.owner_name,
        phone: vendor.owner_phone,
        seller_vendor_id: vendor.id,
        shop_name: vendor.shop_name,
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
    await writeAuditLog({
        action: "role_change",
        actor_id: actor.id,
        actor_email: actor.email,
        actor_role: actor.role,
        target_type: "user",
        target_id: vendor.firebase_uid,
        details: {
            old_role: currentRole,
            new_role: "seller",
            source: "vendor_kyc_auto_activate",
            vendor_id: vendor.id,
        },
    });
}
exports.startVendorKyc = (0, https_1.onCall)({
    region,
    secrets: [vnptApiKey],
}, async (request) => {
    const uid = requireAuth(request.auth?.uid);
    const vendorId = pickString(request.data?.vendorId);
    if (!vendorId) {
        throw new https_1.HttpsError("invalid-argument", "Thiếu vendorId");
    }
    const provider = normalizeProvider(request.data?.provider);
    const requestedLevel = normalizeKycLevel(request.data?.requestedLevel);
    const returnUrl = pickString(request.data?.returnUrl) ??
        env("VNPT_EKYC_RETURN_URL") ??
        `${request.rawRequest.headers.origin ?? ""}/seller/kyc`;
    const webhookUrl = env("VNPT_EKYC_WEBHOOK_URL");
    const mockMode = boolEnv("VNPT_EKYC_MOCK_MODE", false);
    const vendorRef = db().collection("vendors").doc(vendorId);
    const vendorSnap = await vendorRef.get();
    if (!vendorSnap.exists) {
        throw new https_1.HttpsError("not-found", "Không tìm thấy hồ sơ seller");
    }
    const vendor = { ...vendorSnap.data(), id: vendorSnap.id };
    if (vendor.firebase_uid !== uid) {
        throw new https_1.HttpsError("permission-denied", "Bạn không phải chủ hồ sơ này");
    }
    if (vendor.status === "suspended" || vendor.status === "rejected") {
        throw new https_1.HttpsError("failed-precondition", "Hồ sơ seller đang bị giới hạn nên chưa thể bắt đầu eKYC.");
    }
    const latestApplication = await getLatestApplicationForVendor(vendor.id);
    if (latestApplication && ACTIVE_KYC_STATUSES.includes(latestApplication.status)) {
        return {
            applicationId: latestApplication.id,
            provider: latestApplication.provider,
            status: latestApplication.status,
            launchUrl: latestApplication.launch_url ?? null,
            message: latestApplication.provider_message ?? null,
            application: latestApplication,
        };
    }
    const applicationRef = db().collection("kycApplications").doc();
    const now = admin.firestore.FieldValue.serverTimestamp();
    const baseApplication = {
        id: applicationRef.id,
        vendor_id: vendor.id,
        firebase_uid: vendor.firebase_uid,
        provider,
        status: "draft",
        requested_level: requestedLevel,
        provider_application_id: applicationRef.id,
        provider_reference_id: applicationRef.id,
        return_url: returnUrl,
        webhook_url: webhookUrl || null,
        created_at: now,
        updated_at: now,
    };
    await applicationRef.set(baseApplication);
    await upsertVendorKycState(vendorRef, {
        kyc_status: "draft",
        kyc_provider: provider,
        kyc_application_id: applicationRef.id,
    });
    await writeAuditLog({
        action: "vendor_kyc_start",
        actor_id: uid,
        actor_email: vendor.owner_email,
        actor_role: "seller",
        target_type: "vendor",
        target_id: vendor.id,
        details: {
            provider,
            application_id: applicationRef.id,
            requested_level: requestedLevel,
        },
    });
    if (mockMode) {
        await applicationRef.set({
            status: "submitted",
            provider_message: "Mock mode enabled; provider integration is not configured.",
            submitted_at: admin.firestore.FieldValue.serverTimestamp(),
            updated_at: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
        await upsertVendorKycState(vendorRef, {
            kyc_status: "submitted",
            kyc_provider: provider,
            kyc_application_id: applicationRef.id,
        });
        await writeAuditLog({
            action: "vendor_kyc_submit",
            actor_id: uid,
            actor_email: vendor.owner_email,
            actor_role: "seller",
            target_type: "kycApplication",
            target_id: applicationRef.id,
            details: {
                provider,
                mock_mode: true,
            },
        });
        return {
            applicationId: applicationRef.id,
            provider,
            status: "submitted",
            message: "VNPT eKYC đang chạy ở chế độ mock.",
            application: {
                ...baseApplication,
                status: "submitted",
                provider_message: "VNPT eKYC đang chạy ở chế độ mock.",
            },
        };
    }
    const requestBody = buildStartPayload({
        applicationId: applicationRef.id,
        returnUrl,
        webhookUrl,
        vendor,
        requestedLevel,
    });
    try {
        const response = await vnptStartSession(requestBody);
        const responseObject = toObject(response) ?? {};
        const responseData = toObject(responseObject.data) ??
            toObject(responseObject.result) ??
            responseObject;
        const normalizedStatus = normalizeStatus(pickFirstString(responseObject.status, responseObject.verification_status, responseData.status, responseData.verification_status));
        const launchUrl = pickFirstString(responseObject.launchUrl, responseObject.launch_url, responseObject.redirectUrl, responseObject.redirect_url, responseObject.url, responseData.launchUrl, responseData.launch_url, responseData.redirectUrl, responseData.redirect_url, responseData.url);
        const providerApplicationId = pickFirstString(responseObject.application_id, responseObject.applicationId, responseObject.request_id, responseObject.requestId, responseObject.session_id, responseObject.sessionId, responseObject.reference_id, responseObject.referenceId, responseData.application_id, responseData.applicationId, responseData.request_id, responseData.requestId, responseData.session_id, responseData.sessionId, responseData.reference_id, responseData.referenceId);
        const providerMessage = pickFirstString(responseObject.message, responseObject.provider_message, responseData.message, responseData.provider_message);
        const nextStatus = launchUrl ? "submitted" : normalizedStatus;
        await applicationRef.set({
            status: nextStatus,
            provider_application_id: providerApplicationId ?? applicationRef.id,
            launch_url: launchUrl,
            provider_message: providerMessage,
            submitted_at: admin.firestore.FieldValue.serverTimestamp(),
            updated_at: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
        await upsertVendorKycState(vendorRef, {
            kyc_status: nextStatus,
            kyc_provider: provider,
            kyc_application_id: applicationRef.id,
        });
        await writeAuditLog({
            action: "vendor_kyc_submit",
            actor_id: uid,
            actor_email: vendor.owner_email,
            actor_role: "seller",
            target_type: "kycApplication",
            target_id: applicationRef.id,
            details: {
                provider,
                launch_url: Boolean(launchUrl),
                provider_application_id: providerApplicationId ?? applicationRef.id,
            },
        });
        return {
            applicationId: applicationRef.id,
            provider,
            status: nextStatus,
            launchUrl,
            message: providerMessage,
            application: {
                ...baseApplication,
                status: nextStatus,
                provider_application_id: providerApplicationId ?? applicationRef.id,
                launch_url: launchUrl ?? null,
                provider_message: providerMessage ?? null,
            },
        };
    }
    catch (error) {
        await applicationRef.set({
            status: "failed",
            provider_message: error instanceof Error ? error.message : "VNPT eKYC request failed",
            failed_at: admin.firestore.FieldValue.serverTimestamp(),
            updated_at: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
        await upsertVendorKycState(vendorRef, {
            kyc_status: "failed",
            kyc_provider: provider,
            kyc_application_id: applicationRef.id,
        });
        await writeAuditLog({
            action: "vendor_kyc_status_change",
            actor_id: uid,
            actor_email: vendor.owner_email,
            actor_role: "seller",
            target_type: "kycApplication",
            target_id: applicationRef.id,
            details: {
                provider,
                status: "failed",
            },
        });
        throw new https_1.HttpsError("internal", "Không thể khởi tạo VNPT eKYC vào lúc này.");
    }
});
exports.vnptEkycWebhook = (0, https_1.onRequest)({
    region,
    cors: false,
    secrets: [vnptWebhookSecret],
}, async (req, res) => {
    if (req.method !== "POST") {
        res.status(405).json({ error: "Method not allowed" });
        return;
    }
    const configuredSecret = vnptWebhookSecret.value().trim();
    if (configuredSecret) {
        const providedSecret = pickString(req.query.secret) ??
            pickString(req.header("x-vnpt-webhook-secret")) ??
            pickString(req.header("x-webhook-secret")) ??
            pickString(req.header("authorization"))?.replace(/^Bearer\s+/i, "") ??
            pickString(req.header("Webhook-Signature"));
        if (!providedSecret || providedSecret !== configuredSecret) {
            res.status(401).json({ error: "Invalid webhook secret" });
            return;
        }
    }
    const payload = normalizeWebhookPayload(req.body);
    const referenceId = payload.providerApplicationId;
    if (!referenceId) {
        res.status(400).json({ error: "Missing reference id" });
        return;
    }
    const applicationSnapById = await db().collection("kycApplications").doc(referenceId).get();
    let applicationRef = applicationSnapById.ref;
    let applicationData = applicationSnapById.exists
        ? { ...applicationSnapById.data(), id: applicationSnapById.id }
        : null;
    if (!applicationData) {
        const byProviderId = await db()
            .collection("kycApplications")
            .where("provider_application_id", "==", referenceId)
            .limit(1)
            .get();
        if (!byProviderId.empty) {
            const docSnap = byProviderId.docs[0];
            applicationRef = docSnap.ref;
            applicationData = { ...docSnap.data(), id: docSnap.id };
        }
    }
    if (!applicationData && payload.vendorId) {
        const latest = await getLatestApplicationForVendor(payload.vendorId);
        if (latest) {
            applicationRef = latest.ref;
            applicationData = { ...latest, id: latest.id };
        }
    }
    if (!applicationData) {
        res.status(404).json({ error: "KYC application not found" });
        return;
    }
    const nextStatus = payload.providerStatus;
    const resultSummary = payload.fullName || payload.idNumber || payload.idNumberMasked
        ? {
            full_name: payload.fullName ?? null,
            id_number: payload.idNumber ?? null,
            id_number_masked: payload.idNumberMasked ?? null,
            face_match_score: Number.isFinite(payload.faceMatchScore) ? payload.faceMatchScore : null,
            liveness_score: Number.isFinite(payload.livenessScore) ? payload.livenessScore : null,
        }
        : null;
    const applicationPatch = {
        status: nextStatus,
        provider_message: payload.providerMessage,
        provider_code: payload.providerCode,
        result: resultSummary,
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
    };
    if (nextStatus === "approved") {
        applicationPatch.verified_at = admin.firestore.FieldValue.serverTimestamp();
    }
    if (nextStatus === "rejected") {
        applicationPatch.rejected_at = admin.firestore.FieldValue.serverTimestamp();
    }
    if (nextStatus === "expired") {
        applicationPatch.expired_at = admin.firestore.FieldValue.serverTimestamp();
    }
    if (nextStatus === "failed") {
        applicationPatch.failed_at = admin.firestore.FieldValue.serverTimestamp();
    }
    await applicationRef.set(applicationPatch, { merge: true });
    const vendorSnap = await db().collection("vendors").doc(applicationData.vendor_id).get();
    if (vendorSnap.exists) {
        const vendor = { ...vendorSnap.data(), id: vendorSnap.id };
        const vendorPatch = {
            kyc_status: nextStatus,
            kyc_provider: applicationData.provider,
            kyc_application_id: applicationData.id,
            updated_at: admin.firestore.FieldValue.serverTimestamp(),
        };
        if (nextStatus === "approved") {
            const upgradedLevel = upgradeKycLevel(vendor.kyc_level, "verified");
            vendorPatch.kyc_level = upgradedLevel;
            vendorPatch.kyc_verified_at = admin.firestore.FieldValue.serverTimestamp();
            if (boolEnv("VNPT_EKYC_AUTO_APPROVE_VENDOR", false)) {
                const missing = getMissingVendorDocuments(vendor);
                if (missing.length === 0 && vendor.status !== "active") {
                    vendorPatch.status = "active";
                    vendorPatch.verified_at = admin.firestore.FieldValue.serverTimestamp();
                    await syncApprovedSellerRole(vendor, {
                        id: applicationData.firebase_uid,
                        email: vendor.owner_email,
                        role: "seller",
                    });
                }
            }
        }
        await db().collection("vendors").doc(vendor.id).set(vendorPatch, { merge: true });
    }
    await writeAuditLog({
        action: "vendor_kyc_status_change",
        actor_id: applicationData.firebase_uid,
        actor_email: "",
        actor_role: "seller",
        target_type: "kycApplication",
        target_id: applicationData.id,
        details: {
            provider: applicationData.provider,
            status: nextStatus,
            provider_application_id: applicationData.provider_application_id ?? referenceId,
        },
    });
    res.json({
        ok: true,
        applicationId: applicationData.id,
        status: nextStatus,
    });
});
//# sourceMappingURL=kyc.js.map