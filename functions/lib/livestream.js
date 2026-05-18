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
exports.endLiveStream = exports.signPlaybackToken = exports.streamWebhook = exports.getStreamCredentials = exports.createLiveInput = void 0;
const https_1 = require("firebase-functions/v2/https");
const params_1 = require("firebase-functions/params");
const admin = __importStar(require("firebase-admin"));
const crypto = __importStar(require("crypto"));
const jwt = __importStar(require("jsonwebtoken"));
const db = () => admin.firestore();
const cloudflareAccountId = (0, params_1.defineSecret)("CLOUDFLARE_ACCOUNT_ID");
const cloudflareApiToken = (0, params_1.defineSecret)("CLOUDFLARE_API_TOKEN");
const cloudflareWebhookSecret = (0, params_1.defineSecret)("CLOUDFLARE_STREAM_WEBHOOK_SECRET");
const cloudflareSigningKeyId = (0, params_1.defineSecret)("CLOUDFLARE_STREAM_SIGNING_KEY_ID");
const cloudflareSigningPrivateKey = (0, params_1.defineSecret)("CLOUDFLARE_STREAM_SIGNING_PRIVATE_KEY");
const cloudflareCustomerSubdomain = (0, params_1.defineSecret)("CLOUDFLARE_STREAM_CUSTOMER_SUBDOMAIN");
const region = "asia-southeast1";
const CF_API_BASE = "https://api.cloudflare.com/client/v4";
function requireSecret(name, value) {
    if (!value || value.length === 0) {
        throw new https_1.HttpsError("failed-precondition", `Missing secret ${name}. Run: firebase functions:secrets:set ${name}`);
    }
    return value;
}
async function requireAuth(authUid) {
    if (!authUid)
        throw new https_1.HttpsError("unauthenticated", "Bạn cần đăng nhập");
    return authUid;
}
async function requireStreamOwner(streamId, uid) {
    const snap = await db().collection("streams").doc(streamId).get();
    if (!snap.exists)
        throw new https_1.HttpsError("not-found", "Phiên live không tồn tại");
    const data = snap.data();
    if (data.vendor_id !== uid) {
        throw new https_1.HttpsError("permission-denied", "Bạn không phải chủ phiên live này");
    }
    return { snap, data };
}
async function cloudflareFetch(path, init) {
    const accountId = requireSecret("CLOUDFLARE_ACCOUNT_ID", cloudflareAccountId.value());
    const apiToken = requireSecret("CLOUDFLARE_API_TOKEN", cloudflareApiToken.value());
    const url = `${CF_API_BASE}/accounts/${accountId}${path}`;
    const res = await fetch(url, {
        method: init.method ?? "GET",
        headers: {
            Authorization: `Bearer ${apiToken}`,
            "Content-Type": "application/json",
        },
        body: init.body ? JSON.stringify(init.body) : undefined,
    });
    const json = (await res.json());
    if (!res.ok || json.success === false) {
        const msg = json.errors?.map((e) => e.message).join("; ") ?? `HTTP ${res.status}`;
        throw new https_1.HttpsError("internal", `Cloudflare API error: ${msg}`);
    }
    return json;
}
/**
 * createLiveInput — Seller-only. Allocates a Cloudflare Stream Live Input for
 * the given Firestore stream document, persists the RTMPS credentials and
 * playback UID server-side, and returns one-time credentials to the caller
 * so they can configure OBS/mobile encoder.
 */
