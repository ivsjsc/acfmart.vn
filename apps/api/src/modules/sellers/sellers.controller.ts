import { Request, Response } from 'express';
import { sellersService } from './sellers.service';

export const sellersController = {
  async getDashboard(req: Request, res: Response): Promise<void> {
    try {
      const profile = await sellersService.getProfile(req.user!.userId);
      if (!profile) { res.status(404).json({ success: false, message: 'Chưa đăng ký seller' }); return; }
      const stats = await sellersService.getDashboardStats(profile.id);
      res.json({ success: true, data: { ...stats, seller: profile } });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  },

  async register(req: Request, res: Response): Promise<void> {
    try {
      const seller = await sellersService.register(req.user!.userId, req.body);
      res.status(201).json({ success: true, data: seller, message: 'Đăng ký seller thành công' });
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Đăng ký thất bại';
      res.status(400).json({ success: false, message: msg });
    }
  },
};
