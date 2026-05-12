// =============================================================================
// ACF Industry Commission Rates (barem) — Self-check #2
// =============================================================================

import type { Industry, AffiliateTier } from '../types';

// Base rate per industry (% on effectivePrice, NOT on gross price)
const BASE_RATES: Record<Industry, number> = {
  food: 0.08,
  beverage: 0.08,
  cosmetics: 0.12,
  electronics: 0.05,
  fashion: 0.10,
  home: 0.07,
  default: 0.07,
};

// Premium tier gets +2% bonus
const TIER_BONUS: Record<AffiliateTier, number> = {
  STANDARD: 0,
  PREMIUM: 0.02,
};

export function getIndustryRate(industry: Industry, tier: AffiliateTier): number {
  const base = BASE_RATES[industry] ?? BASE_RATES.default;
  return base + TIER_BONUS[tier];
}

// Attribution window in days per tier (Self-check #6)
export function getAttributionWindowDays(tier: AffiliateTier): number {
  return tier === 'PREMIUM' ? 30 : 7;
}

// Platform infrastructure fee on commission (not on price)
export const PLATFORM_FEE_RATE = 0.015;     // 1.5% of gross commission

// Flat bank payout fee per CSV batch (Phase 1)
export const PAYOUT_FEE_VND = 5_000;

// Industries → for category-to-industry mapping in router
export function inferIndustry(category: string): Industry {
  const c = category.toLowerCase();
  if (c.includes('food') || c.includes('thực phẩm') || c.includes('nông sản')) return 'food';
  if (c.includes('beverage') || c.includes('đồ uống')) return 'beverage';
  if (c.includes('cosmetic') || c.includes('mỹ phẩm') || c.includes('skincare')) return 'cosmetics';
  if (c.includes('electronic') || c.includes('điện tử') || c.includes('phone')) return 'electronics';
  if (c.includes('fashion') || c.includes('thời trang') || c.includes('quần áo')) return 'fashion';
  if (c.includes('home') || c.includes('nhà cửa') || c.includes('gia dụng')) return 'home';
  return 'default';
}
