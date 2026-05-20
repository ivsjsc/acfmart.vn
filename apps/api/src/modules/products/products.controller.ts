import { Request, Response } from 'express';
import { productsService } from './products.service';
import { ProductStatus } from '@prisma/client';

export const productsController = {
  async list(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 20,
        categoryId: req.query.categoryId as string,
        sellerId: req.query.sellerId as string,
        status: req.query.status as ProductStatus,
        search: req.query.search as string,
        minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
        maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
        isFeatured: req.query.isFeatured === 'true' ? true : undefined,
      };
      const result = await productsService.list(filters);
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  },

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const product = await productsService.getById(req.params.id);
      if (!product) {
        res.status(404).json({ success: false, message: 'Sản phẩm không tồn tại' });
        return;
      }
      await productsService.incrementView(req.params.id);
      res.json({ success: true, data: product });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  },

  async create(req: Request, res: Response): Promise<void> {
    try {
      const product = await productsService.create({
        ...req.body,
        sellerId: req.user!.userId,
      });
      res.status(201).json({ success: true, data: product, message: 'Tạo sản phẩm thành công' });
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Tạo sản phẩm thất bại';
      res.status(400).json({ success: false, message: msg });
    }
  },

  async update(req: Request, res: Response): Promise<void> {
    try {
      const product = await productsService.update(req.params.id, req.body);
      res.json({ success: true, data: product, message: 'Cập nhật thành công' });
    } catch (error) {
      res.status(400).json({ success: false, message: 'Cập nhật thất bại' });
    }
  },

  async approve(req: Request, res: Response): Promise<void> {
    try {
      const product = await productsService.approve(req.params.id, req.user!.userId);
      res.json({ success: true, data: product, message: 'Đã duyệt sản phẩm' });
    } catch (error) {
      res.status(400).json({ success: false, message: 'Duyệt sản phẩm thất bại' });
    }
  },

  async reject(req: Request, res: Response): Promise<void> {
    try {
      const { reason } = req.body as { reason: string };
      const product = await productsService.reject(req.params.id, reason);
      res.json({ success: true, data: product, message: 'Đã từ chối sản phẩm' });
    } catch (error) {
      res.status(400).json({ success: false, message: 'Từ chối sản phẩm thất bại' });
    }
  },

  async submitForReview(req: Request, res: Response): Promise<void> {
    try {
      const product = await productsService.submitForReview(req.params.id);
      res.json({ success: true, data: product, message: 'Đã gửi sản phẩm lên duyệt' });
    } catch (error) {
      res.status(400).json({ success: false, message: 'Gửi duyệt thất bại' });
    }
  },

  async delete(req: Request, res: Response): Promise<void> {
    try {
      await productsService.delete(req.params.id);
      res.json({ success: true, message: 'Đã xóa sản phẩm' });
    } catch (error) {
      res.status(400).json({ success: false, message: 'Xóa sản phẩm thất bại' });
    }
  },
};
