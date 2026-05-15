import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { 
  Transaction, 
  TransactionStatus, 
  PaymentMethod, 
  RefundReason, 
  TransactionModel, 
  EscrowLedgerModel, 
  WebhookLogModel 
} from '../models/Transaction';
import { Pool } from 'pg';
import { ReconciliationService } from './ReconciliationService';

// Create a database connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'acfmart_payments',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

export interface HoldPaymentInput {
  order_id: string;
  amount: number;
  currency: string;
  payment_method: PaymentMethod;
  idempotency_key?: string;
  buyer_phone: string;
  redirect_url: string;
}

export interface ReleasePaymentInput {
  transaction_id: string;
  webhook_signature?: string;
  metadata?: Record<string, any>;
}

export interface RefundPaymentInput {
  transaction_id: string;
  reason: RefundReason;
  refund_amount: number;
}

export interface PaymentStatusOutput {
  status: TransactionStatus;
  amount: number;
  created_at: Date;
  updated_at: Date;
  psp_reference?: string;
  error_message?: string;
}

export class PaymentService {
  private reconciliationService: ReconciliationService;

  constructor() {
    this.reconciliationService = new ReconciliationService();
  }

  async holdPayment(input: HoldPaymentInput): Promise<{ 
    transaction_id: string; 
    status: TransactionStatus; 
    payment_url?: string; 
    expires_at?: Date;
  }> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Generate a unique transaction ID
      const transactionId = `txn_${uuidv4().replace(/-/g, '')}`;
      
      // Calculate expiration time (24 hours from now)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + Number(process.env.ESCROW_HOLD_DURATION_HOURS || 24));
      
      // Prepare transaction data
      const transactionData = {
        transaction_id: transactionId,
        order_id: input.order_id,
        amount: input.amount,
        currency: input.currency,
        payment_method: input.payment_method,
        status: TransactionStatus.PENDING,
        buyer_phone: input.buyer_phone,
        redirect_url: input.redirect_url,
        expires_at: expiresAt,
        idempotency_key: input.idempotency_key,
      };
      
      // Save the initial transaction
      const transaction = await TransactionModel.create(client, transactionData);
      
      // Call PSP to initiate payment
      let paymentUrl: string | undefined;
      
      switch (input.payment_method) {
        case PaymentMethod.VNPAY:
          paymentUrl = await this.callVnPayApi(transaction);
          break;
          
        case PaymentMethod.MOMOWALLET:
          paymentUrl = await this.callMoMoApi(transaction);
          break;
          
        default:
          throw new Error(`Unsupported payment method: ${input.payment_method}`);
      }
      
      // Update transaction status to PENDING
      const updatedTransaction = await TransactionModel.updateStatus(
        client, 
        transactionId, 
        TransactionStatus.PENDING
      );
      
      await client.query('COMMIT');
      
