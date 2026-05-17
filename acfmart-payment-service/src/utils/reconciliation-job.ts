import { reconciliationService } from "../services/ReconciliationService";
import { logger } from "./logger";
import { closeDatabase } from "./db";
import { closeRedis } from "./redis";

/**
 * Cron entry: VNPay reconciliation job (T+1).
 * Cách chạy: `node dist/utils/reconciliation-job.js` hoặc qua k8s CronJob.
 */

async function main(): Promise<void> {
  try {
    await reconciliationService.runScheduledReconciliation();
    logger.info("Reconciliation job completed");
  } catch (err) {
    logger.error({ err }, "Reconciliation job failed");
    throw err;
  }
}

if (require.main === module) {
  main()
    .then(async () => {
      await Promise.allSettled([closeDatabase(), closeRedis()]);
      process.exit(0);
    })
    .catch(async () => {
      await Promise.allSettled([closeDatabase(), closeRedis()]);
      process.exit(1);
    });
}
