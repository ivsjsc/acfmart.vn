import { onRequest } from "firebase-functions/v2/https"
import { defineSecret } from "firebase-functions/params"
import * as admin from "firebase-admin"

admin.initializeApp()

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
