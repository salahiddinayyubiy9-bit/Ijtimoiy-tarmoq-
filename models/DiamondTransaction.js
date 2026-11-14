import mongoose from "mongoose";

export const DIAMOND_TYPES = [
  "DAILY_BONUS",
  "CATEGORY_ENTRY",
  "SECRET_CHAT",
  "PREMIUM",
  "GIFT",
  "ADMIN_GRANT",
  "ADMIN_DEDUCTION",
  "REFUND",
  "OTHER"
];

const diamondTransactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  type: { type: String, enum: DIAMOND_TYPES, required: true },
  amount: { type: Number, required: true },
  balanceBefore: { type: Number, required: true },
  balanceAfter: { type: Number, required: true },
  referenceId: { type: String, default: null },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  status: { type: String, enum: ["pending", "completed", "failed"], default: "completed", index: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("DiamondTransaction", diamondTransactionSchema);
