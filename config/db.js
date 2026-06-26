import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB ulandi!");
  } catch (err) {
    console.log("❌ MongoDB xato:", err.message);
    process.exit(1);
  }
};