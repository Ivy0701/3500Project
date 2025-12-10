import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';
import connectDb from '../config/db.js';

dotenv.config();

// User name mapping to update
const userNamesToUpdate = {
  // West Store Sales Staff
  'west_store1_sales_01': 'West Store 1 Sales Staff 1',
  'west_store1_sales_02': 'West Store 1 Sales Staff 2',
  'west_store2_sales_01': 'West Store 2 Sales Staff 1',
  'west_store2_sales_02': 'West Store 2 Sales Staff 2',
  
  // East Store Sales Staff
  'east_store1_sales_01': 'East Store 1 Sales Staff 1',
  'east_store1_sales_02': 'East Store 1 Sales Staff 2',
  'east_store2_sales_01': 'East Store 2 Sales Staff 1',
  'east_store2_sales_02': 'East Store 2 Sales Staff 2',
  
  // North Store Sales Staff
  'north_store1_sales_01': 'North Store 1 Sales Staff 1',
  'north_store1_sales_02': 'North Store 1 Sales Staff 2',
  'north_store2_sales_01': 'North Store 2 Sales Staff 1',
  'north_store2_sales_02': 'North Store 2 Sales Staff 2',
  
  // South Store Sales Staff
  'south_store1_sales_01': 'South Store 1 Sales Staff 1',
  'south_store1_sales_02': 'South Store 1 Sales Staff 2',
  'south_store2_sales_01': 'South Store 2 Sales Staff 1',
  'south_store2_sales_02': 'South Store 2 Sales Staff 2',
  
  // West Warehouse Manager
  'west_manager_01': 'West Warehouse Manager 1',
  'west_manager_02': 'West Warehouse Manager 2',
};

const updateUserNames = async () => {
  try {
    console.log('🔄 Starting to update user names...');
    
    // Connect to database
    await connectDb();
    
    let updatedCount = 0;
    let notFoundCount = 0;
    
    // Update each user
    for (const [account, newName] of Object.entries(userNamesToUpdate)) {
      const result = await User.updateOne(
        { account },
        { $set: { name: newName } }
      );
      
      if (result.matchedCount > 0) {
        if (result.modifiedCount > 0) {
          console.log(`✅ Updated: ${account} -> ${newName}`);
          updatedCount++;
        } else {
          console.log(`⏭️  Already exists (no update needed): ${account} -> ${newName}`);
        }
      } else {
        console.log(`⚠️  Account not found: ${account}`);
        notFoundCount++;
      }
    }
    
    console.log('\n✨ Update completed!');
    console.log(`📊 Statistics:`);
    console.log(`  - Updated: ${updatedCount} accounts`);
    console.log(`  - Not found: ${notFoundCount} accounts`);
    
    // Close database connection
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Update failed:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Run update
updateUserNames();

