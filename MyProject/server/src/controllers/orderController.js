import Order from '../models/Order.js';
import OrderCounter from '../models/OrderCounter.js';
import Inventory from '../models/Inventory.js';
import { decreaseInventory, increaseInventory, updateInventoryQuantity, DEFAULT_STORE_LOCATION_ID } from './inventoryController.js';

const statusLabelMap = {
  pending: 'Pending',
  processing: 'Processing',
  shipped: 'Shipped',
  completed: 'Completed',
  cancelled: 'Cancelled',
  returned: 'Returned',
  after_sales_processing: 'After-sales Processing'
};

const generateOrderNumber = async () => {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
  const counter = await OrderCounter.findOneAndUpdate(
    { date: datePart },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  const seq = String(counter.seq).padStart(6, '0');
  return `ORD-${datePart}-${seq}`;
};

const buildTimeline = (title) => [
  { title: title || 'Order Created', time: new Date() }
];

const mapOrderResponse = (order) => ({
  id: order._id.toString(),
  orderNumber: order.orderNumber,
  customerId: order.customerId,
  customerName: order.customerName,
  items: order.items,
  shippingAddress: order.shippingAddress,
  subtotal: order.subtotal,
  discount: order.discount,
  totalAmount: order.totalAmount,
  remark: order.remark,
  inventoryStatus: order.inventoryStatus,
  status: order.status,
  statusLabel: statusLabelMap[order.status] || order.status,
  afterSales: order.afterSales,
  timeline: order.timeline,
  createTime: order.createdAt ? new Date(order.createdAt).toLocaleString('en-US') : '',
  createdAt: order.createdAt,
  updatedAt: order.updatedAt
});

// Helper function to get region from location ID
const getRegionFromLocationId = (locationId) => {
  if (!locationId) return null;
  const upperLocationId = locationId.toUpperCase();
  if (upperLocationId.includes('EAST')) return 'EAST';
  if (upperLocationId.includes('WEST')) return 'WEST';
  if (upperLocationId.includes('NORTH')) return 'NORTH';
  if (upperLocationId.includes('SOUTH')) return 'SOUTH';
  return null;
};

export const getOrders = async (req, res, next) => {
  try {
    const user = req.user;
    
    if (!user) {
      // Guest user, return empty array
      return res.json([]);
    }
    
    const userRole = user.role;
    const userId = user.id || user._id;
    const userRegion = user.region;
    const userAccessibleLocations = user.accessibleLocationIds || [];
    
    // Determine which orders to return based on user role
    let query = {};
    
    if (userRole === 'customer') {
      // Customers can only see their own orders
      query = { customerId: userId };
    } else if (userRole === 'sales') {
      // Sales staff can see all orders assigned to their region's stores
      // All store sales staff in the same region can see all orders in that region
      if (userRegion && userRegion !== 'ALL') {
        // Query all orders with inventoryLocationId containing the region
        // This way, all 4 sales staff in the West region can see the orders in the West region
        query = {
          $or: [
            { inventoryLocationId: { $regex: new RegExp(`STORE-${userRegion}`, 'i') } },
            { inventoryLocationId: { $regex: new RegExp(`WH-${userRegion}`, 'i') } }
          ]
        };
        console.log(`[Order Query] Sales user: ${user.account}, Region: ${userRegion}, Query:`, JSON.stringify(query));
      } else {
        // If there is no region information, return an empty array (should not happen, but for safety)
        console.log(`[Order Query] Sales user: ${user.account}, No region found, returning empty`);
        return res.json([]);
      }
    } else if (userRole === 'regionalManager') {
      // Regional warehouse managers can see orders in their region
      if (userRegion && userRegion !== 'ALL') {
        query = {
          $or: [
            { inventoryLocationId: { $regex: new RegExp(`STORE-${userRegion}`, 'i') } },
            { warehouseLocationId: { $regex: new RegExp(`WH-${userRegion}`, 'i') } }
          ]
        };
      } else {
        return res.json([]);
      }
    } else if (userRole === 'centralManager') {
      // Central warehouse managers can see all orders
      query = {};
    } else {
      // Other roles return empty array
      return res.json([]);
    }
    
    // Query orders
    const orders = await Order.find(query).sort({ createdAt: -1 });
    console.log(`[Order Query] Found ${orders.length} orders for user ${user.account || user.id}, role: ${userRole}`);
    if (orders.length > 0 && userRole === 'sales') {
      console.log(`[Order Query] Sample order inventoryLocationId: ${orders[0].inventoryLocationId}`);
    }
    res.json(orders.map(mapOrderResponse));
  } catch (error) {
    next(error);
  }
};

// Helper function to get all stores in the same region as a given store
const getRegionStores = (storeId) => {
  if (!storeId || !storeId.startsWith('STORE-')) {
    return [storeId || DEFAULT_STORE_LOCATION_ID];
  }
  
  // Extract region from store ID (e.g., STORE-EAST-01 -> EAST)
  const parts = storeId.split('-');
  if (parts.length < 3) {
    return [storeId];
  }
  
  const region = parts[1]; // EAST, WEST, NORTH, SOUTH
  
  const REGION_STORES = {
    EAST: ['STORE-EAST-01', 'STORE-EAST-02'],
    WEST: ['STORE-WEST-01', 'STORE-WEST-02'],
    NORTH: ['STORE-NORTH-01', 'STORE-NORTH-02'],
    SOUTH: ['STORE-SOUTH-01', 'STORE-SOUTH-02']
  };
  
  return REGION_STORES[region] || [storeId];
};

const resolveInventoryLocationFromAddressAndPayment = (shippingAddress, paymentMethod) => {
  // Default online store (when there is no obvious region information)
  let storeId = DEFAULT_STORE_LOCATION_ID;
  let warehouseId = null;

  if (!shippingAddress) {
    return { storeId, warehouseId };
  }

  const country = shippingAddress.country;
  const stateRaw = shippingAddress.state || '';
  const state = stateRaw.toLowerCase().trim();

  // Map country/province to region
  let regionKey = null;
  if (country === 'HK') {
    // Hong Kong is mapped to South China
    regionKey = 'SOUTH';
  } else if (country === 'CN') {
    // Support multiple case and spelling variations
    if (state === 'shanghai' || state.includes('shanghai')) {
      regionKey = 'EAST';
    } else if (state === 'beijing' || state.includes('beijing')) {
      regionKey = 'NORTH';
    } else if (state === 'guangzhou' || state === 'guangdong' || state.includes('guangzhou') || state.includes('guangdong')) {
      regionKey = 'SOUTH';
    } else if (state === 'xinjiang' || state.includes('xinjiang')) {
      regionKey = 'WEST';
    }
  }
  
  console.log(`[Order Allocation] Country: ${country}, State (raw): "${stateRaw}", State (normalized): "${state}", Region: ${regionKey}`);

  // Mapping of region to warehouse / store ID
  const REGION_TO_LOCATIONS = {
    EAST: {
      warehouse: 'WH-EAST',
      store1: 'STORE-EAST-01',
      store2: 'STORE-EAST-02'
    },
    WEST: {
      warehouse: 'WH-WEST',
      store1: 'STORE-WEST-01',
      store2: 'STORE-WEST-02'
    },
    NORTH: {
      warehouse: 'WH-NORTH',
      store1: 'STORE-NORTH-01',
      store2: 'STORE-NORTH-02'
    },
    SOUTH: {
      warehouse: 'WH-SOUTH',
      store1: 'STORE-SOUTH-01',
      store2: 'STORE-SOUTH-02'
    }
  };

  if (!regionKey || !REGION_TO_LOCATIONS[regionKey]) {
    // Fall back to default store
    return { storeId, warehouseId };
  }

  const regionConfig = REGION_TO_LOCATIONS[regionKey];

  // Payment method determines which store:
  // - Credit card / Debit card → Store 2
  // - Alipay / WeChat → Store 1
  const method = (paymentMethod || '').toLowerCase();
  const isCard = method === 'credit' || method === 'debit';

  storeId = isCard ? regionConfig.store2 : regionConfig.store1;
  warehouseId = regionConfig.warehouse;

  return { storeId, warehouseId };
};

export const createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress, subtotal, discount = 0, totalAmount, remark = '', paymentMethod } = req.body;
    const customerId = req.user?.id || req.user?._id;
    
    // If no authenticated user, we can't create an order (or use guest, but they won't be able to view it)
    if (!customerId) {
      return res.status(401).json({ message: 'Please login before placing order' });
    }
    
    const customerName = req.user?.name || req.user?.account || shippingAddress?.name || 'Customer';

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Order items cannot be empty' });
    }

    if (
      !shippingAddress ||
      !shippingAddress.name ||
      !shippingAddress.phone ||
      !shippingAddress.street ||
      !shippingAddress.state ||
      !shippingAddress.zipCode
    ) {
      return res.status(400).json({ message: 'Shipping address information is incomplete' });
    }

    if (!totalAmount || totalAmount <= 0) {
      return res.status(400).json({ message: 'Invalid order amount' });
    }

    // Determine the inventory location corresponding to the order based on the shipping address + payment method
    // - Hong Kong / Shanghai / Beijing / Guangzhou / Xinjiang assigned to the corresponding region
    // - Credit card / Debit card → Store 2 + corresponding regional warehouse
    // - Alipay / WeChat → Store 1 + corresponding regional warehouse
    const { storeId, warehouseId } = resolveInventoryLocationFromAddressAndPayment(shippingAddress, paymentMethod);
    const inventoryLocationId = storeId || DEFAULT_STORE_LOCATION_ID;
    
    console.log(`[Order Creation] Shipping Address: ${shippingAddress.state}, Payment: ${paymentMethod}`);
    console.log(`[Order Creation] Order allocated to: ${inventoryLocationId}, Warehouse: ${warehouseId || 'N/A'}`);

    const order = await Order.create({
      orderNumber: await generateOrderNumber(),
      customerId,
      customerName,
      items,
      shippingAddress,
      subtotal: subtotal || totalAmount,
      discount,
      totalAmount,
      remark,
      inventoryLocationId,
      // For future replenishment / reporting: The regional warehouse the order belongs to
      warehouseLocationId: warehouseId || undefined,
      inventoryStatus: 'Inventory Checking',
      status: 'pending',
      timeline: buildTimeline('Order Created')
    });

    res.status(201).json(mapOrderResponse(order));
  } catch (error) {
    if (error.code === 11000) {
      error.status = 400;
      error.message = 'Duplicate order number, please try again';
    }
    next(error);
  }
};

