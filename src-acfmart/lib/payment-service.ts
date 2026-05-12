import { postBackend } from "./api-base"

export interface PaymentMethod {
  id: string
  name: string
  description: string
  logo: string
  enabled: boolean
}

export interface PaymentIntentData {
  amount: number
  currency: string
  payment_method: string
  return_url?: string
  cancel_url?: string
  metadata?: Record<string, string>
}

export interface PaymentResult {
  success: boolean
  payment_intent_id?: string
  redirect_url?: string
  error?: string
  status?: 'pending' | 'succeeded' | 'failed' | 'cancelled'
}

export class PaymentService {
  private static readonly SUPPORTED_METHODS: PaymentMethod[] = [
    {
      id: 'cod',
      name: 'Thanh toán khi nhận hàng',
      description: 'Thanh toán bằng tiền mặt hoặc chuyển khoản khi nhận hàng',
      logo: '',
      enabled: true
    },
    {
      id: 'vnpay',
      name: 'VNPay',
      description: 'Thanh toán qua cổng VNPay',
      logo: '',
      enabled: true
    },
    {
      id: 'momo',
      name: 'MoMo',
      description: 'Thanh toán ví MoMo',
      logo: '',
      enabled: true
    },
    {
      id: 'zalopay',
      name: 'ZaloPay',
      description: 'Thanh toán ví ZaloPay',
      logo: '',
      enabled: true
    },
    {
      id: 'bank_transfer',
      name: 'Chuyển khoản ngân hàng',
      description: 'Chuyển khoản qua Internet Banking hoặc ATM',
      logo: '',
      enabled: true
    },
    {
      id: 'credit_card',
      name: 'Thẻ tín dụng/nợ',
      description: 'Visa, Mastercard, JCB, Amex',
      logo: '',
      enabled: true
    }
  ]

  /**
   * Get list of available payment methods
   */
  static getAvailablePaymentMethods(): PaymentMethod[] {
    return this.SUPPORTED_METHODS.filter(method => method.enabled)
  }

  /**
   * Process a payment using the specified method
   */
  static async processPayment(data: PaymentIntentData): Promise<PaymentResult> {
    // Validate inputs
    if (data.amount <= 0) {
      return {
        success: false,
        error: 'Số tiền thanh toán không hợp lệ'
      }
    }
    
    if (!this.SUPPORTED_METHODS.some(m => m.id === data.payment_method)) {
      return {
        success: false,
        error: 'Phương thức thanh toán không được hỗ trợ'
      }
    }
    
    // Simulate processing based on payment method
    switch (data.payment_method) {
      case 'cod':
        return {
          success: true,
          status: 'succeeded',
          payment_intent_id: `cod_${Date.now()}`
        }
        
      case 'vnpay': {
        const orderId = data.metadata?.orderCode || `ACF${Date.now()}`
        const result = await postBackend<{
          redirectUrl: string
          providerTxnRef?: string
        }>("/store/payment/vnpay/sign", {
          orderId,
          amount: data.amount,
          orderInfo: data.metadata?.orderInfo || `Thanh toan don hang ${orderId}`,
          returnUrl: data.return_url,
        })

        return {
          success: true,
          redirect_url: result.redirectUrl,
          status: "pending",
          payment_intent_id: result.providerTxnRef || orderId,
        }
      }

      case 'momo': {
        const orderId = data.metadata?.orderCode || `ACF${Date.now()}`
        const result = await postBackend<{
          payUrl?: string
          deeplink?: string
          requestId?: string
          message?: string
          resultCode?: number
        }>("/store/payment/momo/init", {
          orderId,
          amount: data.amount,
          orderInfo: data.metadata?.orderInfo || `Thanh toan don hang ${orderId}`,
          redirectUrl: data.return_url,
        })

        return {
          success: true,
          redirect_url: result.payUrl || result.deeplink,
          status: "pending",
          payment_intent_id: result.requestId || orderId,
          error: result.resultCode && result.resultCode !== 0 ? result.message : undefined,
        }
      }

      case 'zalopay': {
        const orderId = data.metadata?.orderCode || `ACF${Date.now()}`
        const result = await postBackend<{
          order_url?: string
          zp_trans_token?: string
          return_message?: string
          return_code?: number
        }>("/store/payment/zalopay/init", {
          orderId,
          amount: data.amount,
          app_user: data.metadata?.buyerEmail || data.metadata?.buyerPhone || "guest",
          description: data.metadata?.orderInfo || `Thanh toan don hang ${orderId}`,
          embed_data: {
            redirecturl: data.return_url,
          },
        })

        return {
          success: true,
          redirect_url: result.order_url,
          status: "pending",
          payment_intent_id: result.zp_trans_token || orderId,
          error: result.return_code && result.return_code !== 1 ? result.return_message : undefined,
        }
      }
        
      default:
        return {
          success: true,
          status: 'succeeded',
          payment_intent_id: `pay_${Date.now()}`
        }
    }
  }

  /**
   * Verify a payment status
   */
  static async verifyPayment(paymentIntentId: string): Promise<PaymentResult> {
    return {
      success: false,
      payment_intent_id: paymentIntentId,
      status: 'pending',
      error: 'Trạng thái thanh toán phải được xác nhận qua webhook backend'
    }
  }

  /**
   * Cancel a payment
   */
  static async cancelPayment(paymentIntentId: string): Promise<boolean> {
    console.warn(`Payment cancellation must be implemented per provider: ${paymentIntentId}`)
    return false
  }
}
