import { Router } from 'express';
import { communityController } from './community.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.get('/posts', communityController.listPosts);
router.post('/posts', authenticate, communityController.createPost);
router.post('/posts/:postId/like', authenticate, communityController.likePost);
router.post('/posts/:postId/comments', authenticate, communityController.addComment);
router.get('/leaderboard', communityController.getLeaderboard);
router.get('/categories', communityController.listCategories);

export default router;
