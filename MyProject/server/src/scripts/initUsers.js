import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import connectDb from '../config/db.js';

dotenv.config();

// 预设账号配置（与 initDefaultUsers 保持一致，方便单独脚本执行初始化）
const ALL_STORE_IDS = [
  'STORE-EAST-01',
  'STORE-EAST-02',
  'STORE-WEST-01',
  'STORE-WEST-02',
  'STORE-NORTH-01',
  'STORE-NORTH-02',
  'STORE-SOUTH-01',
  'STORE-SOUTH-02'
];

const ALL_WAREHOUSE_IDS = ['WH-CENTRAL', 'WH-EAST', 'WH-WEST', 'WH-NORTH', 'WH-SOUTH'];

const defaultUsers = [
  // 总仓库管理
  {
    account: 'central001',
    password: '123456',
    name: 'Central Warehouse Manager 1',
    role: 'centralManager',
    assignedLocationId: 'WH-CENTRAL',
    region: 'ALL',
    accessibleLocationIds: [...ALL_WAREHOUSE_IDS, ...ALL_STORE_IDS]
  },
  {
    account: 'central002',
    password: '123456',
    name: 'Central Warehouse Manager 2',
    role: 'centralManager',
    assignedLocationId: 'WH-CENTRAL',
    region: 'ALL',
    accessibleLocationIds: [...ALL_WAREHOUSE_IDS, ...ALL_STORE_IDS]
  },
  // 区域仓库管理员（8 个）
  {
    account: 'east_manager_01',
    password: '123456',
    name: 'East Warehouse Manager 1',
    role: 'regionalManager',
    assignedLocationId: 'WH-EAST',
    region: 'EAST',
    accessibleLocationIds: ['WH-EAST', 'STORE-EAST-01', 'STORE-EAST-02']
  },
  {
    account: 'east_manager_02',
    password: '123456',
    name: 'East Warehouse Manager 2',
    role: 'regionalManager',
    assignedLocationId: 'WH-EAST',
    region: 'EAST',
    accessibleLocationIds: ['WH-EAST', 'STORE-EAST-01', 'STORE-EAST-02']
  },
  {
    account: 'west_manager_01',
    password: '123456',
    name: 'West Warehouse Manager 1',
    role: 'regionalManager',
    assignedLocationId: 'WH-WEST',
    region: 'WEST',
    accessibleLocationIds: ['WH-WEST', 'STORE-WEST-01', 'STORE-WEST-02']
  },
  {
    account: 'west_manager_02',
    password: '123456',
    name: 'West Warehouse Manager 2',
    role: 'regionalManager',
    assignedLocationId: 'WH-WEST',
    region: 'WEST',
    accessibleLocationIds: ['WH-WEST', 'STORE-WEST-01', 'STORE-WEST-02']
  },
  {
    account: 'north_manager_01',
    password: '123456',
    name: 'North Warehouse Manager 1',
    role: 'regionalManager',
    assignedLocationId: 'WH-NORTH',
    region: 'NORTH',
    accessibleLocationIds: ['WH-NORTH', 'STORE-NORTH-01', 'STORE-NORTH-02']
  },
  {
    account: 'north_manager_02',
    password: '123456',
    name: 'North Warehouse Manager 2',
    role: 'regionalManager',
    assignedLocationId: 'WH-NORTH',
    region: 'NORTH',
    accessibleLocationIds: ['WH-NORTH', 'STORE-NORTH-01', 'STORE-NORTH-02']
  },
  {
    account: 'south_manager_01',
    password: '123456',
    name: 'South Warehouse Manager 1',
    role: 'regionalManager',
    assignedLocationId: 'WH-SOUTH',
    region: 'SOUTH',
    accessibleLocationIds: ['WH-SOUTH', 'STORE-SOUTH-01', 'STORE-SOUTH-02']
  },
  {
    account: 'south_manager_02',
    password: '123456',
    name: 'South Warehouse Manager 2',
    role: 'regionalManager',
    assignedLocationId: 'WH-SOUTH',
    region: 'SOUTH',
    accessibleLocationIds: ['WH-SOUTH', 'STORE-SOUTH-01', 'STORE-SOUTH-02']
  },
  // 销售员 8 个（4 家门店，每店 2 人）
  {
    account: 'east_store1_sales_01',
    password: '123456',
    name: 'East Store 1 Staff 1',
    role: 'sales',
    assignedLocationId: 'STORE-EAST-01',
    region: 'EAST',
    accessibleLocationIds: ['STORE-EAST-01']
  },
  {
    account: 'east_store1_sales_02',
    password: '123456',
    name: 'East Store 1 Staff 2',
    role: 'sales',
    assignedLocationId: 'STORE-EAST-01',
    region: 'EAST',
    accessibleLocationIds: ['STORE-EAST-01']
  },
  {
    account: 'west_store1_sales_01',
    password: '123456',
    name: 'West Store 1 Staff 1',
    role: 'sales',
    assignedLocationId: 'STORE-WEST-01',
    region: 'WEST',
    accessibleLocationIds: ['STORE-WEST-01']
  },
  {
    account: 'west_store1_sales_02',
    password: '123456',
    name: 'West Store 1 Staff 2',
    role: 'sales',
    assignedLocationId: 'STORE-WEST-01',
    region: 'WEST',
    accessibleLocationIds: ['STORE-WEST-01']
  },
  {
    account: 'north_store1_sales_01',
    password: '123456',
    name: 'North Store 1 Staff 1',
    role: 'sales',
    assignedLocationId: 'STORE-NORTH-01',
    region: 'NORTH',
    accessibleLocationIds: ['STORE-NORTH-01']
  },
  {
    account: 'north_store1_sales_02',
    password: '123456',
    name: 'North Store 1 Staff 2',
    role: 'sales',
    assignedLocationId: 'STORE-NORTH-01',
    region: 'NORTH',
    accessibleLocationIds: ['STORE-NORTH-01']
  },
  {
    account: 'south_store1_sales_01',
    password: '123456',
    name: 'South Store 1 Staff 1',
    role: 'sales',
    assignedLocationId: 'STORE-SOUTH-01',
    region: 'SOUTH',
    accessibleLocationIds: ['STORE-SOUTH-01']
  },
  {
    account: 'south_store1_sales_02',
    password: '123456',
    name: 'South Store 1 Staff 2',
    role: 'sales',
    assignedLocationId: 'STORE-SOUTH-01',
    region: 'SOUTH',
    accessibleLocationIds: ['STORE-SOUTH-01']
  },
  {
    account: 'east_store2_sales_01',
    password: '123456',
    name: 'East Store 2 Staff 1',
    role: 'sales',
    assignedLocationId: 'STORE-EAST-02',
    region: 'EAST',
    accessibleLocationIds: ['STORE-EAST-02']
  },
  {
    account: 'east_store2_sales_02',
    password: '123456',
    name: 'East Store 2 Staff 2',
    role: 'sales',
    assignedLocationId: 'STORE-EAST-02',
    region: 'EAST',
    accessibleLocationIds: ['STORE-EAST-02']
  },
  {
    account: 'west_store2_sales_01',
    password: '123456',
    name: 'West Store 2 Staff 1',
    role: 'sales',
    assignedLocationId: 'STORE-WEST-02',
    region: 'WEST',
    accessibleLocationIds: ['STORE-WEST-02']
  },
  {
    account: 'west_store2_sales_02',
    password: '123456',
    name: 'West Store 2 Staff 2',
    role: 'sales',
    assignedLocationId: 'STORE-WEST-02',
    region: 'WEST',
    accessibleLocationIds: ['STORE-WEST-02']
  },
  {
    account: 'north_store2_sales_01',
    password: '123456',
    name: 'North Store 2 Staff 1',
    role: 'sales',
    assignedLocationId: 'STORE-NORTH-02',
    region: 'NORTH',
    accessibleLocationIds: ['STORE-NORTH-02']
  },
  {
    account: 'north_store2_sales_02',
    password: '123456',
    name: 'North Store 2 Staff 2',
    role: 'sales',
    assignedLocationId: 'STORE-NORTH-02',
    region: 'NORTH',
    accessibleLocationIds: ['STORE-NORTH-02']
  },
  {
    account: 'south_store2_sales_01',
    password: '123456',
    name: 'South Store 2 Staff 1',
    role: 'sales',
    assignedLocationId: 'STORE-SOUTH-02',
    region: 'SOUTH',
    accessibleLocationIds: ['STORE-SOUTH-02']
  },
  {
    account: 'south_store2_sales_02',
    password: '123456',
    name: 'South Store 2 Staff 2',
    role: 'sales',
    assignedLocationId: 'STORE-SOUTH-02',
    region: 'SOUTH',
    accessibleLocationIds: ['STORE-SOUTH-02']
  }
];

