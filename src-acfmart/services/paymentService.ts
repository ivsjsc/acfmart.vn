// Payment Service - Tích hợp các cổng thanh toán
export interface PaymentMethod {
  id: string;
  name: string;
  type: 'bank' | 'card' | 'ewallet' | 'installment';
  logo: string;
  isActive: boolean;
  config: PaymentConfig;
}

export interface PaymentConfig {
  merchantId: string;
  merchantKey: string;
  endpoint: string;
  returnUrl: string;
  notifyUrl: string;
  fee: number; // percentage
  dailyLimit: number;
  minAmount: number;
  maxAmount: number;
}

export interface PaymentRequest {
  orderId: string;
  amount: number;
  currency: string;
  description: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    billingAddress?: any;
  };
  paymentMethod: string;
  returnUrl?: string;
  notifyUrl?: string;
}

export interface PaymentResponse {
  success: boolean;
  paymentUrl?: string;
  transactionId?: string;
  qrCode?: string;
  error?: string;
  errorCode?: string;
}

export interface Transaction {
  id: string;
  orderId: string;
  paymentMethod: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'success' | 'failed' | 'cancelled' | 'refunded';
  transactionId: string;
  gatewayTransactionId?: string;
  createdAt: string;
  updatedAt: string;
  fee: number;
  netAmount: number;
  refundAmount?: number;
  metadata?: any;
}

export interface RefundRequest {
  transactionId: string;
  amount: number;
  reason: string;
  refundType: 'full' | 'partial';
}

export interface RefundResponse {
  success: boolean;
  refundId?: string;
  error?: string;
}

export interface EscrowTransaction {
  id: string;
  orderId: string;
  buyerId: string;
  sellerId: string;
  amount: number;
  status: 'pending' | 'held' | 'released' | 'refunded' | 'disputed';
  heldUntil: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface WalletBalance {
  userId: string;
  balance: number;
  currency: string;
  updatedAt: Date;
}

export interface WalletTransaction {
  id: string;
  userId: string;
  type: 'deposit' | 'withdrawal' | 'escrow_hold' | 'escrow_release' | 'refund';
  amount: number;
  balanceAfter: number;
  relatedOrderId?: string;
  description: string;
  createdAt: Date;
}

export class PaymentService {
  private readonly API_ENDPOINTS = {
    VNPAY: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
    MOMO: 'https://test-payment.momo.vn/gw_payment/transactionProcessor',
    VCB: 'https://sandbox.vcb.com/api/payment',
    ZALOPAY: 'https://sb-openapi.zalopay.vn/v2/query'
  };

  private readonly API_CONFIGS = {
    VNPAY: {
      tmnCode: process.env.REACT_APP_VNPAY_TMN_CODE || '',
      secretKey: process.env.REACT_APP_VNPAY_SECRET_KEY || '',
      paymentUrl: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
      queryUrl: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html'
    },
    MOMO: {
      partnerCode: process.env.REACT_APP_MOMO_PARTNER_CODE || '',
      accessKey: process.env.REACT_APP_MOMO_ACCESS_KEY || '',
      secretKey: process.env.REACT_APP_MOMO_SECRET_KEY || '',
      paymentUrl: 'https://test-payment.momo.vn/gw_payment/transactionProcessor'
    },
    ZALOPAY: {
      appId: process.env.REACT_APP_ZALOPAY_APP_ID || '',
      key1: process.env.REACT_APP_ZALOPAY_KEY1 || '',
      key2: process.env.REACT_APP_ZALOPAY_KEY2 || '',
      paymentUrl: 'https://sb-openapi.zalopay.vn/v2/create'
    }
  };

