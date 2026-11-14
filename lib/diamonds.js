import mongoose from "mongoose";
import User from "../models/User.js";
import DiamondTransaction, { DIAMOND_TYPES } from "../models/DiamondTransaction.js";
import { DAILY_DIAMOND_AMOUNT, CATEGORY_ENTRY_COST, ONE_DAY_MS, SIGNUP_DIAMONDS } from "./security.js";

export { DAILY_DIAMOND_AMOUNT, CATEGORY_ENTRY_COST, SIGNUP_DIAMONDS };

function assertType(type) {
  if (!DIAMOND_TYPES.includes(type)) throw new Error("Noto‘g‘ri transaction turi");
}

async function applyInSession(mongoSession, { userId, type, amount, referenceId, metadata, extraUserUpdate }) {
  assertType(type);
  if (!Number.isInteger(amount) || amount === 0) throw new Error("Noto‘g‘ri amount");
  const query = User.findById(userId);
  if (mongoSession) query.session(mongoSession);
  const user = await query;
  if (!user) throw new Error("Foydalanuvchi topilmadi");
  const balanceBefore = user.diamonds ?? 0;
  const balanceAfter = balanceBefore + amount;
  if (balanceAfter < 0) {
    const err = new Error("Olmosingiz yetarli emas");
    err.code = "INSUFFICIENT";
    throw err;
  }
  user.diamonds = balanceAfter;
  if (extraUserUpdate) extraUserUpdate(user);
  await user.save(mongoSession ? { session: mongoSession } : undefined);
  const payload = [{
    userId: user._id,
    type,
    amount,
    balanceBefore,
    balanceAfter,
    referenceId: referenceId || null,
    metadata: metadata || {},
    status: "completed"
  }];
  const created = mongoSession
    ? await DiamondTransaction.create(payload, { session: mongoSession })
    : await DiamondTransaction.create(payload);
  const tx = Array.isArray(created) ? created[0] : created;
  return { user, tx };
}

async function applyWithoutTransaction({ userId, type, amount, referenceId, metadata }) {
  assertType(type);
  if (!Number.isInteger(amount) || amount === 0) throw new Error("Noto‘g‘ri amount");
  const filter = { _id: userId };
  if (amount < 0) filter.diamonds = { $gte: -amount };
  const user = await User.findOneAndUpdate(
    filter,
    { $inc: { diamonds: amount } },
    { new: true, runValidators: true }
  );
  if (!user) {
    const exists = await User.exists({ _id: userId });
    if (!exists) throw new Error("Foydalanuvchi topilmadi");
    const err = new Error("Olmosingiz yetarli emas");
    err.code = "INSUFFICIENT";
    throw err;
  }
  const balanceAfter = user.diamonds ?? 0;
  const balanceBefore = balanceAfter - amount;
  const tx = await DiamondTransaction.create({
    userId: user._id,
    type,
    amount,
    balanceBefore,
    balanceAfter,
    referenceId: referenceId || null,
    metadata: metadata || {},
    status: "completed"
  });
  return { user, tx };
}

export async function applyDiamondChange(params) {
  const mongoSession = await mongoose.startSession();
  try {
    let result;
    await mongoSession.withTransaction(async () => {
      result = await applyInSession(mongoSession, params);
    });
    return result;
  } catch (err) {
    if (err.code === "INSUFFICIENT" || err.message === "Foydalanuvchi topilmadi") throw err;
    if (/transaction|replica set|IllegalOperation/i.test(String(err.message || ""))) {
      return applyWithoutTransaction(params);
    }
    throw err;
  } finally {
    await mongoSession.endSession();
  }
}

export async function grantSignupBonus(user) {
  if ((user.diamonds ?? 0) !== SIGNUP_DIAMONDS) return user;
  const exists = await DiamondTransaction.findOne({ userId: user._id, type: "OTHER", "metadata.reason": "signup" });
  if (exists) return user;
  await DiamondTransaction.create({
    userId: user._id,
    type: "OTHER",
    amount: SIGNUP_DIAMONDS,
    balanceBefore: 0,
    balanceAfter: SIGNUP_DIAMONDS,
    metadata: { reason: "signup" },
    status: "completed"
  });
  return user;
}

export async function claimDailyBonus(userId) {
  const now = new Date();
  const nowIso = now.toISOString();
  const eligibleBefore = new Date(now.getTime() - ONE_DAY_MS).toISOString();

  async function claim(session = null) {
    const filter = {
      _id: userId,
      $or: [
        { lastDailyClaim: null },
        { lastDailyClaim: { $exists: false } },
        { lastDailyClaim: { $lte: eligibleBefore } }
      ]
    };
    const query = User.findOneAndUpdate(
      filter,
      { $inc: { diamonds: DAILY_DIAMOND_AMOUNT }, $set: { lastDailyClaim: nowIso } },
      { new: true, runValidators: true }
    );
    if (session) query.session(session);
    const user = await query;
    if (!user) {
      const lookup = User.findById(userId);
      if (session) lookup.session(session);
      const existing = await lookup;
      if (!existing) throw new Error("Foydalanuvchi topilmadi");
      if (existing.lastDailyClaim) {
        const elapsed = now.getTime() - new Date(existing.lastDailyClaim).getTime();
        if (elapsed < ONE_DAY_MS) {
          const remainingHours = Math.ceil((ONE_DAY_MS - elapsed) / (60 * 60 * 1000));
          const err = new Error(`Yana ${remainingHours} soatdan keyin oling`);
          err.code = "COOLDOWN";
          throw err;
        }
      }
      throw new Error("Kunlik bonusni olish amalga oshmadi");
    }

    const balanceAfter = user.diamonds ?? 0;
    const txPayload = [{
      userId: user._id,
      type: "DAILY_BONUS",
      amount: DAILY_DIAMOND_AMOUNT,
      balanceBefore: balanceAfter - DAILY_DIAMOND_AMOUNT,
      balanceAfter,
      metadata: { source: "daily" },
      status: "completed"
    }];
    const created = session
      ? await DiamondTransaction.create(txPayload, { session })
      : await DiamondTransaction.create(txPayload);
    return { user, tx: Array.isArray(created) ? created[0] : created };
  }

  const mongoSession = await mongoose.startSession();
  try {
    let result;
    await mongoSession.withTransaction(async () => {
      result = await claim(mongoSession);
    });
    return result;
  } catch (err) {
    if (err.code === "COOLDOWN" || err.message === "Foydalanuvchi topilmadi") throw err;
    if (/transaction|replica set|IllegalOperation/i.test(String(err.message || ""))) {
      return claim();
    }
    throw err;
  } finally {
    await mongoSession.endSession();
  }
}

export async function chargeCategoryEntry(userId, category) {
  return applyDiamondChange({
    userId,
    type: "CATEGORY_ENTRY",
    amount: -CATEGORY_ENTRY_COST,
    referenceId: category || null,
    metadata: { category, cost: CATEGORY_ENTRY_COST }
  });
}

export async function adminAdjustDiamonds(userId, amount) {
  const n = Number(amount);
  if (!Number.isInteger(n) || n === 0) throw new Error("Noto‘g‘ri amount");
  return applyDiamondChange({
    userId,
    type: n > 0 ? "ADMIN_GRANT" : "ADMIN_DEDUCTION",
    amount: n,
    metadata: { source: "admin" }
  });
}
