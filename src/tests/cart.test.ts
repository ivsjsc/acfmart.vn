import { describe, it, expect, beforeEach } from 'vitest';
import { cartItemRequiresShipping, useCartStore } from '../stores/cart-store';

describe('Cart Store', () => {
  beforeEach(() => {
    useCartStore.getState().clear();
  });

  it('should add item to cart', () => {
    const item = {
      id: 'test-1',
      title: 'Test Product',
      price: 100000,
      thumbnail: 'https://example.com/image.jpg',
      quantity: 2,
      shopId: 'shop-1',
      shopName: 'Test Shop',
    };

    useCartStore.getState().addItem(item);

    const state = useCartStore.getState();
    expect(state.items).toHaveLength(1);
    expect(state.items[0]).toEqual(expect.objectContaining(item));
    expect(state.items[0]).toEqual(
      expect.objectContaining({
        productType: 'physical',
        requiresShipping: true,
        fulfillmentType: 'shipping',
        allowCod: true,
      })
    );
  });

  it('should mark SaaS items as non-shippable', () => {
    const item = {
      id: 'saas-1',
      title: 'SaaS Trial',
      price: 100000,
      thumbnail: 'https://example.com/image.jpg',
      quantity: 1,
      shopId: 'shop-1',
      shopName: 'Test Shop',
      productType: 'saas' as const,
      requiresShipping: false,
      fulfillmentType: 'manual_activation' as const,
      allowCod: false,
    };

    useCartStore.getState().addItem(item);

    const state = useCartStore.getState();
    expect(state.items).toHaveLength(1);
    expect(cartItemRequiresShipping(state.items[0])).toBe(false);
    expect(state.items[0].allowCod).toBe(false);
  });

  it('should update item quantity if already in cart', () => {
    const item = {
      id: 'test-1',
      title: 'Test Product',
      price: 100000,
      thumbnail: 'https://example.com/image.jpg',
      quantity: 1,
      shopId: 'shop-1',
      shopName: 'Test Shop',
    };

    useCartStore.getState().addItem(item);
    useCartStore.getState().addItem({ ...item, quantity: 1 });

    const state = useCartStore.getState();
    expect(state.items).toHaveLength(1);
    expect(state.items[0].quantity).toBe(2);
  });

  it('should remove item from cart', () => {
    const item = {
      id: 'test-1',
      title: 'Test Product',
      price: 100000,
      thumbnail: 'https://example.com/image.jpg',
      quantity: 1,
      shopId: 'shop-1',
      shopName: 'Test Shop',
    };

    useCartStore.getState().addItem(item);
    useCartStore.getState().removeItem(item.id);

    const state = useCartStore.getState();
    expect(state.items).toHaveLength(0);
  });

  it('should calculate subtotal correctly', () => {
    const items = [
      {
        id: 'test-1',
        title: 'Product 1',
        price: 100000,
        thumbnail: 'https://example.com/image1.jpg',
        quantity: 2,
        shopId: 'shop-1',
        shopName: 'Shop 1',
      },
      {
        id: 'test-2',
        title: 'Product 2',
        price: 50000,
        thumbnail: 'https://example.com/image2.jpg',
        quantity: 3,
        shopId: 'shop-2',
        shopName: 'Shop 2',
      },
    ];

    items.forEach((item) => useCartStore.getState().addItem(item));

    const subtotal = useCartStore.getState().subtotal();
    expect(subtotal).toBe(350000);
  });

  it('should clear cart', () => {
    const item = {
      id: 'test-1',
      title: 'Test Product',
      price: 100000,
      thumbnail: 'https://example.com/image.jpg',
      quantity: 1,
      shopId: 'shop-1',
      shopName: 'Test Shop',
    };

    useCartStore.getState().addItem(item);
    useCartStore.getState().clear();

    const state = useCartStore.getState();
    expect(state.items).toHaveLength(0);
  });
});
