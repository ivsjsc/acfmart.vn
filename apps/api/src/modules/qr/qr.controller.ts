import { Request, Response } from 'express';
import { qrService } from './qr.service';

export const qrController = {
  async generate(req: Request, res: Response): Promise<void> {
    try {
      const result = await qrService.generate(req.params.productId);
      res.json({ success: true, data: result, message: 'Tạo QR code thành công' });
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Tạo QR thất bại';
      res.status(400).json({ success: false, message: msg });
    }
  },

  async verify(req: Request, res: Response): Promise<void> {
    try {
      const result = await qrService.verify(req.params.code);
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, message: 'Xác thực thất bại' });
    }
  },
};
