import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { paymentService } from "../services/PaymentService";
import { PaymentProvider } from "../gateways/IPaymentGateway";

const InitPaymentSchema = z.object({
  order_id: z.string().min(1).max(64),
  amount: z.number().positive().finite(),
  currency: z.enum(["VND", "USD", "EUR"]).default("VND"),
  provider: z.enum(["vnpay", "momo", "zalopay", "stripe", "paypal", "cod"]),
  seller_id: z.string().min(1).max(64).optional(),
  buyer_id: z.string().min(1).max(64).optional(),
  buyer_phone: z.string().max(20).optional(),
  buyer_email: z.string().email().optional(),
  buyer_name: z.string().max(255).optional(),
  description: z.string().min(1).max(500),
  return_url: z.string().url(),
  metadata: z.record(z.unknown()).optional(),
});

const RefundSchema = z.object({
  reason: z.string().min(1).max(500),
  refund_amount: z.number().positive().optional(),
});

export const paymentController = {
  async init(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = InitPaymentSchema.parse(req.body);
      const result = await paymentService.createPayment({
        ...input,
        provider: input.provider as PaymentProvider,
        client_ip: req.ip,
        idempotency_key: req.idempotencyKey,
      });
      res.status(200).json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tx = await paymentService.getTransaction(req.params.id);
      res.status(200).json({ success: true, transaction: tx });
    } catch (err) {
      next(err);
    }
  },

  async refund(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = RefundSchema.parse(req.body);
      const result = await paymentService.refundTransaction(
        req.params.id,
        body.reason,
        body.refund_amount
      );
      res.status(200).json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  },

  async release(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const reason = String(req.body?.reason ?? "manual_release");
      await paymentService.releaseEscrow(req.params.id, reason);
      res.status(200).json({ success: true, released_at: new Date().toISOString() });
    } catch (err) {
      next(err);
    }
  },
};
