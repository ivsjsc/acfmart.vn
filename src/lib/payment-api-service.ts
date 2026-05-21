import { getPaymentBackend, postPaymentBackend } from './payment-backend'

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
  async getAvailablePaymentMethods(_orderValue: number): Promise<PaymentMethod[]> {
    try {
      const data = await getPaymentBackend<{ methods: PaymentMethod[] }>("/store/payment/methods")
      return data.methods
    } catch {
      return [
        { id: 'cod', name: 'Thanh toán khi nhận hàng (COD)', description: 'Thanh toán trực tiếp khi nhận hàng', logo: '/payment-logos/cod.png', supportRecurring: false },
        { id: 'vnpay', name: 'VNPay', description: 'Thanh toán qua cổng VNPay', logo: '/payment-logos/vnpay.png', supportRecurring: false },
        { id: 'momo', name: 'MoMo', description: 'Ví điện tử MoMo', logo: '/payment-logos/momo.png', supportRecurring: true },
        { id: 'zalopay', name: 'ZaloPay', description: 'Ví điện tử ZaloPay', logo: '/payment-logos/zalopay.png', supportRecurring: true },
        { id: 'bank_transfer', name: 'Chuyển khoản ngân hàng', description: 'Chuyển khoản qua các ngân hàng nội địa', logo: '/payment-logos/bank-transfer.png', supportRecurring: false },
      ]
    }
  }

  async createPaymentIntent(request: PaymentIntentRequest): Promise<PaymentIntentResponse> {
    try {
      if (request.paymentMethod === 'cod') {
        return {
          success: true,
          paymentId: `cod_${Date.now()}`,
          message: 'Đơn hàng sẽ được thanh toán khi nhận hàng'
        }
      }

      const endpoint = request.paymentMethod === 'vnpay' ? '/store/payment/vnpay/sign'
        : request.paymentMethod === 'momo' ? '/store/payment/momo/init'
        : request.paymentMethod === 'zalopay' ? '/store/payment/zalopay/init'
        : '/store/payment/init'

      const result = await postPaymentBackend<{
        redirectUrl?: string
        payUrl?: string
        deeplink?: string
        order_url?: string
        providerTxnRef?: string
        requestId?: string
        zp_trans_token?: string
        qrCodeData?: string
      }>(endpoint, {
        orderId: request.orderId,
        amount: request.amount,
        orderInfo: `Thanh toan don hang ${request.orderId}`,
        returnUrl: request.returnUrl,
        cancelUrl: request.cancelUrl,
        customerId: request.customerId,
      })

      return {
        success: true,
        paymentId: result.providerTxnRef || result.requestId || result.zp_trans_token || `pay_${Date.now()}`,
        redirectUrl: result.redirectUrl || result.payUrl || result.deeplink || result.order_url,
        qrCodeData: result.qrCodeData,
      }
    } catch (error) {
      console.error('Error creating payment intent:', error)
      return {
        success: false,
        paymentId: '',
        message: error instanceof Error ? error.message : 'Có lỗi xảy ra khi khởi tạo thanh toán'
      }
    }
  }

  async getPaymentStatus(paymentId: string): Promise<PaymentStatusResponse> {
    try {
      return await getPaymentBackend<PaymentStatusResponse>(`/store/payment/status/${paymentId}`)
    } catch (error) {
      console.error('Error getting payment status:', error)
      return {
        status: 'failed',
        transactionId: '',
        amount: 0,
        currency: 'VND',
        paymentMethod: '',
        errorMessage: error instanceof Error ? error.message : 'Không thể kiểm tra trạng thái thanh toán'
      }
    }
  }

  async processRefund(request: RefundRequest): Promise<RefundResponse> {
    try {
      return await postPaymentBackend<RefundResponse>('/store/payment/refund', request)
    } catch (error) {
      console.error('Error processing refund:', error)
      return {
        success: false,
        refundId: '',
        status: 'failed',
        message: error instanceof Error ? error.message : 'Có lỗi xảy ra khi xử lý hoàn tiền'
      }
    }
  }

  async validatePaymentWebhook(payload: any, signature: string): Promise<boolean> {
    try {
      const result = await postPaymentBackend<{ valid: boolean }>('/store/payment/webhook/validate', {
        payload,
        signature,
      })
      return result.valid
    } catch (error) {
      console.error('Error validating payment webhook:', error)
      return false
    }
  }
}

export default new PaymentApiService();
