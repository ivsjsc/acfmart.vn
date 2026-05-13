import { model } from "@medusajs/framework/utils"
import { AffiliateAccount } from "./affiliate-account"

export const AffiliatePayout = model
  .define("affiliate_payout", {
    id: model.id({ prefix: "afpay" }).primaryKey(),

    amount: model.bigNumber(),
    method: model.enum(["bank", "wallet", "momo", "zalopay"]),
    account_info: model.text(),

    status: model
      .enum(["requested", "processing", "completed", "rejected"])
      .default("requested"),

    requested_at: model.dateTime(),
    processed_at: model.dateTime().nullable(),
    rejection_reason: model.text().nullable(),
    transaction_ref: model.text().nullable(),

    /** Number of commissions included in this payout */
    commission_count: model.number().default(0),

    account: model.belongsTo(() => AffiliateAccount, { mappedBy: "payouts" }),
  })
  .indexes([{ on: ["status"] }])
