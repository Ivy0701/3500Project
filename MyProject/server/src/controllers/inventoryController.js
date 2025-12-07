import mongoose from 'mongoose';
import Inventory from '../models/Inventory.js';
import TransferOrder from '../models/TransferOrder.js';
import ReplenishmentAlert from '../models/ReplenishmentAlert.js';
import ReplenishmentRequest from '../models/ReplenishmentRequest.js';

// Product list matching frontend
const PRODUCTS = [
  { id: 'PROD-001', name: 'Casual T-Shirt' },
  { id: 'PROD-002', name: 'Classic Denim Jeans' },
  { id: 'PROD-003', name: 'Hooded Sweatshirt' },
  { id: 'PROD-004', name: 'Chino Pants' },
  { id: 'PROD-005', name: 'Polo Shirt' },
  { id: 'PROD-006', name: 'Jogger Pants' }
];
// 默认用于订单模块的“门店”库存位置（不影响区域/总仓调拨）
export const DEFAULT_STORE_LOCATION_ID = 'STORE-DEFAULT';

// 生成调拨单号（与 transferController 中逻辑保持一致）
const genTransferId = () => {
  const now = new Date();
  return `TRF-${now.toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 900 + 100)}`;
};

// 初始化库存：为每个商品在总仓创建一条记录（仅在首次运行时）
// 插入位置：保持为 /api/inventory/initialize 路由对应的处理函数
export const initializeInventory = async (req, res, next) => {
  try {
    const existingCount = await Inventory.countDocuments();
    if (existingCount > 0) {
      return res.json({ message: 'Inventory already initialized', alreadyExists: true });
    }

    const docs = PRODUCTS.map((product) => ({
      productId: product.id,
      productName: product.name,
      locationId: 'WH-CENTRAL',
      locationName: 'Central Warehouse',
      region: 'ALL',
      totalStock: 200,
      available: 200,
      minThreshold: 10,
      maxThreshold: 500
    }));

    await Inventory.insertMany(docs);
    res.json({ message: 'Inventory initialized successfully', alreadyExists: false });
  } catch (error) {
    next(error);
  }
};

// 获取全部库存（仅用于后台统计界面）
export const getInventory = async (req, res, next) => {
  try {
    const inventory = await Inventory.find().sort({ productId: 1, locationId: 1 });
    res.json(inventory);
  } catch (error) {
    next(error);
  }
};

// 根据位置获取库存：GET /api/inventory/:locationId
export const getInventoryByLocation = async (req, res, next) => {
  try {
    const { locationId } = req.params;
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: 'Login required' });
    }

    // 总仓库管理员可以访问所有位置
    if (user.role === 'centralManager') {
      const items = await Inventory.find({ locationId }).sort({ productId: 1 });
      return res.json(items);
    }

    // 简单权限：如果用户声明了 accessibleLocationIds，则只允许访问其中的仓库/门店
    if (
      Array.isArray(user.accessibleLocationIds) &&
      user.accessibleLocationIds.length > 0 &&
      !user.accessibleLocationIds.includes(locationId)
    ) {
      return res.status(403).json({ message: 'No permission to access this location inventory' });
    }

    const items = await Inventory.find({ locationId }).sort({ productId: 1 });
    res.json(items);
  } catch (error) {
    next(error);
  }
};

// 按商品 + 位置查询单条库存
export const getInventoryByProductAndLocation = async (productId, locationId) => {
  try {
    return await Inventory.findOne({ productId, locationId });
  } catch (error) {
    throw error;
  }
};

