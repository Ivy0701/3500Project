import TransferOrder from '../models/TransferOrder.js';
import ReceivingSchedule from '../models/ReceivingSchedule.js';
import ReplenishmentAlert from '../models/ReplenishmentAlert.js';

const transferSeed = [
  {
    transferId: 'TRF-20251203-001',
    productSku: 'PROD-001',
    productName: 'Casual T-Shirt',
    quantity: 80,
    fromLocationId: 'WH-EAST',
    fromLocationName: 'East Warehouse',
    toLocationId: 'STORE-EAST-01',
    toLocationName: 'East Store 1'
  },
  {
    transferId: 'TRF-20251203-002',
    productSku: 'PROD-004',
    productName: 'Chino Pants',
    quantity: 60,
    fromLocationId: 'WH-SOUTH',
    fromLocationName: 'South Warehouse',
    toLocationId: 'STORE-SOUTH-02',
    toLocationName: 'South Store 2'
  },
  {
    transferId: 'TRF-20251203-003',
    productSku: 'PROD-003',
    productName: 'Hooded Sweatshirt',
    quantity: 40,
    fromLocationId: 'WH-NORTH',
    fromLocationName: 'North Warehouse',
    toLocationId: 'STORE-NORTH-01',
    toLocationName: 'North Store 1'
  }
];

const receivingSeed = [];

const alertSeed = [];

export const initOperationalData = async () => {
  try {
    const transferCount = await TransferOrder.countDocuments();
    if (transferCount === 0) {
      await TransferOrder.insertMany(transferSeed);
      console.log('Seeded transfer orders');
    }

    const receivingCount = await ReceivingSchedule.countDocuments();
    if (receivingCount === 0) {
      await ReceivingSchedule.insertMany(receivingSeed);
      console.log('Seeded receiving schedules');
    }

    const alertCount = await ReplenishmentAlert.countDocuments();
    if (alertCount === 0) {
      await ReplenishmentAlert.insertMany(alertSeed);
      console.log('Seeded replenishment alerts');
    }
  } catch (error) {
    console.error('Failed to seed operational data', error);
  }
};

