// =============================================================================
// Commission Service — Self-check #2
// Formula: gross = (price - shopDiscount) * industryRate
//          net   = gross - platformFee - payoutFee
// =============================================================================

import {
  getIndustryRate,
  PLATFORM_FEE_RATE,
  PAYOUT_FEE_VND,
} from '../lib/industryRates';
import type {
  CommissionBreakdown,
  Industry,
  AffiliateTier,
} from '../types';

export function calculateCommission(params: {
  price: number;
  shopDiscount: number;
  industry: Industry;
  tier: AffiliateTier;
}): CommissionBreakdown {
  const { price, shopDiscount, industry, tier } = params;

  if (price < 0) throw new Error('Giá không hợp lệ');
  if (shopDiscount < 0) throw new Error('Giảm giá âm');
  if (shopDiscount >= price) throw new Error('Giảm giá ≥ giá bán');

  const effectivePrice = Math.max(0, price - shopDiscount);
  const industryRate = getIndustryRate(industry, tier);
  const grossCommission = round2(effectivePrice * industryRate);
  const platformFee = round2(grossCommission * PLATFORM_FEE_RATE);
  const payoutFee = PAYOUT_FEE_VND;
  const netCommission = Math.max(0, round2(grossCommission - platformFee - payoutFee));

  return {
    price,
    shopDiscount,
    effectivePrice,
    industry,
    industryRate,
    grossCommission,
    platformFee,
    payoutFee,
    netCommission,
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
