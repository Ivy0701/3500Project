import bcrypt from 'bcryptjs';
import User from '../models/User.js';

// Default user configuration (for demonstration of multiple roles + inventory permissions)
// Corresponding to the users collection in the example: central management, regional management, store sales, etc.

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
  // Central warehouse manager (can view/operate all locations)
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
  // Regional warehouse manager (example of 8)
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
  // Sales staff (8 in total, 2 sales staff per store, 4 stores: East/West/North/South Store 1)
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

// Automatically initialize default users (silent run, no exit process)
export const initDefaultUsers = async () => {
  try {
    // Create each default user (if not exists)
    for (const userData of defaultUsers) {
      const { account, password, name, role, assignedLocationId, region, accessibleLocationIds } = userData;
      
      // Check if the account already exists
      const existingUser = await User.findOne({ account });
      
      if (existingUser) {
        continue; // Already exists, skip
      }
      
      // Encrypt password
      const passwordHash = await bcrypt.hash(password, 10);
      
      // Create user
      await User.create({
        account,
        passwordHash,
        name,
        role,
        assignedLocationId,
        region,
        accessibleLocationIds
      });
      
      console.log(`✅ Automatically created default user: ${account} (${name}) - Role: ${role}`);
    }
  } catch (error) {
    // Silent error handling,不影响服务器启动
    console.error('⚠️  Error initializing default users:', error.message);
  }
};



