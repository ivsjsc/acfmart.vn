// Define the types first
export interface MockCategory {
  id: string;
  slug: string;
  name: string;
  icon: string;
  productCount: number;
}

// Define nested types for variants and options
export interface VariantOption {
  [key: string]: string;
}

export interface MockVariant {
  id: string;
  options: VariantOption;
  price?: number;
  inventory: number;
  stock?: number; // Added for stock property
  title?: string; // Added for title property
}

export interface ProductSpec {
  name: string; // Changed from 'label' to 'name' to match actual usage
  value: string;
}

export interface MockProduct {
  id: string;
  handle: string;
  name: string;
  title?: string; // Added for compatibility
  description: string;
  price: number;
  originalPrice?: number; // Added for discount calculations
  compareAtPrice?: number;
  images: string[];
  thumbnail: string;
  rating: number;
  reviewCount: number;
  shopId: string;
  categoryIds: string[];
  categorySlug?: string; // Added for category filtering
  attributes: {
    color?: string;
    size?: string;
    material?: string;
  };
  inventory: number;
  isFavorite?: boolean;
  isVoucher?: boolean;
  isFlashSale?: boolean;
  flashSaleEndTime?: string;
  qrCode: string;
  certifications: string[];
  shippingInfo: {
    freeShip: boolean;
    expressDelivery: boolean;
    estimatedArrival: string;
  };
  sold?: number; // Added for sorting by sales
  brand?: string; // Added for brand filtering
  verified?: boolean; // Added for verification status
  shopName?: string; // Added for shop name display
  variants?: MockVariant[]; // Added for product variants
  specs?: ProductSpec[]; // Added for product specs
}

export interface MockShop {
  id: string;
  name: string;
  handle: string;
  description: string;
  rating: number;
  totalOrders: number;
  responseRate: number;
  responseTime: string;
  followerCount: number;
  totalProducts: number;
  isVerified: boolean;
  isOfficial: boolean;
  avatar: string;
  coverImage: string;
  contactInfo: {
    hotline: string;
    email: string;
  };
  businessHours: {
    open: string;
    close: string;
  };
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  categories: string[];
  joinDate: string;
  logo?: string; // Added for shop logo
  productCount?: number; // Added for product count display
  verified?: boolean; // Added for verification status
  certificationLevel?: string; // Added for certification level
  joinedAt?: string; // Added for join date
}

