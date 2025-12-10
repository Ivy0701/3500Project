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
// Default for "store" inventory location used by the order module (does not affect regional/central warehouse transfers)
export const DEFAULT_STORE_LOCATION_ID = 'STORE-DEFAULT';

// Generate transfer order number (consistent with logic in transferController)
const genTransferId = () => {
  const now = new Date();
  return `TRF-${now.toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 900 + 100)}`;
};

// Initialize inventory: Create a record for each product in the central warehouse (only when running for the first time)
// Insert position: Keep the corresponding processing function for the /api/inventory/initialize route
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

// Get all inventory (only used for backend statistics interface)
export const getInventory = async (req, res, next) => {
  try {
    const inventory = await Inventory.find().sort({ productId: 1, locationId: 1 });
    res.json(inventory);
  } catch (error) {
    next(error);
  }
};

// Get inventory by location: GET /api/inventory/:locationId
export const getInventoryByLocation = async (req, res, next) => {
  try {
    const { locationId } = req.params;
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: 'Login required' });
    }

    // Central warehouse managers can access all locations
    if (user.role === 'centralManager') {
      const items = await Inventory.find({ locationId }).sort({ productId: 1 });
      return res.json(items);
    }

    // Simple permission: If the user declares accessibleLocationIds, only allow access to the warehouses/stores within
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

// Query single inventory by product + location
export const getInventoryByProductAndLocation = async (productId, locationId) => {
  try {
    return await Inventory.findOne({ productId, locationId });
  } catch (error) {
    throw error;
  }
};

// General inventory update function: Increase/decrease available at the specified location, and perform upper/lower limit checks
export const updateInventoryQuantity = async (productId, quantityChange, locationId = DEFAULT_STORE_LOCATION_ID) => {
  try {
    let inventory = await Inventory.findOne({ productId, locationId });

    // If not exists, initialize a record
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

    // Automatically generate replenishment applications to the central warehouse for regional warehouses (WH-EAST, WH-WEST, WH-NORTH, WH-SOUTH):
    // Conditions:
    //   - Location is a regional warehouse (WH-EAST, WH-WEST, WH-NORTH, WH-SOUTH)
    //   - Available stock is less than 30% of total stock (30% threshold)
    //   - And there is no pending/processing replenishment application for this product/warehouse, to avoid duplicate creation
    const regionalWarehouses = ['WH-EAST', 'WH-WEST', 'WH-NORTH', 'WH-SOUTH'];
    if (regionalWarehouses.includes(locationId)) {
      const totalStock = inventory.totalStock || 200;
      const threshold30Percent = totalStock * 0.3;
      
      if (inventory.available < threshold30Percent) {
        const targetStock = totalStock * 0.9;
        const replenishQty = Math.max(0, Math.ceil(targetStock - inventory.available));

        if (replenishQty > 0) {
          // Check if there is an incomplete replenishment application
          const existingRequest = await ReplenishmentRequest.findOne({
            productId: productId,
            warehouseId: locationId,
            status: { $in: ['PENDING', 'PROCESSING', 'APPROVED'] }
          });

          if (!existingRequest) {
            // Create replenishment alert
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

            // Automatically create replenishment application
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
              deliveryDate: new Date(now.getTime() + 3 * 24 * 3600 * 1000), // 3 days later
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

    // Automatically create low stock alerts and replenishment transfer orders for all stores:
    // Conditions:
    //   - Location is a store (STORE-*)
    //   - Available stock is less than 30% of total stock (30% threshold)
    //   - Create ReplenishmentAlert so that regional warehouse managers can see it
    //   - Create or update transfer order, from the corresponding regional warehouse
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
        // Determine the corresponding regional warehouse
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

        // When the store is out of stock, only create transfer order, not create ReplenishmentAlert
        // ReplenishmentAlert is only used for regional warehouses to apply for replenishment to the central warehouse
        // Create or update transfer order
        if (replenishQty > 0) {
          // Check if there is a PENDING status transfer order (can be updated)
          const existingPendingTransfer = await TransferOrder.findOne({
            productSku: productId,
            toLocationId: locationId,
            fromLocationId: fromLocationId,
            status: 'PENDING'
          });

          if (existingPendingTransfer) {
            // If there is a PENDING transfer order, update the quantity (take the larger value, ensure it can be replenished)
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
            // If there is no PENDING transfer order, check if there is a IN_TRANSIT transfer order
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

// Simplified interface that the order module can still call: default store inventory
// Call location: shipOrder / approveAfterSales in server/src/controllers/orderController.js
export const decreaseInventory = async (productId, quantity) => {
  return await updateInventoryQuantity(productId, -quantity, DEFAULT_STORE_LOCATION_ID);
};

export const increaseInventory = async (productId, quantity) => {
  return await updateInventoryQuantity(productId, quantity, DEFAULT_STORE_LOCATION_ID);
};

// PATCH /api/inventory/update for sales shipment scenario (based on the position passed in by the frontend)
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

// PATCH /api/inventory/transfer Warehouse/store transfer
// Transaction logic: Decrease fromLocation inventory, increase toLocation inventory, either all succeed or all rollback
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

    // Simplified permission control: Only allow regional/central warehouse managers to transfer
    if (!['regionalManager', 'centralManager', 'warehouse'].includes(user.role)) {
      return res.status(403).json({ message: 'Only warehouse / regional / central managers can transfer inventory' });
    }

    await session.withTransaction(async () => {
      // 1. Decrease inventory from the source location
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

      // 2. Increase inventory at the target location (initialize if not exists)
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

