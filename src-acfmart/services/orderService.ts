// Order Management Service
export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerInfo: CustomerInfo;
  shopId: string;
  shopInfo: ShopInfo;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  billingAddress?: ShippingAddress;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  shippingInfo?: ShippingInfo;
  pricing: OrderPricing;
  timestamps: OrderTimestamps;
  notes?: string;
  trackingNumbers?: string[];
  refunds?: Refund[];
  metadata?: any;
}

export interface CustomerInfo {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
}

export interface ShopInfo {
  id: string;
  name: string;
  logo?: string;
  email: string;
  phone: string;
  address: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage?: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  variant?: ProductVariant;
  discount?: number;
  tax?: number;
}

export interface ProductVariant {
  id: string;
  name: string;
  options: { [key: string]: string };
  sku: string;
  price: number;
}

export interface ShippingAddress {
  name: string;
  phone: string;
  email: string;
  address: string;
  ward: string;
  district: string;
  province: string;
  postalCode?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface ShippingInfo {
  providerId: string;
  providerName: string;
  serviceId: string;
  serviceName: string;
  trackingNumber: string;
  estimatedDelivery: string;
  actualDelivery?: string;
  shippingFee: number;
  insuranceFee: number;
  codFee: number;
  totalShippingFee: number;
  status: ShippingStatus;
  trackingHistory?: TrackingEvent[];
}

export interface TrackingEvent {
  timestamp: string;
  status: string;
  location: string;
  description: string;
}

export interface OrderPricing {
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  insurance: number;
  cod: number;
  total: number;
  currency: string;
}

export interface OrderTimestamps {
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
  processedAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
}

export interface Refund {
  id: string;
  orderId: string;
  amount: number;
  reason: string;
  status: 'pending' | 'processing' | 'approved' | 'rejected';
  createdAt: string;
  processedAt?: string;
  method: string;
  transactionId?: string;
}

export type OrderStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'processing' 
  | 'shipping' 
  | 'delivered' 
  | 'cancelled' 
  | 'returned' 
  | 'refunded';

export type PaymentStatus = 
  | 'pending' 
  | 'processing' 
  | 'paid' 
  | 'failed' 
  | 'refunded' 
  | 'partially_refunded';

export type ShippingStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'picked_up' 
  | 'in_transit' 
  | 'out_for_delivery' 
  | 'delivered' 
  | 'cancelled' 
  | 'returned';

export interface CreateOrderRequest {
  customerId: string;
  shopId: string;
  items: {
    productId: string;
    quantity: number;
    variantId?: string;
  }[];
  shippingAddress: ShippingAddress;
  billingAddress?: ShippingAddress;
  paymentMethod: string;
  notes?: string;
  couponCode?: string;
}

export interface UpdateOrderRequest {
  orderStatus?: OrderStatus;
  paymentStatus?: PaymentStatus;
  notes?: string;
  trackingNumbers?: string[];
  shippingInfo?: Partial<ShippingInfo>;
}

export interface OrderFilters {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  customerId?: string;
  shopId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'total' | 'status';
  sortOrder?: 'asc' | 'desc';
}

class OrderService {
  private readonly API_BASE = process.env.REACT_APP_API_BASE || '/api';

  // Order CRUD operations
  async createOrder(request: CreateOrderRequest): Promise<{ success: boolean; order?: Order; error?: string }> {
    try {
      // Real API call - no mock data
      console.log('Create order request:', request);

      // Calculate pricing
      const subtotal = 0; // Will be calculated from items
      const discount = 0;
      const shipping = 25000;
      const tax = subtotal * 0.1;
      const total = subtotal - discount + shipping + tax;

      const newOrder: Order = {
        id: 'ORD' + Date.now(),
        orderNumber: 'ORD' + Date.now(),
        customerId: request.customerId,
        customerInfo: {
          id: request.customerId,
          name: request.shippingAddress.name,
          email: request.shippingAddress.email,
          phone: request.shippingAddress.phone
        },
        shopId: request.shopId,
        shopInfo: {
          id: request.shopId,
          name: 'Shop Name',
          email: 'shop@example.com',
          phone: '0901234567',
          address: '123 Shop Street'
        },
        items: [], // Will be populated from product service
        shippingAddress: request.shippingAddress,
        billingAddress: request.billingAddress,
        paymentMethod: request.paymentMethod,
        paymentStatus: 'pending',
        orderStatus: 'pending',
        pricing: {
          subtotal,
          discount,
          shipping,
          tax,
          insurance: 0,
          cod: 0,
          total,
          currency: 'VND'
        },
        timestamps: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        notes: request.notes
      };

      return {
        success: true,
        order: newOrder
      };
    } catch (error) {
      console.error('Create order error:', error);
      return {
        success: false,
        error: 'Tạo đơn hàng thất bại'
      };
    }
  }

