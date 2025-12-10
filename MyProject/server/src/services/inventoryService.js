import Inventory from '../models/Inventory.js';
import ReplenishmentAlert from '../models/ReplenishmentAlert.js';
import ReplenishmentRequest from '../models/ReplenishmentRequest.js';
import TransferOrder from '../models/TransferOrder.js';

// Regional warehouse list constant
const regionalWarehouses = ['WH-EAST', 'WH-WEST', 'WH-NORTH', 'WH-SOUTH'];

const genRequestId = () => {
  const now = new Date();
  return `REQ-${now.toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 900 + 100)}`;
};

const genTransferId = () => {
  const now = new Date();
  return `TRF-${now.toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 900 + 100)}`;
};

const getWarehouseForStore = (locationId) => {
  if (!locationId || !locationId.startsWith('STORE-')) return null;
  if (locationId.includes('EAST')) return { warehouseId: 'WH-EAST', warehouseName: 'East Warehouse' };
  if (locationId.includes('WEST')) return { warehouseId: 'WH-WEST', warehouseName: 'West Warehouse' };
  if (locationId.includes('NORTH')) return { warehouseId: 'WH-NORTH', warehouseName: 'North Warehouse' };
  if (locationId.includes('SOUTH')) return { warehouseId: 'WH-SOUTH', warehouseName: 'South Warehouse' };
  return null;
};

