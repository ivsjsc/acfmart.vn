import {
  evaluateVoucher,
  getVoucherByCode,
  listAvailableVouchers,
  type VoucherDoc,
} from "../../lib/voucher-service"

/**
 * Backward-compatible result shape preserved for existing consumers
 * (`VoucherApply`, `CheckoutScreen`). Old union `{ voucher, result } | { error }`
 * is kept; new field is `voucher: VoucherDoc` instead of the legacy `MockVoucher`.
 */
export interface VoucherApplyResult {
  valid: boolean
  reason?: string
  discount: number
  shippingDiscount: number
}

export type ValidateVoucherSuccess = {
  voucher: VoucherDoc
  result: VoucherApplyResult
}

export type ValidateVoucherFailure = { error: string }

export type ValidateVoucherReturn = ValidateVoucherSuccess | ValidateVoucherFailure

/**
 * Look up a voucher by `(shopId, code)` then evaluate against subtotal/shipping.
 * Async because Firestore lookup is required.
 *
 * NOTE: Multi-shop carts must call this per shop group. Current cart model
 * supports a single voucher per checkout — caller is expected to pass the
 * dominant shopId (typically the first shop in the cart).
 */
export async function validateVoucher(
  code: string,
  subtotal: number,
  shippingFee: number,
  shopId: string
): Promise<ValidateVoucherReturn> {
  if (!shopId) return { error: "Thiếu thông tin shop để kiểm tra mã" }
  const normalized = code.trim().toUpperCase()
  if (!normalized) return { error: "Vui lòng nhập mã voucher" }

  let voucher: VoucherDoc | null
  try {
    voucher = await getVoucherByCode(shopId, normalized)
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Không kiểm tra được mã" }
  }
  if (!voucher) return { error: "Mã không tồn tại hoặc không thuộc shop này" }

  const evaluation = evaluateVoucher(voucher, subtotal, shippingFee)
  if (!evaluation.ok) {
    const reason = "reason" in evaluation ? evaluation.reason : "Mã không hợp lệ"
    return { error: reason }
  }
  return {
    voucher,
    result: {
      valid: true,
      discount: evaluation.discount,
      shippingDiscount: evaluation.shippingDiscount,
    },
  }
}

/**
 * Vouchers usable for a (shopId, subtotal) pair. Server-side filters apply
 * (active + window + quota); client filters by `subtotal >= minOrderValue`
 * since Firestore can't combine the inequalities efficiently.
 */
export async function getAvailableVouchers(
  shopId: string,
  subtotal: number
): Promise<VoucherDoc[]> {
  if (!shopId) return []
  const vouchers = await listAvailableVouchers({ shopId })
  return vouchers.filter((v) => subtotal >= v.minOrderValue)
}
