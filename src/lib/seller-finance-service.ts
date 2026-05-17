import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  serverTimestamp,
  type QueryConstraint,
} from "firebase/firestore"
import { firestore } from "./firebase"
import { writeAuditLog } from "./audit-log"
import type {
  PayoutDoc,
  TransactionDoc,
  SellerBalanceDoc,
  VatInvoiceDoc,
  CreateVatInvoiceInput,
  RevenueBreakdownSummary,
  FeeBreakdownRow,
  TaxExportRow,
  TransactionFilters,
  TransactionType,
  TransactionChannel,
} from "../features/seller/finance-types"

const PAYOUTS = "sellerPayouts"
const TRANSACTIONS = "sellerTransactions"
const BALANCES = "sellerBalances"
const VAT_INVOICES = "vatInvoices"

// ─── Helpers ─────────────────────────────────────────────────────────────

function toJsDate(ts: Timestamp | null | undefined): Date | null {
  return ts ? ts.toDate() : null
}

function payoutFromSnap(id: string, data: Record<string, unknown>): PayoutDoc {
  return { id, ...(data as Omit<PayoutDoc, "id">) }
}

function txFromSnap(id: string, data: Record<string, unknown>): TransactionDoc {
  return { id, ...(data as Omit<TransactionDoc, "id">) }
}

function invoiceFromSnap(id: string, data: Record<string, unknown>): VatInvoiceDoc {
  return { id, ...(data as Omit<VatInvoiceDoc, "id">) }
}

// ─── Balance ─────────────────────────────────────────────────────────────

export async function getSellerBalance(shopId: string): Promise<SellerBalanceDoc | null> {
  const snap = await getDoc(doc(firestore, BALANCES, shopId))
  if (!snap.exists()) return null
  return snap.data() as SellerBalanceDoc
}

// ─── Payouts ─────────────────────────────────────────────────────────────

export async function getNextPayout(shopId: string): Promise<PayoutDoc | null> {
  const q = query(
    collection(firestore, PAYOUTS),
    where("shopId", "==", shopId),
    where("status", "in", ["scheduled", "processing"]),
    orderBy("scheduledFor", "asc"),
    limit(1),
  )
  const snap = await getDocs(q)
  if (snap.empty) return null
  const d = snap.docs[0]
  return payoutFromSnap(d.id, d.data())
}

export async function listPayouts(input: {
  shopId: string
  status?: PayoutDoc["status"]
  from?: Date
  to?: Date
  limitCount?: number
}): Promise<PayoutDoc[]> {
  const constraints: QueryConstraint[] = [where("shopId", "==", input.shopId)]
  if (input.status) constraints.push(where("status", "==", input.status))
  if (input.from) constraints.push(where("scheduledFor", ">=", Timestamp.fromDate(input.from)))
  if (input.to) constraints.push(where("scheduledFor", "<=", Timestamp.fromDate(input.to)))
  constraints.push(orderBy("scheduledFor", "desc"))
  constraints.push(limit(input.limitCount ?? 50))

  const snap = await getDocs(query(collection(firestore, PAYOUTS), ...constraints))
  return snap.docs.map((d) => payoutFromSnap(d.id, d.data()))
}

export async function getPayout(payoutId: string): Promise<PayoutDoc | null> {
  const snap = await getDoc(doc(firestore, PAYOUTS, payoutId))
  if (!snap.exists()) return null
  return payoutFromSnap(snap.id, snap.data())
}

export async function requestEarlyPayout(input: {
  shopId: string
  actorId: string
  actorEmail: string
  actorRole: string
}): Promise<void> {
  await addDoc(collection(firestore, "earlyPayoutRequests"), {
    shopId: input.shopId,
    requestedBy: input.actorId,
    status: "pending",
    createdAt: serverTimestamp(),
  })
  await writeAuditLog({
    action: "settings_change",
    actor_id: input.actorId,
    actor_email: input.actorEmail,
    actor_role: input.actorRole,
    target_type: "payout_request",
    target_id: input.shopId,
    details: { kind: "early_payout_request" },
  })
}

// ─── Transactions ────────────────────────────────────────────────────────

export async function listTransactions(input: {
  shopId: string
  filters?: TransactionFilters
}): Promise<TransactionDoc[]> {
  const f = input.filters ?? {}
  const constraints: QueryConstraint[] = [where("shopId", "==", input.shopId)]
  if (f.type) constraints.push(where("type", "==", f.type))
  if (f.channel) constraints.push(where("channel", "==", f.channel))
  if (f.from) constraints.push(where("occurredAt", ">=", Timestamp.fromDate(f.from)))
  if (f.to) constraints.push(where("occurredAt", "<=", Timestamp.fromDate(f.to)))
  constraints.push(orderBy("occurredAt", "desc"))
  constraints.push(limit(f.limit ?? 200))

  const snap = await getDocs(query(collection(firestore, TRANSACTIONS), ...constraints))
  return snap.docs.map((d) => txFromSnap(d.id, d.data()))
}

