/**
 * Service for handling payments with various payment gateways
 */

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
    // In a real implementation, this would call the backend to create a payment intent
    // and redirect the user to the payment gateway
    
    // For demo purposes, we'll simulate different behaviors based on payment method
    await new Promise(resolve => setTimeout(resolve, 1000))
    
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
        // Cash on delivery doesn't require payment processing
        return {
          success: true,
          status: 'succeeded',
          payment_intent_id: `cod_${Date.now()}`
        }
        
      case 'vnpay':
        // Simulate VNPay redirect
        return {
          success: true,
          redirect_url: `https://sandbox.vnpayment.vn/tryitnow?amount=${data.amount}&order_id=vnp_${Date.now()}`,
          status: 'pending',
          payment_intent_id: `vnp_${Date.now()}`
        }
        
      case 'momo':
        // Simulate MoMo redirect
        return {
          success: true,
          redirect_url: `https://test-payment.momo.vn?amount=${data.amount}&order_id=momo_${Date.now()}`,
          status: 'pending',
          payment_intent_id: `momo_${Date.now()}`
        }
        
      case 'zalopay':
        // Simulate ZaloPay redirect
        return {
          success: true,
          redirect_url: `https://sandbox.zalopay.vn?amount=${data.amount}&order_id=zlp_${Date.now()}`,
          status: 'pending',
          payment_intent_id: `zlp_${Date.now()}`
        }
        
      default:
        // For other methods, simulate success
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
    // In a real implementation, this would call the backend to verify payment status
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Simulate random success/failure for demo
    const isSuccess = Math.random() > 0.1 // 90% success rate
    
    return {
      success: isSuccess,
      payment_intent_id: paymentIntentId,
      status: isSuccess ? 'succeeded' : 'failed',
      error: isSuccess ? undefined : 'Thanh toán thất bại, vui lòng thử lại'
    }
  }

  /**
   * Cancel a payment
   */
  static async cancelPayment(paymentIntentId: string): Promise<boolean> {
    // In a real implementation, this would call the backend to cancel a payment
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // Simulate cancellation
    return Math.random() > 0.2 // 80% success rate
  }
}