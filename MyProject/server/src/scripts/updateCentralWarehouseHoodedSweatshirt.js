import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDb from '../config/db.js';
import Inventory from '../models/Inventory.js';

dotenv.config();

/**
 * Update the Available of PROD-003 (Hooded Sweatshirt) in the Central Warehouse to 2000
 * 
 * Usage (in the project root directory):
 *   node server/src/scripts/updateCentralWarehouseHoodedSweatshirt.js
 */
const updateCentralWarehouseHoodedSweatshirt = async () => {
  try {
    await connectDb();

    console.log('Connected to MongoDB, updating Central Warehouse Hooded Sweatshirt inventory...');

    const result = await Inventory.updateOne(
      { productId: 'PROD-003', locationId: 'WH-CENTRAL' },
      {
        $set: {
          available: 2000,
          lastUpdated: new Date()
        }
      },
      { upsert: true }
    );

    if (result.upsertedCount > 0) {
      console.log('✅ Created new inventory record for PROD-003 at WH-CENTRAL with available = 2000');
    } else if (result.modifiedCount > 0) {
      console.log('✅ Updated PROD-003 (Hooded Sweatshirt) at Central Warehouse: available = 2000');
    } else {
      console.log('ℹ️  No changes made. Record may already have available = 2000');
    }

    // Verify the update result
    const inventory = await Inventory.findOne({ productId: 'PROD-003', locationId: 'WH-CENTRAL' });
    if (inventory) {
      console.log(`\n📦 Current inventory status:`);
      console.log(`   Product: ${inventory.productName}`);
      console.log(`   Location: ${inventory.locationName}`);
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

updateCentralWarehouseHoodedSweatshirt();

