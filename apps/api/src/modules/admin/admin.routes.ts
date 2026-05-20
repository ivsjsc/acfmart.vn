import { Router } from 'express';
import { adminController } from './admin.controller';
import { authenticate } from '../../middleware/auth';
import { requireAdmin } from '../../middleware/roleGuard';

const router = Router();
router.use(authenticate, requireAdmin);

router.get('/dashboard', adminController.getDashboard);
router.get('/revenue-chart', adminController.getRevenueChart);
router.get('/users', adminController.listUsers);
router.patch('/users/:userId/toggle', adminController.toggleUserStatus);
router.get('/sellers', adminController.listSellers);
router.patch('/sellers/:sellerId/verify', adminController.verifySeller);

export default router;
