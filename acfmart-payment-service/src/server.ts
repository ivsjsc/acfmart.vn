import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import pinoHttp from "pino-http";
import { config, corsOrigins } from "./utils/config";
import { logger } from "./utils/logger";
import { closeDatabase, pingDatabase } from "./utils/db";
import { closeRedis, pingRedis } from "./utils/redis";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { PaymentGatewayFactory } from "./gateways/PaymentGatewayFactory";
import apiRouter from "./routes/paymentRoutes";

/**
 * ACFMart Payment Service - HTTP server entry point.
 *
 * Bootstrap sequence:
 *  1. Validate config (load env vào Zod schema, fail-fast nếu thiếu).
 *  2. Bind Express middleware stack: helmet → cors → body parser (giữ rawBody
 *     cho Stripe webhook) → pino-http request logger.
 *  3. Mount /healthz và /api/v1 routes.
 *  4. Error handler cuối cùng.
 *  5. Graceful shutdown: đóng pool + redis khi nhận SIGTERM.
 */

const app = express();
app.set("trust proxy", 1); // tin X-Forwarded-For từ reverse proxy

// ─── Security headers ──────────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: false, // API only, không serve HTML
  })
);

// ─── CORS ──────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: (origin, callback) => {
      // Cho phép request không có origin (webhook PSP) + whitelist
      if (!origin || corsOrigins.includes(origin) || corsOrigins.includes("*")) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin ${origin} không được phép`));
      }
    },
    credentials: true,
  })
);

// ─── Body parser - giữ raw buffer cho webhook Stripe ───────────────────
// Stripe yêu cầu verify signature trên raw body bytes (không qua JSON.parse).
// Lưu rawBody vào req để controller dùng khi cần.
app.use(
  express.json({
    limit: "1mb",
    verify: (req: Request & { rawBody?: Buffer }, _res, buf) => {
      req.rawBody = Buffer.from(buf);
    },
  })
);
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// ─── Request logger - structured log mỗi request ───────────────────────
app.use(
  pinoHttp({
    logger,
    customLogLevel: (_req, res, err) => {
      if (err || res.statusCode >= 500) return "error";
      if (res.statusCode >= 400) return "warn";
      return "info";
    },
    serializers: {
      req: (req) => ({
        method: req.method,
        url: req.url,
        id: req.id,
        // Loại bỏ body để tránh log thông tin nhạy cảm (card token…)
      }),
    },
  })
);

// ─── Health check ──────────────────────────────────────────────────────
app.get("/healthz", async (_req: Request, res: Response) => {
  const [dbOk, redisOk] = await Promise.all([pingDatabase(), pingRedis()]);
  const healthy = dbOk && redisOk;
  res.status(healthy ? 200 : 503).json({
    status: healthy ? "OK" : "DEGRADED",
    service: config.SERVICE_NAME,
    version: process.env.npm_package_version ?? "1.1.0",
    timestamp: new Date().toISOString(),
    dependencies: {
      database: dbOk ? "up" : "down",
      redis: redisOk ? "up" : "down",
    },
    providers: PaymentGatewayFactory.listProviders(),
  });
});

// ─── Liveness probe (k8s) - không check dependencies ───────────────────
app.get("/livez", (_req: Request, res: Response) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// ─── API routes ────────────────────────────────────────────────────────
app.use("/api/v1", apiRouter);

// ─── 404 + error handler (phải đặt cuối) ───────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

// ─── Bootstrap ─────────────────────────────────────────────────────────
const server = app.listen(config.PORT, () => {
  logger.info(
    {
      port: config.PORT,
      env: config.NODE_ENV,
      providers: PaymentGatewayFactory.listProviders(),
    },
    "ACFMart Payment Service started"
  );
});

// ─── Graceful shutdown ─────────────────────────────────────────────────
async function shutdown(signal: string): Promise<void> {
  logger.info({ signal }, "Shutdown signal received");
  server.close(async (err) => {
    if (err) logger.error({ err }, "Error closing HTTP server");
    await Promise.allSettled([closeDatabase(), closeRedis()]);
    logger.info("Shutdown complete");
    process.exit(err ? 1 : 0);
  });
  // Force exit nếu > 10s không close được
  setTimeout(() => {
    logger.warn("Force exit after 10s timeout");
    process.exit(1);
  }, 10_000).unref();
}

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));

process.on("unhandledRejection", (reason) => {
  logger.error({ reason }, "Unhandled promise rejection");
});

process.on("uncaughtException", (err) => {
  logger.fatal({ err }, "Uncaught exception - exiting");
  process.exit(1);
});

export default app;
