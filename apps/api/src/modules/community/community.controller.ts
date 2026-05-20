import { Request, Response } from 'express';
import { communityService } from './community.service';

export const communityController = {
  async listPosts(req: Request, res: Response): Promise<void> {
    try {
      const result = await communityService.listPosts(
        Number(req.query.page) || 1,
        20,
        req.query.categoryId as string,
        req.query.tab as string
      );
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  },

  async createPost(req: Request, res: Response): Promise<void> {
    try {
      const post = await communityService.createPost({ ...req.body, authorId: req.user!.userId });
      res.status(201).json({ success: true, data: post, message: 'Đăng bài thành công' });
    } catch (error) {
      res.status(400).json({ success: false, message: 'Đăng bài thất bại' });
    }
  },

  async likePost(req: Request, res: Response): Promise<void> {
    try {
      const result = await communityService.likePost(req.params.postId, req.user!.userId);
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, message: 'Thao tác thất bại' });
    }
  },

  async addComment(req: Request, res: Response): Promise<void> {
    try {
      const comment = await communityService.addComment(
        req.params.postId,
        req.user!.userId,
        req.body.content as string,
        req.body.parentId as string
      );
      res.status(201).json({ success: true, data: comment });
    } catch (error) {
      res.status(400).json({ success: false, message: 'Bình luận thất bại' });
    }
  },

  async getLeaderboard(req: Request, res: Response): Promise<void> {
    try {
      const data = await communityService.getLeaderboard(req.query.period as 'week' | 'month' | 'year');
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  },

  async listCategories(req: Request, res: Response): Promise<void> {
    try {
      const data = await communityService.listCategories();
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  },
};
