/**
 * Central type definitions for the storefront application
 */

import type { ShippingOriginPayload } from "./lib/warehouse-routing"

export interface Order {
  id: string
  code: string
  status:
    | "pending"
    | "confirmed"
    | "packed"
    | "shipping"
    | "delivered"
    | "cancelled"
    | "return_requested"
    | "returned"
    | "refunded"
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
  shippingProviderId?: string
  shippingReason?: string
  shippingOrigin?: ShippingOriginPayload
  timeline: Array<{
    status: string
    timestamp: string
    note?: string
  }>
}

export type LiveStreamStatus = "scheduled" | "live" | "ended" | "cancelled"

/**
 * LiveStream — Firestore `streams/{id}` document, client-safe fields only.
 * The seller-only Cloudflare fields (`cloudflare_uid`, `cloudflare_rtmps_url`,
 * `cloudflare_rtmps_stream_key`, `cloudflare_playback_uid`) are NOT exposed
 * here — they are blocked from client SDK reads by Firestore rules and only
 * returned via the `getStreamCredentials` callable to the stream owner.
 */
export interface LiveStream {
  id: string
  vendor_id: string
  host_name: string
  host_avatar: string | null
  title: string
  description: string | null
  thumbnail_url: string | null
  category: string | null
  status: LiveStreamStatus
  scheduled_start_at: string
  actual_start_at: string | null
  ended_at: string | null
  hls_url: string | null
  firestore_room_id: string | null
  peak_viewers: number
  total_views: number
  verified_origin: boolean
}

// Re-export domain types
export type { Product, Shop, Category } from './types/domain'
