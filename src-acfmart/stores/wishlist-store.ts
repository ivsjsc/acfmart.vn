import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface WishlistItem {
  productId: string
  title: string
  thumbnail?: string
  price: number
  shopName: string
  addedAt: string
}

interface WishlistState {
  items: WishlistItem[]
  add: (item: Omit<WishlistItem, "addedAt">) => void
  remove: (productId: string) => void
  has: (productId: string) => boolean
  clear: () => void
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (item) =>
        set((state) => {
          if (state.items.some((i) => i.productId === item.productId))
            return state
          return {
            items: [
              ...state.items,
              { ...item, addedAt: new Date().toISOString() },
            ],
          }
        }),
      remove: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),
      has: (productId) =>
        get().items.some((i) => i.productId === productId),
      clear: () => set({ items: [] }),
    }),
    { name: "acfmart-wishlist" }
  )
)
