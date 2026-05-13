import { model } from "@medusajs/framework/utils"
import { Vendor } from "./vendor"

/**
 * Files vendor upload trong quá trình KYC:
 * - CCCD/CMND mặt trước/sau
 * - Giấy phép kinh doanh
 * - Giấy chứng nhận xuất xứ sản phẩm
 * - Hợp đồng phân phối
 */
export const VendorDocument = model
  .define("vendor_document", {
    id: model.id({ prefix: "vendoc" }).primaryKey(),
    type: model.enum([
      "id_card_front",
      "id_card_back",
      "business_license",
      "tax_certificate",
      "origin_certificate",
      "distribution_contract",
      "bank_statement",
      "other",
    ]),
    file_url: model.text(),
    file_name: model.text().nullable(),
    mime_type: model.text().nullable(),
    file_size: model.number().nullable(),

    status: model
      .enum(["pending", "approved", "rejected"])
      .default("pending"),
    reviewer_note: model.text().nullable(),
    reviewed_at: model.dateTime().nullable(),

    vendor: model.belongsTo(() => Vendor, { mappedBy: "documents" }),
  })
  .indexes([{ on: ["status"] }, { on: ["type"] }])
