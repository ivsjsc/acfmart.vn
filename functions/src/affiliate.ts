import { onDocumentCreated, onDocumentUpdated } from "firebase-functions/v2/firestore"
import { defineString } from "firebase-functions/params"
import * as admin from "firebase-admin"
import * as logger from "firebase-functions/logger"

const db = admin.firestore()

// Đơn vị: basis points (BPS) — 500 BPS = 5%. Cùng đơn vị với
// affiliateLinks.commission_bps / affiliateProfile.default_commission_bps trong
// Firestore, KHÁC với PLATFORM_COMMISSION_RATE (decimal 0.05) ở finance.ts.
// Thứ tự ưu tiên: link → profile → env này → fallback 500 (5%).
const AFFILIATE_DEFAULT_COMMISSION_BPS = defineString(
  "AFFILIATE_DEFAULT_COMMISSION_BPS",
  { default: "500" }
)

interface OrderDocData {
  customerId?: string
  code?: string
  total?: number
  grandTotal?: number
  paymentStatus?: string
  payment_status?: string
  affiliate_id?: string
  affiliateId?: string
  affiliate_link_id?: string
  affiliateLinkId?: string
  affiliate_code?: string
  affiliateCode?: string
  affiliate?: Record<string, unknown>
  referral?: Record<string, unknown>
}

function stringValue(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null
}

function numberValue(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0
}

function firstString(...values: unknown[]): string | null {
  for (const value of values) {
    const text = stringValue(value)
    if (text) return text
  }
  return null
}

function isPaidOrder(order: OrderDocData): boolean {
  return ["paid", "completed", "settled"].includes(
    String(order.paymentStatus ?? order.payment_status ?? "")
  )
}

function getAttribution(order: OrderDocData): {
  affiliateId: string | null
  linkId: string | null
  code: string | null
} {
  const affiliate = order.affiliate ?? {}
  const referral = order.referral ?? {}
  return {
    affiliateId: firstString(
      order.affiliate_id,
      order.affiliateId,
      affiliate.affiliate_id,
      affiliate.affiliateId,
      referral.affiliate_id,
      referral.affiliateId
    ),
    linkId: firstString(
      order.affiliate_link_id,
      order.affiliateLinkId,
      affiliate.link_id,
      affiliate.linkId,
      referral.link_id,
      referral.linkId
    ),
    code: firstString(
      order.affiliate_code,
      order.affiliateCode,
      affiliate.code,
      affiliate.short_code,
      affiliate.shortCode,
      referral.code,
      referral.short_code,
      referral.shortCode
    ),
  }
}

async function resolveAffiliateLink(
  attribution: ReturnType<typeof getAttribution>
): Promise<admin.firestore.DocumentSnapshot | null> {
  if (attribution.linkId) {
    const byId = await db.collection("affiliateLinks").doc(attribution.linkId).get()
    if (byId.exists) return byId
  }

  if (attribution.code) {
    const byCode = await db
      .collection("affiliateLinks")
      .where("short_code", "==", attribution.code)
      .limit(1)
      .get()
    if (!byCode.empty) return byCode.docs[0]

    const byId = await db.collection("affiliateLinks").doc(attribution.code).get()
    if (byId.exists) return byId
  }

  return null
}

