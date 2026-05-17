import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  increment,
  Timestamp,
  type QueryConstraint,
  type Unsubscribe,
} from "firebase/firestore"
import { firestore } from "./firebase"
import { writeAuditLog } from "./audit-log"

export type VoucherDiscountType = "percent" | "fixed" | "shipping"

export interface VoucherDoc {
  id: string
  shopId: string
  shopName: string
  code: string
  title: string
  description: string
  discountType: VoucherDiscountType
  value: number
  maxDiscount: number | null
  minOrderValue: number
  startDate: Timestamp
  endDate: Timestamp
  isActive: boolean
  usageLimit: number
  usedCount: number
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface CreateVoucherInput {
  shopId: string
  shopName: string
  code: string
  title: string
  description?: string
  discountType: VoucherDiscountType
  value: number
  maxDiscount?: number | null
  minOrderValue: number
  startDate: Date
  endDate: Date
  isActive?: boolean
  usageLimit: number
}

export type UpdateVoucherInput = Partial<
  Omit<CreateVoucherInput, "shopId" | "code">
>

export interface VoucherValidationOk {
  ok: true
  voucher: VoucherDoc
  discount: number
  shippingDiscount: number
}

export interface VoucherValidationError {
  ok: false
  reason: string
}

export type VoucherValidationResult = VoucherValidationOk | VoucherValidationError

const vouchersCol = collection(firestore, "vouchers")
const DISCOUNT_TYPES: VoucherDiscountType[] = ["percent", "fixed", "shipping"]

function normalizeDiscountType(value: unknown): VoucherDiscountType {
  return typeof value === "string" && DISCOUNT_TYPES.includes(value as VoucherDiscountType)
    ? (value as VoucherDiscountType)
    : "fixed"
}

function normalizeVoucherDoc(id: string, data: Record<string, unknown>): VoucherDoc {
  return {
    id,
    shopId: typeof data.shopId === "string" ? data.shopId : "",
    shopName: typeof data.shopName === "string" ? data.shopName : "",
    code: typeof data.code === "string" ? data.code : "",
    title: typeof data.title === "string" ? data.title : "",
    description: typeof data.description === "string" ? data.description : "",
    discountType: normalizeDiscountType(data.discountType),
    value: typeof data.value === "number" ? data.value : 0,
    maxDiscount: typeof data.maxDiscount === "number" ? data.maxDiscount : null,
    minOrderValue: typeof data.minOrderValue === "number" ? data.minOrderValue : 0,
    startDate: data.startDate as Timestamp,
    endDate: data.endDate as Timestamp,
    isActive: data.isActive === true,
    usageLimit: typeof data.usageLimit === "number" ? data.usageLimit : 0,
    usedCount: typeof data.usedCount === "number" ? data.usedCount : 0,
    createdAt: data.createdAt as Timestamp,
    updatedAt: data.updatedAt as Timestamp,
  }
}

function validateCreateInput(input: CreateVoucherInput): string | null {
  if (!input.code.trim()) return "Mã voucher không được trống"
  if (!input.title.trim()) return "Tên voucher không được trống"
  if (input.value <= 0) return "Giá trị giảm phải lớn hơn 0"
  if (input.discountType === "percent" && input.value > 100) {
    return "Phần trăm giảm không vượt quá 100"
  }
  if (input.minOrderValue < 0) return "Đơn tối thiểu không được âm"
  if (input.usageLimit < 0) return "Số lượt dùng không được âm"
  if (input.endDate.getTime() <= input.startDate.getTime()) {
    return "Ngày kết thúc phải sau ngày bắt đầu"
  }
  return null
}

function normalizeCode(code: string): string {
  return code.trim().toUpperCase().replace(/\s+/g, "")
}

export async function createVoucher(
  input: CreateVoucherInput
): Promise<VoucherDoc> {
  const error = validateCreateInput(input)
  if (error) throw new Error(error)

  const code = normalizeCode(input.code)
  const existing = await getVoucherByCode(input.shopId, code)
  if (existing) throw new Error(`Mã "${code}" đã tồn tại trong shop`)

  const now = Timestamp.now()
  const payload: Omit<VoucherDoc, "id"> = {
    shopId: input.shopId,
    shopName: input.shopName,
    code,
    title: input.title.trim(),
    description: input.description?.trim() ?? "",
    discountType: input.discountType,
    value: input.value,
    maxDiscount:
      input.discountType === "percent" && input.maxDiscount
        ? input.maxDiscount
        : null,
    minOrderValue: input.minOrderValue,
    startDate: Timestamp.fromDate(input.startDate),
    endDate: Timestamp.fromDate(input.endDate),
    isActive: input.isActive !== false,
    usageLimit: input.usageLimit,
    usedCount: 0,
    createdAt: now,
    updatedAt: now,
  }

  const ref = await addDoc(vouchersCol, payload)

  await writeAuditLog({
    action: "voucher_create",
    actor_id: input.shopId,
    actor_email: "",
    actor_role: "seller",
    target_type: "voucher",
    target_id: ref.id,
    details: { code, value: input.value, discountType: input.discountType },
  })

  return { id: ref.id, ...payload }
}

export async function updateVoucher(
  voucherId: string,
  shopId: string,
  patch: UpdateVoucherInput
): Promise<void> {
  const ref = doc(vouchersCol, voucherId)
  const snap = await getDoc(ref)
  if (!snap.exists()) throw new Error("Voucher không tồn tại")
  const current = normalizeVoucherDoc(snap.id, snap.data())
  if (current.shopId !== shopId) throw new Error("Bạn không có quyền sửa voucher này")

  const startDate = patch.startDate ?? current.startDate.toDate()
  const endDate = patch.endDate ?? current.endDate.toDate()
  if (endDate.getTime() <= startDate.getTime()) {
    throw new Error("Ngày kết thúc phải sau ngày bắt đầu")
  }
  if (patch.value !== undefined && patch.value <= 0) {
    throw new Error("Giá trị giảm phải lớn hơn 0")
  }
  const nextType = patch.discountType ?? current.discountType
  if (nextType === "percent" && (patch.value ?? current.value) > 100) {
    throw new Error("Phần trăm giảm không vượt quá 100")
  }

  const updates: Record<string, unknown> = { updatedAt: serverTimestamp() }
  if (patch.title !== undefined) updates.title = patch.title.trim()
  if (patch.description !== undefined) updates.description = patch.description.trim()
  if (patch.discountType !== undefined) updates.discountType = patch.discountType
  if (patch.value !== undefined) updates.value = patch.value
  if (patch.maxDiscount !== undefined) updates.maxDiscount = patch.maxDiscount
  if (patch.minOrderValue !== undefined) updates.minOrderValue = patch.minOrderValue
  if (patch.startDate !== undefined) updates.startDate = Timestamp.fromDate(patch.startDate)
  if (patch.endDate !== undefined) updates.endDate = Timestamp.fromDate(patch.endDate)
  if (patch.isActive !== undefined) updates.isActive = patch.isActive
  if (patch.usageLimit !== undefined) updates.usageLimit = patch.usageLimit

  await updateDoc(ref, updates)

  await writeAuditLog({
    action: "voucher_update",
    actor_id: shopId,
    actor_email: "",
    actor_role: "seller",
    target_type: "voucher",
    target_id: voucherId,
    details: patch as Record<string, unknown>,
  })
}

export async function deleteVoucher(
  voucherId: string,
  shopId: string
): Promise<void> {
  const ref = doc(vouchersCol, voucherId)
  const snap = await getDoc(ref)
  if (!snap.exists()) throw new Error("Voucher không tồn tại")
  const current = normalizeVoucherDoc(snap.id, snap.data())
  if (current.shopId !== shopId) throw new Error("Bạn không có quyền xoá voucher này")

  await deleteDoc(ref)

  await writeAuditLog({
    action: "voucher_delete",
    actor_id: shopId,
    actor_email: "",
    actor_role: "seller",
    target_type: "voucher",
    target_id: voucherId,
    details: { code: current.code },
  })
}

export async function getVoucher(voucherId: string): Promise<VoucherDoc | null> {
  const snap = await getDoc(doc(vouchersCol, voucherId))
  if (!snap.exists()) return null
  return normalizeVoucherDoc(snap.id, snap.data())
}

export async function getVoucherByCode(
  shopId: string,
  code: string
): Promise<VoucherDoc | null> {
  const normalized = normalizeCode(code)
  const q = query(
    vouchersCol,
    where("shopId", "==", shopId),
    where("code", "==", normalized),
    limit(1)
  )
  const snap = await getDocs(q)
  if (snap.empty) return null
  const docSnap = snap.docs[0]
  return normalizeVoucherDoc(docSnap.id, docSnap.data())
}

export async function getShopVouchers(shopId: string): Promise<VoucherDoc[]> {
  const q = query(
    vouchersCol,
    where("shopId", "==", shopId),
    orderBy("createdAt", "desc")
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => normalizeVoucherDoc(d.id, d.data()))
}

export function subscribeShopVouchers(
  shopId: string,
  onData: (vouchers: VoucherDoc[]) => void,
  onError: (err: Error) => void
): Unsubscribe {
  const q = query(
    vouchersCol,
    where("shopId", "==", shopId),
    orderBy("createdAt", "desc")
  )
  return onSnapshot(
    q,
    (snap) => onData(snap.docs.map((d) => normalizeVoucherDoc(d.id, d.data()))),
    (err) => {
      console.error("[subscribeShopVouchers] Firestore error:", err)
      onError(err)
    }
  )
}

/**
 * Buyer-facing list of vouchers currently usable (active + within window
 * + usage limit not reached). Server-side filters: isActive=true; expiry
 * is filtered client-side because Firestore can't combine inequalities on
 * multiple fields without a composite index per discountType variant.
 */
export async function listAvailableVouchers(params?: {
  shopId?: string
  limitCount?: number
}): Promise<VoucherDoc[]> {
  const constraints: QueryConstraint[] = [where("isActive", "==", true)]
  if (params?.shopId) constraints.push(where("shopId", "==", params.shopId))
  if (params?.limitCount) constraints.push(limit(params.limitCount))

  const q = query(vouchersCol, ...constraints)
  const snap = await getDocs(q)
  const now = Date.now()
  return snap.docs
    .map((d) => normalizeVoucherDoc(d.id, d.data()))
    .filter((v) => {
      const start = v.startDate?.toMillis?.() ?? 0
      const end = v.endDate?.toMillis?.() ?? 0
      const hasQuota = v.usageLimit === 0 || v.usedCount < v.usageLimit
      return start <= now && end >= now && hasQuota
    })
    .sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0))
}

