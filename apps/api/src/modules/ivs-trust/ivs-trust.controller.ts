import { Request, Response } from 'express';
import { ivsTrustService } from './ivs-trust.service';

export const ivsTrustController = {
  async getDashboard(req: Request, res: Response): Promise<void> {
    try {
      const sellerId = req.user!.userId;
      const dashboard = await ivsTrustService.getSellerDashboard(sellerId);
      res.json(dashboard);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Lỗi server';
      res.status(500).json({ success: false, message: msg });
    }
  },

  async listQrBatches(req: Request, res: Response): Promise<void> {
    try {
      const sellerId = req.user!.userId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      
      const result = await ivsTrustService.listQrBatches(sellerId, { page, limit });
      res.json(result);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Lỗi server';
      res.status(500).json({ success: false, message: msg });
    }
  },

  async createQrBatch(req: Request, res: Response): Promise<void> {
    try {
      const sellerId = req.user!.userId;
      const { productId, skuId, quantity } = req.body;

      if (!productId) {
        res.status(400).json({ success: false, message: 'Thiếu productId' });
        return;
      }

      if (!quantity || quantity < 1) {
        res.status(400).json({ success: false, message: 'Số lượng không hợp lệ' });
        return;
      }

      const batch = await ivsTrustService.createQrBatch(sellerId, {
        productId,
        skuId,
        quantity: Math.min(quantity, 10000),
      });

      res.status(201).json(batch);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Tạo batch QR thất bại';
      res.status(400).json({ success: false, message: msg });
    }
  },

  async getQrBatch(req: Request, res: Response): Promise<void> {
    try {
      const sellerId = req.user!.userId;
      const { batchId } = req.params;
      
      const batch = await ivsTrustService.getQrBatch(sellerId, batchId);
      res.json(batch);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Lỗi server';
      res.status(404).json({ success: false, message: msg });
    }
  },

  async getPrintFile(req: Request, res: Response): Promise<void> {
    try {
      const sellerId = req.user!.userId;
      const { batchId } = req.params;
      const format = (req.query.format as 'json' | 'html' | 'zpl') || 'html';
      
      const printFile = await ivsTrustService.getPrintFile(sellerId, batchId, format);
      res.json(printFile);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Lỗi server';
      res.status(404).json({ success: false, message: msg });
    }
  },

  async listVerificationLogs(req: Request, res: Response): Promise<void> {
    try {
      const sellerId = req.user!.userId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const result = await ivsTrustService.listVerificationLogs(sellerId, { page, limit });
      res.json(result);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Lỗi server';
      res.status(500).json({ success: false, message: msg });
    }
  },

  async listSuspiciousAlerts(req: Request, res: Response): Promise<void> {
    try {
      const sellerId = req.user!.userId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const result = await ivsTrustService.listSuspiciousAlerts(sellerId, { page, limit });
      res.json(result);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Lỗi server';
      res.status(500).json({ success: false, message: msg });
    }
  },

  async getPrinterProfile(req: Request, res: Response): Promise<void> {
    try {
      const sellerId = req.user!.userId;
      const profile = await ivsTrustService.getPrinterProfile(sellerId);
      res.json(profile);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Lỗi server';
      res.status(500).json({ success: false, message: msg });
    }
  },

  async updatePrinterProfile(req: Request, res: Response): Promise<void> {
    try {
      const sellerId = req.user!.userId;
      const profile = await ivsTrustService.updatePrinterProfile(sellerId, req.body);
      res.json(profile);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Lỗi server';
      res.status(400).json({ success: false, message: msg });
    }
  },

  // REMOVED: Admin verification log routes belong in ivs-trust-platform backend
  // async listAdminVerificationLogs(req: Request, res: Response): Promise<void> {
  //   try {
  //     const page = parseInt(req.query.page as string) || 1;
  //     const limit = parseInt(req.query.limit as string) || 20;
  //     const result = req.query.result as string | undefined;
  //     const publicCode = req.query.publicCode as string | undefined;
  //     const sellerId = req.query.sellerId as string | undefined;
  //     const dateFrom = req.query.dateFrom as string | undefined;
  //     const dateTo = req.query.dateTo as string | undefined;
  //     
  //     const logsResult = await ivsTrustService.listAdminVerificationLogs({
  //       page,
  //       limit,
  //       result,
  //       publicCode,
  //       sellerId,
  //       dateFrom,
  //       dateTo,
  //     });
  //     
  //     res.json(logsResult);
  //   } catch (error) {
  //     const msg = error instanceof Error ? error.message : 'Lỗi server';
  //     res.status(500).json({ success: false, message: msg });
  //   }
  // },

  // async getAdminVerificationLogDetail(req: Request, res: Response): Promise<void> {
  //   try {
  //     const { id } = req.params;
  //     const detail = await ivsTrustService.getAdminVerificationLogDetail(id);
  //     res.json(detail);
  //   } catch (error) {
  //     const msg = error instanceof Error ? error.message : 'Lỗi server';
  //     res.status(404).json({ success: false, message: msg });
  //   }
  // },
};
