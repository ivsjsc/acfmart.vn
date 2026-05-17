import pino from "pino";

/**
 * Logger Pino - structured logging với context provider/transactionId.
 * Trong development dùng pino-pretty để output dễ đọc, production trả JSON
 * thuần để stack agent (Datadog, Grafana Loki…) parse được.
 */
const isProd = process.env.NODE_ENV === "production";

export const logger = pino({
  level: process.env.LOG_LEVEL ?? (isProd ? "info" : "debug"),
  base: {
    service: process.env.SERVICE_NAME ?? "acfmart-payment-service",
    env: process.env.NODE_ENV ?? "development",
  },
  ...(isProd
    ? {}
    : {
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:HH:MM:ss.l",
            ignore: "pid,hostname",
          },
        },
      }),
  redact: {
    paths: [
      "*.password",
      "*.secret",
      "*.hashSecret",
      "*.hash_secret",
      "*.secretKey",
      "*.secret_key",
      "*.key1",
      "*.key2",
      "headers.authorization",
      "headers.cookie",
      "*.vnp_SecureHash",
      "req.headers.authorization",
      "req.headers.cookie",
    ],
    censor: "***REDACTED***",
  },
});
