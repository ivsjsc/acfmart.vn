import { Product } from "../store";

// Allowed origins for products
const ALLOWED_ORIGINS = [
  "Việt Nam", "China", "USA", "Japan", "South Korea", 
  "Thái Lan", "Indonesia", "Malaysia", "Singapore",
  "Germany", "France", "Italy", "Spain", "Netherlands"
];

// Restricted categories requiring special documentation
const RESTRICTED_CATEGORIES = [
  "food", "medicine", "cosmetics", "medical-devices", 
  "alcohol", "tobacco", "baby-food", "supplements"
];

/**
 * Validates product information according to Vietnamese legal requirements
 */
export function validateProduct(product: Product): string[] {
  const errors: string[] = [];

  // Validate basic label information (required by Decree 43/2017/NĐ-CP)
  if (!product.labelInfo.brandName?.trim()) {
    errors.push("Tên nhãn hiệu là thông tin bắt buộc");
  }

  if (!product.labelInfo.manufacturerName?.trim()) {
    errors.push("Tên nhà sản xuất là thông tin bắt buộc");
  }

  if (!product.labelInfo.manufacturerAddress?.trim()) {
    errors.push("Địa chỉ nhà sản xuất là thông tin bắt buộc");
  }

  if (!product.labelInfo.originCountry?.trim()) {
    errors.push("Xuất xứ hàng hóa là thông tin bắt buộc");
  } else if (!ALLOWED_ORIGINS.includes(product.labelInfo.originCountry)) {
    errors.push("Xuất xứ hàng hóa không hợp lệ");
  }

  if (!product.labelInfo.quantityMeasurement?.trim()) {
    errors.push("Định lượng sản phẩm là thông tin bắt buộc");
  }

  if (!product.labelInfo.productionDate) {
    errors.push("Ngày sản xuất là thông tin bắt buộc");
  } else {
    const prodDate = new Date(product.labelInfo.productionDate);
    const now = new Date();
    if (prodDate > now) {
      errors.push("Ngày sản xuất không thể ở tương lai");
    }
  }

  if (product.labelInfo.expiryDate) {
    const expDate = new Date(product.labelInfo.expiryDate);
    const prodDate = new Date(product.labelInfo.productionDate);
    if (expDate <= prodDate) {
      errors.push("Hạn sử dụng phải sau ngày sản xuất");
    }
  }

  if (!product.labelInfo.batchNumber?.trim()) {
    errors.push("Số lô sản xuất là thông tin bắt buộc");
  }

  if (!product.labelInfo.ingredientsOrComponents?.trim()) {
    errors.push("Thành phần/hợp chất chính là thông tin bắt buộc");
  }

  if (!product.labelInfo.usageInstructions?.trim()) {
    errors.push("Hướng dẫn sử dụng là thông tin bắt buộc");
  }

  if (!product.labelInfo.storageInstructions?.trim()) {
    errors.push("Hướng dẫn bảo quản là thông tin bắt buộc");
  }

  // Validate commercial information
  if (product.commercialInfo.basePrice <= 0) {
    errors.push("Giá gốc phải lớn hơn 0");
  }

  if (product.commercialInfo.promotionalPrice !== undefined && 
      product.commercialInfo.promotionalPrice < 0) {
    errors.push("Giá khuyến mãi không thể âm");
  }

  if (product.commercialInfo.promotionStartDate && product.commercialInfo.promotionEndDate) {
    if (new Date(product.commercialInfo.promotionStartDate) > new Date(product.commercialInfo.promotionEndDate)) {
      errors.push("Ngày bắt đầu khuyến mãi phải trước ngày kết thúc");
    }
  }

  if (product.commercialInfo.weight <= 0) {
    errors.push("Khối lượng phải lớn hơn 0");
  }

  // Check restricted categories
  if (RESTRICTED_CATEGORIES.includes(product.category)) {
    if (!product.qualityInfo?.certificateOfQualityUrl) {
      errors.push(`Sản phẩm thuộc danh mục đặc biệt, cần có giấy chứng nhận chất lượng`);
    }
    
    if (!product.qualityInfo?.testResultUrl) {
      errors.push(`Sản phẩm thuộc danh mục đặc biệt, cần có kết quả kiểm nghiệm`);
    }
  }

  // Price validation to prevent price manipulation
  if (product.commercialInfo.promotionalPrice !== undefined && 
      product.commercialInfo.promotionalPrice > product.commercialInfo.basePrice) {
    errors.push("Giá khuyến mãi không thể cao hơn giá gốc");
  }

  // Check for excessive pricing compared to market average (potential price manipulation)
  // This would typically be compared against market data
  if (product.commercialInfo.basePrice > 100000000) { // 100 million VND
    errors.push("Giá sản phẩm quá cao, cần kiểm tra lại");
  }

  return errors;
}

/**
 * Checks if a product meets minimum requirements to be submitted
 */
export function isProductSubmissionValid(product: Product): boolean {
  const errors = validateProduct(product);
  return errors.length === 0;
}

/**
 * Validates seller verification information
 */
export function validateSellerVerification(data: any): string[] {
  const errors: string[] = [];

  if (!data.idCardNumber?.trim()) {
    errors.push("Số CMND/CCCD là thông tin bắt buộc");
  }

  if (!data.idCardFrontUrl) {
    errors.push("Ảnh mặt trước CMND/CCCD là bắt buộc");
  }

  if (!data.idCardBackUrl) {
    errors.push("Ảnh mặt sau CMND/CCCD là bắt buộc");
  }

  if (!data.faceVerificationUrl) {
    errors.push("Xác thực khuôn mặt là bắt buộc");
  }

  if (!data.businessLicenseNumber?.trim()) {
    errors.push("Số giấy phép kinh doanh là bắt buộc");
  }

  if (!data.businessLicenseUrl) {
    errors.push("Tải lên giấy phép kinh doanh là bắt buộc");
  }

  if (!data.taxCode?.trim()) {
    errors.push("Mã số thuế là thông tin bắt buộc");
  }

  if (!data.businessAddress?.trim()) {
    errors.push("Địa chỉ kinh doanh là bắt buộc");
  }

  return errors;
}

/**
 * Determines violation level based on offense type and history
 */
export function determineViolationLevel(
  violationType: string, 
  offenseCount: number
): 'warning' | 'suspend_7d' | 'suspend_30d' | 'ban_permanent' {
  // For repeated offenses
  if (offenseCount >= 4) {
    return 'ban_permanent';
  }
  
  if (offenseCount >= 3) {
    return 'suspend_30d';
  }
  
  if (offenseCount >= 2) {
    return 'suspend_7d';
  }
  
  // Specific violations that are treated severely regardless of count
  if (['counterfeit_goods', 'fraudulent_information'].includes(violationType)) {
    return 'suspend_7d';
  }
  
  return 'warning';
}