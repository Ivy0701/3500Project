import mongoose from 'mongoose';

const receivingScheduleSchema = new mongoose.Schema(
  {
    planNo: { type: String, required: true, unique: true },
    supplier: { type: String, required: true },
    eta: { type: Date, required: true },
    dock: { type: String, required: true },
    items: { type: Number, default: 0 },
    productSku: { type: String, required: true },
    productName: { type: String },
    quantity: { type: Number, required: true, min: 1 },
    storageLocationId: { type: String, default: null },
    qualityLevel: { type: String, default: 'A' },
    status: {
      type: String,
      enum: ['PENDING', 'IN_TRANSIT', 'ARRIVED'],
      default: 'PENDING'
    }
  },
  { timestamps: true }
);

receivingScheduleSchema.index({ status: 1 });

export default mongoose.model('ReceivingSchedule', receivingScheduleSchema);

