/**
 * Domain types for the ACFMART application
 * These types represent the core business entities
 */

export interface Product {
  id: string;
  handle: string;
  name: string;
  title?: string;
  description: string;
  price: number;
  originalPrice?: number;
  compareAtPrice?: number;
  images: string[];
  thumbnail: string;
  rating: number;
  reviewCount: number;
  shopId: string;
  categoryIds: string[];
  categorySlug?: string;
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
  sold?: number;
  brand?: string;
  verified?: boolean;
  shopName?: string;
  variants?: Variant[];
  specs?: ProductSpec[];
}

export interface Variant {
  id: string;
  options: { [key: string]: string };
  price?: number;
  inventory: number;
  stock?: number;
  title?: string;
}

export interface ProductSpec {
  name: string;
  value: string;
}

export interface Shop {
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
  logo?: string;
  productCount?: number;
  verified?: boolean;
  certificationLevel?: string;
  joinedAt?: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  icon: string;
  productCount: number;
}
