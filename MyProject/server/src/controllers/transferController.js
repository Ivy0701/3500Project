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
      // When creating the transfer order, reduce the inventory at fromLocationId
      // This ensures that the inventory is immediately deducted from the selected warehouse
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
            inventoryUpdated: true, // Inventory has been updated when the transfer order is created
            requestId: requestId || null
          }
        ],
        { session }
      );

      // Use fromLocationName as supplier, instead of hardcoding 'Central Warehouse'
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

    // If the user is a regional warehouse manager, filter based on the user's assignedLocationId
    if (user && user.role === 'regionalManager') {
      const userLocationId = locationId || user.assignedLocationId;
      if (userLocationId) {
        // Regional warehouse managers can see transfer orders sent from their warehouse (fromLocationId) or received at their warehouse (toLocationId)
        filter.$or = [{ fromLocationId: userLocationId }, { toLocationId: userLocationId }];
      } else if (user.accessibleLocationIds && user.accessibleLocationIds.length > 0) {
        // If there is no assignedLocationId, use accessibleLocationIds
        const warehouseIds = user.accessibleLocationIds.filter(id => id.startsWith('WH-'));
        if (warehouseIds.length > 0) {
          filter.$or = warehouseIds.flatMap(id => [
            { fromLocationId: id },
            { toLocationId: id }
          ]);
        }
      }
    } else if (locationId) {
      // When other roles or explicitly specify locationId, use locationId
      filter.$or = [{ fromLocationId: locationId }, { toLocationId: locationId }];
    }
    // Central warehouse managers can see all transfer orders, no filtering needed

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
      // 1. Reduce the inventory at the source warehouse (regional warehouse)
      await adjustInventory({
        locationId: transfer.fromLocationId,
        locationName: transfer.fromLocationName,
        productSku: transfer.productSku,
        productName: transfer.productName,
        delta: -transfer.quantity,
        session
      });

      // 2. Increase the inventory at the target warehouse (store)
      await adjustInventory({
        locationId: transfer.toLocationId,
        locationName: transfer.toLocationName,
        productSku: transfer.productSku,
        productName: transfer.productName,
        delta: transfer.quantity,
        session
      });

      // 3. Check if the regional warehouse inventory is less than 30% of the maximum inventory (1000*0.3=300)
      // If so, create a ReplenishmentAlert
      const regionalWarehouses = ['WH-EAST', 'WH-WEST', 'WH-NORTH', 'WH-SOUTH'];
      if (regionalWarehouses.includes(transfer.fromLocationId)) {
        const inventory = await Inventory.findOne({
          productId: transfer.productSku,
          locationId: transfer.fromLocationId
        }).session(session);

        if (inventory) {
          const maxStock = inventory.totalStock || 1000; // Default maximum stock is 1000
          const threshold = maxStock * 0.3; // 30% threshold

          if (inventory.available < threshold) {
            const alertId = `ALERT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            const suggestedQty = Math.ceil(maxStock * 0.9 - inventory.available); // Suggest to replenish to 90%

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

