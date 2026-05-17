import { PoolClient } from "pg";
import { pool } from "../utils/db";

export interface WebhookLogRow {
  id: string;
  provider: string;
  transaction_id: string | null;
  event_type: string | null;
  signature: string | null;
  signature_valid: boolean;
  status: string | null;
  http_status: number | null;
  remote_ip: string | null;
  headers: Record<string, unknown> | null;
  payload: Record<string, unknown>;
  processed: boolean;
  processed_at: Date | null;
  error_message: string | null;
  created_at: Date;
}

export interface InsertWebhookLog {
  provider: string;
  transaction_id?: string | null;
  event_type?: string | null;
  signature?: string | null;
  signature_valid: boolean;
  status?: string | null;
  http_status?: number | null;
  remote_ip?: string | null;
  headers?: Record<string, unknown> | null;
  payload: Record<string, unknown>;
}

export const WebhookLogModel = {
  /** Log không cần transaction - chạy ngoài tx context */
  async log(entry: InsertWebhookLog): Promise<WebhookLogRow> {
    const res = await pool.query<WebhookLogRow>(
      `INSERT INTO webhook_logs
        (provider, transaction_id, event_type, signature, signature_valid,
         status, http_status, remote_ip, headers, payload)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        entry.provider,
        entry.transaction_id ?? null,
        entry.event_type ?? null,
        entry.signature ?? null,
        entry.signature_valid,
        entry.status ?? null,
        entry.http_status ?? null,
        entry.remote_ip ?? null,
        entry.headers ?? null,
        entry.payload,
      ]
    );
    return res.rows[0];
  },

  async markProcessed(client: PoolClient, id: string, errorMessage?: string): Promise<void> {
    await client.query(
      `UPDATE webhook_logs
         SET processed = TRUE, processed_at = NOW(), error_message = $2
       WHERE id = $1`,
      [id, errorMessage ?? null]
    );
  },
};
