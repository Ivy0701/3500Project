import mongoose from 'mongoose';

const receivingLogSchema = new mongoose.Schema(
  {
    planNo: { type: String, required: true },
    supplier: { type: String, required: true },
    productSku: { type: String, required: true },
    received: { type: Number, required: true, min: 0 },
    qualified: { type: Number, required: true, min: 0 },
    storageLocationId: { type: String, required: true },
    issue: { type: String, default: '' },
    remark: { type: String, default: '' },
    status: {
      type: String,
      enum: ['success', 'warning'],
      default: 'success'
    },
    timestamp: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

receivingLogSchema.index({ planNo: 1, timestamp: -1 });

export default mongoose.model('ReceivingLog', receivingLogSchema);