// 通用库存更新函数：在指定位置增减 available，同时做上下限校验
export const updateInventoryQuantity = async (productId, quantityChange, locationId = DEFAULT_STORE_LOCATION_ID) => {
  try {
    let inventory = await Inventory.findOne({ productId, locationId });

    // 不存在则初始化一条记录
    if (!inventory) {
      const product = PRODUCTS.find((p) => p.id === productId);
      if (!product) {
        throw new Error(`Product ${productId} not found in product list`);
      }

      inventory = await Inventory.create({
        productId: product.id,
        productName: product.name,
        locationId,
        totalStock: 200,
        available: 200,
        minThreshold: 0,
        maxThreshold: 200
      });
    }

    const newAvailable = inventory.available + quantityChange;
    if (newAvailable < 0) {
      throw new Error(
        `Insufficient inventory for product ${productId} at ${locationId}. Available: ${inventory.available}, Requested: ${-quantityChange}`
      );
    }
    if (typeof inventory.totalStock === 'number' && newAvailable > inventory.totalStock) {
      throw new Error(
        `Cannot exceed total stock for product ${productId} at ${locationId}. Total Stock: ${inventory.totalStock}, Requested: ${
          inventory.available + quantityChange
        }`
      );
    }

    const oldAvailable = inventory.available;
    inventory.available = newAvailable;
    inventory.lastUpdated = new Date();
    await inventory.save();

    // 自动为分仓库（WH-EAST, WH-WEST, WH-NORTH, WH-SOUTH）生成向总仓库的补货申请：
    // 条件：
    //   - 位置为分仓库（WH-EAST, WH-WEST, WH-NORTH, WH-SOUTH）
    //   - 可用库存低于 totalStock * 0.3（30%阈值）
    //   - 且当前没有该商品、该仓库的待处理/处理中补货申请，避免重复创建
    const regionalWarehouses = ['WH-EAST', 'WH-WEST', 'WH-NORTH', 'WH-SOUTH'];
    if (regionalWarehouses.includes(locationId)) {
      const totalStock = inventory.totalStock || 200;
      const threshold30Percent = totalStock * 0.3;
      
      if (inventory.available < threshold30Percent) {
        const targetStock = totalStock * 0.9;
        const replenishQty = Math.max(0, Math.ceil(targetStock - inventory.available));

        if (replenishQty > 0) {
          // 检查是否已有未完成的补货申请
          const existingRequest = await ReplenishmentRequest.findOne({
            productId: productId,
            warehouseId: locationId,
            status: { $in: ['PENDING', 'PROCESSING', 'APPROVED'] }
          });

          if (!existingRequest) {
            // 创建补货预警
            const alertId = `ALERT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            await ReplenishmentAlert.findOneAndUpdate(
              { productId, warehouseId: locationId },
              {
                alertId,
                productId,
                productName: inventory.productName || productId,
                stock: inventory.available,
                suggested: replenishQty,
                trigger: `Regional warehouse inventory below 30% threshold (current: ${inventory.available} < ${Math.ceil(threshold30Percent)})`,
                warehouseId: locationId,
                warehouseName: inventory.locationName || locationId,
                level: inventory.available < threshold30Percent * 0.5 ? 'danger' : 'warning',
                levelLabel: inventory.available < threshold30Percent * 0.5 ? 'Urgent' : 'Warning',
                threshold: Math.ceil(threshold30Percent),
                shortageQty: Math.max(0, Math.ceil(threshold30Percent - inventory.available))
              },
              { upsert: true, new: true }
            );

            // 自动创建补货申请
            const genRequestId = () => {
              const now = new Date();
              return `REQ-${now.toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 900 + 100)}`;
            };

            const now = new Date();
            await ReplenishmentRequest.create({
              requestId: genRequestId(),
              productId,
              productName: inventory.productName || productId,
              vendor: 'Central Warehouse',
              quantity: replenishQty,
              deliveryDate: new Date(now.getTime() + 3 * 24 * 3600 * 1000), // 3天后
              remark: `Auto-request: replenish ${replenishQty} units to reach target stock of ${Math.ceil(targetStock)}`,
              warehouseId: locationId,
              warehouseName: inventory.locationName || locationId,
              reason: `Regional warehouse inventory below 30% threshold (current: ${inventory.available} < ${Math.ceil(threshold30Percent)})`,
              status: 'PENDING',
              progress: [
                {
                  title: 'Replenishment Alert Generated',
                  desc: `${inventory.productName || productId} below threshold at ${inventory.locationName || locationId}`,
                  status: 'completed',
                  timestamp: now
                },
                {
                  title: 'Application Auto-Submitted',
                  desc: `${inventory.locationName || locationId} auto-requested ${replenishQty} units from Central Warehouse`,
                  status: 'completed',
                  timestamp: now
                },
                {
                  title: 'Waiting for Approval',
                  desc: 'Awaiting central approval',
                  status: 'processing',
                  timestamp: now
                }
              ]
            });

            console.log(
              `Auto replenishment request created: productId=${productId}, warehouseId=${locationId}, quantity=${replenishQty}, currentStock=${inventory.available}`
            );
          }
        }
      }
    }

    // 自动为所有门店创建低库存警报和补货调拨单：
    // 条件：
    //   - 位置为门店（STORE-*）
    //   - 可用库存低于 totalStock * 0.3（30%阈值）
    //   - 创建 ReplenishmentAlert 以便区域仓库管理员看到
    //   - 创建或更新调拨单，从对应的区域仓库调拨
    const allStores = [
      'STORE-EAST-01', 'STORE-EAST-02',
      'STORE-WEST-01', 'STORE-WEST-02',
      'STORE-NORTH-01', 'STORE-NORTH-02',
      'STORE-SOUTH-01', 'STORE-SOUTH-02'
    ];
    
    if (allStores.includes(locationId)) {
      const totalStock = inventory.totalStock || 200;
      const threshold30Percent = totalStock * 0.3;
      
      if (inventory.available < threshold30Percent) {
        // 确定对应的区域仓库
        let fromLocationId = 'WH-EAST';
        let fromLocationName = 'East Warehouse';
        if (locationId.startsWith('STORE-WEST')) {
          fromLocationId = 'WH-WEST';
          fromLocationName = 'West Warehouse';
        } else if (locationId.startsWith('STORE-NORTH')) {
          fromLocationId = 'WH-NORTH';
          fromLocationName = 'North Warehouse';
        } else if (locationId.startsWith('STORE-SOUTH')) {
          fromLocationId = 'WH-SOUTH';
          fromLocationName = 'South Warehouse';
        }
        
        const targetStock = totalStock * 0.9;
        const replenishQty = Math.max(0, Math.ceil(targetStock - inventory.available));

        console.log(
          `[Low Stock Alert] ${locationId}: productId=${productId}, available=${inventory.available}, threshold=${Math.ceil(threshold30Percent)}, replenishQty=${replenishQty}`
        );

        // 门店缺货时，只创建调拨单，不创建 ReplenishmentAlert
        // ReplenishmentAlert 只用于区域仓库向总仓库申请补货
        // 创建或更新调拨单
        if (replenishQty > 0) {
          // 查找是否有 PENDING 状态的调拨单（可以更新）
          const existingPendingTransfer = await TransferOrder.findOne({
            productSku: productId,
            toLocationId: locationId,
            fromLocationId: fromLocationId,
            status: 'PENDING'
          });

          if (existingPendingTransfer) {
            // 如果已有 PENDING 调拨单，更新数量（取更大的值，确保能补足）
            const newQuantity = Math.max(existingPendingTransfer.quantity, replenishQty);
            if (newQuantity !== existingPendingTransfer.quantity) {
              existingPendingTransfer.quantity = newQuantity;
              existingPendingTransfer.history.push({
                status: 'PENDING',
                note: `Updated quantity: ${existingPendingTransfer.quantity} → ${newQuantity} units (current stock: ${inventory.available})`,
                createdAt: new Date()
              });
              await existingPendingTransfer.save();
              console.log(
                `[Transfer Updated] transferId=${existingPendingTransfer.transferId}, productId=${productId}, quantity=${existingPendingTransfer.quantity} → ${newQuantity}`
              );
            } else {
              console.log(
                `[Transfer Exists] transferId=${existingPendingTransfer.transferId}, productId=${productId}, quantity=${existingPendingTransfer.quantity} (no update needed)`
              );
            }
          } else {
            // 如果没有 PENDING 调拨单，检查是否有 IN_TRANSIT 的
            const existingInTransitTransfer = await TransferOrder.findOne({
              productSku: productId,
              toLocationId: locationId,
              fromLocationId: fromLocationId,
              status: 'IN_TRANSIT'
            });

            if (existingInTransitTransfer) {
              console.log(
                `[In Transit Exists] transferId=${existingInTransitTransfer.transferId}, productId=${productId}, creating new PENDING transfer`
              );
            }

            const transferId = genTransferId();
            await TransferOrder.create({
              transferId,
              productSku: productId,
              productName: inventory.productName || productId,
              quantity: replenishQty,
              fromLocationId: fromLocationId,
              fromLocationName: fromLocationName,
              toLocationId: locationId,
              toLocationName: inventory.locationName || locationId,
              status: 'PENDING',
              history: [
                {
                  status: 'PENDING',
                  note: `Auto-created transfer: replenish ${replenishQty} units for low stock at ${locationId} (current: ${inventory.available})`,
                  createdAt: new Date()
                }
              ],
              inventoryUpdated: false,
              requestId: null
            });

            console.log(
              `[Transfer Created] transferId=${transferId}, productId=${productId}, from=${fromLocationId}, to=${locationId}, quantity=${replenishQty}, currentStock=${inventory.available}`
            );
          }
        }
      }
    }

    console.log(
      `Inventory updated: productId=${productId}, locationId=${locationId}, oldAvailable=${oldAvailable}, newAvailable=${inventory.available}, totalStock=${inventory.totalStock}`
    );
    return inventory;
  } catch (error) {
    console.error(`Error updating inventory for product ${productId} at ${locationId}:`, error);
    throw error;
  }
};

// 订单模块仍然可以调用的简化接口：默认门店库存
// 调用位置：server/src/controllers/orderController.js 中 shipOrder / approveAfterSales
export const decreaseInventory = async (productId, quantity) => {
  return await updateInventoryQuantity(productId, -quantity, DEFAULT_STORE_LOCATION_ID);
};

export const increaseInventory = async (productId, quantity) => {
  return await updateInventoryQuantity(productId, quantity, DEFAULT_STORE_LOCATION_ID);
};

// PATCH /api/inventory/update 用于销售出货场景（根据前端传入的位置）
export const updateInventoryForSale = async (req, res, next) => {
  try {
    const { productId, locationId, quantityChange } = req.body;

    if (!productId || !locationId || !quantityChange) {
      return res.status(400).json({ message: 'productId, locationId and quantityChange are required' });
    }

    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: 'Login required' });
    }

    const inventory = await updateInventoryQuantity(productId, quantityChange, locationId);
    res.json(inventory);
  } catch (error) {
    next(error);
  }
};

// PATCH /api/inventory/transfer 仓库/门店之间调拨
// 事务逻辑：减少 fromLocation 库存，增加 toLocation 库存，要么全部成功，要么全部回滚
export const transferInventory = async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    const { productId, fromLocationId, toLocationId, quantity } = req.body;

    if (!productId || !fromLocationId || !toLocationId || !quantity) {
      return res.status(400).json({ message: 'productId, fromLocationId, toLocationId and quantity are required' });
    }

    if (fromLocationId === toLocationId) {
      return res.status(400).json({ message: 'fromLocationId and toLocationId cannot be the same' });
    }

    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: 'Login required' });
    }

    // 简化权限控制：仅允许区域/总仓管理员进行调拨
    if (!['regionalManager', 'centralManager', 'warehouse'].includes(user.role)) {
      return res.status(403).json({ message: 'Only warehouse / regional / central managers can transfer inventory' });
    }

    await session.withTransaction(async () => {
      // 1. 从来源位置扣减库存
      const fromInventory = await Inventory.findOne({ productId, locationId: fromLocationId }).session(session);
      if (!fromInventory) {
        throw new Error(`Inventory not found for product ${productId} at ${fromLocationId}`);
      }

      if (fromInventory.available < quantity) {
        throw new Error(
          `Insufficient inventory at ${fromLocationId} for product ${productId}. Available: ${fromInventory.available}, Requested: ${quantity}`
        );
      }

      fromInventory.available -= quantity;
      fromInventory.lastUpdated = new Date();
      await fromInventory.save({ session });

      // 2. 目标位置增加库存（不存在则初始化）
      let toInventory = await Inventory.findOne({ productId, locationId: toLocationId }).session(session);

      if (!toInventory) {
        const product = PRODUCTS.find((p) => p.id === productId);
        if (!product) {
          throw new Error(`Product ${productId} not found in product list`);
        }

        toInventory = new Inventory({
          productId: productId,
          productName: product ? product.name : fromInventory.productName,
          locationId: toLocationId,
          totalStock: fromInventory.totalStock,
          available: 0,
          minThreshold: fromInventory.minThreshold,
          maxThreshold: fromInventory.maxThreshold
        });
      }

      toInventory.available += quantity;
      if (typeof toInventory.totalStock === 'number' && toInventory.available > toInventory.totalStock) {
        throw new Error(
          `Cannot exceed total stock for product ${productId} at ${toLocationId}. Total Stock: ${toInventory.totalStock}, Requested: ${toInventory.available}`
        );
      }

      toInventory.lastUpdated = new Date();
      await toInventory.save({ session });

      res.json({
        message: 'Transfer completed',
        productId,
        quantity,
        from: {
          locationId: fromLocationId,
          available: fromInventory.available
        },
        to: {
          locationId: toLocationId,
          available: toInventory.available
        }
      });
    });
  } catch (error) {
    next(error);
  } finally {
    session.endSession();
  }
};

