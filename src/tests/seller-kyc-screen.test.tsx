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
      unavailableReason: "IVS Trust eKYC SDK-Web session flow is not available",
      sessionStatus: "SDK_WEB_UNAVAILABLE",
      latestVnptSession: {
        sessionId: "vnpt-session-1",
        provider: "vnpt",
        status: "APPROVED",
        createdAt: "2026-06-05T10:00:00.000Z",
        updatedAt: "2026-06-05T10:03:00.000Z",
      },
      manualReviewState: "Đang chờ xử lý",
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
  it("displays seller-friendly production copy without technical/backend wording", () => {
    const html = renderToString(
      <MemoryRouter>
        <SellerKycScreen />
      </MemoryRouter>
    )

    // Check for new seller-friendly copy
    expect(html).toContain("Xác thực danh tính gian hàng")
    expect(html).toContain("IVS Trust eKYC hợp tác cùng")
    expect(html).toContain("Kết quả xác thực gian hàng")
    expect(html).toContain("Phiên xác thực gần nhất")
    expect(html).toContain("Hỗ trợ xác thực")
    expect(html).toContain("Trạng thái xét duyệt")
    expect(html).toContain("Đối tác xác thực")
    expect(html).toContain("IVS Trust eKYC x VNPT")
    expect(html).toContain("Bắt đầu xác thực eKYC")
    expect(html).toContain("Cập nhật trạng thái")
    expect(html).toContain("Liên hệ hỗ trợ")
    expect(html).toContain("Bảo vệ và tin cậy")
    expect(html).toContain("phòng chống gian lận")

    // Verify technical/backend wording is removed
    expect(html).not.toContain("backend")
    expect(html).not.toContain("Frontend")
    expect(html).not.toContain("credential/provider token")
    expect(html).not.toContain("Technical/provider error")
    expect(html).not.toContain("Admin manual review state")
    expect(html).not.toContain("Latest IVS Trust eKYC session status")
    expect(html).not.toContain("Seller final KYC status")
    expect(html).not.toContain("admin manual review")
    expect(html).not.toContain("admin duyệt")
  })
})