async function recordCommissionForOrder(orderId: string, eventOrder: OrderDocData): Promise<void> {
  if (!isPaidOrder(eventOrder)) return

  const attribution = getAttribution(eventOrder)
  if (!attribution.linkId && !attribution.code) {
    logger.info("affiliate commission skipped: no attribution", { orderId })
    return
  }

  const linkSnap = await resolveAffiliateLink(attribution)
  if (!linkSnap?.exists) {
    logger.warn("affiliate commission skipped: link not found", { orderId, attribution })
    return
  }

  const linkData = linkSnap.data() ?? {}
  const affiliateId =
    attribution.affiliateId ??
    stringValue(linkData.affiliate_id) ??
    stringValue(linkData.affiliateId)

  if (!affiliateId) {
    logger.warn("affiliate commission skipped: missing affiliate owner", {
      orderId,
      linkId: linkSnap.id,
    })
    return
  }

  if (eventOrder.customerId && eventOrder.customerId === affiliateId) {
    logger.warn("affiliate commission skipped: self-referral", {
      orderId,
      affiliateId,
    })
    return
  }

  const idempotencyKey = `commission:${orderId}:${linkSnap.id}`
  const txRef = db
    .collection("users")
    .doc(affiliateId)
    .collection("affiliateTransactions")
    .doc(idempotencyKey)
  const orderRef = db.collection("orders").doc(orderId)
  const linkRef = db.collection("affiliateLinks").doc(linkSnap.id)
  const profileRef = db
    .collection("users")
    .doc(affiliateId)
    .collection("affiliateProfile")
    .doc("current")

  await db.runTransaction(async (tx) => {
    const [existingTx, orderSnap, currentLinkSnap, profileSnap] = await Promise.all([
      tx.get(txRef),
      tx.get(orderRef),
      tx.get(linkRef),
      tx.get(profileRef),
    ])

    if (existingTx.exists) return
    if (!orderSnap.exists || !isPaidOrder(orderSnap.data() as OrderDocData)) return

    const order = orderSnap.data() as OrderDocData
    const currentLink = currentLinkSnap.data() ?? linkData
    const currentProfile = profileSnap.data() ?? {}
    const owner = stringValue(currentLink.affiliate_id) ?? stringValue(currentLink.affiliateId)
    if (owner && owner !== affiliateId) {
      throw new Error(`Affiliate link owner mismatch for order ${orderId}`)
    }

    const orderTotal = numberValue(order.total ?? order.grandTotal)
    if (orderTotal <= 0) return

    const envDefaultBps = Number(AFFILIATE_DEFAULT_COMMISSION_BPS.value()) || 500
    const rawBps =
      numberValue(currentLink.commission_bps) ||
      numberValue(currentLink.commissionBps) ||
      numberValue(currentProfile.default_commission_bps) ||
      numberValue(currentProfile.defaultCommissionBps) ||
      envDefaultBps
    const commissionBps = Math.min(Math.max(Math.round(rawBps), 0), 10000)
    if (commissionBps <= 0) return

    const amount = Math.floor((orderTotal * commissionBps) / 10000)
    if (amount <= 0) return

    tx.set(txRef, {
      type: "commission",
      amount,
      status: "pending",
      description: `Hoa hồng từ đơn ${order.code ?? orderId}`,
      order_id: orderId,
      order_code: order.code ?? null,
      link_id: linkSnap.id,
      idempotency_key: idempotencyKey,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    })

    tx.update(linkRef, {
      conversions: admin.firestore.FieldValue.increment(1),
      total_commission: admin.firestore.FieldValue.increment(amount),
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    })

    tx.set(
      profileRef,
      {
        customer_id: affiliateId,
        status: "active",
        tier: currentProfile.tier ?? "bronze",
        default_commission_bps: currentProfile.default_commission_bps ?? envDefaultBps,
        pending_commission: admin.firestore.FieldValue.increment(amount),
        lifetime_commission: admin.firestore.FieldValue.increment(amount),
        total_conversions: admin.firestore.FieldValue.increment(1),
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
        created_at: currentProfile.created_at ?? admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    )
  })

  logger.info("affiliate commission recorded", {
    orderId,
    affiliateId,
    linkId: linkSnap.id,
  })
}

export const onAffiliateOrderCreated = onDocumentCreated(
  { document: "orders/{orderId}", region: "asia-southeast1" },
  async (event) => {
    const order = event.data?.data() as OrderDocData | undefined
    if (!order) return
    await recordCommissionForOrder(event.params.orderId, order)
  }
)

export const onAffiliateOrderPaid = onDocumentUpdated(
  { document: "orders/{orderId}", region: "asia-southeast1" },
  async (event) => {
    const before = event.data?.before.data() as OrderDocData | undefined
    const after = event.data?.after.data() as OrderDocData | undefined
    if (!before || !after) return
    if (isPaidOrder(before) || !isPaidOrder(after)) return
    await recordCommissionForOrder(event.params.orderId, after)
  }
)
