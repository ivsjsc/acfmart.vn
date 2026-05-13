import { model } from "@medusajs/framework/utils"

export const Vendor = model
  .define("vendor", {
    id: model.id({ prefix: "ven" }).primaryKey(),
    shop_name: model.text().searchable(),
    shop_slug: model.text().unique(),
    shop_logo: model.text().nullable(),
    shop_banner: model.text().nullable(),
    description: model.text().nullable(),

    // Owner identity
    owner_name: model.text(),
    owner_email: model.text().searchable(),
    owner_phone: model.text(),
    firebase_uid: model.text().nullable().searchable(),

    // Legal
    business_type: model.enum(["individual", "household", "company"]),
    tax_code: model.text().nullable(),
    id_card_number: model.text().nullable(),

    // KYC & status
    status: model
      .enum(["pending", "active", "suspended", "rejected"])
      .default("pending"),
    kyc_level: model
      .enum(["none", "basic", "verified", "premium"])
      .default("none"),
    rejected_reason: model.text().nullable(),
    verified_at: model.dateTime().nullable(),
    suspended_at: model.dateTime().nullable(),

    // Pickup address
    pickup_address: model.json().nullable(),

    // Payout / banking
    bank_name: model.text().nullable(),
    bank_account_number: model.text().nullable(),
    bank_account_holder: model.text().nullable(),

    // Stats (denormalized for quick reads — recalc via job)
    total_orders: model.number().default(0),
    total_revenue: model.bigNumber().default(0),
    follower_count: model.number().default(0),
    avg_rating: model.number().default(0),
    on_time_shipping_rate: model.number().default(0),

    // Metadata
    metadata: model.json().nullable(),
  })
  .indexes([
    { on: ["status"] },
    { on: ["firebase_uid"], where: "firebase_uid IS NOT NULL" },
    { on: ["owner_email"] },
  ])