  // Lấy danh sách phương thức thanh toán
  getPaymentMethods(): PaymentMethod[] {
    return [
      {
        id: 'vnpay',
        name: 'VNPAY',
        type: 'ewallet',
        logo: '/logos/vnpay.png',
        isActive: true,
        config: {
          merchantId: 'ACF_VNPAY_001',
          merchantKey: 'vnpay_secret_key',
          endpoint: this.API_ENDPOINTS.VNPAY,
          returnUrl: `${window.location.origin}/payment/vnpay/return`,
          notifyUrl: `${window.location.origin}/api/payment/vnpay/notify`,
          fee: 2.3,
          dailyLimit: 50000000,
          minAmount: 10000,
          maxAmount: 100000000
        }
      },
      {
        id: 'momo',
        name: 'MoMo',
        type: 'ewallet',
        logo: '/logos/momo.png',
        isActive: true,
        config: {
          merchantId: 'ACF_MOMO_001',
          merchantKey: 'momo_secret_key',
          endpoint: this.API_ENDPOINTS.MOMO,
          returnUrl: `${window.location.origin}/payment/momo/return`,
          notifyUrl: `${window.location.origin}/api/payment/momo/notify`,
          fee: 1.8,
          dailyLimit: 30000000,
          minAmount: 10000,
          maxAmount: 50000000
        }
      },
      {
        id: 'zalopay',
        name: 'ZaloPay',
        type: 'ewallet',
        logo: '/logos/zalopay.png',
        isActive: true,
        config: {
          merchantId: 'ACF_ZALOPAY_001',
          merchantKey: 'zalopay_secret_key',
          endpoint: this.API_ENDPOINTS.ZALOPAY,
          returnUrl: `${window.location.origin}/payment/zalopay/return`,
          notifyUrl: `${window.location.origin}/api/payment/zalopay/notify`,
          fee: 2.0,
          dailyLimit: 40000000,
          minAmount: 10000,
          maxAmount: 50000000
        }
      },
      {
        id: 'vcb',
        name: 'Vietcombank',
        type: 'bank',
        logo: '/logos/vcb.png',
        isActive: true,
        config: {
          merchantId: 'ACF_VCB_001',
          merchantKey: 'vcb_secret_key',
          endpoint: this.API_ENDPOINTS.VCB,
          returnUrl: `${window.location.origin}/payment/vcb/return`,
          notifyUrl: `${window.location.origin}/api/payment/vcb/notify`,
          fee: 0.5,
          dailyLimit: 100000000,
          minAmount: 50000,
          maxAmount: 500000000
        }
      },
      {
        id: 'tcb',
        name: 'Techcombank',
        type: 'bank',
        logo: '/logos/tcb.png',
        isActive: false,
        config: {
          merchantId: 'ACF_TCB_001',
          merchantKey: 'tcb_secret_key',
          endpoint: 'https://api.techcombank.com/payment',
          returnUrl: `${window.location.origin}/payment/tcb/return`,
          notifyUrl: `${window.location.origin}/api/payment/tcb/notify`,
          fee: 0.8,
          dailyLimit: 80000000,
          minAmount: 50000,
          maxAmount: 300000000
        }
      },
      {
        id: 'installment',
        name: 'Trả góp',
        type: 'installment',
        logo: '/logos/installment.png',
        isActive: true,
        config: {
          merchantId: 'ACF_INSTALLMENT_001',
          merchantKey: 'installment_secret_key',
          endpoint: 'https://api.installment.vn/payment',
          returnUrl: `${window.location.origin}/payment/installment/return`,
          notifyUrl: `${window.location.origin}/api/payment/installment/notify`,
          fee: 3.5,
          dailyLimit: 20000000,
          minAmount: 1000000,
          maxAmount: 50000000
        }
      }
    ];
  }

  // Tạo thanh toán VNPAY
  async createVNPAYPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      const config = this.API_CONFIGS.VNPAY;
      const date = new Date();
      const createDate = date.toISOString().slice(0, 19).replace(/[-:T]/g, '');
      const orderId = request.orderId + createDate;
      const amount = request.amount;
      const orderInfo = request.description;
      const bankCode = '';
      const locale = 'vn';
      const currCode = 'VND';
      const vnp_Version = '2.1.0';
      const vnp_Command = 'pay';
      const vnp_TmnCode = config.tmnCode;
      const vnp_ReturnUrl = request.returnUrl || config.paymentUrl;
      const vnp_IpAddr = '127.0.0.1';
      const vnp_SecureHashType = 'HMACSHA512';

      // Build query string
      const queryParams = {
        vnp_Version,
        vnp_Command,
        vnp_TmnCode,
        vnp_Locale: locale,
        vnp_CurrCode: currCode,
        vnp_TxnRef: orderId,
        vnp_OrderInfo: orderInfo,
        vnp_OrderType: 'billpayment',
        vnp_Amount: amount * 100, // VNPAY requires amount in cents
        vnp_ReturnUrl: vnp_ReturnUrl,
        vnp_IpAddr,
        vnp_CreateDate: createDate
      };

      if (bankCode) {
        (queryParams as any).vnp_BankCode = bankCode;
      }

      // Sort parameters
      const sortedParams = Object.keys(queryParams)
        .sort()
        .reduce((result: any, key) => {
          result[key] = queryParams[key as keyof typeof queryParams];
          return result;
        }, {});

      // Create query string
      const queryString = Object.keys(sortedParams)
        .map(key => `${key}=${encodeURIComponent(sortedParams[key])}`)
        .join('&');

      // Generate secure hash
      const secureHash = this.generateHMACSHA512(queryString, config.secretKey);

      const paymentUrl = `${config.paymentUrl}?${queryString}&vnp_SecureHash=${secureHash}`;

