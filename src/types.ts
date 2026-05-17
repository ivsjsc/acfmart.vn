/**
 * Central type definitions for the storefront application
 */

export interface Order {
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

// Re-export domain types
export type { Product, Shop, Category } from './types/domain'
