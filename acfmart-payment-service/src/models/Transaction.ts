import { PoolClient } from 'pg';

export enum TransactionStatus {
  PENDING = 'PENDING',
  HELD = 'HELD',
  RELEASED = 'RELEASED',
  REFUNDED = 'REFUNDED',
  EXPIRED = 'EXPIRED',
  FAILED = 'FAILED',
  RECONCILIATION = 'RECONCILIATION'
}

export enum PaymentMethod {
  VNPAY = 'vnpay',
  MOMOWALLET = 'momowallet',
  ZALOPAY = 'zalopay'
}

export enum RefundReason {
  BUYER_CANCEL = 'buyer_cancel',
  SELLER_REJECT = 'seller_reject',
  FAILED_DELIVERY = 'failed_delivery',
  OTHER = 'other'
}

export interface Transaction {
  id: string;
  transaction_id: string;
  order_id: string;
  amount: number;
  currency: string;
  payment_method: PaymentMethod;
  status: TransactionStatus;
  buyer_phone: string;
  redirect_url?: string;
  expires_at?: Date;
  psp_reference?: string;
  idempotency_key?: string;
  webhook_signature?: string;
  error_message?: string;
  metadata?: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export interface EscrowLedgerEntry {
  id: string;
  transaction_id: string;
  action: 'hold' | 'release' | 'refund';
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
  processed_at?: Date;
  error_message?: string;
  created_at: Date;
}

export class TransactionModel {
  static tableName = 'transactions';
  
  static async create(client: PoolClient, transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>): Promise<Transaction> {
    const query = `
      INSERT INTO ${this.tableName} 
      (transaction_id, order_id, amount, currency, payment_method, status, buyer_phone, redirect_url, expires_at, psp_reference, idempotency_key, webhook_signature, error_message, metadata)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `;
    
    const result = await client.query(query, [
      transaction.transaction_id,
      transaction.order_id,
      transaction.amount,
      transaction.currency,
      transaction.payment_method,
      transaction.status,
      transaction.buyer_phone,
      transaction.redirect_url,
      transaction.expires_at,
      transaction.psp_reference,
      transaction.idempotency_key,
      transaction.webhook_signature,
      transaction.error_message,
      transaction.metadata
    ]);
    
    return result.rows[0];
  }
  
  static async findById(client: PoolClient, transactionId: string): Promise<Transaction | null> {
    const query = `SELECT * FROM ${this.tableName} WHERE transaction_id = $1`;
    const result = await client.query(query, [transactionId]);
    
    return result.rows.length > 0 ? result.rows[0] : null;
  }
  
  static async findByOrderId(client: PoolClient, orderId: string): Promise<Transaction | null> {
    const query = `SELECT * FROM ${this.tableName} WHERE order_id = $1`;
    const result = await client.query(query, [orderId]);
    
    return result.rows.length > 0 ? result.rows[0] : null;
  }
  
  static async updateStatus(client: PoolClient, transactionId: string, status: TransactionStatus, webhookSignature?: string): Promise<Transaction | null> {
    const query = `
      UPDATE ${this.tableName} 
      SET status = $1, updated_at = NOW(), webhook_signature = $2 
      WHERE transaction_id = $3 
      RETURNING *
    `;
    
    const result = await client.query(query, [status, webhookSignature, transactionId]);
    
    return result.rows.length > 0 ? result.rows[0] : null;
  }
  
  static async updateStatusAndRelease(client: PoolClient, transactionId: string, status: TransactionStatus, metadata?: Record<string, any>): Promise<Transaction | null> {
    const query = `
      UPDATE ${this.tableName} 
      SET status = $1, updated_at = NOW(), metadata = COALESCE(metadata, '{}') || $2::jsonb
      WHERE transaction_id = $3 
      RETURNING *
    `;
    
    const result = await client.query(query, [status, JSON.stringify(metadata || {}), transactionId]);
    
    return result.rows.length > 0 ? result.rows[0] : null;
  }
  
  static async getIdempotencyResult(client: PoolClient, idempotencyKey: string): Promise<Transaction | null> {
    const query = `SELECT * FROM ${this.tableName} WHERE idempotency_key = $1`;
    const result = await client.query(query, [idempotencyKey]);
    
    return result.rows.length > 0 ? result.rows[0] : null;
  }
}

export class EscrowLedgerModel {
  static tableName = 'escrow_ledger';
  
  static async create(client: PoolClient, entry: Omit<EscrowLedgerEntry, 'id' | 'created_at'>): Promise<EscrowLedgerEntry> {
    const query = `
      INSERT INTO ${this.tableName} 
      (transaction_id, action, amount, balance_before, balance_after, notes)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const result = await client.query(query, [
      entry.transaction_id,
      entry.action,
      entry.amount,
      entry.balance_before,
      entry.balance_after,
      entry.notes
    ]);
    
    return result.rows[0];
  }
}

export class WebhookLogModel {
  static tableName = 'webhooks_log';
  
  static async create(client: PoolClient, log: Omit<WebhookLog, 'id' | 'created_at' | 'processed' | 'processed_at'>): Promise<WebhookLog> {
    const query = `
      INSERT INTO ${this.tableName} 
      (transaction_id, status, signature, timestamp, payload)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const result = await client.query(query, [
      log.transaction_id,
      log.status,
      log.signature,
      log.timestamp,
      JSON.stringify(log.payload)
    ]);
    
    return result.rows[0];
  }
  
  static async markProcessed(client: PoolClient, id: string): Promise<void> {
    const query = `
      UPDATE ${this.tableName} 
      SET processed = true, processed_at = NOW() 
      WHERE id = $1
    `;
    
    await client.query(query, [id]);
  }
}