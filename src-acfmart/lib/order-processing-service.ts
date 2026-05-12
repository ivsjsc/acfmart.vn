import { Order } from '../types';
import ShippingApiService from './shipping-api-service';
import PaymentApiService from './payment-api-service';

export type OrderStatus = 
  | 'pending'           // Đang chờ xử lý
  | 'confirmed'         // Đã xác nhận
  | 'paid'              // Đã thanh toán
  | 'preparing'         // Đang chuẩn bị hàng
  | 'shipped'           // Đã giao cho đơn vị vận chuyển
  | 'out_for_delivery'  // Đang giao
  | 'delivered'         // Đã giao
  | 'cancelled'         // Đã hủy
  | 'returned'          // Đã trả lại
  | 'refunded';         // Đã hoàn tiền

export interface OrderProcessingEvent {
  id: string;
  orderId: string;
  status: OrderStatus;
  timestamp: string;
  description: string;
  actor?: string; // Người thực hiện hành động
  metadata?: Record<string, any>; // Dữ liệu bổ sung
}

export interface OrderWithEvents extends Order {
  events: OrderProcessingEvent[];
}

class OrderProcessingService {
  private shippingApi = ShippingApiService;
  private paymentApi = PaymentApiService;

  async processOrderPaymentConfirmation(orderId: string, paymentId: string): Promise<boolean> {
    try {
      // Xác nhận thanh toán với cổng thanh toán
      const paymentStatus = await this.paymentApi.getPaymentStatus(paymentId);
      
      if (paymentStatus.status === 'confirmed') {
        // Cập nhật trạng thái đơn hàng thành 'paid'
        await this.updateOrderStatus(orderId, 'paid', {
          paymentTransactionId: paymentStatus.transactionId,
          paymentMethod: paymentStatus.paymentMethod,
          paidAt: paymentStatus.paidAt
        });
        
        // Gửi thông báo xác nhận thanh toán cho khách hàng và người bán
        await this.sendNotification(orderId, 'payment_confirmed');
        
        // Nếu người bán đã kích hoạt tự động xác nhận sau thanh toán
        // thì chuyển sang trạng thái 'confirmed'
        await this.autoConfirmOrderIfNeeded(orderId);
        
        return true;
      } else {
        console.error(`Payment not confirmed for order ${orderId}: ${paymentStatus.errorMessage}`);
        return false;
      }
    } catch (error) {
      console.error('Error processing payment confirmation:', error);
      return false;
    }
  }

