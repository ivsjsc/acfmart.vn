import { onRequest } from "firebase-functions/v2/https"
import { onDocumentCreated, onDocumentUpdated } from "firebase-functions/v2/firestore"
import { defineSecret } from "firebase-functions/params"
import * as admin from "firebase-admin"

admin.initializeApp()

const db = admin.firestore()

// ─── Finance Cloud Functions (orders/payouts → seller ledger) ──────────
export {
  onOrderPaid,
  onOrderStatusChanged,
  onEarlyPayoutRequest,
  onPayoutPaid,
} from "./finance"

export {
  onAffiliateOrderCreated,
  onAffiliateOrderPaid,
} from "./affiliate"

export { processReturnRefund } from "./refunds"
export { aivyChat } from "./aivy"

// ─── Livestream Cloud Functions (Cloudflare Stream Live integration) ───
export {
  createLiveInput,
  getStreamCredentials,
  streamWebhook,
  signPlaybackToken,
  endLiveStream,
} from "./livestream"


// ─── Export CORS configuration ────────────────────────────────────────
export { corsOptions } from "./cors";

const zaloAppSecret = defineSecret("ZALO_APP_SECRET")

const ZALO_APP_ID = "1712776410811337542"
const ZALO_TOKEN_URL = "https://oauth.zaloapp.com/v4/access_token"
const ZALO_PROFILE_URL = "https://graph.zalo.me/v2.0/me"

interface ZaloTokenResponse {
  access_token?: string
  refresh_token?: string
  expires_in?: number
  error?: number
  error_name?: string
  error_description?: string
}

interface ZaloProfile {
  id?: string | number
  user_id?: string | number
  name?: string
  display_name?: string
  picture?: { data?: { url?: string }; url?: string }
  avatar?: string
  error?: number
  message?: string
  error_name?: string
  error_description?: string
}

interface ZaloProfileResponse extends ZaloProfile {
  data?: ZaloProfile
}

function normalizeZaloProfile(raw: ZaloProfileResponse): ZaloProfile {
  const profile = raw.id || raw.user_id ? raw : raw.data ?? raw
  const id = String(profile.id ?? profile.user_id ?? "").trim() || undefined
  const name = profile.name ?? profile.display_name
  const rawPicture = profile.picture as unknown
  const picture =
    typeof rawPicture === "string"
      ? { data: { url: rawPicture } }
      : profile.picture?.data?.url
        ? { data: { url: profile.picture.data.url } }
        : profile.picture?.url
          ? { data: { url: profile.picture.url } }
          : profile.avatar
            ? { data: { url: profile.avatar } }
            : undefined
  return {
    id,
    name,
    picture,
    error: profile.error,
    message: profile.message,
    error_name: profile.error_name,
    error_description: profile.error_description,
  }
}

function getZaloProfileError(raw: ZaloProfileResponse): string | undefined {
  return raw.error_description ?? raw.error_name ?? raw.message ?? raw.data?.message
}

async function fetchZaloProfile(accessToken: string): Promise<{
  profile: ZaloProfile
  lastError?: { status: number; body: ZaloProfileResponse }
}> {
  const profileUrl = `${ZALO_PROFILE_URL}?fields=id,name,picture`
  const attempts: Array<() => Promise<Response>> = [
    () => fetch(profileUrl, { headers: { access_token: accessToken } }),
    () => fetch(`${profileUrl}&access_token=${encodeURIComponent(accessToken)}`),
    () => fetch(profileUrl, { headers: { Authorization: `Bearer ${accessToken}` } }),
  ]

  let lastError: { status: number; body: ZaloProfileResponse } | undefined

  for (const runAttempt of attempts) {
    const response = await runAttempt()
    const body = (await response.json()) as ZaloProfileResponse
    const profile = normalizeZaloProfile(body)

    if (response.ok && profile.id) {
      return { profile }
    }

    lastError = { status: response.status, body }
  }

  return { profile: {}, lastError }
}

