import { model } from "@medusajs/framework/utils"
import { VerificationCode } from "./verification-code"

/**
 * Mỗi lần khách quét, ghi 1 scan event để analytics + phát hiện hàng giả
 * (cùng 1 code mà có nhiều IP scan ở nhiều địa phương xa nhau = nghi vấn).
 */
export const ScanEvent = model
  .define("scan_event", {
    id: model.id({ prefix: "vsce" }).primaryKey(),

    scanner_id: model.text().searchable().nullable(),
    firebase_uid: model.text().nullable(),
    ip_hash: model.text().nullable(),
    user_agent: model.text().nullable(),

    /** Geolocation (nếu user cho phép) */
    latitude: model.number().nullable(),
    longitude: model.number().nullable(),
    city: model.text().nullable(),

    /** Kết quả lần scan này */
    result: model.enum(["genuine", "suspect_counterfeit", "expired", "voided", "invalid"]),
    risk_flags: model.json().nullable(),

    verification: model.belongsTo(() => VerificationCode, {
      mappedBy: "scan_events",
    }),
  })
  .indexes([
    { on: ["result"] },
    { on: ["scanner_id"], where: "scanner_id IS NOT NULL" },
  ])
