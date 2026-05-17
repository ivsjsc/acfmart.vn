import rateLimit from "express-rate-limit";
import { config } from "../utils/config";

/**
 * Rate limiters cho các loại endpoint khác nhau.
 *
 * Note: dùng in-memory store của express-rate-limit (đủ cho 1 instance).
 * Khi scale > 1 pod nên switch sang `rate-limit-redis` store để counter shared.
 */

export const defaultLimiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "RATE_LIMIT_EXCEEDED",
    message: "Quá nhiều request từ IP này, vui lòng thử lại sau.",
  },
});

/** Webhook endpoint cần limit cao hơn do PSP retry tự động */
export const webhookLimiter = rateLimit({
  windowMs: 60_000, // 1 phút
  max: config.RATE_LIMIT_WEBHOOK_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  // Webhook key theo provider + IP để VNPay không bị chặn bởi MoMo
  keyGenerator: (req) => `${req.params.provider ?? "unknown"}:${req.ip}`,
  message: {
    error: "WEBHOOK_RATE_LIMIT_EXCEEDED",
    message: "Webhook nhận quá nhiều request, kiểm tra retry policy PSP.",
  },
});

/** Init payment cần limit nghiêm để chống flood thanh toán giả */
export const paymentInitLimiter = rateLimit({
  windowMs: 60_000,
  max: 20, // 20 init/phút/IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "PAYMENT_INIT_RATE_LIMIT",
    message: "Quá nhiều giao dịch khởi tạo từ IP này.",
  },
});
