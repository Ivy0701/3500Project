import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDb from '../config/db.js';
import Inventory from '../models/Inventory.js';
import ReplenishmentRequest from '../models/ReplenishmentRequest.js';

dotenv.config();

/**
 * Check regional warehouse inventory and check if there is a replenishment request
 */
const checkWarehouseInventory = async () => {
  try {
    await connectDb();

    console.log('Connected to MongoDB, checking warehouse inventory...\n');

    const warehouses = ['WH-EAST', 'WH-WEST', 'WH-NORTH', 'WH-SOUTH'];
    const products = ['PROD-001', 'PROD-002', 'PROD-003', 'PROD-004', 'PROD-005', 'PROD-006'];

    for (const warehouseId of warehouses) {
      console.log(`\n📦 ${warehouseId}:`);
      for (const productId of products) {
        const inventory = await Inventory.findOne({ productId, locationId: warehouseId });
        
        if (inventory) {
          const totalStock = inventory.totalStock || 1000;
          const threshold30Percent = totalStock * 0.3;
          
          console.log(`   ${inventory.productName} (${productId}):`);
          console.log(`      Available: ${inventory.available} / ${totalStock}`);
          console.log(`      Threshold (30%): ${Math.ceil(threshold30Percent)}`);
          
          if (inventory.available < threshold30Percent) {
            console.log(`      ⚠️  Below threshold!`);
            
            // Check if there is a replenishment request
            const requests = await ReplenishmentRequest.find({
              productId,
              warehouseId,
              status: { $in: ['PENDING', 'PROCESSING', 'APPROVED'] }
            });
            
            if (requests.length > 0) {
              console.log(`      ✅ Has ${requests.length} pending/processing request(s):`);
              requests.forEach(req => {
                console.log(`         - ${req.requestId}: ${req.quantity} units, status: ${req.status}`);
              });
            } else {
              console.log(`      ❌ No pending/processing replenishment request found!`);
            }
          }
        }
      }
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to check warehouse inventory:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

checkWarehouseInventory();