exports.createLiveInput = (0, https_1.onCall)({
    region,
    secrets: [cloudflareAccountId, cloudflareApiToken],
}, async (request) => {
    const uid = await requireAuth(request.auth?.uid);
    const streamId = String(request.data?.streamId ?? "").trim();
    if (!streamId)
        throw new https_1.HttpsError("invalid-argument", "Thiếu streamId");
    await requireStreamOwner(streamId, uid);
    const existing = await db()
        .collection("streamCredentials")
        .doc(streamId)
        .get();
    if (existing.exists) {
        throw new https_1.HttpsError("already-exists", "Phiên live đã được khởi tạo trên Cloudflare. Dùng getStreamCredentials để lấy lại.");
    }
    const body = {
        meta: { name: `acfmart-${streamId}` },
        recording: { mode: "automatic" },
        defaultCreator: uid,
    };
    const cf = await cloudflareFetch("/stream/live_inputs", { method: "POST", body });
    if (!cf.result)
        throw new https_1.HttpsError("internal", "Cloudflare không trả result");
    const cfUid = cf.result.uid;
    const rtmpsUrl = cf.result.rtmps.url;
    const streamKey = cf.result.rtmps.streamKey;
    const firestore = db();
    const batch = firestore.batch();
    // Public stream doc: only the playback UID + provisioning marker. The
    // playback UID alone is useless without a signed token (which requires
    // the signing private key on the server) so leaking it is fine.
    batch.update(firestore.collection("streams").doc(streamId), {
        cloudflare_playback_uid: cfUid,
        cloudflare_provisioned_at: admin.firestore.FieldValue.serverTimestamp(),
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
    });
    // Sensitive RTMPS credentials live in a sibling collection where the
    // security rule is `allow read, write: if false` — only the Cloud
    // Functions admin SDK can touch it.
    batch.set(firestore.collection("streamCredentials").doc(streamId), {
        vendor_id: uid,
        cloudflare_uid: cfUid,
        rtmps_url: rtmpsUrl,
        rtmps_stream_key: streamKey,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
    });
    await batch.commit();
    return { rtmpsUrl, streamKey, playbackUid: cfUid };
});
/**
 * getStreamCredentials — Seller-only. Re-fetches RTMPS credentials for a stream
 * the caller owns. We do NOT keep the stream key in the public Firestore doc
 * (rules block client reads of `cloudflare_rtmps_stream_key`) so the seller
 * must round-trip through this callable to view it again.
 */
exports.getStreamCredentials = (0, https_1.onCall)({ region }, async (request) => {
    const uid = await requireAuth(request.auth?.uid);
    const streamId = String(request.data?.streamId ?? "").trim();
    if (!streamId)
        throw new https_1.HttpsError("invalid-argument", "Thiếu streamId");
    await requireStreamOwner(streamId, uid);
    const credsSnap = await db()
        .collection("streamCredentials")
        .doc(streamId)
        .get();
    if (!credsSnap.exists) {
        throw new https_1.HttpsError("failed-precondition", "Phiên live chưa khởi tạo Cloudflare. Gọi createLiveInput trước.");
    }
    const creds = credsSnap.data();
    return {
        rtmpsUrl: creds.rtmps_url,
        streamKey: creds.rtmps_stream_key,
        playbackUid: creds.cloudflare_uid,
    };
});
function timingSafeEqualHex(a, b) {
    if (a.length !== b.length)
        return false;
    try {
        return crypto.timingSafeEqual(Buffer.from(a, "hex"), Buffer.from(b, "hex"));
    }
    catch {
        return false;
    }
}
/**
 * streamWebhook — Receives Cloudflare Stream lifecycle events. Verifies the
 * `Webhook-Signature` header (HMAC-SHA256 over `time.body` using the signing
 * secret returned when you subscribed to the webhook), then updates the
 * matching Firestore `streams/{id}` document.
 */
exports.streamWebhook = (0, https_1.onRequest)({
    region,
    cors: false,
    secrets: [cloudflareWebhookSecret],
}, async (req, res) => {
    if (req.method !== "POST") {
        res.status(405).json({ error: "Method not allowed" });
        return;
    }
    const secret = requireSecret("CLOUDFLARE_STREAM_WEBHOOK_SECRET", cloudflareWebhookSecret.value());
    const header = req.header("Webhook-Signature");
    if (!header) {
        res.status(401).json({ error: "Missing Webhook-Signature" });
        return;
    }
    const parts = Object.fromEntries(header.split(",").map((p) => {
        const idx = p.indexOf("=");
        return idx >= 0 ? [p.slice(0, idx), p.slice(idx + 1)] : [p, ""];
    }));
    const time = parts["time"];
    const sig1 = parts["sig1"];
    if (!time || !sig1) {
        res.status(401).json({ error: "Malformed Webhook-Signature" });
        return;
    }
    const rawBody = req.rawBody;
    const bodyString = rawBody ? rawBody.toString("utf8") : JSON.stringify(req.body);
    const source = `${time}.${bodyString}`;
    const expected = crypto.createHmac("sha256", secret).update(source).digest("hex");
    if (!timingSafeEqualHex(expected, sig1)) {
        res.status(401).json({ error: "Invalid signature" });
        return;
    }
    const ageSec = Math.abs(Date.now() / 1000 - Number(time));
    if (!Number.isFinite(ageSec) || ageSec > 600) {
        res.status(401).json({ error: "Stale webhook" });
        return;
    }
    const payload = req.body;
    const inputId = payload.data?.input_id;
    const eventType = payload.data?.event_type;
    if (!inputId || !eventType) {
        res.status(400).json({ error: "Missing data.input_id or data.event_type" });
        return;
    }
    const matches = await db()
        .collection("streams")
        .where("cloudflare_playback_uid", "==", inputId)
        .limit(1)
        .get();
    if (matches.empty) {
        console.warn(`Webhook for unknown input ${inputId}, event ${eventType}`);
        res.status(202).json({ ok: true, note: "stream not found, ignored" });
        return;
    }
    const streamRef = matches.docs[0].ref;
    const patch = {
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
    };
    if (eventType === "live_input.connected") {
        patch.status = "live";
        patch.actual_start_at = admin.firestore.FieldValue.serverTimestamp();
        patch.verified_origin = true;
    }
    else if (eventType === "live_input.disconnected") {
        patch.status = "ended";
        patch.ended_at = admin.firestore.FieldValue.serverTimestamp();
    }
    else if (eventType === "live_input.errored") {
        patch.last_error_at = admin.firestore.FieldValue.serverTimestamp();
        patch.last_error_event = eventType;
    }
    await streamRef.update(patch);
    res.json({ ok: true });
});
/**
 * signPlaybackToken — Returns a short-lived signed HLS manifest URL. Anyone
 * who has access to the stream (anonymous viewers included for public live
 * commerce sessions) may request a token; restriction by stream `status` is
 * enforced via Firestore rules before this is called.
 *
 * RS256 JWT signed with the private key generated via Cloudflare Stream
 * Signing Keys API. Token TTL is 10 minutes; client should re-issue when
 * the manifest 401s.
 */
