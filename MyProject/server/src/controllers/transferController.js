import mongoose from 'mongoose';
import TransferOrder from '../models/TransferOrder.js';
import ReceivingSchedule from '../models/ReceivingSchedule.js';
import ReplenishmentRequest from '../models/ReplenishmentRequest.js';
import ReplenishmentAlert from '../models/ReplenishmentAlert.js';
import Inventory from '../models/Inventory.js';
import { adjustInventory } from '../services/inventoryService.js';
const genTransferId = () => {
  const now = new Date();
  return `TRF-${now.toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 900 + 100)}`;
};

export const createTransferOrder = async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    const {
      productSku,
      productName,
      quantity,
      fromLocationId,
      fromLocationName,
      toLocationId,
      toLocationName,
      requestId
    } = req.body;

    if (!productSku || !quantity || !fromLocationId || !toLocationId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (quantity <= 0) {
      return res.status(400).json({ message: 'Quantity must be greater than 0' });
    }

    const transferId = genTransferId();

    let transferDoc;
    await session.withTransaction(async () => {
      // 在创建调拨单时就从fromLocationId减少库存
      // 这样可以确保从选择的仓库立即扣除库存
      console.log(`[Transfer] Reducing inventory at source: ${fromLocationId}, product: ${productSku}, quantity: -${quantity}`);
      await adjustInventory({
        locationId: fromLocationId,
        locationName: fromLocationName || fromLocationId,
        productSku: productSku,
        productName: productName,
        delta: -quantity,
        session
      });

      transferDoc = await TransferOrder.create(
        [
          {
            transferId,
            productSku,
            productName,
            quantity,
            fromLocationId,
            fromLocationName: fromLocationName || fromLocationId,
            toLocationId,
            toLocationName: toLocationName || toLocationId,
            status: 'IN_TRANSIT',
            history: [
              { status: 'PENDING', note: 'Transfer order created', createdAt: new Date() },
              { status: 'IN_TRANSIT', note: 'Dispatched', createdAt: new Date() }
            ],
            inventoryUpdated: true, // 已在创建时更新库存
            requestId: requestId || null
          }
        ],
        { session }
      );

      // 使用fromLocationName作为supplier，而不是硬编码'Central Warehouse'
      await ReceivingSchedule.create(
        [
          {
            planNo: transferId,
            supplier: fromLocationName || fromLocationId,
            eta: new Date(Date.now() + 2 * 24 * 3600 * 1000),
            dock: fromLocationId === 'WH-CENTRAL' ? 'Central-Dock' : `${fromLocationId}-Dock`,
            items: 1,
            productSku,
            productName,
            quantity,
            storageLocationId: toLocationId,
            qualityLevel: 'A',
            status: 'IN_TRANSIT'
          }
        ],
        { session }
      );

      if (requestId) {
        const now = new Date();
        await ReplenishmentRequest.findOneAndUpdate(
          { requestId },
          {
            status: 'IN_TRANSIT',
            $push: {
              progress: {
                $each: [
                  {
                    title: 'Transfer Order Created',
                    desc: `${quantity} units of ${productSku} allocated from ${fromLocationName || fromLocationId} to ${toLocationName || toLocationId}`,
                    status: 'completed',
                    timestamp: now
                  },
                  {
                    title: 'Transfer Order Dispatched',
                    desc: `Transfer order ${transferId} dispatched to ${toLocationName || toLocationId}`,
                    status: 'completed',
                    timestamp: now
                  },
                  {
                    title: 'Replenishment In Transit',
                    desc: `SKU ${productSku} is en route to ${toLocationName || toLocationId}`,
                    status: 'processing',
                    timestamp: now
                  }
                ]
              }
            }
          },
          { session, new: true }
        );
      }
    });

    res.status(201).json(transferDoc[0]);
  } catch (error) {
    next(error);
  } finally {
    session.endSession();
  }
};

const formatDate = (value) => (value ? new Date(value) : null);

