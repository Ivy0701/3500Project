import dotenv from 'dotenv';
import mongoose from 'mongoose';
import TransferOrder from '../models/TransferOrder.js';
import ReceivingSchedule from '../models/ReceivingSchedule.js';
import connectDb from '../config/db.js';

dotenv.config();

const deleteTransferOrders = async () => {
  try {
    console.log('🔧 Connecting to database...');
    await connectDb();
    console.log('✅ MongoDB connected successfully');

    // 要删除的调拨单ID列表
    const transferIdsToDelete = [
      'TRF-20251207-373',
      'TRF-20251206-961',
      'TRF-20251206-148',
      'TRF-20251204-131',
      'TRF-20251204-807',
      'TRF-20251204-203'
    ];

    console.log('\n🔍 Searching for transfer orders to delete...');
    console.log(`📋 Transfer IDs to delete: ${transferIdsToDelete.join(', ')}\n`);
    
    let deletedCount = 0;
    let notFoundCount = 0;
    
    for (const transferId of transferIdsToDelete) {
      const transfer = await TransferOrder.findOne({ transferId });
      
      if (transfer) {
        // 删除关联的接收计划
        const scheduleResult = await ReceivingSchedule.deleteMany({ planNo: transferId });
        console.log(`✅ Deleted ${scheduleResult.deletedCount} receiving schedule(s) for ${transferId}`);
        
        // 删除调拨单
        await TransferOrder.deleteOne({ transferId });
        console.log(`✅ Deleted transfer order: ${transferId}`);
        deletedCount++;
      } else {
        console.log(`⚠️  Transfer order not found: ${transferId}`);
        notFoundCount++;
      }
    }

    console.log(`\n✅ Deletion completed!`);
    console.log(`📊 Statistics:`);
    console.log(`   - Deleted: ${deletedCount} transfer orders`);
    console.log(`   - Not found: ${notFoundCount} transfer orders`);
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error deleting transfer orders:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

deleteTransferOrders();

