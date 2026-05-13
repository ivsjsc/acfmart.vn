import { model } from "@medusajs/framework/utils"
import { AffiliateLink } from "./affiliate-link"

/**
 * Mỗi lần redirect /a/{short_code} tạo 1 click event.
 * Dùng cho analytics + attribution (gán đơn hàng cho click trong vòng N ngày).
 */
export const AffiliateClick = model
  .define("affiliate_click", {
    id: model.id({ prefix: "afclk" }).primaryKey(),
    visitor_id: model.text().searchable(),
    ip_hash: model.text().nullable(),
    user_agent: model.text().nullable(),
    referer: model.text().nullable(),
    utm_source: model.text().nullable(),
    utm_medium: model.text().nullable(),
    utm_campaign: model.text().nullable(),

    // Set khi attribution thành công
    converted_order_id: model.text().nullable().searchable(),
    converted_at: model.dateTime().nullable(),

    link: model.belongsTo(() => AffiliateLink, { mappedBy: "clicks_log" }),
  })
  .indexes([
    { on: ["visitor_id"] },
    { on: ["converted_order_id"], where: "converted_order_id IS NOT NULL" },
  ])
