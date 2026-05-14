const ZALO_AUTH_URL = "https://oauth.zaloapp.com/v4/permission"
const ZALO_TOKEN_URL = "https://oauth.zaloapp.com/v4/access_token"
const ZALO_PROFILE_URL = "https://graph.zalo.me/v2.0/me"

const STORAGE_KEY_VERIFIER = "zalo_pkce_verifier"
const STORAGE_KEY_STATE = "zalo_oauth_state"

function getAppId(): string {
  return import.meta.env.VITE_ZALO_APP_ID ?? "1712776410811337542"
}

function getRedirectUri(): string {
  return `${window.location.origin}/auth/zalo/callback`
}

function generateRandomString(length: number): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~"
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)
  return Array.from(array, (byte) => chars[byte % chars.length]).join("")
}

async function sha256(plain: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder()
  return crypto.subtle.digest("SHA-256", encoder.encode(plain))
}

function base64UrlEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ""
  bytes.forEach((b) => (binary += String.fromCharCode(b)))
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

async function generatePKCE(): Promise<{ codeVerifier: string; codeChallenge: string }> {
  const codeVerifier = generateRandomString(64)
  const hash = await sha256(codeVerifier)
  const codeChallenge = base64UrlEncode(hash)
  return { codeVerifier, codeChallenge }
}

export async function redirectToZaloLogin(): Promise<void> {
  const appId = getAppId()
  if (!appId) {
    throw new Error("VITE_ZALO_APP_ID chưa được cấu hình")
  }

  const { codeVerifier, codeChallenge } = await generatePKCE()
  const state = generateRandomString(32)

  sessionStorage.setItem(STORAGE_KEY_VERIFIER, codeVerifier)
  sessionStorage.setItem(STORAGE_KEY_STATE, state)

  const params = new URLSearchParams({
    app_id: appId,
    redirect_uri: getRedirectUri(),
    code_challenge: codeChallenge,
    state,
  })

  window.location.href = `${ZALO_AUTH_URL}?${params.toString()}`
}

export interface ZaloCallbackParams {
  code: string
  state: string
}

export function parseZaloCallback(search: string): ZaloCallbackParams | null {
  const params = new URLSearchParams(search)
  const code = params.get("code")
  const state = params.get("state")

  if (!code || !state) return null

  const savedState = sessionStorage.getItem(STORAGE_KEY_STATE)
  if (state !== savedState) return null

  return { code, state }
}

export function getStoredCodeVerifier(): string | null {
  return sessionStorage.getItem(STORAGE_KEY_VERIFIER)
}

export function clearZaloAuthState(): void {
  sessionStorage.removeItem(STORAGE_KEY_VERIFIER)
  sessionStorage.removeItem(STORAGE_KEY_STATE)
}

export interface ZaloTokenResponse {
  access_token: string
  refresh_token: string
  expires_in: number
}

export interface ZaloProfile {
  id: string
  name: string
  picture?: { data?: { url?: string } }
}

export { ZALO_TOKEN_URL, ZALO_PROFILE_URL }
