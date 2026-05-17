export type VendorDocumentType =
  | "id_card_front"
  | "id_card_back"
  | "seller_registration_form"
  | "seller_contract"
  | "business_license"
  | "special_goods_license"

export type VendorBusinessType = "individual" | "household" | "company"

export interface VendorDocumentLike {
  type: string
}

export interface VendorDocumentRequirementInput {
  business_type: VendorBusinessType
  requires_special_license?: boolean | null
  documents?: VendorDocumentLike[] | null
}

export const SELLER_DOCUMENT_TEMPLATES = [
  {
    label: "Đơn đăng ký Seller",
    href: "/seller-documents/don-dang-ky-acf-seller.docx",
  },
  {
    label: "Hợp đồng người bán",
    href: "/seller-documents/hop-dong-seller-acfmart.docx",
  },
]

export const VENDOR_DOCUMENT_LABELS: Record<VendorDocumentType, string> = {
  id_card_front: "CCCD mặt trước",
  id_card_back: "CCCD mặt sau",
  seller_registration_form: "Đơn đăng ký Seller",
  seller_contract: "Hợp đồng người bán",
  business_license: "GP ĐKKD/Hộ kinh doanh",
  special_goods_license: "Giấy phép con/chuyên ngành",
}

export const SPECIAL_GOODS_LABELS: Record<string, string> = {
  imported: "Hàng nhập khẩu",
  alcohol: "Đồ uống có cồn",
  food: "Thực phẩm / đồ uống",
  health: "Sức khoẻ / thực phẩm chức năng",
  cosmetics: "Mỹ phẩm",
  conformity: "Hàng cần hợp quy / kiểm định",
}

export function getRequiredVendorDocumentTypes(
  vendor: VendorDocumentRequirementInput
): VendorDocumentType[] {
  const required: VendorDocumentType[] = [
    "seller_registration_form",
    "seller_contract",
    "id_card_front",
    "id_card_back",
  ]

  if (vendor.business_type !== "individual") {
    required.push("business_license")
  }

  if (vendor.requires_special_license) {
    required.push("special_goods_license")
  }

  return required
}

export function hasVendorDocument(
  documents: VendorDocumentLike[] | null | undefined,
  type: VendorDocumentType
) {
  return Boolean(documents?.some((doc) => doc.type === type))
}

export function getMissingVendorDocuments(
  vendor: VendorDocumentRequirementInput
): VendorDocumentType[] {
  return getRequiredVendorDocumentTypes(vendor).filter(
    (type) => !hasVendorDocument(vendor.documents, type)
  )
}

export function getVendorDocumentLabel(type: string) {
  return VENDOR_DOCUMENT_LABELS[type as VendorDocumentType] ?? type
}
