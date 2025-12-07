import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';
import connectDb from '../config/db.js';

dotenv.config();

// 需要更新的用户名称映射
const userNamesToUpdate = {
  // 华西门店销售员
  'west_store1_sales_01': '华西门店1店员1',
  'west_store1_sales_02': '华西门店1店员2',
  'west_store2_sales_01': '华西门店2店员1',
  'west_store2_sales_02': '华西门店2店员2',
  
  // 华东门店销售员
  'east_store1_sales_01': '华东门店1店员1',
  'east_store1_sales_02': '华东门店1店员2',
  'east_store2_sales_01': '华东门店2店员1',
  'east_store2_sales_02': '华东门店2店员2',
  
  // 华北门店销售员
  'north_store1_sales_01': '华北门店1店员1',
  'north_store1_sales_02': '华北门店1店员2',
  'north_store2_sales_01': '华北门店2店员1',
  'north_store2_sales_02': '华北门店2店员2',
  
  // 华南门店销售员
  'south_store1_sales_01': '华南门店1店员1',
  'south_store1_sales_02': '华南门店1店员2',
  'south_store2_sales_01': '华南门店2店员1',
  'south_store2_sales_02': '华南门店2店员2',
  
  // 华西仓管
  'west_manager_01': '华西仓管1',
  'west_manager_02': '华西仓管2'
};

const updateUserNames = async () => {
  try {
    console.log('🔄 开始更新用户名称...');
    
    // 连接数据库
    await connectDb();
    
    let updatedCount = 0;
    let notFoundCount = 0;
    
    // 更新每个用户
    for (const [account, newName] of Object.entries(userNamesToUpdate)) {
      const result = await User.updateOne(
        { account },
        { $set: { name: newName } }
      );
      
      if (result.matchedCount > 0) {
        if (result.modifiedCount > 0) {
          console.log(`✅ 已更新: ${account} -> ${newName}`);
          updatedCount++;
        } else {
          console.log(`⏭️  已存在（无需更新）: ${account} -> ${newName}`);
        }
      } else {
        console.log(`⚠️  未找到账号: ${account}`);
        notFoundCount++;
      }
    }
    
    console.log('\n✨ 更新完成！');
    console.log(`📊 统计:`);
    console.log(`  - 已更新: ${updatedCount} 个账号`);
    console.log(`  - 未找到: ${notFoundCount} 个账号`);
    
    // 关闭数据库连接
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ 更新失败:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// 运行更新
updateUserNames();

