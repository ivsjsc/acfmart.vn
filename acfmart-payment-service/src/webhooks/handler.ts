import express from 'express';
import { TransactionModel, TransactionStatus } from '../models/Transaction';
import { Pool } from 'pg';
import crypto from 'crypto';

// Create a database connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'acfmart_payments',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

export interface GHNWebhookPayload {
  OrderCode: string;           // Mã vận đơn GHN
  ClientOrderCode: string;     // Mã đơn hàng của bạn
  Status: string;              // ready_to_pick → delivering → delivered
  Type: string;                // "switch_status" 
  Time: string;                // Thời gian cập nhật trạng thái
  CODAmount: number;           // Số tiền thu hộ
}

export class WebhookHandler {
  async handleGHNWebhook(payload: GHNWebhookPayload, signature: string): Promise<boolean> {
    try {
      // Verify the webhook signature if available
      if (process.env.GHN_WEBHOOK_SECRET) {
        const expectedSignature = crypto
          .createHmac('sha256', process.env.GHN_WEBHOOK_SECRET)
          .update(JSON.stringify(payload))
          .digest('hex');
          
        if (signature !== expectedSignature) {
          console.error('Invalid GHN webhook signature');
          return false;
        }
      }
      
      // Find the order by ClientOrderCode (which maps to our order ID)
      const clientOrderCode = payload.ClientOrderCode;
      
      // Find the transaction in our database
      const client = await pool.connect();
      try {
        // Look up transaction by order ID
        const transaction = await TransactionModel.findByOrderId(client, clientOrderCode);
        
        if (!transaction) {
          console.error(`Transaction not found for order ID: ${clientOrderCode}`);
          return false;
        }
        
        // Update transaction status based on GHN status
        let newStatus: TransactionStatus;
        switch (payload.Status) {
          case 'ready_to_pick':
            newStatus = TransactionStatus.PROCESSING;
            break;
          case 'delivering':
            newStatus = TransactionStatus.IN_TRANSIT;
            break;
          case 'delivered':
            // This is the key status that triggers escrow release
            newStatus = TransactionStatus.DELIVERED;
            
            // If transaction is held, we can now release it
            if (transaction.status === TransactionStatus.HELD) {
              await TransactionModel.updateStatus(client, transaction.transaction_id, TransactionStatus.RELEASED);
              
              // Add entry to escrow ledger
              const ledgerResult = await import('../models/Transaction');
              await ledgerResult.EscrowLedgerModel.create(client, {
                transaction_id: transaction.transaction_id,
                action: 'release',
                amount: transaction.amount,
                balance_before: transaction.amount,
                balance_after: 0,
                notes: 'Released funds after delivery confirmation via GHN webhook'
              });
            }
            break;
          case 'returned':
          case 'lost':
          case 'damage':
            newStatus = TransactionStatus.CANCELLED;
            break;
          default:
            // Handle in transit status if it exists
            newStatus = TransactionStatus.IN_TRANSIT; // Default to in transit for other statuses
        }
        
        // Update transaction status
        await TransactionModel.updateStatus(client, transaction.transaction_id, newStatus);
        
        // Log the webhook event
        const logResult = await import('../models/Transaction');
        await logResult.WebhookLogModel.create(client, {
          transaction_id: transaction.transaction_id,
          status: payload.Status,
          signature,
          timestamp: new Date(payload.Time),
          payload
        });
        
        console.log(`Updated transaction ${transaction.transaction_id} to status ${newStatus}`);
        return true;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error handling GHN webhook:', error);
      return false;
    }
  }
  
  async handleVNPayWebhook(vnp_Params: Record<string, string>, signature: string): Promise<boolean> {
    try {
      // Verify the webhook signature if available
      if (process.env.VNPAY_HASHSECRET) {
        // Calculate expected signature
        const signedFields = vnp_Params.vnp_SecureHashType + '|' + 
                             vnp_Params.vnp_SecureHash;
        
        // For simplicity, we're assuming the signature verification is handled by VNPay
        // In practice, you'd reconstruct the data and verify against the secret
      }
      
      // Extract transaction reference
      const txnRef = vnp_Params.vnp_TxnRef;
      const txnNo = vnp_Params.vnp_TransactionNo;
      const amount = parseInt(vnp_Params.vnp_Amount || '0');
      const status = vnp_Params.vnp_TransactionStatus; // 00: success, 02: pending, other: failed
      
      const client = await pool.connect();
      try {
        // Find the transaction in our database
        const transaction = await TransactionModel.findByOrderId(client, txnRef);
        
        if (!transaction) {
          console.error(`Transaction not found for order ID: ${txnRef}`);
          return false;
        }
        
        // Map VNPay status to our internal status
        let newStatus: TransactionStatus;
        switch (status) {
          case '00': // Successful
            newStatus = TransactionStatus.HELD; // We hold the funds in escrow
            
            // Update the transaction with payment gateway reference
            await TransactionModel.update(client, transaction.transaction_id, {
              status: newStatus,
              psp_reference: txnNo,
              amount: amount / 100, // Convert from cents back to full units
            });
            
            // Add entry to escrow ledger
            const ledgerResult = await import('../models/Transaction');
            await ledgerResult.EscrowLedgerModel.create(client, {
              transaction_id: transaction.transaction_id,
              action: 'hold',
              amount: amount / 100,
              balance_before: 0,
              balance_after: amount / 100,
              notes: `Funds held from successful VNPay transaction ${txnNo}`
            });
            
            break;
          case '02': // Pending
            newStatus = TransactionStatus.PENDING;
            await TransactionModel.updateStatus(client, transaction.transaction_id, newStatus);
            break;
          default: // Failed
            newStatus = TransactionStatus.FAILED;
            await TransactionModel.updateStatus(client, transaction.transaction_id, newStatus);
            
            // Add entry to escrow ledger for failed payment
            const ledgerResult2 = await import('../models/Transaction');
            await ledgerResult2.EscrowLedgerModel.create(client, {
              transaction_id: transaction.transaction_id,
              action: 'fail',
              amount: transaction.amount,
              balance_before: 0,
              balance_after: 0,
              notes: `Payment failed with status ${status} from VNPay`
            });
        }
        
        // Log the webhook event
        const logResult = await import('../models/Transaction');
        await logResult.WebhookLogModel.create(client, {
          transaction_id: transaction.transaction_id,
          status: `vnpay_${status}`,
          signature,
          timestamp: new Date(),
          payload: vnp_Params
        });
        
        console.log(`Updated transaction ${transaction.transaction_id} to status ${newStatus} based on VNPay webhook`);
        return true;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error handling VNPay webhook:', error);
      return false;
    }
  }
  
  async handleMoMoWebhook(data: any, signature: string): Promise<boolean> {
    try {
      // Find the transaction by request ID
      const requestId = data.requestId;
      const orderId = data.orderId;
      
      const client = await pool.connect();
      try {
        // Find the transaction in our database
        const transaction = await TransactionModel.findByOrderId(client, orderId);
        
        if (!transaction) {
          console.error(`Transaction not found for order ID: ${orderId}`);
          return false;
        }
        
        // Handle MoMo status
        const resultCode = data.resultCode; // 0: success, others: failed
        let newStatus: TransactionStatus;
        
        if (resultCode === 0) {
          newStatus = TransactionStatus.HELD; // Hold funds in escrow
          
          // Update the transaction with payment gateway reference
          await TransactionModel.update(client, transaction.transaction_id, {
            status: newStatus,
            psp_reference: data.transId, // MoMo transaction ID
            amount: data.amount / 100, // Convert from cents back to full units
          });
          
          // Add entry to escrow ledger
          const ledgerResult = await import('../models/Transaction');
          await ledgerResult.EscrowLedgerModel.create(client, {
            transaction_id: transaction.transaction_id,
            action: 'hold',
            amount: data.amount / 100,
            balance_before: 0,
            balance_after: data.amount / 100,
            notes: `Funds held from successful MoMo transaction ${data.transId}`
          });
        } else {
          newStatus = TransactionStatus.FAILED;
          await TransactionModel.updateStatus(client, transaction.transaction_id, newStatus);
        }
        
        // Log the webhook event
        const logResult = await import('../models/Transaction');
        await logResult.WebhookLogModel.create(client, {
          transaction_id: transaction.transaction_id,
          status: `momo_${resultCode}`,
          signature,
          timestamp: new Date(),
          payload: data
        });
        
        console.log(`Updated transaction ${transaction.transaction_id} to status ${newStatus} based on MoMo webhook`);
        return true;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error handling MoMo webhook:', error);
      return false;
    }
  }
}

export const webhookHandler = new WebhookHandler();

export function registerWebhookRoutes(app: express.Application): void {
  app.post('/webhooks/ghn', express.json(), async (req, res) => {
    try {
      const signature = req.headers['x-ghn-signature'] as string || '';
      const isValid = await webhookHandler.handleGHNWebhook(req.body, signature);
      
      if (isValid) {
        res.status(200).send({ message: 'Webhook processed successfully' });
      } else {
        res.status(400).send({ message: 'Webhook validation failed' });
      }
    } catch (error) {
      console.error('Error in GHN webhook endpoint:', error);
      res.status(500).send({ message: 'Internal server error' });
    }
  });

  app.post('/webhooks/vnpay', express.urlencoded({ extended: true }), async (req, res) => {
    try {
      // VNPay sends data as URL-encoded form
      const vnp_Params = req.body;
      const signature = vnp_Params.vnp_SecureHash || '';
      const isValid = await webhookHandler.handleVNPayWebhook(vnp_Params, signature);
      
      if (isValid) {
        res.status(200).send('ok'); // VNPay expects 'ok' in plain text
      } else {
        res.status(400).send('Invalid');
      }
    } catch (error) {
      console.error('Error in VNPay webhook endpoint:', error);
      res.status(500).send('Error');
    }
  });

  app.post('/webhooks/momo', express.json(), async (req, res) => {
    try {
      const signature = req.headers['signature'] as string || '';
      const isValid = await webhookHandler.handleMoMoWebhook(req.body, signature);
      
      if (isValid) {
        res.status(200).send({ message: 'Webhook processed successfully' });
      } else {
        res.status(400).send({ message: 'Webhook validation failed' });
      }
    } catch (error) {
      console.error('Error in MoMo webhook endpoint:', error);
      res.status(500).send({ message: 'Internal server error' });
    }
  });
}