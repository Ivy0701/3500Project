import mongoose from 'mongoose';

/**
 * Inventory model (record inventory by product + location dimension)
 *
 * Corresponding to the inventory collection in the example:
 *   {
 *     locationId: "WH-EAST",
 *     productSku: "TSHIRT-BLUE-M",
 *     quantity: 150,
 *     minThreshold: 10,
 *     maxThreshold: 500,
 *     lastUpdated: ISODate("2023-11-28T10:30:00Z")
 *   }
 *
 * To be compatible with the existing frontend, we continue to keep the totalStock / available fields:
 *   - totalStock: The maximum capacity of the product at this location
 *   - available: Current available stock (will change with shipments/returns)
 */
const inventorySchema = new mongoose.Schema(
  {
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    // Location dimension: warehouse / store, e.g. "WH-CENTRAL", "WH-EAST", "STORE-EAST-01"
    locationId: { type: String, required: true },
    locationName: { type: String },
    region: { type: String },
    // Total capacity and available stock
    totalStock: { type: Number, required: true, min: 0, default: 200 },
    available: { type: Number, required: true, min: 0, default: 200 },
    // Warning thresholds
    minThreshold: { type: Number, min: 0, default: 0 },
    maxThreshold: { type: Number, min: 0 },
    lastUpdated: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// Only one record allowed for the same product at the same location
inventorySchema.index({ productId: 1, locationId: 1 }, { unique: true });
inventorySchema.index({ locationId: 1 });

const Inventory = mongoose.model('Inventory', inventorySchema);

export default Inventory;

