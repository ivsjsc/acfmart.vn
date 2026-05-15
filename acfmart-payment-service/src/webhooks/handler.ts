import { Request, Response } from 'express';
import axios from 'axios';
import { TransactionModel, TransactionStatus, WebhookLogModel } from '../models/Transaction';
import { Pool } from 'pg';
import { EscrowHelper } from '../state-machine';

// Create a database connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'acfmart_payments',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

export interface GHNWebhookPayload {
  OrderCode: string;           // mã vận đơn GHN
  ClientOrderCode: string;     // mã đơn của bạn
  Status: string;              // ready_to_pick → delivering → delivered
  Type: string;                // switch_status
  Time: string;                // ISO date string
  CODAmount: number;
}

export interface ShippingWebhookPayload {
  order_code: string;
  status: string;
  current_location: string;
  history: Array<{
    status: string;
    location: string;
    time: string;
    note: string;
  }>;
}

export const processShippingWebhook = async (req: Request, res: Response) => {
  try {
    const payload: GHNWebhookPayload | any = req.body;
    const provider = req.headers['x-shipping-provider'] as string; // GHN, GHTK, etc.
    const signature = req.headers['x-signature'] as string;

    // Xác định loại webhook dựa trên trường đặc trưng của từng nhà cung cấp
    let orderCode: string;
    let status: string;

    if ('OrderCode' in payload && 'ClientOrderCode' in payload) {
      // Đây là webhook từ GHN
      const ghnPayload = payload as GHNWebhookPayload;
      orderCode = ghnPayload.ClientOrderCode;  // Mã đơn hàng của ACFMart
      status = ghnPayload.Status;              // Trạng thái từ GHN
    } else if (payload.order_code) {
      // Đây là webhook theo định dạng chuẩn
      orderCode = payload.order_code;
      status = payload.status;
    } else {
      return res.status(400).json({
        error: 'Unrecognized webhook format'
      });
    }

    if (!orderCode || !status) {
      return res.status(400).json({
        error: 'Missing required fields: order_code or status'
      });
    }

    // Log the incoming webhook
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Find the corresponding transaction based on order code
      const transaction = await TransactionModel.findByOrderId(client, orderCode);

      if (!transaction) {
        console.warn(`No transaction found for order code: ${orderCode}`);
        await client.query('COMMIT');
        return res.status(200).json({
          success: true,
          message: 'Webhook received but no corresponding transaction found'
        });
      }

      // Log the webhook event
      await WebhookLogModel.create(client, {
        transaction_id: transaction.transaction_id,
        status: status,
        signature,
        timestamp: new Date(),
        payload
      });

      // Map shipping status to our internal transaction status
      let newStatus: TransactionStatus | null = null;
      let shouldReleaseFunds = false;

      switch (status.toLowerCase()) {
        case 'delivered':
          newStatus = TransactionStatus.HELD; // Funds already held, waiting for release
          shouldReleaseFunds = true;
          break;
        case 'ready_to_pick':
        case 'delivering':
          newStatus = TransactionStatus.IN_TRANSIT;
          break;
        case 'delivery_fail':
        case 'return':
          newStatus = TransactionStatus.RECONCILIATION;
          break;
        case 'cancel':
          newStatus = TransactionStatus.REFUNDED;
          break;
        default:
          // For other statuses, just log but don't change transaction status
          break;
      }

      if (newStatus) {
        await TransactionModel.updateStatus(client, transaction.transaction_id, newStatus, signature);
      }

      await client.query('COMMIT');

      // If the order is delivered, trigger the escrow release process
      if (shouldReleaseFunds && transaction.status === TransactionStatus.HELD) {
        try {
          // Notify the payment service to release funds
          await axios.post(
            `${process.env.PAYMENT_SERVICE_URL}/api/v1/payments/release`,
            {
              transaction_id: transaction.transaction_id,
              webhook_signature: signature,
              metadata: {
                shipping_provider: provider,
                shipping_status: status,
                delivered_at: new Date(),
                ghn_tracking_code: 'OrderCode' in payload ? (payload as GHNWebhookPayload).OrderCode : undefined
              }
            },
            {
              headers: {
                'Authorization': `Bearer ${process.env.INTERNAL_API_KEY}`,
                'Content-Type': 'application/json'
              }
            }
          );
        } catch (releaseError) {
          console.error('Error triggering fund release:', releaseError);
          // Log error but don't fail the webhook response
        }
      }

      return res.status(200).json({
        success: true,
        message: 'Webhook processed successfully'
      });
    } catch (dbError) {
      await client.query('ROLLBACK');
      console.error('Database error in webhook processing:', dbError);
      throw dbError;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error processing shipping webhook:', error);
    
    return res.status(500).json({
      error: 'Internal server error processing webhook',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Verify the webhook signature from the shipping provider
export const verifyWebhookSignature = (req: Request, payload: any, provider: string): boolean => {
  try {
    const signature = req.headers['x-signature'] as string;
    
    // Different providers have different signature verification methods
    switch(provider.toLowerCase()) {
      case 'ghn':
        // GHN uses HMAC-SHA256 signature
        const ghnSecret = process.env.GHN_WEBHOOK_SECRET;
        if (!ghnSecret) {
          console.error('GHN webhook secret not configured');
          return false;
        }
        
        const expectedSignature = require('crypto')
          .createHmac('sha256', ghnSecret)
          .update(JSON.stringify(payload))
          .digest('hex');
        
        return signature === expectedSignature;
        
      case 'ghtk':
        // GHTK verification might be different
        const ghtkSecret = process.env.GHTK_WEBHOOK_SECRET;
        if (!ghtkSecret) {
          console.error('GHTK webhook secret not configured');
          return false;
        }
        
        const ghtkExpected = require('crypto')
          .createHmac('sha256', ghtkSecret)
          .update(JSON.stringify(payload))
          .digest('base64');
        
        return signature === ghtkExpected;
        
      default:
        console.warn(`Unknown shipping provider: ${provider}`);
        return false;
    }
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return false;
  }
};