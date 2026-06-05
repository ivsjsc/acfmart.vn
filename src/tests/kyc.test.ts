import { describe, expect, it } from "vitest"
import {
  getLatestVnptSessionStatus,
  getSafeKycLaunchUrl,
  getSellerFinalKycStatus,
  normalizeKycStatus,
  safeKycMessage,
} from "../lib/kyc"

describe("Seller VNPT eKYC helpers", () => {
  it("supports backend upper-case status mapping and legacy Firestore values", () => {
    expect(normalizeKycStatus("MANUAL_REVIEW")).toBe("MANUAL_REVIEW")
    expect(normalizeKycStatus("AUTO_CHECKING")).toBe("AUTO_CHECKING")
    expect(normalizeKycStatus("provider_pending")).toBe("PROCESSING")
    expect(normalizeKycStatus("failed")).toBe("TECHNICAL_ERROR")
  })

  it("keeps seller final status separate from the latest VNPT session status", () => {
    const payload = {
      sellerFinalStatus: "MANUAL_REVIEW",
      latestVnptSession: {
        status: "APPROVED",
      },
    }

    expect(getSellerFinalKycStatus(payload)).toBe("MANUAL_REVIEW")
    expect(getLatestVnptSessionStatus(payload)).toBe("APPROVED")
  })

  it("accepts only http(s) launch URLs returned by backend", () => {
    expect(
      getSafeKycLaunchUrl(
        { sdkUrl: "https://ekyc.example.vn/session/abc" },
        "https://seller.acfmart.vn"
      )
    ).toBe("https://ekyc.example.vn/session/abc")

    expect(
      getSafeKycLaunchUrl(
        { redirectUrl: "javascript:alert(1)" },
        "https://seller.acfmart.vn"
      )
    ).toBeNull()
  })

  it("does not expose secret-like provider fields in UI messages", () => {
    expect(safeKycMessage("accessToken=abc123")).toContain("đã được ẩn")
    expect(
      safeKycMessage({
        message: "VNPT session failed",
        tokenKey: "should-not-render",
      })
    ).toBe("message: VNPT session failed")
  })
})
