import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDb from '../config/db.js';
import Inventory from '../models/Inventory.js';

dotenv.config();

/**
 * Update the Available of PROD-001 (Casual T-Shirt) in East Store 1 to 100
 * 
 * Usage (in the project root directory):
 *   node server/src/scripts/updateEastStore1CasualTShirt.js
 */
const updateEastStore1CasualTShirt = async () => {
  try {
    await connectDb();

    console.log('Connected to MongoDB, updating East Store 1 Casual T-Shirt inventory...');

    const result = await Inventory.updateOne(
      { productId: 'PROD-001', locationId: 'STORE-EAST-01' },
      {
        $set: {
          available: 100,
          lastUpdated: new Date()
        }
      },
      { upsert: true }
    );

    if (result.upsertedCount > 0) {
      console.log('✅ Created new inventory record for PROD-001 at STORE-EAST-01 with available = 100');
    } else if (result.modifiedCount > 0) {
      console.log('✅ Updated PROD-001 (Casual T-Shirt) at East Store 1: available = 100');
    } else {
      console.log('ℹ️  No changes made. Record may already have available = 100');
    }

    // Verify the update result
    const inventory = await Inventory.findOne({ productId: 'PROD-001', locationId: 'STORE-EAST-01' });
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

updateEastStore1CasualTShirt();

