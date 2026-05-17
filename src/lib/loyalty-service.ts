import {
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  Timestamp,
  type DocumentData,
} from "firebase/firestore"
import { auth, firestore } from "./firebase"
import { serviceOk, toServiceError, type ServiceResult } from "./service-result"

export type LoyaltyTier = "silver" | "gold" | "platinum" | "diamond"
export type LoyaltyTransactionType = "earn" | "redeem" | "expire" | "adjust"

export interface LoyaltyAccount {
  id: string
  customer_id: string
  balance: number
  total_earned: number
  total_redeemed: number
  total_expired: number
  lifetime_spend: number
  tier: LoyaltyTier
  tier_anniversary: string | null
}

export interface LoyaltyTransaction {
  id: string
  type: LoyaltyTransactionType
  points: number
  description: string
  reference_type: string | null
  reference_id: string | null
  expires_at: string | null
  expired_at: string | null
  created_at: string
  idempotency_key?: string
}

export interface RedeemPointsInput {
  user_id: string
  option_id: string
  points_cost: number
  voucher_code?: string
  voucher_value?: number
  reward_type?: "voucher" | "freeship" | "cashback"
  idempotency_key?: string
}

export interface RecordLoyaltyEarnInput {
  user_id: string
  order_id: string
  idempotency_key?: string
  description?: string
}

const LOYALTY_STATE = "loyaltyState"
const LOYALTY_TRANSACTIONS = "loyaltyTransactions"
const TIERS: LoyaltyTier[] = ["silver", "gold", "platinum", "diamond"]

const TIER_MIN_SPEND: Record<LoyaltyTier, number> = {
  silver: 0,
  gold: 5_000_000,
  platinum: 20_000_000,
  diamond: 50_000_000,
}

const TIER_MULTIPLIER: Record<LoyaltyTier, number> = {
  silver: 1,
  gold: 1.5,
  platinum: 2,
  diamond: 3,
}

async function requireCurrentUid(expectedUid?: string): Promise<string> {
  await auth.authStateReady()
  const currentUid = auth.currentUser?.uid
  if (!currentUid) throw new Error("Bạn cần đăng nhập để sử dụng điểm thưởng")
  if (expectedUid && expectedUid !== currentUid) {
    throw new Error("Bạn không có quyền truy cập dữ liệu điểm thưởng này")
  }
  return expectedUid ?? currentUid
}

function loyaltyStateRef(uid: string) {
  return doc(firestore, "users", uid, LOYALTY_STATE, "current")
}

function loyaltyTransactionRef(uid: string, id: string) {
  return doc(firestore, "users", uid, LOYALTY_TRANSACTIONS, id)
}

function loyaltyTransactionsRef(uid: string) {
  return collection(firestore, "users", uid, LOYALTY_TRANSACTIONS)
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback
}

function asNullableString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null
}

function asTimestampIso(value: unknown, fallback = new Date(0).toISOString()): string {
  if (value instanceof Timestamp) return value.toDate().toISOString()
  if (value instanceof Date) return value.toISOString()
  if (typeof value === "string" && value.trim()) return value
  return fallback
}

function normalizeTier(value: unknown): LoyaltyTier {
  return TIERS.includes(value as LoyaltyTier) ? (value as LoyaltyTier) : "silver"
}

function normalizeTransactionType(value: unknown): LoyaltyTransactionType {
  return ["earn", "redeem", "expire", "adjust"].includes(value as string)
    ? (value as LoyaltyTransactionType)
    : "adjust"
}

function tierFromSpend(spend: number): LoyaltyTier {
  if (spend >= TIER_MIN_SPEND.diamond) return "diamond"
  if (spend >= TIER_MIN_SPEND.platinum) return "platinum"
  if (spend >= TIER_MIN_SPEND.gold) return "gold"
  return "silver"
}

function normalizeLoyaltyAccount(
  uid: string,
  data: DocumentData | null
): LoyaltyAccount {
  const lifetimeSpend = asNumber(data?.lifetime_spend ?? data?.lifetimeSpend)
  const tier = normalizeTier(data?.tier ?? tierFromSpend(lifetimeSpend))

  return {
    id: "current",
    customer_id: uid,
    balance: asNumber(data?.balance),
    total_earned: asNumber(data?.total_earned ?? data?.totalEarned),
    total_redeemed: asNumber(data?.total_redeemed ?? data?.totalRedeemed),
    total_expired: asNumber(data?.total_expired ?? data?.totalExpired),
    lifetime_spend: lifetimeSpend,
    tier,
    tier_anniversary: data?.tier_anniversary || data?.tierAnniversary
      ? asTimestampIso(data?.tier_anniversary ?? data?.tierAnniversary)
      : null,
  }
}

