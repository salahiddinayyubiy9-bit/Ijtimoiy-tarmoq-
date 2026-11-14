import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "./db.js";

try {
  await connectDB();
  await mongoose.connection.db.admin().command({ ping: 1 });
  console.log("MongoDB ping tekshiruvi muvaffaqiyatli.");
} catch (err) {
  const code = /^[A-Z0-9_]+$/i.test(String(err?.code || "")) ? String(err.code).toUpperCase() : "CONNECTION_FAILED";
  console.error(`MongoDB tekshiruvi bajarilmadi (${code}).`);
  process.exitCode = 1;
} finally {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}