/**
 * Stateless validation used at checkout. Pure function over (voucher, subtotal,
 * shippingFee). Throws no exceptions; returns a discriminated result.
 */
export function evaluateVoucher(
  voucher: VoucherDoc,
  subtotal: number,
  shippingFee: number
): VoucherValidationResult {
  const now = Date.now()
  if (!voucher.isActive) return { ok: false, reason: "Voucher đã tạm ngưng" }
  if ((voucher.startDate?.toMillis?.() ?? 0) > now) {
    return { ok: false, reason: "Voucher chưa đến ngày áp dụng" }
  }
  if ((voucher.endDate?.toMillis?.() ?? 0) < now) {
    return { ok: false, reason: "Voucher đã hết hạn" }
  }
  if (voucher.usageLimit > 0 && voucher.usedCount >= voucher.usageLimit) {
    return { ok: false, reason: "Voucher đã hết lượt sử dụng" }
  }
  if (subtotal < voucher.minOrderValue) {
    return {
      ok: false,
      reason: `Đơn tối thiểu ${new Intl.NumberFormat("vi-VN").format(voucher.minOrderValue)}đ`,
    }
  }

  let discount = 0
  let shippingDiscount = 0
  if (voucher.discountType === "fixed") {
    discount = Math.min(voucher.value, subtotal)
  } else if (voucher.discountType === "percent") {
    const raw = Math.floor((subtotal * voucher.value) / 100)
    discount = voucher.maxDiscount ? Math.min(raw, voucher.maxDiscount) : raw
  } else if (voucher.discountType === "shipping") {
    shippingDiscount = shippingFee
  }

  return { ok: true, voucher, discount, shippingDiscount }
}

