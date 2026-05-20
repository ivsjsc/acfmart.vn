import { Router } from 'express';
import { sellersController } from './sellers.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();
router.post('/register', authenticate, sellersController.register);
router.get('/dashboard', authenticate, sellersController.getDashboard);
export default router;
