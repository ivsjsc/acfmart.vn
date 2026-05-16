import { Pool, QueryResult } from 'pg';

export enum TransactionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
  HELD = 'held',
  RELEASED = 'released',
  EXPIRED = 'expired',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  IN_TRANSIT = 'in_transit', // Thêm trạng thái đang vận chuyển
}

export enum PaymentMethod {
  VNPAY = 'vnpay',
  MOMOWALLET = 'momo',
  BANK_TRANSFER = 'bank_transfer',
  CASH_ON_DELIVERY = 'cod',
}

export enum RefundReason {
  CUSTOMER_REQUEST = 'customer_request',
  PRODUCT_UNAVAILABLE = 'product_unavailable',
  FRAUDULENT = 'fraudulent',
  CANCELLED = 'cancelled',
  OTHER = 'other',
}

export interface Transaction {
  transaction_id: string;
  order_id: string;
  amount: number;
  currency: string;
  payment_method: PaymentMethod;
  status: TransactionStatus;
  buyer_phone: string;
  redirect_url: string;
  created_at: Date;
  updated_at: Date;
  expires_at?: Date;
  psp_reference?: string;
  error_message?: string;
  idempotency_key?: string;
  metadata?: Record<string, any>;
}

export interface EscrowLedgerEntry {
  id: string;
  transaction_id: string;
  action: 'hold' | 'release' | 'refund' | 'fail';
  amount: number;
  balance_before: number;
  balance_after: number;
  notes: string;
  created_at: Date;
}

export interface WebhookLog {
  id: string;
  transaction_id: string;
  status: string;
  signature: string;
  timestamp: Date;
  payload: Record<string, any>;
  processed: boolean;
  created_at: Date;
}

export class TransactionModel {
  static async create(client: any, data: Omit<Transaction, 'created_at' | 'updated_at'>): Promise<Transaction> {
    const query = `
      INSERT INTO transactions (
        transaction_id, order_id, amount, currency, payment_method, status,
        buyer_phone, redirect_url, expires_at, idempotency_key
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    
    const values = [
      data.transaction_id,
      data.order_id,
      data.amount,
      data.currency,
      data.payment_method,
      data.status,
      data.buyer_phone,
      data.redirect_url,
      data.expires_at,
      data.idempotency_key,
    ];
    
    const result: QueryResult = await client.query(query, values);
    return result.rows[0];
  }
  
  static async findById(client: any, transactionId: string): Promise<Transaction | null> {
    const query = 'SELECT * FROM transactions WHERE transaction_id = $1';
    const result: QueryResult = await client.query(query, [transactionId]);
    return result.rows[0] || null;
  }
  
  static async findByOrderId(client: any, orderId: string): Promise<Transaction | null> {
    const query = 'SELECT * FROM transactions WHERE order_id = $1';
    const result: QueryResult = await client.query(query, [orderId]);
    return result.rows[0] || null;
  }
  
  static async getIdempotencyResult(client: any, idempotencyKey: string): Promise<Transaction | null> {
    const query = 'SELECT * FROM transactions WHERE idempotency_key = $1';
    const result: QueryResult = await client.query(query, [idempotencyKey]);
    return result.rows[0] || null;
  }
  
  static async update(client: any, transactionId: string, data: Partial<Transaction>): Promise<Transaction> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;
    
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    }
    
    values.push(transactionId);
    
    const query = `UPDATE transactions SET ${fields.join(', ')}, updated_at = NOW() WHERE transaction_id = $${paramCount} RETURNING *`;
    const result: QueryResult = await client.query(query, values);
    return result.rows[0];
  }
  
  static async updateStatus(client: any, transactionId: string, status: TransactionStatus, signature?: string): Promise<Transaction> {
    const query = `
      UPDATE transactions 
      SET status = $2, updated_at = NOW(), psp_signature = $3 
      WHERE transaction_id = $1 
      RETURNING *
    `;
    const result: QueryResult = await client.query(query, [transactionId, status, signature]);
    return result.rows[0];
  }
  
  static async updateStatusAndRelease(client: any, transactionId: string, status: TransactionStatus, metadata?: Record<string, any>): Promise<Transaction> {
    const query = `
      UPDATE transactions 
      SET status = $2, updated_at = NOW(), metadata = $3 
      WHERE transaction_id = $1 
      RETURNING *
    `;
    const result: QueryResult = await client.query(query, [transactionId, status, metadata]);
    return result.rows[0];
  }
}

export class EscrowLedgerModel {
  static async create(client: any, data: Omit<EscrowLedgerEntry, 'id' | 'created_at'>): Promise<EscrowLedgerEntry> {
    const query = `
      INSERT INTO escrow_ledger (
        transaction_id, action, amount, balance_before, balance_after, notes
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const values = [
      data.transaction_id,
      data.action,
      data.amount,
      data.balance_before,
      data.balance_after,
      data.notes,
    ];
    
    const result: QueryResult = await client.query(query, values);
    return result.rows[0];
  }
}

export class WebhookLogModel {
  static async create(client: any, data: Omit<WebhookLog, 'id' | 'created_at' | 'processed'>): Promise<WebhookLog> {
    const query = `
      INSERT INTO webhook_logs (
        transaction_id, status, signature, timestamp, payload
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const values = [
      data.transaction_id,
      data.status,
      data.signature,
      data.timestamp,
      JSON.stringify(data.payload),
    ];
    
    const result: QueryResult = await client.query(query, values);
    return result.rows[0];
  }
  
  static async markProcessed(client: any, logId: string): Promise<void> {
    const query = 'UPDATE webhook_logs SET processed = true WHERE id = $1';
    await client.query(query, [logId]);
  }
}