export const confirmOrderReceipt = async (req, res, next) => {
  try {
    const { id } = req.params;
    const customerId = req.user?.id || req.user?._id;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order does not exist' });
    }

    // Check if order belongs to the customer
    if (customerId && order.customerId !== customerId) {
      return res.status(403).json({ message: 'No permission to operate this order' });
    }

    if (order.status !== 'shipped') {
      return res.status(400).json({ message: 'Only shipped orders can confirm receipt' });
    }

    order.status = 'completed';
    order.timeline.push({ title: 'Receipt Confirmed', time: new Date() });
    await order.save();

    res.json(mapOrderResponse(order));
  } catch (error) {
    next(error);
  }
};

// Customer applies for after-sales (exchange / refund)
export const returnOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { type, reason } = req.body;
    const customerId = req.user?.id || req.user?._id;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order does not exist' });
    }

    // Check if order belongs to the customer
    if (customerId && order.customerId !== customerId) {
      return res.status(403).json({ message: 'No permission to operate this order' });
    }

    if (!['shipped', 'completed'].includes(order.status)) {
      return res.status(400).json({ message: 'Only shipped or completed orders can apply for after-sales' });
    }

    if (!type || !['exchange', 'refund'].includes(type)) {
      return res.status(400).json({ message: 'Invalid after-sales type' });
    }

    if (!reason || !reason.trim()) {
      return res.status(400).json({ message: 'After-sales reason is required' });
    }

    order.afterSales = {
      type,
      reason: reason.trim(),
      status: 'pending',
      createdAt: new Date()
    };
    order.status = 'after_sales_processing';
    order.timeline.push({ title: 'After-sales Requested', time: new Date() });
    await order.save();

    res.json(mapOrderResponse(order));
  } catch (error) {
    next(error);
  }
};

