import { Router } from 'express';
import { authenticateToken, requireAuth } from '../middleware/auth.js';
import { getTransferOrders, dispatchTransferOrder, createTransferOrder } from '../controllers/transferController.js';

const router = Router();

router.use(authenticateToken);
router.use(requireAuth);

router.get('/', getTransferOrders);
router.post('/', createTransferOrder);
router.patch('/:transferId/dispatch', dispatchTransferOrder);

export default router;

