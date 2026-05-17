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
 * ZaloPayGateway - Cổng thanh toán ZaloPay (Zion).
 *
 * Quy ước ZaloPay:
 *  - app_id + key1 dùng cho sign request, key2 dùng cho verify callback.
 *  - Sign HMAC-SHA256 trên chuỗi: app_id|app_trans_id|app_user|amount|app_time|embed_data|item
 *  - Callback (IPN) ZaloPay POST JSON body với field `data` và `mac` - mac
 *    = HMAC-SHA256(key2, data).
 */
export class ZaloPayGateway extends BasePaymentGateway {
  readonly provider: PaymentProvider = "zalopay";

  private get config() {
    return {
      appId: this.assertEnv("ZALOPAY_APP_ID"),
      key1: this.assertEnv("ZALOPAY_KEY1"),
      key2: this.assertEnv("ZALOPAY_KEY2"),
      apiUrl: this.assertEnv("ZALOPAY_API_URL"),
    };
  }

  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentOutput> {
    this.validatePositiveAmount(input.amount);
    const cfg = this.config;

    const appTime = Date.now();
    // ZaloPay yêu cầu app_trans_id có format yyMMdd_XXXXX
    const dateStr = new Date(appTime).toISOString().slice(2, 10).replace(/-/g, "");
    const appTransId = `${dateStr}_${input.transactionId.slice(-10)}`;

    const embedData = JSON.stringify({
      redirecturl: input.returnUrl,
      ...(input.metadata ?? {}),
    });
    const items = "[]";

    const rawSignature = `${cfg.appId}|${appTransId}|user|${Math.round(input.amount)}|${appTime}|${embedData}|${items}`;
    const mac = this.hmacSha256(cfg.key1, rawSignature);

    const payload = {
      app_id: Number(cfg.appId),
      app_trans_id: appTransId,
      app_user: "user",
      app_time: appTime,
      amount: Math.round(input.amount),
      item: items,
      embed_data: embedData,
      description: input.description,
      bank_code: "",
      callback_url: input.ipnUrl,
      mac,
    };

    const res = await this.withRetry(() =>
      axios.post(cfg.apiUrl, payload, {
        timeout: 10000,
        headers: { "Content-Type": "application/json" },
      })
    );

    this.providerLogger.info(
      { transactionId: input.transactionId, returnCode: res.data?.return_code },
      "Tạo giao dịch ZaloPay"
    );

    if (res.data?.return_code !== 1) {
      throw new Error(`ZaloPay từ chối tạo giao dịch: ${res.data?.return_message ?? "unknown"}`);
    }

    return {
      paymentUrl: res.data.order_url,
      paymentToken: res.data.zp_trans_token,
      providerTxId: appTransId,
      expiresAt: new Date(appTime + 15 * 60 * 1000),
      raw: res.data,
    };
  }

  async verifyWebhook(input: VerifyWebhookInput): Promise<VerifyWebhookOutput> {
    const body = input.body as { data?: string; mac?: string };
    const cfg = this.config;

    if (!body.data || !body.mac) {
      return {
        valid: false,
        status: "failed",
        errorCode: "MISSING_FIELDS",
        errorMessage: "ZaloPay callback thiếu data hoặc mac",
        rawPayload: body as Record<string, unknown>,
      };
    }

    const expectedMac = this.hmacSha256(cfg.key2, body.data);
    if (!this.timingSafeEqual(body.mac, expectedMac)) {
      this.providerLogger.warn(
        { received: body.mac, expected: expectedMac },
        "ZaloPay MAC mismatch"
      );
      return {
        valid: false,
        status: "failed",
        errorCode: "INVALID_SIGNATURE",
        errorMessage: "ZaloPay MAC mismatch",
        rawPayload: body as Record<string, unknown>,
      };
    }

    let parsed: Record<string, unknown> = {};
    try {
      parsed = JSON.parse(body.data);
    } catch (err) {
      return {
        valid: false,
        status: "failed",
        errorCode: "INVALID_JSON",
        errorMessage: `ZaloPay data không phải JSON: ${(err as Error).message}`,
        rawPayload: body as Record<string, unknown>,
      };
    }

    // ZaloPay callback đến IPN chỉ khi giao dịch thành công (return_code = 1)
    const status: NormalizedPaymentStatus = "succeeded";

    return {
      valid: true,
      providerTxId: String(parsed["app_trans_id"] ?? ""),
      orderId: String(parsed["app_trans_id"] ?? "").split("_")[1] ?? "",
      amount: Number(parsed["amount"] ?? 0),
      status,
      rawPayload: parsed,
    };
  }

  async queryStatus(providerTxId: string): Promise<QueryStatusOutput> {
    const cfg = this.config;
    const rawSignature = `${cfg.appId}|${providerTxId}|${cfg.key1}`;
    const mac = this.hmacSha256(cfg.key1, rawSignature);

    const queryUrl = cfg.apiUrl.replace("/create", "/query");
    const res = await axios.post(queryUrl, {
      app_id: Number(cfg.appId),
      app_trans_id: providerTxId,
      mac,
    });

    const status: NormalizedPaymentStatus =
      res.data?.return_code === 1 ? "succeeded" :
      res.data?.return_code === 3 ? "pending" : "failed";

    return {
      providerTxId,
      status,
      amount: Number(res.data?.amount ?? 0),
      raw: res.data,
    };
  }

  async refund(input: RefundInput): Promise<RefundOutput> {
    const cfg = this.config;
    const timestamp = Date.now();
    const uid = `${timestamp}${Math.floor(Math.random() * 1000)}`;
    const mRefundId = `${new Date().toISOString().slice(2, 10).replace(/-/g, "")}_${cfg.appId}_${uid}`;

    const rawSignature = `${cfg.appId}|${input.providerTxId}|${Math.round(input.amount)}|${input.reason}|${timestamp}`;
    const mac = this.hmacSha256(cfg.key1, rawSignature);

    const refundUrl = cfg.apiUrl.replace("/create", "/refund");
    const res = await axios.post(refundUrl, {
      app_id: Number(cfg.appId),
      m_refund_id: mRefundId,
      zp_trans_id: input.providerTxId,
      amount: Math.round(input.amount),
      timestamp,
      description: input.reason,
      mac,
    });

    return {
      refundId: mRefundId,
      status: res.data?.return_code === 1 ? "refunded" : "failed",
      refundedAmount: input.amount,
      raw: res.data,
    };
  }
}
