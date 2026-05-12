import type { MockVoucher } from "../account/mock-data"
import { MOCK_VOUCHERS } from "../account/mock-data"

export interface VoucherApplyResult {
  valid: boolean
  reason?: string
  discount: number
  shippingDiscount: number
}

export function validateVoucher(
  code: string,
  subtotal: number,
  shippingFee: number
): { voucher: MockVoucher; result: VoucherApplyResult } | { error: string } {
  const normalized = code.trim().toUpperCase()
  const voucher = MOCK_VOUCHERS.find((v) => v.code === normalized)

  if (!voucher) {
    return { error: "Mã không tồn tại hoặc đã được sử dụng" }
  }

  if (voucher.status === "used") {
    return { error: "Mã đã được sử dụng" }
  }

  if (voucher.status === "expired" || new Date(voucher.expiresAt) < new Date()) {
    return { error: "Mã đã hết hạn" }
  }

  if (subtotal < voucher.minOrder) {
    return {
      error: `Đơn tối thiểu ${new Intl.NumberFormat("vi-VN").format(voucher.minOrder)}đ`,
    }
  }

  let discount = 0
  let shippingDiscount = 0

  if (voucher.discountType === "fixed") {
    discount = voucher.discountValue
  } else if (voucher.discountType === "percent") {
    discount = Math.floor(subtotal * (voucher.discountValue / 100))
    if (voucher.maxDiscount) {
      discount = Math.min(discount, voucher.maxDiscount)
    }
  } else if (voucher.discountType === "shipping") {
    shippingDiscount = shippingFee
  }

  return {
    voucher,
    result: {
      valid: true,
      discount,
      shippingDiscount,
    },
  }
}

export function getAvailableVouchers(subtotal: number): MockVoucher[] {
  return MOCK_VOUCHERS.filter(
    (v) =>
      v.status === "available" &&
      new Date(v.expiresAt) >= new Date() &&
      subtotal >= v.minOrder
  )
}