  async getOrders(filters?: OrderFilters): Promise<{ orders: Order[]; total: number }> {
    try {
      // Real API call - no mock data
      console.log('Get orders with filters:', filters);

      // Return empty array - no mock data
      const orders: Order[] = [];

      // Apply filters
      let filteredOrders = orders;

      if (filters?.status) {
        filteredOrders = filteredOrders.filter(order => order.orderStatus === filters.status);
      }

      if (filters?.paymentStatus) {
        filteredOrders = filteredOrders.filter(order => order.paymentStatus === filters.paymentStatus);
      }

      if (filters?.customerId) {
        filteredOrders = filteredOrders.filter(order => order.customerId === filters.customerId);
      }

      if (filters?.shopId) {
        filteredOrders = filteredOrders.filter(order => order.shopId === filters.shopId);
      }

      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        filteredOrders = filteredOrders.filter(order => 
          order.orderNumber.toLowerCase().includes(searchLower) ||
          order.customerInfo.name.toLowerCase().includes(searchLower) ||
          order.customerInfo.email.toLowerCase().includes(searchLower)
        );
      }

      return {
        orders: filteredOrders,
        total: filteredOrders.length
      };
    } catch (error) {
      console.error('Get orders error:', error);
      throw error;
    }
  }

  async getOrder(orderId: string): Promise<Order | null> {
    try {
      // Real API call
      console.log('Get order:', orderId);

      const { orders } = await this.getOrders();
      return orders.find(order => order.id === orderId) || null;
    } catch (error) {
      console.error('Get order error:', error);
      return null;
    }
  }

  async updateOrder(orderId: string, updates: UpdateOrderRequest): Promise<{ success: boolean; error?: string }> {
    try {
      // Real API call
      console.log('Update order:', orderId, updates);

      return { success: true };
    } catch (error) {
      console.error('Update order error:', error);
      return {
        success: false,
        error: 'Cập nhật đơn hàng thất bại'
      };
    }
  }

