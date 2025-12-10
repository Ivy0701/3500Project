import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDb from '../config/db.js';
import Inventory from '../models/Inventory.js';

dotenv.config();

/**
 * Update the Available of PROD-002 (Classic Denim Jeans) in East Warehouse to 250
 * 
 * Usage (in the project root directory):
 *   node server/src/scripts/updateEastWarehouseDenimJeans.js
 */
const updateEastWarehouseDenimJeans = async () => {
  try {
    await connectDb();

    console.log('Connected to MongoDB, updating East Warehouse Classic Denim Jeans inventory...');

    const result = await Inventory.updateOne(
      { productId: 'PROD-002', locationId: 'WH-EAST' },
      {
        $set: {
          available: 250,
          productName: 'Classic Denim Jeans',
          locationName: 'East Warehouse',
          lastUpdated: new Date()
        },
        $setOnInsert: {
          totalStock: 1000,
          minThreshold: 100,
          maxThreshold: 2000,
          region: 'EAST'
        }
      },
      { upsert: true }
    );

    if (result.upsertedCount > 0) {
      console.log('✅ Created new inventory record for PROD-002 at WH-EAST with available = 250');
    } else if (result.modifiedCount > 0) {
      console.log('✅ Updated PROD-002 (Classic Denim Jeans) at East Warehouse: available = 250');
    } else {
      console.log('ℹ️  No changes made. Record may already have available = 250');
    }

    // Verify the update result
    const inventory = await Inventory.findOne({ productId: 'PROD-002', locationId: 'WH-EAST' });
    if (inventory) {
      console.log(`\n📦 Current inventory status:`);
      console.log(`   Product: ${inventory.productName}`);
      console.log(`   Location: ${inventory.locationName || 'WH-EAST'}`);
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

updateEastWarehouseDenimJeans();


