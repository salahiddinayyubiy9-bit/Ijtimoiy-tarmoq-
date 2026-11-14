import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true },
  nickname: { type: String, default: "" },
  username: { type: String, unique: true, sparse: true, default: null },
  profileImage: { type: String, default: null },
  avatarFile: { type: String, default: null },
  bio: { type: String, default: "" },
  birthDate: { type: String, default: null },
  isOnline: { type: Boolean, default: false },
  lastSeen: { type: String, default: () => new Date().toISOString() },
  blockedUsers: [{ type: String }],
  diamonds: { type: Number, default: 500 },
  rank: { type: String, default: "Oddiy askar" },
  lastDailyClaim: { type: String, default: null },
  isAdmin: { type: Boolean, default: false },
  privacy: {
    findByPhone: { type: Boolean, default: true },
    showPhone: { type: Boolean, default: false },
    showBirthday: { type: Boolean, default: false }
  },
  createdAt: { type: String, default: () => new Date().toISOString() }
});

export default mongoose.model("User", userSchema);
