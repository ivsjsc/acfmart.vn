import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { payoutService } from "../services/PayoutService";
import type { PayoutStatus } from "../models/PayoutRequest";

const RequestPayoutSchema = z.object({
  seller_id: z.string().min(1).max(64),
  amount: z.number().positive().finite(),
  currency: z.string().length(3).optional(),
  bank_name: z.string().min(1).max(128),
  bank_account_number: z.string().min(6).max(64),
  bank_account_holder: z.string().min(1).max(128),
  metadata: z.record(z.unknown()).optional(),
});

const ApprovePayoutSchema = z.object({
  approved_by: z.string().min(1).max(64),
});

const MarkPaidSchema = z.object({
  transaction_ref: z.string().min(1).max(128),
});

const RejectSchema = z.object({
  reason: z.string().min(1).max(500),
});

export const payoutController = {
  async request(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = RequestPayoutSchema.parse(req.body);
      const result = await payoutService.requestPayout(input);
      res.status(201).json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  },

  async approve(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = ApprovePayoutSchema.parse(req.body);
      await payoutService.approvePayout(req.params.id, body.approved_by);
      res.status(200).json({ success: true, status: "approved" });
    } catch (err) {
      next(err);
    }
  },

  async markPaid(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = MarkPaidSchema.parse(req.body);
      await payoutService.markPaid(req.params.id, body.transaction_ref);
      res.status(200).json({ success: true, status: "paid" });
    } catch (err) {
      next(err);
    }
  },

  async reject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = RejectSchema.parse(req.body);
      await payoutService.rejectPayout(req.params.id, body.reason);
      res.status(200).json({ success: true, status: "rejected" });
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const payout = await payoutService.getPayout(req.params.id);
      res.status(200).json({ success: true, payout });
    } catch (err) {
      next(err);
    }
  },

  async listBySeller(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sellerId = req.params.sellerId;
      const status = req.query.status as PayoutStatus | undefined;
      const limit = req.query.limit ? Number(req.query.limit) : 50;
      const payouts = await payoutService.listForSeller(sellerId, status, limit);
      const balance = await payoutService.getAvailableBalance(sellerId);
      res.status(200).json({ success: true, available_balance: balance, payouts });
    } catch (err) {
      next(err);
    }
  },
};
