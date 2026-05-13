import { model } from "@medusajs/framework/utils"
import { LiveStream } from "./live-stream"

/**
 * Sản phẩm được host pin trong stream — có thể có giá flash sale riêng.
 */
export const StreamFeaturedProduct = model
  .define("stream_featured_product", {
    id: model.id({ prefix: "lsfp" }).primaryKey(),
    product_id: model.text().searchable(),
    variant_id: model.text().nullable(),

    /** Override giá khi đang trong live (flash sale) */
    flash_price: model.bigNumber().nullable(),
    flash_stock: model.number().nullable(),

    /** Vị trí trong danh sách (1 = đang pin trên top) */
    display_order: model.number().default(0),
    pinned_at: model.dateTime().nullable(),
    unpinned_at: model.dateTime().nullable(),

    /** Stats */
    clicks: model.number().default(0),
    orders: model.number().default(0),

    stream: model.belongsTo(() => LiveStream, { mappedBy: "featured_products" }),
  })
  .indexes([{ on: ["display_order"] }])
