/**
 * Mock data tạm thời cho frontend khi backend Medusa chưa chạy.
 * Khi backend sẵn sàng, thay các hook trong features/* bằng useQuery + sdk.store.product.list(...)
 */

export interface MockCategory {
  id: string
  slug: string
  name: string
  icon: string
  description?: string
  productCount: number
}

export interface MockProduct {
  id: string
  handle: string
  title: string
  description: string
  price: number
  originalPrice?: number
  images: string[]
  shopId: string
  shopName: string
  brand: string
  categorySlug: string
  rating: number
  reviewCount: number
  sold: number
  verified: boolean
  variants?: MockVariant[]
  specs?: { label: string; value: string }[]
}

export interface MockVariant {
  id: string
  title: string
  sku: string
  price: number
  stock: number
  options: Record<string, string>
}

export interface MockShop {
  id: string
  name: string
  logo: string
  rating: number
  followerCount: number
  productCount: number
  verified: boolean
  certificationLevel: "gold" | "silver" | "bronze"
  joinedAt: string
  responseRate: number
  responseTime: string
}

export interface MockOrder {
  id: string
  code: string
  status: "pending" | "confirmed" | "packed" | "shipping" | "delivered" | "cancelled" | "returned"
  createdAt: string
  total: number
  shippingFee: number
  items: Array<{
    productId: string
    variantId: string
    title: string
    image: string
    price: number
    quantity: number
    shopName: string
  }>
  shippingAddress: {
    name: string
    phone: string
    address: string
    ward: string
    district: string
    city: string
  }
  paymentMethod: string
  trackingNumber?: string
  timeline: Array<{
    status: string
    timestamp: string
    note?: string
  }>
}

export const MOCK_CATEGORIES: MockCategory[] = [
  { id: "c1", slug: "my-pham", name: "Mỹ phẩm", icon: "💄", productCount: 1250 },
  { id: "c2", slug: "thoi-trang", name: "Thời trang", icon: "👗", productCount: 3420 },
  { id: "c3", slug: "dien-tu", name: "Điện tử", icon: "📱", productCount: 890 },
  { id: "c4", slug: "suc-khoe", name: "Sức khoẻ", icon: "💊", productCount: 560 },
  { id: "c5", slug: "me-be", name: "Mẹ & Bé", icon: "👶", productCount: 780 },
  { id: "c6", slug: "gia-dung", name: "Gia dụng", icon: "🍳", productCount: 1100 },
  { id: "c7", slug: "thuc-pham", name: "Thực phẩm", icon: "🥬", productCount: 450 },
  { id: "c8", slug: "sach", name: "Sách", icon: "📚", productCount: 320 },
]

export const MOCK_SHOPS: MockShop[] = [
  {
    id: "s1",
    name: "Natural Beauty Shop",
    logo: "https://placehold.co/100x100/dc2626/ffffff?text=NB",
    rating: 4.9,
    followerCount: 124000,
    productCount: 230,
    verified: true,
    certificationLevel: "gold",
    joinedAt: "2023-01-15",
    responseRate: 98,
    responseTime: "trong 1 giờ",
  },
  {
    id: "s2",
    name: "TechZone VN",
    logo: "https://placehold.co/100x100/f59e0b/ffffff?text=TZ",
    rating: 4.8,
    followerCount: 89000,
    productCount: 540,
    verified: true,
    certificationLevel: "gold",
    joinedAt: "2022-06-20",
    responseRate: 96,
    responseTime: "trong 2 giờ",
  },
  {
    id: "s3",
    name: "Skin Lab",
    logo: "https://placehold.co/100x100/22c55e/ffffff?text=SL",
    rating: 4.7,
    followerCount: 56000,
    productCount: 180,
    verified: true,
    certificationLevel: "silver",
    joinedAt: "2023-08-10",
    responseRate: 92,
    responseTime: "trong 3 giờ",
  },
  {
    id: "s4",
    name: "Sunhouse Official",
    logo: "https://placehold.co/100x100/0ea5e9/ffffff?text=SH",
    rating: 4.9,
    followerCount: 234000,
    productCount: 320,
    verified: true,
    certificationLevel: "gold",
    joinedAt: "2021-03-05",
    responseRate: 99,
    responseTime: "trong 30 phút",
  },
]

