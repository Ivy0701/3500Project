import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Order from '../models/Order.js';
import connectDb from '../config/db.js';

dotenv.config();

const deleteEastStore1Orders = async () => {
  try {
    console.log('🔧 Connecting to database...');
    await connectDb();
    console.log('✅ MongoDB connected successfully');
    
    console.log('\n🔍 Searching for all orders from East Store 1 (STORE-EAST-01)...');
    
    // Find all orders assigned to STORE-EAST-01
    const orders = await Order.find({ inventoryLocationId: 'STORE-EAST-01' });
    
    console.log(`📊 Found ${orders.length} orders`);
    
    if (orders.length === 0) {
      console.log('✨ No orders to delete');
      await mongoose.connection.close();
      process.exit(0);
    }
    
    // Display first 10 orders
    console.log('\n📋 Order list (first 10):');
    orders.slice(0, 10).forEach((order, index) => {
      console.log(`   ${index + 1}. ${order.orderNumber} - ${order.customerName} - ${order.status} - ${order.createdAt.toLocaleDateString()}`);
    });
    
    if (orders.length > 10) {
      console.log(`   ... ${orders.length - 10} more orders`);
    }
    
    // Confirm deletion
    console.log(`\n⚠️  Preparing to delete ${orders.length} orders`);
    console.log('🗑️  Starting deletion...');
    
    const result = await Order.deleteMany({ inventoryLocationId: 'STORE-EAST-01' });
    
    console.log(`\n✅ Deletion completed!`);
    console.log(`📊 Statistics:`);
    console.log(`   - Deleted: ${result.deletedCount} orders`);
    
  } catch (error) {
    console.error('❌ Deletion failed:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

deleteEastStore1Orders();