  async updateOrderStatus(
    orderId: string, 
    newStatus: OrderStatus, 
    metadata?: Record<string, any>
  ): Promise<boolean> {
    try {
      // Trong thực tế, sẽ gọi API backend để cập nhật trạng thái đơn hàng
      // và tạo sự kiện trong lịch sử đơn hàng
      
      const event: OrderProcessingEvent = {
        id: `evt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        orderId,
        status: newStatus,
        timestamp: new Date().toISOString(),
        description: this.getStatusDescription(newStatus),
        metadata
      };
      
      // Lưu trữ sự kiện (trong thực tế sẽ lưu vào DB qua API)
      console.log(`Order ${orderId} status updated to ${newStatus}`, event);
      
      // Gửi thông báo trạng thái mới
      await this.sendNotification(orderId, 'status_updated', { newStatus });
      
      return true;
    } catch (error) {
      console.error('Error updating order status:', error);
      return false;
    }
  }

  private getStatusDescription(status: OrderStatus): string {
    switch (status) {
      case 'pending': return 'Đơn hàng đang chờ xử lý';
      case 'confirmed': return 'Đơn hàng đã được xác nhận';
      case 'paid': return 'Đơn hàng đã được thanh toán';
      case 'preparing': return 'Đang chuẩn bị hàng hóa';
      case 'shipped': return 'Đơn hàng đã được giao cho đơn vị vận chuyển';
      case 'out_for_delivery': return 'Đơn hàng đang được giao';
      case 'delivered': return 'Đơn hàng đã được giao thành công';
      case 'cancelled': return 'Đơn hàng đã bị hủy';
      case 'returned': return 'Đơn hàng đã được trả lại';
      case 'refunded': return 'Tiền đã được hoàn trả cho khách hàng';
      default: return 'Cập nhật trạng thái đơn hàng';
    }
  }

  private async sendNotification(
    orderId: string, 
    type: 'payment_confirmed' | 'status_updated' | 'shipment_tracked',
    data?: Record<string, any>
  ) {
    // Trong thực tế, sẽ gửi thông báo đến người dùng qua:
    // - Email
    // - SMS
    // - Ứng dụng (push notification)
    // - Cập nhật realtime trên giao diện
    
    console.log(`Sending notification for order ${orderId}, type: ${type}`, data);
  }

  private async autoConfirmOrderIfNeeded(orderId: string) {
    // Một số người bán có thể chọn tùy chọn tự động xác nhận đơn hàng
    // sau khi thanh toán thành công
    
    // Trong thực tế, sẽ kiểm tra cài đặt của người bán từ DB
    const shouldAutoConfirm = true; // giả định
    
    if (shouldAutoConfirm) {
      await this.updateOrderStatus(orderId, 'confirmed', {
        autoAction: true,
        reason: 'Automatic confirmation after payment'
      });
      
      // Bắt đầu quá trình chuẩn bị đơn hàng
      setTimeout(async () => {
        await this.updateOrderStatus(orderId, 'preparing', {
          autoAction: true,
          reason: 'Started preparation after confirmation'
        });
      }, 30000); // 30 seconds delay as example
    }
  }

  async processShipmentTracking(orderId: string, trackingNumber: string, providerId: string) {
    try {
      // Theo dõi đơn hàng qua API của đơn vị vận chuyển
      const trackingInfo = await this.shippingApi.trackShipment(providerId, trackingNumber);
      
      if (!trackingInfo) {
        throw new Error(`Could not retrieve tracking info for ${trackingNumber}`);
      }
      
      // Cập nhật trạng thái đơn hàng dựa trên thông tin theo dõi
      if (trackingInfo.status === 'delivered') {
        await this.updateOrderStatus(orderId, 'delivered', {
          deliveredAt: trackingInfo.updateTime,
          deliveryLocation: trackingInfo.location
        });
      } else if (trackingInfo.status === 'on_the_way') {
        await this.updateOrderStatus(orderId, 'out_for_delivery', {
          currentLocation: trackingInfo.location,
          lastUpdate: trackingInfo.updateTime
        });
      } else {
        // Cập nhật trạng thái khác nếu cần
        await this.sendNotification(orderId, 'shipment_tracked', {
          status: trackingInfo.status,
          location: trackingInfo.location,
          history: trackingInfo.history
        });
      }
      
      return trackingInfo;
    } catch (error) {
      console.error('Error processing shipment tracking:', error);
      throw error;
    }
  }

  async getOrderTimeline(orderId: string): Promise<OrderProcessingEvent[]> {
    // Trong thực tế, sẽ lấy lịch sử trạng thái từ DB qua API
    // Đây là dữ liệu giả lập để minh họa
    return [
      {
        id: 'evt_1',
        orderId,
        status: 'pending',
        timestamp: new Date(Date.now() - 5 * 60000).toISOString(), // 5 phút trước
        description: 'Đơn hàng đang chờ xử lý'
      },
      {
        id: 'evt_2',
        orderId,
        status: 'paid',
        timestamp: new Date(Date.now() - 3 * 60000).toISOString(), // 3 phút trước
        description: 'Đơn hàng đã được thanh toán',
        metadata: {
          paymentTransactionId: 'txn_12345',
          paymentMethod: 'vnpay'
        }
      },
      {
        id: 'evt_3',
        orderId,
        status: 'confirmed',
        timestamp: new Date(Date.now() - 2 * 60000).toISOString(), // 2 phút trước
        description: 'Đơn hàng đã được xác nhận'
      }
    ];
  }

  async handlePaymentDispute(orderId: string, disputeReason: string) {
    // Xử lý tranh chấp thanh toán
    // Trong thực tế, sẽ tích hợp với hệ thống thanh toán để xử lý tranh chấp
    console.log(`Handling payment dispute for order ${orderId}: ${disputeReason}`);
    
    // Tạm dừng xử lý đơn hàng cho đến khi giải quyết tranh chấp
    await this.updateOrderStatus(orderId, 'pending', {
      reason: 'Payment dispute in progress',
      disputeReason
    });
  }

  async processRefund(orderId: string, reason: string) {
    try {
      // Trong thực tế, sẽ gọi API thanh toán để hoàn tiền
      await this.paymentApi.processRefund({
        paymentId: `pay_${orderId}`, // giả định ID thanh toán
        amount: 1500000, // giá trị mẫu
        reason
      });
      
      // Cập nhật trạng thái đơn hàng
      await this.updateOrderStatus(orderId, 'refunded', {
        reason,
        refundedAt: new Date().toISOString()
      });
      
      // Gửi thông báo hoàn tiền
      await this.sendNotification(orderId, 'status_updated', { 
        newStatus: 'refunded',
        reason 
      });
      
      return true;
    } catch (error) {
      console.error('Error processing refund:', error);
      return false;
    }
  }
}

export default new OrderProcessingService();