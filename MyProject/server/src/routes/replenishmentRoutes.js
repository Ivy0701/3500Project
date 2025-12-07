import { Router } from 'express';
import { authenticateToken, requireAuth } from '../middleware/auth.js';
import {
  getReplenishmentAlerts,
  getReplenishmentProgress,
  submitReplenishmentApplication,
  getReplenishmentApplications,
  updateReplenishmentApplicationStatus,
  checkAndCreateReplenishmentAlerts,
  createAlertsForLowStockItems
} from '../controllers/replenishmentController.js';

const router = Router();

router.use(authenticateToken);
router.use(requireAuth);

router.get('/alerts', getReplenishmentAlerts);
router.get('/progress', getReplenishmentProgress);
router.post('/applications', submitReplenishmentApplication);
router.get('/applications', getReplenishmentApplications);
router.patch('/applications/:requestId', updateReplenishmentApplicationStatus);
router.post('/check-alerts', checkAndCreateReplenishmentAlerts);
router.post('/create-alerts-for-low-stock', createAlertsForLowStockItems);

export default router;

