import { Request, Response } from 'express';
import { authService } from './auth.service';

// Controller xử lý các request xác thực
export const authController = {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const result = await authService.register(req.body);
      res.status(201).json({ success: true, data: result, message: 'Đăng ký thành công' });
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Đăng ký thất bại';
      res.status(400).json({ success: false, message: msg });
    }
  },

  async login(req: Request, res: Response): Promise<void> {
    try {
      const result = await authService.login(req.body);
      res.json({ success: true, data: result, message: 'Đăng nhập thành công' });
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Đăng nhập thất bại';
      res.status(401).json({ success: false, message: msg });
    }
  },

  async refresh(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body as { refreshToken: string };
      if (!refreshToken) {
        res.status(400).json({ success: false, message: 'Thiếu refresh token' });
        return;
      }
      const result = await authService.refreshToken(refreshToken);
      res.json({ success: true, data: result });
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Làm mới token thất bại';
      res.status(401).json({ success: false, message: msg });
    }
  },

  async logout(req: Request, res: Response): Promise<void> {
    try {
      await authService.logout(req.user!.userId);
      res.json({ success: true, message: 'Đăng xuất thành công' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Đăng xuất thất bại' });
    }
  },

  async getMe(req: Request, res: Response): Promise<void> {
    try {
      const user = await authService.getMe(req.user!.userId);
      if (!user) {
        res.status(404).json({ success: false, message: 'Người dùng không tồn tại' });
        return;
      }
      res.json({ success: true, data: user });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  },
};