// Sales staff approves after-sales request
export const approveAfterSales = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: 'Login required' });
    }

    if (user.role !== 'sales') {
      return res.status(403).json({ message: 'Only sales staff can process after-sales requests' });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order does not exist' });
    }

    if (!order.afterSales || order.afterSales.status !== 'pending') {
      return res.status(400).json({ message: 'No pending after-sales request for this order' });
    }

    // Increase inventory for each item in the order (only for refund type, exchange doesn't change inventory)
    if (order.afterSales.type === 'refund') {
      try {
        const inventoryLocationId = order.inventoryLocationId || DEFAULT_STORE_LOCATION_ID;
        for (const item of order.items) {
          console.log(
            `Increasing inventory: productId=${item.productId}, quantity=${item.quantity}, locationId=${inventoryLocationId}`
          );
          await updateInventoryQuantity(item.productId, item.quantity, inventoryLocationId);
          console.log(`Inventory increased successfully for product ${item.productId} at ${inventoryLocationId}`);
        }
      } catch (inventoryError) {
        console.error('Inventory update error:', inventoryError);
        return res.status(400).json({ message: inventoryError.message || 'Failed to update inventory' });
      }
    }

    order.afterSales.status = 'approved';
    order.afterSales.processedAt = new Date();
    // For simplicity, mark order as returned after after-sales approved
    order.status = 'returned';
    order.timeline.push({ title: 'After-sales Approved', time: new Date() });

    await order.save();
    res.json(mapOrderResponse(order));
  } catch (error) {
    next(error);
  }
};