export async function validateVoucherCode(params: {
  shopId: string
  code: string
  subtotal: number
  shippingFee: number
}): Promise<VoucherValidationResult> {
  const voucher = await getVoucherByCode(params.shopId, params.code)
  if (!voucher) return { ok: false, reason: "Mã voucher không tồn tại" }
  return evaluateVoucher(voucher, params.subtotal, params.shippingFee)
}

/**
 * Atomically increment usedCount when a voucher is consumed by an order.
 * Caller is the backend / order processing service (admin-only in rules).
 */
export async function redeemVoucher(voucherId: string): Promise<void> {
  const ref = doc(vouchersCol, voucherId)
  await updateDoc(ref, {
    usedCount: increment(1),
    updatedAt: serverTimestamp(),
  })
}

/**
 * Toggle active flag from the seller dashboard.
 */
export async function setVoucherActive(
  voucherId: string,
  shopId: string,
  isActive: boolean
): Promise<void> {
  await updateVoucher(voucherId, shopId, { isActive })
}

/**
 * Derive a display status for UI badges.
 */
export type VoucherStatus = "scheduled" | "active" | "used_up" | "expired" | "inactive"

export function getVoucherStatus(voucher: VoucherDoc): VoucherStatus {
  if (!voucher.isActive) return "inactive"
  const now = Date.now()
  if ((voucher.startDate?.toMillis?.() ?? 0) > now) return "scheduled"
  if ((voucher.endDate?.toMillis?.() ?? 0) < now) return "expired"
  if (voucher.usageLimit > 0 && voucher.usedCount >= voucher.usageLimit) return "used_up"
  return "active"
}

// Helper for code suggestion in the seller form
export function suggestVoucherCode(shopSlug: string, length = 6): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let suffix = ""
  for (let i = 0; i < length; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)]
  }
  const prefix = (shopSlug ?? "ACF").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4) || "ACF"
  return `${prefix}${suffix}`
}

// Re-export Timestamp for places that need it (e.g., setDoc seed scripts)
export { Timestamp }
// Keep `setDoc` re-exported for tests/seed scripts that may import from this module.
export { setDoc }