      return {
        success: true,
        paymentUrl,
        transactionId: orderId
      };
    } catch (error) {
      console.error('Error creating VNPAY payment:', error);
      return {
        success: false,
        error: 'Không thể tạo thanh toán VNPAY'
      };
    }
  }

  // Tạo thanh toán MoMo
  async createMoMoPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      const config = this.API_CONFIGS.MOMO;
      const orderId = request.orderId;
      const requestId = Date.now().toString();
      const orderInfo = request.description;
      const amount = request.amount;
      const extraData = '';

      // Build request data
      const requestData = {
        partnerCode: config.partnerCode,
        accessKey: config.accessKey,
        requestId,
        amount,
        orderId,
        orderInfo,
        returnUrl: request.returnUrl || `${window.location.origin}/payment/momo/return`,
        notifyUrl: request.notifyUrl || `${window.location.origin}/api/payment/momo/notify`,
        extraData,
        requestType: 'captureWallet'
      };

      // Generate signature
      const rawSignature = `accessKey=${config.accessKey}&amount=${amount}&extraData=${extraData}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${config.partnerCode}&requestId=${requestId}&requestType=captureWallet&returnUrl=${requestData.returnUrl}`;
      const signature = this.generateHMACSHA256(rawSignature, config.secretKey);

      const finalRequest = {
        ...requestData,
        signature
      };

      return {
        success: true,
        paymentUrl: 'https://test-payment.momo.vn/gw_payment/transactionProcessor',
        transactionId: requestId
      };
    } catch (error) {
      console.error('Error creating MoMo payment:', error);
      return {
        success: false,
        error: 'Không thể tạo thanh toán MoMo'
      };
    }
  }

  // Tạo thanh toán ZaloPay
  async createZaloPayPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      const config = this.API_CONFIGS.ZALOPAY;
      const appid = config.appId;
      const apptransid = `${Date.now()}_${request.orderId}`;
      const appuser = request.customerInfo.phone;
      const apptime = Date.now();
      const amount = request.amount;
      const appdescription = request.description;
      const embeddata = JSON.stringify({});
      const item = JSON.stringify([]);

      // Build data for signature
      const data = `${appid}|${apptransid}|${appuser}|${amount}|${apptime}|${embeddata}|${item}`;
      const mac = this.generateHMACSHA256(data, config.key1);

      const requestData = {
        appid,
        appuser,
        apptime,
        amount,
        appdescription,
        item,
        embeddata,
        mac,
        apptransid
      };

      return {
        success: true,
        paymentUrl: 'https://sb-openapi.zalopay.vn/v2/create',
        transactionId: apptransid
      };
    } catch (error) {
      console.error('Error creating ZaloPay payment:', error);
      return {
        success: false,
        error: 'Không thể tạo thanh toán ZaloPay'
      };
    }
  }

  // Tạo QR code thanh toán
  async generateQRCode(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      const qrData = JSON.stringify({
        orderId: request.orderId,
        amount: request.amount,
        merchant: 'ACF Mall',
        timestamp: Date.now()
      });

      const qrCode = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==`;

      return {
        success: true,
        qrCode
      };
    } catch (error) {
      console.error('Error generating QR code:', error);
      return {
        success: false,
        error: 'Không thể tạo mã QR'
      };
    }
  }

  // Kiểm tra trạng thái thanh toán
  async checkPaymentStatus(paymentMethod: string, transactionId: string): Promise<Transaction> {
    try {
      return {
        id: '',
        orderId: transactionId,
        paymentMethod: paymentMethod,
        amount: 0,
        currency: 'VND',
        status: 'pending',
        transactionId: '',
        gatewayTransactionId: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        fee: 0,
        netAmount: 0
      };
    } catch (error) {
      console.error('Error checking payment status:', error);
      throw error;
    }
  }

  // Hoàn tiền
  async refundPayment(request: RefundRequest): Promise<RefundResponse> {
    try {
      return {
        refundId: '',
        success: false,
        error: 'Refund functionality not implemented'
      };
    } catch (error) {
      console.error('Error processing refund:', error);
      return {
        success: false,
        error: 'Không thể hoàn tiền'
      };
    }
  }

  // Lấy lịch sử giao dịch
  async getTransactionHistory(filters: {
    startDate?: string;
    endDate?: string;
    paymentMethod?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ transactions: Transaction[]; total: number }> {
    try {
      const transactions: Transaction[] = [];

      return {
        transactions,
        total: 0
      };
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      throw error;
    }
  }

  // Utility functions
  private generateHMACSHA512(data: string, key: string): string {
    // Real HMAC SHA512 generation
    // Trong thực tế sẽ sử dụng crypto library
    return '';
  }

  private generateHMACSHA256(data: string, key: string): string {
    // Real HMAC SHA256 generation
    // Trong thực tế sẽ sử dụng crypto library
    return '';
  }

  // Tạo giao dịch Escrow mới cho đơn hàng
  async createEscrowTransaction(
    orderId: string,
    buyerId: string,
    sellerId: string,
    amount: number,
    paymentMethodId: string
  ): Promise<EscrowTransaction> {
    // Trong ứng dụng thực tế, sẽ gọi tới API xử lý thanh toán
    // và giữ tiền trong tài khoản escrow cho đến khi xác nhận giao hàng
    
    const transaction: EscrowTransaction = {
      id: `escrow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      orderId,
      buyerId,
      sellerId,
      amount,
      status: 'held',
      heldUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Giữ tiền 7 ngày
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Cập nhật trạng thái đơn hàng
    console.log(`Created escrow transaction for order ${orderId}`);
    
    return transaction;
  }

  // Giải phóng tiền từ escrow cho người bán
  async releaseEscrow(orderId: string): Promise<EscrowTransaction> {
    // Trong ứng dụng thực tế, sẽ cập nhật trạng thái trong DB
    console.log(`Releasing escrow funds for order ${orderId}`);
    
    const transaction: EscrowTransaction = {
      id: `escrow_${orderId}`,
      orderId,
      buyerId: '', // cần lấy từ DB trong thực tế
      sellerId: '', // cần lấy từ DB trong thực tế
      amount: 0, // cần lấy từ DB trong thực tế
      status: 'released',
      heldUntil: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    return transaction;
  }

  // Hoàn tiền từ escrow cho người mua
  async refundEscrow(orderId: string, reason?: string): Promise<EscrowTransaction> {
    // Trong ứng dụng thực tế, sẽ cập nhật trạng thái trong DB
    console.log(`Refunding escrow funds for order ${orderId}. Reason: ${reason}`);
    
    const transaction: EscrowTransaction = {
      id: `escrow_${orderId}`,
      orderId,
      buyerId: '', // cần lấy từ DB trong thực tế
      sellerId: '', // cần lấy từ DB trong thực tế
      amount: 0, // cần lấy từ DB trong thực tế
      status: 'refunded',
      heldUntil: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    return transaction;
  }

  // Lấy số dư ví của người dùng
  async getUserWalletBalance(userId: string): Promise<WalletBalance> {
    // Trong ứng dụng thực tế, sẽ lấy từ DB
    const balance: WalletBalance = {
      userId,
      balance: 1500000, // số tiền mẫu
      currency: 'VND',
      updatedAt: new Date()
    };
    
    return balance;
  }

  // Nạp tiền vào ví
  async depositToWallet(userId: string, amount: number, paymentMethod: PaymentMethod): Promise<WalletTransaction> {
    // Trong ứng dụng thực tế, sẽ xử lý thanh toán và cập nhật DB
    console.log(`Depositing ${amount} VND to wallet for user ${userId}`);
    
    const transaction: WalletTransaction = {
      id: `deposit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type: 'deposit',
      amount,
      balanceAfter: 0, // sẽ được cập nhật sau khi xử lý
      description: `Nạp tiền từ ${paymentMethod.type} - ${paymentMethod.name}`,
      createdAt: new Date()
    };
    
    return transaction;
  }

  // Rút tiền từ ví
  async withdrawFromWallet(userId: string, amount: number, bankAccountId: string): Promise<WalletTransaction> {
    // Trong ứng dụng thực tế, sẽ xử lý và cập nhật DB
    console.log(`Withdrawing ${amount} VND from wallet for user ${userId}`);
    
    const transaction: WalletTransaction = {
      id: `withdraw_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type: 'withdrawal',
      amount,
      balanceAfter: 0, // sẽ được cập nhật sau khi xử lý
      description: 'Rút tiền về tài khoản ngân hàng',
      createdAt: new Date()
    };
    
    return transaction;
  }

  // Validate payment request
  validatePaymentRequest(request: PaymentRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!request.orderId) {
      errors.push('Mã đơn hàng là bắt buộc');
    }

    if (!request.amount || request.amount <= 0) {
      errors.push('Số tiền phải lớn hơn 0');
    }

    if (!request.paymentMethod) {
      errors.push('Phương thức thanh toán là bắt buộc');
    }

    if (!request.customerInfo.name || !request.customerInfo.phone) {
      errors.push('Thông tin khách hàng không đầy đủ');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Calculate payment fee
  calculatePaymentFee(amount: number, paymentMethod: string): number {
    const methods = this.getPaymentMethods();
    const method = methods.find(m => m.id === paymentMethod);
    
    if (!method) return 0;
    
    return Math.round(amount * (method.config.fee / 100));
  }
}

export const paymentService = new PaymentService();
