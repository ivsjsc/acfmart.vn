import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  Timestamp,
  type DocumentData,
} from "firebase/firestore"
import { auth, firestore } from "./firebase"
import {
  serviceErr,
  serviceOk,
  toServiceError,
  type ServiceResult,
} from "./service-result"

export type WalletTransactionType =
  | "topup"
  | "payment"
  | "refund"
  | "cashback"
  | "withdraw"
  | "claim"
export type WalletTransactionStatus = "completed" | "pending" | "failed"
export type WalletMethod = "momo" | "zalopay" | "vnpay" | "bank" | "system"

export interface WalletAccount {
  id: string
  customer_id: string
  balance: number
  locked_balance: number
  total_claimed: number
  total_withdrawn: number
  updated_at: string | null
}

export interface WalletTransaction {
  id: string
  type: WalletTransactionType
  amount: number
  balance: number
  description: string
  date: string
  status: WalletTransactionStatus
  method?: WalletMethod
  reference_type?: string | null
  reference_id?: string | null
  idempotency_key?: string
}

export interface CreateTopupIntentInput {
  user_id: string
  amount: number
  method: Exclude<WalletMethod, "system">
  idempotency_key?: string
}

export interface WithdrawWalletInput {
  user_id: string
  amount: number
  method?: "bank" | "momo" | "zalopay"
  payout_account?: string
  idempotency_key?: string
}

export interface ClaimWalletRewardInput {
  user_id: string
  claim_id: string
  idempotency_key?: string
}

const WALLET_STATE = "walletState"
const WALLET_TRANSACTIONS = "walletTransactions"
const WALLET_CLAIMS = "walletClaims"

async function requireCurrentUid(expectedUid?: string): Promise<string> {
  await auth.authStateReady()
  const currentUid = auth.currentUser?.uid
  if (!currentUid) throw new Error("Bạn cần đăng nhập để sử dụng ví")
  if (expectedUid && expectedUid !== currentUid) {
    throw new Error("Bạn không có quyền truy cập ví này")
  }
  return expectedUid ?? currentUid
}

function walletStateRef(uid: string) {
  return doc(firestore, "users", uid, WALLET_STATE, "current")
}

function walletTransactionsRef(uid: string) {
  return collection(firestore, "users", uid, WALLET_TRANSACTIONS)
}

function walletTransactionRef(uid: string, transactionId: string) {
  return doc(firestore, "users", uid, WALLET_TRANSACTIONS, transactionId)
}

function walletClaimRef(uid: string, claimId: string) {
  return doc(firestore, "users", uid, WALLET_CLAIMS, claimId)
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

function normalizeWalletAccount(uid: string, data: DocumentData | null): WalletAccount {
  return {
    id: "current",
    customer_id: uid,
    balance: asNumber(data?.balance),
    locked_balance: asNumber(data?.locked_balance ?? data?.lockedBalance),
    total_claimed: asNumber(data?.total_claimed ?? data?.totalClaimed),
    total_withdrawn: asNumber(data?.total_withdrawn ?? data?.totalWithdrawn),
    updated_at:
      data?.updated_at || data?.updatedAt
        ? asTimestampIso(data?.updated_at ?? data?.updatedAt)
        : null,
  }
}

function normalizeWalletTransaction(id: string, data: DocumentData): WalletTransaction {
  return {
    id,
    type: (["topup", "payment", "refund", "cashback", "withdraw", "claim"].includes(data.type)
      ? data.type
      : "payment") as WalletTransactionType,
    amount: asNumber(data.amount),
    balance: asNumber(data.balance),
    description: asString(data.description, "Giao dịch ví"),
    date: asTimestampIso(data.date ?? data.created_at ?? data.createdAt),
    status: (["completed", "pending", "failed"].includes(data.status)
      ? data.status
      : "pending") as WalletTransactionStatus,
    method: asNullableString(data.method) as WalletMethod | undefined,
    reference_type: asNullableString(data.reference_type ?? data.referenceType),
    reference_id: asNullableString(data.reference_id ?? data.referenceId),
    idempotency_key: asNullableString(data.idempotency_key ?? data.idempotencyKey) ?? undefined,
  }
}

function newIdempotencyKey(prefix: string, uid: string): string {
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2)
  return `${prefix}:${uid}:${random}`
}

