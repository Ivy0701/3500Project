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
 * 初始化华东区域库存：
 * - 华东仓库（WH-EAST）：所有商品 available = 1000, totalStock = 1000
 * - 华东门店2（STORE-EAST-02）：所有商品 available = 100, totalStock = 200（假设和门店1一样）
 *
 * 使用方式（在项目根目录）：
 *   node server/src/scripts/initEastRegionInventory.js
 */
const initEastRegionInventory = async () => {
  try {
    await connectDb();

    console.log('Connected to MongoDB, start initializing East Region inventory...');

    const docs = [];

    // 1. 华东仓库（WH-EAST）：所有商品库存为1000
    for (const product of PRODUCTS) {
      docs.push({
        productId: product.id,
        productName: product.name,
        locationId: 'WH-EAST',
        locationName: 'East Warehouse',
        region: 'EAST',
        totalStock: 1000,
        available: 1000,
        minThreshold: 100,
        maxThreshold: 2000,
        lastUpdated: new Date()
      });
    }

    // 2. 华东门店2（STORE-EAST-02）：所有商品库存为100（假设和门店1一样）
    for (const product of PRODUCTS) {
      docs.push({
        productId: product.id,
        productName: product.name,
        locationId: 'STORE-EAST-02',
        locationName: 'East Store 2',
        region: 'EAST',
        totalStock: 200,
        available: 100,
        minThreshold: 60,
        maxThreshold: 200,
        lastUpdated: new Date()
      });
    }

    // 使用 upsert 模式，如果已存在则更新，不存在则创建
    let createdCount = 0;
    let updatedCount = 0;

    for (const doc of docs) {
      const result = await Inventory.updateOne(
        { productId: doc.productId, locationId: doc.locationId },
        {
          $set: {
            productName: doc.productName,
            locationName: doc.locationName,
            region: doc.region,
            totalStock: doc.totalStock,
            available: doc.available,
            minThreshold: doc.minThreshold,
            maxThreshold: doc.maxThreshold,
            lastUpdated: doc.lastUpdated
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

    console.log(`Initialization completed.`);
    console.log(`  - Created: ${createdCount} records`);
    console.log(`  - Updated: ${updatedCount} records`);
    console.log(`  - WH-EAST: All products have available = 1000`);
    console.log(`  - STORE-EAST-02: All products have available = 100`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Failed to initialize East Region inventory:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

initEastRegionInventory();

