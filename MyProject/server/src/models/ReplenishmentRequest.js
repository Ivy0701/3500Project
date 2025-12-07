import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    desc: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed'],
      default: 'pending'
    },
    timestamp: { type: Date, default: Date.now }
  },
  { _id: false }
);

const replenishmentRequestSchema = new mongoose.Schema(
  {
    requestId: { type: String, required: true, unique: true },
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    vendor: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    deliveryDate: { type: Date, required: true },
    remark: { type: String, default: '' },
    warehouseId: { type: String, required: true },
    warehouseName: { type: String, required: true },
    reason: { type: String, default: '' },
    status: {
      type: String,
      enum: ['PENDING', 'PROCESSING', 'APPROVED', 'IN_TRANSIT', 'ARRIVED', 'REJECTED', 'COMPLETED'],
      default: 'PENDING'
    },
    progress: { type: [progressSchema], default: [] }
  },
  { timestamps: true }
);

replenishmentRequestSchema.index({ status: 1 });

export default mongoose.model('ReplenishmentRequest', replenishmentRequestSchema);

