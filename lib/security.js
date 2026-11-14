import crypto from "crypto";

export const ALLOWED_COUNTRY_CODES = ["+998", "+7", "+996", "+992", "+966"];
export const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
export const SESSION_ROTATE_MS = 12 * 60 * 60 * 1000;
export const OTP_TTL_MS = 5 * 60 * 1000;
export const OTP_COOLDOWN_MS = 60 * 1000;
export const OTP_PHONE_HOUR_LIMIT = 5;
export const OTP_DEVICE_HOUR_LIMIT = 5;
export const OTP_MAX_ATTEMPTS = 5;
export const DAILY_DIAMOND_AMOUNT = 15;
export const CATEGORY_ENTRY_COST = 50;
export const SIGNUP_DIAMONDS = 500;
export const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export function isProduction() {
  return process.env.NODE_ENV === "production";
}

export function cookieSecure() {
  return isProduction() || Boolean(process.env.RENDER) || process.env.COOKIE_SECURE === "true";
}

export function cookieOptions(maxAge) {
  return {
    httpOnly: true,
    secure: cookieSecure(),
    sameSite: "lax",
    path: "/",
    maxAge
  };
}

export function isValidPhone(phone) {
  if (typeof phone !== "string") return false;
  return ALLOWED_COUNTRY_CODES.some((code) => phone.startsWith(code)) && /^\+\d{10,15}$/.test(phone);
}

export function clientIp(req) {
  // Express resolves the forwarded chain according to the configured trusted proxy count.
  // Reading X-Forwarded-For directly lets clients spoof rate-limit keys.
  return req.ip || req.socket?.remoteAddress || "";
}

export function hashToken(raw) {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

export function hashOtp(phone, code) {
  const pepper = process.env.OTP_PEPPER || process.env.SESSION_SECRET;
  if (!pepper && isProduction()) {
    throw new Error("Ishlab chiqarish muhitida OTP_PEPPER sozlanishi shart");
  }
  const effectivePepper = pepper || "otp_pepper_dev";
  return crypto.createHmac("sha256", effectivePepper).update(`${phone}:${code}`).digest("hex");
}

export function safeEqualHex(a, b) {
  if (!a || !b) return false;
  const bufA = Buffer.from(a, "hex");
  const bufB = Buffer.from(b, "hex");
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export function randomOtp6() {
  return crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");
}

export function randomId(bytes = 32) {
  return crypto.randomBytes(bytes).toString("base64url");
}

export function deviceLabel(ua = "") {
  const s = ua.slice(0, 180);
  if (/Android/i.test(s)) return "Android";
  if (/iPhone|iPad/i.test(s)) return "iOS";
  if (/Windows/i.test(s)) return "Windows";
  if (/Mac OS/i.test(s)) return "macOS";
  if (/Linux/i.test(s)) return "Linux";
  return "Qurilma";
}

export function parseCookies(header) {
  const out = {};
  if (!header) return out;
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const k = part.slice(0, idx).trim();
    const v = part.slice(idx + 1).trim();
    out[k] = decodeURIComponent(v);
  }
  return out;
}

export function isAdminUser(user) {
  const list = (process.env.ADMIN_PHONES || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (user?.phone && list.includes(user.phone)) return true;
  if (user?.isAdmin) return true;
  if (!isProduction() && process.env.DEV_ADMIN_ANY === "true") return true;
  return false;
}
