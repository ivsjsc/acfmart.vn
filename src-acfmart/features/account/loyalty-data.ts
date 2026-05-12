export type LoyaltyTier = "silver" | "gold" | "platinum" | "diamond"

export interface LoyaltyPointTransaction {
  id: string
  date: string
  type: "earn" | "redeem" | "expire" | "adjust"
  points: number
  description: string
  orderCode?: string
  voucherCode?: string
}

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

export const MOCK_LOYALTY_STATE = {
  currentPoints: 2_540,
  totalEarned: 8_950,
  totalSpent: 12_450_000,
  pointsExpiringSoon: 320,
  expireDate: "2026-06-30",
  tier: "gold" as LoyaltyTier,
  nextTier: "platinum" as LoyaltyTier,
}

export const MOCK_POINT_TRANSACTIONS: LoyaltyPointTransaction[] = [
  {
    id: "lp1",
    date: "2026-05-12T10:30:00Z",
    type: "earn",
    points: 120,
    description: "Mua hàng đơn ACF24051200001",
    orderCode: "ACF24051200001",
  },
  {
    id: "lp2",
    date: "2026-05-12T10:35:00Z",
    type: "earn",
    points: 50,
    description: "Đánh giá sản phẩm",
    orderCode: "ACF24051200001",
  },
  {
    id: "lp3",
    date: "2026-05-10T14:00:00Z",
    type: "redeem",
    points: -500,
    description: "Đổi voucher ACFMOI50K",
    voucherCode: "ACFMOI50K",
  },
  {
    id: "lp4",
    date: "2026-05-08T09:00:00Z",
    type: "earn",
    points: 99,
    description: "Mua hàng đơn ACF24050800002",
    orderCode: "ACF24050800002",
  },
  {
    id: "lp5",
    date: "2026-05-02T11:00:00Z",
    type: "earn",
    points: 18,
    description: "Mua hàng đơn ACF24050200007",
    orderCode: "ACF24050200007",
  },
  {
    id: "lp6",
    date: "2026-04-30T23:59:00Z",
    type: "expire",
    points: -150,
    description: "Điểm hết hạn",
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
