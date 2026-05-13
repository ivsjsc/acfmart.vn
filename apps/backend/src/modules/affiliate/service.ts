import { MedusaService } from "@medusajs/framework/utils"
import {
  AffiliateAccount,
  AffiliateClick,
  AffiliateCommission,
  AffiliateLink,
  AffiliatePayout,
} from "./models"

class AffiliateModuleService extends MedusaService({
  AffiliateAccount,
  AffiliateLink,
  AffiliateClick,
  AffiliateCommission,
  AffiliatePayout,
}) {
  async findAccountByCustomer(customerId: string) {
    const [acc] = await this.listAffiliateAccounts({ customer_id: customerId })
    return acc ?? null
  }

  async findAccountByFirebaseUid(firebaseUid: string) {
    const [acc] = await this.listAffiliateAccounts({
      firebase_uid: firebaseUid,
    })
    return acc ?? null
  }

  async findLinkByShortCode(shortCode: string) {
    const [link] = await this.listAffiliateLinks({ short_code: shortCode })
    return link ?? null
  }

  /**
   * Tạo click event đồng thời cập nhật cache stats trên link.
   */
  async recordClick(input: {
    short_code: string
    visitor_id: string
    ip_hash?: string
    user_agent?: string
    referer?: string
    utm_source?: string
    utm_medium?: string
    utm_campaign?: string
  }) {
    const link = await this.findLinkByShortCode(input.short_code)
    if (!link) return null

    if (link.status !== "active") {
      // Vẫn track nhưng không count vào active stats
      return null
    }

    const click = await this.createAffiliateClicks({
      visitor_id: input.visitor_id,
      ip_hash: input.ip_hash,
      user_agent: input.user_agent,
      referer: input.referer,
      utm_source: input.utm_source,
      utm_medium: input.utm_medium,
      utm_campaign: input.utm_campaign,
      link_id: link.id,
    })

    // Check unique click (visitor_id chưa từng click link này)
    const previousClicks = await this.listAffiliateClicks({
      link_id: link.id,
      visitor_id: input.visitor_id,
    })
    const isUnique = previousClicks.length <= 1 // chính click vừa tạo + maybe 0

    await this.updateAffiliateLinks({
      id: link.id,
      clicks: link.clicks + 1,
      unique_clicks: isUnique ? link.unique_clicks + 1 : link.unique_clicks,
      last_click_at: new Date(),
    })

    return { click, link }
  }

  /**
   * Khi 1 đơn được tạo, tìm click gần nhất của visitor trong cookie window
   * (mặc định 30 ngày) và gán conversion.
   */
  async attributeOrderToClick(input: {
    visitor_id: string
    order_id: string
    order_total: number
    customer_id: string
    attribution_days?: number
  }) {
    const days = input.attribution_days ?? 30
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    const clicks = await this.listAffiliateClicks(
      { visitor_id: input.visitor_id },
      { order: { created_at: "DESC" }, take: 50 }
    )

    const eligibleClick = clicks.find(
      (c) =>
        c.converted_order_id === null && new Date((c as any).created_at) >= cutoff
    )
    if (!eligibleClick) return null

    await this.updateAffiliateClicks({
      id: eligibleClick.id,
      converted_order_id: input.order_id,
      converted_at: new Date(),
    })

    // Resolve link + account, compute commission
    const link = await this.retrieveAffiliateLink(eligibleClick.link_id)
    const account = await this.retrieveAffiliateAccount(link.account_id)

    if (account.customer_id === input.customer_id) {
      // Không tự thưởng cho bản thân
      return null
    }

    const commissionBps = link.commission_bps ?? account.default_commission_bps
    const commissionAmount = Math.floor(
      (input.order_total * commissionBps) / 10000
    )

    const commission = await this.createAffiliateCommissions({
      order_id: input.order_id,
      order_total: input.order_total,
      commission_amount: commissionAmount,
      commission_bps: commissionBps,
      status: "pending",
      account_id: account.id,
      link_id: link.id,
    })

    await this.updateAffiliateLinks({
      id: link.id,
      conversions: link.conversions + 1,
    })

    await this.updateAffiliateAccounts({
      id: account.id,
      total_conversions: account.total_conversions + 1,
      pending_commission:
        Number(account.pending_commission) + commissionAmount,
    })

    return commission
  }

  /** Settle pending → confirmed sau khi đơn delivered + qua return window */
  async confirmCommission(commissionId: string) {
    const com = await this.retrieveAffiliateCommission(commissionId)
    if (com.status !== "pending") return com

    await this.updateAffiliateCommissions({
      id: com.id,
      status: "confirmed",
      confirmed_at: new Date(),
    })
    return com
  }

  /** Mark confirmed → paid khi payout xong */
  async settleCommissions(commissionIds: string[], payoutId: string) {
    await this.updateAffiliateCommissions(
      commissionIds.map((id) => ({
        id,
        status: "paid",
        paid_at: new Date(),
        payout_id: payoutId,
      }))
    )
  }
}

export default AffiliateModuleService
