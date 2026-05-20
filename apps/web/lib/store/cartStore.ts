import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  id: string;
  productId: string;
  name: string;
  thumbnail: string;
  price: number;
  quantity: number;
  sellerId: string;
  shopName: string;
  stock: number;
}

interface CartState {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

function calcTotals(items: CartItem[]) {
  return {
    totalItems: items.reduce((sum, i) => sum + i.quantity, 0),
    totalAmount: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
  };
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      totalItems: 0,
      totalAmount: 0,

      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.productId === item.productId);
          let items: CartItem[];
          if (existing) {
            items = state.items.map((i) =>
              i.productId === item.productId
                ? { ...i, quantity: Math.min(i.quantity + item.quantity, item.stock) }
                : i
            );
          } else {
            items = [...state.items, { ...item, id: `cart-${item.productId}` }];
          }
          return { items, ...calcTotals(items) };
        }),

      removeItem: (productId) =>
        set((state) => {
          const items = state.items.filter((i) => i.productId !== productId);
          return { items, ...calcTotals(items) };
        }),

      updateQuantity: (productId, quantity) =>
        set((state) => {
          const items = quantity <= 0
            ? state.items.filter((i) => i.productId !== productId)
            : state.items.map((i) => (i.productId === productId ? { ...i, quantity } : i));
          return { items, ...calcTotals(items) };
        }),

      clearCart: () => set({ items: [], totalItems: 0, totalAmount: 0 }),
    }),
    { name: 'acfmart-cart' }
  )
);
