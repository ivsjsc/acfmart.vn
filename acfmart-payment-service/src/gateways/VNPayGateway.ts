import { BasePaymentGateway } from "./BasePaymentGateway";
import {
  CreatePaymentInput,
  CreatePaymentOutput,
  NormalizedPaymentStatus,
  PaymentProvider,
  QueryStatusOutput,
  RefundInput,
  RefundOutput,
  VerifyWebhookInput,
  VerifyWebhookOutput,
} from "./IPaymentGateway";

/**
 * VNPayGateway - Triển khai cổng thanh toán VNPay (cổng ngân hàng VN phổ biến nhất).
 *
 * Quy ước VNPay:
 *  - Amount nhân 100 (VND không có thập phân, VNPay yêu cầu nhân 100).
 *  - Chữ ký HMAC-SHA512 trên query đã sort ASC, KHÔNG bao gồm vnp_SecureHash.
 *  - Mã trạng thái "00" = thành công, các mã khác đều fail.
 *  - Webhook (IPN) trả về 200 với body `{ RspCode, Message }` để VNPay không
 *    retry; nếu trả 5xx VNPay sẽ retry tới 5 lần.
 */
export class VNPayGateway extends BasePaymentGateway {
  readonly provider: PaymentProvider = "vnpay";

  private get config() {
    const isProd = process.env.NODE_ENV === "production";
    return {
      tmnCode: isProd
        ? this.assertEnv("VNPAY_TMNCODE_PROD")
        : this.assertEnv("VNPAY_TMNCODE"),
      hashSecret: isProd
        ? this.assertEnv("VNPAY_HASHSECRET_PROD")
        : this.assertEnv("VNPAY_HASHSECRET"),
      apiUrl: isProd
        ? this.assertEnv("VNPAY_API_URL_PROD")
        : this.assertEnv("VNPAY_API_URL"),
    };
  }

  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentOutput> {
    this.validatePositiveAmount(input.amount);
    const cfg = this.config;

    const createDate = this.formatVnpDate(new Date());
    const expireDate = this.formatVnpDate(new Date(Date.now() + 15 * 60 * 1000));

    // Amount nhân 100 theo quy ước VNPay (VND không thập phân)
    const params: Record<string, string> = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode: cfg.tmnCode,
      vnp_Amount: String(Math.round(input.amount * 100)),
      vnp_CurrCode: input.currency,
      vnp_TxnRef: input.transactionId,
      vnp_OrderInfo: input.description.slice(0, 255),
      vnp_OrderType: "other",
      vnp_Locale: "vn",
      vnp_ReturnUrl: input.returnUrl,
      vnp_IpAddr: input.clientIp ?? "127.0.0.1",
      vnp_CreateDate: createDate,
      vnp_ExpireDate: expireDate,
    };

    const sortedQuery = this.buildSortedQuery(params);
    const secureHash = this.hmacSha512(cfg.hashSecret, sortedQuery);
    const paymentUrl = `${cfg.apiUrl}?${sortedQuery}&vnp_SecureHash=${secureHash}`;

    this.providerLogger.info(
      { transactionId: input.transactionId, amount: input.amount },
      "Tạo URL thanh toán VNPay"
    );

    return {
      paymentUrl,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      raw: { sortedQuery, secureHash },
    };
  }

  async verifyWebhook(input: VerifyWebhookInput): Promise<VerifyWebhookOutput> {
    // VNPay gửi IPN qua GET query, nhưng cũng có thể qua POST body
    const data = (input.query ?? input.body) as Record<string, string>;
    const cfg = this.config;

    const receivedHash = data["vnp_SecureHash"] || "";
    const params: Record<string, string> = {};
    for (const k of Object.keys(data)) {
      if (k !== "vnp_SecureHash" && k !== "vnp_SecureHashType") {
        params[k] = String(data[k]);
      }
    }
    const sortedQuery = this.buildSortedQuery(params);
    const expectedHash = this.hmacSha512(cfg.hashSecret, sortedQuery);

    const valid = this.timingSafeEqual(receivedHash.toLowerCase(), expectedHash);
    if (!valid) {
      this.providerLogger.warn(
        { received: receivedHash, expected: expectedHash },
        "VNPay signature mismatch"
      );
      return {
        valid: false,
        status: "failed",
        errorCode: "INVALID_SIGNATURE",
        errorMessage: "VNPay signature mismatch",
        rawPayload: data,
      };
    }

    const status = this.mapStatus(data["vnp_ResponseCode"], data["vnp_TransactionStatus"]);

    return {
      valid: true,
      providerTxId: data["vnp_TransactionNo"],
      orderId: data["vnp_TxnRef"],
      amount: Math.round(Number(data["vnp_Amount"]) / 100), // chia 100 ngược lại
      status,
      errorCode: status === "succeeded" ? undefined : data["vnp_ResponseCode"],
      rawPayload: data,
    };
  }

  async queryStatus(providerTxId: string): Promise<QueryStatusOutput> {
    // VNPay có endpoint /merchant_webapi/api/transaction nhưng cần thêm gói
    // hợp đồng đặc thù. Tạm thời chưa support, trả pending để reconciliation
    // job đợi đến khi có webhook chính thức.
    this.providerLogger.info({ providerTxId }, "queryStatus stub - chờ VNPay enable API");
    return {
      providerTxId,
      status: "pending",
      amount: 0,
    };
  }

  async refund(input: RefundInput): Promise<RefundOutput> {
    // VNPay refund qua endpoint /merchant_webapi/api/transaction (POST)
    // với command "refund". Implementation đầy đủ phụ thuộc gói hợp đồng.
    // Chỗ này ghi lại intent + trả pending; team finance sẽ refund thủ công
    // qua merchant portal cho đến khi API được enable.
    this.providerLogger.warn(
      { transactionId: input.transactionId, amount: input.amount },
      "VNPay refund cần xử lý thủ công qua merchant portal"
    );
    return {
      refundId: `vnpay_refund_pending_${input.transactionId}`,
      status: "pending",
      refundedAmount: input.amount,
    };
  }

  // ─── Helpers riêng VNPay ─────────────────────────────────────────────

  private formatVnpDate(d: Date): string {
    // Định dạng yyyyMMddHHmmss theo timezone Asia/Ho_Chi_Minh
    const tz = new Date(d.getTime() + 7 * 60 * 60 * 1000); // UTC+7
    const pad = (n: number) => String(n).padStart(2, "0");
    return (
      `${tz.getUTCFullYear()}` +
      `${pad(tz.getUTCMonth() + 1)}` +
      `${pad(tz.getUTCDate())}` +
      `${pad(tz.getUTCHours())}` +
      `${pad(tz.getUTCMinutes())}` +
      `${pad(tz.getUTCSeconds())}`
    );
  }

  private mapStatus(responseCode?: string, transactionStatus?: string): NormalizedPaymentStatus {
    // VNPay quy ước: "00" = thành công, các code khác = lỗi cụ thể
    if (responseCode === "00" && (transactionStatus === "00" || !transactionStatus)) {
      return "succeeded";
    }
    if (responseCode === "24") return "cancelled"; // khách huỷ
    if (responseCode === "11") return "expired"; // hết thời gian
    return "failed";
  }
}
