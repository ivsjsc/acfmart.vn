import { Pool, PoolClient } from "pg";
import { config } from "./config";
import { logger } from "./logger";

/**
 * PostgreSQL connection pool - singleton dùng chung toàn service.
 * Mỗi service/middleware lấy connection qua `pool.connect()` rồi release sau khi xong.
 * Wrap transaction bằng helper `withTransaction` để đảm bảo BEGIN/COMMIT/ROLLBACK đúng cách.
 */
export const pool = new Pool({
  host: config.DB_HOST,
  port: config.DB_PORT,
  database: config.DB_NAME,
  user: config.DB_USER,
  password: config.DB_PASSWORD,
  max: config.DB_POOL_MAX,
  idleTimeoutMillis: config.DB_POOL_IDLE_TIMEOUT_MS,
  application_name: config.SERVICE_NAME,
});

pool.on("error", (err) => {
  logger.error({ err }, "PostgreSQL pool error");
});

/**
 * Helper chạy hàm trong transaction. Tự BEGIN/COMMIT, rollback khi throw.
 *
 *   await withTransaction(async (client) => {
 *     await client.query("INSERT ...")
 *     return result
 *   })
 */
export async function withTransaction<T>(
  fn: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

/** Health check - dùng cho endpoint /healthz */
export async function pingDatabase(): Promise<boolean> {
  try {
    const res = await pool.query("SELECT 1 AS ok");
    return res.rows[0]?.ok === 1;
  } catch (err) {
    logger.warn({ err }, "Database ping failed");
    return false;
  }
}

/** Graceful shutdown */
export async function closeDatabase(): Promise<void> {
  await pool.end();
  logger.info("PostgreSQL pool closed");
}
