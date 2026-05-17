export type LoyaltyTier = "silver" | "gold" | "platinum" | "diamond"

export interface LoyaltyTierMeta {
  id: LoyaltyTier
  label: string
  minSpend: number
  color: string
  bgGradient: string
  perks: string[]
}

export const TIERS: LoyaltyTierMeta[] = [
  {
    id: "silver",
    label: "Bạc",
    minSpend: 0,
    color: "text-neutral-700",
    bgGradient: "from-neutral-300 to-neutral-500",
    perks: [
      "Tích 1 điểm cho mỗi 10.000đ",
      "Voucher sinh nhật cơ bản",
    ],
  },
  {
    id: "gold",
    label: "Vàng",
    minSpend: 5_000_000,
    color: "text-brand-gold-700",
    bgGradient: "from-brand-gold-400 to-brand-gold-700",
    perks: [
      "Tích 1.5 điểm cho mỗi 10.000đ",
      "Freeship 3 đơn/tháng",
      "Voucher sinh nhật 100K",
      "Ưu tiên CSKH",
    ],
  },
  {
    id: "platinum",
    label: "Bạch kim",
    minSpend: 20_000_000,
    color: "text-violet-700",
    bgGradient: "from-violet-400 to-violet-700",
    perks: [
      "Tích 2 điểm cho mỗi 10.000đ",
      "Freeship 8 đơn/tháng",
      "Voucher sinh nhật 300K",
      "Ưu tiên CSKH 24/7",
      "Early access live sale",
    ],
  },
  {
    id: "diamond",
    label: "Kim cương",
    minSpend: 50_000_000,
    color: "text-cyan-700",
    bgGradient: "from-cyan-400 to-cyan-700",
    perks: [
      "Tích 3 điểm cho mỗi 10.000đ",
      "Freeship không giới hạn",
      "Voucher sinh nhật 1 triệu",
      "Quà tặng độc quyền hàng tháng",
      "Personal Aivy concierge",
    ],
  },
]

export interface PointsRedeemOption {
  id: string
  title: string
  description: string
  pointsCost: number
  voucherCode: string
  voucherValue: number
  type: "voucher" | "freeship" | "cashback"
}

export const REDEEM_OPTIONS: PointsRedeemOption[] = [
  {
    id: "r1",
    title: "Voucher giảm 30K",
    description: "Áp dụng cho đơn từ 200K",
    pointsCost: 300,
    voucherCode: "POINT30K",
    voucherValue: 30000,
    type: "voucher",
  },
  {
    id: "r2",
    title: "Freeship toàn quốc",
    description: "Áp dụng 1 đơn bất kỳ",
    pointsCost: 200,
    voucherCode: "POINTFREESHIP",
    voucherValue: 30000,
    type: "freeship",
  },
  {
    id: "r3",
    title: "Voucher giảm 100K",
    description: "Áp dụng cho đơn từ 800K",
    pointsCost: 1000,
    voucherCode: "POINT100K",
    voucherValue: 100000,
    type: "voucher",
  },
  {
    id: "r4",
    title: "Voucher giảm 500K",
    description: "Áp dụng cho đơn từ 3 triệu",
    pointsCost: 5000,
    voucherCode: "POINT500K",
    voucherValue: 500000,
    type: "voucher",
  },
  {
    id: "r5",
    title: "Hoàn 50K vào ví",
    description: "Cashback trực tiếp",
    pointsCost: 500,
    voucherCode: "CASHBACK50K",
    voucherValue: 50000,
    type: "cashback",
  },
]

export function getTierMeta(tier: LoyaltyTier): LoyaltyTierMeta {
  return TIERS.find((t) => t.id === tier)!
}

export function getTierProgress(spent: number, tier: LoyaltyTier, nextTier: LoyaltyTier) {
  const next = getTierMeta(nextTier)
  const current = getTierMeta(tier)
  const remaining = Math.max(0, next.minSpend - spent)
  const progress = Math.min(
    100,
    ((spent - current.minSpend) / (next.minSpend - current.minSpend)) * 100
  )
  return { remaining, progress, nextTierLabel: next.label }
}
