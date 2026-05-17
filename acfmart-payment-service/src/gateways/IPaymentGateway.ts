/**
 * IPaymentGateway - Hợp đồng chuẩn (contract) cho mọi cổng thanh toán.
 *
 * Mọi cổng thanh toán (VNPay, MoMo, ZaloPay, Stripe, PayPal…) đều phải
 * triển khai đầy đủ interface này. Nhờ vậy core business logic chỉ phụ thuộc
 * vào abstraction, không phụ thuộc vào implementation cụ thể (Dependency
 * Inversion Principle). Khi cần thêm cổng mới, chỉ cần tạo class mới
 * implements IPaymentGateway và đăng ký vào PaymentGatewayFactory.
 */

export type PaymentProvider =
  | "vnpay"
  | "momo"
  | "zalopay"
  | "stripe"
  | "paypal"
  | "cod";

export type Currency = "VND" | "USD" | "EUR";

export interface CreatePaymentInput {
  transactionId: string;
  orderId: string;
  amount: number;
  currency: Currency;
  description: string;
  buyerEmail?: string;
  buyerPhone?: string;
  buyerName?: string;
  returnUrl: string;
  ipnUrl: string;
  clientIp?: string;
  metadata?: Record<string, unknown>;
}

export interface CreatePaymentOutput {
  paymentUrl?: string;
  paymentToken?: string;
  qrCode?: string;
  providerTxId?: string;
  expiresAt?: Date;
  raw?: Record<string, unknown>;
}

export interface VerifyWebhookInput {
  rawBody: string | Buffer;
  headers: Record<string, string | string[] | undefined>;
  body: Record<string, unknown>;
  query?: Record<string, unknown>;
}

export interface VerifyWebhookOutput {
  valid: boolean;
  providerTxId?: string;
  orderId?: string;
  amount?: number;
  status: NormalizedPaymentStatus;
  errorCode?: string;
  errorMessage?: string;
  rawPayload: Record<string, unknown>;
}

export type NormalizedPaymentStatus =
  | "pending"
  | "succeeded"
  | "failed"
  | "cancelled"
  | "refunded"
  | "expired";

export interface RefundInput {
  transactionId: string;
  providerTxId: string;
  amount: number;
  currency: Currency;
  reason: string;
}

export interface RefundOutput {
  refundId: string;
  status: NormalizedPaymentStatus;
  refundedAmount: number;
  raw?: Record<string, unknown>;
}

export interface QueryStatusOutput {
  providerTxId: string;
  status: NormalizedPaymentStatus;
  amount: number;
  paidAt?: Date;
  raw?: Record<string, unknown>;
}

export interface IPaymentGateway {
  /** Định danh provider - dùng để Factory phân giải */
  readonly provider: PaymentProvider;

  /** Khởi tạo giao dịch và trả về URL/token thanh toán */
  createPayment(input: CreatePaymentInput): Promise<CreatePaymentOutput>;

  /** Xác thực chữ ký webhook và chuẩn hoá payload */
  verifyWebhook(input: VerifyWebhookInput): Promise<VerifyWebhookOutput>;

  /** Truy vấn trạng thái giao dịch từ provider (dùng cho reconciliation) */
  queryStatus(providerTxId: string): Promise<QueryStatusOutput>;

  /** Hoàn tiền - một số provider chỉ cho refund trong khoảng thời gian nhất định */
  refund(input: RefundInput): Promise<RefundOutput>;
}
