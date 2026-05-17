import axios from "axios";
import { BasePaymentGateway } from "./BasePaymentGateway";
import crypto from "crypto";
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
 * StripeGateway - Cổng quốc tế cho khách hàng quốc tế / thẻ Visa-Master.
 *
 * Implementation hiện tại gọi REST API trực tiếp (không phụ thuộc lib stripe-node)
 * để giảm bundle size cho microservice. Khi có hợp đồng chính thức + cần các
 * tính năng nâng cao (3DS, subscriptions...) thì swap sang lib `stripe` official.
 *
 * Stripe convention:
 *  - Amount là integer ở đơn vị nhỏ nhất (cents). VND = đơn vị, USD = cents.
 *  - Webhook ký HMAC-SHA256 với header `Stripe-Signature: t=<ts>,v1=<sig>`.
 */
export class StripeGateway extends BasePaymentGateway {
  readonly provider: PaymentProvider = "stripe";

  private readonly STRIPE_API = "https://api.stripe.com/v1";

  private get secretKey(): string {
    return this.assertEnv("STRIPE_SECRET_KEY");
  }

  private get webhookSecret(): string {
    return this.assertEnv("STRIPE_WEBHOOK_SECRET");
  }

  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentOutput> {
    this.validatePositiveAmount(input.amount);

    // VND không có thập phân nên truyền nguyên amount (Stripe chấp nhận VND
    // ở đơn vị đồng). USD/EUR cần nhân 100 (cents).
    const amountInUnits =
      input.currency === "VND" ? Math.round(input.amount) : Math.round(input.amount * 100);

    const form = new URLSearchParams();
    form.append("payment_method_types[]", "card");
    form.append("line_items[0][price_data][currency]", input.currency.toLowerCase());
    form.append("line_items[0][price_data][product_data][name]", input.description.slice(0, 250));
    form.append("line_items[0][price_data][unit_amount]", String(amountInUnits));
    form.append("line_items[0][quantity]", "1");
    form.append("mode", "payment");
    form.append("success_url", input.returnUrl);
    form.append("cancel_url", input.returnUrl);
    form.append("client_reference_id", input.transactionId);
    form.append("metadata[transactionId]", input.transactionId);
    form.append("metadata[orderId]", input.orderId);
    if (input.buyerEmail) form.append("customer_email", input.buyerEmail);

    const res = await this.withRetry(() =>
      axios.post(`${this.STRIPE_API}/checkout/sessions`, form, {
        timeout: 10000,
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      })
    );

    this.providerLogger.info(
      { transactionId: input.transactionId, sessionId: res.data?.id },
      "Tạo Stripe checkout session"
    );

    return {
      paymentUrl: res.data.url,
      providerTxId: res.data.id,
      expiresAt: res.data.expires_at ? new Date(res.data.expires_at * 1000) : undefined,
      raw: res.data,
    };
  }

  async verifyWebhook(input: VerifyWebhookInput): Promise<VerifyWebhookOutput> {
    const sigHeader = (input.headers["stripe-signature"] || input.headers["Stripe-Signature"]) as string;
    if (!sigHeader) {
      return {
        valid: false,
        status: "failed",
        errorCode: "MISSING_SIGNATURE",
        errorMessage: "Stripe-Signature header missing",
        rawPayload: input.body as Record<string, unknown>,
      };
    }

    // Parse `t=...,v1=...`
    const parts = sigHeader.split(",").reduce<Record<string, string>>((acc, p) => {
      const [k, v] = p.split("=");
      if (k && v) acc[k.trim()] = v.trim();
      return acc;
    }, {});

    const timestamp = parts["t"];
    const v1 = parts["v1"];
    if (!timestamp || !v1) {
      return {
        valid: false,
        status: "failed",
        errorCode: "MALFORMED_SIGNATURE",
        errorMessage: "Stripe-Signature parse error",
        rawPayload: input.body as Record<string, unknown>,
      };
    }

    // Replay protection: 5 phút
    const ageMs = Date.now() - Number(timestamp) * 1000;
    if (Math.abs(ageMs) > 5 * 60 * 1000) {
      return {
        valid: false,
        status: "failed",
        errorCode: "TIMESTAMP_TOO_OLD",
        errorMessage: `Stripe webhook age ${ageMs}ms vượt ngưỡng cho phép`,
        rawPayload: input.body as Record<string, unknown>,
      };
    }

    const rawBody = typeof input.rawBody === "string"
      ? input.rawBody
      : input.rawBody.toString("utf-8");

    const signedPayload = `${timestamp}.${rawBody}`;
    const expectedSig = crypto
      .createHmac("sha256", this.webhookSecret)
      .update(signedPayload, "utf-8")
      .digest("hex");

    if (!this.timingSafeEqual(v1, expectedSig)) {
      this.providerLogger.warn({ received: v1, expected: expectedSig }, "Stripe signature mismatch");
      return {
        valid: false,
        status: "failed",
        errorCode: "INVALID_SIGNATURE",
        errorMessage: "Stripe signature mismatch",
        rawPayload: input.body as Record<string, unknown>,
      };
    }

    const event = input.body as { type?: string; data?: { object?: Record<string, unknown> } };
    const obj = event.data?.object ?? {};
    const status = this.mapStripeEvent(event.type ?? "");

    return {
      valid: true,
      providerTxId: String(obj["id"] ?? ""),
      orderId: String(obj["client_reference_id"] ?? ""),
      amount: Number(obj["amount_total"] ?? 0),
      status,
      rawPayload: input.body as Record<string, unknown>,
    };
  }

  async queryStatus(providerTxId: string): Promise<QueryStatusOutput> {
    const res = await axios.get(`${this.STRIPE_API}/checkout/sessions/${providerTxId}`, {
      headers: { Authorization: `Bearer ${this.secretKey}` },
    });

    const status: NormalizedPaymentStatus =
      res.data?.payment_status === "paid" ? "succeeded" :
      res.data?.payment_status === "unpaid" ? "pending" : "failed";

    return {
      providerTxId,
      status,
      amount: Number(res.data?.amount_total ?? 0),
      raw: res.data,
    };
  }

  async refund(input: RefundInput): Promise<RefundOutput> {
    const form = new URLSearchParams();
    form.append("payment_intent", input.providerTxId);
    form.append("amount", String(Math.round(input.amount * (input.currency === "VND" ? 1 : 100))));
    form.append("reason", "requested_by_customer");
    form.append("metadata[transactionId]", input.transactionId);
    form.append("metadata[reason]", input.reason);

    const res = await axios.post(`${this.STRIPE_API}/refunds`, form, {
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    return {
      refundId: res.data?.id,
      status: res.data?.status === "succeeded" ? "refunded" : "pending",
      refundedAmount: input.amount,
      raw: res.data,
    };
  }

  private mapStripeEvent(eventType: string): NormalizedPaymentStatus {
    switch (eventType) {
      case "checkout.session.completed":
      case "payment_intent.succeeded":
        return "succeeded";
      case "checkout.session.expired":
        return "expired";
      case "payment_intent.payment_failed":
        return "failed";
      case "charge.refunded":
        return "refunded";
      default:
        return "pending";
    }
  }
}
