import { PoolClient } from "pg";
import { PaymentProvider } from "../gateways/IPaymentGateway";

/**
 * Models layer - encapsulate SQL khỏi service.
 * Mọi method nhận PoolClient (caller controls transaction).
 */

export enum TransactionStatus {
  PENDING = "PENDING",       // vừa khởi tạo, chưa thanh toán
  HELD = "HELD",             // PSP báo paid, tiền đang trong escrow
  IN_TRANSIT = "IN_TRANSIT", // hàng đang giao
  RELEASED = "RELEASED",     // đã release cho seller
  REFUNDED = "REFUNDED",     // đã hoàn cho buyer
  EXPIRED = "EXPIRED",       // hết hạn chờ thanh toán
  FAILED = "FAILED",         // PSP báo fail
  RECONCILIATION = "RECONCILIATION", // đợi đối soát
}

export enum PaymentMethodLegacy {
  VNPAY = "vnpay",
  MOMOWALLET = "momowallet",
  ZALOPAY = "zalopay",
  STRIPE = "stripe",
  COD = "cod",
}

export enum RefundReason {
  BUYER_CANCEL = "buyer_cancel",
  SELLER_REJECT = "seller_reject",
  FAILED_DELIVERY = "failed_delivery",
  OUT_OF_STOCK = "out_of_stock",
  COUNTERFEIT = "counterfeit",
  OTHER = "other",
}

export interface TransactionRow {
  id: string;
  transaction_id: string;
  order_id: string;
  seller_id: string | null;
  buyer_id: string | null;
  amount: string; // pg trả DECIMAL as string - convert ở caller
  currency: string;
  payment_method: string;
  provider: PaymentProvider;
  status: TransactionStatus;
  provider_tx_id: string | null;
  buyer_phone: string | null;
  buyer_email: string | null;
  redirect_url: string | null;
  payment_url: string | null;
  expires_at: Date | null;
  released_at: Date | null;
  refunded_at: Date | null;
  idempotency_key: string | null;
  webhook_signature: string | null;
  error_code: string | null;
  error_message: string | null;
  metadata: Record<string, unknown>;
  created_at: Date;
  updated_at: Date;
}

export interface InsertTransaction {
  transaction_id: string;
  order_id: string;
  seller_id?: string | null;
  buyer_id?: string | null;
  amount: number;
  currency: string;
  payment_method: string;
  provider: PaymentProvider;
  status: TransactionStatus;
  provider_tx_id?: string | null;
  buyer_phone?: string | null;
  buyer_email?: string | null;
  redirect_url?: string | null;
  payment_url?: string | null;
  expires_at?: Date | null;
  idempotency_key?: string | null;
  metadata?: Record<string, unknown>;
}

export const TransactionModel = {
  async create(client: PoolClient, t: InsertTransaction): Promise<TransactionRow> {
    const q = `
      INSERT INTO transactions (
        transaction_id, order_id, seller_id, buyer_id,
        amount, currency, payment_method, provider, status, provider_tx_id,
        buyer_phone, buyer_email, redirect_url, payment_url, expires_at,
        idempotency_key, metadata
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *
    `;
    const res = await client.query<TransactionRow>(q, [
      t.transaction_id,
      t.order_id,
      t.seller_id ?? null,
      t.buyer_id ?? null,
      t.amount,
      t.currency,
      t.payment_method,
      t.provider,
      t.status,
      t.provider_tx_id ?? null,
      t.buyer_phone ?? null,
      t.buyer_email ?? null,
      t.redirect_url ?? null,
      t.payment_url ?? null,
      t.expires_at ?? null,
      t.idempotency_key ?? null,
      t.metadata ?? {},
    ]);
    return res.rows[0];
  },

  async findById(client: PoolClient, transactionId: string): Promise<TransactionRow | null> {
    const res = await client.query<TransactionRow>(
      "SELECT * FROM transactions WHERE transaction_id = $1 LIMIT 1",
      [transactionId]
    );
    return res.rows[0] ?? null;
  },

  async findByOrderId(client: PoolClient, orderId: string): Promise<TransactionRow | null> {
    const res = await client.query<TransactionRow>(
      "SELECT * FROM transactions WHERE order_id = $1 ORDER BY created_at DESC LIMIT 1",
      [orderId]
    );
    return res.rows[0] ?? null;
  },

  async findByProviderTxId(
    client: PoolClient,
    provider: PaymentProvider,
    providerTxId: string
  ): Promise<TransactionRow | null> {
    const res = await client.query<TransactionRow>(
      "SELECT * FROM transactions WHERE provider = $1 AND provider_tx_id = $2 LIMIT 1",
      [provider, providerTxId]
    );
    return res.rows[0] ?? null;
  },

  async updateStatus(
    client: PoolClient,
    transactionId: string,
    status: TransactionStatus,
    extra: Partial<{
      provider_tx_id: string;
      webhook_signature: string;
      error_code: string;
      error_message: string;
      released_at: Date;
      refunded_at: Date;
      metadata: Record<string, unknown>;
    }> = {}
  ): Promise<TransactionRow | null> {
    const sets: string[] = ["status = $1"];
    const vals: unknown[] = [status];
    let i = 2;

    if (extra.provider_tx_id !== undefined) {
      sets.push(`provider_tx_id = $${i++}`);
      vals.push(extra.provider_tx_id);
    }
    if (extra.webhook_signature !== undefined) {
      sets.push(`webhook_signature = $${i++}`);
      vals.push(extra.webhook_signature);
    }
    if (extra.error_code !== undefined) {
      sets.push(`error_code = $${i++}`);
      vals.push(extra.error_code);
    }
    if (extra.error_message !== undefined) {
      sets.push(`error_message = $${i++}`);
      vals.push(extra.error_message);
    }
    if (extra.released_at !== undefined) {
      sets.push(`released_at = $${i++}`);
      vals.push(extra.released_at);
    }
    if (extra.refunded_at !== undefined) {
      sets.push(`refunded_at = $${i++}`);
      vals.push(extra.refunded_at);
    }
    if (extra.metadata !== undefined) {
      sets.push(`metadata = COALESCE(metadata, '{}'::jsonb) || $${i++}::jsonb`);
      vals.push(JSON.stringify(extra.metadata));
    }

    vals.push(transactionId);
    const res = await client.query<TransactionRow>(
      `UPDATE transactions SET ${sets.join(", ")} WHERE transaction_id = $${i} RETURNING *`,
      vals
    );
    return res.rows[0] ?? null;
  },

  /**
   * Tìm transaction qua idempotency_key. Dùng trong middleware để ngăn
   * double-charge khi client retry với cùng key.
   */
  async findByIdempotencyKey(
    client: PoolClient,
    idempotencyKey: string
  ): Promise<TransactionRow | null> {
    const res = await client.query<TransactionRow>(
      "SELECT * FROM transactions WHERE idempotency_key = $1 LIMIT 1",
      [idempotencyKey]
    );
    return res.rows[0] ?? null;
  },
};