export async function listPayoutTransactions(payoutId: string): Promise<TransactionDoc[]> {
  const q = query(
    collection(firestore, TRANSACTIONS),
    where("payoutId", "==", payoutId),
    orderBy("occurredAt", "asc"),
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => txFromSnap(d.id, d.data()))
}

// ─── Revenue breakdown aggregation ──────────────────────────────────────

export async function getRevenueBreakdown(input: {
  shopId: string
  from: Date
  to: Date
}): Promise<RevenueBreakdownSummary> {
  const q = query(
    collection(firestore, TRANSACTIONS),
    where("shopId", "==", input.shopId),
    where("type", "==", "order_revenue"),
    where("occurredAt", ">=", Timestamp.fromDate(input.from)),
    where("occurredAt", "<=", Timestamp.fromDate(input.to)),
    orderBy("occurredAt", "asc"),
  )
  const snap = await getDocs(q)

  const byCategory = new Map<string, { revenue: number; orderCount: number }>()
  const byMonth = new Map<string, { revenue: number; orderCount: number }>()
  const byChannel = new Map<string, { revenue: number; orderCount: number }>()
  let totalRevenue = 0
  let totalOrders = 0

  snap.docs.forEach((d) => {
    const t = d.data() as TransactionDoc
    totalRevenue += t.amount
    totalOrders += 1

    const cat = t.category ?? "Khác"
    const c = byCategory.get(cat) ?? { revenue: 0, orderCount: 0 }
    byCategory.set(cat, { revenue: c.revenue + t.amount, orderCount: c.orderCount + 1 })

    const occurred = (t.occurredAt as Timestamp).toDate()
    const monthKey = `${occurred.getFullYear()}-${String(occurred.getMonth() + 1).padStart(2, "0")}`
    const m = byMonth.get(monthKey) ?? { revenue: 0, orderCount: 0 }
    byMonth.set(monthKey, { revenue: m.revenue + t.amount, orderCount: m.orderCount + 1 })

    const ch = t.channel ?? "online"
    const cur = byChannel.get(ch) ?? { revenue: 0, orderCount: 0 }
    byChannel.set(ch, { revenue: cur.revenue + t.amount, orderCount: cur.orderCount + 1 })
  })

  return {
    totalRevenue,
    totalOrders,
    byCategory: Array.from(byCategory.entries())
      .map(([category, v]) => ({ category, ...v }))
      .sort((a, b) => b.revenue - a.revenue),
    byMonth: Array.from(byMonth.entries())
      .map(([month, v]) => ({ month, ...v }))
      .sort((a, b) => a.month.localeCompare(b.month)),
    byChannel: Array.from(byChannel.entries())
      .map(([channel, v]) => ({ channel: channel as TransactionChannel, ...v }))
      .sort((a, b) => b.revenue - a.revenue),
  }
}

// ─── Fee breakdown aggregation ──────────────────────────────────────────

const FEE_TYPES: Array<{ type: Exclude<TransactionType, "order_revenue" | "payout">; label: string }> = [
  { type: "commission", label: "Phí hoa hồng sàn" },
  { type: "payment_gateway", label: "Phí cổng thanh toán" },
  { type: "ads_charge", label: "Phí quảng cáo" },
  { type: "livestream_fee", label: "Phí livestream" },
  { type: "refund", label: "Hoàn tiền khách" },
  { type: "adjustment", label: "Điều chỉnh khác" },
]

export async function getFeeBreakdown(input: {
  shopId: string
  from: Date
  to: Date
}): Promise<FeeBreakdownRow[]> {
  const q = query(
    collection(firestore, TRANSACTIONS),
    where("shopId", "==", input.shopId),
    where("type", "in", FEE_TYPES.map((f) => f.type)),
    where("occurredAt", ">=", Timestamp.fromDate(input.from)),
    where("occurredAt", "<=", Timestamp.fromDate(input.to)),
  )
  const snap = await getDocs(q)

  const acc = new Map<string, { amount: number; count: number }>()
  let total = 0
  snap.docs.forEach((d) => {
    const t = d.data() as TransactionDoc
    const abs = Math.abs(t.amount)
    total += abs
    const cur = acc.get(t.type) ?? { amount: 0, count: 0 }
    acc.set(t.type, { amount: cur.amount + abs, count: cur.count + 1 })
  })

  return FEE_TYPES.map(({ type, label }) => {
    const v = acc.get(type) ?? { amount: 0, count: 0 }
    return {
      type,
      label,
      amount: v.amount,
      count: v.count,
      percentage: total > 0 ? (v.amount / total) * 100 : 0,
    }
  })
}