// Now define the mock data
export const MOCK_CATEGORIES: MockCategory[] = [
  // Danh mục: Thời Trang Nam
  { id: "nam-thoi-trang", slug: "nam-thoi-trang", name: "Thời Trang Nam", icon: "👔", productCount: 1250 },
  { id: "nam-ao-khoac", slug: "nam-ao-khoac", name: "Áo Khoác", icon: "🧥", productCount: 230 },
  { id: "nam-ao-vest-blazer", slug: "nam-ao-vest-blazer", name: "Áo Vest và Blazer", icon: "西装", productCount: 180 },
  { id: "nam-ao-hoodie-len-ni", slug: "nam-ao-hoodie-len-ni", name: "Áo Hoodie, Áo Len & Áo Nỉ", icon: "👕", productCount: 320 },
  { id: "nam-quan-jeans", slug: "nam-quan-jeans", name: "Quần Jeans", icon: "👖", productCount: 290 },
  { id: "nam-quan-dai-quan-au", slug: "nam-quan-dai-quan-au", name: "Quần Dài/Quần Âu", icon: "👖", productCount: 210 },
  { id: "nam-quan-short", slug: "nam-quan-short", name: "Quần Short", icon: "🩳", productCount: 180 },
  { id: "nam-ao", slug: "nam-ao", name: "Áo", icon: "👕", productCount: 420 },
  { id: "nam-ao-ba-lo", slug: "nam-ao-ba-lo", name: "Áo Ba Lỗ", icon: "-tank-top", productCount: 150 },
  { id: "nam-do-lot", slug: "nam-do-lot", name: "Đồ Lót", icon: "👙", productCount: 200 },
  { id: "nam-do-ngu", slug: "nam-do-ngu", name: "Đồ Ngủ", icon: "🛌", productCount: 170 },
  { id: "nam-do-bo", slug: "nam-do-bo", name: "Đồ Bộ", icon: "👘", productCount: 160 },
  { id: "nam-vot-tat", slug: "nam-vot-tat", name: "Vớ/Tất", icon: "🧦", productCount: 250 },
  { id: "nam-trang-phuc-truyen-thong", slug: "nam-trang-phuc-truyen-thong", name: "Trang Phục Truyền Thống", icon: "👘", productCount: 90 },
  { id: "nam-do-hoa-trang", slug: "nam-do-hoa-trang", name: "Đồ Hóa Trang", icon: "🎭", productCount: 110 },
  { id: "nam-trang-phuc-nganh-nghe", slug: "nam-trang-phuc-nganh-nghe", name: "Trang Phục Ngành Nghề", icon: "👷", productCount: 80 },
  { id: "nam-khac", slug: "nam-khac", name: "Khác", icon: "misc", productCount: 200 },
  { id: "nam-trang-suc", slug: "nam-trang-suc", name: "Trang Sức Nam", icon: "💍", productCount: 320 },
  { id: "nam-kinh-mat", slug: "nam-kinh-mat", name: "Kính Mát Nam", icon: "🕶️", productCount: 180 },
  { id: "nam-that-lung", slug: "nam-that-lung", name: "Thắt Lưng Nam", icon: " belt", productCount: 210 },
  { id: "nam-ca-vat-no-co", slug: "nam-ca-vat-no-co", name: "Cà vạt & Nơ cổ", icon: " bowtie", productCount: 140 },
  { id: "nam-phu-kien", slug: "nam-phu-kien", name: "Phụ Kiện Nam", icon: "👓", productCount: 280 },

  // Danh mục: Nhà Cửa & Đời Sống
  { id: "ncds-chan-ga-goi-nem", slug: "ncds-chan-ga-goi-nem", name: "Chăn, Ga, Gối & Nệm", icon: "🛏️", productCount: 420 },
  { id: "ncds-do-noi-that", slug: "ncds-do-noi-that", name: "Đồ nội thất", icon: "🛋️", productCount: 580 },
  { id: "ncds-trang-tri-nha", slug: "ncds-trang-tri-nha", name: "Trang trí nhà cửa", icon: "🎨", productCount: 320 },
  { id: "ncds-dung-cu-tien-ich", slug: "ncds-dung-cu-tien-ich", name: "Dụng cụ & Thiết bị tiện ích", icon: "🔧", productCount: 450 },
  { id: "ncds-do-nha-bep", slug: "ncds-do-nha-bep", name: "Đồ dùng nhà bếp và hộp đựng thực phẩm", icon: "🍳", productCount: 620 },
  { id: "ncds-den", slug: "ncds-den", name: "Đèn", icon: "💡", productCount: 280 },
  { id: "ncds-ngoai-troi-san-vuon", slug: "ncds-ngoai-troi-san-vuon", name: "Ngoài trời & Sân vườn", icon: "🌳", productCount: 320 },
  { id: "ncds-do-phong-tam", slug: "ncds-do-phong-tam", name: "Đồ dùng phòng tắm", icon: "🛁", productCount: 270 },
  { id: "ncds-vat-tho-cung", slug: "ncds-vat-tho-cung", name: "Vật phẩm thờ cúng", icon: "🕯️", productCount: 150 },
  { id: "ncds-do-trang-tri-tiec", slug: "ncds-do-trang-tri-tiec", name: "Đồ trang trí tiệc", icon: "🎉", productCount: 210 },
  { id: "ncds-cham-soc-nha-cua", slug: "ncds-cham-soc-nha-cua", name: "Chăm sóc nhà cửa và giặt ủi", icon: "🧽", productCount: 380 },
  { id: "ncds-sap-xep-nha", slug: "ncds-sap-xep-nha", name: "Sắp xếp nhà cửa", icon: "📦", productCount: 250 },
  { id: "ncds-dung-cu-pha-che", slug: "ncds-dung-cu-pha-che", name: "Dụng cụ pha chế", icon: "🥃", productCount: 180 },
  { id: "ncds-tinh-dau-thom-phong", slug: "ncds-tinh-dau-thom-phong", name: "Tinh dầu thơm phòng", icon: "🌿", productCount: 160 },
  { id: "ncds-do-phong-an", slug: "ncds-do-phong-an", name: "Đồ dùng phòng ăn", icon: "🍽️", productCount: 290 },

  // Danh mục: Đồng Hồ
  { id: "dh-nam", slug: "dh-nam", name: "Đồng Hồ Nam", icon: "⌚", productCount: 350 },
  { id: "dh-nu", slug: "dh-nu", name: "Đồng Hồ Nữ", icon: "⌚", productCount: 420 },
  { id: "dh-bo-cap", slug: "dh-bo-cap", name: "Bộ Đồng Hồ & Đồng Hồ Cặp", icon: "💑", productCount: 180 },
  { id: "dh-tre-em", slug: "dh-tre-em", name: "Đồng Hồ Trẻ Em", icon: "👶", productCount: 220 },
  { id: "dh-phu-kien", slug: "dh-phu-kien", name: "Phụ Kiện Đồng Hồ", icon: "⚙️", productCount: 150 },
  { id: "dh-khac", slug: "dh-khac", name: "Khác", icon: "misc", productCount: 120 },

  // Danh mục: Phụ Kiện & Trang Sức Nữ
  { id: "pkts-nu-nhan", slug: "pkts-nu-nhan", name: "Nhẫn", icon: "💍", productCount: 280 },
  { id: "pkts-nu-bong-tai", slug: "pkts-nu-bong-tai", name: "Bông tai", icon: "👂", productCount: 320 },
  { id: "pkts-nu-khan-choang", slug: "pkts-nu-khan-choang", name: "Khăn choàng", icon: "🧣", productCount: 180 },
  { id: "pkts-nu-gang-tay", slug: "pkts-nu-gang-tay", name: "Găng tay", icon: " gloves", productCount: 120 },
  { id: "pkts-nu-phu-kien-toc", slug: "pkts-nu-phu-kien-toc", name: "Phụ kiện tóc", icon: "💇", productCount: 210 },
  { id: "pkts-nu-vong-tay-lac-tay", slug: "pkts-nu-vong-tay-lac-tay", name: "Vòng tay & Lắc tay", icon: "bracelet", productCount: 290 },
  { id: "pkts-nu-lac-chan", slug: "pkts-nu-lac-chan", name: "Lắc chân", icon: " anklet", productCount: 140 },
  { id: "pkts-nu-mu", slug: "pkts-nu-mu", name: "Mũ", icon: "👒", productCount: 250 },
  { id: "pkts-nu-day-chuyen", slug: "pkts-nu-day-chuyen", name: "Dây chuyền", icon: " necklace", productCount: 270 },
  { id: "pkts-nu-kinh-mat", slug: "pkts-nu-kinh-mat", name: "Kính mắt", icon: "🕶️", productCount: 230 },
  { id: "pkts-nu-kim-loai-quy", slug: "pkts-nu-kim-loai-quy", name: "Kim loại quý", icon: "贵金属", productCount: 160 },
  { id: "pkts-nu-that-lung", slug: "pkts-nu-that-lung", name: "Thắt lưng", icon: " belt", productCount: 280 },
  { id: "pkts-nu-ca-vat-no-co", slug: "pkts-nu-ca-vat-no-co", name: "Cà vạt & Nơ cổ", icon: " bowtie", productCount: 120 },
  { id: "pkts-nu-phu-kien-them", slug: "pkts-nu-phu-kien-them", name: "Phụ kiện thêm", icon: "✨", productCount: 180 },
  { id: "pkts-nu-bo-phu-kien", slug: "pkts-nu-bo-phu-kien", name: "Bộ phụ kiện", icon: "🎁", productCount: 150 },
  { id: "pkts-nu-khac", slug: "pkts-nu-khac", name: "Khác", icon: "misc", productCount: 200 },
  { id: "pkts-nu-vot-tat", slug: "pkts-nu-vot-tat", name: "Vớ/ Tất", icon: "🧦", productCount: 240 },
  { id: "pkts-nu-o-du", slug: "pkts-nu-o-du", name: "Ô/Dù", icon: "☂️", productCount: 160 },

  // Danh mục: Balo & Túi Ví Nam
  { id: "baltvn-nam-balô", slug: "baltvn-nam-balô", name: "Ba Lô Nam", icon: "🎒", productCount: 320 },
  { id: "baltvn-nam-balô-laptop", slug: "baltvn-nam-balô-laptop", name: "Ba Lô Laptop Nam", icon: "💻", productCount: 180 },
  { id: "baltvn-nam-cap-dung-laptop", slug: "baltvn-nam-cap-dung-laptop", name: "Túi & Cặp Đựng Laptop", icon: "💼", productCount: 150 },
  { id: "baltvn-nam-tui-chong-soc", slug: "baltvn-nam-tui-chong-soc", name: "Túi Chống Sốc Laptop Nam", icon: "🛡️", productCount: 120 },
  { id: "baltvn-nam-tui-tote", slug: "baltvn-nam-tui-tote", name: "Túi Tote Nam", icon: "👜", productCount: 180 },
  { id: "baltvn-nam-cap-xach-cong-so", slug: "baltvn-nam-cap-xach-cong-so", name: "Cặp Xách Công Sở Nam", icon: "💼", productCount: 160 },
  { id: "baltvn-nam-vi-cam-tay", slug: "baltvn-nam-vi-cam-tay", name: "Ví Cầm Tay Nam", icon: " purse", productCount: 140 },
  { id: "baltvn-nam-tui-deo-hong", slug: "baltvn-nam-tui-deo-hong", name: "Túi Đeo Hông & Túi Đeo Ngực Nam", icon: "🎒", productCount: 170 },
  { id: "baltvn-nam-tui-deo-cheo", slug: "baltvn-nam-tui-deo-cheo", name: "Túi Đeo Chéo Nam", icon: "🎒", productCount: 280 },
  { id: "baltvn-nam-bop-vi", slug: "baltvn-nam-bop-vi", name: "Bóp/Ví Nam", icon: " purse", productCount: 320 },
  { id: "baltvn-nam-khac", slug: "baltvn-nam-khac", name: "Khác", icon: "misc", productCount: 200 },

  // Danh mục: Voucher & Dịch Vụ
  { id: "vds-nha-hang-an-uong", slug: "vds-nha-hang-an-uong", name: "Nhà hàng & Ăn uống", icon: "🍽️", productCount: 280 },
  { id: "vds-su-kien-giai-tri", slug: "vds-su-kien-giai-tri", name: "Sự kiện & Giải trí", icon: "🎉", productCount: 220 },
  { id: "vds-na-tien-tai-khoan", slug: "vds-na-tien-tai-khoan", name: "Nạp tiền tài khoản", icon: "💳", productCount: 350 },
  { id: "vds-suc-khoe-lam-dep", slug: "vds-suc-khoe-lam-dep", name: "Sức khỏe & Làm đẹp", icon: "💆", productCount: 420 },
  { id: "vds-goi-xe", slug: "vds-goi-xe", name: "Gọi xe", icon: "🚗", productCount: 280 },
  { id: "vds-khoa-hoc", slug: "vds-khoa-hoc", name: "Khóa học", icon: "🎓", productCount: 190 },
  { id: "vds-du-lich-khach-san", slug: "vds-du-lich-khach-san", name: "Du lịch & Khách sạn", icon: "🏨", productCount: 320 },
  { id: "vds-mua-sam", slug: "vds-mua-sam", name: "Mua sắm", icon: "🛍️", productCount: 450 },
  { id: "vds-ma-qua-tang-shopee", slug: "vds-ma-qua-tang-shopee", name: "Mã quà tặng Shopee", icon: "🎁", productCount: 210 },
  { id: "vds-thanh-toan-hoa-don", slug: "vds-thanh-toan-hoa-don", name: "Thanh toán hóa đơn", icon: "📋", productCount: 380 },
  { id: "vds-dich-vu-khac", slug: "vds-dich-vu-khac", name: "Dịch vụ khác", icon: "service", productCount: 290 },

  // Danh mục: Thời Trang Nữ
  { id: "nu-quan", slug: "nu-quan", name: "Quần", icon: "👖", productCount: 380 },
  { id: "nu-quan-dui", slug: "nu-quan-dui", name: "Quần đùi", icon: "🩳", productCount: 220 },
  { id: "nu-chan-vay", slug: "nu-chan-vay", name: "Chân váy", icon: "👗", productCount: 320 },
  { id: "nu-quan-jeans", slug: "nu-quan-jeans", name: "Quần jeans", icon: "👖", productCount: 420 },
  { id: "nu-dam-vay", slug: "nu-dam-vay", name: "Đầm/Váy", icon: "👗", productCount: 580 },
  { id: "nu-vay-cuoi", slug: "nu-vay-cuoi", name: "Váy cưới", icon: "👰", productCount: 180 },
  { id: "nu-do-lien-than", slug: "nu-do-lien-than", name: "Đồ liền thân", icon: " jumpsuit", productCount: 160 },
  { id: "nu-ao-khoac-ao-choang-vest", slug: "nu-ao-khoac-ao-choang-vest", name: "Áo khoác, Áo choàng & Vest", icon: "🧥", productCount: 320 },
  { id: "nu-ao-len-cardigan", slug: "nu-ao-len-cardigan", name: "Áo len & Cardigan", icon: " sweater", productCount: 280 },
  { id: "nu-hoodie-ao-ni", slug: "nu-hoodie-ao-ni", name: "Hoodie và Áo nỉ", icon: "👕", productCount: 250 },
  { id: "nu-bo", slug: "nu-bo", name: "Bộ", icon: " outfits", productCount: 210 },
  { id: "nu-do-lot", slug: "nu-do-lot", name: "Đồ lót", icon: "👙", productCount: 420 },
  { id: "nu-do-ngu", slug: "nu-do-ngu", name: "Đồ ngủ", icon: "😴", productCount: 280 },
  { id: "nu-ao", slug: "nu-ao", name: "Áo", icon: "👚", productCount: 520 },
  { id: "nu-do-tap", slug: "nu-do-tap", name: "Đồ tập", icon: "🏃", productCount: 260 },
  { id: "nu-do-bau", slug: "nu-do-bau", name: "Đồ Bầu", icon: "🤰", productCount: 180 },
  { id: "nu-do-truyen-thong", slug: "nu-do-truyen-thong", name: "Đồ truyền thống", icon: "👘", productCount: 120 },
  { id: "nu-do-hoa-trang", slug: "nu-do-hoa-trang", name: "Đồ hóa trang", icon: "🎭", productCount: 160 },
  { id: "nu-vai", slug: "nu-vai", name: "Vải", icon: "🧵", productCount: 140 },
  { id: "nu-vot-tat", slug: "nu-vot-tat", name: "Vớ/ Tất", icon: "🧦", productCount: 320 },
  { id: "nu-khac", slug: "nu-khac", name: "Khác", icon: "misc", productCount: 280 },

  // Danh mục: Máy Tính & Laptop
  { id: "mtlt-may-tinh-ban", slug: "mtlt-may-tinh-ban", name: "Máy Tính Bàn", icon: "🖥️", productCount: 180 },
  { id: "mtlt-man-hinh", slug: "mtlt-man-hinh", name: "Màn Hình", icon: "🖥️", productCount: 220 },
  { id: "mtlt-linh-kien", slug: "mtlt-linh-kien", name: "Linh Kiện Máy Tính", icon: "🔌", productCount: 380 },
  { id: "mtlt-thiet-bi-luu-tru", slug: "mtlt-thiet-bi-luu-tru", name: "Thiết Bị Lưu Trữ", icon: "💾", productCount: 280 },
  { id: "mtlt-thiet-bi-mang", slug: "mtlt-thiet-bi-mang", name: "Thiết Bị Mạng", icon: "🌐", productCount: 250 },
  { id: "mtlt-may-in-scan-chieu", slug: "mtlt-may-in-scan-chieu", name: "Máy In, Máy Scan & Máy Chiếu", icon: "🖨️", productCount: 320 },
  { id: "mtlt-phu-kien", slug: "mtlt-phu-kien", name: "Phụ Kiện Máy Tính", icon: "🖱️", productCount: 420 },
  { id: "mtlt-laptop", slug: "mtlt-laptop", name: "Laptop", icon: "💻", productCount: 580 },
  { id: "mtlt-khac", slug: "mtlt-khac", name: "Khác", icon: "misc", productCount: 220 },
  { id: "mtlt-gaming", slug: "mtlt-gaming", name: "Gaming", icon: "🎮", productCount: 350 },

  // Danh mục: Giày Dép Nữ
  { id: "gdn-bot", slug: "gdn-bot", name: "Bốt", icon: "👢", productCount: 280 },
  { id: "gdn-giay-the-thao", slug: "gdn-giay-the-thao", name: "Giày Thể Thao/ Sneaker", icon: " sneakers", productCount: 420 },
  { id: "gdn-giay-de-bang", slug: "gdn-giay-de-bang", name: "Giày Đế Bằng", icon: " flats", productCount: 280 },
  { id: "gdn-giay-cao-got", slug: "gdn-giay-cao-got", name: "Giày Cao Gót", icon: " heels", productCount: 320 },
  { id: "gdn-giay-de-xuong", slug: "gdn-giay-de-xuong", name: "Giày Đế Xuồng", icon: " slides", productCount: 210 },
  { id: "gdn-xang-dan-dep", slug: "gdn-xang-dan-dep", name: "Xăng-đan Và Dép", icon: " sandals", productCount: 380 },
  { id: "gdn-phu-kien-giay", slug: "gdn-phu-kien-giay", name: "Phụ Kiện Giày", icon: " shoe care", productCount: 180 },
  { id: "gdn-giay-khac", slug: "gdn-giay-khac", name: "Giày Khác", icon: "misc", productCount: 150 },

  // Danh mục: Thể Thao & Du Lịch
  { id: "ttdl-vali", slug: "ttdl-vali", name: "Vali", icon: "🧳", productCount: 280 },
  { id: "ttdl-tui-du-lich", slug: "ttdl-tui-du-lich", name: "Túi du lịch", icon: "🎒", productCount: 220 },
  { id: "ttdl-phu-kien-du-lich", slug: "ttdl-phu-kien-du-lich", name: "Phụ kiện du lịch", icon: "✈️", productCount: 180 },
  { id: "ttdl-dung-cu-the-thao", slug: "ttdl-dung-cu-the-thao", name: "Dụng Cụ Thể Thao & Dã Ngoại", icon: "⚽", productCount: 320 },
  { id: "ttdl-giay-the-thao", slug: "ttdl-giay-the-thao", name: "Giày Thể Thao", icon: " sneakers", productCount: 380 },
  { id: "ttdl-thoi-trang-the-thao", slug: "ttdl-thoi-trang-the-thao", name: "Thời Trang Thể Thao & Dã Ngoại", icon: " sportswear", productCount: 420 },
  { id: "ttdl-phu-kien-the-thao", slug: "ttdl-phu-kien-the-thao", name: "Phụ Kiện Thể Thao & Dã Ngoại", icon: " accessories", productCount: 280 },
  { id: "ttdl-khac", slug: "ttdl-khac", name: "Khác", icon: "misc", productCount: 200 },

  // Danh mục: Thời Trang Trẻ Em
  { id: "ttte-trang-phuc-be-trai", slug: "ttte-trang-phuc-be-trai", name: "Trang phục bé trai", icon: "👦", productCount: 280 },
  { id: "ttte-trang-phuc-be-gai", slug: "ttte-trang-phuc-be-gai", name: "Trang phục bé gái", icon: "👧", productCount: 320 },
  { id: "ttte-giay-dep-be-trai", slug: "ttte-giay-dep-be-trai", name: "Giày dép bé trai", icon: " sneakers", productCount: 180 },
  { id: "ttte-giay-dep-be-gai", slug: "ttte-giay-dep-be-gai", name: "Giày dép bé gái", icon: " shoes", productCount: 220 },
  { id: "ttte-khac", slug: "ttte-khac", name: "Khác", icon: "misc", productCount: 150 },
  { id: "ttte-quan-ao-em-be", slug: "ttte-quan-ao-em-be", name: "Quần áo em bé", icon: "👶", productCount: 320 },
  { id: "ttte-giay-tap-di-tat-sinh", slug: "ttte-giay-tap-di-tat-sinh", name: "Giày tập đi & Tất sơ sinh", icon: "👣", productCount: 210 },
  { id: "ttte-phu-kien-tre-em", slug: "ttte-phu-kien-tre-em", name: "Phụ kiện trẻ em", icon: "🧸", productCount: 280 },

  // Danh mục: Dụng cụ và thiết bị tiện ích
  { id: "dctdti-dung-cu-cam-tay", slug: "dctdti-dung-cu-cam-tay", name: "Dụng cụ cầm tay", icon: "🔧", productCount: 320 },
  { id: "dctdti-dung-cu-dien-thiet-bi-lon", slug: "dctdti-dung-cu-dien-thiet-bi-lon", name: "Dụng cụ điện và thiết bị lớn", icon: "⚡", productCount: 280 },
  { id: "dctdti-thiet-bi-mach-dien", slug: "dctdti-thiet-bi-mach-dien", name: "Thiết bị mạch điện", icon: "🔌", productCount: 180 },
  { id: "dctdti-vat-lieu-xay-dung", slug: "dctdti-vat-lieu-xay-dung", name: "Vật liệu xây dựng", icon: "🏗️", productCount: 320 },
  { id: "dctdti-thiet-bi-phu-kien-xay-dung", slug: "dctdti-thiet-bi-phu-kien-xay-dung", name: "Thiết bị và phụ kiện xây dựng", icon: "🔨", productCount: 280 },

  // Danh mục: Điện Thoại & Phụ Kiện
  { id: "dtpk-dien-thoai", slug: "dtpk-dien-thoai", name: "Điện thoại", icon: "📱", productCount: 480 },
  { id: "dtpk-may-tinh-bang", slug: "dtpk-may-tinh-bang", name: "Máy tính bảng", icon: "📱", productCount: 280 },
  { id: "dtpk-pin-du-phong", slug: "dtpk-pin-du-phong", name: "Pin Dự Phòng", icon: "🔋", productCount: 320 },
  { id: "dtpk-pin-gap-trong", slug: "dtpk-pin-gap-trong", name: "Pin Gắn Trong, Cáp và Bộ Sạc", icon: "🔌", productCount: 420 },
  { id: "dtpk-op-lung-bao-da", slug: "dtpk-op-lung-bao-da", name: "Ốp lưng, bao da, Miếng dán điện thoại", icon: "📱", productCount: 580 },
  { id: "dtpk-bao-ve-man-hinh", slug: "dtpk-bao-ve-man-hinh", name: "Bảo vệ màn hình", icon: "🛡️", productCount: 380 },
  { id: "dtpk-de-giu-dien-thoai", slug: "dtpk-de-giu-dien-thoai", name: "Đế giữ điện thoại", icon: "📱", productCount: 220 },
  { id: "dtpk-the-nho", slug: "dtpk-the-nho", name: "Thẻ nhớ", icon: "💾", productCount: 280 },
  { id: "dtpk-sim", slug: "dtpk-sim", name: "Sim", icon: "📞", productCount: 320 },
  { id: "dtpk-phu-kien-khac", slug: "dtpk-phu-kien-khac", name: "Phụ kiện khác", icon: "misc", productCount: 380 },
  { id: "dtpk-thiet-bi-khac", slug: "dtpk-thiet-bi-khac", name: "Thiết bị khác", icon: "tech", productCount: 250 },

  // Danh mục: Sắc Đẹp
  { id: "sac-dep-cham-soc-da-mat", slug: "sac-dep-cham-soc-da-mat", name: "Chăm sóc da mặt", icon: "🧴", productCount: 520 },
  { id: "sac-dep-tam-cham-soc-co-the", slug: "sac-dep-tam-cham-soc-co-the", name: "Tắm & chăm sóc cơ thể", icon: " bathing", productCount: 420 },
  { id: "sac-dep-trang-diem", slug: "sac-dep-trang-diem", name: "Trang điểm", icon: "💄", productCount: 620 },
  { id: "sac-dep-cham-soc-toc", slug: "sac-dep-cham-soc-toc", name: "Chăm sóc tóc", icon: "💇", productCount: 380 },
  { id: "sac-dep-dung-cu-phu-kien", slug: "sac-dep-dung-cu-phu-kien", name: "Dụng cụ & Phụ kiện Làm đẹp", icon: "✨", productCount: 320 },
  { id: "sac-dep-ve-sinh-rang-mieng", slug: "sac-dep-ve-sinh-rang-mieng", name: "Vệ sinh răng miệng", icon: "🦷", productCount: 280 },
  { id: "sac-dep-nuoc-hoa", slug: "sac-dep-nuoc-hoa", name: "Nước hoa", icon: "🌸", productCount: 420 },
  { id: "sac-dep-cham-soc-nam-gioi", slug: "sac-dep-cham-soc-nam-gioi", name: "Chăm sóc nam giới", icon: "👨", productCount: 280 },
  { id: "sac-dep-khac", slug: "sac-dep-khac", name: "Khác", icon: "misc", productCount: 220 },
  { id: "sac-dep-cham-soc-phu-nu", slug: "sac-dep-cham-soc-phu-nu", name: "Chăm sóc phụ nữ", icon: "👩", productCount: 320 },
  { id: "sac-dep-bo-san-pham", slug: "sac-dep-bo-san-pham", name: "Bộ sản phẩm làm đẹp", icon: "🎁", productCount: 280 },

  // Danh mục: Giày Dép Nam
  { id: "gdn-bot", slug: "gdn-bot", name: "Bốt", icon: "👢", productCount: 180 },
  { id: "gdn-giay-the-thao-sneakers", slug: "gdn-giay-the-thao-sneakers", name: "Giày Thể Thao/ Sneakers", icon: " sneakers", productCount: 320 },
  { id: "gdn-giay-suc", slug: "gdn-giay-suc", name: "Giày Sục", icon: " slip-on", productCount: 160 },
  { id: "gdn-giay-tay-luoi", slug: "gdn-giay-tay-luoi", name: "Giày Tây Lười", icon: " loafers", productCount: 210 },
  { id: "gdn-giay-oxfords-buoc-day", slug: "gdn-giay-oxfords-buoc-day", name: "Giày Oxfords & Giày Buộc Dây", icon: " formal-shoes", productCount: 250 },
  { id: "gdn-xang-dan-dep", slug: "gdn-xang-dan-dep", name: "Xăng-đan và Dép", icon: " sandals", productCount: 280 },
  { id: "gdn-phu-kien-giay-dep", slug: "gdn-phu-kien-giay-dep", name: "Phụ kiện giày dép", icon: " shoe care", productCount: 180 },
  { id: "gdn-khac", slug: "gdn-khac", name: "Khác", icon: "misc", productCount: 150 },

  // Danh mục: Bách Hóa Online
  { id: "bhon-do-an-vat", slug: "bhon-do-an-vat", name: "Đồ ăn vặt", icon: "🍪", productCount: 420 },
  { id: "bhon-do-che-bien-san", slug: "bhon-do-che-bien-san", name: "Đồ chế biến sẵn", icon: " cooked-food", productCount: 380 },
  { id: "bhon-nhu-yeu-pham", slug: "bhon-nhu-yeu-pham", name: "Nhu yếu phẩm", icon: " hygiene", productCount: 520 },
  { id: "bhon-nguyen-lieu-nau-an", slug: "bhon-nguyen-lieu-nau-an", name: "Nguyên liệu nấu ăn", icon: " ingredients", productCount: 420 },
  { id: "bhon-do-lam-banh", slug: "bhon-do-lam-banh", name: "Đồ làm bánh", icon: " baking", productCount: 280 },
  { id: "bhon-sua-trung", slug: "bhon-sua-trung", name: "Sữa - trứng", icon: " milk-eggs", productCount: 320 },
  { id: "bhon-do-uong", slug: "bhon-do-uong", name: "Đồ uống", icon: " beverages", productCount: 480 },
  { id: "bhon-ngu-coc-mut", slug: "bhon-ngu-coc-mut", name: "Ngũ cốc & mứt", icon: " cereals-jams", productCount: 220 },
  { id: "bhon-cac-loai-banh", slug: "bhon-cac-loai-banh", name: "Các loại bánh", icon: " baked-goods", productCount: 320 },
  { id: "bhon-do-uong-co-con", slug: "bhon-do-uong-co-con", name: "Đồ uống có cồn", icon: " alcoholic", productCount: 180 },
  { id: "bhon-bo-qua-tang", slug: "bhon-bo-qua-tang", name: "Bộ quà tặng", icon: " gifts", productCount: 280 },
  { id: "bhon-thuc-pham-tuoi-song", slug: "bhon-thuc-pham-tuoi-song", name: "Thực phẩm tươi sống và thực phẩm đông lạnh", icon: " fresh-frozen", productCount: 380 },
  { id: "bhon-khac", slug: "bhon-khac", name: "Khác", icon: "misc", productCount: 250 },

  // Danh mục: Đồ Chơi
  { id: "do-choi-so-thich-suu-tam", slug: "do-choi-so-thich-suu-tam", name: "Sở thích & Sưu tầm", icon: " hobbies-collectibles", productCount: 180 },
  { id: "do-choi-giai-tri", slug: "do-choi-giai-tri", name: "Đồ chơi giải trí", icon: " entertainment", productCount: 280 },
  { id: "do-choi-giao-duc", slug: "do-choi-giao-duc", name: "Đồ chơi giáo dục", icon: " educational", productCount: 220 },
  { id: "do-choi-cho-tre-so-sinh", slug: "do-choi-cho-tre-so-sinh", name: "Đồ chơi cho trẻ sơ sinh & trẻ nhỏ", icon: " infant-toddler", productCount: 320 },
  { id: "do-choi-van-dong-ngoai-troi", slug: "do-choi-van-dong-ngoai-troi", name: "Đồ chơi vận động & ngoài trời", icon: " outdoor-active", productCount: 280 },
  { id: "do-choi-bup-be-noi-bong", slug: "do-choi-bup-be-noi-bong", name: "Búp bê & Đồ chơi nhồi bông", icon: " dolls-stuffed", productCount: 250 },

  // Danh mục: Mẹ & Bé
  { id: "mebe-do-dung-du-lich", slug: "mebe-do-dung-du-lich", name: "Đồ dùng du lịch cho bé", icon: " travel-gear", productCount: 180 },
  { id: "mebe-do-dung-an-dam", slug: "mebe-do-dung-an-dam", name: "Đồ dùng ăn dặm cho bé", icon: " feeding-gear", productCount: 280 },
  { id: "mebe-phu-kien-cho-me", slug: "mebe-phu-kien-cho-me", name: "Phụ kiện cho mẹ", icon: " mom-accessories", productCount: 220 },
  { id: "mebe-cham-soc-suc-khoe-me", slug: "mebe-cham-soc-suc-khoe-me", name: "Chăm sóc sức khỏe mẹ", icon: " maternal-health", productCount: 320 },
  { id: "mebe-do-dung-phong-tam", slug: "mebe-do-dung-phong-tam", name: "Đồ dùng phòng tắm & Chăm sóc cơ thể bé", icon: " bathing-care", productCount: 380 },
  { id: "mebe-do-dung-phong-ngu", slug: "mebe-do-dung-phong-ngu", name: "Đồ dùng phòng ngủ cho bé", icon: " bedroom-items", productCount: 280 },
  { id: "mebe-an-toan-cho-be", slug: "mebe-an-toan-cho-be", name: "An toàn cho bé", icon: " safety-gear", productCount: 220 },
  { id: "mebe-thuc-pham-cho-be", slug: "mebe-thuc-pham-cho-be", name: "Thực phẩm cho bé", icon: " baby-food", productCount: 420 },
  { id: "mebe-cham-soc-suc-khoe-be", slug: "mebe-cham-soc-suc-khoe-be", name: "Chăm sóc sức khỏe bé", icon: " child-health", productCount: 380 },
  { id: "mebe-ta-bo-em-be", slug: "mebe-ta-bo-em-be", name: "Tã & bô em bé", icon: " diapers-potty", productCount: 520 },
  { id: "mebe-do-choi", slug: "mebe-do-choi", name: "Đồ chơi", icon: " toys", productCount: 380 },
  { id: "mebe-bo-goi-qua-tang", slug: "mebe-bo-goi-qua-tang", name: "Bộ & Gói quà tặng", icon: " gift-sets", productCount: 280 },
  { id: "mebe-khac", slug: "mebe-khac", name: "Khác", icon: "misc", productCount: 220 },
  { id: "mebe-sua-cong-thuc-tren-24", slug: "mebe-sua-cong-thuc-tren-24", name: "Sữa công thức trên 24 tháng", icon: " toddler-milk", productCount: 280 },
  { id: "mebe-sua-cong-thuc-0-24", slug: "mebe-sua-cong-thuc-0-24", name: "Sữa công thức 0-24 tháng tuổi", icon: " infant-milk", productCount: 320 },

  // Danh mục: Máy Ảnh & Máy Quay Phim
  { id: "may-anh-may-quay", slug: "may-anh-may-quay", name: "Máy ảnh - Máy quay phim", icon: " cameras", productCount: 280 },
  { id: "may-anh-camera-giam-sat", slug: "may-anh-camera-giam-sat", name: "Camera giám sát & Camera hệ thống", icon: " surveillance", productCount: 220 },
  { id: "may-anh-the-nho", slug: "may-anh-the-nho", name: "Thẻ nhớ", icon: " memory-cards", productCount: 320 },
  { id: "may-anh-ong-kinh", slug: "may-anh-ong-kinh", name: "Ống kính", icon: " lenses", productCount: 280 },
  { id: "may-anh-phu-kien", slug: "may-anh-phu-kien", name: "Phụ kiện máy ảnh", icon: " camera-accessories", productCount: 380 },
  { id: "may-anh-may-bay-camera", slug: "may-anh-may-bay-camera", name: "Máy bay camera & Phụ kiện", icon: " drones", productCount: 220 },

  // Danh mục: Túi Ví Nữ
  { id: "tvn-balô-nu", slug: "tvn-balô-nu", name: "Ba Lô Nữ", icon: " backpacks", productCount: 280 },
  { id: "tvn-cap-laptop", slug: "tvn-cap-laptop", name: "Cặp Laptop", icon: " laptop-bags", productCount: 180 },
  { id: "tvn-vi-du-tiec-vi-cam-tay", slug: "tvn-vi-du-tiec-vi-cam-tay", name: "Ví Dự Tiệc & Ví Cầm Tay", icon: " clutch-wallets", productCount: 220 },
  { id: "tvn-tui-deo-hong-nguc", slug: "tvn-tui-deo-hong-nguc", name: "Túi Đeo Hông & Túi Đeo Ngực", icon: " waist-bags", productCount: 180 },
  { id: "tvn-tui-tote", slug: "tvn-tui-tote", name: "Túi Tote", icon: " tote-bags", productCount: 280 },
  { id: "tvn-tui-quai-xach", slug: "tvn-tui-quai-xach", name: "Túi Quai Xách", icon: " handbags", productCount: 320 },
  { id: "tvn-tui-deo-cheo-deo-vai", slug: "tvn-tui-deo-cheo-deo-vai", name: "Túi Đeo Chéo & Túi Đeo Vai", icon: " crossbody-shoulder", productCount: 420 },
  { id: "tvn-vi-bop-nu", slug: "tvn-vi-bop-nu", name: "Ví/Bóp Nữ", icon: " wallets", productCount: 380 },
  { id: "tvn-phu-kien-tui", slug: "tvn-phu-kien-tui", name: "Phụ Kiện Túi", icon: " bag-accessories", productCount: 220 },
  { id: "tvn-khac", slug: "tvn-khac", name: "Khác", icon: "misc", productCount: 280 },

  // Danh mục: Ô Tô & Xe Máy & Xe Đạp
  { id: "otoxe-dien", slug: "otoxe-dien", name: "Xe đạp, xe điện", icon: " bicycles", productCount: 280 },
  { id: "otoxe-moto-xe-may", slug: "otoxe-moto-xe-may", name: "Mô tô, xe máy", icon: " motorcycles", productCount: 380 },
  { id: "otoxe-o-to", slug: "otoxe-o-to", name: "Xe Ô tô", icon: " cars", productCount: 580 },
  { id: "otoxe-mu-bao-hiem", slug: "otoxe-mu-bao-hiem", name: "Mũ bảo hiểm", icon: " helmets", productCount: 320 },
  { id: "otoxe-phu-kien-xe-may", slug: "otoxe-phu-kien-xe-may", name: "Phụ kiện xe máy", icon: " motorcycle-accessories", productCount: 420 },
  { id: "otoxe-phu-kien-xe-dap", slug: "otoxe-phu-kien-xe-dap", name: "Phụ kiện xe đạp", icon: " bicycle-accessories", productCount: 280 },
  { id: "otoxe-phu-kien-ben-trong", slug: "otoxe-phu-kien-ben-trong", name: "Phụ kiện bên trong ô tô", icon: " car-interior", productCount: 320 },
  { id: "otoxe-dau-nhot-dau-nhon", slug: "otoxe-dau-nhot-dau-nhon", name: "Dầu nhớt & dầu nhờn", icon: " oils", productCount: 280 },
  { id: "otoxe-phu-tung-o-to", slug: "otoxe-phu-tung-o-to", name: "Phụ tùng ô tô", icon: " car-parts", productCount: 480 },
  { id: "otoxe-phu-tung-xe-may", slug: "otoxe-phu-tung-xe-may", name: "Phụ tùng xe máy", icon: " motorcycle-parts", productCount: 380 },
  { id: "otoxe-phu-kien-ben-ngoai", slug: "otoxe-phu-kien-ben-ngoai", name: "Phụ kiện bên ngoài ô tô", icon: " car-exterior", productCount: 320 },
  { id: "otoxe-cham-soc-o-to", slug: "otoxe-cham-soc-o-to", name: "Chăm sóc ô tô", icon: " car-care", productCount: 280 },
  { id: "otoxe-dich-vu-cho-xe", slug: "otoxe-dich-vu-cho-xe", name: "Dịch vụ cho xe", icon: " vehicle-services", productCount: 220 },

  // Danh mục: Giặt Giũ & Chăm Sóc Nhà Cửa
  { id: "ggcsn-giat-giu-cham-soc", slug: "ggcsn-giat-giu-cham-soc", name: "Giặt giũ & Chăm sóc nhà cửa", icon: " laundry-care", productCount: 380 },
  { id: "ggcsn-giay-ve-sinh-khan-giay", slug: "ggcsn-giay-ve-sinh-khan-giay", name: "Giấy vệ sinh, khăn giấy", icon: " tissue-paper", productCount: 280 },
  { id: "ggcsn-ve-sinh-nha-cua", slug: "ggcsn-ve-sinh-nha-cua", name: "Vệ sinh nhà cửa", icon: " home-cleaning", productCount: 320 },
  { id: "ggcsn-ve-sinh-bat-dia", slug: "ggcsn-ve-sinh-bat-dia", name: "Vệ sinh bát đĩa", icon: " dish-cleaning", productCount: 220 },
  { id: "ggcsn-dung-cu-ve-sinh", slug: "ggcsn-dung-cu-ve-sinh", name: "Dụng cụ vệ sinh", icon: " cleaning-tools", productCount: 280 },
  { id: "ggcsn-chat-khu-mui-lam-thom", slug: "ggcsn-chat-khu-mui-lam-thom", name: "Chất khử mùi, làm thơm", icon: " air-fresheners", productCount: 320 },
  { id: "ggcsn-thuoc-diet-con-trung", slug: "ggcsn-thuoc-diet-con-trung", name: "Thuốc diệt côn trùng", icon: " pest-control", productCount: 180 },
  { id: "ggcsn-tui-mang-boc-thuc-pham", slug: "ggcsn-tui-mang-boc-thuc-pham", name: "Túi, màng bọc thực phẩm", icon: " food-storage", productCount: 220 },
  { id: "ggcsn-bao-bi-tui-dung-rac", slug: "ggcsn-bao-bi-tui-dung-rac", name: "Bao bì, túi đựng rác", icon: " waste-bags", productCount: 280 },
]