export const adjustInventory = async ({
  productSku,
  productName,
  locationId,
  locationName,
  delta,
  session
}) => {
  if (!productSku || !locationId || !delta) {
    throw new Error('productSku, locationId and delta are required for inventory adjustment');
  }

  const options = {
    new: true,
    upsert: true,
    setDefaultsOnInsert: true
  };

  if (session) {
    options.session = session;
  }

  // Set the correct totalStock based on the location type
  const isRegionalWarehouse = regionalWarehouses.includes(locationId);
  const isStore = locationId.startsWith('STORE-');
  
  let defaultTotalStock = 200;
  let defaultMinThreshold = 0;
  let defaultMaxThreshold = 500;
  
  if (isRegionalWarehouse) {
    defaultTotalStock = 1000;
    defaultMinThreshold = 100;
    defaultMaxThreshold = 2000;
  } else if (isStore) {
    defaultTotalStock = 200;
    defaultMinThreshold = 60;
    defaultMaxThreshold = 200;
  }
  // Central warehouse keep default value (200, but should be larger in reality, here for compatibility)

  const inventory = await Inventory.findOneAndUpdate(
    { productId: productSku, locationId },
    {
      $inc: { available: delta },
      $set: {
        lastUpdated: new Date(),
        productName: productName || productSku,
        locationName: locationName || locationId
      },
      $setOnInsert: {
        productId: productSku,
        locationId,
        totalStock: defaultTotalStock,
        minThreshold: defaultMinThreshold,
        maxThreshold: defaultMaxThreshold
      }
    },
    options
  );

  if (inventory.available < 0) {
    throw new Error(`Inventory cannot be negative for ${productSku} at ${locationId}`);
  }
  
  // Check if the inventory exceeds totalStock (for regional warehouses and stores)
  if (typeof inventory.totalStock === 'number' && inventory.available > inventory.totalStock) {
    throw new Error(
      `Cannot exceed total stock for product ${productSku} at ${locationId}. Total Stock: ${inventory.totalStock}, Available: ${inventory.available}`
    );
  }

  // Automatic replenishment trigger: only effective for store locations, generate replenishment requests + alerts for the corresponding regional warehouse when available < 60
  // Create transfer orders from regional warehouses to stores (TransferOrder)
  const storeMapping = getWarehouseForStore(locationId);
  if (storeMapping && inventory.available < 60) {
    const { warehouseId, warehouseName } = storeMapping;
    const totalStock = inventory.totalStock || 200;
    const threshold30Percent = totalStock * 0.3; // 60 for stores with totalStock=200

    // 1. Create transfer orders from regional warehouses to stores (TransferOrder)
    if (inventory.available < threshold30Percent) {
      const targetStock = totalStock * 0.9;
      const replenishQty = Math.max(0, Math.ceil(targetStock - inventory.available));

      if (replenishQty > 0) {
        // Check if there is a PENDING status transfer order
        const existingPendingTransfer = await TransferOrder.findOne({
          productSku: productSku,
          toLocationId: locationId,
          fromLocationId: warehouseId,
          status: 'PENDING'
        });

        if (!existingPendingTransfer) {
          // Check if there is a IN_TRANSIT status transfer order
          const existingInTransitTransfer = await TransferOrder.findOne({
            productSku: productSku,
            toLocationId: locationId,
            fromLocationId: warehouseId,
            status: 'IN_TRANSIT'
          });

          if (!existingInTransitTransfer) {
            // Create new transfer order
            const transferId = genTransferId();
            const createTransfer = TransferOrder.create(
              [
                {
                  transferId,
                  productSku: productSku,
                  productName: productName || productSku,
                  quantity: replenishQty,
                  fromLocationId: warehouseId,
                  fromLocationName: warehouseName,
                  toLocationId: locationId,
                  toLocationName: locationName || locationId,
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
                }
              ],
              session ? { session } : {}
            );

            console.log(
              `[Transfer Created via adjustInventory] transferId=${transferId}, productId=${productSku}, from=${warehouseId}, to=${locationId}, quantity=${replenishQty}, currentStock=${inventory.available}`
            );

            await createTransfer;
          }
        }
      }
    }

    // 2. Generate replenishment requests to the central warehouse for regional warehouses (if the regional warehouse inventory is also low)
    // Check if there is an incomplete replenishment application
    const baseFilter = {
      productId: productSku,
      warehouseId,
      status: { $in: ['PENDING', 'PROCESSING', 'APPROVED'] }
    };
    const reqQuery = ReplenishmentRequest.findOne(baseFilter);
    if (session) reqQuery.session(session);
    const existingReq = await reqQuery;

    if (!existingReq) {
      const quantity = 200 - inventory.available;
      const now = new Date();

      const createReq = ReplenishmentRequest.create(
        [
          {
            requestId: genRequestId(),
            productId: productSku,
            productName: productName || productSku,
            vendor: '',
            quantity: quantity > 0 ? quantity : 60,
            deliveryDate: new Date(now.getTime() + 3 * 24 * 3600 * 1000),
            remark: `Auto request from ${locationName || locationId}`,
            warehouseId,
            warehouseName,
            reason: 'Store inventory below 60',
            status: 'PENDING',
            progress: [
              {
                title: 'Replenishment Alert Generated',
                desc: `${productName || productSku} below threshold at ${locationName || locationId}`,
                status: 'completed',
                timestamp: now
              },
              {
                title: 'Application Submitted',
                desc: `${warehouseName} auto request ${quantity > 0 ? quantity : 60} units`,
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
          }
        ],
        session ? { session } : {}
      );

      const alertFilter = {
        productId: productSku,
        warehouseId
      };
      const targetStock = totalStock * 0.9;
      const suggestedQty = Math.max(0, Math.ceil(targetStock - inventory.available));

      const alertUpdate = {
        $set: {
          productName: productName || productSku,
          stock: inventory.available,
          suggested: suggestedQty,
          trigger: 'Store inventory below threshold',
          warehouseName,
          level: 'warning',
          levelLabel: 'Warning',
          threshold: 60
        }
      };
      const alertOptions = { upsert: true, new: true };
      if (session) alertOptions.session = session;
      const createAlert = ReplenishmentAlert.findOneAndUpdate(alertFilter, alertUpdate, alertOptions);

      await Promise.all([createReq, createAlert]);
    }
  }

  // Check if the regional warehouse inventory is below 30%, if so, create replenishment alert
  const targetProducts = ['PROD-001', 'PROD-002', 'PROD-003', 'PROD-004', 'PROD-005', 'PROD-006'];
  
  if (regionalWarehouses.includes(locationId) && targetProducts.includes(productSku)) {
    if (inventory.totalStock > 0) {
      const threshold30Percent = inventory.totalStock * 0.3;
      
      if (inventory.available < threshold30Percent) {
        // Check if there is an incomplete replenishment application
        const baseFilter = {
          productId: productSku,
          warehouseId: locationId,
          status: { $in: ['PENDING', 'PROCESSING', 'APPROVED'] }
        };
        const reqQuery = ReplenishmentRequest.findOne(baseFilter);
        if (session) reqQuery.session(session);
        const existingReq = await reqQuery;
        
        if (!existingReq) {
          const alertId = `ALERT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
          const suggestedQty = Math.ceil(inventory.totalStock * 0.9 - inventory.available);
          const shortageQty = Math.ceil(threshold30Percent - inventory.available);
          
          const alertFilter = {
            productId: productSku,
            warehouseId: locationId
          };
          const alertUpdate = {
            $set: {
              alertId,
              productId: productSku,
              productName: productName || productSku,
              stock: inventory.available,
              suggested: suggestedQty > 0 ? suggestedQty : Math.ceil(threshold30Percent),
              trigger: `Regional warehouse inventory below 30% of total stock (current: ${inventory.available} < ${Math.ceil(threshold30Percent)})`,
              warehouseId: locationId,
              warehouseName: locationName || locationId,
              level: inventory.available < threshold30Percent * 0.5 ? 'danger' : 'warning',
              levelLabel: inventory.available < threshold30Percent * 0.5 ? 'Urgent' : 'Warning',
              threshold: Math.ceil(threshold30Percent),
              shortageQty: shortageQty > 0 ? shortageQty : 0
            }
          };
          const alertOptions = { upsert: true, new: true };
          if (session) alertOptions.session = session;
          await ReplenishmentAlert.findOneAndUpdate(alertFilter, alertUpdate, alertOptions);
        }
      } else {
        // If the inventory has recovered, delete the corresponding alert
        const deleteQuery = ReplenishmentAlert.findOneAndDelete({ productId: productSku, warehouseId: locationId });
        if (session) deleteQuery.session(session);
        await deleteQuery;
      }
    }
  }

  return inventory;
};

