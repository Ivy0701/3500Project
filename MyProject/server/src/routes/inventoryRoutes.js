import { Router } from 'express';
import {
  initializeInventory,
  getInventory,
  getInventoryByLocation,
  updateInventoryForSale,
  transferInventory
} from '../controllers/inventoryController.js';
import { authenticateToken, requireAuth } from '../middleware/auth.js';

const router = Router();

// Unified authentication: All inventory APIs will parse JWT; some APIs require login
router.use(authenticateToken);

// Initialize inventory, only called in development/demo environment
router.post('/initialize', initializeInventory);

// Full inventory list (backend statistics)
router.get('/', getInventory);

// Get inventory by location: GET /api/inventory/:locationId
router.get('/:locationId', requireAuth, getInventoryByLocation);

// Sales出货：PATCH /api/inventory/update
router.patch('/update', requireAuth, updateInventoryForSale);

// Warehouse/store transfer: PATCH /api/inventory/transfer
router.patch('/transfer', requireAuth, transferInventory);

export default router;

