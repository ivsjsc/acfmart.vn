import { Router } from 'express';
import { 
  holdPayment, 
  releasePayment, 
  refundPayment, 
  getPaymentStatus, 
  processWebhook 
} from '../controllers/PaymentController';
import { idempotencyMiddleware } from '../middleware/idempotency';
import { hmacValidator } from '../middleware/hmacValidator';

const router = Router();

// Hold payment (escrow)
router.post('/hold', idempotencyMiddleware, holdPayment);

// Release payment (after delivery confirmation)
router.post('/release', releasePayment);

// Refund payment
router.post('/refund', refundPayment);

// Get payment status
router.get('/status/:transaction_id', getPaymentStatus);

// Webhook endpoint for PSP/3PL notifications
router.post('/webhooks/psp/status', hmacValidator, processWebhook);

export default router;