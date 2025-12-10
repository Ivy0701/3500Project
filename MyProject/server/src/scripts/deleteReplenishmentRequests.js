import dotenv from 'dotenv';
import mongoose from 'mongoose';
import ReplenishmentRequest from '../models/ReplenishmentRequest.js';
import TransferOrder from '../models/TransferOrder.js';
import ReceivingSchedule from '../models/ReceivingSchedule.js';
import connectDb from '../config/db.js';

dotenv.config();

const deleteReplenishmentRequests = async () => {
  try {
    console.log('🔧 Connecting to database...');
    await connectDb();
    console.log('✅ MongoDB connected successfully');
    
    // List of replenishment request IDs to delete
    const requestIdsToDelete = [
      'REQ-20251207-333',
      'REQ-20251207-571',
      'REQ-20251207-452',
      'REQ-20251207-391'
    ];
    
    // List of transfer order IDs to delete
    const transferIdsToDelete = [
      'TRF-20251207-797'
    ];
    
    console.log('\n🔍 Searching for records to delete...');
    console.log(`📋 Request IDs to delete: ${requestIdsToDelete.join(', ')}`);
    console.log(`📋 Transfer IDs to delete: ${transferIdsToDelete.join(', ')}\n`);
    
    let deletedRequests = 0;
    let deletedTransfers = 0;
    let notFoundRequests = 0;
    let notFoundTransfers = 0;
    
    // Delete replenishment requests
    for (const requestId of requestIdsToDelete) {
      const request = await ReplenishmentRequest.findOne({ requestId });
      
      if (request) {
        // Find related transfer orders
        const relatedTransfers = await TransferOrder.find({ requestId });
        
        // Delete related transfer orders and receiving schedules
        for (const transfer of relatedTransfers) {
          await ReceivingSchedule.deleteMany({ planNo: transfer.transferId });
          await TransferOrder.deleteOne({ transferId: transfer.transferId });
          console.log(`✅ Deleted related transfer order: ${transfer.transferId}`);
          deletedTransfers++;
        }
        
        // Delete replenishment request
        await ReplenishmentRequest.deleteOne({ requestId });
        console.log(`✅ Deleted replenishment request: ${requestId}`);
        deletedRequests++;
      } else {
        console.log(`⚠️  Replenishment request not found: ${requestId}`);
        notFoundRequests++;
      }
    }
    
    // Delete transfer orders
    for (const transferId of transferIdsToDelete) {
      const transfer = await TransferOrder.findOne({ transferId });
      
      if (transfer) {
        // Delete related receiving schedules
        const scheduleResult = await ReceivingSchedule.deleteMany({ planNo: transferId });
        console.log(`✅ Deleted ${scheduleResult.deletedCount} receiving schedule(s) for ${transferId}`);
        
        // Delete transfer order
        await TransferOrder.deleteOne({ transferId });
        console.log(`✅ Deleted transfer order: ${transferId}`);
        deletedTransfers++;
      } else {
        console.log(`⚠️  Transfer order not found: ${transferId}`);
        notFoundTransfers++;
      }
    }

    console.log(`\n✅ Deletion completed!`);
    console.log(`📊 Statistics:`);
    console.log(`   - Deleted replenishment requests: ${deletedRequests}`);
    console.log(`   - Deleted transfer orders: ${deletedTransfers}`);
    console.log(`   - Not found requests: ${notFoundRequests}`);
    console.log(`   - Not found transfers: ${notFoundTransfers}`);
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error deleting records:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

deleteReplenishmentRequests();



