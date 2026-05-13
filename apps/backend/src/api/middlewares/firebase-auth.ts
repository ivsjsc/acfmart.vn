import type {
  MedusaNextFunction,
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { verifyAuthorizationHeader } from "../../lib/firebase-admin"
import type { DecodedIdToken } from "firebase-admin/auth"

declare module "@medusajs/framework/http" {
  interface MedusaRequest {
    firebaseUser?: DecodedIdToken
  }
}

export async function requireFirebaseAuth(
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) {
  const decoded = await verifyAuthorizationHeader(
    req.headers.authorization as string | undefined
  )
  if (!decoded) {
    return res.status(401).json({
      message:
        "Cần đăng nhập Firebase. Gửi header `Authorization: Bearer <idToken>` từ phía client.",
    })
  }
  req.firebaseUser = decoded
  next()
}

export async function optionalFirebaseAuth(
  req: MedusaRequest,
  _res: MedusaResponse,
  next: MedusaNextFunction
) {
  const decoded = await verifyAuthorizationHeader(
    req.headers.authorization as string | undefined
  )
  if (decoded) req.firebaseUser = decoded
  next()
}
