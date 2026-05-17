import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

/**
 * Schema validate cho biến môi trường - fail fast khi thiếu/sai format.
 * Các provider key có thể trống nếu provider đó chưa được kích hoạt,
 * chỉ enforce khi PaymentGateway của provider được khởi tạo (assertEnv).
 */
const ConfigSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "staging", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3001),
  LOG_LEVEL: z.string().default("info"),
  SERVICE_NAME: z.string().default("acfmart-payment-service"),
  PUBLIC_BASE_URL: z.string().url().default("http://localhost:3001"),

  DB_HOST: z.string().default("localhost"),
  DB_PORT: z.coerce.number().int().positive().default(5432),
  DB_NAME: z.string().default("acfmart_payments"),
  DB_USER: z.string().default("postgres"),
  DB_PASSWORD: z.string().default("postgres"),
  DB_POOL_MAX: z.coerce.number().int().positive().default(20),
  DB_POOL_IDLE_TIMEOUT_MS: z.coerce.number().int().nonnegative().default(30000),

  REDIS_HOST: z.string().default("localhost"),
  REDIS_PORT: z.coerce.number().int().positive().default(6379),
  REDIS_PASSWORD: z.string().optional().default(""),
  REDIS_DB: z.coerce.number().int().nonnegative().default(0),
  REDIS_KEY_PREFIX: z.string().default("acfmart:pay:"),

  INTERNAL_API_KEY: z.string().min(16, "INTERNAL_API_KEY phải >= 16 ký tự").default("dev-internal-key-please-change"),
  WEBHOOK_REPLAY_WINDOW_SEC: z.coerce.number().int().positive().default(300),

  ESCROW_HOLD_DURATION_HOURS: z.coerce.number().positive().default(72),
  ESCROW_AUTO_RELEASE_AFTER_DAYS: z.coerce.number().positive().default(7),
  PLATFORM_COMMISSION_RATE: z.coerce.number().min(0).max(1).default(0.05),
  PAYMENT_GATEWAY_FEE_RATE: z.coerce.number().min(0).max(1).default(0.022),

  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900_000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(100),
  RATE_LIMIT_WEBHOOK_MAX: z.coerce.number().int().positive().default(600),

  CORS_ORIGINS: z.string().default("http://localhost:3000"),
});

export type AppConfig = z.infer<typeof ConfigSchema>;

const parsed = ConfigSchema.safeParse(process.env);
if (!parsed.success) {
  // Không dùng logger ở đây vì logger đọc config -> tránh circular
  // eslint-disable-next-line no-console
  console.error("Config validation failed:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const config: AppConfig = parsed.data;

export const corsOrigins = config.CORS_ORIGINS.split(",")
  .map((s) => s.trim())
  .filter(Boolean);
