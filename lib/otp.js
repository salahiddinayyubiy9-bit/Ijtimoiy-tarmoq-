import OtpChallenge from "../models/OtpChallenge.js";
import {
  OTP_TTL_MS,
  OTP_COOLDOWN_MS,
  OTP_PHONE_HOUR_LIMIT,
  OTP_DEVICE_HOUR_LIMIT,
  OTP_MAX_ATTEMPTS,
  hashOtp,
  randomOtp6,
  safeEqualHex,
  isProduction
} from "./security.js";

export async function issueOtp({ phone, ip, deviceId }) {
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const phoneCount = await OtpChallenge.countDocuments({ phone, createdAt: { $gte: hourAgo } });
  if (phoneCount >= OTP_PHONE_HOUR_LIMIT) {
    const err = new Error("Bu raqamga juda ko‘p kod yuborildi. Keyinroq urinib ko‘ring");
    err.code = "RATE";
    throw err;
  }
  if (deviceId) {
    const deviceCount = await OtpChallenge.countDocuments({ deviceId, createdAt: { $gte: hourAgo } });
    if (deviceCount >= OTP_DEVICE_HOUR_LIMIT) {
      const err = new Error("Bu qurilmadan juda ko‘p kod so‘raldi");
      err.code = "RATE";
      throw err;
    }
  }
  const latest = await OtpChallenge.findOne({ phone }).sort({ createdAt: -1 });
  if (latest && Date.now() - new Date(latest.createdAt).getTime() < OTP_COOLDOWN_MS) {
    const err = new Error("Kodni qayta so‘rash uchun biroz kuting");
    err.code = "COOLDOWN";
    throw err;
  }

  const code = randomOtp6();
  await OtpChallenge.create({
    phone,
    codeHash: hashOtp(phone, code),
    expiresAt: new Date(Date.now() + OTP_TTL_MS),
    attempts: 0,
    maxAttempts: OTP_MAX_ATTEMPTS,
    ip,
    deviceId: deviceId || ""
  });
  const expose = !isProduction() && !process.env.RENDER && process.env.OTP_DEBUG === "true";
  return { code, expose };
}

export async function verifyOtp({ phone, code, ip, deviceId }) {
  const challenge = await OtpChallenge.findOne({ phone }).sort({ createdAt: -1 });
  if (!challenge) {
    const err = new Error("Avval kod so‘rang");
    err.code = "MISSING";
    throw err;
  }
  const now = new Date();
  if (now.getTime() > new Date(challenge.expiresAt).getTime()) {
    await OtpChallenge.deleteOne({ _id: challenge._id, expiresAt: challenge.expiresAt });
    const err = new Error("Kod muddati tugagan");
    err.code = "EXPIRED";
    throw err;
  }
  if (challenge.attempts >= challenge.maxAttempts) {
    await OtpChallenge.deleteOne({ _id: challenge._id, consumedAt: null });
    const err = new Error("Urinishlar soni tugadi. Yangi kod so‘rang");
    err.code = "LOCKED";
    throw err;
  }
  const normalizedCode = typeof code === "string" ? code.trim() : "";

  const eligible = {
    _id: challenge._id,
    expiresAt: { $gt: now },
    attempts: { $lt: challenge.maxAttempts },
    consumedAt: null
  };
  const formatIsValid = /^\d{6}$/.test(normalizedCode);
  const matches = formatIsValid && safeEqualHex(hashOtp(phone, normalizedCode), challenge.codeHash);
  if (matches) {
    const consumed = await OtpChallenge.findOneAndUpdate(
      { ...eligible, codeHash: challenge.codeHash },
      { $set: { consumedAt: now } },
      { new: true }
    );
    if (consumed) return true;

    const err = new Error("Kod ishlatilgan yoki yaroqsiz");
    err.code = "INVALID";
    throw err;
  }

  const updated = await OtpChallenge.findOneAndUpdate(
    eligible,
    { $inc: { attempts: 1 } },
    { new: true }
  );
  if (!updated) {
    const err = new Error("Kod ishlatilgan yoki yaroqsiz");
    err.code = "INVALID";
    throw err;
  }
  const left = Math.max(0, updated.maxAttempts - updated.attempts);
  const err = new Error(left > 0 ? `Kod noto‘g‘ri. ${left} urinish qoldi` : "Kod noto‘g‘ri");
  err.code = "INVALID";
  throw err;
}
