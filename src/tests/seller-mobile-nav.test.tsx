import { renderToString } from "react-dom/server"
import { MemoryRouter } from "react-router-dom"
import { describe, expect, it, vi } from "vitest"
import { SellerLayout } from "../features/seller/components/SellerLayout"

// Mock all hooks and stores
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
        status: "active",
        kyc_status: "APPROVED",
        kyc_provider: "vnpt",
        kyc_level: "verified",
        verified_at: new Date(),
        rejected_reason: null,
        avg_rating: 4.5,
        shop_logo: null,
      },
    },
    isLoading: false,
    isError: false,
    isFetching: false,
    error: null,
    refetch: vi.fn(),
  }),
}))

vi.mock("../hooks/use-products", () => ({
  useSellerProducts: () => ({
    data: { products: [] },
    isLoading: false,
    isError: false,
  }),
}))

vi.mock("../hooks/use-seller-orders", () => ({
  useSellerOrders: () => ({
    orders: [],
    loading: false,
  }),
  deriveSellerOrderCounts: () => ({
    awaitingConfirm: 0,
    awaitingPack: 0,
  }),
}))

vi.mock("../hooks/use-chat-realtime", () => ({
  useConversations: () => ({
    conversations: [],
  }),
}))

vi.mock("../lib/domain", () => ({
  getBuyerHomeHref: () => "/",
}))

describe("SellerLayout Mobile Navigation", () => {
  it("renders hamburger button with aria-label 'Mở menu Seller'", () => {
    const html = renderToString(
      <MemoryRouter initialEntries={["/seller"]}>
        <SellerLayout />
      </MemoryRouter>
    )

    expect(html).toContain('aria-label="Mở menu Seller"')
  })

  it("contains navigation items including Xác minh KYC", () => {
    const html = renderToString(
      <MemoryRouter initialEntries={["/seller"]}>
        <SellerLayout />
      </MemoryRouter>
    )

    expect(html).toContain("Xác minh")
    expect(html).toContain("/seller/kyc")
    expect(html).toContain("Tổng quan")
    expect(html).toContain("Đơn hàng")
    expect(html).toContain("Sản phẩm")
    expect(html).toContain("Tin nhắn")
    expect(html).toContain("Cài đặt")
  })

  it("drawer has close button with aria-label 'Đóng menu Seller'", () => {
    const html = renderToString(
      <MemoryRouter initialEntries={["/seller"]}>
        <SellerLayout />
      </MemoryRouter>
    )

    expect(html).toContain('aria-label="Đóng menu Seller"')
  })

  it("mobile top bar is present with lg:hidden class", () => {
    const html = renderToString(
      <MemoryRouter initialEntries={["/seller"]}>
        <SellerLayout />
      </MemoryRouter>
    )

    // Mobile top bar should have lg:hidden
    expect(html).toContain("lg:hidden")
  })

  it("desktop sidebar has lg:flex class", () => {
    const html = renderToString(
      <MemoryRouter initialEntries={["/seller"]}>
        <SellerLayout />
      </MemoryRouter>
    )

    // Desktop sidebar should have lg:flex
    expect(html).toContain("lg:flex")
  })
})
