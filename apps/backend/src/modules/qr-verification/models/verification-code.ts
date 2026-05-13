import { model } from "@medusajs/framework/utils"
import { ScanEvent } from "./scan-event"

/**
 * Mỗi sản phẩm chính hãng được gắn 1 mã QR unique.
 * Khi khách quét, system check code có hợp lệ + chưa bị scan bởi user khác không.
 *
 * Quy trình anti-counterfeit:
 * 1. Seller in QR vào bao bì
 * 2. Khách quét QR → /qr-verify/{code}
 * 3. System kiểm tra:
 *    - Code tồn tại trong DB?
 *    - Đã được scan trước đó chưa? Bởi cùng IP/UID không?
 *    - Status còn active?
 * 4. Trả về Verification result: GENUINE / SUSPECTED_COUNTERFEIT / EXPIRED
 */
export const VerificationCode = model
  .define("verification_code", {
    id: model.id({ prefix: "vqrc" }).primaryKey(),
    code: model.text().unique().searchable(),

    /** Liên kết tới product variant Medusa (qua link table) */
    product_id: model.text().searchable().nullable(),
    variant_id: model.text().nullable(),
    vendor_id: model.text().searchable().nullable(),

    /** Trạng thái mã */
    status: model
      .enum(["active", "scanned", "voided", "expired"])
      .default("active"),

    batch_id: model.text().nullable(),
    serial_number: model.text().nullable(),
    manufactured_at: model.dateTime().nullable(),
    expires_at: model.dateTime().nullable(),

    /** Số lần đã scan + lần scan đầu tiên */
    scan_count: model.number().default(0),
    first_scanned_at: model.dateTime().nullable(),
    first_scanner_id: model.text().nullable(),

    metadata: model.json().nullable(),

    scan_events: model.hasMany(() => ScanEvent, {
      mappedBy: "verification",
    }),
  })
  .indexes([
    { on: ["status"] },
    { on: ["product_id"], where: "product_id IS NOT NULL" },
    { on: ["vendor_id"], where: "vendor_id IS NOT NULL" },
  ])
