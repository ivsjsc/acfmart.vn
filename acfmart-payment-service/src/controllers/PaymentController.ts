import { Request, Response } from 'express';
import { PaymentService } from '../services/PaymentService';
import { PaymentMethod, RefundReason, TransactionStatus } from '../models/Transaction';
import Joi from 'joi';

const paymentService = new PaymentService();

// Validation schemas
const holdPaymentSchema = Joi.object({
  order_id: Joi.string().required(),
  amount: Joi.number().positive().required(),
  currency: Joi.string().valid('VND').default('VND'),
  payment_method: Joi.string().valid(...Object.values(PaymentMethod)).required(),
  buyer_phone: Joi.string().required(),
  redirect_url: Joi.string().uri().required(),
  idempotency_key: Joi.string().uuid({ version: 'uuidv4' })
});

const releasePaymentSchema = Joi.object({
  transaction_id: Joi.string().required(),
  metadata: Joi.object().optional()
});

const refundPaymentSchema = Joi.object({
  transaction_id: Joi.string().required(),
  reason: Joi.string().valid(...Object.values(RefundReason)).required(),
  refund_amount: Joi.number().positive().required()
});

export const holdPayment = async (req: Request, res: Response) => {
  try {
    // Validate input
    const { error, value } = holdPaymentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Invalid input',
        details: error.details.map(detail => detail.message)
      });
    }

    const result = await paymentService.holdPayment({
      order_id: value.order_id,
      amount: value.amount,
      currency: value.currency,
      payment_method: value.payment_method,
      buyer_phone: value.buyer_phone,
      redirect_url: value.redirect_url,
      idempotency_key: req.idempotencyKey // From middleware
    });

    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Hold payment error:', error);
    res.status(500).json({
      error: 'Internal server error during payment hold',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const releasePayment = async (req: Request, res: Response) => {
  try {
    // Validate input
    const { error, value } = releasePaymentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Invalid input',
        details: error.details.map(detail => detail.message)
      });
    }

    const result = await paymentService.releasePayment({
      transaction_id: value.transaction_id,
      metadata: value.metadata
    });

    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Release payment error:', error);
    
    // Check if it's a specific business error
    if (error instanceof Error && error.message.includes('not found')) {
      return res.status(404).json({
        error: 'Transaction not found'
      });
    } else if (error instanceof Error && error.message.includes('Cannot release')) {
      return res.status(409).json({
        error: 'Conflict',
        message: error.message
      });
    }
    
    res.status(500).json({
      error: 'Internal server error during payment release',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const refundPayment = async (req: Request, res: Response) => {
  try {
    // Validate input
    const { error, value } = refundPaymentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Invalid input',
        details: error.details.map(detail => detail.message)
      });
    }

    const result = await paymentService.refundPayment({
      transaction_id: value.transaction_id,
      reason: value.reason,
      refund_amount: value.refund_amount
    });

    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Refund payment error:', error);
    
    // Check if it's a specific business error
    if (error instanceof Error && error.message.includes('not found')) {
      return res.status(404).json({
        error: 'Transaction not found'
      });
    } else if (error instanceof Error && error.message.includes('Cannot refund')) {
      return res.status(409).json({
        error: 'Conflict',
        message: error.message
      });
    }
    
    res.status(500).json({
      error: 'Internal server error during payment refund',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getPaymentStatus = async (req: Request, res: Response) => {
  try {
    const transactionId = req.params.transaction_id;
    
    if (!transactionId) {
      return res.status(400).json({
        error: 'Transaction ID is required'
      });
    }

    const result = await paymentService.getPaymentStatus(transactionId);

    res.status(200).json({
      success: true,
      status: result.status,
      amount: result.amount,
      created_at: result.created_at,
      updated_at: result.updated_at,
      psp_reference: result.psp_reference,
      error_message: result.error_message
    });
  } catch (error) {
    console.error('Get payment status error:', error);
    
    if (error instanceof Error && error.message.includes('not found')) {
      return res.status(404).json({
        error: 'Transaction not found'
      });
    }
    
    res.status(500).json({
      error: 'Internal server error getting payment status',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const processWebhook = async (req: Request, res: Response) => {
  try {
    const { transaction_id, status, signature } = req.body;
    
    // Validate required fields
    if (!transaction_id || !status || !signature) {
      return res.status(400).json({
        error: 'Missing required fields: transaction_id, status, or signature'
      });
    }

    // Process the webhook
    await paymentService.processWebhook(
      transaction_id,
      status,
      signature,
      new Date(),
      req.body
    );

    res.status(200).json({
      success: true,
      message: 'Webhook processed successfully'
    });
  } catch (error) {
    console.error('Webhook processing error:', error);
    
    res.status(500).json({
      error: 'Internal server error processing webhook',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};