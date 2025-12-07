import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDb from '../config/db.js';
import Inventory from '../models/Inventory.js';

dotenv.config();

const target = {
  productId: 'PROD-001',
  locationId: 'WH-EAST',
  available: 200,
  totalStock: 200,
  productName: 'Casual T-Shirt',
  locationName: 'East Warehouse'
};

const seedInventoryQuantity = async () => {
  try {
    await connectDb();

    await Inventory.findOneAndUpdate(
      { productId: target.productId, locationId: target.locationId },
      {
        $set: {
          productName: target.productName,
          locationName: target.locationName,
          available: target.available,
          totalStock: target.totalStock,
          lastUpdated: new Date()
        },
        $setOnInsert: {
          minThreshold: 10,
          maxThreshold: 500
        }
      },
      { upsert: true, new: true }
    );

    console.log(
      `Inventory for ${target.productId} at ${target.locationId} set to ${target.available}`
    );
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Failed to seed inventory quantity:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seedInventoryQuantity();

