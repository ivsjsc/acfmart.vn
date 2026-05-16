import { Request, Response } from 'express';
import { PaymentService } from '../services/PaymentService';
import { z } from 'zod';
import { RefundReason } from '../models/Transaction';

const paymentService = new PaymentService();

// Zod schema for validation
const createPaymentSchema = z.object({
  order_id: z.string().min(1, 'Order ID is required'),
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().default('VND'),
  payment_method: z.enum(['vnpay', 'momo']),
  buyer_phone: z.string().min(1, 'Buyer phone is required'),
  redirect_url: z.string().url().optional().default('http://localhost:3000'),
  idempotency_key: z.string().optional()
});

const refundPaymentSchema = z.object({
  transaction_id: z.string().min(1, 'Transaction ID is required'),
  refund_amount: z.number().positive('Refund amount must be positive'),
  reason: z.nativeEnum(RefundReason)
});

const releasePaymentSchema = z.object({
  transaction_id: z.string().min(1, 'Transaction ID is required')
});

export const createPayment = async (req: Request, res: Response) => {
  try {
    // Validate request with Zod
    const validatedData = createPaymentSchema.parse(req.body);
    
    const result = await paymentService.initiatePayment(validatedData);
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message
        }))
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getPaymentStatus = async (req: Request, res: Response) => {
  try {
    const { transactionId } = req.params;
    
    if (!transactionId) {
      return res.status(400).json({
        success: false,
        message: 'Transaction ID is required'
      });
    }
    
    const status = await paymentService.getPaymentStatus(transactionId);
    
    res.status(200).json({
      success: true,
      data: status
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const refundPayment = async (req: Request, res: Response) => {
  try {
    const validatedData = refundPaymentSchema.parse(req.body);
    
    // Convert the string reason to the enum
    const refundInput = {
      transaction_id: validatedData.transaction_id,
      refund_amount: validatedData.refund_amount,
      reason: validatedData.reason as RefundReason
    };
    
    const result = await paymentService.refundPayment(refundInput);
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message
        }))
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const releasePayment = async (req: Request, res: Response) => {
  try {
    const validatedData = releasePaymentSchema.parse(req.body);
    
    const result = await paymentService.releasePayment(validatedData);
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message
        }))
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};