      return {
        transaction_id: transactionId,
        status: TransactionStatus.PENDING,
        payment_url: paymentUrl,
        expires_at: expiresAt
      };
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error in holdPayment:', error);
      throw error;
    } finally {
      client.release();
    }
  }
  
  private async callVnPayApi(transaction: Transaction): Promise<string> {
    try {
      // In sandbox mode
      const isProduction = process.env.NODE_ENV === 'production';
      
      const config = isProduction 
        ? {
          api_url: process.env.VNPAY_API_URL_PROD!,
          tmncode: process.env.VNPAY_TMNCODE_PROD!,
          hash_secret: process.env.VNPAY_HASHSECRET_PROD!,
        }
        : {
          api_url: process.env.VNPAY_API_URL!,
          tmncode: process.env.VNPAY_TMNCODE!,
          hash_secret: process.env.VNPAY_HASHSECRET!,
        };
      
      // Prepare payment data
      const orderId = transaction.transaction_id;
      const amount = Math.round(transaction.amount * 100); // Convert to cents
      
      // Create secure hash
      const params = {
        vnp_Version: '2.1.0',
        vnp_Command: 'pay',
        vnp_TmnCode: config.tmncode,
        vnp_Amount: amount.toString(),
        vnp_CurrCode: transaction.currency,
        vnp_BankCode: 'NCB',
        vnp_TxnRef: orderId,
        vnp_OrderInfo: `Order ${orderId} payment`,
        vnp_OrderType: 'other',
        vnp_Locale: 'vn',
        vnp_ReturnUrl: process.env.VNPAY_RETURN_URL,
        vnp_IpAddr: '127.0.0.1', // Should be actual IP in production
        vnp_CreateDate: new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14),
      };
      
      // Sort parameters alphabetically
      const sortedParams = Object.keys(params)
        .sort()
        .reduce((acc, key) => {
          if (params[key as keyof typeof params]) {
            acc[key] = params[key as keyof typeof params];
          }
          return acc;
        }, {} as Record<string, string>);
      
      // Create query string
      const queryString = Object.entries(sortedParams)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join('&');
      
      // Create signature
      const signData = `${config.hash_secret}${queryString}`;
      const secureHash = crypto
        .createHmac('sha512', config.hash_secret)
        .update(signData)
        .digest('hex');
      
      // Construct payment URL
      const paymentUrl = `${config.api_url}?${queryString}&vnp_SecureHash=${secureHash}`;
      
      return paymentUrl;
    } catch (error) {
      console.error('Error calling VnPay API:', error);
      throw error;
    }
  }
  
  private async callMoMoApi(transaction: Transaction): Promise<string> {
    try {
      const isProduction = process.env.NODE_ENV === 'production';
      
      const config = isProduction 
        ? {
          api_url: process.env.MOMO_API_URL_PROD!,
          partner_code: process.env.MOMO_PARTNER_CODE_PROD!,
          access_key: process.env.MOMO_ACCESS_KEY_PROD!,
          secret_key: process.env.MOMO_SECRET_KEY_PROD!,
        }
        : {
          api_url: process.env.MOMO_API_URL!,
          partner_code: process.env.MOMO_PARTNER_CODE!,
          access_key: process.env.MOMO_ACCESS_KEY!,
          secret_key: process.env.MOMO_SECRET_KEY!,
        };
      
      const requestId = `${transaction.transaction_id}_${Date.now()}`;
      const orderId = transaction.transaction_id;
      const amount = Math.round(transaction.amount);
      
      // Create raw signature
      const rawSignature = [
        `accessKey=${config.access_key}`,
        `amount=${amount}`,
        `extraData=`,
        `ipnUrl=${process.env.MOMO_RETURN_URL}`,
        `orderId=${orderId}`,
        `orderInfo=Order ${orderId} payment`,
        `partnerCode=${config.partner_code}`,
        `redirectUrl=${transaction.redirect_url}`,
        `requestId=${requestId}`,
        `requestType=payWithMethod`,
      ].join('&');
      
      // Create signature
      const signature = crypto
        .createHmac('sha256', config.secret_key)
        .update(rawSignature)
        .digest('hex');
      
      // Prepare payload
      const payload = {
        partnerCode: config.partner_code,
        partnerName: 'ACFMart',
        storeId: 'ACFMart Store',
        requestId,
        amount,
        orderId,
        orderInfo: `Order ${orderId} payment`,
        redirectUrl: transaction.redirect_url,
        ipnUrl: process.env.MOMO_RETURN_URL,
        lang: 'vi',
        requestType: 'payWithMethod',
        autoCapture: true,
        extraData: '',
        signature,
      };
      
      // Call MoMo API
      const response = await axios.post(config.api_url, payload);
      
      if (response.data && response.data.payUrl) {
        return response.data.payUrl;
      } else {
        throw new Error('MoMo API did not return payment URL');
      }
    } catch (error) {
      console.error('Error calling MoMo API:', error);
      throw error;
    }
  }
  
  async releasePayment(input: ReleasePaymentInput): Promise<{ status: TransactionStatus; released_at: Date; amount: number }> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Get the transaction
      const transaction = await TransactionModel.findById(client, input.transaction_id);
      
      if (!transaction) {
        throw new Error(`Transaction with ID ${input.transaction_id} not found`);
      }
      
      // Only release if the transaction is currently HELD
      if (transaction.status !== TransactionStatus.HELD) {
        throw new Error(`Cannot release transaction with status ${transaction.status}. Expected HELD.`);
      }
      
      // Update transaction status to RELEASED
      const updatedTransaction = await TransactionModel.updateStatusAndRelease(
        client, 
        input.transaction_id, 
        TransactionStatus.RELEASED,
        input.metadata
      );
      
      // Add entry to escrow ledger
      await EscrowLedgerModel.create(client, {
        transaction_id: input.transaction_id,
        action: 'release',
        amount: transaction.amount,
        balance_before: transaction.amount,
        balance_after: 0,
        notes: 'Released funds to merchant after delivery confirmation'
      });
      
      await client.query('COMMIT');
      
      return {
        status: TransactionStatus.RELEASED,
        released_at: new Date(),
        amount: transaction.amount
      };
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error in releasePayment:', error);
      throw error;
    } finally {
      client.release();
    }
  }
  
  async refundPayment(input: RefundPaymentInput): Promise<{ status: TransactionStatus; refund_transaction_id: string }> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Get the transaction
      const transaction = await TransactionModel.findById(client, input.transaction_id);
      
      if (!transaction) {
        throw new Error(`Transaction with ID ${input.transaction_id} not found`);
      }
      
      // Check if transaction is eligible for refund (must be HELD)
      if (transaction.status !== TransactionStatus.HELD) {
        throw new Error(`Cannot refund transaction with status ${transaction.status}. Expected HELD.`);
      }
      
      // Generate refund transaction ID
      const refundTransactionId = `ref_${uuidv4().replace(/-/g, '')}`;
      
      // Update original transaction status to REFUNDED
      await TransactionModel.updateStatus(
        client, 
        input.transaction_id, 
        TransactionStatus.REFUNDED
      );
      
      // Add entry to escrow ledger
      await EscrowLedgerModel.create(client, {
        transaction_id: input.transaction_id,
        action: 'refund',
        amount: input.refund_amount,
        balance_before: transaction.amount,
        balance_after: transaction.amount - input.refund_amount,
        notes: `Refund issued: ${input.reason}`
      });
      
      await client.query('COMMIT');
      
      return {
        status: TransactionStatus.REFUNDED,
        refund_transaction_id: refundTransactionId
      };
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error in refundPayment:', error);
      throw error;
    } finally {
      client.release();
    }
  }
  
  async getPaymentStatus(transactionId: string): Promise<PaymentStatusOutput> {
    const client = await pool.connect();
    
    try {
      const transaction = await TransactionModel.findById(client, transactionId);
      
      if (!transaction) {
        throw new Error(`Transaction with ID ${transactionId} not found`);
      }
      
      return {
        status: transaction.status,
        amount: transaction.amount,
        created_at: transaction.created_at,
        updated_at: transaction.updated_at,
        psp_reference: transaction.psp_reference,
        error_message: transaction.error_message
      };
    } finally {
      client.release();
    }
  }
  
  async processWebhook(transactionId: string, status: string, signature: string, timestamp: Date, payload: Record<string, any>): Promise<void> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Log the webhook
      const webhookLog = await WebhookLogModel.create(client, {
        transaction_id: transactionId,
        status,
        signature,
        timestamp,
        payload
      });
      
      // Get the transaction
      const transaction = await TransactionModel.findById(client, transactionId);
      
      if (!transaction) {
        throw new Error(`Transaction with ID ${transactionId} not found`);
      }
      
      // Process based on status
      if (status === 'completed' || status === 'delivered') {
        // Only release if order is paid and delivery confirmed
        if (transaction.status === TransactionStatus.HELD) {
          await TransactionModel.updateStatus(
            client, 
            transactionId, 
            TransactionStatus.RELEASED,
            signature
          );
          
          // Add entry to escrow ledger
          await EscrowLedgerModel.create(client, {
            transaction_id: transactionId,
            action: 'release',
            amount: transaction.amount,
            balance_before: transaction.amount,
            balance_after: 0,
            notes: 'Released funds after delivery confirmation via webhook'
          });
        }
      } else if (status === 'cancelled' || status === 'failed') {
        // Mark transaction as refunded/failed
        await TransactionModel.updateStatus(
          client, 
          transactionId, 
          TransactionStatus.REFUNDED,
          signature
        );
        
        // Add entry to escrow ledger
        await EscrowLedgerModel.create(client, {
          transaction_id: transactionId,
          action: 'refund',
          amount: transaction.amount,
          balance_before: transaction.amount,
          balance_after: 0,
          notes: `Refund due to ${status}`
        });
      }
      
      // Mark webhook as processed
      await WebhookLogModel.markProcessed(client, webhookLog.id);
      
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error processing webhook:', error);
      throw error;
    } finally {
      client.release();
    }
  }
  
  async checkExpiredTransactions(): Promise<number> {
    const client = await pool.connect();
    
    try {
      // Find all HELD transactions that have expired
      const query = `
        UPDATE transactions 
        SET status = $1, updated_at = NOW() 
        WHERE status = $2 AND expires_at < NOW()
        RETURNING transaction_id
      `;
      
      const result = await client.query(query, [TransactionStatus.EXPIRED, TransactionStatus.HELD]);
      
      // Add entries to escrow ledger for each expired transaction
      for (const row of result.rows) {
        await EscrowLedgerModel.create(client, {
          transaction_id: row.transaction_id,
          action: 'refund',
          amount: 0, // Amount will be retrieved from the transaction
          balance_before: 0,
          balance_after: 0,
          notes: 'Auto-refunded due to expiration'
        });
      }
      
      return result.rowCount;
    } finally {
      client.release();
    }
  }

  /**
   * Thực hiện đối soát với file CSV từ VNPay
   */
  async performVNPayReconciliation(csvFilePath: string) {
    return await this.reconciliationService.processVNPayReconciliation(csvFilePath);
  }
}