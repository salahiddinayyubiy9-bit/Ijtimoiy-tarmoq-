import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://salahiddinayyubiy9_db_user:xKBs6k2scr5rW3gk@ijtimoiy-tarmoq.yktrrmf.mongodb.net/ijtimoiy_tarmoq?retryWrites=true&w=majority"
    );
    console.log("✅ MongoDB ulandi!");
  } catch (err) {
    console.log("❌ MongoDB xato:", err.message);
    process.exit(1);
  }
};