// ─── VAT invoices ────────────────────────────────────────────────────────

function generateInvoiceNumber(): string {
  const now = new Date()
  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, "0")
  const dd = String(now.getDate()).padStart(2, "0")
  const rand = Math.floor(Math.random() * 100000).toString().padStart(5, "0")
  return `${yyyy}${mm}${dd}-${rand}`
}

export async function createVatInvoice(input: CreateVatInvoiceInput & {
  actorId: string
  actorEmail: string
  actorRole: string
}): Promise<VatInvoiceDoc> {
  const subtotal = input.items.reduce((s, it) => s + it.quantity * it.unitPrice, 0)
  const vatAmount = input.items.reduce(
    (s, it) => s + it.quantity * it.unitPrice * (it.vatRate / 100),
    0,
  )
  const total = subtotal + vatAmount

  const invoiceNumber = generateInvoiceNumber()
  const series = `ACF/${new Date().getFullYear()}`

  const docData: Omit<VatInvoiceDoc, "id"> = {
    shopId: input.shopId,
    invoiceNumber,
    series,
    status: "issued",
    orderId: input.orderId,
    orderCode: input.orderCode,
    issuedAt: Timestamp.now(),
    buyer: input.buyer,
    seller: input.seller,
    items: input.items,
    subtotal,
    vatAmount,
    total,
    paymentMethod: input.paymentMethod,
    note: input.note,
    createdAt: Timestamp.now(),
  }

  const ref = await addDoc(collection(firestore, VAT_INVOICES), docData)

  await writeAuditLog({
    action: "settings_change",
    actor_id: input.actorId,
    actor_email: input.actorEmail,
    actor_role: input.actorRole,
    target_type: "vat_invoice",
    target_id: ref.id,
    details: { kind: "vat_invoice_create", invoiceNumber, total },
  })

  return { id: ref.id, ...docData }
}

export async function listVatInvoices(input: {
  shopId: string
  from?: Date
  to?: Date
  limitCount?: number
}): Promise<VatInvoiceDoc[]> {
  const constraints: QueryConstraint[] = [where("shopId", "==", input.shopId)]
  if (input.from) constraints.push(where("issuedAt", ">=", Timestamp.fromDate(input.from)))
  if (input.to) constraints.push(where("issuedAt", "<=", Timestamp.fromDate(input.to)))
  constraints.push(orderBy("issuedAt", "desc"))
  constraints.push(limit(input.limitCount ?? 50))

  const snap = await getDocs(query(collection(firestore, VAT_INVOICES), ...constraints))
  return snap.docs.map((d) => invoiceFromSnap(d.id, d.data()))
}

// ─── Tax export ──────────────────────────────────────────────────────────

export async function getTaxExportRows(input: {
  shopId: string
  from: Date
  to: Date
}): Promise<TaxExportRow[]> {
  const invoices = await listVatInvoices({
    shopId: input.shopId,
    from: input.from,
    to: input.to,
    limitCount: 5000,
  })
  return invoices
    .filter((inv) => inv.status === "issued")
    .map((inv) => ({
      invoiceNumber: `${inv.series}-${inv.invoiceNumber}`,
      issuedAt: toJsDate(inv.issuedAt)?.toISOString().slice(0, 10) ?? "",
      buyerName: inv.buyer.name,
      buyerTaxCode: inv.buyer.taxCode,
      subtotal: inv.subtotal,
      vatAmount: inv.vatAmount,
      total: inv.total,
      paymentMethod: inv.paymentMethod,
    }))
}

// ─── Seed helper (DEV ONLY) ─────────────────────────────────────────────
// Useful for QA dashboards before the payment-service writes real data.
// Guarded by an explicit call so it never runs in app boot.

export async function seedSellerFinanceDemo(shopId: string): Promise<void> {
  const now = new Date()
  const balance: SellerBalanceDoc = {
    shopId,
    availableBalance: 4_280_000,
    pendingBalance: 12_750_000,
    holdBalance: 1_200_000,
    lastPayoutAt: Timestamp.fromDate(new Date(now.getTime() - 7 * 86_400_000)),
    nextPayoutAt: Timestamp.fromDate(new Date(now.getTime() + 7 * 86_400_000)),
    payoutCycle: "weekly",
    totalLifetimeRevenue: 248_500_000,
    totalLifetimePayouts: 232_100_000,
    totalFeesPaid: 16_400_000,
    updatedAt: Timestamp.now(),
  }
  await setDoc(doc(firestore, BALANCES, shopId), balance)
}
