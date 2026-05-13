import { model } from "@medusajs/framework/utils"
import { AffiliateAccount } from "./affiliate-account"

/**
 * Mỗi link là 1 tracking URL với short code unique.
 * URL form: acfmart.vn/a/{short_code} → redirect tới target_url đính thêm UTM.
 */
export const AffiliateLink = model
  .define("affiliate_link", {
    id: model.id({ prefix: "aflink" }).primaryKey(),
    short_code: model.text().unique().searchable(),
    title: model.text().nullable(),

    target_url: model.text(),
    target_type: model.enum(["product", "shop", "category", "campaign", "home"]),
    target_id: model.text().nullable(),

    /** Override commission rate cho link này (basis points). null = dùng default account. */
    commission_bps: model.number().nullable(),

    status: model.enum(["active", "paused", "pending", "expired"]).default("active"),
    expires_at: model.dateTime().nullable(),

    // Stats cache — update qua subscriber
    clicks: model.number().default(0),
    unique_clicks: model.number().default(0),
    conversions: model.number().default(0),
    total_commission: model.bigNumber().default(0),
    last_click_at: model.dateTime().nullable(),

    account: model.belongsTo(() => AffiliateAccount, { mappedBy: "links" }),
  })
  .indexes([
    { on: ["status"] },
    { on: ["target_type", "target_id"] },
  ])
