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
     * Lightweight inventory permission model (for inventory linkage, transfer permission control)
     *
     * - assignedLocationId: The warehouse/store the user is primarily responsible for, e.g. "WH-EAST", "STORE-EAST-01"
     * - region: The region the user is responsible for, e.g. "ALL" | "EAST" | "WEST" | "NORTH" | "SOUTH"
     * - accessibleLocationIds: The list of all locationId that the user can view/operate the inventory
     *
     * Corresponding to the example document:
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



