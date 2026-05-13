import { MedusaError, MedusaService } from "@medusajs/framework/utils"
import {
  LoyaltyAccount,
  LoyaltyTransaction,
  RedemptionOption,
} from "./models"

const TIER_THRESHOLDS = {
  silver: 0,
  gold: 5_000_000,
  platinum: 20_000_000,
  diamond: 50_000_000,
} as const

const TIER_EARN_MULTIPLIER = {
  silver: 1.0,
  gold: 1.5,
  platinum: 2.0,
  diamond: 3.0,
} as const

const POINTS_PER_VND = 1 / 10_000 // 1 point per 10,000 VND

class LoyaltyModuleService extends MedusaService({
  LoyaltyAccount,
  LoyaltyTransaction,
  RedemptionOption,
}) {
  async getOrCreateAccount(customerId: string, firebaseUid?: string) {
    const existing = await this.listLoyaltyAccounts({ customer_id: customerId })
    if (existing.length) return existing[0]
    return this.createLoyaltyAccounts({
      customer_id: customerId,
      firebase_uid: firebaseUid,
    })
  }

  computeEarn(orderTotalVnd: number, tier: keyof typeof TIER_EARN_MULTIPLIER) {
    const base = Math.floor(orderTotalVnd * POINTS_PER_VND)
    const multiplier = TIER_EARN_MULTIPLIER[tier]
    return Math.floor(base * multiplier)
  }

  computeTier(lifetimeSpend: number): keyof typeof TIER_THRESHOLDS {
    if (lifetimeSpend >= TIER_THRESHOLDS.diamond) return "diamond"
    if (lifetimeSpend >= TIER_THRESHOLDS.platinum) return "platinum"
    if (lifetimeSpend >= TIER_THRESHOLDS.gold) return "gold"
    return "silver"
  }

  /** Earn points sau khi đơn hàng được delivered */
  async earnFromOrder(input: {
    customer_id: string
    order_id: string
    order_total: number
    expires_days?: number
  }) {
    const account = await this.getOrCreateAccount(input.customer_id)
    const points = this.computeEarn(input.order_total, account.tier)
    if (points <= 0) return null

    const expiresAt = input.expires_days
      ? new Date(Date.now() + input.expires_days * 24 * 60 * 60 * 1000)
      : null

    const tx = await this.createLoyaltyTransactions({
      type: "earn",
      points,
      description: `Mua hàng đơn ${input.order_id}`,
      reference_type: "order",
      reference_id: input.order_id,
      expires_at: expiresAt,
      account_id: account.id,
    })

    const newLifetimeSpend = Number(account.lifetime_spend) + input.order_total
    const newTier = this.computeTier(newLifetimeSpend)

    await this.updateLoyaltyAccounts({
      id: account.id,
      balance: account.balance + points,
      total_earned: account.total_earned + points,
      lifetime_spend: newLifetimeSpend,
      tier: newTier,
      tier_anniversary:
        newTier !== account.tier ? new Date() : account.tier_anniversary,
    })

    return { account, transaction: tx, points }
  }

  /** Earn từ review */
  async earnFromReview(input: {
    customer_id: string
    order_id: string
    review_id: string
    points?: number
  }) {
    const account = await this.getOrCreateAccount(input.customer_id)
    const points = input.points ?? 50

    const tx = await this.createLoyaltyTransactions({
      type: "earn",
      points,
      description: "Đánh giá sản phẩm",
      reference_type: "review",
      reference_id: input.review_id,
      account_id: account.id,
    })

    await this.updateLoyaltyAccounts({
      id: account.id,
      balance: account.balance + points,
      total_earned: account.total_earned + points,
    })

    return { account, transaction: tx, points }
  }

  async redeem(input: { customer_id: string; option_id: string }) {
    const [account] = await this.listLoyaltyAccounts({
      customer_id: input.customer_id,
    })
    if (!account) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        "Loyalty account not found"
      )
    }

    const option = await this.retrieveRedemptionOption(input.option_id)
    if (!option.active) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "Option không khả dụng"
      )
    }
    if (account.balance < option.points_cost) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "Bạn không đủ điểm"
      )
    }
    if (option.stock !== null && option.redeemed_count >= option.stock) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "Quà tặng đã hết"
      )
    }

    const tx = await this.createLoyaltyTransactions({
      type: "redeem",
      points: -option.points_cost,
      description: `Đổi ${option.title}`,
      reference_type: "redemption_option",
      reference_id: option.id,
      account_id: account.id,
    })

    await this.updateLoyaltyAccounts({
      id: account.id,
      balance: account.balance - option.points_cost,
      total_redeemed: account.total_redeemed + option.points_cost,
    })

    await this.updateRedemptionOptions({
      id: option.id,
      redeemed_count: option.redeemed_count + 1,
    })

    return { account, transaction: tx, option }
  }
}

export default LoyaltyModuleService
