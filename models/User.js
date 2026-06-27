import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true },
  nickname: { type: String, default: '' },
  username: { type: String, unique: true, sparse: true, default: null },
  profileImage: { type: String, default: null },
  diamonds: { type: Number, default: 500 },
  rank: { type: String, default: 'Oddiy askar' },
  lastDailyClaim: { type: String, default: null },
  createdAt: { type: String, default: () => new Date().toISOString() }
});

export default mongoose.model("User", userSchema);