function validateAmount(amount: number): string | null {
  if (!Number.isFinite(amount) || amount <= 0) return "Số tiền không hợp lệ"
  if (!Number.isInteger(amount)) return "Số tiền phải là số nguyên"
  if (amount < 10_000) return "Số tiền tối thiểu là 10.000đ"
  if (amount % 1_000 !== 0) return "Số tiền phải là bội số của 1.000đ"
  if (amount > 50_000_000) return "Số tiền tối đa là 50.000.000đ"
  return null
}

export async function getWallet(
  uid?: string,
  limitCount = 100
): Promise<ServiceResult<{ wallet: WalletAccount; transactions: WalletTransaction[] }>> {
  try {
    const currentUid = await requireCurrentUid(uid)
    const [walletSnap, txSnap] = await Promise.all([
      getDoc(walletStateRef(currentUid)),
      getDocs(
        query(
          walletTransactionsRef(currentUid),
          orderBy("created_at", "desc"),
          limit(limitCount)
        )
      ),
    ])

    return serviceOk({
      wallet: normalizeWalletAccount(
        currentUid,
        walletSnap.exists() ? walletSnap.data() : null
      ),
      transactions: txSnap.docs.map((txDoc) =>
        normalizeWalletTransaction(txDoc.id, txDoc.data())
      ),
    })
  } catch (err) {
    return toServiceError(err, "Không thể tải ví")
  }
}

export async function createTopupIntent(
  input: CreateTopupIntentInput
): Promise<ServiceResult<{ transaction: WalletTransaction }>> {
  try {
    const currentUid = await requireCurrentUid(input.user_id)
    const validation = validateAmount(input.amount)
    if (validation) return serviceErr("invalid-amount", validation)

    const idempotencyKey =
      input.idempotency_key ?? newIdempotencyKey("topup", currentUid)
    const stateRef = walletStateRef(currentUid)
    const txRef = walletTransactionRef(currentUid, idempotencyKey)

    const transaction = await runTransaction(firestore, async (tx) => {
      const [existingTx, stateSnap] = await Promise.all([
        tx.get(txRef),
        tx.get(stateRef),
      ])
      if (existingTx.exists()) {
        return normalizeWalletTransaction(existingTx.id, existingTx.data())
      }

      const wallet = normalizeWalletAccount(
        currentUid,
        stateSnap.exists() ? stateSnap.data() : null
      )
      const now = Timestamp.now()
      const txData = {
        type: "topup" satisfies WalletTransactionType,
        amount: input.amount,
        balance: wallet.balance,
        description: `Nạp tiền qua ${input.method.toUpperCase()}`,
        status: "pending" satisfies WalletTransactionStatus,
        method: input.method,
        reference_type: "topup_intent",
        reference_id: idempotencyKey,
        idempotency_key: idempotencyKey,
        created_at: now,
        updated_at: serverTimestamp(),
      }

      tx.set(txRef, txData)
      tx.set(
        stateRef,
        {
          customer_id: currentUid,
          balance: wallet.balance,
          locked_balance: wallet.locked_balance,
          total_claimed: wallet.total_claimed,
          total_withdrawn: wallet.total_withdrawn,
          updated_at: serverTimestamp(),
          created_at: stateSnap.exists() ? stateSnap.data().created_at : serverTimestamp(),
        },
        { merge: true }
      )

      return normalizeWalletTransaction(idempotencyKey, txData)
    })

    return serviceOk({ transaction })
  } catch (err) {
    return toServiceError(err, "Không thể tạo yêu cầu nạp tiền")
  }
}

