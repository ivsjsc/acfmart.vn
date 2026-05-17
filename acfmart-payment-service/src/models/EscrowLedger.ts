import { PoolClient } from "pg";

export type LedgerAction = "hold" | "release" | "refund" | "adjust" | "fee";

export interface EscrowLedgerRow {
  id: string;
  transaction_id: string;
  seller_id: string | null;
  action: LedgerAction;
  amount: string;
  balance_before: string;
  balance_after: string;
  released_at: Date | null;
  notes: string | null;
  metadata: Record<string, unknown>;
  created_at: Date;
}

export interface InsertEscrowEntry {
  transaction_id: string;
  seller_id?: string | null;
  action: LedgerAction;
  amount: number;
  balance_before: number;
  balance_after: number;
  released_at?: Date | null;
  notes?: string | null;
  metadata?: Record<string, unknown>;
}

export const EscrowLedgerModel = {
  async create(client: PoolClient, entry: InsertEscrowEntry): Promise<EscrowLedgerRow> {
    const q = `
      INSERT INTO escrow_ledger (
        transaction_id, seller_id, action, amount, balance_before, balance_after,
        released_at, notes, metadata
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    const res = await client.query<EscrowLedgerRow>(q, [
      entry.transaction_id,
      entry.seller_id ?? null,
      entry.action,
      entry.amount,
      entry.balance_before,
      entry.balance_after,
      entry.released_at ?? null,
      entry.notes ?? null,
      entry.metadata ?? {},
    ]);
    return res.rows[0];
  },

  async listByTransaction(client: PoolClient, transactionId: string): Promise<EscrowLedgerRow[]> {
    const res = await client.query<EscrowLedgerRow>(
      "SELECT * FROM escrow_ledger WHERE transaction_id = $1 ORDER BY created_at ASC",
      [transactionId]
    );
    return res.rows;
  },

  /**
   * Tính số dư available của 1 seller bằng cách sum:
   *   + release  (cộng)
   *   - refund   (trừ)
   *   ± adjust   (theo dấu của amount)
   *   - fee      (trừ)
   * Số dư này độc lập với escrow đang HELD.
   */
  async computeAvailableBalance(client: PoolClient, sellerId: string): Promise<number> {
    const res = await client.query<{ total: string | null }>(
      `
      SELECT COALESCE(SUM(
        CASE
          WHEN action = 'release' THEN amount
          WHEN action = 'refund'  THEN -amount
          WHEN action = 'fee'     THEN -amount
          WHEN action = 'adjust'  THEN amount
          ELSE 0
        END
      ), 0) AS total
      FROM escrow_ledger
      WHERE seller_id = $1
      `,
      [sellerId]
    );
    return Number(res.rows[0]?.total ?? 0);
  },
};
