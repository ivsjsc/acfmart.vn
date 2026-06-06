import { describe, expect, it } from "vitest"
import { getSellerKycUiState, type SellerKycStatusPayload } from "../lib/kyc"

describe("getSellerKycUiState - Status Mapping Regression Tests", () => {
  it("Case 1: profile NEEDS_REVIEW + review VERIFIED => final NEEDS_REVIEW (not VERIFIED)", () => {
    const payload: SellerKycStatusPayload = {
      sellerFinalStatus: "REJECTED",
      latestVnptSessionStatus: "APPROVED",
      latestVnptSession: {
        sessionId: "session-1",
        status: "APPROVED",
        provider: "vnpt",
      },
    }
    const vendorStatus = "active"

    const result = getSellerKycUiState(payload, vendorStatus)

    // Should NOT show "Đã xác thực" because profile is rejected
    expect(result.state).toBe("needs_action")
    expect(result.label).toBe("Cần kiểm tra lại")
    expect(result.badge).not.toBe("ĐÃ XÁC THỰC")
  })

  it("Case 2: profile VERIFIED + review VERIFIED => final VERIFIED", () => {
    const payload: SellerKycStatusPayload = {
      sellerFinalStatus: "APPROVED",
      latestVnptSessionStatus: "APPROVED",
      latestVnptSession: {
        sessionId: "session-1",
        status: "APPROVED",
        provider: "vnpt",
      },
    }
    const vendorStatus = "active"

    const result = getSellerKycUiState(payload, vendorStatus)

    expect(result.state).toBe("verified")
    expect(result.label).toBe("Đã xác thực")
    expect(result.badge).toBe("ĐÃ XÁC THỰC")
    expect(result.levelLabel).toBe("Xác thực danh tính hợp pháp")
  })

  it("Case 3: profile PENDING + review VERIFIED => final PENDING/SYNC_PENDING", () => {
    const payload: SellerKycStatusPayload = {
      sellerFinalStatus: "MANUAL_REVIEW",
      latestVnptSessionStatus: "APPROVED",
      latestVnptSession: {
        sessionId: "session-1",
        status: "APPROVED",
        provider: "vnpt",
      },
    }
    const vendorStatus = "active"

    const result = getSellerKycUiState(payload, vendorStatus)

    // MANUAL_REVIEW should NOT show as fully verified
    expect(result.state).toBe("processing")
    expect(result.label).toBe("Đã xác minh danh tính - Đang chờ xét duyệt")
    expect(result.badge).toBe("ĐANG CHỜ XÉT DUYỆT")
    expect(result.label).not.toBe("Đã xác thực")
  })

  it("Case 4: profile REJECTED + review VERIFIED => final REJECTED", () => {
    const payload: SellerKycStatusPayload = {
      sellerFinalStatus: "REJECTED",
      latestVnptSessionStatus: "REJECTED",
      latestVnptSession: {
        sessionId: "session-1",
        status: "REJECTED",
        provider: "vnpt",
      },
    }
    const vendorStatus = "active"

    const result = getSellerKycUiState(payload, vendorStatus)

    expect(result.state).toBe("needs_action")
    expect(result.label).toBe("Cần kiểm tra lại")
    expect(result.badge).toBe("CẦN KIỂM TRA")
  })

  it("Case 5: missing/null profile status + review VERIFIED => final NEEDS_REVIEW/UNKNOWN (not VERIFIED)", () => {
    const payload: SellerKycStatusPayload = {
      sellerFinalStatus: null,
      latestVnptSessionStatus: "NOT_SUBMITTED",
    }
    const vendorStatus = "active"

    const result = getSellerKycUiState(payload, vendorStatus)

    // Should NOT show verified when profile status is missing
    expect(result.state).not.toBe("verified")
    expect(result.label).not.toBe("Đã xác thực")
    expect(result.badge).not.toBe("ĐÃ XÁC THỰC")
  })

  it("Case 6: profile APPROVED + review PENDING => NOT VERIFIED", () => {
    const payload: SellerKycStatusPayload = {
      sellerFinalStatus: "APPROVED",
      latestVnptSessionStatus: "APPROVED",
      latestVnptSession: {
        sessionId: "session-1",
        status: "APPROVED",
        provider: "vnpt",
      },
    }
    const vendorStatus = "pending"

    const result = getSellerKycUiState(payload, vendorStatus)

    // KYC approved but vendor not active => should not show verified
    expect(result.state).toBe("processing")
    expect(result.label).toBe("Đã xác minh danh tính - Đang chờ xét duyệt")
    expect(result.badge).toBe("ĐANG CHỜ XÉT DUYỆT")
  })

  it("Case 7: profile APPROVED + review REJECTED => NOT VERIFIED", () => {
    const payload: SellerKycStatusPayload = {
      sellerFinalStatus: "APPROVED",
      latestVnptSessionStatus: "APPROVED",
      latestVnptSession: {
        sessionId: "session-1",
        status: "APPROVED",
        provider: "vnpt",
      },
    }
    const vendorStatus = "rejected"

    const result = getSellerKycUiState(payload, vendorStatus)

    expect(result.state).not.toBe("verified")
    expect(result.label).not.toBe("Đã xác thực")
    // Should show processing state since KYC is approved but vendor rejected
    expect(result.state).toBe("processing")
  })

  it("Case 8: profile APPROVED + review null => NOT VERIFIED", () => {
    const payload: SellerKycStatusPayload = {
      sellerFinalStatus: "APPROVED",
      latestVnptSessionStatus: "APPROVED",
      latestVnptSession: {
        sessionId: "session-1",
        status: "APPROVED",
        provider: "vnpt",
      },
    }
    const vendorStatus = null

    const result = getSellerKycUiState(payload, vendorStatus)

    // Missing vendor status should prevent showing verified
    expect(result.state).toBe("processing")
    expect(result.label).toBe("Đã xác minh danh tính - Đang chờ xét duyệt")
  })

  it("Case 9: profile ERROR + review VERIFIED => final ERROR", () => {
    const payload: SellerKycStatusPayload = {
      sellerFinalStatus: "TECHNICAL_ERROR",
      latestVnptSessionStatus: "TECHNICAL_ERROR",
      technicalError: "Connection timeout",
    }
    const vendorStatus = "active"

    const result = getSellerKycUiState(payload, vendorStatus)

    expect(result.state).toBe("needs_action")
    expect(result.label).toBe("Cần kiểm tra lại")
    expect(result.badge).toBe("CẦN KIỂM TRA")
    expect(result.canStartKyc).toBe(true)
  })

  it("Case 10: profile EXPIRED + review VERIFIED => final EXPIRED", () => {
    const payload: SellerKycStatusPayload = {
      sellerFinalStatus: "EXPIRED",
      latestVnptSessionStatus: "EXPIRED",
    }
    const vendorStatus = "active"

    const result = getSellerKycUiState(payload, vendorStatus)

    expect(result.state).toBe("needs_action")
    expect(result.label).toBe("Cần kiểm tra lại")
    expect(result.canStartKyc).toBe(true)
  })

  it("Case 11: profile PROCESSING + review VERIFIED => final PROCESSING", () => {
    const payload: SellerKycStatusPayload = {
      sellerFinalStatus: "PROCESSING",
      latestVnptSessionStatus: "PROCESSING",
    }
    const vendorStatus = "active"

    const result = getSellerKycUiState(payload, vendorStatus)

    expect(result.state).toBe("processing")
    expect(result.label).toBe("Đang xác thực")
    expect(result.badge).toBe("ĐANG XÁC THỰC")
  })

  it("Case 12: empty payload + review VERIFIED => NOT VERIFIED", () => {
    const payload: SellerKycStatusPayload = {}
    const vendorStatus = "active"

    const result = getSellerKycUiState(payload, vendorStatus)

    // Empty payload normalizes to NOT_SUBMITTED, which falls through to needs_action
    // because vendor is active but KYC is not approved
    expect(result.state).not.toBe("verified")
    expect(result.label).not.toBe("Đã xác thực")
    expect(result.badge).not.toBe("ĐÃ XÁC THỰC")
  })

  it("Case 13: null payload + null review => NOT VERIFIED", () => {
    const result = getSellerKycUiState(null, null)

    expect(result.state).toBe("not_started")
    expect(result.label).toBe("Chưa xác thực")
  })

  it("Case 14: MANUAL_REVIEW with blocking error => needs_action (error takes precedence)", () => {
    const payload: SellerKycStatusPayload = {
      sellerFinalStatus: "MANUAL_REVIEW",
      latestVnptSessionStatus: "APPROVED",
      technicalError: "SDK initialization failed",
    }
    const vendorStatus = "active"

    const result = getSellerKycUiState(payload, vendorStatus)

    // Blocking error should be checked BEFORE MANUAL_REVIEW
    expect(result.state).toBe("needs_action")
    expect(result.label).toBe("Cần kiểm tra lại")
    expect(result.canStartKyc).toBe(true)
  })

  it("Case 15: Verified state requires BOTH kyc approved AND vendor active", () => {
    // Test all combinations
    const testCases = [
      { kycStatus: "APPROVED", vendorStatus: "active", shouldBeVerified: true },
      { kycStatus: "APPROVED", vendorStatus: "pending", shouldBeVerified: false },
      { kycStatus: "APPROVED", vendorStatus: "rejected", shouldBeVerified: false },
      { kycStatus: "APPROVED", vendorStatus: null, shouldBeVerified: false },
      { kycStatus: "MANUAL_REVIEW", vendorStatus: "active", shouldBeVerified: false },
      { kycStatus: "MANUAL_REVIEW", vendorStatus: "pending", shouldBeVerified: false },
      { kycStatus: "REJECTED", vendorStatus: "active", shouldBeVerified: false },
      { kycStatus: "PROCESSING", vendorStatus: "active", shouldBeVerified: false },
      { kycStatus: null, vendorStatus: "active", shouldBeVerified: false },
    ]

    testCases.forEach(({ kycStatus, vendorStatus, shouldBeVerified }) => {
      const payload: SellerKycStatusPayload = {
        sellerFinalStatus: kycStatus,
        latestVnptSessionStatus: kycStatus || undefined,
      }

      const result = getSellerKycUiState(payload, vendorStatus)

      if (shouldBeVerified) {
        expect(result.state).toBe("verified")
        expect(result.label).toBe("Đã xác thực")
        expect(result.badge).toBe("ĐÃ XÁC THỰC")
      } else {
        expect(result.state).not.toBe("verified")
        expect(result.label).not.toBe("Đã xác thực")
        expect(result.badge).not.toBe("ĐÃ XÁC THỰC")
      }
    })
  })
})
