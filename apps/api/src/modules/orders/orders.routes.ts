import { Router } from 'express';
import { ordersController } from './orders.controller';
import { authenticate } from '../../middleware/auth';
import { requireAdmin } from '../../middleware/roleGuard';

const router = Router();

router.post('/', authenticate, ordersController.create);
router.get('/my', authenticate, ordersController.getMyOrders);
router.get('/:id', authenticate, ordersController.getById);
router.post('/:id/cancel', authenticate, ordersController.cancel);

// Admin
router.get('/', authenticate, requireAdmin, ordersController.adminList);
router.put('/:id/status', authenticate, requireAdmin, ordersController.updateStatus);

export default router;