export const MOCK_PRODUCTS: MockProduct[] = [
  {
    id: "p1",
    handle: "son-duong-spf15-natural-beauty",
    title: "Son Dưỡng Môi SPF 15 Natural Beauty 4g",
    description:
      "Son dưỡng môi chiết xuất thiên nhiên với SPF 15, dưỡng ẩm 24h, chống nắng cho môi. Đã được Quỹ Chống Hàng Giả Việt Nam xác thực 100% chính hãng.",
    price: 180000,
    originalPrice: 250000,
    images: [
      "https://placehold.co/600x600/dc2626/ffffff?text=Son+Dưỡng+1",
      "https://placehold.co/600x600/b91c1c/ffffff?text=Son+Dưỡng+2",
      "https://placehold.co/600x600/991b1b/ffffff?text=Son+Dưỡng+3",
    ],
    shopId: "s1",
    shopName: "Natural Beauty Shop",
    brand: "Natural Beauty",
    categorySlug: "my-pham",
    rating: 4.8,
    reviewCount: 342,
    sold: 1240,
    verified: true,
    variants: [
      { id: "v1-1", title: "Hồng nude", sku: "ACF-SON-001-NUDE", price: 180000, stock: 50, options: { Màu: "Hồng nude" } },
      { id: "v1-2", title: "Đỏ cam", sku: "ACF-SON-001-RED", price: 180000, stock: 32, options: { Màu: "Đỏ cam" } },
    ],
    specs: [
      { label: "Xuất xứ", value: "Việt Nam" },
      { label: "Dung tích", value: "4g" },
      { label: "Hạn sử dụng", value: "24 tháng" },
      { label: "Thành phần chính", value: "Beeswax, Vitamin E, SPF 15" },
    ],
  },
  {
    id: "p2",
    handle: "tai-nghe-khong-day-pro-anc",
    title: "Tai Nghe Không Dây Pro ANC Chống Ồn Chủ Động",
    description:
      "Tai nghe không dây cao cấp với công nghệ chống ồn chủ động ANC, pin 40h, kết nối Bluetooth 5.3, codec aptX HD. Bảo hành 12 tháng chính hãng.",
    price: 990000,
    originalPrice: 1490000,
    images: [
      "https://placehold.co/600x600/f59e0b/ffffff?text=Tai+Nghe+1",
      "https://placehold.co/600x600/d97706/ffffff?text=Tai+Nghe+2",
    ],
    shopId: "s2",
    shopName: "TechZone VN",
    brand: "TechZone",
    categorySlug: "dien-tu",
    rating: 4.9,
    reviewCount: 156,
    sold: 532,
    verified: true,
    variants: [
      { id: "v2-1", title: "Đen", sku: "ACF-TN-001-BLK", price: 990000, stock: 25, options: { Màu: "Đen" } },
      { id: "v2-2", title: "Trắng", sku: "ACF-TN-001-WHT", price: 990000, stock: 18, options: { Màu: "Trắng" } },
    ],
    specs: [
      { label: "Bluetooth", value: "5.3" },
      { label: "Pin", value: "40 giờ (case)" },
      { label: "Chống ồn", value: "ANC -35dB" },
      { label: "Bảo hành", value: "12 tháng" },
    ],
  },
  {
    id: "p3",
    handle: "mat-na-vitamin-c-30-mieng",
    title: "Mặt Nạ Vitamin C Hộp 30 Miếng Skin Lab",
    description:
      "Mặt nạ giấy chứa Vitamin C 5%, làm sáng da, mờ thâm. Hộp 30 miếng dùng trong 1 tháng.",
    price: 280000,
    originalPrice: 350000,
    images: ["https://placehold.co/600x600/22c55e/ffffff?text=Mặt+Nạ"],
    shopId: "s3",
    shopName: "Skin Lab",
    brand: "Skin Lab",
    categorySlug: "my-pham",
    rating: 4.7,
    reviewCount: 89,
    sold: 890,
    verified: true,
    variants: [{ id: "v3-1", title: "Hộp 30 miếng", sku: "ACF-MN-001", price: 280000, stock: 100, options: { Loại: "Hộp 30 miếng" } }],
  },
  {
    id: "p4",
    handle: "noi-chien-khong-dau-5l-sunhouse",
    title: "Nồi Chiên Không Dầu 5L Sunhouse SHD6655",
    description:
      "Nồi chiên không dầu Sunhouse dung tích 5L, công suất 1500W, 8 chế độ nấu tự động, bảo hành 24 tháng.",
    price: 1490000,
    originalPrice: 1990000,
    images: ["https://placehold.co/600x600/0ea5e9/ffffff?text=Nồi+Chiên"],
    shopId: "s4",
    shopName: "Sunhouse Official",
    brand: "Sunhouse",
    categorySlug: "gia-dung",
    rating: 4.9,
    reviewCount: 412,
    sold: 2150,
    verified: true,
    variants: [{ id: "v4-1", title: "5L", sku: "ACF-NC-001-5L", price: 1490000, stock: 80, options: { "Dung tích": "5L" } }],
    specs: [
      { label: "Dung tích", value: "5 lít" },
      { label: "Công suất", value: "1500W" },
      { label: "Chế độ nấu", value: "8 chế độ tự động" },
      { label: "Bảo hành", value: "24 tháng" },
    ],
  },
  {
    id: "p5",
    handle: "sua-rua-mat-cetaphil-500ml",
    title: "Sữa Rửa Mặt Cetaphil Gentle Skin Cleanser 500ml",
    description:
      "Sữa rửa mặt dịu nhẹ Cetaphil, dành cho mọi loại da, không xà phòng, không hương liệu.",
    price: 450000,
    originalPrice: 590000,
    images: ["https://placehold.co/600x600/8b5cf6/ffffff?text=Sữa+Rửa"],
    shopId: "s3",
    shopName: "Pharmacy Plus",
    brand: "Cetaphil",
    categorySlug: "suc-khoe",
    rating: 4.8,
    reviewCount: 567,
    sold: 3400,
    verified: true,
    variants: [{ id: "v5-1", title: "500ml", sku: "ACF-CET-001", price: 450000, stock: 200, options: { "Dung tích": "500ml" } }],
  },
  {
    id: "p6",
    handle: "ao-thun-cotton-premium-unisex",
    title: "Áo Thun Cotton Premium Unisex – Fashion House",
    description: "Áo thun cotton 100% mềm mịn, dáng unisex, 5 màu cơ bản. Đóng gói chính hãng.",
    price: 199000,
    originalPrice: 299000,
    images: ["https://placehold.co/600x600/ec4899/ffffff?text=Áo+Thun"],
    shopId: "s1",
    shopName: "Fashion House",
    brand: "Fashion House",
    categorySlug: "thoi-trang",
    rating: 4.6,
    reviewCount: 1234,
    sold: 5600,
    verified: false,
    variants: ["S", "M", "L", "XL"].flatMap((size) =>
      ["Đen", "Trắng", "Xám"].map((color) => ({
        id: `v6-${size}-${color}`,
        title: `${size} - ${color}`,
        sku: `ACF-AT-001-${size}-${color}`,
        price: 199000,
        stock: 30,
        options: { Size: size, Màu: color },
      }))
    ),
  },
]

