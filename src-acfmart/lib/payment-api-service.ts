import { Order } from '../types';

export interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  logo: string;
  supportRecurring: boolean;
}

export interface PaymentIntentRequest {
  orderId: string;
  amount: number;
  currency: string;
  customerId: string;
  returnUrl: string;
  cancelUrl: string;
  paymentMethod?: string;
}

export interface PaymentIntentResponse {
  success: boolean;
  paymentId: string;
  redirectUrl?: string;
  qrCodeData?: string;
  message?: string;
}

export interface PaymentStatusResponse {
  status: 'pending' | 'processing' | 'confirmed' | 'failed' | 'cancelled' | 'refunded';
  transactionId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  paidAt?: string;
  errorMessage?: string;
}

export interface RefundRequest {
  paymentId: string;
  amount: number;
  reason: string;
}

export interface RefundResponse {
  success: boolean;
  refundId: string;
  status: 'pending' | 'completed' | 'failed';
  message?: string;
}

class PaymentApiService {
  private apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:9000/store';
  
  async getAvailablePaymentMethods(orderValue: number): Promise<PaymentMethod[]> {
    // Trong thực tế, sẽ gọi API backend để lấy phương thức thanh toán phù hợp
    return [
      {
        id: 'cod',
        name: 'Thanh toán khi nhận hàng (COD)',
        description: 'Thanh toán trực tiếp khi nhận hàng',
        logo: '/payment-logos/cod.png',
        supportRecurring: false
      },
      {
        id: 'vnpay',
        name: 'VNPay',
        description: 'Thanh toán qua cổng VNPay',
        logo: '/payment-logos/vnpay.png',
        supportRecurring: false
      },
      {
        id: 'momo',
        name: 'MoMo',
        description: 'Ví điện tử MoMo',
        logo: '/payment-logos/momo.png',
        supportRecurring: true
      },
      {
        id: 'zalopay',
        name: 'ZaloPay',
        description: 'Ví điện tử ZaloPay',
        logo: '/payment-logos/zalopay.png',
        supportRecurring: true
      },
      {
        id: 'bank_transfer',
        name: 'Chuyển khoản ngân hàng',
        description: 'Chuyển khoản qua các ngân hàng nội địa',
        logo: '/payment-logos/bank-transfer.png',
        supportRecurring: false
      }
    ];
  }

  async createPaymentIntent(request: PaymentIntentRequest): Promise<PaymentIntentResponse> {
    try {
      // Đây là mock, trong thực tế sẽ gọi API backend để khởi tạo thanh toán
      if (request.paymentMethod === 'vnpay') {
        // Mock response cho VNPay
        return {
          success: true,
          paymentId: `vnp_${Date.now()}`,
          redirectUrl: `https://sandbox.vnpayment.vn/payment.html?vnp_TxnRef=${request.orderId}`
        };
      } else if (request.paymentMethod === 'momo') {
        // Mock response cho MoMo
        return {
          success: true,
          paymentId: `momo_${Date.now()}`,
          redirectUrl: `https://test-payment.momo.vn/checkout?url=${encodeURIComponent(
            `https://test-payment.momo.vn/pay?requestId=${request.orderId}&amount=${request.amount}`
          )}`
        };
      } else if (request.paymentMethod === 'zalopay') {
        // Mock response cho ZaloPay
        return {
          success: true,
          paymentId: `zlp_${Date.now()}`,
          qrCodeData: `zalopay://pay?app_user=user_${request.customerId}&amount=${request.amount}&order_id=${request.orderId}`
        };
      } else if (request.paymentMethod === 'cod') {
        // COD không cần redirect
        return {
          success: true,
          paymentId: `cod_${Date.now()}`,
          message: 'Đơn hàng sẽ được thanh toán khi nhận hàng'
        };
      } else {
        // Mock cho các phương thức khác
        return {
          success: true,
          paymentId: `pay_${Date.now()}`,
          redirectUrl: `${this.apiBaseUrl}/payments/${request.orderId}/process`
        };
      }
    } catch (error) {
      console.error('Error creating payment intent:', error);
      return {
        success: false,
        paymentId: '',
        message: 'Có lỗi xảy ra khi khởi tạo thanh toán'
      };
    }
  }

  async getPaymentStatus(paymentId: string): Promise<PaymentStatusResponse> {
    try {
      // Đây là mock, trong thực tế sẽ gọi API backend để kiểm tra trạng thái thanh toán
      const mockStatus: PaymentStatusResponse = {
        status: 'pending',
        transactionId: `txn_${Date.now()}`,
        amount: 1500000, // 1.5 triệu VND
        currency: 'VND',
        paymentMethod: 'vnpay',
        paidAt: new Date().toISOString()
      };

      // Trong thực tế, sẽ gọi API backend để kiểm tra trạng thái thực sự
      return mockStatus;
    } catch (error) {
      console.error('Error getting payment status:', error);
      return {
        status: 'failed',
        transactionId: '',
        amount: 0,
        currency: 'VND',
        paymentMethod: '',
        errorMessage: 'Không thể kiểm tra trạng thái thanh toán'
      };
    }
  }

  async processRefund(request: RefundRequest): Promise<RefundResponse> {
    try {
      // Đây là mock, trong thực tế sẽ gọi API backend để xử lý hoàn tiền
      return {
        success: true,
        refundId: `rfnd_${Date.now()}`,
        status: 'pending'
      };
    } catch (error) {
      console.error('Error processing refund:', error);
      return {
        success: false,
        refundId: '',
        status: 'failed',
        message: 'Có lỗi xảy ra khi xử lý hoàn tiền'
      };
    }
  }

  async validatePaymentWebhook(payload: any, signature: string): Promise<boolean> {
    // Trong thực tế, sẽ xác thực chữ ký từ cổng thanh toán
    // Mỗi cổng thanh toán có cơ chế xác thực riêng
    try {
      // Đây là logic giả lập - trong thực tế sẽ thực hiện xác thực chữ ký
      // tương ứng với từng cổng thanh toán (VNPay, Momo, ZaloPay)
      return true;
    } catch (error) {
      console.error('Error validating payment webhook:', error);
      return false;
    }
  }
}

export default new PaymentApiService();