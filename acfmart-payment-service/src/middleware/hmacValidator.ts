import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { config } from "../utils/config";
import { logger } from "../utils/logger";

/**
 * HMAC validator middleware - dùng cho internal webhook (giữa ACFMart services).
 *
 * Phân biệt với gateway webhook (VNPay/MoMo/...): mỗi provider có signature
 * format khác nhau, được xử lý trong từng IPaymentGateway.verifyWebhook().
 * Middleware này CHỈ dùng cho callback nội bộ với INTERNAL_API_KEY shared.
 *
 * Header yêu cầu:
 *   X-Webhook-Signature: <hex hmac-sha256>
 *   X-Webhook-Timestamp: <unix seconds>
 *
 * Replay window: ±5 phút (config WEBHOOK_REPLAY_WINDOW_SEC).
 */
export function internalHmacValidator(req: Request, res: Response, next: NextFunction): void {
  const signature = req.header("x-webhook-signature");
  const timestamp = req.header("x-webhook-timestamp");

  if (!signature || !timestamp) {
    res.status(401).json({
      error: "MISSING_SIGNATURE",
      message: "Yêu cầu header X-Webhook-Signature và X-Webhook-Timestamp",
    });
    return;
  }

  const now = Math.floor(Date.now() / 1000);
  const receivedTs = Number(timestamp);
  if (!Number.isFinite(receivedTs) || Math.abs(now - receivedTs) > config.WEBHOOK_REPLAY_WINDOW_SEC) {
    logger.warn({ now, receivedTs, drift: now - receivedTs }, "Webhook timestamp drift too large");
    res.status(401).json({
      error: "TIMESTAMP_OUT_OF_RANGE",
      message: "Timestamp ngoài cửa sổ cho phép (5 phút)",
    });
    return;
  }

  const payload = `${timestamp}.${JSON.stringify(req.body)}`;
  const expected = crypto
    .createHmac("sha256", config.INTERNAL_API_KEY)
    .update(payload, "utf-8")
    .digest("hex");

  if (signature.length !== expected.length) {
    res.status(401).json({ error: "INVALID_SIGNATURE" });
    return;
  }

  const valid = crypto.timingSafeEqual(
    Buffer.from(signature, "hex"),
    Buffer.from(expected, "hex")
  );

  if (!valid) {
    logger.warn({ ip: req.ip }, "Internal webhook signature mismatch");
    res.status(401).json({ error: "INVALID_SIGNATURE" });
    return;
  }

  next();
}
