import { Router } from 'express';
import { ivsTrustController } from './ivs-trust.controller';
import { authenticate } from '../../middleware/auth';
import { requireSeller, requireAdmin } from '../../middleware/roleGuard';

const router = Router();

// Dashboard statistics
router.get('/sellers/me/dashboard', authenticate, requireSeller, ivsTrustController.getDashboard);

// QR Batches
router.get('/sellers/me/qr-batches', authenticate, requireSeller, ivsTrustController.listQrBatches);
router.post('/sellers/me/qr-batches', authenticate, requireSeller, ivsTrustController.createQrBatch);
router.get('/sellers/me/qr-batches/:batchId', authenticate, requireSeller, ivsTrustController.getQrBatch);
router.get('/sellers/me/qr-batches/:batchId/print-file', authenticate, requireSeller, ivsTrustController.getPrintFile);

// Verification logs
router.get('/sellers/me/verification-logs', authenticate, requireSeller, ivsTrustController.listVerificationLogs);

// Suspicious alerts
router.get('/sellers/me/suspicious-alerts', authenticate, requireSeller, ivsTrustController.listSuspiciousAlerts);

// Printer profile
router.get('/sellers/me/printer-profile', authenticate, requireSeller, ivsTrustController.getPrinterProfile);
router.patch('/sellers/me/printer-profile', authenticate, requireSeller, ivsTrustController.updatePrinterProfile);

export default router;
