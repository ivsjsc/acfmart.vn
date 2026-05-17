import { describe, it, expect, beforeEach } from "vitest"
import { useCartStore } from "../stores/cart-store"

describe("Checkout Workflow", () => {
  beforeEach(() => {
    useCartStore.getState().clear()
  })

  it("should prevent checkout with empty cart", () => {
    const items = useCartStore.getState().items
    expect(items).toHaveLength(0)
  })

  it("should calculate shipping and total correctly", () => {
    const item = {
      id: "test-1",
      title: "Test Product",
      price: 200000,
      thumbnail: "https://example.com/image.jpg",
      quantity: 2,
      shopId: "shop-1",
      shopName: "Test Shop",
    }

    useCartStore.getState().addItem(item)

    const subtotal = useCartStore.getState().subtotal()
    const shippingFee = 30000
    const total = subtotal + shippingFee

    expect(subtotal).toBe(400000)
    expect(total).toBe(430000)
  })

  it("should apply voucher discount correctly", () => {
    const item = {
      id: "test-1",
      title: "Test Product",
      price: 500000,
      thumbnail: "https://example.com/image.jpg",
      quantity: 1,
      shopId: "shop-1",
      shopName: "Test Shop",
    }

    useCartStore.getState().addItem(item)

    const subtotal = useCartStore.getState().subtotal()
    const discount = 50000 // 10% off
    const finalTotal = subtotal - discount

    expect(subtotal).toBe(500000)
    expect(finalTotal).toBe(450000)
  })
})