// Export mock products and shops with sample data
export const MOCK_PRODUCTS: MockProduct[] = [
  {
    id: "prod-1",
    handle: "ao-so-mi-trang",
    name: "Áo sơ mi trắng",
    title: "Áo sơ mi trắng",
    description: "Áo sơ mi trắng chất liệu cotton thoáng mát",
    price: 299000,
    originalPrice: 399000,
    images: ["/logo1.png"],
    thumbnail: "/logo1.png",
    rating: 4.5,
    reviewCount: 120,
    shopId: "shop-1",
    categoryIds: ["nam-ao"],
    attributes: { color: "white", size: "M" },
    inventory: 50,
    qrCode: "qr-123",
    certifications: ["ISO 9001", "OEKO-TEX"],
    shippingInfo: {
      freeShip: true,
      expressDelivery: true,
      estimatedArrival: "1-2 ngày"
    },
    sold: 150,
    brand: "Fashion Brand",
    verified: true,
    shopName: "Cửa hàng thời trang",
    variants: [
      {
        id: "variant-1",
        options: { color: "white", size: "S" },
        price: 299000,
        inventory: 10,
        stock: 10,
        title: "Áo sơ mi trắng size S"
      },
      {
        id: "variant-2",
        options: { color: "white", size: "M" },
        price: 299000,
        inventory: 15,
        stock: 15,
        title: "Áo sơ mi trắng size M"
      }
    ],
    specs: [
      { name: "Chất liệu", value: "100% Cotton" },
      { name: "Màu sắc", value: "Trắng" },
      { name: "Kiểu dáng", value: "Regular fit" }
    ]
  }
];

