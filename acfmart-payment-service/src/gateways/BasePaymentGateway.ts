import crypto from "crypto";
import { logger } from "../utils/logger";
import {
  CreatePaymentInput,
  CreatePaymentOutput,
  IPaymentGateway,
  PaymentProvider,
  QueryStatusOutput,
  RefundInput,
  RefundOutput,
  VerifyWebhookInput,
  VerifyWebhookOutput,
} from "./IPaymentGateway";

/**
 * BasePaymentGateway - Abstract class chứa các helper dùng chung cho mọi cổng:
 *  - Logging có context provider
 *  - Helper HMAC SHA256/SHA512 + timing-safe compare
 *  - Helper sort & build query string (chuẩn VNPay/MoMo)
 *  - Validation cơ bản input
 *
 * Mỗi concrete gateway (VNPay/MoMo/...) chỉ cần override 4 method chính
 * (createPayment, verifyWebhook, queryStatus, refund) - phần utility cứ kế thừa
 * thẳng từ class này để giảm code duplication.
 */
export abstract class BasePaymentGateway implements IPaymentGateway {
  abstract readonly provider: PaymentProvider;

  protected log = logger;

  protected get providerLogger() {
    return this.log.child({ provider: this.provider });
  }

  abstract createPayment(input: CreatePaymentInput): Promise<CreatePaymentOutput>;
  abstract verifyWebhook(input: VerifyWebhookInput): Promise<VerifyWebhookOutput>;
  abstract queryStatus(providerTxId: string): Promise<QueryStatusOutput>;
  abstract refund(input: RefundInput): Promise<RefundOutput>;

  // ─── Crypto helpers ───────────────────────────────────────────────────

  /** Sinh chữ ký HMAC SHA-512 (hex) - VNPay dùng SHA-512 */
  protected hmacSha512(secret: string, data: string): string {
    return crypto.createHmac("sha512", secret).update(data, "utf-8").digest("hex");
  }

  /** Sinh chữ ký HMAC SHA-256 (hex) - MoMo/ZaloPay/Stripe dùng SHA-256 */
  protected hmacSha256(secret: string, data: string): string {
    return crypto.createHmac("sha256", secret).update(data, "utf-8").digest("hex");
  }

  /**
   * So sánh hai chuỗi hex bằng timing-safe để tránh tấn công timing-attack.
   * Trả về false nếu một trong hai chuỗi rỗng hoặc khác độ dài.
   */
  protected timingSafeEqual(a: string, b: string): boolean {
    if (!a || !b || a.length !== b.length) return false;
    try {
      return crypto.timingSafeEqual(Buffer.from(a, "hex"), Buffer.from(b, "hex"));
    } catch {
      return false;
    }
  }

  // ─── Query string helpers ─────────────────────────────────────────────

  /**
   * Sắp xếp params theo alphabet và encode chuẩn RFC 3986.
   * VNPay yêu cầu param phải sort ASC trước khi sign.
   */
  protected buildSortedQuery(params: Record<string, string | number | undefined>): string {
    const keys = Object.keys(params)
      .filter((k) => params[k] !== undefined && params[k] !== null && params[k] !== "")
      .sort();
    return keys
      .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(String(params[k]))}`)
      .join("&");
  }

  // ─── Validation helpers ───────────────────────────────────────────────

  protected assertEnv(name: string): string {
    const v = process.env[name];
    if (!v) {
      throw new Error(`Missing required env: ${name} (provider=${this.provider})`);
    }
    return v;
  }

  protected validatePositiveAmount(amount: number): void {
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error(`Invalid amount: ${amount} (must be positive number)`);
    }
  }

  // ─── Retry helper (cho call PSP API) ──────────────────────────────────

  /**
   * Retry với exponential backoff. Mặc định 3 lần, base 200ms.
   * Dùng cho các call HTTP có thể fail tạm thời (network glitch).
   */
  protected async withRetry<T>(
    fn: () => Promise<T>,
    options: { maxAttempts?: number; baseDelayMs?: number } = {}
  ): Promise<T> {
    const maxAttempts = options.maxAttempts ?? 3;
    const baseDelayMs = options.baseDelayMs ?? 200;
    let lastErr: unknown;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (err) {
        lastErr = err;
        if (attempt === maxAttempts) break;
        const delay = baseDelayMs * Math.pow(2, attempt - 1);
        this.providerLogger.warn(
          { attempt, delay, err: (err as Error).message },
          "retry after failure"
        );
        await new Promise((r) => setTimeout(r, delay));
      }
    }
    throw lastErr;
  }
}
