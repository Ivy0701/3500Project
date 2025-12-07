import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDb from '../config/db.js';

dotenv.config();

const INVENTORY_COLLECTION = 'inventories';
const LEGACY_INDEX = 'productId_1';
const TARGET_INDEX = { productId: 1, locationId: 1 };

const fixInventoryIndexes = async () => {
  try {
    await connectDb();
    const collection = mongoose.connection.collection(INVENTORY_COLLECTION);

    const indexes = await collection.indexes();
    const hasLegacy = indexes.some((idx) => idx.name === LEGACY_INDEX);
    const hasCompound = indexes.some(
      (idx) =>
        idx.key &&
        idx.key.productId === 1 &&
        idx.key.locationId === 1
    );

    if (hasLegacy) {
      await collection.dropIndex(LEGACY_INDEX);
      console.log(`Dropped legacy index ${LEGACY_INDEX}`);
    }

    if (!hasCompound) {
      await collection.createIndex(TARGET_INDEX, { unique: true });
      console.log('Created compound index { productId: 1, locationId: 1 }');
    } else {
      console.log('Compound index already exists');
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Failed to fix inventory indexes:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

fixInventoryIndexes();

