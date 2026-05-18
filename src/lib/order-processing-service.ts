import { Order } from '../types';
import ShippingApiService from './shipping-api-service';
import PaymentApiService from './payment-api-service';
import { httpsCallable } from 'firebase/functions';
import { functions, firestore } from './firebase';
import { doc, updateDoc, collection, addDoc, getDocs, query, orderBy, serverTimestamp, getDoc } from 'firebase/firestore';

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'paid'
  | 'preparing'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'returned'
  | 'refunded';

export interface OrderProcessingEvent {
  id: string;
  orderId: string;
  status: OrderStatus;
  timestamp: string;
  description: string;
  actor?: string;
  metadata?: Record<string, any>;
}

export interface OrderWithEvents extends Order {
  events: OrderProcessingEvent[];
}

class OrderProcessingService {
  private shippingApi = ShippingApiService;
  private paymentApi = PaymentApiService;

  async processOrderPaymentConfirmation(orderId: string, paymentId: string): Promise<boolean> {
    try {
      const paymentStatus = await this.paymentApi.getPaymentStatus(paymentId);

      if (paymentStatus.status === 'confirmed') {
        await this.updateOrderStatus(orderId, 'paid', {
          paymentTransactionId: paymentStatus.transactionId,
          paymentMethod: paymentStatus.paymentMethod,
          paidAt: paymentStatus.paidAt
        });

        await this.sendNotification(orderId, 'payment_confirmed');
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
      const orderRef = doc(firestore, "orders", orderId);
      await updateDoc(orderRef, {
        status: newStatus,
        updated_at: serverTimestamp(),
        ...(metadata || {}),
      });

      const eventsRef = collection(firestore, "orders", orderId, "events");
      await addDoc(eventsRef, {
        orderId,
        status: newStatus,
        timestamp: serverTimestamp(),
        description: this.getStatusDescription(newStatus),
        metadata: metadata || null,
      });

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
    try {
      const notifyOrder = httpsCallable(functions, 'notifyOrderUpdate');
      await notifyOrder({ orderId, type, ...data });
    } catch {
      console.warn(`Notification send failed for order ${orderId}, type: ${type}`);
    }
  }

  private async autoConfirmOrderIfNeeded(orderId: string) {
    try {
      const orderSnap = await getDoc(doc(firestore, "orders", orderId));
      if (!orderSnap.exists()) return;

      const shopId = orderSnap.data().shop_id;
      if (!shopId) return;

      const vendorSnap = await getDoc(doc(firestore, "vendors", shopId));
      const shouldAutoConfirm = vendorSnap.exists() && vendorSnap.data().auto_confirm_after_payment === true;

      if (shouldAutoConfirm) {
        await this.updateOrderStatus(orderId, 'confirmed', {
          autoAction: true,
          reason: 'Automatic confirmation after payment'
        });
      }
    } catch (error) {
      console.error('Error in autoConfirmOrderIfNeeded:', error);
    }
  }

  async processShipmentTracking(orderId: string, trackingNumber: string, providerId: string) {
    try {
      const trackingInfo = await this.shippingApi.trackShipment(providerId, trackingNumber);

      if (!trackingInfo) {
        throw new Error(`Could not retrieve tracking info for ${trackingNumber}`);
      }

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
    try {
      const eventsRef = collection(firestore, "orders", orderId, "events");
      const q = query(eventsRef, orderBy("timestamp", "asc"));
      const snap = await getDocs(q);
      return snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          orderId,
          status: data.status,
          timestamp: data.timestamp?.toDate?.()?.toISOString() || new Date().toISOString(),
          description: data.description,
          actor: data.actor,
          metadata: data.metadata,
        };
      });
    } catch (error) {
      console.error('Error fetching order timeline:', error);
      return [];
    }
  }

  async handlePaymentDispute(orderId: string, disputeReason: string) {
    await this.updateOrderStatus(orderId, 'pending', {
      reason: 'Payment dispute in progress',
      disputeReason
    });
  }

  async processRefund(returnRequestId: string, reason: string) {
    try {
      const processReturnRefund = httpsCallable<
        { returnRequestId: string; note?: string },
        { status: string; refundMethod: string; refundAmount: number }
      >(functions, 'processReturnRefund');

      const result = await processReturnRefund({
        returnRequestId,
        note: reason,
      });

      return result.data.status === 'refunded' || result.data.status === 'pending_provider';
    } catch (error) {
      console.error('Error processing refund:', error);
      return false;
    }
  }
}

export default new OrderProcessingService();
