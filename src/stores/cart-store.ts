import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface CartItem {
  id: string
  productId: string
  variantId: string
  title: string
  thumbnail?: string
  price: number
  quantity: number
  shopId: string
  shopName: string
  isVerified: boolean
}

export const MAX_CART_ITEMS = 100

export interface CartMutationResult {
  ok: boolean
  message?: string
}

interface CartState {
  items: CartItem[]
  selectedIds: string[]
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => CartMutationResult
  removeItem: (id: string) => void
  removeItems: (ids: string[]) => void
  updateQuantity: (id: string, quantity: number) => CartMutationResult
  toggleSelected: (id: string) => void
  selectItems: (ids: string[]) => void
  unselectItems: (ids: string[]) => void
  selectShop: (shopId: string) => void
  unselectShop: (shopId: string) => void
  clearSelection: () => void
  clearPurchasedItems: () => void
  clear: () => void
  totalItems: () => number
  selectedItems: () => CartItem[]
  subtotal: () => number
  selectedSubtotal: () => number
}

function totalQuantity(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0)
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      selectedIds: [],
      addItem: (item) => {
        const quantity = item.quantity ?? 1
        const state = get()
        const currentTotal = totalQuantity(state.items)
        if (currentTotal + quantity > MAX_CART_ITEMS) {
          return {
            ok: false,
            message: `Giỏ hàng tối đa ${MAX_CART_ITEMS} sản phẩm. Vui lòng xóa bớt trước khi thêm.`,
          }
        }

        set((state) => {
          const existing = state.items.find((i) => i.id === item.id)
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i
              ),
              selectedIds: state.selectedIds.includes(item.id)
                ? state.selectedIds
                : [...state.selectedIds, item.id],
            }
          }
          return {
            items: [...state.items, { ...item, quantity }],
            selectedIds: [...state.selectedIds, item.id],
          }
        })

        return { ok: true }
      },
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
          selectedIds: state.selectedIds.filter((selectedId) => selectedId !== id),
        })),
      removeItems: (ids) =>
        set((state) => {
          const idSet = new Set(ids)
          return {
            items: state.items.filter((item) => !idSet.has(item.id)),
            selectedIds: state.selectedIds.filter((id) => !idSet.has(id)),
          }
        }),
      updateQuantity: (id, quantity) => {
        const state = get()
        const target = state.items.find((item) => item.id === id)
        if (!target) return { ok: false, message: "Không tìm thấy sản phẩm trong giỏ." }
        if (quantity <= 0) {
          get().removeItem(id)
          return { ok: true }
        }

        const totalWithoutTarget = state.items.reduce(
          (sum, item) => sum + (item.id === id ? 0 : item.quantity),
          0
        )
        if (totalWithoutTarget + quantity > MAX_CART_ITEMS) {
          return {
            ok: false,
            message: `Giỏ hàng tối đa ${MAX_CART_ITEMS} sản phẩm. Vui lòng xóa bớt trước khi tăng số lượng.`,
          }
        }

        set((state) => ({
          items: state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
        }))
        return { ok: true }
      },
      toggleSelected: (id) =>
        set((state) => ({
          selectedIds: state.selectedIds.includes(id)
            ? state.selectedIds.filter((selectedId) => selectedId !== id)
            : [...state.selectedIds, id],
        })),
      selectItems: (ids) =>
        set((state) => {
          const availableIds = new Set(state.items.map((item) => item.id))
          return {
            selectedIds: Array.from(
              new Set([
                ...state.selectedIds,
                ...ids.filter((id) => availableIds.has(id)),
              ])
            ),
          }
        }),
      unselectItems: (ids) =>
        set((state) => {
          const idSet = new Set(ids)
          return { selectedIds: state.selectedIds.filter((id) => !idSet.has(id)) }
        }),
      selectShop: (shopId) => {
        const ids = get().items
          .filter((item) => item.shopId === shopId)
          .map((item) => item.id)
        get().selectItems(ids)
      },
      unselectShop: (shopId) => {
        const ids = get().items
          .filter((item) => item.shopId === shopId)
          .map((item) => item.id)
        get().unselectItems(ids)
      },
      clearSelection: () => set({ selectedIds: [] }),
      clearPurchasedItems: () => {
        const selected = new Set(get().selectedIds)
        set((state) => ({
          items: state.items.filter((item) => !selected.has(item.id)),
          selectedIds: [],
        }))
      },
      clear: () => set({ items: [], selectedIds: [] }),
      totalItems: () => totalQuantity(get().items),
      selectedItems: () => {
        const selected = new Set(get().selectedIds ?? [])
        return get().items.filter((item) => selected.has(item.id))
      },
      subtotal: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      selectedSubtotal: () =>
        get().selectedItems().reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    {
      name: "acfmart-cart",
      partialize: (state) => ({
        items: state.items,
        selectedIds: state.selectedIds,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return
        const availableIds = new Set(state.items.map((item) => item.id))
        const restoredSelection = state.selectedIds ?? state.items.map((item) => item.id)
        state.selectedIds = restoredSelection.filter((id) => availableIds.has(id))
      },
    }
  )
)
