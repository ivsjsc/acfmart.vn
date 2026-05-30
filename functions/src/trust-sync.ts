import { onDocumentUpdated } from "firebase-functions/v2/firestore"
import { defineSecret, defineString } from "firebase-functions/params"

/**
 * Đồng bộ sản phẩm catalog đã DUYỆT (status -> "approved") sang IVS Trust Platform,
 * để cấp phép tạo tem QR. Gọi endpoint nội bộ server-to-server bằng shared secret.
 *
 * - Trust API base: mặc định https://api.acfmart.vn/v1 (Cloud Run ivs-trust-api).
 * - Secret IVS_TRUST_INTERNAL_KEY phải khớp env INTERNAL_SYNC_KEY của Cloud Run.
 * - Không chặn luồng duyệt: lỗi chỉ log, sản phẩm vẫn approved ở Firestore.
 */
const trustApiBase = defineString("IVS_TRUST_API_BASE", {
  default: "https://api.acfmart.vn/v1",
})
const trustInternalKey = defineSecret("IVS_TRUST_INTERNAL_KEY")

function pickString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

export const onProductApprovedSyncToTrust = onDocumentUpdated(
  {
    document: "products/{productId}",
    region: "asia-southeast1",
    secrets: [trustInternalKey],
  },
  async (event) => {
    const before = event.data?.before.data()
    const after = event.data?.after.data()
    if (!before || !after) return

    // Chỉ chạy khi vừa chuyển sang "approved".
    if (after.status !== "approved" || before.status === "approved") return

    const productId = event.params.productId
    const firebaseUid = pickString(after.shopId)
    const name = pickString(after.title) ?? pickString(after.name)

    if (!firebaseUid) {
      console.error(`[trust-sync] product ${productId} thiếu shopId, bỏ qua đồng bộ`)
      return
    }
    if (!name) {
      console.error(`[trust-sync] product ${productId} thiếu title, bỏ qua đồng bộ`)
      return
    }

    const key = trustInternalKey.value()
    if (!key) {
      console.error("[trust-sync] IVS_TRUST_INTERNAL_KEY chưa cấu hình, bỏ qua đồng bộ")
      return
    }

    const base = trustApiBase.value().replace(/\/+$/, "")
    const url = `${base}/internal/products`
    const payload = {
      firebaseUid,
      productId,
      name,
      brand: pickString(after.brand),
      category: pickString(after.category),
      publicRef: pickString(after.handle) ?? productId,
    }

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-internal-key": key,
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const text = await response.text().catch(() => "")
        console.error(
          `[trust-sync] đồng bộ product ${productId} thất bại: HTTP ${response.status} ${text}`
        )
        return
      }

      console.log(`[trust-sync] đã đồng bộ product ${productId} (seller uid ${firebaseUid}) sang trust-platform`)
    } catch (err) {
      console.error(`[trust-sync] lỗi mạng khi đồng bộ product ${productId}:`, err)
    }
  }
)
