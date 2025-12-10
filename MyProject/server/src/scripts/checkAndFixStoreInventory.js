import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDb from '../config/db.js';
import Inventory from '../models/Inventory.js';
import TransferOrder from '../models/TransferOrder.js';
import ReplenishmentRequest from '../models/ReplenishmentRequest.js';

dotenv.config();

/**
 * Check store inventory and manually trigger replenishment logic (if the inventory is below the threshold but no replenishment request)
 * 
 * Usage (in the project root directory):
 *   node server/src/scripts/checkAndFixStoreInventory.js
 */
const checkAndFixStoreInventory = async () => {
  try {
    await connectDb();

    console.log('Connected to MongoDB, checking store inventory...\n');

    // Check all store inventory
    const stores = [
      'STORE-EAST-01', 'STORE-EAST-02',
      'STORE-WEST-01', 'STORE-WEST-02',
      'STORE-NORTH-01', 'STORE-NORTH-02',
      'STORE-SOUTH-01', 'STORE-SOUTH-02'
    ];

    const products = ['PROD-001', 'PROD-002', 'PROD-003', 'PROD-004', 'PROD-005', 'PROD-006'];

    let fixedCount = 0;

    for (const storeId of stores) {
      for (const productId of products) {
        const inventory = await Inventory.findOne({ productId, locationId: storeId });
        
        if (!inventory) {
          console.log(`⚠️  No inventory record found: ${productId} at ${storeId}`);
          continue;
        }

        const totalStock = inventory.totalStock || 200;
        const threshold30Percent = totalStock * 0.3; // 60 for stores with totalStock=200
        
        if (inventory.available < threshold30Percent) {
          console.log(`\n🔍 Low stock detected:`);
          console.log(`   Product: ${inventory.productName} (${productId})`);
          console.log(`   Store: ${inventory.locationName || storeId}`);
          console.log(`   Available: ${inventory.available}`);
          console.log(`   Threshold: ${Math.ceil(threshold30Percent)}`);

          // Determine the corresponding regional warehouse
          let fromLocationId = 'WH-EAST';
          let fromLocationName = 'East Warehouse';
          if (storeId.startsWith('STORE-WEST')) {
            fromLocationId = 'WH-WEST';
            fromLocationName = 'West Warehouse';
          } else if (storeId.startsWith('STORE-NORTH')) {
            fromLocationId = 'WH-NORTH';
            fromLocationName = 'North Warehouse';
          } else if (storeId.startsWith('STORE-SOUTH')) {
            fromLocationId = 'WH-SOUTH';
            fromLocationName = 'South Warehouse';
          }

          // Check if there is a PENDING status transfer order
          const existingPendingTransfer = await TransferOrder.findOne({
            productSku: productId,
            toLocationId: storeId,
            fromLocationId: fromLocationId,
            status: 'PENDING'
          });

          if (existingPendingTransfer) {
            console.log(`   ✅ Transfer order exists: ${existingPendingTransfer.transferId}`);
          } else {
            // Check if there is a IN_TRANSIT status transfer order
            const existingInTransitTransfer = await TransferOrder.findOne({
              productSku: productId,
              toLocationId: storeId,
              fromLocationId: fromLocationId,
              status: 'IN_TRANSIT'
            });

            if (existingInTransitTransfer) {
              console.log(`   ⚠️  Transfer in transit: ${existingInTransitTransfer.transferId}`);
            } else {
              // Create new transfer order
              const targetStock = totalStock * 0.9;
              const replenishQty = Math.max(0, Math.ceil(targetStock - inventory.available));

              const genTransferId = () => {
                const now = new Date();
                return `TRF-${now.toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 900 + 100)}`;
              };

              const transferId = genTransferId();
              await TransferOrder.create({
                transferId,
                productSku: productId,
                productName: inventory.productName || productId,
                quantity: replenishQty,
                fromLocationId: fromLocationId,
                fromLocationName: fromLocationName,
                toLocationId: storeId,
                toLocationName: inventory.locationName || storeId,
                status: 'PENDING',
                history: [
                  {
                    status: 'PENDING',
                    note: `Auto-created transfer: replenish ${replenishQty} units for low stock at ${storeId} (current: ${inventory.available})`,
                    createdAt: new Date()
                  }
                ],
                inventoryUpdated: false,
                requestId: null
              });

              console.log(`   ✅ Created transfer order: ${transferId}, quantity: ${replenishQty}`);
              fixedCount++;
            }
          }
        }
      }
    }

    console.log(`\n📊 Summary: Fixed ${fixedCount} missing transfer orders`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to check and fix store inventory:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

checkAndFixStoreInventory();