export const getTransferOrders = async (req, res, next) => {
  try {
    const { locationId, status } = req.query;
    const user = req.user;
    const filter = {};

    // 如果是区域仓库管理员，根据用户的 assignedLocationId 过滤
    if (user && user.role === 'regionalManager') {
      const userLocationId = locationId || user.assignedLocationId;
      if (userLocationId) {
        // 区域仓库管理员可以看到从自己仓库发出的调拨单（fromLocationId）或发到自己仓库的调拨单（toLocationId）
        filter.$or = [{ fromLocationId: userLocationId }, { toLocationId: userLocationId }];
      } else if (user.accessibleLocationIds && user.accessibleLocationIds.length > 0) {
        // 如果没有 assignedLocationId，使用 accessibleLocationIds
        const warehouseIds = user.accessibleLocationIds.filter(id => id.startsWith('WH-'));
        if (warehouseIds.length > 0) {
          filter.$or = warehouseIds.flatMap(id => [
            { fromLocationId: id },
            { toLocationId: id }
          ]);
        }
      }
    } else if (locationId) {
      // 其他角色或明确指定 locationId 时使用 locationId
      filter.$or = [{ fromLocationId: locationId }, { toLocationId: locationId }];
    }
    // 中央管理员可以看到所有调拨单，不需要过滤

    if (status) {
      filter.status = status;
    }

    const transfers = await TransferOrder.find(filter).sort({ createdAt: -1 });
    res.json(transfers);
  } catch (error) {
    next(error);
  }
};

export const dispatchTransferOrder = async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    const { transferId } = req.params;
    const { carrier, departure, remark } = req.body;

    const transfer = await TransferOrder.findOne({ transferId });
    if (!transfer) {
      return res.status(404).json({ message: 'Transfer order not found' });
    }

    if (transfer.status !== 'PENDING') {
      return res.status(400).json({ message: 'Only pending transfer orders can be dispatched' });
    }

    // Validate required fields
    if (!carrier || !carrier.trim()) {
      return res.status(400).json({ message: 'Carrier is required' });
    }
    if (!departure) {
      return res.status(400).json({ message: 'Departure time is required' });
    }

    await session.withTransaction(async () => {
      // 1. 减少来源仓库（区域仓库）的库存
      await adjustInventory({
        locationId: transfer.fromLocationId,
        locationName: transfer.fromLocationName,
        productSku: transfer.productSku,
        productName: transfer.productName,
        delta: -transfer.quantity,
        session
      });

      // 2. 增加目标仓库（门店）的库存
      await adjustInventory({
        locationId: transfer.toLocationId,
        locationName: transfer.toLocationName,
        productSku: transfer.productSku,
        productName: transfer.productName,
        delta: transfer.quantity,
        session
      });

      // 3. 检查区域仓库库存是否小于最大库存量的30%（1000*0.3=300）
      // 如果是，创建ReplenishmentAlert
      const regionalWarehouses = ['WH-EAST', 'WH-WEST', 'WH-NORTH', 'WH-SOUTH'];
      if (regionalWarehouses.includes(transfer.fromLocationId)) {
        const inventory = await Inventory.findOne({
          productId: transfer.productSku,
          locationId: transfer.fromLocationId
        }).session(session);

        if (inventory) {
          const maxStock = inventory.totalStock || 1000; // 默认最大库存为1000
          const threshold = maxStock * 0.3; // 30%阈值

          if (inventory.available < threshold) {
            const alertId = `ALERT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            const suggestedQty = Math.ceil(maxStock * 0.9 - inventory.available); // 建议补到90%

            await ReplenishmentAlert.findOneAndUpdate(
              { productId: transfer.productSku, warehouseId: transfer.fromLocationId },
              {
                alertId,
                productId: transfer.productSku,
                productName: transfer.productName || transfer.productSku,
                stock: inventory.available,
                suggested: suggestedQty > 0 ? suggestedQty : Math.ceil(threshold),
                trigger: `Regional warehouse inventory below 30% of max stock (${inventory.available} < ${threshold})`,
                warehouseId: transfer.fromLocationId,
                warehouseName: transfer.fromLocationName || transfer.fromLocationId,
                level: inventory.available < threshold * 0.5 ? 'danger' : 'warning',
                levelLabel: inventory.available < threshold * 0.5 ? 'Urgent' : 'Warning',
                threshold: threshold
              },
              { upsert: true, new: true, session }
            );

            console.log(
              `[Regional Warehouse Low Stock Alert] Created: productId=${transfer.productSku}, warehouseId=${transfer.fromLocationId}, available=${inventory.available}, threshold=${threshold}`
            );
          }
        }
      }

      transfer.status = 'IN_TRANSIT';
      transfer.dispatchInfo = {
        carrier: carrier.trim(),
        departure: formatDate(departure),
        remark: remark || ''
      };
      transfer.history.push({
        status: 'IN_TRANSIT',
        note: `Dispatched via ${carrier || 'N/A'}`
      });

      await transfer.save({ session });
    });

    res.json(transfer);
  } catch (error) {
    next(error);
  } finally {
    session.endSession();
  }
};

