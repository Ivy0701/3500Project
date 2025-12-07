import bcrypt from 'bcryptjs';
import User from '../models/User.js';

// 预设账号配置（用于演示的多角色 + 库存权限）
// 对应示例中的 users 集合：中央管理、区域管理、门店销售等

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
  // 总仓库管理（可以查看/操作所有位置）
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
  // 区域仓库管理员（示例共 8 个）
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
  // 销售员（共 8 个，每个门店 2 个销售员，4 家门店：East/West/North/South Store 1）
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
  // East Store 2
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
  // West Store 2
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
  // North Store 2
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
  // South Store 2
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

// 自动初始化预设账号（静默运行，不退出进程）
export const initDefaultUsers = async () => {
  try {
    // 创建每个预设账号（如果不存在）
    for (const userData of defaultUsers) {
      const { account, password, name, role, assignedLocationId, region, accessibleLocationIds } = userData;
      
      // 检查账号是否已存在
      const existingUser = await User.findOne({ account });
      
      if (existingUser) {
        continue; // 已存在，跳过
      }
      
      // 加密密码
      const passwordHash = await bcrypt.hash(password, 10);
      
      // 创建用户
      await User.create({
        account,
        passwordHash,
        name,
        role,
        assignedLocationId,
        region,
        accessibleLocationIds
      });
      
      console.log(`✅ 自动创建预设账号: ${account} (${name}) - 角色: ${role}`);
    }
  } catch (error) {
    // 静默处理错误，不影响服务器启动
    console.error('⚠️  初始化预设账号时出错（不影响运行）:', error.message);
  }
};



