import type { AppDomain } from "../lib/domain"

/** A single configurable image slot within a portal dashboard. */
export interface PortalImageSlot {
  /** URL of the image (paste from Firebase Storage, CDN, etc.) */
  image_url: string
  /** Optional destination URL when user clicks the image */
  link_url: string
  /** Alt-text / admin label */
  alt: string
}

/**
 * Per-portal UI configuration stored in Firestore.
 *
 * Collection: `portalConfig`
 * Document ID: the portal name ("buyer" | "seller" | "social")
 *
 * Each document contains a flat `images` map where the key is a
 * well-known slot name (e.g. "hero_banner", "feed_card") and the
 * value is a {@link PortalImageSlot}.
 *
 * Admins manage these via Admin Console → Hình ảnh Portal.
 */
export interface PortalConfig {
  portal: AppDomain
  images: Record<string, PortalImageSlot>
  updated_at?: unknown
  updated_by?: string
}

/**
 * Well-known image slot definitions per portal.
 * Used by the admin UI to render labelled input rows.
 */
export interface SlotDefinition {
  key: string
  label: string
  hint: string
}

/** Predefined slots for each portal dashboard. */
export const PORTAL_SLOTS: Record<string, SlotDefinition[]> = {
  buyer: [
    { key: "hero_banner", label: "Banner trang chủ", hint: "1200×400 · Hiển thị dưới slider banner chính" },
    { key: "promo_banner", label: "Banner khuyến mãi", hint: "1200×300 · Hiển thị giữa trang chủ" },
    { key: "category_banner", label: "Banner danh mục", hint: "1200×200 · Hiển thị trên phần danh mục" },
  ],
  seller: [
    { key: "hero_banner", label: "Banner Seller Center", hint: "1200×300 · Hiển thị trên dashboard seller" },
    { key: "promo_banner", label: "Banner thông báo", hint: "1200×200 · Thông báo / khuyến mãi cho seller" },
  ],
  social: [
    { key: "hero_banner", label: "Banner chính Social", hint: "1200×400 · Hiển thị trên dashboard social" },
    { key: "feed_card", label: "Ảnh Bảng tin", hint: "600×400 · Card Bảng tin Cộng đồng" },
    { key: "community_card", label: "Ảnh Cộng đồng", hint: "600×400 · Card Cộng đồng ACF" },
    { key: "affiliate_card", label: "Ảnh Affiliate", hint: "600×400 · Card Affiliate Marketing" },
    { key: "live_card", label: "Ảnh Live Commerce", hint: "600×400 · Card Live Commerce" },
    { key: "trending_card", label: "Ảnh Xu hướng", hint: "600×400 · Card Xu hướng" },
    { key: "aivy_card", label: "Ảnh Aivy AI", hint: "600×400 · Card Aivy AI" },
    { key: "aivy_cta", label: "Banner Aivy CTA", hint: "400×300 · Sidebar Aivy AI" },
    { key: "affiliate_cta", label: "Banner Affiliate CTA", hint: "400×300 · Sidebar Affiliate" },
  ],
}