const initUsers = async () => {
  try {
    console.log('🔄 开始初始化预设账号...');
    
    // 连接数据库
    await connectDb();
    
    // 创建每个预设账号
    for (const userData of defaultUsers) {
      const { account, password, name, role, assignedLocationId, region, accessibleLocationIds } = userData;
      
      // 检查账号是否已存在
      const existingUser = await User.findOne({ account });
      
      if (existingUser) {
        console.log(`⏭️  账号 ${account} 已存在，跳过创建`);
        continue;
      }
      
      // 加密密码
      const passwordHash = await bcrypt.hash(password, 10);
      
      // 创建用户
      const user = await User.create({
        account,
        passwordHash,
        name,
        role,
        assignedLocationId,
        region,
        accessibleLocationIds
      });
      
      console.log(`✅ 成功创建账号: ${account} (${name}) - 角色: ${role}`);
    }
    
    console.log('✨ 预设账号初始化完成！');
    console.log('\n📋 预设账号列表：');
    console.log('销售员账号：');
    console.log('  账号: sales001, 密码: 123456');
    console.log('  账号: sales002, 密码: 123456');
    console.log('\n区域仓库管理员账号：');
    console.log('  账号: regional001, 密码: 123456');
    console.log('  账号: regional002, 密码: 123456');
    console.log('\n总仓库管理员账号：');
    console.log('  账号: central001, 密码: 123456');
    console.log('  账号: central002, 密码: 123456');
    
    // 关闭数据库连接
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ 初始化失败:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// 运行初始化
initUsers();



