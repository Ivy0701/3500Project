import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDb from '../config/db.js';
import Inventory from '../models/Inventory.js';

dotenv.config();

/**
 * Update the Available of PROD-001 (Casual T-Shirt) in West Warehouse to 400
 * 
 * Usage (in the project root directory):
 *   node server/src/scripts/updateWestWarehouseCasualTShirt.js
 */
const updateWestWarehouseCasualTShirt = async () => {
  try {
    await connectDb();

    console.log('Connected to MongoDB, updating West Warehouse Casual T-Shirt inventory...');

    const result = await Inventory.updateOne(
      { productId: 'PROD-001', locationId: 'WH-WEST' },
      {
        $set: {
          available: 400,
          productName: 'Casual T-Shirt',
          locationName: 'West Warehouse',
          lastUpdated: new Date()
        },
        $setOnInsert: {
          totalStock: 1000,
          minThreshold: 100,
          maxThreshold: 2000,
          region: 'WEST'
        }
      },
      { upsert: true }
    );

    if (result.upsertedCount > 0) {
      console.log('✅ Created new inventory record for PROD-001 at WH-WEST with available = 400');
    } else if (result.modifiedCount > 0) {
      console.log('✅ Updated PROD-001 (Casual T-Shirt) at West Warehouse: available = 400');
    } else {
      console.log('ℹ️  No changes made. Record may already have available = 400');
    }

    // Verify the update result
    const inventory = await Inventory.findOne({ productId: 'PROD-001', locationId: 'WH-WEST' });
    if (inventory) {
      console.log(`\n📦 Current inventory status:`);
      console.log(`   Product: ${inventory.productName}`);
      console.log(`   Location: ${inventory.locationName || 'WH-WEST'}`);
      console.log(`   Available: ${inventory.available}`);
      console.log(`   Total Stock: ${inventory.totalStock}`);
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to update inventory:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

updateWestWarehouseCasualTShirt();