function normalizeLoyaltyTransaction(id: string, data: DocumentData): LoyaltyTransaction {
  return {
    id,
    type: normalizeTransactionType(data.type),
    points: asNumber(data.points),
    description: asString(data.description, "Giao dịch điểm thưởng"),
    reference_type: asNullableString(data.reference_type ?? data.referenceType),
    reference_id: asNullableString(data.reference_id ?? data.referenceId),
    expires_at: data.expires_at || data.expiresAt
      ? asTimestampIso(data.expires_at ?? data.expiresAt)
      : null,
    expired_at: data.expired_at || data.expiredAt
      ? asTimestampIso(data.expired_at ?? data.expiredAt)
      : null,
    created_at: asTimestampIso(data.created_at ?? data.createdAt),
    idempotency_key: asNullableString(data.idempotency_key ?? data.idempotencyKey) ?? undefined,
  }
}

function isPaidOrder(data: DocumentData): boolean {
  const paymentStatus = data.paymentStatus ?? data.payment_status
  return ["paid", "completed", "settled"].includes(paymentStatus)
}

function calculateEarnedPoints(orderTotal: number, tier: LoyaltyTier): number {
  return Math.max(0, Math.floor((orderTotal / 10_000) * TIER_MULTIPLIER[tier]))
}

export async function getLoyalty(
  uid?: string,
  limitCount = 100
): Promise<
  ServiceResult<{ account: LoyaltyAccount; transactions: LoyaltyTransaction[] }>
> {
  try {
    const currentUid = await requireCurrentUid(uid)
    const [stateSnap, txSnap] = await Promise.all([
      getDoc(loyaltyStateRef(currentUid)),
      getDocs(
        query(
          loyaltyTransactionsRef(currentUid),
          orderBy("created_at", "desc"),
          limit(limitCount)
        )
      ),
    ])

    const account = normalizeLoyaltyAccount(
      currentUid,
      stateSnap.exists() ? stateSnap.data() : null
    )
    const transactions = txSnap.docs.map((txDoc) =>
      normalizeLoyaltyTransaction(txDoc.id, txDoc.data())
    )

    return serviceOk({ account, transactions })
  } catch (err) {
    return toServiceError(err, "Không thể tải điểm thưởng")
  }
}

export async function redeemPoints(
  input: RedeemPointsInput
): Promise<ServiceResult<{ account: LoyaltyAccount; transaction: LoyaltyTransaction }>> {
  try {
    const currentUid = await requireCurrentUid(input.user_id)
    if (input.points_cost <= 0) throw new Error("Số điểm đổi thưởng không hợp lệ")

    const idempotencyKey =
      input.idempotency_key ||
      `redeem:${currentUid}:${input.option_id}:${Date.now()}`
    const stateRef = loyaltyStateRef(currentUid)
    const txRef = loyaltyTransactionRef(currentUid, idempotencyKey)

    const result = await runTransaction(firestore, async (tx) => {
      const [existingTx, stateSnap] = await Promise.all([
        tx.get(txRef),
        tx.get(stateRef),
      ])

      const currentAccount = normalizeLoyaltyAccount(
        currentUid,
        stateSnap.exists() ? stateSnap.data() : null
      )

      if (existingTx.exists()) {
        return {
          account: currentAccount,
          transaction: normalizeLoyaltyTransaction(existingTx.id, existingTx.data()),
        }
      }

      if (currentAccount.balance < input.points_cost) {
        throw new Error("Số dư điểm thưởng không đủ")
      }

      const now = Timestamp.now()
      const nextAccount: LoyaltyAccount = {
        ...currentAccount,
        balance: currentAccount.balance - input.points_cost,
        total_redeemed: currentAccount.total_redeemed + input.points_cost,
      }
      const txData = {
        type: "redeem" satisfies LoyaltyTransactionType,
        points: -input.points_cost,
        description: input.voucher_code
          ? `Đổi thưởng ${input.voucher_code}`
          : "Đổi điểm thưởng",
        reference_type: input.reward_type ?? "voucher",
        reference_id: input.option_id,
        voucher_code: input.voucher_code ?? null,
        voucher_value: input.voucher_value ?? null,
        expires_at: null,
        expired_at: null,
        idempotency_key: idempotencyKey,
        created_at: now,
        updated_at: serverTimestamp(),
      }

      tx.set(txRef, txData)
      tx.set(
        stateRef,
        {
          customer_id: currentUid,
          balance: nextAccount.balance,
          total_earned: nextAccount.total_earned,
          total_redeemed: nextAccount.total_redeemed,
          total_expired: nextAccount.total_expired,
          tier: nextAccount.tier,
          lifetime_spend: nextAccount.lifetime_spend,
          last_transaction_id: idempotencyKey,
          updated_at: serverTimestamp(),
          created_at: stateSnap.exists() ? stateSnap.data().created_at : serverTimestamp(),
        },
        { merge: true }
      )

      return {
        account: nextAccount,
        transaction: normalizeLoyaltyTransaction(idempotencyKey, txData),
      }
    })

    return serviceOk(result)
  } catch (err) {
    return toServiceError(err, "Không thể đổi điểm thưởng")
  }
}

