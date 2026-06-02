import { describe, it, expect } from "vitest"
import { sanitizeUserError, isPermissionError, FALLBACK_PERMISSION } from "../lib/error-utils"

describe("isPermissionError", () => {
  it("detects Firestore permission-denied by structured code", () => {
    expect(
      isPermissionError({ code: "permission-denied", message: "Missing or insufficient permissions." })
    ).toBe(true)
  })

  it("detects the canonical Firestore message when no code is present", () => {
    expect(isPermissionError({ message: "Missing or insufficient permissions." })).toBe(true)
  })

  it("detects Functions/Storage access codes", () => {
    expect(isPermissionError({ code: "functions/permission-denied" })).toBe(true)
    expect(isPermissionError({ code: "storage/unauthorized" })).toBe(true)
  })

  it("does NOT false-positive on unrelated text that merely contains 'permission'", () => {
    // Regression: the old substring matcher flagged this as an access denial.
    expect(isPermissionError(new Error("Trình duyệt đã chặn permission camera"))).toBe(false)
  })
})

describe("sanitizeUserError", () => {
  it("names the action when an admin hits a permission denial", () => {
    const msg = sanitizeUserError(
      { code: "permission-denied", message: "Missing or insufficient permissions." },
      "Vui lòng thử lại sau.",
      { action: "phê duyệt seller" }
    )
    expect(msg).toContain("phê duyệt seller")
    expect(msg).toContain("đăng nhập lại")
    // Must NOT collapse into the old dead-end "liên hệ hỗ trợ" line.
    expect(msg).not.toContain("không có quyền thực hiện thao tác này")
  })

  it("uses the generic permission message when no action is supplied", () => {
    const msg = sanitizeUserError({ code: "permission-denied" })
    expect(msg).toBe(FALLBACK_PERMISSION)
  })

  it("passes through a clear Vietnamese business-rule message verbatim", () => {
    const original =
      "Bạn đã gửi hồ sơ đăng ký bán hàng và đang chờ duyệt. Mỗi tài khoản chỉ đăng ký một hồ sơ."
    expect(sanitizeUserError(new Error(original), "Gửi yêu cầu thất bại.")).toBe(original)
  })

  it("hides leaking SDK errors behind the supplied fallback", () => {
    const msg = sanitizeUserError(
      new Error("Function addDoc() called with invalid data"),
      "fallback chung"
    )
    expect(msg).toBe("fallback chung")
  })
})
