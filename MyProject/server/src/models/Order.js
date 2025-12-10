import mongoose from 'mongoose';

const timelineSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    time: { type: Date, required: true }
  },
  { _id: false }
);

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    color: { type: String },
    size: { type: String }
  },
  { _id: false }
);

const shippingAddressSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    // Full phone number (including country code), e.g. "+86 13800138000" or "+852 91234567"
    phone: { type: String, required: true },
    // Additional save country and phone code,便于后续根据地区做库存/路由策略
    country: { type: String },
    phoneCode: { type: String },
    street: { type: String, required: true },
    city: { type: String },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    notes: { type: String }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true },
    customerId: { type: String, required: true },
    customerName: { type: String, required: true },
    items: { type: [orderItemSchema], required: true },
    shippingAddress: { type: shippingAddressSchema, required: true },
    subtotal: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    remark: { type: String },
    // Inventory deduction location corresponding to the order, e.g. "STORE-DEFAULT", "STORE-EAST-01"
    inventoryLocationId: { type: String },
    inventoryStatus: { type: String, default: 'Inventory Checking' },
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'completed', 'cancelled', 'returned', 'after_sales_processing'],
      default: 'pending'
    },
    // After-sales (return / exchange) request info
    afterSales: {
      type: {
        type: String,
        enum: ['exchange', 'refund']
      },
      reason: { type: String },
      rejectionReason: { type: String }, // Sales staff's reason for rejection
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
      },
      createdAt: { type: Date },
      processedAt: { type: Date }
    },
    timeline: { type: [timelineSchema], default: [] }
  },
  { timestamps: true }
);

// Only define indexes in schema.index(), to avoid duplicates
orderSchema.index({ orderNumber: 1 }, { unique: true });
orderSchema.index({ customerId: 1 });

const Order = mongoose.model('Order', orderSchema);

export default Order;

