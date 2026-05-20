'use client';

import { useCartStore } from '@/lib/store/cartStore';
import { formatVND } from '@/lib/utils/format';

// Hook tiện ích cho giỏ hàng
export function useCart() {
  const { items, totalItems, totalAmount, addItem, removeItem, updateQuantity, clearCart } = useCartStore();

  const groupedBySeller = items.reduce(
    (acc, item) => {
      if (!acc[item.sellerId]) acc[item.sellerId] = { shopName: item.shopName, items: [] };
      acc[item.sellerId].items.push(item);
      return acc;
    },
    {} as Record<string, { shopName: string; items: typeof items }>
  );

  return {
    items,
    totalItems,
    totalAmount,
    totalAmountFormatted: formatVND(totalAmount),
    groupedBySeller,
    isEmpty: items.length === 0,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
  };
}
