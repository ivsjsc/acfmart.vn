import { Router } from "express";
import { paymentController } from "../controllers/PaymentController";
import { webhookController } from "../controllers/WebhookController";
import { payoutController } from "../controllers/PayoutController";
import { idempotencyMiddleware } from "../middleware/idempotency";
import { internalHmacValidator } from "../middleware/hmacValidator";
import {
  defaultLimiter,
  paymentInitLimiter,
  webhookLimiter,
} from "../middleware/rateLimiter";

const router = Router();

// ─── Payment lifecycle ──────────────────────────────────────────────────
// POST /api/v1/payments/init - khởi tạo giao dịch + tạo link/QR thanh toán.
// Header `Idempotency-Key` bắt buộc để client safe-retry.
router.post(
  "/payments/init",
  paymentInitLimiter,
  idempotencyMiddleware,
  paymentController.init
);

// GET /api/v1/transactions/:id - tra cứu trạng thái.
router.get("/transactions/:id", defaultLimiter, paymentController.getById);

// POST /api/v1/transactions/:id/refund - hoàn tiền (admin/seller).
router.post(
  "/transactions/:id/refund",
  defaultLimiter,
  internalHmacValidator,
  paymentController.refund
);

// POST /api/v1/transactions/:id/release - release escrow (internal/shipping/admin).
router.post(
  "/transactions/:id/release",
  defaultLimiter,
  internalHmacValidator,
  paymentController.release
);

// ─── Webhooks ──────────────────────────────────────────────────────────
// POST /api/v1/webhooks/:provider - PSP notification endpoint.
// Signature verification do gateway tự handle (per-provider).
router.post("/webhooks/:provider", webhookLimiter, webhookController.receive);
// Một số gateway (VNPay) gọi IPN qua GET với query string
router.get("/webhooks/:provider", webhookLimiter, webhookController.receive);

// ─── Payouts ──────────────────────────────────────────────────────────
// POST /api/v1/payouts/request - seller yêu cầu rút tiền.
router.post(
  "/payouts/request",
  defaultLimiter,
  idempotencyMiddleware,
  payoutController.request
);

router.get("/payouts/:id", defaultLimiter, payoutController.getById);
router.post(
  "/payouts/:id/approve",
  defaultLimiter,
  internalHmacValidator,
  payoutController.approve
);
router.post(
  "/payouts/:id/paid",
  defaultLimiter,
  internalHmacValidator,
  payoutController.markPaid
);
router.post(
  "/payouts/:id/reject",
  defaultLimiter,
  internalHmacValidator,
  payoutController.reject
);
router.get("/payouts/seller/:sellerId", defaultLimiter, payoutController.listBySeller);

export default router;
