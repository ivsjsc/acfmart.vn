import { model } from "@medusajs/framework/utils"
import { AffiliateAccount } from "./affiliate-account"
import { AffiliateLink } from "./affiliate-link"

/**
 * Hoa hồng được ghi nhận khi đơn hàng có click attribution được trả thành công.
 * Lifecycle: pending → confirmed (sau khi delivered + return window) → paid (sau payout)
 */
export const AffiliateCommission = model
  .define("affiliate_commission", {
    id: model.id({ prefix: "afcom" }).primaryKey(),

    order_id: model.text().searchable(),
    order_total: model.bigNumber(),
    commission_amount: model.bigNumber(),
    commission_bps: model.number(),

    status: model
      .enum(["pending", "confirmed", "cancelled", "paid"])
      .default("pending"),

    confirmed_at: model.dateTime().nullable(),
    paid_at: model.dateTime().nullable(),
    payout_id: model.text().nullable(),

    account: model.belongsTo(() => AffiliateAccount, { mappedBy: "commissions" }),
    link: model.belongsTo(() => AffiliateLink, { mappedBy: "commissions" }),
  })
  .indexes([
    { on: ["status"] },
    { on: ["order_id"] },
  ])
