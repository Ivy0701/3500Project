import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import connectDb from '../config/db.js';

dotenv.config();

// Default user configuration (consistent with initDefaultUsers, for easy standalone script execution)
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
  // Central warehouse manager
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
  // Regional warehouse manager (8)
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
    console.log('🔄 Starting to initialize default users...');
    
    // Connect to database
    await connectDb();
    
    // Create each default user
    for (const userData of defaultUsers) {
      const { account, password, name, role, assignedLocationId, region, accessibleLocationIds } = userData;
      
      // Check if the account already exists
      const existingUser = await User.findOne({ account });
      
      if (existingUser) {
        console.log(`⏭️  Account ${account} already exists, skipping creation`);
        continue;
      }
      
      // Encrypt password
      const passwordHash = await bcrypt.hash(password, 10);
      
      // Create user
      const user = await User.create({
        account,
        passwordHash,
        name,
        role,
        assignedLocationId,
        region,
        accessibleLocationIds
      });
      
      console.log(`✅ Successfully created account: ${account} (${name}) - Role: ${role}`);
    }
    
    console.log('✨ Default users initialization completed!');
    console.log('\n📋 Default users list:');
    console.log('Sales staff accounts:');
    console.log('  Account: sales001, Password: 123456');
    console.log('  Account: sales002, Password: 123456');
    console.log('\nRegional warehouse manager accounts:');
    console.log('  Account: regional001, Password: 123456');
    console.log('  Account: regional002, Password: 123456');
    console.log('\nCentral warehouse manager accounts:');
    console.log('  Account: central001, Password: 123456');
    console.log('  Account: central002, Password: 123456');
    
    // Close database connection
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Initialization failed:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Run initialization
initUsers();



