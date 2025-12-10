import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDb from '../config/db.js';
import Inventory from '../models/Inventory.js';

dotenv.config();

/**
 * Update the Available of PROD-001 (Casual T-Shirt) in East Warehouse to 200
 * 
 * Usage (in the project root directory):
 *   node server/src/scripts/updateEastWarehouseCasualTShirt.js
 */
const updateEastWarehouseCasualTShirt = async () => {
  try {
    await connectDb();

    console.log('Connected to MongoDB, updating East Warehouse Casual T-Shirt inventory...');

    const result = await Inventory.updateOne(
      { productId: 'PROD-001', locationId: 'WH-EAST' },
      {
        $set: {
          available: 200,
          productName: 'Casual T-Shirt',
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
      console.log('✅ Created new inventory record for PROD-001 at WH-EAST with available = 200');
    } else if (result.modifiedCount > 0) {
      console.log('✅ Updated PROD-001 (Casual T-Shirt) at East Warehouse: available = 200');
    } else {
      console.log('ℹ️  No changes made. Record may already have available = 200');
    }

    // Verify the update result
    const inventory = await Inventory.findOne({ productId: 'PROD-001', locationId: 'WH-EAST' });
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

updateEastWarehouseCasualTShirt();

