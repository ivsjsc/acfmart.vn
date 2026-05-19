import { onRequest } from "firebase-functions/v2/https"
import * as admin from "firebase-admin"

const db = admin.firestore()

const QR_GUARD_CORS = [
  "https://qr-ivs.web.app",
  "https://qr-ivs.firebaseapp.com",
  "http://localhost:5173",
  "http://localhost:3000",
]

interface AuthPayload {
  uid: string
  email?: string
  role?: string
}

async function verifyAuth(req: { headers: { authorization?: string } }): Promise<AuthPayload> {
  const header = req.headers.authorization
  if (!header?.startsWith("Bearer ")) {
    throw new Error("UNAUTHENTICATED")
  }

  const token = header.slice(7)
  const decoded = await admin.auth().verifyIdToken(token)

  const userDoc = await db.collection("users").doc(decoded.uid).get()
  const userData = userDoc.data()

  return {
    uid: decoded.uid,
    email: decoded.email,
    role: userData?.role ?? decoded.role ?? "customer",
  }
}

function requireSeller(auth: AuthPayload): void {
  const allowed = ["seller", "admin", "owner", "moderator"]
  if (!allowed.includes(auth.role ?? "")) {
    throw new Error("PERMISSION_DENIED")
  }
}

// ─── GET /qrGuardVendorProfile ──────────────────────────────────────
// Returns the vendor (shop) profile linked to the authenticated seller.
export const qrGuardVendorProfile = onRequest(
  { cors: QR_GUARD_CORS, region: "asia-southeast1" },
  async (req, res) => {
    if (req.method !== "GET") {
      res.status(405).json({ success: false, message: "Method not allowed" })
      return
    }

    try {
      const auth = await verifyAuth(req)
      requireSeller(auth)

      const snap = await db
        .collection("vendors")
        .where("firebase_uid", "==", auth.uid)
        .limit(1)
        .get()

      if (snap.empty) {
        res.status(404).json({ success: false, message: "Không tìm thấy shop của bạn" })
        return
      }

      const vendorDoc = snap.docs[0]
      const v = vendorDoc.data()

      res.json({
        success: true,
        data: {
          vendorId: vendorDoc.id,
          shopName: v.shop_name,
          shopSlug: v.shop_slug,
          shopLogo: v.shop_logo ?? null,
          ownerName: v.owner_name,
          ownerEmail: v.owner_email,
          status: v.status,
          kycLevel: v.kyc_level,
          acfVerified: v.status === "active",
        },
      })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Internal error"
      if (message === "UNAUTHENTICATED") {
        res.status(401).json({ success: false, message: "Chưa đăng nhập" })
        return
      }
      if (message === "PERMISSION_DENIED") {
        res.status(403).json({ success: false, message: "Bạn cần quyền seller để sử dụng QR Guard" })
        return
      }
      console.error("qrGuardVendorProfile error:", err)
      res.status(500).json({ success: false, message: "Lỗi server" })
    }
  }
)

// ─── GET /qrGuardProducts?status=approved&page=1&limit=50 ───────────
// Returns the seller's products with stock info for bulk QR generation.
export const qrGuardProducts = onRequest(
  { cors: QR_GUARD_CORS, region: "asia-southeast1" },
  async (req, res) => {
    if (req.method !== "GET") {
      res.status(405).json({ success: false, message: "Method not allowed" })
      return
    }

    try {
      const auth = await verifyAuth(req)
      requireSeller(auth)

      const statusFilter = (req.query.status as string) || "approved"

      const q: admin.firestore.Query = db
        .collection("products")
        .where("shopId", "==", auth.uid)
        .where("status", "==", statusFilter)

      const snap = await q.get()

      const products = snap.docs.map((d) => {
        const p = d.data()
        return {
          productId: d.id,
          title: p.title,
          handle: p.handle,
          brand: p.brand ?? "",
          category: p.category ?? "",
          thumbnail: p.thumbnail ?? null,
          basePrice: p.basePrice ?? 0,
          totalStock: p.totalStock ?? 0,
          totalSold: p.totalSold ?? 0,
          variants: (p.variants ?? []).map((v: Record<string, unknown>) => ({
            id: v.id,
            title: v.title,
            sku: v.sku,
            stock: v.stock ?? 0,
          })),
          acfVerified: p.acfVerified ?? false,
          acfVerifyStatus: p.acfVerifyStatus ?? "none",
        }
      })

      res.json({
        success: true,
        data: {
          products,
          total: products.length,
          sellerUid: auth.uid,
        },
      })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Internal error"
      if (message === "UNAUTHENTICATED") {
        res.status(401).json({ success: false, message: "Chưa đăng nhập" })
        return
      }
      if (message === "PERMISSION_DENIED") {
        res.status(403).json({ success: false, message: "Bạn cần quyền seller để sử dụng QR Guard" })
        return
      }
      console.error("qrGuardProducts error:", err)
      res.status(500).json({ success: false, message: "Lỗi server" })
    }
  }
)

