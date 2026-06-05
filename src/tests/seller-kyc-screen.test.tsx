import { renderToString } from "react-dom/server"
import { MemoryRouter } from "react-router-dom"
import { describe, expect, it, vi } from "vitest"
import SellerKycScreen from "../features/seller/components/SellerKycScreen"

vi.mock("../stores/auth-store", () => ({
  useAuthStore: (selector: (state: unknown) => unknown) =>
    selector({
      user: { id: "seller-uid", email: "seller@example.com" },
    }),
}))

vi.mock("../hooks/use-vendor", () => ({
  useMyVendor: () => ({
    data: {
      vendor: {
        id: "vendor-1",
        firebase_uid: "seller-uid",
        shop_name: "ACF Test Shop",
        owner_name: "Nguyen Van A",
        owner_email: "seller@example.com",
        status: "pending",
        kyc_status: "MANUAL_REVIEW",
        kyc_provider: "vnpt",
        kyc_level: "verified",
        verified_at: null,
        rejected_reason: null,
      },
    },
    isLoading: false,
    isError: false,
    isFetching: false,
    error: null,
    refetch: vi.fn(),
  }),
}))

vi.mock("../hooks/use-kyc", () => ({
  useSellerKycStatus: () => ({
    data: {
      sellerFinalStatus: "MANUAL_REVIEW",
      sdkAvailable: false,
      unavailableReason: "VNPT SDK-Web session flow is not available",
      sessionStatus: "SDK_WEB_UNAVAILABLE",
      latestVnptSession: {
        sessionId: "vnpt-session-1",
        provider: "vnpt",
        status: "APPROVED",
        createdAt: "2026-06-05T10:00:00.000Z",
        updatedAt: "2026-06-05T10:03:00.000Z",
      },
      manualReviewState: "Chờ admin duyệt seller",
    },
    isError: false,
    isFetching: false,
    error: null,
    refetch: vi.fn(),
  }),
  useStartSellerVnptKycSession: () => ({
    isPending: false,
    mutateAsync: vi.fn(),
  }),
  useSubmitSellerVnptKycResult: () => ({
    isPending: false,
    mutateAsync: vi.fn(),
  }),
}))

describe("SellerKycScreen", () => {
  it("separates final seller status, VNPT session, technical error, and admin review state", () => {
    const html = renderToString(
      <MemoryRouter>
        <SellerKycScreen />
      </MemoryRouter>
    )

    expect(html).toContain("Seller final KYC status")
    expect(html).toContain("Latest VNPT session status")
    expect(html).toContain("Technical/provider error")
    expect(html).toContain("Admin manual review state")
    expect(html).toContain("Hồ sơ đang ở bước admin manual review")
    expect(html).toContain("VNPT SDK-Web session flow is not available")
    expect(html).toContain("Xác minh lại bằng VNPT")
    expect(html).not.toContain("VERIFIED")
  })
})
