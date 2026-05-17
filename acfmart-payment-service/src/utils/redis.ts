import Redis from "ioredis";
import { config } from "./config";
import { logger } from "./logger";

/**
 * Redis client cho:
 *  - Idempotency cache (TTL 24h): tránh xử lý 1 request 2 lần khi client retry.
 *  - Rate limiter (sliding window): bảo vệ API khỏi flood.
 *  - Webhook deduplication: nhận diện replay attack.
 */
export const redis = new Redis({
  host: config.REDIS_HOST,
  port: config.REDIS_PORT,
  password: config.REDIS_PASSWORD || undefined,
  db: config.REDIS_DB,
  keyPrefix: config.REDIS_KEY_PREFIX,
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: false,
});

redis.on("error", (err) => {
  logger.error({ err: err.message }, "Redis error");
});

redis.on("connect", () => {
  logger.info({ host: config.REDIS_HOST, port: config.REDIS_PORT }, "Redis connected");
});

export async function pingRedis(): Promise<boolean> {
  try {
    const pong = await redis.ping();
    return pong === "PONG";
  } catch (err) {
    logger.warn({ err }, "Redis ping failed");
    return false;
  }
}

export async function closeRedis(): Promise<void> {
  redis.disconnect();
  logger.info("Redis disconnected");
}
