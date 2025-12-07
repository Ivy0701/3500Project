import mongoose from 'mongoose';

const replenishmentAlertSchema = new mongoose.Schema(
  {
    alertId: { type: String, required: true, unique: true },
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    stock: { type: Number, required: true },
    suggested: { type: Number, required: true },
    trigger: { type: String, required: true },
    warehouseId: { type: String, required: true },
    warehouseName: { type: String, required: true },
    level: {
      type: String,
      enum: ['warning', 'danger'],
      default: 'warning'
    },
    levelLabel: { type: String, default: 'Warning' },
    icon: { type: String, default: '📦' },
    threshold: { type: Number, default: 0 },
    shortageQty: { type: Number, default: 0 } // Shortage quantity
  },
  { timestamps: true }
);

replenishmentAlertSchema.index({ warehouseId: 1, level: 1 });

export default mongoose.model('ReplenishmentAlert', replenishmentAlertSchema);

