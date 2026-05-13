import { model } from "@medusajs/framework/utils"

/**
 * Admin định nghĩa các option đổi điểm (voucher 30K, freeship, cashback...).
 * Khi customer đổi, system tạo Voucher Medusa hoặc cộng cash vào ví.
 */
export const RedemptionOption = model
  .define("redemption_option", {
    id: model.id({ prefix: "loyred" }).primaryKey(),
    title: model.text(),
    description: model.text().nullable(),
    points_cost: model.number(),
    type: model.enum(["voucher", "freeship", "cashback", "physical_gift"]),

    /** Cấu hình theo type */
    reward_amount: model.bigNumber().nullable(), // VND value
    voucher_template_id: model.text().nullable(), // Medusa promotion ID
    metadata: model.json().nullable(),

    /** Visibility */
    active: model.boolean().default(true),
    min_tier: model
      .enum(["silver", "gold", "platinum", "diamond"])
      .default("silver"),
    stock: model.number().nullable(), // null = unlimited
    redeemed_count: model.number().default(0),

    expires_at: model.dateTime().nullable(),
  })
  .indexes([
    { on: ["active"] },
    { on: ["min_tier"] },
  ])