export async function recordLoyaltyEarn(
  input: RecordLoyaltyEarnInput
): Promise<
  ServiceResult<{ account: LoyaltyAccount; transaction: LoyaltyTransaction; already_applied: boolean }>
> {
  try {
    await requireCurrentUid()
    const idempotencyKey = input.idempotency_key || `earn:${input.order_id}`
    const stateRef = loyaltyStateRef(input.user_id)
    const txRef = loyaltyTransactionRef(input.user_id, idempotencyKey)
    const orderRef = doc(firestore, "orders", input.order_id)

    const result = await runTransaction(firestore, async (tx) => {
      const [existingTx, stateSnap, orderSnap] = await Promise.all([
        tx.get(txRef),
        tx.get(stateRef),
        tx.get(orderRef),
      ])

      const currentAccount = normalizeLoyaltyAccount(
        input.user_id,
        stateSnap.exists() ? stateSnap.data() : null
      )

      if (existingTx.exists()) {
        return {
          account: currentAccount,
          transaction: normalizeLoyaltyTransaction(existingTx.id, existingTx.data()),
          already_applied: true,
        }
      }

      if (!orderSnap.exists() || !isPaidOrder(orderSnap.data())) {
        throw new Error("Chỉ ghi nhận điểm cho giao dịch đã thanh toán")
      }

      const orderData = orderSnap.data()
      const customerId = asString(orderData.customerId ?? orderData.customer_id)
      if (customerId !== input.user_id) {
        throw new Error("Đơn hàng không thuộc người dùng nhận điểm")
      }

      const orderTotal = asNumber(orderData.total ?? orderData.grandTotal)
      if (orderTotal <= 0) throw new Error("Giá trị đơn hàng không hợp lệ")

      const nextSpend = currentAccount.lifetime_spend + orderTotal
      const nextTier = tierFromSpend(nextSpend)
      const points = calculateEarnedPoints(orderTotal, currentAccount.tier)
      if (points <= 0) throw new Error("Đơn hàng chưa đủ điều kiện tích điểm")

      const now = Timestamp.now()
      const txData = {
        type: "earn" satisfies LoyaltyTransactionType,
        points,
        description:
          input.description ||
          `Tích điểm từ đơn ${asString(orderData.code ?? orderData.orderCode, input.order_id)}`,
        reference_type: "order",
        reference_id: input.order_id,
        expires_at: Timestamp.fromDate(
          new Date(now.toDate().getTime() + 365 * 24 * 60 * 60 * 1000)
        ),
        expired_at: null,
        idempotency_key: idempotencyKey,
        created_at: now,
        updated_at: serverTimestamp(),
      }

      tx.set(txRef, txData)
      tx.set(
        stateRef,
        {
          customer_id: input.user_id,
          balance: increment(points),
          total_earned: increment(points),
          total_redeemed: currentAccount.total_redeemed,
          total_expired: currentAccount.total_expired,
          lifetime_spend: increment(orderTotal),
          tier: nextTier,
          last_transaction_id: idempotencyKey,
          tier_anniversary:
            nextTier !== currentAccount.tier ? serverTimestamp() : currentAccount.tier_anniversary,
          updated_at: serverTimestamp(),
          created_at: stateSnap.exists() ? stateSnap.data().created_at : serverTimestamp(),
        },
        { merge: true }
      )

      return {
        account: {
          ...currentAccount,
          balance: currentAccount.balance + points,
          total_earned: currentAccount.total_earned + points,
          lifetime_spend: nextSpend,
          tier: nextTier,
          tier_anniversary:
            nextTier !== currentAccount.tier
              ? now.toDate().toISOString()
              : currentAccount.tier_anniversary,
        },
        transaction: normalizeLoyaltyTransaction(idempotencyKey, txData),
        already_applied: false,
      }
    })

    return serviceOk(result)
  } catch (err) {
    return toServiceError(err, "Không thể ghi nhận điểm thưởng")
  }
}
