import mongoose from 'mongoose';

/**
 * 库存模型（按商品 + 位置 维度记录库存）
 *
 * 对应示例中的 inventory 集合：
 *   {
 *     locationId: "WH-EAST",
 *     productSku: "TSHIRT-BLUE-M",
 *     quantity: 150,
 *     minThreshold: 10,
 *     maxThreshold: 500,
 *     lastUpdated: ISODate("2023-11-28T10:30:00Z")
 *   }
 *
 * 为了兼容现有前端，这里继续保留 totalStock / available 字段：
 *   - totalStock: 该位置该商品的最大容量
 *   - available: 当前可用库存（会随发货/退货变化）
 */
const inventorySchema = new mongoose.Schema(
  {
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    // 位置维度：仓库 / 门店，例如 "WH-CENTRAL"、"WH-EAST"、"STORE-EAST-01"
    locationId: { type: String, required: true },
    locationName: { type: String },
    region: { type: String },
    // 总容量与可用库存
    totalStock: { type: Number, required: true, min: 0, default: 200 },
    available: { type: Number, required: true, min: 0, default: 200 },
    // 预警上下限
    minThreshold: { type: Number, min: 0, default: 0 },
    maxThreshold: { type: Number, min: 0 },
    lastUpdated: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// 一个位置同一商品只允许一条记录
inventorySchema.index({ productId: 1, locationId: 1 }, { unique: true });
inventorySchema.index({ locationId: 1 });

const Inventory = mongoose.model('Inventory', inventorySchema);

export default Inventory;

