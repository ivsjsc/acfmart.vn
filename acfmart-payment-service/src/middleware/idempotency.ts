import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { redis } from "../utils/redis";
import { logger } from "../utils/logger";

declare module "express-serve-static-core" {
  interface Request {
    idempotencyKey?: string;
    idempotentReplay?: boolean;
  }
}

/**
 * Idempotency middleware - chống xử lý 1 request 2 lần.
 *
 * Cách hoạt động:
 *  - Client gửi header `Idempotency-Key: <uuid>` cho POST gây side-effect.
 *  - Server hash body + key, lưu vào Redis với TTL 24h.
 *  - Lần gọi thứ 2 với cùng key:
 *      • Cùng body hash → trả lại response cũ ngay lập tức (replay).
 *      • Body hash khác → 409 Conflict (client dùng sai key).
 *
 * Trade-off: dùng Redis thay vì DB lookup để giảm 1 round-trip Postgres.
 * Nếu Redis down -> log + cho qua (fail-open), tránh chặn flow thanh toán.
 */

const TTL_SECONDS = 24 * 60 * 60;
const KEY_PREFIX = "idem:";

function hashBody(body: unknown): string {
  return crypto.createHash("sha256").update(JSON.stringify(body)).digest("hex");
}

interface CachedResponse {
  status: number;
  body: unknown;
  bodyHash: string;
}

export async function idempotencyMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const key = req.headers["idempotency-key"] as string | undefined;

  if (!key) {
    next();
    return;
  }

  // Validate format - chấp nhận UUID v4 hoặc 32+ char alphanumeric
  if (!/^[A-Za-z0-9_-]{8,128}$/.test(key)) {
    res.status(400).json({
      error: "INVALID_IDEMPOTENCY_KEY",
      message: "Idempotency-Key phải là chuỗi 8-128 ký tự alphanumeric/-/_",
    });
    return;
  }

  req.idempotencyKey = key;
  const currentHash = hashBody(req.body);
  const cacheKey = `${KEY_PREFIX}${key}`;

  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached) as CachedResponse;
      if (parsed.bodyHash !== currentHash) {
        res.status(409).json({
          error: "IDEMPOTENCY_KEY_CONFLICT",
          message:
            "Idempotency-Key đã được dùng với body khác. Hãy tạo key mới hoặc gửi cùng body như lần trước.",
        });
        return;
      }
      logger.info({ key }, "Idempotency cache hit - replay response");
      req.idempotentReplay = true;
      res.status(parsed.status).json(parsed.body);
      return;
    }

    // Interceptor để lưu response sau khi controller chạy xong
    const originalJson = res.json.bind(res);
    res.json = (body: unknown) => {
      const cachedRes: CachedResponse = {
        status: res.statusCode,
        body,
        bodyHash: currentHash,
      };
      redis
        .setex(cacheKey, TTL_SECONDS, JSON.stringify(cachedRes))
        .catch((err) => logger.error({ err, key }, "Failed to cache idempotent response"));
      return originalJson(body);
    };

    next();
  } catch (err) {
    // Fail-open: Redis down -> log warning, vẫn cho request qua. An toàn hơn
    // việc chặn thanh toán; trade-off là client retry có thể double-charge.
    logger.error({ err, key }, "Idempotency middleware error - fail open");
    next();
  }
}
