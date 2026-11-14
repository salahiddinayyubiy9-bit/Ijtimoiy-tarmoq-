import mongoose from "mongoose";

function safeConnectionCode(error) {
  const message = String(error?.message || "");
  const rawCode = error?.code || error?.cause?.code;
  if (rawCode && /^[A-Z0-9_]+$/i.test(String(rawCode))) return String(rawCode).toUpperCase();
  if (/ENOTFOUND|querySrv/i.test(message)) return "ENOTFOUND";
  if (/authentication failed|bad auth/i.test(message)) return "AUTHENTICATION_FAILED";
  if (/IP.*access|not authorized.*IP/i.test(message)) return "IP_ACCESS_DENIED";
  return "CONNECTION_FAILED";
}

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) {
    const error = new Error("MONGODB_URI sozlanmagan.");
    error.code = "MISSING_URI";
    throw error;
  }
  if (!/^mongodb(?:\+srv)?:\/\//i.test(uri)) {
    const error = new Error("MONGODB_URI MongoDB ulanish manzili emas.");
    error.code = "INVALID_URI";
    throw error;
  }

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
    console.log("✅ MongoDB ulandi!");
  } catch (err) {
    const error = new Error("MongoDB bilan ulanish amalga oshmadi.");
    error.code = safeConnectionCode(err);
    throw error;
  }
};
