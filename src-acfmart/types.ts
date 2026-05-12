/**
 * Central type definitions for ACFMart application
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

// Re-export commonly used types from features
export type { MockProduct as Product } from './lib/mock-data'
export type { MockShop as Shop } from './lib/mock-data'
export type { MockCategory as Category } from './lib/mock-data'
