import { Router } from 'express';
import { authenticateToken, requireAuth } from '../middleware/auth.js';
import { getReceivingSchedules, getReceivingLogs, completeReceiving } from '../controllers/receivingController.js';

const router = Router();

router.use(authenticateToken);
router.use(requireAuth);

router.get('/schedules', getReceivingSchedules);
router.get('/logs', getReceivingLogs);
router.patch('/:planNo/complete', completeReceiving);

export default router;

