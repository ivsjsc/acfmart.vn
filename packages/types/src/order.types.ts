export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';

export interface OrderItem {
  id: string;
  productId: string;
  sellerId: string;
  name: string;
  thumbnail?: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  address: string;
}

export interface Order {
  id: string;
  userId: string;
  orderCode: string;
  status: OrderStatus;
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  shippingAddress: ShippingAddress;
  note?: string;
  affiliateCode?: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}
