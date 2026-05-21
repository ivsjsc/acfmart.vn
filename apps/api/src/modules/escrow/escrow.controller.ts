import { Router, Request, Response, NextFunction } from 'express';
import { EscrowService } from './escrow.service';

const router = Router();
const escrowService = new EscrowService();

// Helper: async error wrapper
const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };

/**
 * POST /escrow/release/:orderId
 * Buyer xác nhận đã nhận hàng → giải phóng escrow cho seller
 */
router.post(
  '/release/:orderId',
  asyncHandler(async (req: Request, res: Response) => {
    const { orderId } = req.params;
    const userId = (req as Request & { user?: { id: string } }).user?.id ?? 'anonymous';

    const result = await escrowService.releaseEscrow(orderId, userId);
    res.json({
      success: true,
      message: 'Escrow đã được giải phóng. Người bán sẽ nhận tiền trong 1–3 ngày làm việc.',
      data: result,
    });
  }),
);

/**
 * POST /escrow/dispute/:orderId
 * Buyer mở dispute để khiếu nại
 * Body: { reason, description, evidence? }
 */
router.post(
  '/dispute/:orderId',
  asyncHandler(async (req: Request, res: Response) => {
    const { orderId } = req.params;
    const { reason, description, evidence = [] } = req.body;
    const userId = (req as Request & { user?: { id: string } }).user?.id ?? '';

    if (!reason) {
      res.status(400).json({ success: false, message: 'Lý do khiếu nại là bắt buộc' });
      return;
    }

    if (!description || description.trim().length < 20) {
      res.status(400).json({ success: false, message: 'Mô tả phải có ít nhất 20 ký tự' });
      return;
    }

    const result = await escrowService.raiseDispute(orderId, userId, reason, description, evidence);
    res.json({
      success: true,
      message: 'Khiếu nại đã được gửi. Chúng tôi sẽ xử lý trong 3–5 ngày làm việc.',
      data: result,
    });
  }),
);

/**
 * GET /escrow/order/:orderId
 * Lấy trạng thái escrow của một đơn hàng
 */
router.get(
  '/order/:orderId',
  asyncHandler(async (req: Request, res: Response) => {
    const { orderId } = req.params;
    const result = await escrowService.getEscrowByOrder(orderId);

    if (!result) {
      res.status(404).json({ success: false, message: 'Không tìm thấy escrow cho đơn hàng này' });
      return;
    }

    res.json({ success: true, data: result });
  }),
);

/**
 * GET /escrow/seller/summary
 * Seller lấy tóm tắt escrow của mình
 */
router.get(
  '/seller/summary',
  asyncHandler(async (req: Request, res: Response) => {
    const user = (req as Request & { user?: { id: string; sellerId?: string } }).user;
    const sellerId = user?.sellerId ?? user?.id ?? '';

    const result = await escrowService.getSellerEscrowSummary(sellerId);
    res.json({ success: true, data: result });
  }),
);

/**
 * GET /escrow/admin/summary
 * Admin: tổng hợp báo cáo escrow
 */
router.get(
  '/admin/summary',
  asyncHandler(async (_req: Request, res: Response) => {
    const result = await escrowService.getAdminSummary();
    res.json({ success: true, data: result });
  }),
);

/**
 * GET /escrow/admin/pending
 * Admin: lấy danh sách escrow cần xử lý (HOLDING/DISPUTED)
 */
router.get(
  '/admin/pending',
  asyncHandler(async (_req: Request, res: Response) => {
    const result = await escrowService.getPendingEscrows();
    res.json({ success: true, data: result });
  }),
);

/**
 * POST /escrow/admin/resolve/:disputeId
 * Admin: resolve một dispute
 * Body: { resolution: 'RELEASE_TO_SELLER' | 'REFUND_TO_BUYER', note }
 */
router.post(
  '/admin/resolve/:disputeId',
  asyncHandler(async (req: Request, res: Response) => {
    const { disputeId } = req.params;
    const { resolution, note = '' } = req.body;
    const adminId = (req as Request & { user?: { id: string } }).user?.id ?? 'admin';

    if (!['RELEASE_TO_SELLER', 'REFUND_TO_BUYER'].includes(resolution)) {
      res.status(400).json({
        success: false,
        message: 'resolution phải là RELEASE_TO_SELLER hoặc REFUND_TO_BUYER',
      });
      return;
    }

    const result = await escrowService.resolveDispute(disputeId, resolution, adminId, note);
    res.json({
      success: true,
      message: 'Dispute đã được xử lý thành công',
      data: result,
    });
  }),
);

/**
 * POST /escrow/admin/auto-release
 * Trigger auto-release thủ công (thường được gọi bởi cron job)
 */
router.post(
  '/admin/auto-release',
  asyncHandler(async (_req: Request, res: Response) => {
    const count = await escrowService.autoRelease();
    res.json({
      success: true,
      message: `Đã tự động giải phóng ${count} escrow hết hạn`,
      data: { releasedCount: count },
    });
  }),
);

export default router;