exports.signPlaybackToken = (0, https_1.onCall)({
    region,
    secrets: [
        cloudflareSigningKeyId,
        cloudflareSigningPrivateKey,
        cloudflareCustomerSubdomain,
    ],
}, async (request) => {
    const streamId = String(request.data?.streamId ?? "").trim();
    if (!streamId)
        throw new https_1.HttpsError("invalid-argument", "Thiếu streamId");
    const snap = await db().collection("streams").doc(streamId).get();
    if (!snap.exists)
        throw new https_1.HttpsError("not-found", "Phiên live không tồn tại");
    const data = snap.data();
    const playbackUid = data.cloudflare_playback_uid;
    if (!playbackUid) {
        throw new https_1.HttpsError("failed-precondition", "Phiên live chưa kết nối Cloudflare. Liên hệ shop để bắt đầu phát.");
    }
    if (data.status === "cancelled") {
        throw new https_1.HttpsError("permission-denied", "Phiên live đã bị huỷ");
    }
    const kid = requireSecret("CLOUDFLARE_STREAM_SIGNING_KEY_ID", cloudflareSigningKeyId.value());
    const privateKey = requireSecret("CLOUDFLARE_STREAM_SIGNING_PRIVATE_KEY", cloudflareSigningPrivateKey.value());
    const subdomain = requireSecret("CLOUDFLARE_STREAM_CUSTOMER_SUBDOMAIN", cloudflareCustomerSubdomain.value());
    const ttlSec = 600;
    const now = Math.floor(Date.now() / 1000);
    const token = jwt.sign({
        sub: playbackUid,
        kid,
        exp: now + ttlSec,
        nbf: now - 30,
        iat: now,
    }, privateKey, { algorithm: "RS256", keyid: kid });
    const base = subdomain.startsWith("http")
        ? subdomain
        : `https://${subdomain.replace(/^https?:\/\//, "")}`;
    const manifestUrl = `${base}/${token}/manifest/video.m3u8`;
    const expiresAt = (now + ttlSec) * 1000;
    return { manifestUrl, expiresAt, playbackUid };
});
/**
 * endLiveStream — Seller-only. Marks the stream ended in Firestore. The
 * Cloudflare live input itself stays provisioned (so the seller can re-use
 * the same RTMPS endpoint for the next session if they want); a follow-up
 * function can release it via DELETE /stream/live_inputs/{uid}.
 */
exports.endLiveStream = (0, https_1.onCall)({ region }, async (request) => {
    const uid = await requireAuth(request.auth?.uid);
    const streamId = String(request.data?.streamId ?? "").trim();
    if (!streamId)
        throw new https_1.HttpsError("invalid-argument", "Thiếu streamId");
    await requireStreamOwner(streamId, uid);
    await db().collection("streams").doc(streamId).update({
        status: "ended",
        ended_at: admin.firestore.FieldValue.serverTimestamp(),
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
    });
    return { ok: true };
});
//# sourceMappingURL=livestream.js.map