// Sales staff rejects after-sales request
export const rejectAfterSales = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: 'Login required' });
    }

    if (user.role !== 'sales') {
      return res.status(403).json({ message: 'Only sales staff can process after-sales requests' });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order does not exist' });
    }

    if (!order.afterSales || order.afterSales.status !== 'pending') {
      return res.status(400).json({ message: 'No pending after-sales request for this order' });
    }

    if (!reason || !reason.trim()) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }

    order.afterSales.status = 'rejected';
    order.afterSales.rejectionReason = reason.trim();
    order.afterSales.processedAt = new Date();
    // Set status to completed after rejection
    order.status = 'completed';
    order.timeline.push({ title: 'After-sales Rejected', time: new Date() });

    await order.save();
    res.json(mapOrderResponse(order));
  } catch (error) {
    next(error);
  }
};

export const confirmOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: 'Login required' });
    }

    // Only sales staff and warehouse managers can confirm orders
    if (user.role !== 'sales' && user.role !== 'warehouse') {
      return res.status(403).json({ message: 'Only sales staff and warehouse managers can confirm orders' });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order does not exist' });
    }

    // Only pending orders can be confirmed
    if (order.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending orders can be confirmed' });
    }

    order.status = 'processing';
    order.timeline.push({ title: 'Order Confirmed', time: new Date() });
    await order.save();

    res.json(mapOrderResponse(order));
  } catch (error) {
    next(error);
  }
};

