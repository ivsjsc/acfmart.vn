import {
  initializeApp,
  cert,
  applicationDefault,
  getApps,
  type App,
  type ServiceAccount,
} from "firebase-admin/app"
import { getAuth, type DecodedIdToken } from "firebase-admin/auth"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"

let app: App | null = null

function loadCredentials() {
  const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64
  if (b64) {
    try {
      const json = Buffer.from(b64, "base64").toString("utf8")
      const parsed = JSON.parse(json) as ServiceAccount
      return cert(parsed)
    } catch {
      throw new Error(
        "FIREBASE_SERVICE_ACCOUNT_BASE64 không phải base64 JSON hợp lệ"
      )
    }
  }
  const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
  if (credPath) {
    const absolute = resolve(process.cwd(), credPath)
    try {
      const parsed = JSON.parse(readFileSync(absolute, "utf8")) as ServiceAccount
      return cert(parsed)
    } catch (err) {
      throw new Error(
        `Không đọc được service account tại ${absolute}: ${(err as Error).message}`
      )
    }
  }
  return applicationDefault()
}

export function getFirebaseApp(): App {
  if (app) return app
  if (getApps().length > 0) {
    app = getApps()[0]
    return app
  }
  app = initializeApp({
    credential: loadCredentials(),
    projectId: process.env.FIREBASE_PROJECT_ID ?? "ecommerce-acf",
  })
  return app
}

export function getFirebaseAuth() {
  return getAuth(getFirebaseApp())
}

export async function verifyIdToken(idToken: string): Promise<DecodedIdToken> {
  return getFirebaseAuth().verifyIdToken(idToken, true)
}

export async function verifyAuthorizationHeader(
  authHeader: string | undefined
): Promise<DecodedIdToken | null> {
  if (!authHeader) return null
  const [scheme, token] = authHeader.split(" ")
  if (scheme?.toLowerCase() !== "bearer" || !token) return null
  try {
    return await verifyIdToken(token)
  } catch {
    return null
  }
}
