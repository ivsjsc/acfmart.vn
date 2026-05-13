import { model } from "@medusajs/framework/utils"
import { ScanEvent } from "./scan-event"

/**
 * Báo cáo hàng giả từ khách hàng. Realtime moderation queue handled
 * trên Firestore, nhưng nguồn dữ liệu chính lưu ở Medusa để giữ
 * lịch sử + integrate với refund flow.
 */
export const CounterfeitReport = model
  .define("counterfeit_report", {
    id: model.id({ prefix: "cfrep" }).primaryKey(),

    reporter_id: model.text().searchable(),
    reporter_name: model.text(),
    reporter_email: model.text().nullable(),
    reporter_phone: model.text().nullable(),

    /** Liên kết đơn hàng (nếu có) */
    order_id: model.text().nullable().searchable(),
    product_id: model.text().nullable(),
    vendor_id: model.text().nullable().searchable(),
    verification_code_id: model.text().nullable(),

    /** Mô tả vấn đề */
    title: model.text(),
    description: model.text(),
    purchase_location: model.text().nullable(),
    evidence_urls: model.json().nullable(),

    severity: model.enum(["low", "medium", "high", "critical"]).default("medium"),
    status: model
      .enum([
        "submitted",
        "investigating",
        "verified",
        "rejected",
        "resolved",
      ])
      .default("submitted"),

    /** Moderation */
    assigned_moderator: model.text().nullable(),
    resolution: model.text().nullable(),
    resolved_at: model.dateTime().nullable(),

    /** Phản hồi cho người báo cáo */
    response_to_reporter: model.text().nullable(),
    reward_points: model.number().default(0),
  })
  .indexes([
    { on: ["status"] },
    { on: ["severity"] },
    { on: ["vendor_id"], where: "vendor_id IS NOT NULL" },
  ])
