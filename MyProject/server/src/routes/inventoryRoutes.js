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

// 统一鉴权：所有库存接口都会解析 JWT；部分接口要求强制登录
router.use(authenticateToken);

// 初始化库存，只在开发/演示环境下调用
router.post('/initialize', initializeInventory);

// 全量库存列表（后台统计）
router.get('/', getInventory);

// 根据位置获取库存：GET /api/inventory/:locationId
router.get('/:locationId', requireAuth, getInventoryByLocation);

// 销售出货：PATCH /api/inventory/update
router.patch('/update', requireAuth, updateInventoryForSale);

// 仓库/门店之间调拨：PATCH /api/inventory/transfer
router.patch('/transfer', requireAuth, transferInventory);

export default router;

