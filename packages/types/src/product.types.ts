export type ProductStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Product {
  id: string;
  sellerId: string;
  categoryId: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  comparePrice?: number;
  costPrice?: number;
  sku?: string;
  stock: number;
  images: string[];
  thumbnail?: string;
  brand?: string;
  origin?: string;
  status: ProductStatus;
  isActive: boolean;
  isFeatured: boolean;
  rating: number;
  reviewCount: number;
  soldCount: number;
  viewCount: number;
  qrCode?: string;
  approvedAt?: string;
  rejectedReason?: string;
  createdAt: string;
  updatedAt: string;
  seller?: { shopName: string; shopSlug: string; logo?: string; isVerified: boolean };
  category?: { name: string; slug: string };
}

export interface ProductListResponse {
  items: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
