import { model } from "@medusajs/framework/utils"
import { LoyaltyTransaction } from "./loyalty-transaction"

export const LoyaltyAccount = model
  .define("loyalty_account", {
    id: model.id({ prefix: "loya" }).primaryKey(),
    customer_id: model.text().unique().searchable(),
    firebase_uid: model.text().searchable().nullable(),

    /** Active point balance (always >= 0) */
    balance: model.number().default(0),

    /** Lifetime stats — for tier calculation */
    total_earned: model.number().default(0),
    total_redeemed: model.number().default(0),
    total_expired: model.number().default(0),
    lifetime_spend: model.bigNumber().default(0),

    /** Current tier */
    tier: model
      .enum(["silver", "gold", "platinum", "diamond"])
      .default("silver"),
    tier_anniversary: model.dateTime().nullable(),

    metadata: model.json().nullable(),

    transactions: model.hasMany(() => LoyaltyTransaction, {
      mappedBy: "account",
    }),
  })
  .indexes([{ on: ["tier"] }])