export const cancelOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const customerId = req.user?.id || req.user?._id;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order does not exist' });
    }

    // Check if order belongs to the customer
    if (customerId && order.customerId !== customerId) {
      return res.status(403).json({ message: 'No permission to operate this order' });
    }

    // Only allow cancelling pending or processing orders
    if (!['pending', 'processing'].includes(order.status)) {
      return res.status(400).json({ message: 'Only pending or processing orders can be cancelled' });
    }

    order.status = 'cancelled';
    order.timeline.push({ title: 'Order Cancelled', time: new Date() });
    await order.save();

    res.json(mapOrderResponse(order));
  } catch (error) {
    next(error);
  }
};

export const shipOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: 'Login required' });
    }

    // Only sales staff can ship orders
    if (user.role !== 'sales') {
      return res.status(403).json({ message: 'Only sales staff can ship orders' });
    }

    // Use atomic operation to prevent duplicate shipping
    // Only update if status is 'processing', ensuring only one person can ship
    const order = await Order.findOneAndUpdate(
      { 
        _id: id, 
        status: 'processing'  // Only update if status is still 'processing'
      },
      {
        $set: { status: 'shipped' },
        $push: { timeline: { title: 'Order Shipped', time: new Date() } }
      },
      { new: true }  // Return updated document
    );

    if (!order) {
      // Order not found or status is not 'processing'
      const existingOrder = await Order.findById(id);
      if (!existingOrder) {
        return res.status(404).json({ message: 'Order does not exist' });
      }
      return res.status(400).json({ 
        message: `Order cannot be shipped. Current status: ${existingOrder.status}. Only processing orders can be shipped.` 
      });
    }

    // Decrease inventory for each item in the order
    // If the assigned store doesn't have enough inventory, try other stores in the same region
    try {
      let actualInventoryLocationId = order.inventoryLocationId || DEFAULT_STORE_LOCATION_ID;
      const regionStores = getRegionStores(actualInventoryLocationId);
      
      for (const item of order.items) {
        let itemShipped = false;
        let lastError = null;
        
        // First try the assigned store
        try {
          console.log(
            `Attempting to decrease inventory: productId=${item.productId}, quantity=${item.quantity}, locationId=${actualInventoryLocationId}`
          );
          await updateInventoryQuantity(item.productId, -item.quantity, actualInventoryLocationId);
          console.log(`Inventory decreased successfully for product ${item.productId} at ${actualInventoryLocationId}`);
          itemShipped = true;
        } catch (firstError) {
          console.log(`Insufficient inventory at ${actualInventoryLocationId}, trying other stores in the region...`);
          lastError = firstError;
          
          // Try other stores in the same region
          for (const storeId of regionStores) {
            if (storeId === actualInventoryLocationId) continue; // Skip the already tried store
            
            try {
              // Check if this store has enough inventory
              const inventory = await Inventory.findOne({ productId: item.productId, locationId: storeId });
              if (inventory && inventory.available >= item.quantity) {
                console.log(`Found sufficient inventory at ${storeId}, shipping from there instead`);
                await updateInventoryQuantity(item.productId, -item.quantity, storeId);
                actualInventoryLocationId = storeId; // Update to the actual shipping location
                itemShipped = true;
                break;
              }
            } catch (storeError) {
              console.log(`Store ${storeId} also doesn't have enough inventory`);
              continue;
            }
          }
        }
        
        if (!itemShipped) {
          throw lastError || new Error(`Insufficient inventory for product ${item.productId} in the region`);
        }
      }
      
      // Update order with the actual inventory location if it changed
      if (actualInventoryLocationId !== order.inventoryLocationId) {
        order.inventoryLocationId = actualInventoryLocationId;
        await order.save();
        console.log(`Order inventory location updated to ${actualInventoryLocationId}`);
      }
    } catch (inventoryError) {
      console.error('Inventory update error:', inventoryError);
      // If inventory update fails, we should rollback the order status
      order.status = 'processing';
      await order.save();
      return res.status(400).json({ message: inventoryError.message || 'Failed to update inventory' });
    }

    res.json(mapOrderResponse(order));
  } catch (error) {
    next(error);
  }
};
