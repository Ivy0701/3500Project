import mongoose from 'mongoose';

const orderCounterSchema = new mongoose.Schema(
  {
    date: { type: String, required: true, unique: true },
    seq: { type: Number, required: true, default: 0 }
  },
  { timestamps: true }
);

const OrderCounter = mongoose.model('OrderCounter', orderCounterSchema);

export default OrderCounter;

