import Inventory from '../models/Inventory.js';

const PRODUCTS = [
  { id: 'PROD-001', name: 'Casual T-Shirt' },
  { id: 'PROD-002', name: 'Classic Denim Jeans' },
  { id: 'PROD-003', name: 'Hooded Sweatshirt' },
  { id: 'PROD-004', name: 'Chino Pants' },
  { id: 'PROD-005', name: 'Polo Shirt' },
  { id: 'PROD-006', name: 'Jogger Pants' }
];

const regionalWarehouses = [
  { id: 'WH-EAST', name: 'East Warehouse', region: 'EAST', totalStock: 1000, available: 1000, minThreshold: 100, maxThreshold: 2000 },
  { id: 'WH-WEST', name: 'West Warehouse', region: 'WEST', totalStock: 1000, available: 1000, minThreshold: 100, maxThreshold: 2000 },
  { id: 'WH-NORTH', name: 'North Warehouse', region: 'NORTH', totalStock: 1000, available: 1000, minThreshold: 100, maxThreshold: 2000 },
  { id: 'WH-SOUTH', name: 'South Warehouse', region: 'SOUTH', totalStock: 1000, available: 1000, minThreshold: 100, maxThreshold: 2000 }
];

const regionalStores = [
  { id: 'STORE-EAST-01', name: 'East Store 1', region: 'EAST', totalStock: 200, available: 120, minThreshold: 60, maxThreshold: 200 },
  { id: 'STORE-EAST-02', name: 'East Store 2', region: 'EAST', totalStock: 200, available: 120, minThreshold: 60, maxThreshold: 200 },
  { id: 'STORE-WEST-01', name: 'West Store 1', region: 'WEST', totalStock: 200, available: 120, minThreshold: 60, maxThreshold: 200 },
  { id: 'STORE-WEST-02', name: 'West Store 2', region: 'WEST', totalStock: 200, available: 120, minThreshold: 60, maxThreshold: 200 },
  { id: 'STORE-NORTH-01', name: 'North Store 1', region: 'NORTH', totalStock: 200, available: 120, minThreshold: 60, maxThreshold: 200 },
  { id: 'STORE-NORTH-02', name: 'North Store 2', region: 'NORTH', totalStock: 200, available: 120, minThreshold: 60, maxThreshold: 200 },
  { id: 'STORE-SOUTH-01', name: 'South Store 1', region: 'SOUTH', totalStock: 200, available: 120, minThreshold: 60, maxThreshold: 200 },
  { id: 'STORE-SOUTH-02', name: 'South Store 2', region: 'SOUTH', totalStock: 200, available: 120, minThreshold: 60, maxThreshold: 200 }
];

const locations = [...regionalWarehouses, ...regionalStores];

export const initRegionalInventories = async () => {
  try {
    let created = 0;

    for (const product of PRODUCTS) {
      for (const location of locations) {
        const result = await Inventory.updateOne(
          { productId: product.id, locationId: location.id },
          {
            $setOnInsert: {
              productId: product.id,
              productName: product.name,
              locationId: location.id,
              locationName: location.name,
              region: location.region,
              totalStock: location.totalStock,
              available: location.available,
              minThreshold: location.minThreshold,
              maxThreshold: location.maxThreshold,
              lastUpdated: new Date()
            }
          },
          { upsert: true }
        );

        if (result.upsertedCount && result.upsertedCount > 0) {
          created += 1;
        }
      }
    }

    if (created > 0) {
      console.log(`Seeded ${created} regional/store inventory records`);
    } else {
      console.log('Regional/store inventory already initialized');
    }
  } catch (error) {
    console.error('Failed to initialize regional/store inventories', error.message);
  }
};