export async function withdrawWallet(
  input: WithdrawWalletInput
): Promise<ServiceResult<{ wallet: WalletAccount; transaction: WalletTransaction }>> {
  try {
    const currentUid = await requireCurrentUid(input.user_id)
    const validation = validateAmount(input.amount)
    if (validation) return serviceErr("invalid-amount", validation)

    const idempotencyKey =
      input.idempotency_key ?? newIdempotencyKey("withdraw", currentUid)
    const stateRef = walletStateRef(currentUid)
    const txRef = walletTransactionRef(currentUid, idempotencyKey)

    const result = await runTransaction(firestore, async (tx) => {
      const [existingTx, stateSnap] = await Promise.all([
        tx.get(txRef),
        tx.get(stateRef),
      ])
      const wallet = normalizeWalletAccount(
        currentUid,
        stateSnap.exists() ? stateSnap.data() : null
      )

      if (existingTx.exists()) {
        return {
          wallet,
          transaction: normalizeWalletTransaction(existingTx.id, existingTx.data()),
        }
      }

      if (wallet.balance < input.amount) throw new Error("Số dư ví không đủ")

      const nextWallet: WalletAccount = {
        ...wallet,
        balance: wallet.balance - input.amount,
        locked_balance: wallet.locked_balance + input.amount,
        total_withdrawn: wallet.total_withdrawn + input.amount,
      }
      const now = Timestamp.now()
      const txData = {
        type: "withdraw" satisfies WalletTransactionType,
        amount: -input.amount,
        balance: nextWallet.balance,
        description: input.payout_account
          ? `Rút tiền về ${input.payout_account}`
          : "Yêu cầu rút tiền",
        status: "pending" satisfies WalletTransactionStatus,
        method: input.method ?? "bank",
        reference_type: "withdraw_request",
        reference_id: idempotencyKey,
        idempotency_key: idempotencyKey,
        created_at: now,
        updated_at: serverTimestamp(),
      }

      tx.set(txRef, txData)
      tx.set(
        stateRef,
        {
          customer_id: currentUid,
          balance: nextWallet.balance,
          locked_balance: nextWallet.locked_balance,
          total_claimed: nextWallet.total_claimed,
          total_withdrawn: nextWallet.total_withdrawn,
          last_transaction_id: idempotencyKey,
          updated_at: serverTimestamp(),
          created_at: stateSnap.exists() ? stateSnap.data().created_at : serverTimestamp(),
        },
        { merge: true }
      )

      return {
        wallet: nextWallet,
        transaction: normalizeWalletTransaction(idempotencyKey, txData),
      }
    })

    return serviceOk(result)
  } catch (err) {
    return toServiceError(err, "Không thể tạo yêu cầu rút tiền")
  }
}

export async function claimWalletReward(
  input: ClaimWalletRewardInput
): Promise<ServiceResult<{ wallet: WalletAccount; transaction: WalletTransaction }>> {
  try {
    const currentUid = await requireCurrentUid(input.user_id)
    const idempotencyKey =
      input.idempotency_key ?? `claim:${currentUid}:${input.claim_id}`
    const stateRef = walletStateRef(currentUid)
    const claimRef = walletClaimRef(currentUid, input.claim_id)
    const txRef = walletTransactionRef(currentUid, idempotencyKey)

    const result = await runTransaction(firestore, async (tx) => {
      const [existingTx, stateSnap, claimSnap] = await Promise.all([
        tx.get(txRef),
        tx.get(stateRef),
        tx.get(claimRef),
      ])
      const wallet = normalizeWalletAccount(
        currentUid,
        stateSnap.exists() ? stateSnap.data() : null
      )

      if (existingTx.exists()) {
        return {
          wallet,
          transaction: normalizeWalletTransaction(existingTx.id, existingTx.data()),
        }
      }

      if (!claimSnap.exists()) throw new Error("Phần thưởng không tồn tại")
      const claim = claimSnap.data()
      if (claim.status !== "pending") throw new Error("Phần thưởng đã được xử lý")
      const amount = asNumber(claim.amount)
      if (amount <= 0) throw new Error("Giá trị phần thưởng không hợp lệ")

      const nextWallet: WalletAccount = {
        ...wallet,
        balance: wallet.balance + amount,
        total_claimed: wallet.total_claimed + amount,
      }
      const now = Timestamp.now()
      const txData = {
        type: "claim" satisfies WalletTransactionType,
        amount,
        balance: nextWallet.balance,
        description: asString(claim.description, "Nhận thưởng vào ví"),
        status: "completed" satisfies WalletTransactionStatus,
        method: "system" satisfies WalletMethod,
        reference_type: "wallet_claim",
        reference_id: input.claim_id,
        idempotency_key: idempotencyKey,
        created_at: now,
        updated_at: serverTimestamp(),
      }

      tx.set(txRef, txData)
      tx.update(claimRef, {
        status: "claimed",
        claimed_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      })
      tx.set(
        stateRef,
        {
          customer_id: currentUid,
          balance: nextWallet.balance,
          locked_balance: nextWallet.locked_balance,
          total_claimed: nextWallet.total_claimed,
          total_withdrawn: nextWallet.total_withdrawn,
          last_transaction_id: idempotencyKey,
          updated_at: serverTimestamp(),
          created_at: stateSnap.exists() ? stateSnap.data().created_at : serverTimestamp(),
        },
        { merge: true }
      )

      return {
        wallet: nextWallet,
        transaction: normalizeWalletTransaction(idempotencyKey, txData),
      }
    })

    return serviceOk(result)
  } catch (err) {
    return toServiceError(err, "Không thể nhận thưởng vào ví")
  }
}
