import axios from "axios";
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
 * MoMoGateway - Triển khai cổng thanh toán MoMo (e-wallet phổ biến VN).
 *
 * Quy ước MoMo:
 *  - Amount giữ nguyên đơn vị VND (không nhân 100 như VNPay).
 *  - Chữ ký HMAC-SHA256 trên raw signature string (KHÔNG sort, MoMo cố định thứ tự).
 *  - resultCode 0 = thành công, 9000 = chờ approve, các mã khác = lỗi.
 */
export class MoMoGateway extends BasePaymentGateway {
  readonly provider: PaymentProvider = "momo";

  private get config() {
    const isProd = process.env.NODE_ENV === "production";
    return {
      partnerCode: isProd
        ? this.assertEnv("MOMO_PARTNER_CODE_PROD")
        : this.assertEnv("MOMO_PARTNER_CODE"),
      accessKey: isProd
        ? this.assertEnv("MOMO_ACCESS_KEY_PROD")
        : this.assertEnv("MOMO_ACCESS_KEY"),
      secretKey: isProd
        ? this.assertEnv("MOMO_SECRET_KEY_PROD")
        : this.assertEnv("MOMO_SECRET_KEY"),
      apiUrl: isProd
        ? this.assertEnv("MOMO_API_URL_PROD")
        : this.assertEnv("MOMO_API_URL"),
    };
  }

  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentOutput> {
    this.validatePositiveAmount(input.amount);
    const cfg = this.config;

    const requestId = `${input.transactionId}_${Date.now()}`;
    const extraData = Buffer.from(
      JSON.stringify(input.metadata ?? {}),
      "utf-8"
    ).toString("base64");

    // MoMo yêu cầu raw signature theo đúng thứ tự (KHÔNG sort)
    const rawSignature = [
      `accessKey=${cfg.accessKey}`,
      `amount=${Math.round(input.amount)}`,
      `extraData=${extraData}`,
      `ipnUrl=${input.ipnUrl}`,
      `orderId=${input.transactionId}`,
      `orderInfo=${input.description}`,
      `partnerCode=${cfg.partnerCode}`,
      `redirectUrl=${input.returnUrl}`,
      `requestId=${requestId}`,
      `requestType=payWithMethod`,
    ].join("&");

    const signature = this.hmacSha256(cfg.secretKey, rawSignature);

    const payload = {
      partnerCode: cfg.partnerCode,
      partnerName: "ACFMart",
      storeId: "ACFMart Store",
      requestId,
      amount: Math.round(input.amount),
      orderId: input.transactionId,
      orderInfo: input.description,
      redirectUrl: input.returnUrl,
      ipnUrl: input.ipnUrl,
      lang: "vi",
      requestType: "payWithMethod",
      autoCapture: true,
      extraData,
      signature,
    };

    const res = await this.withRetry(() =>
      axios.post(cfg.apiUrl, payload, {
        timeout: 10000,
        headers: { "Content-Type": "application/json" },
      })
    );

    this.providerLogger.info(
      { transactionId: input.transactionId, resultCode: res.data?.resultCode },
      "Tạo giao dịch MoMo"
    );

    if (!res.data?.payUrl) {
      throw new Error(`MoMo API trả về thiếu payUrl: ${JSON.stringify(res.data)}`);
    }

    return {
      paymentUrl: res.data.payUrl,
      qrCode: res.data.qrCodeUrl,
      providerTxId: res.data.transId ? String(res.data.transId) : undefined,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      raw: res.data,
    };
  }

  async verifyWebhook(input: VerifyWebhookInput): Promise<VerifyWebhookOutput> {
    const data = input.body as Record<string, string | number>;
    const cfg = this.config;

    const receivedSignature = String(data["signature"] || "");
    // Raw signature cho IPN - thứ tự KHÔNG sort, theo đúng tài liệu MoMo
    const rawSignature = [
      `accessKey=${cfg.accessKey}`,
      `amount=${data["amount"]}`,
      `extraData=${data["extraData"]}`,
      `message=${data["message"]}`,
      `orderId=${data["orderId"]}`,
      `orderInfo=${data["orderInfo"]}`,
      `orderType=${data["orderType"]}`,
      `partnerCode=${data["partnerCode"]}`,
      `payType=${data["payType"]}`,
      `requestId=${data["requestId"]}`,
      `responseTime=${data["responseTime"]}`,
      `resultCode=${data["resultCode"]}`,
      `transId=${data["transId"]}`,
    ].join("&");

    const expectedSignature = this.hmacSha256(cfg.secretKey, rawSignature);
    const valid = this.timingSafeEqual(receivedSignature, expectedSignature);

    if (!valid) {
      this.providerLogger.warn(
        { received: receivedSignature, expected: expectedSignature },
        "MoMo signature mismatch"
      );
      return {
        valid: false,
        status: "failed",
        errorCode: "INVALID_SIGNATURE",
        errorMessage: "MoMo signature mismatch",
        rawPayload: data,
      };
    }

    const status = this.mapStatus(Number(data["resultCode"]));

    return {
      valid: true,
      providerTxId: String(data["transId"]),
      orderId: String(data["orderId"]),
      amount: Number(data["amount"]),
      status,
      errorCode: status === "succeeded" ? undefined : String(data["resultCode"]),
      errorMessage: status === "succeeded" ? undefined : String(data["message"] ?? ""),
      rawPayload: data,
    };
  }

  async queryStatus(providerTxId: string): Promise<QueryStatusOutput> {
    // MoMo có endpoint /v2/gateway/api/query - trả về trạng thái real-time.
    // Tạm thời chưa wire vì cần xác nhận response format chính xác từ MoMo.
    this.providerLogger.info({ providerTxId }, "MoMo queryStatus stub");
    return {
      providerTxId,
      status: "pending",
      amount: 0,
    };
  }

  async refund(input: RefundInput): Promise<RefundOutput> {
    const cfg = this.config;
    const requestId = `refund_${input.transactionId}_${Date.now()}`;

    const rawSignature = [
      `accessKey=${cfg.accessKey}`,
      `amount=${Math.round(input.amount)}`,
      `description=${input.reason}`,
      `orderId=${requestId}`,
      `partnerCode=${cfg.partnerCode}`,
      `requestId=${requestId}`,
      `transId=${input.providerTxId}`,
    ].join("&");

    const signature = this.hmacSha256(cfg.secretKey, rawSignature);

    const refundUrl = cfg.apiUrl.replace("/create", "/refund");
    const res = await axios.post(refundUrl, {
      partnerCode: cfg.partnerCode,
      orderId: requestId,
      requestId,
      amount: Math.round(input.amount),
      transId: Number(input.providerTxId),
      lang: "vi",
      description: input.reason,
      signature,
    });

    return {
      refundId: requestId,
      status: res.data?.resultCode === 0 ? "refunded" : "failed",
      refundedAmount: input.amount,
      raw: res.data,
    };
  }

  private mapStatus(resultCode: number): NormalizedPaymentStatus {
    if (resultCode === 0) return "succeeded";
    if (resultCode === 9000) return "pending"; // đang đợi user authorize
    if (resultCode === 1006) return "cancelled"; // user huỷ
    if (resultCode === 1005) return "expired"; // giao dịch hết hạn
    return "failed";
  }
}
