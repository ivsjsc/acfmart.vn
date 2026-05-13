import { model } from "@medusajs/framework/utils"
import { LoyaltyAccount } from "./loyalty-account"

/**
 * Mỗi event điểm thưởng (earn / redeem / expire / adjust) ghi 1 transaction.
 * Cho phép trace lịch sử + reverse khi cancel order.
 */
export const LoyaltyTransaction = model
  .define("loyalty_transaction", {
    id: model.id({ prefix: "lotx" }).primaryKey(),
    type: model.enum(["earn", "redeem", "expire", "adjust"]),
    points: model.number(), // Có thể âm khi redeem/expire/adjust
    description: model.text(),

    /** Reference tới entity nguồn (order, review, voucher...) */
    reference_type: model.text().nullable(),
    reference_id: model.text().searchable().nullable(),

    /** Khi nào điểm hết hạn (chỉ cho earn) */
    expires_at: model.dateTime().nullable(),
    expired_at: model.dateTime().nullable(),

    account: model.belongsTo(() => LoyaltyAccount, { mappedBy: "transactions" }),
  })
  .indexes([
    { on: ["type"] },
    { on: ["reference_id"], where: "reference_id IS NOT NULL" },
    { on: ["expires_at"], where: "expires_at IS NOT NULL AND expired_at IS NULL" },
  ])
