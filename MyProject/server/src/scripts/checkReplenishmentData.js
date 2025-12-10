import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDb from '../config/db.js';
import ReplenishmentRequest from '../models/ReplenishmentRequest.js';
import TransferOrder from '../models/TransferOrder.js';

dotenv.config();

const checkReplenishmentData = async () => {
  try {
    await connectDb();
    console.log('✅ Connected to MongoDB\n');

    // 检查所有补货申请
    console.log('📋 Checking Replenishment Requests...');
    const allRequests = await ReplenishmentRequest.find({}).sort({ createdAt: -1 });
    console.log(`Total requests: ${allRequests.length}\n`);

    if (allRequests.length > 0) {
      console.log('Sample requests:');
      allRequests.slice(0, 5).forEach(req => {
        console.log(`  - ${req.requestId}: ${req.productName} (${req.productId})`);
        console.log(`    Status: ${req.status}, Warehouse: ${req.warehouseName} (${req.warehouseId})`);
        console.log(`    Vendor: ${req.vendor}, Quantity: ${req.quantity}`);
        console.log(`    Created: ${req.createdAt}`);
        console.log('');
      });
    }

    // 检查vendor为'Central Warehouse'的申请（centralManager应该看到的）
    console.log('\n📦 Checking requests with vendor = "Central Warehouse"...');
    const centralRequests = await ReplenishmentRequest.find({ vendor: 'Central Warehouse' }).sort({ createdAt: -1 });
    console.log(`Total: ${centralRequests.length}\n`);

    if (centralRequests.length > 0) {
      console.log('Central Warehouse requests:');
      centralRequests.slice(0, 5).forEach(req => {
        console.log(`  - ${req.requestId}: ${req.productName} (${req.productId})`);
        console.log(`    Status: ${req.status}, Warehouse: ${req.warehouseName} (${req.warehouseId})`);
        console.log(`    Quantity: ${req.quantity}`);
        console.log('');
      });
    }

    // 检查所有调拨单
    console.log('\n🚚 Checking Transfer Orders...');
    const allTransfers = await TransferOrder.find({}).sort({ createdAt: -1 });
    console.log(`Total transfers: ${allTransfers.length}\n`);

    if (allTransfers.length > 0) {
      console.log('Sample transfers:');
      allTransfers.slice(0, 5).forEach(transfer => {
        console.log(`  - ${transfer.transferId}: ${transfer.productName} (${transfer.productSku})`);
        console.log(`    From: ${transfer.fromLocationName} (${transfer.fromLocationId})`);
        console.log(`    To: ${transfer.toLocationName} (${transfer.toLocationId})`);
        console.log(`    Status: ${transfer.status}, Quantity: ${transfer.quantity}`);
        console.log(`    RequestId: ${transfer.requestId || 'N/A'}`);
        console.log(`    Created: ${transfer.createdAt}`);
        console.log('');
      });
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

checkReplenishmentData();

