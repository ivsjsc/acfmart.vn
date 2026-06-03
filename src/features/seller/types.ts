import type { ShippingOriginPayload } from '../../lib/warehouse-routing';

export type SellerStatus = 'pending' | 'active' | 'suspended' | 'rejected';
export type SellerKycLevel = 'none' | 'basic' | 'verified' | 'premium';
export type BusinessType = 'individual' | 'household' | 'company';

export interface SellerProfile {
  id: string;
  shopId: string;
  shopName: string;
  shopLogo: string;
  shopBanner?: string;
  shopSlug: string;
  ownerName: string;
  email: string;
  phone: string;
  status: SellerStatus;
  kycLevel: SellerKycLevel;
  businessType: BusinessType;
  taxCode?: string;
  registeredAt: string;
  description?: string;
  pickupAddress: {
    fullAddress: string;
    ward: string;
    district: string;
    city: string;
  };
  bankAccount?: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };
}

export type SellerOrderStatus =
  | 'payment_pending'
  | 'awaiting_confirm'
  | 'confirmed'
  | 'packed'
  | 'ready_pickup'
  | 'shipping'
  | 'delivered'
  | 'completed'
  | 'cancelled'
  | 'return_requested'
  | 'returned'
  | 'refunded';

export interface SellerOrder {
  id: string;
  code: string;
  buyerName: string;
  buyerPhone: string;
  status: SellerOrderStatus;
  createdAt: string;
  paymentStatus: 'paid' | 'pending' | 'cod';
  paymentMethod: string;
  shippingMethod: string;
  requiresShipping: boolean;
  shippingProviderId?: string;
  shippingProviderName?: string;
  shippingServiceCode?: string;
  shippingOrigin?: ShippingOriginPayload;
  shippingFee: number;
  total: number;
  items: Array<{
    productId: string;
    variantId: string;
    sku: string;
    title: string;
    image: string;
    quantity: number;
    price: number;
  }>;
  shippingAddress: {
    name: string;
    phone: string;
    address: string;
    ward: string;
    district: string;
    city: string;
  };
  customerNote?: string;
  trackingNumber?: string;
  shippingStatusCode?: number;
  shippingStatusText?: string;
  shippingLabelUrl?: string;
  cancelReason?: string;
  returnReason?: string;
}

export interface SellerProduct {
  id: string;
  title: string;
  handle: string;
  status: 'draft' | 'active' | 'out_of_stock' | 'archived';
  thumbnail: string;
  category: string;
  brand: string;
  basePrice: number;
  totalStock: number;
  totalSold: number;
  variants: number;
  rating: number;
  reviewCount: number;
  views: number;
  conversionRate: number;
  acfVerified: boolean;
  createdAt: string;
}

export interface SellerStats {
  revenue: {
    today: number;
    last7Days: number;
    last30Days: number;
    pendingPayout: number;
  };
  orders: {
    awaitingConfirm: number;
    awaitingPack: number;
    shipping: number;
    completed: number;
    cancelled: number;
    returnRequests: number;
  };
  products: {
    active: number;
    outOfStock: number;
    draft: number;
    lowStock: number;
  };
  performance: {
    onTimeShippingRate: number;
    cancelRate: number;
    avgResponseMinutes: number;
    customerRating: number;
    followerCount: number;
  };
}

export interface RevenueDataPoint {
  date: string;
  revenue: number;
  orders: number;
}
