import { Request, Response } from 'express';
import { ordersService } from './orders.service';

export const ordersController = {
  async create(req: Request, res: Response): Promise<void> {
    try {
      const order = await ordersService.create({ ...req.body, userId: req.user!.userId });
      res.status(201).json({ success: true, data: order, message: 'Đặt hàng thành công' });
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Đặt hàng thất bại';
      res.status(400).json({ success: false, message: msg });
    }
  },

  async getMyOrders(req: Request, res: Response): Promise<void> {
    try {
      const result = await ordersService.getByUser(req.user!.userId, Number(req.query.page) || 1);
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  },

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const order = await ordersService.getById(req.params.id);
      if (!order) { res.status(404).json({ success: false, message: 'Đơn hàng không tồn tại' }); return; }
      res.json({ success: true, data: order });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  },

  async cancel(req: Request, res: Response): Promise<void> {
    try {
      const order = await ordersService.cancel(req.params.id, req.user!.userId);
      res.json({ success: true, data: order, message: 'Hủy đơn hàng thành công' });
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Hủy đơn hàng thất bại';
      res.status(400).json({ success: false, message: msg });
    }
  },

  async adminList(req: Request, res: Response): Promise<void> {
    try {
      const result = await ordersService.adminList(Number(req.query.page) || 1, 20, req.query.status as string);
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  },

  async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const order = await ordersService.updateStatus(req.params.id, req.body.status as string);
      res.json({ success: true, data: order, message: 'Cập nhật trạng thái thành công' });
    } catch (error) {
      res.status(400).json({ success: false, message: 'Cập nhật thất bại' });
    }
  },
};
