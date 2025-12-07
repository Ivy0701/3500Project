import mongoose from 'mongoose';
import ReceivingSchedule from '../models/ReceivingSchedule.js';
import ReceivingLog from '../models/ReceivingLog.js';
import TransferOrder from '../models/TransferOrder.js';
import ReplenishmentRequest from '../models/ReplenishmentRequest.js';
import { adjustInventory } from '../services/inventoryService.js';

const storageOptions = new Set([
  'WH-EAST',
  'WH-WEST',
  'WH-NORTH',
  'WH-SOUTH',
  'STORE-EAST-01',
  'STORE-EAST-02',
  'STORE-WEST-01',
  'STORE-WEST-02',
  'STORE-NORTH-01',
  'STORE-NORTH-02',
  'STORE-SOUTH-01',
  'STORE-SOUTH-02'
]);

export const getReceivingSchedules = async (req, res, next) => {
  try {
    const user = req.user;
    let filter = {};
    
    // 如果用户有 assignedLocationId，只返回目标位置为该位置的接收计划
    if (user?.assignedLocationId) {
      filter.storageLocationId = user.assignedLocationId;
    }
    
    const schedules = await ReceivingSchedule.find(filter).sort({ eta: 1 });
    res.json(schedules);
  } catch (error) {
    next(error);
  }
};

export const getReceivingLogs = async (_req, res, next) => {
  try {
    const logs = await ReceivingLog.find().sort({ timestamp: -1 }).limit(20);
    res.json(logs);
  } catch (error) {
    next(error);
  }
};

export const completeReceiving = async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    const { planNo } = req.params;
    const { received, storageLocationId, remark } = req.body;

    if (received == null) {
      return res.status(400).json({ message: 'Received quantity is required' });
    }

    if (!storageLocationId) {
      return res.status(400).json({ message: 'Storage location is required' });
    }

    if (!storageOptions.has(storageLocationId)) {
      return res.status(400).json({ message: 'Invalid storage location' });
    }

    const schedule = await ReceivingSchedule.findOne({ planNo });
    if (!schedule) {
      return res.status(404).json({ message: 'Receiving plan not found' });
    }

    let responsePayload;
    await session.withTransaction(async () => {
      const transfer = await TransferOrder.findOne({ transferId: planNo }).session(session);
      const isInternalTransfer = transfer && transfer.fromLocationId === 'WH-CENTRAL' && transfer.toLocationId.startsWith('WH-');
      
      // 如果是内部调拨（总仓库到区域仓库），在确认收货时更新库存
      if (isInternalTransfer && transfer && !transfer.inventoryUpdated) {
        // 1. 减少来源仓库（总仓库）的库存
        console.log(`[Receiving] Reducing inventory at source: ${transfer.fromLocationId}, product: ${schedule.productSku}, quantity: -${received}`);
        await adjustInventory({
          locationId: transfer.fromLocationId,
          locationName: transfer.fromLocationName || transfer.fromLocationId,
          productSku: schedule.productSku,
          productName: schedule.productName,
          delta: -received,
          session
        });
        
        // 2. 增加目标仓库（区域仓库）的库存
        console.log(`[Receiving] Increasing inventory at destination: ${storageLocationId}, product: ${schedule.productSku}, quantity: +${received}`);
        await adjustInventory({
          locationId: storageLocationId,
          locationName: storageLocationId,
          productSku: schedule.productSku,
          productName: schedule.productName,
          delta: received,
          session
        });
        
        transfer.inventoryUpdated = true;
        await transfer.save({ session });
      } else if (!isInternalTransfer) {
        // 外部供应商到仓库，只增加目标仓库库存
        await adjustInventory({
          locationId: storageLocationId,
          locationName: storageLocationId,
          productSku: schedule.productSku,
          productName: schedule.productName,
          delta: received,
          session
        });
      }

      schedule.status = 'ARRIVED';
      schedule.storageLocationId = storageLocationId;
      await schedule.save({ session });

      const log = await ReceivingLog.create(
        [
          {
            planNo,
            supplier: schedule.supplier,
            productSku: schedule.productSku,
            received,
            qualified: received, // 使用 received 作为 qualified
            storageLocationId,
            issue: '',
            remark: remark || '',
            status: 'success'
          }
        ],
        { session }
      );

      if (transfer) {
        transfer.status = 'COMPLETED';
        transfer.inventoryUpdated = true;
        transfer.history.push({
          status: 'COMPLETED',
          note: 'Receiving confirmed by region',
          createdAt: new Date()
        });
        await transfer.save({ session });

        if (transfer.requestId) {
          await ReplenishmentRequest.findOneAndUpdate(
            { requestId: transfer.requestId },
            {
              status: 'ARRIVED',
              $push: {
                progress: {
                  title: 'Goods Arrived',
                  desc: `${storageLocationId} received ${received} units`,
                  status: 'completed',
                  timestamp: new Date()
                }
              }
            },
            { session }
          );
        }
      }

      responsePayload = {
        schedule,
        log: log[0],
        transfer
      };
    });

    res.json(responsePayload);
  } catch (error) {
    next(error);
  } finally {
    session.endSession();
  }
};

