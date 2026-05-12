import { sdk } from './medusa'

interface ListParams {
  limit?: number
  offset?: number
  fields?: string
  expand?: string
}

interface ProductListParams extends ListParams {
  q?: string
  category_id?: string[]
  collection_id?: string[]
  id?: string[]
  sales_channel_id?: string[]
}

interface CartCreateData {
  region_id?: string
  currency_code?: string
  sales_channel_id?: string
}

interface CartUpdateData {
  region_id?: string
  country_code?: string
  email?: string
  shipping_address?: any
  billing_address?: any
}

interface CartAddLineItemData {
  variant_id: string
  quantity: number
  metadata?: Record<string, unknown>
}

interface CartUpdateLineItemData {
  quantity: number
}

export class MedusaAPI {
  static async listProducts(params?: ProductListParams) {
    try {
      const { products, count, offset, limit } = await sdk.store.product.list({
        ...params,
      })
      
      return {
        products,
        count,
        offset,
        limit
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      throw error
    }
  }

  static async getProduct(id: string) {
    try {
      const { product } = await sdk.store.product.retrieve(id)
      return product
    } catch (error) {
      console.error('Error fetching product:', error)
      throw error
    }
  }

  static async listCategories() {
    try {
      const { collections } = await sdk.store.collection.list({})
      return collections
    } catch (error) {
      console.error('Error fetching categories:', error)
      throw error
    }
  }

  static async getCategory(id: string) {
    try {
      const { collection } = await sdk.store.collection.retrieve(id)
      return collection
    } catch (error) {
      console.error('Error fetching category:', error)
      throw error
    }
  }

  static async createCart(data?: CartCreateData) {
    try {
      const { cart } = await sdk.store.cart.create(data || {})
      return cart
    } catch (error) {
      console.error('Error creating cart:', error)
      throw error
    }
  }

  static async retrieveCart(cartId: string) {
    try {
      const { cart } = await sdk.store.cart.retrieve(cartId)
      return cart
    } catch (error) {
      console.error('Error retrieving cart:', error)
      throw error
    }
  }

  static async updateCart(cartId: string, data: CartUpdateData) {
    try {
      const { cart } = await sdk.store.cart.update(cartId, data)
      return cart
    } catch (error) {
      console.error('Error updating cart:', error)
      throw error
    }
  }

  static async addLineItem(cartId: string, data: CartAddLineItemData) {
    try {
      const { cart } = await sdk.store.cart.createLineItem(cartId, data)
      return cart
    } catch (error) {
      console.error('Error adding line item:', error)
      throw error
    }
  }

  static async updateLineItem(cartId: string, lineItemId: string, data: CartUpdateLineItemData) {
    try {
      const { cart } = await sdk.store.cart.updateLineItem(cartId, lineItemId, data)
      return cart
    } catch (error) {
      console.error('Error updating line item:', error)
      throw error
    }
  }

  static async removeLineItem(cartId: string, lineItemId: string) {
    try {
      await sdk.store.cart.deleteLineItem(cartId, lineItemId)
      const { cart } = await sdk.store.cart.retrieve(cartId)
      return cart
    } catch (error) {
      console.error('Error removing line item:', error)
      throw error
    }
  }

  static async listOrders(customerId: string) {
    try {
      const { orders } = await sdk.store.order.list({
        fields: '*'
      })
      return orders
    } catch (error) {
      console.error('Error fetching orders:', error)
      throw error
    }
  }

  static async retrieveOrder(id: string) {
    try {
      const { order } = await sdk.store.order.retrieve(id)
      return order
    } catch (error) {
      console.error('Error fetching order:', error)
      throw error
    }
  }

  static async completeCart(cartId: string) {
    try {
      const completeResponse = await sdk.store.cart.complete(cartId)
      const response = { type: 'order', data: completeResponse }
      return { response, order: completeResponse }
    } catch (error) {
      console.error('Error completing cart:', error)
      throw error
    }
  }
}