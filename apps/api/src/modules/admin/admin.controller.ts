import { Request, Response } from 'express';
import { adminService } from './admin.service';

export const adminController = {
  async getDashboard(req: Request, res: Response): Promise<void> {
    try {
      const stats = await adminService.getDashboardStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  },

  async listUsers(req: Request, res: Response): Promise<void> {
    try {
      const result = await adminService.listUsers(
        Number(req.query.page) || 1,
        20,
        req.query.role as string,
        req.query.search as string
      );
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  },

  async toggleUserStatus(req: Request, res: Response): Promise<void> {
    try {
      const user = await adminService.toggleUserStatus(req.params.userId);
      res.json({ success: true, data: user, message: 'Cập nhật trạng thái thành công' });
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Cập nhật thất bại';
      res.status(400).json({ success: false, message: msg });
    }
  },

  async listSellers(req: Request, res: Response): Promise<void> {
    try {
      const verified = req.query.verified !== undefined ? req.query.verified === 'true' : undefined;
      const result = await adminService.listSellers(Number(req.query.page) || 1, 20, verified);
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  },

  async verifySeller(req: Request, res: Response): Promise<void> {
    try {
      const seller = await adminService.verifySeller(req.params.sellerId);
      res.json({ success: true, data: seller, message: 'Đã xác thực seller' });
    } catch (error) {
      res.status(400).json({ success: false, message: 'Xác thực thất bại' });
    }
  },

  async getRevenueChart(req: Request, res: Response): Promise<void> {
    try {
      const data = await adminService.getRevenueChart();
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  },
};