export const MOCK_ORDERS: MockOrder[] = [
  {
    id: "o1",
    code: "ACF24051200001",
    status: "shipping",
    createdAt: "2026-05-10T10:30:00Z",
    total: 1170000,
    shippingFee: 30000,
    items: [
      {
        productId: "p1",
        variantId: "v1-1",
        title: "Son Dưỡng Môi SPF 15 - Hồng nude",
        image: "https://placehold.co/100x100/dc2626/ffffff?text=Son",
        price: 180000,
        quantity: 2,
        shopName: "Natural Beauty Shop",
      },
      {
        productId: "p5",
        variantId: "v5-1",
        title: "Sữa Rửa Mặt Cetaphil 500ml",
        image: "https://placehold.co/100x100/8b5cf6/ffffff?text=Sữa",
        price: 450000,
        quantity: 1,
        shopName: "Pharmacy Plus",
      },
    ],
    shippingAddress: {
      name: "Nguyễn Văn A",
      phone: "0901234567",
      address: "Số 1, Đường Láng",
      ward: "Phường Láng Hạ",
      district: "Đống Đa",
      city: "Hà Nội",
    },
    paymentMethod: "Momo",
    trackingNumber: "GHN-VN-1234567",
    timeline: [
      { status: "Đặt hàng thành công", timestamp: "2026-05-10T10:30:00Z" },
      { status: "Đã xác nhận", timestamp: "2026-05-10T11:00:00Z", note: "Shop đã xác nhận đơn" },
      { status: "Đã đóng gói", timestamp: "2026-05-10T15:00:00Z" },
      { status: "Đang giao", timestamp: "2026-05-11T08:00:00Z", note: "GHN nhận hàng" },
    ],
  },
  {
    id: "o2",
    code: "ACF24050800002",
    status: "delivered",
    createdAt: "2026-05-08T14:00:00Z",
    total: 1020000,
    shippingFee: 30000,
    items: [
      {
        productId: "p2",
        variantId: "v2-1",
        title: "Tai Nghe Không Dây Pro - Đen",
        image: "https://placehold.co/100x100/f59e0b/ffffff?text=Tai",
        price: 990000,
        quantity: 1,
        shopName: "TechZone VN",
      },
    ],
    shippingAddress: {
      name: "Nguyễn Văn A",
      phone: "0901234567",
      address: "Số 1, Đường Láng",
      ward: "Phường Láng Hạ",
      district: "Đống Đa",
      city: "Hà Nội",
    },
    paymentMethod: "VNPay",
    trackingNumber: "GHTK-VN-9876543",
    timeline: [
      { status: "Đặt hàng thành công", timestamp: "2026-05-08T14:00:00Z" },
      { status: "Đã xác nhận", timestamp: "2026-05-08T14:30:00Z" },
      { status: "Đã đóng gói", timestamp: "2026-05-08T17:00:00Z" },
      { status: "Đang giao", timestamp: "2026-05-09T08:00:00Z" },
      { status: "Giao thành công", timestamp: "2026-05-10T11:30:00Z" },
    ],
  },
]

export function findProductByHandle(handle: string) {
  return MOCK_PRODUCTS.find((p) => p.handle === handle)
}

export function findProductById(id: string) {
  return MOCK_PRODUCTS.find((p) => p.id === id)
}

export function findCategoryBySlug(slug: string) {
  return MOCK_CATEGORIES.find((c) => c.slug === slug)
}

export function findShopById(id: string) {
  return MOCK_SHOPS.find((s) => s.id === id)
}

export function getProductsByCategory(slug: string) {
  return MOCK_PRODUCTS.filter((p) => p.categorySlug === slug)
}

export function searchProducts(query: string) {
  const q = query.toLowerCase()
  return MOCK_PRODUCTS.filter(
    (p) =>
      p.title.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
  )
}

export function findOrderByCode(code: string) {
  return MOCK_ORDERS.find((o) => o.code === code || o.id === code)
}
