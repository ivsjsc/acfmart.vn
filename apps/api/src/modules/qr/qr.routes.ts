import { Router } from 'express';
import { qrController } from './qr.controller';
import { authenticate } from '../../middleware/auth';
import { requireSeller } from '../../middleware/roleGuard';

const router = Router();
router.post('/generate/:productId', authenticate, requireSeller, qrController.generate);
router.get('/verify/:code', qrController.verify);
export default router;
