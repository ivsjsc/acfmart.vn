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
exports.onVendorStatusChanged = exports.onVendorRegistered = exports.zaloAuth = exports.processReturnRefund = exports.onAffiliateOrderPaid = exports.onAffiliateOrderCreated = exports.onPayoutPaid = exports.onEarlyPayoutRequest = exports.onOrderStatusChanged = exports.onOrderPaid = void 0;
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
var affiliate_1 = require("./affiliate");
Object.defineProperty(exports, "onAffiliateOrderCreated", { enumerable: true, get: function () { return affiliate_1.onAffiliateOrderCreated; } });
Object.defineProperty(exports, "onAffiliateOrderPaid", { enumerable: true, get: function () { return affiliate_1.onAffiliateOrderPaid; } });
var refunds_1 = require("./refunds");
Object.defineProperty(exports, "processReturnRefund", { enumerable: true, get: function () { return refunds_1.processReturnRefund; } });
const zaloAppSecret = (0, params_1.defineSecret)("ZALO_APP_SECRET");
const ZALO_APP_ID = "1712776410811337542";
const ZALO_TOKEN_URL = "https://oauth.zaloapp.com/v4/access_token";
const ZALO_PROFILE_URL = "https://graph.zalo.me/v2.0/me";
exports.zaloAuth = (0, https_1.onRequest)({
    cors: true,
    secrets: [zaloAppSecret],
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
        const tokenRes = await fetch(ZALO_TOKEN_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "secret_key": zaloAppSecret.value(),
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
        const profileRes = await fetch(`${ZALO_PROFILE_URL}?fields=id,name,picture`, {
            headers: { access_token: tokenData.access_token },
        });
        const profile = await profileRes.json();
        if (!profile.id) {
            res.status(401).json({ error: "Failed to get Zalo profile" });
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