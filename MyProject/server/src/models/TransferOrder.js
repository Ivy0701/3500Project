import mongoose from 'mongoose';

const historySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ['PENDING', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED'],
      required: true
    },
    note: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const transferOrderSchema = new mongoose.Schema(
  {
    transferId: { type: String, required: true, unique: true },
    productSku: { type: String, required: true },
    productName: { type: String },
    quantity: { type: Number, required: true, min: 1 },
    fromLocationId: { type: String, required: true },
    fromLocationName: { type: String, required: true },
    toLocationId: { type: String, required: true },
    toLocationName: { type: String, required: true },
    status: {
      type: String,
      enum: ['PENDING', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED'],
      default: 'PENDING'
    },
    dispatchInfo: {
      carrier: { type: String },
      dock: { type: String },
      departure: { type: Date },
      remark: { type: String }
    },
    history: {
      type: [historySchema],
      default: [
        {
          status: 'PENDING',
          note: 'Transfer order created'
        }
      ]
    },
    inventoryUpdated: { type: Boolean, default: false },
    requestId: { type: String, default: null }
  },
  { timestamps: true }
);

transferOrderSchema.index({ fromLocationId: 1, status: 1 });
transferOrderSchema.index({ toLocationId: 1, status: 1 });

export default mongoose.model('TransferOrder', transferOrderSchema);

