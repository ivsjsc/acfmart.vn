import { Router } from 'express';
import { PaymentService } from '../services/PaymentService';

const paymentService = new PaymentService();

export function registerRoutes(app: Router) {
  // Endpoint to initiate a payment
  app.post('/payments/create', async (req, res) => {
    try {
      const {
        order_id,
        amount,
        currency,
        payment_method,
        buyer_phone,
        redirect_url,
        idempotency_key
      } = req.body;

      if (!order_id || !amount || !buyer_phone) {
        return res.status(400).json({
          error: 'order_id, amount, and buyer_phone are required'
        });
      }

      const result = await paymentService.initiatePayment({
        order_id,
        amount,
        currency: currency || 'VND',
        payment_method: payment_method || 'vnpay',
        buyer_phone,
        redirect_url: redirect_url || 'http://localhost:3000',
        idempotency_key
      });

      res.status(200).json(result);
    } catch (error) {
      console.error('Create payment error:', error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Endpoint to get payment status
  app.get('/payments/status/:transactionId', async (req, res) => {
    try {
      const { transactionId } = req.params;
      const status = await paymentService.getPaymentStatus(transactionId);

      res.status(200).json(status);
    } catch (error) {
      console.error('Get payment status error:', error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Endpoint to process a refund
  app.post('/payments/refund', async (req, res) => {
    try {
      const { transaction_id, refund_amount, reason } = req.body;

      if (!transaction_id) {
        return res.status(400).json({
          error: 'transaction_id is required'
        });
      }

      const result = await paymentService.refundPayment({
        transaction_id,
        refund_amount,
        reason
      });

      res.status(200).json(result);
    } catch (error) {
      console.error('Process refund error:', error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Endpoint to release escrow
  app.post('/payments/release', async (req, res) => {
    try {
      const { transaction_id } = req.body;

      if (!transaction_id) {
        return res.status(400).json({
          error: 'transaction_id is required'
        });
      }

      const result = await paymentService.releasePayment({
        transaction_id
      });

      res.status(200).json(result);
    } catch (error) {
      console.error('Release payment error:', error);
      res.status(500).json({ error: (error as Error).message });
    }
  });
}