import { Router } from 'express';
import { productsController } from './products.controller';
import { authenticate } from '../../middleware/auth';
import { requireAdmin, requireSeller } from '../../middleware/roleGuard';

const router = Router();

// Public routes
router.get('/', productsController.list);
router.get('/:id', productsController.getById);

// Seller routes
router.post('/', authenticate, requireSeller, productsController.create);
router.put('/:id', authenticate, requireSeller, productsController.update);
router.post('/:id/submit', authenticate, requireSeller, productsController.submitForReview);
router.delete('/:id', authenticate, requireSeller, productsController.delete);

// Admin routes
router.post('/:id/approve', authenticate, requireAdmin, productsController.approve);
router.post('/:id/reject', authenticate, requireAdmin, productsController.reject);

export default router;
