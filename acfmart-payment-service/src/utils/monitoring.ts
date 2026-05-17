import axios from "axios";
import { pool } from "./db";
import { logger } from "./logger";
import { TransactionStatus } from "../models/Transaction";

/**
 * MonitoringService - cron job kiểm tra sức khoẻ hệ thống và gửi alert Slack.
 *
 * Các check chính:
 *  - webhook fail rate > 5% trong 15 phút → alert HIGH
 *  - giao dịch HELD > 24h chưa release → alert HIGH (stuck escrow)
 *  - idempotency_keys trùng (không nên xảy ra) → alert MEDIUM
 *  - response time PSP / search service > threshold → alert HIGH
 *
 * Chạy độc lập qua cron hoặc k8s CronJob (xem k8s-deployment.yaml).
 */

interface AlertThresholds {
  webhookFailRate: number;       // % - mặc định 5%
  escrowStuckCount: number;      // số order - mặc định 10
  idempotencyCollisions: number; // mặc định 0 (any collision = bad)
  apiTimeoutMs: number;          // ms - mặc định 800
}

export const DEFAULT_THRESHOLDS: AlertThresholds = {
  webhookFailRate: 0.05,
  escrowStuckCount: 10,
  idempotencyCollisions: 0,
  apiTimeoutMs: 800,
};

type Severity = "low" | "medium" | "high" | "critical";

export class MonitoringService {
  private readonly thresholds: AlertThresholds;
  private readonly slackWebhookUrl?: string;

  constructor(thresholds: Partial<AlertThresholds> = {}) {
    this.thresholds = { ...DEFAULT_THRESHOLDS, ...thresholds };
    this.slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;
  }

  async checkWebhookFailures(timeWindowMinutes = 15): Promise<void> {
    const res = await pool.query<{ total_count: string; failed_count: string }>(
      `SELECT COUNT(*)::text AS total_count,
              SUM(CASE WHEN processed = false THEN 1 ELSE 0 END)::text AS failed_count
         FROM webhook_logs
        WHERE created_at >= NOW() - INTERVAL '${timeWindowMinutes} minutes'`
    );

    const total = Number(res.rows[0]?.total_count ?? 0);
    const failed = Number(res.rows[0]?.failed_count ?? 0);
    if (total === 0) return;

    const rate = failed / total;
    if (rate > this.thresholds.webhookFailRate) {
      await this.sendAlert(
        "Webhook Fail Rate cao",
        `Tỷ lệ webhook thất bại ${(rate * 100).toFixed(2)}% trong ${timeWindowMinutes} phút (${failed}/${total})`,
        "high"
      );
    }
  }

  async checkEscrowStuck(maxAgeHours = 24): Promise<void> {
    const res = await pool.query<{ stuck_count: string }>(
      `SELECT COUNT(*)::text AS stuck_count
         FROM transactions
        WHERE status = $1
          AND created_at <= NOW() - INTERVAL '${maxAgeHours} hours'`,
      [TransactionStatus.HELD]
    );

    const stuck = Number(res.rows[0]?.stuck_count ?? 0);
    if (stuck > this.thresholds.escrowStuckCount) {
      await this.sendAlert(
        "Escrow stuck",
        `${stuck} giao dịch HELD quá ${maxAgeHours} giờ chưa release.`,
        "high"
      );
    }
  }

  async checkIdempotencyCollisions(): Promise<void> {
    const res = await pool.query<{ idempotency_key: string; collision_count: string }>(
      `SELECT idempotency_key, COUNT(*)::text AS collision_count
         FROM transactions
        WHERE idempotency_key IS NOT NULL
        GROUP BY idempotency_key
        HAVING COUNT(*) > 1`
    );

    if (res.rows.length > this.thresholds.idempotencyCollisions) {
      await this.sendAlert(
        "Idempotency Key Collisions",
        `Phát hiện ${res.rows.length} idempotency keys bị trùng.`,
        "medium"
      );
    }
  }

  async checkApiPerformance(): Promise<void> {
    const url = process.env.PAYMENT_SERVICE_URL ?? `http://localhost:${process.env.PORT ?? 3001}`;
    try {
      const t0 = Date.now();
      await axios.get(`${url}/healthz`, { timeout: this.thresholds.apiTimeoutMs * 2 });
      const dt = Date.now() - t0;
      if (dt > this.thresholds.apiTimeoutMs) {
        await this.sendAlert(
          "Payment API chậm",
          `Health check mất ${dt}ms (ngưỡng ${this.thresholds.apiTimeoutMs}ms).`,
          "high"
        );
      }
    } catch (err) {
      await this.sendAlert(
        "Payment API unreachable",
        `Không gọi được health check: ${(err as Error).message}`,
        "critical"
      );
    }
  }

  private async sendAlert(title: string, message: string, severity: Severity): Promise<void> {
    logger.warn({ title, severity }, message);
    if (!this.slackWebhookUrl) return;
    try {
      await axios.post(this.slackWebhookUrl, {
        attachments: [
          {
            color: severity === "critical" ? "#ff0000" : severity === "high" ? "#ff6600" : "#ffff00",
            title,
            text: message,
            fields: [
              { title: "Severity", value: severity, short: true },
              { title: "Timestamp", value: new Date().toISOString(), short: true },
            ],
          },
        ],
      });
    } catch (err) {
      logger.error({ err: (err as Error).message }, "Failed to send Slack alert");
    }
  }

  async runHealthChecks(): Promise<void> {
    logger.info("Running monitoring health checks...");
    await Promise.allSettled([
      this.checkWebhookFailures(),
      this.checkEscrowStuck(),
      this.checkIdempotencyCollisions(),
      this.checkApiPerformance(),
    ]);
    logger.info("Health checks completed");
  }
}

export const monitoringService = new MonitoringService();

// Standalone runner: `ts-node src/utils/monitoring.ts`
if (require.main === module) {
  monitoringService
    .runHealthChecks()
    .then(() => process.exit(0))
    .catch((err) => {
      logger.error({ err }, "Monitoring run failed");
      process.exit(1);
    });
}
