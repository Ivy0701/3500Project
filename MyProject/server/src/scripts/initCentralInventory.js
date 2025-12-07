import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDb from '../config/db.js';
import Inventory from '../models/Inventory.js';

dotenv.config();

const PRODUCTS = [
  { id: 'PROD-001', name: 'Casual T-Shirt' },
  { id: 'PROD-002', name: 'Classic Denim Jeans' },
  { id: 'PROD-003', name: 'Hooded Sweatshirt' },
  { id: 'PROD-004', name: 'Chino Pants' },
  { id: 'PROD-005', name: 'Polo Shirt' },
  { id: 'PROD-006', name: 'Jogger Pants' }
];

/**
 * 初始化总仓库存：
 * - Central Warehouse（WH-CENTRAL）：每件商品 totalStock = 3000, available = 3000
 *
 * 使用方式（在项目根目录执行一次即可）：
 *   node server/src/scripts/initCentralInventory.js
 */
const initCentralInventory = async () => {
  try {
    await connectDb();

    console.log('Connected to MongoDB, start initializing Central Warehouse inventory...');

    let createdCount = 0;
    let updatedCount = 0;

    for (const product of PRODUCTS) {
      const result = await Inventory.updateOne(
        { productId: product.id, locationId: 'WH-CENTRAL' },
        {
          $set: {
            productName: product.name,
            locationId: 'WH-CENTRAL',
            locationName: 'Central Warehouse',
            region: 'CENTRAL',
            totalStock: 3000,
            available: 3000,
            minThreshold: 300,
            maxThreshold: 6000,
            lastUpdated: new Date()
          }
        },
        { upsert: true }
      );

      if (result.upsertedCount > 0) {
        createdCount++;
      } else if (result.modifiedCount > 0) {
        updatedCount++;
      }
    }

    console.log('Central Warehouse inventory initialization completed.');
    console.log(`  - Created: ${createdCount} records`);
    console.log(`  - Updated: ${updatedCount} records`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Failed to initialize Central Warehouse inventory:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

initCentralInventory();