export const MOCK_SHOPS: MockShop[] = [
  {
    id: "shop-1",
    name: "Cửa hàng thời trang",
    handle: "thoi-trang-shop",
    description: "Chuyên cung cấp các sản phẩm thời trang chất lượng cao",
    rating: 4.7,
    totalOrders: 1200,
    responseRate: 98,
    responseTime: "Dưới 1h",
    followerCount: 5000,
    totalProducts: 150,
    isVerified: true,
    isOfficial: true,
    avatar: "/logo1.png",
    coverImage: "/logov.png",
    contactInfo: {
      hotline: "1900 1234",
      email: "info@thoitrangshop.vn"
    },
    businessHours: {
      open: "8:00",
      close: "22:00"
    },
    address: "123 Đường ABC, Quận XYZ, TP.HCM",
    location: {
      lat: 10.7756,
      lng: 106.7009
    },
    categories: ["nam-thoi-trang", "nu-thoi-trang"],
    joinDate: "2023-01-15",
    logo: "/logo1.png",
    productCount: 150,
    verified: true,
    certificationLevel: "gold",
    joinedAt: "2023-01-15"
  }
];

// Export utility functions
export const findCategoryBySlug = (slug: string): MockCategory | undefined => {
  return MOCK_CATEGORIES.find(category => category.slug === slug);
};

export const MOCK_ORDERS = [];

// Other mock data and functions would go here
export const findOrderByCode = (code: string) => {
  // Implementation would go here
  return null;
};

export const findProductByHandle = (handle: string) => {
  // Implementation would go here
  return MOCK_PRODUCTS.find(product => product.handle === handle);
};

export const findShopById = (id: string) => {
  // Implementation would go here
  return MOCK_SHOPS.find(shop => shop.id === id);
};