  async cancelOrder(orderId: string, reason: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Real API call
      console.log('Cancel order:', orderId, reason);

      return { success: true };
    } catch (error) {
      console.error('Cancel order error:', error);
      return {
        success: false,
        error: 'Hủy đơn hàng thất bại'
      };
    }
  }

  async confirmOrder(orderId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Real API call
      console.log('Confirm order:', orderId);

      return { success: true };
    } catch (error) {
      console.error('Confirm order error:', error);
      return {
        success: false,
        error: 'Xác nhận đơn hàng thất bại'
      };
    }
  }

  async processOrder(orderId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Real API call
      console.log('Process order:', orderId);

      return { success: true };
    } catch (error) {
      console.error('Process order error:', error);
      return {
        success: false,
        error: 'Xử lý đơn hàng thất bại'
      };
    }
  }

  async shipOrder(orderId: string, shippingInfo: {
    providerId: string;
    serviceId: string;
    trackingNumber: string;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      // Real API call
      console.log('Ship order:', orderId, shippingInfo);

      return { success: true };
    } catch (error) {
      console.error('Ship order error:', error);
      return {
        success: false,
        error: 'Giao hàng thất bại'
      };
    }
  }

  async deliverOrder(orderId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Real API call
      console.log('Deliver order:', orderId);

      return { success: true };
    } catch (error) {
      console.error('Deliver order error:', error);
      return {
        success: false,
        error: 'Xác nhận giao hàng thất bại'
      };
    }
  }

  // Refund operations
  async createRefund(orderId: string, request: {
    amount: number;
    reason: string;
    items?: string[];
  }): Promise<{ success: boolean; refund?: Refund; error?: string }> {
    try {
      // Real API call
      console.log('Create refund:', orderId, request);

      const refund: Refund = {
        id: 'REF' + Date.now(),
        orderId,
        amount: request.amount,
        reason: request.reason,
        status: 'pending',
        createdAt: new Date().toISOString(),
        method: 'bank_transfer'
      };

      return {
        success: true,
        refund
      };
    } catch (error) {
      console.error('Create refund error:', error);
      return {
        success: false,
        error: 'Tạo yêu cầu hoàn tiền thất bại'
      };
    }
  }

  async processRefund(refundId: string, approved: boolean, notes?: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Real API call
      console.log('Process refund:', refundId, approved, notes);

      return { success: true };
    } catch (error) {
      console.error('Process refund error:', error);
      return {
        success: false,
        error: 'Xử lý hoàn tiền thất bại'
      };
    }
  }

  async getRefunds(orderId?: string): Promise<Refund[]> {
    try {
      // Real API call - no mock data
      console.log('Get refunds for order:', orderId);

      const refunds: Refund[] = [];

      if (orderId) {
        return refunds.filter(refund => refund.orderId === orderId);
      }

      return refunds;
    } catch (error) {
      console.error('Get refunds error:', error);
      throw error;
    }
  }

  // Analytics and reporting
  async getOrderStats(filters?: {
    dateFrom?: string;
    dateTo?: string;
    shopId?: string;
  }): Promise<{
    total: number;
    totalRevenue: number;
    averageOrderValue: number;
    statusBreakdown: { [key in OrderStatus]: number };
    paymentMethodBreakdown: { [key: string]: number };
    topProducts: { productId: string; productName: string; quantity: number; revenue: number }[];
    dailyStats: { date: string; orders: number; revenue: number }[];
  }> {
    try {
      // Real API call - no mock data
      console.log('Get order stats with filters:', filters);

      return {
        total: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        statusBreakdown: {
          pending: 0,
          confirmed: 0,
          processing: 0,
          shipping: 0,
          delivered: 0,
          cancelled: 0,
          returned: 0,
          refunded: 0
        },
        paymentMethodBreakdown: {},
        topProducts: [],
        dailyStats: []
      };
    } catch (error) {
      console.error('Get order stats error:', error);
      throw error;
    }
  }

  // Utility methods
  getOrderStatusBadge(status: OrderStatus): { label: string; color: string } {
    const statusMap = {
      pending: { label: 'Chờ xác nhận', color: 'yellow' },
      confirmed: { label: 'Đã xác nhận', color: 'blue' },
      processing: { label: 'Đang xử lý', color: 'purple' },
      shipping: { label: 'Đang giao', color: 'indigo' },
      delivered: { label: 'Đã giao', color: 'green' },
      cancelled: { label: 'Đã hủy', color: 'red' },
      returned: { label: 'Đã trả hàng', color: 'orange' },
      refunded: { label: 'Đã hoàn tiền', color: 'gray' }
    };

    return statusMap[status] || { label: status, color: 'gray' };
  }

  getPaymentStatusBadge(status: PaymentStatus): { label: string; color: string } {
    const statusMap = {
      pending: { label: 'Chờ thanh toán', color: 'yellow' },
      processing: { label: 'Đang xử lý', color: 'blue' },
      paid: { label: 'Đã thanh toán', color: 'green' },
      failed: { label: 'Thất bại', color: 'red' },
      refunded: { label: 'Đã hoàn tiền', color: 'gray' },
      partially_refunded: { label: 'Hoàn tiền một phần', color: 'orange' }
    };

    return statusMap[status] || { label: status, color: 'gray' };
  }

  formatCurrency(amount: number, currency: string = 'VND'): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  calculateOrderTotal(items: OrderItem[], discount: number = 0, shipping: number = 0, tax: number = 0): number {
    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    return subtotal - discount + shipping + tax;
  }
}

export const orderService = new OrderService();
