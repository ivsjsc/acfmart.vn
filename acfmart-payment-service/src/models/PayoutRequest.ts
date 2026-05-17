import { PoolClient } from "pg";

export type PayoutStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "processing"
  | "paid"
  | "failed";

export interface PayoutRow {
  id: string;
  payout_id: string;
  seller_id: string;
  amount: string;
  currency: string;
  status: PayoutStatus;
  bank_name: string;
  bank_account_number: string;
  bank_account_holder: string;
  requested_at: Date;
  approved_at: Date | null;
  approved_by: string | null;
  paid_at: Date | null;
  rejected_at: Date | null;
  rejected_reason: string | null;
  transaction_ref: string | null;
  metadata: Record<string, unknown>;
  created_at: Date;
  updated_at: Date;
}

export interface InsertPayout {
  payout_id: string;
  seller_id: string;
  amount: number;
  currency?: string;
  bank_name: string;
  bank_account_number: string;
  bank_account_holder: string;
  metadata?: Record<string, unknown>;
}

export const PayoutRequestModel = {
  async create(client: PoolClient, p: InsertPayout): Promise<PayoutRow> {
    const res = await client.query<PayoutRow>(
      `INSERT INTO payout_requests
        (payout_id, seller_id, amount, currency, bank_name, bank_account_number, bank_account_holder, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        p.payout_id,
        p.seller_id,
        p.amount,
        p.currency ?? "VND",
        p.bank_name,
        p.bank_account_number,
        p.bank_account_holder,
        p.metadata ?? {},
      ]
    );
    return res.rows[0];
  },

  async findById(client: PoolClient, payoutId: string): Promise<PayoutRow | null> {
    const res = await client.query<PayoutRow>(
      "SELECT * FROM payout_requests WHERE payout_id = $1 LIMIT 1",
      [payoutId]
    );
    return res.rows[0] ?? null;
  },

  async listBySeller(
    client: PoolClient,
    sellerId: string,
    status?: PayoutStatus,
    limit = 50
  ): Promise<PayoutRow[]> {
    const params: unknown[] = [sellerId];
    let where = "WHERE seller_id = $1";
    if (status) {
      params.push(status);
      where += ` AND status = $${params.length}`;
    }
    params.push(limit);
    const res = await client.query<PayoutRow>(
      `SELECT * FROM payout_requests ${where} ORDER BY requested_at DESC LIMIT $${params.length}`,
      params
    );
    return res.rows;
  },

  async updateStatus(
    client: PoolClient,
    payoutId: string,
    status: PayoutStatus,
    extra: Partial<{
      approved_by: string;
      rejected_reason: string;
      transaction_ref: string;
    }> = {}
  ): Promise<PayoutRow | null> {
    const sets = ["status = $1"];
    const vals: unknown[] = [status];
    let i = 2;

    if (status === "approved") {
      sets.push(`approved_at = NOW()`);
      if (extra.approved_by) {
        sets.push(`approved_by = $${i++}`);
        vals.push(extra.approved_by);
      }
    } else if (status === "paid") {
      sets.push(`paid_at = NOW()`);
      if (extra.transaction_ref) {
        sets.push(`transaction_ref = $${i++}`);
        vals.push(extra.transaction_ref);
      }
    } else if (status === "rejected") {
      sets.push(`rejected_at = NOW()`);
      if (extra.rejected_reason) {
        sets.push(`rejected_reason = $${i++}`);
        vals.push(extra.rejected_reason);
      }
    }

    vals.push(payoutId);
    const res = await client.query<PayoutRow>(
      `UPDATE payout_requests SET ${sets.join(", ")} WHERE payout_id = $${i} RETURNING *`,
      vals
    );
    return res.rows[0] ?? null;
  },
};
