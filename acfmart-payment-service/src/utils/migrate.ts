import fs from "fs";
import path from "path";
import { pool, closeDatabase } from "./db";
import { logger } from "./logger";

/**
 * Migration runner đơn giản:
 *  - Đọc mọi file *.sql trong thư mục migrations/ theo thứ tự alphabet.
 *  - Mỗi file chạy trong 1 transaction; lỗi -> rollback toàn bộ file đó.
 *  - Bảng schema_migrations track file đã chạy (idempotent).
 *
 * Cách dùng:
 *   npm run migrate           # apply pending migrations
 *   npm run migrate:fresh     # drop schema + re-apply (DEV ONLY)
 */

const MIGRATIONS_DIR = path.join(__dirname, "..", "migrations");

async function ensureMigrationTable(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename     VARCHAR(255) PRIMARY KEY,
      applied_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

async function getAppliedMigrations(): Promise<Set<string>> {
  const res = await pool.query<{ filename: string }>("SELECT filename FROM schema_migrations");
  return new Set(res.rows.map((r) => r.filename));
}

async function applyMigration(filename: string): Promise<void> {
  const filePath = path.join(MIGRATIONS_DIR, filename);
  const sql = fs.readFileSync(filePath, "utf-8");
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(sql);
    await client.query("INSERT INTO schema_migrations (filename) VALUES ($1)", [filename]);
    await client.query("COMMIT");
    logger.info({ filename }, "Migration applied");
  } catch (err) {
    await client.query("ROLLBACK");
    logger.error({ filename, err }, "Migration failed - rolled back");
    throw err;
  } finally {
    client.release();
  }
}

async function dropAll(): Promise<void> {
  // Chỉ cho phép trong môi trường non-production
  if (process.env.NODE_ENV === "production") {
    throw new Error("Refusing to drop schema in production");
  }
  await pool.query(`
    DO $$
    DECLARE
      r RECORD;
    BEGIN
      FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
      END LOOP;
    END
    $$;
  `);
  logger.warn("All tables dropped (--fresh)");
}

async function main(): Promise<void> {
  const fresh = process.argv.includes("--fresh");

  if (fresh) {
    await dropAll();
  }

  await ensureMigrationTable();
  const applied = await getAppliedMigrations();

  if (!fs.existsSync(MIGRATIONS_DIR)) {
    logger.warn({ dir: MIGRATIONS_DIR }, "Migrations directory not found");
    return;
  }

  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  if (files.length === 0) {
    logger.info("No migration files found");
    return;
  }

  let appliedCount = 0;
  for (const file of files) {
    if (applied.has(file) && !fresh) {
      logger.debug({ file }, "Skip (already applied)");
      continue;
    }
    await applyMigration(file);
    appliedCount++;
  }

  logger.info({ count: appliedCount, total: files.length }, "Migrations complete");
}

main()
  .then(async () => {
    await closeDatabase();
    process.exit(0);
  })
  .catch(async (err) => {
    logger.fatal({ err }, "Migration runner failed");
    await closeDatabase();
    process.exit(1);
  });
