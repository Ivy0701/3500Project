import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    account: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    role: {
      type: String,
      enum: ['customer', 'sales', 'warehouse', 'regionalManager', 'centralManager'],
      required: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    /**
     * 轻量级库存权限模型（用于库存联动、调拨权限控制）
     *
     * - assignedLocationId: 用户主要负责的仓库/门店，例如 "WH-EAST"、"STORE-EAST-01"
     * - region: 负责的大区，例如 "ALL" | "EAST" | "WEST" | "NORTH" | "SOUTH"
     * - accessibleLocationIds: 该用户可以查看/操作库存的所有 locationId 列表
     *
     * 对应示例文档中的：
     *   role: "CENTRAL_MANAGER",
     *   assignedLocationId: "WH-CENTRAL",
     *   accessibleLocationIds: ["WH-CENTRAL", "WH-EAST", ...],
     *   region: "ALL"
     */
    assignedLocationId: {
      type: String,
      default: null
    },
    region: {
      type: String,
      default: null
    },
    accessibleLocationIds: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true
  }
);

const User = mongoose.model('User', userSchema);

export default User;



