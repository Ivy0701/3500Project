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

const STORES = [
  { id: 'STORE-EAST-01', name: 'East Store 1' },
  { id: 'STORE-WEST-01', name: 'West Store 1' },
  { id: 'STORE-NORTH-01', name: 'North Store 1' },
  { id: 'STORE-SOUTH-01', name: 'South Store 1' }
];

const resetStoreInventory = async () => {
  try {
    await connectDb();

    // 清空所有库存记录
    await Inventory.deleteMany({});
    console.log('Cleared all inventory records');

    const docs = [];

    for (const store of STORES) {
      for (const product of PRODUCTS) {
        docs.push({
          productId: product.id,
          productName: product.name,
          locationId: store.id,
          locationName: store.name,
          region: null,
          totalStock: 200,
          available: 200,
          minThreshold: 60,
          maxThreshold: 200,
          lastUpdated: new Date()
        });
      }
    }

    await Inventory.insertMany(docs);
    console.log(`Seeded ${docs.length} store inventory records (each 100 / 200).`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Failed to reset store inventory:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

resetStoreInventory();


