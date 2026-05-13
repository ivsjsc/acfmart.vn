import { onRequest } from "firebase-functions/v2/https"
import { onDocumentCreated, onDocumentUpdated } from "firebase-functions/v2/firestore"
import { defineSecret } from "firebase-functions/params"
import * as admin from "firebase-admin"

admin.initializeApp()

const db = admin.firestore()

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
  id?: string
  name?: string
  picture?: { data?: { url?: string } }
  error?: number
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
      const profileRes = await fetch(
        `${ZALO_PROFILE_URL}?fields=id,name,picture`,
        {
          headers: { access_token: tokenData.access_token },
        }
      )

      const profile: ZaloProfile = await profileRes.json()

      if (!profile.id) {
        res.status(401).json({ error: "Failed to get Zalo profile" })
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

    // Get all moderator/admin users
    const usersSnap = await db
      .collection("users")
      .where("role", "in", ["admin", "moderator"])
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