export const zaloAuth = onRequest(
  {
    cors: true,
    secrets: [zaloAppSecret],
    region: "asia-southeast1",
  },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" })
      return
    }

    const { code, codeVerifier, redirectUri } = req.body as {
      code?: string
      codeVerifier?: string
      redirectUri?: string
    }

    if (!code || !codeVerifier || !redirectUri) {
      res.status(400).json({ error: "Missing code, codeVerifier, or redirectUri" })
      return
    }

    try {
      // 1. Exchange auth code for access token
      const tokenParams = new URLSearchParams({
        code,
        app_id: ZALO_APP_ID,
        grant_type: "authorization_code",
        code_verifier: codeVerifier,
      })
      tokenParams.set("redirect_uri", redirectUri)

      const tokenRes = await fetch(ZALO_TOKEN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "secret_key": zaloAppSecret.value(),
        },
        body: tokenParams.toString(),
      })

      const tokenData: ZaloTokenResponse = await tokenRes.json()

      if (!tokenData.access_token) {
        res.status(401).json({
          error: "Zalo token exchange failed",
          details: tokenData.error_description ?? tokenData.error_name,
        })
        return
      }

      // 2. Get Zalo user profile
      const { profile, lastError } = await fetchZaloProfile(tokenData.access_token)

      if (!profile.id) {
        res.status(401).json({
          error: "Failed to get Zalo profile",
          details: lastError
            ? getZaloProfileError(lastError.body) ??
              `Zalo profile API returned HTTP ${lastError.status}`
            : undefined,
        })
        return
      }

      // 3. Create Firebase custom token
      const uid = `zalo:${profile.id}`
      const customToken = await admin.auth().createCustomToken(uid, {
        provider: "zalo",
        zaloId: profile.id,
        displayName: profile.name,
      })

      // 4. Create/update user in Firebase Auth
      try {
        await admin.auth().updateUser(uid, {
          displayName: profile.name ?? undefined,
          photoURL: profile.picture?.data?.url ?? undefined,
        })
      } catch {
        await admin.auth().createUser({
          uid,
          displayName: profile.name ?? undefined,
          photoURL: profile.picture?.data?.url ?? undefined,
        })
      }

      const userDocRef = db.collection("users").doc(uid)
      const userDoc = await userDocRef.get()
      await userDocRef.set(
        {
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
        },
        { merge: true }
      )

      res.json({
        customToken,
        profile: {
          id: profile.id,
          name: profile.name,
          picture: profile.picture?.data?.url,
        },
      })
    } catch (err) {
      console.error("Zalo auth error:", err)
      res.status(500).json({ error: "Internal server error" })
    }
  }
)

/**
 * Notify moderators when a new vendor registration is created.
 * Sends email notification to all admin/moderator users.
 */
export const onVendorRegistered = onDocumentCreated(
  {
    document: "vendors/{vendorId}",
    region: "asia-southeast1",
  },
  async (event) => {
    const snap = event.data
    if (!snap) return

    const vendor = snap.data()
    const vendorId = event.params.vendorId

    console.log(`New vendor registration: ${vendorId} - ${vendor.shop_name}`)

    // Get all owner/admin/moderator users
    const usersSnap = await db
      .collection("users")
      .where("role", "in", ["owner", "admin", "moderator"])
      .get()

    if (usersSnap.empty) {
      console.log("No moderators found to notify")
      return
    }

    // Create notification documents for each moderator
    const batch = db.batch()
    for (const userDoc of usersSnap.docs) {
      const notifRef = db.collection("notifications").doc()
      batch.set(notifRef, {
        user_id: userDoc.id,
        type: "vendor_registration",
        title: "Hồ sơ seller mới cần duyệt",
        body: `${vendor.owner_name} đã đăng ký shop "${vendor.shop_name}" (${vendor.business_type}). Vui lòng duyệt tại /admin/vendors.`,
        link: `/admin/vendors`,
        vendor_id: vendorId,
        read: false,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
      })
    }
    await batch.commit()

    console.log(`Notified ${usersSnap.size} moderator(s) about vendor ${vendorId}`)
  }
)

async function syncSellerRoleFromVendor(
  vendorId: string,
  vendor: admin.firestore.DocumentData
) {
  const uid = typeof vendor.firebase_uid === "string" ? vendor.firebase_uid : ""
  if (!uid) return

  const userRef = db.collection("users").doc(uid)
  const userSnap = await userRef.get()
  const userData = userSnap.data()
  const currentRole = userData?.role

  if (
    typeof currentRole === "string" &&
    ["owner", "admin", "moderator"].includes(currentRole)
  ) {
    return
  }

  const patch: Record<string, unknown> = {
    role: "seller",
    email: vendor.owner_email ?? userData?.email ?? "",
    name: vendor.owner_name ?? userData?.name ?? "Người bán ACFMart",
    phone: vendor.owner_phone ?? userData?.phone ?? "",
    seller_vendor_id: vendorId,
    updated_at: admin.firestore.FieldValue.serverTimestamp(),
  }

  if (!userSnap.exists || !userData?.created_at) {
    patch.created_at = admin.firestore.FieldValue.serverTimestamp()
  }

  await userRef.set(patch, { merge: true })
}

/**
 * Notify seller when their vendor status changes (approved/rejected/suspended).
 */
export const onVendorStatusChanged = onDocumentUpdated(
  {
    document: "vendors/{vendorId}",
    region: "asia-southeast1",
  },
  async (event) => {
    const before = event.data?.before.data()
    const after = event.data?.after.data()
    if (!before || !after) return

    if (before.status === after.status) return

    const vendorId = event.params.vendorId

    if (after.status === "active") {
      try {
        await syncSellerRoleFromVendor(vendorId, after)
      } catch (err) {
        console.error(`Failed to sync seller role for vendor ${vendorId}:`, err)
      }
    }

    const statusMessages: Record<string, { title: string; body: string }> = {
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
    }

    const msg = statusMessages[after.status]
    if (!msg) return

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
    })

    console.log(
      `Vendor ${vendorId} status changed: ${before.status} → ${after.status}`
    )
  }
)
