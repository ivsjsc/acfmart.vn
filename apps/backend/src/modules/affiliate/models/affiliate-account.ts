import { model } from "@medusajs/framework/utils"
import { AffiliateCommission } from "./affiliate-commission"
import { AffiliateLink } from "./affiliate-link"
import { AffiliatePayout } from "./affiliate-payout"

/**
 * Affiliate account — 1 customer có thể có account để chia sẻ link và nhận hoa hồng.
 */
export const AffiliateAccount = model
  .define("affiliate_account", {
    id: model.id({ prefix: "afac" }).primaryKey(),
    customer_id: model.text().searchable(),
    firebase_uid: model.text().searchable().nullable(),
    display_name: model.text(),
    avatar_url: model.text().nullable(),
    bio: model.text().nullable(),

    status: model.enum(["pending", "active", "suspended"]).default("active"),
    tier: model
      .enum(["bronze", "silver", "gold", "platinum", "diamond"])
      .default("bronze"),

    /** Đại lượng hoa hồng mặc định nếu link không override (basis points: 100 = 1%) */
    default_commission_bps: model.number().default(500),

    // Lifetime stats — recalc qua subscriber khi commission settled
    total_clicks: model.number().default(0),
    total_conversions: model.number().default(0),
    lifetime_commission: model.bigNumber().default(0),
    pending_commission: model.bigNumber().default(0),
    paid_commission: model.bigNumber().default(0),

    // Payout config
    bank_name: model.text().nullable(),
    bank_account_number: model.text().nullable(),
    bank_account_holder: model.text().nullable(),

    metadata: model.json().nullable(),

    links: model.hasMany(() => AffiliateLink, {
      mappedBy: "account",
    }),
    commissions: model.hasMany(() => AffiliateCommission, {
      mappedBy: "account",
    }),
    payouts: model.hasMany(() => AffiliatePayout, {
      mappedBy: "account",
    }),
  })
  .indexes([
    { on: ["customer_id"], unique: true },
    { on: ["firebase_uid"], where: "firebase_uid IS NOT NULL" },
  ])
