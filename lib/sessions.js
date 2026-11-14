import Session from "../models/Session.js";
import User from "../models/User.js";
import {
  SESSION_TTL_MS,
  SESSION_ROTATE_MS,
  cookieOptions,
  hashToken,
  randomId,
  deviceLabel,
  clientIp
} from "./security.js";

const COOKIE = "sid";
const DEVICE_COOKIE = "did";
const DEVICE_TTL_MS = 365 * 24 * 60 * 60 * 1000;

export function ensureDeviceId(req, res) {
  let id = req.cookies?.did;
  if (!id || !/^[a-zA-Z0-9_-]{16,64}$/.test(id)) {
    id = randomId(16);
    res.cookie(DEVICE_COOKIE, id, cookieOptions(DEVICE_TTL_MS));
  }
  req.deviceId = id;
  return id;
}

export function setSessionCookie(res, raw) {
  res.cookie(COOKIE, raw, cookieOptions(SESSION_TTL_MS));
}

export function clearSessionCookie(res) {
  res.clearCookie(COOKIE, { ...cookieOptions(0), maxAge: 0 });
}

export async function createSession(res, user, req) {
  const raw = randomId(32);
  const now = new Date();
  await Session.create({
    userId: user._id,
    tokenHash: hashToken(raw),
    expiresAt: new Date(now.getTime() + SESSION_TTL_MS),
    ip: clientIp(req),
    userAgent: String(req.headers["user-agent"] || "").slice(0, 300),
    deviceId: req.deviceId || "",
    deviceLabel: deviceLabel(req.headers["user-agent"]),
    lastUsedAt: now
  });
  setSessionCookie(res, raw);
}

async function loadSessionFromRaw(raw) {
  if (!raw) return null;
  const tokenHash = hashToken(raw);
  const session = await Session.findOne({
    tokenHash,
    revokedAt: null,
    expiresAt: { $gt: new Date() }
  });
  return session;
}

export async function rotateIfNeeded(res, session, req) {
  const age = Date.now() - new Date(session.rotatedAt || session.createdAt).getTime();
  if (age < SESSION_ROTATE_MS) return session;
  const raw = randomId(32);
  session.tokenHash = hashToken(raw);
  session.rotatedAt = new Date();
  session.ip = clientIp(req);
  session.lastUsedAt = new Date();
  await session.save();
  setSessionCookie(res, raw);
  return session;
}

export async function resolveRequestAuth(req, res) {
  const raw = req.cookies?.[COOKIE];
  const session = await loadSessionFromRaw(raw);
  if (!session) return null;
  await rotateIfNeeded(res, session, req);
  session.lastUsedAt = new Date();
  await session.save();
  const user = await User.findById(session.userId);
  if (!user) return null;
  return { user, session, raw };
}

export async function resolveSocketAuth(cookieHeader) {
  const cookies = {};
  if (cookieHeader) {
    for (const part of cookieHeader.split(";")) {
      const idx = part.indexOf("=");
      if (idx === -1) continue;
      cookies[part.slice(0, idx).trim()] = decodeURIComponent(part.slice(idx + 1).trim());
    }
  }
  const session = await loadSessionFromRaw(cookies[COOKIE]);
  if (!session) return null;
  const user = await User.findById(session.userId);
  if (!user) return null;
  return { user, session };
}

export async function revokeCurrent(req, res) {
  const raw = req.cookies?.[COOKIE];
  const session = await loadSessionFromRaw(raw);
  if (session) {
    session.revokedAt = new Date();
    await session.save();
  }
  clearSessionCookie(res);
}

export async function revokeAllForUser(userId, res) {
  await Session.updateMany(
    { userId, revokedAt: null },
    { $set: { revokedAt: new Date() } }
  );
  if (res) clearSessionCookie(res);
}

export async function listSessions(userId, currentSessionId) {
  const rows = await Session.find({
    userId,
    revokedAt: null,
    expiresAt: { $gt: new Date() }
  }).sort({ lastUsedAt: -1 }).lean();
  return rows.map((s) => ({
    id: String(s._id),
    deviceLabel: s.deviceLabel,
    ip: s.ip,
    lastUsedAt: s.lastUsedAt,
    createdAt: s.createdAt,
    current: String(s._id) === String(currentSessionId)
  }));
}

export async function revokeOwnedSession(userId, sessionId) {
  const session = await Session.findOne({ _id: sessionId, userId, revokedAt: null });
  if (!session) return false;
  session.revokedAt = new Date();
  await session.save();
  return true;
}