// ─── GET /qrGuardQrConfig?productId=xxx ─────────────────────────────
// Returns QR generation config for a specific product owned by the seller.
export const qrGuardQrConfig = onRequest(
  { cors: QR_GUARD_CORS, region: "asia-southeast1" },
  async (req, res) => {
    if (req.method !== "GET") {
      res.status(405).json({ success: false, message: "Method not allowed" })
      return
    }

    try {
      const auth = await verifyAuth(req)
      requireSeller(auth)

      const productId = req.query.productId as string
      if (!productId) {
        res.status(400).json({ success: false, message: "Thiếu productId" })
        return
      }

      const productDoc = await db.collection("products").doc(productId).get()
      if (!productDoc.exists) {
        res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm" })
        return
      }

      const p = productDoc.data()!
      if (p.shopId !== auth.uid) {
        res.status(403).json({ success: false, message: "Sản phẩm không thuộc shop của bạn" })
        return
      }

      const vendorSnap = await db
        .collection("vendors")
        .where("firebase_uid", "==", auth.uid)
        .limit(1)
        .get()

      const vendorId = vendorSnap.empty ? "" : vendorSnap.docs[0].id
      const shopSlug = vendorSnap.empty ? "" : vendorSnap.docs[0].data().shop_slug

      res.json({
        success: true,
        data: {
          productId: productDoc.id,
          productName: p.title,
          brand: p.brand ?? "",
          shopId: auth.uid,
          vendorId,
          shopSlug,
          totalStock: p.totalStock ?? 0,
          variants: (p.variants ?? []).map((v: Record<string, unknown>) => ({
            id: v.id,
            title: v.title,
            sku: v.sku,
            stock: v.stock ?? 0,
          })),
          qrConfig: {
            baseUrl: "https://acfmart.vn/qr-verify",
            urlTemplate: "{baseUrl}?code={serial}&product={productId}&shop={shopSlug}",
            errorCorrection: "H",
            size: 300,
            margin: 2,
            format: "svg",
          },
          qrBadge: "Sản phẩm áp dụng QR 5 chạm — ACF Guard",
          verificationRules: [
            "Mỗi mã QR gắn duy nhất 1 đơn vị sản phẩm (serial unique)",
            "Quét tối đa 5 lần trước khi hiển thị cảnh báo",
            "Sau lần quét thứ 5, mã chuyển trạng thái suspect",
          ],
          batchLimits: {
            maxPerRequest: p.totalStock ?? 0,
            maxPerDay: 10000,
          },
        },
      })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Internal error"
      if (message === "UNAUTHENTICATED") {
        res.status(401).json({ success: false, message: "Chưa đăng nhập" })
        return
      }
      if (message === "PERMISSION_DENIED") {
        res.status(403).json({ success: false, message: "Bạn cần quyền seller để sử dụng QR Guard" })
        return
      }
      console.error("qrGuardQrConfig error:", err)
      res.status(500).json({ success: false, message: "Lỗi server" })
    }
  }
)
