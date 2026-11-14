import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server } from 'socket.io';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import multer from 'multer';

import { connectDB } from "./db.js";
import User from "./models/User.js";
import Room from "./models/Room.js";
import Conversation from "./models/Conversation.js";
import Report from "./models/Report.js";
import DiamondTransaction from "./models/DiamondTransaction.js";
import Session from "./models/Session.js";
import SecurityAuditEvent from "./models/SecurityAuditEvent.js";

import { deviceMiddleware, requireAuth, requireAdmin, publicProfile } from "./middleware/auth.js";
import { issueOtp, verifyOtp } from "./lib/otp.js";
import {
  createSession, revokeCurrent, revokeAllForUser, listSessions,
  revokeOwnedSession, resolveSocketAuth
} from "./lib/sessions.js";
import { claimDailyBonus, chargeCategoryEntry, adminAdjustDiamonds, grantSignupBonus, SIGNUP_DIAMONDS } from "./lib/diamonds.js";
import { processAvatar, safeAvatarName, removeAvatarFile } from "./lib/image.js";
import { validateUsername } from "./lib/username.js";
import { isValidPhone, clientIp } from "./lib/security.js";
import { recordSecurityEvent } from "./lib/audit.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const AVATAR_DIR = path.join(__dirname, 'uploads', 'avatars');

const app = express();
const PORT = process.env.PORT || 3000;
const MAX_ROOM_SIZE = 12;

app.set('trust proxy', 1);
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cookieParser());
app.use(deviceMiddleware);

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 200,
  message: { error: 'Juda ko\'p so\'rov yuborildi.' }
});
const codeLimiter = rateLimit({
  windowMs: 60 * 1000, max: 3,
  keyGenerator: (req) => `${clientIp(req)}:${req.deviceId || 'na'}`,
  message: { error: 'Juda ko\'p kod so\'rovi.' }
});
const verifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 20,
  message: { error: 'Juda ko\'p tasdiqlash urinishi.' }
});

app.use(generalLimiter);
app.use('/api/send-code', codeLimiter);
app.use('/api/verify-code', verifyLimiter);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json({ limit: '15mb' }));

const uploadAvatar = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }
});

function memberOf(conv, phone) {
  return conv.members?.includes(phone) || conv.subscribers?.includes(phone) || conv.createdBy === phone;
}

async function hasPrivateConversation(phoneA, phoneB) {
  if (!phoneA || !phoneB || phoneA === phoneB) return false;
  return Boolean(await Conversation.exists({
    type: 'private',
    members: { $all: [phoneA, phoneB], $size: 2 }
  }));
}

async function socketConversation(socket, convId) {
  if (!await socketSessionActive(socket) || !convId || !socket.rooms.has(`conv_${convId}`)) return null;
  const conv = await Conversation.findById(convId);
  return conv && memberOf(conv, socket.user?.phone) ? conv : null;
}

async function socketSessionActive(socket) {
  if (!socket.authSession?._id) return false;
  try {
    const active = await Session.exists({
      _id: socket.authSession._id,
      revokedAt: null,
      expiresAt: { $gt: new Date() }
    });
    if (!active) socket.disconnect(true);
    return Boolean(active);
  } catch {
    socket.disconnect(true);
    return false;
  }
}

app.get('/ping', (req, res) => res.json({ status: 'ok' }));

app.post('/api/send-code', async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: 'Telefon raqami kiritilmadi' });
  if (!isValidPhone(phone)) return res.status(400).json({ error: 'Bu davlatning raqami qabul qilinmaydi' });
  try {
    const { code, expose } = await issueOtp({ phone, ip: clientIp(req), deviceId: req.deviceId });
    await recordSecurityEvent({ action: 'OTP_REQUEST', outcome: 'success' });
    const payload = { success: true };
    if (expose) payload.debugOtp = code;
    res.json(payload);
  } catch (err) {
    await recordSecurityEvent({ action: 'OTP_REQUEST', outcome: 'failure' });
    const status = err.code === 'RATE' || err.code === 'COOLDOWN' ? 429 : 400;
    res.status(status).json({ error: err.message });
  }
});

app.post('/api/verify-code', async (req, res) => {
  const { phone, code } = req.body;
  if (!phone || !code) return res.status(400).json({ error: 'Telefon yoki kod kiritilmadi' });
  if (!isValidPhone(phone)) return res.status(400).json({ error: 'Bu davlatning raqami qabul qilinmaydi' });
  try {
    await verifyOtp({ phone, code, ip: clientIp(req), deviceId: req.deviceId });
    let user = await User.findOne({ phone });
    let isNewUser = false;
    if (!user) {
      user = new User({ phone, diamonds: SIGNUP_DIAMONDS, rank: 'Oddiy askar', lastDailyClaim: null });
      await user.save();
      await grantSignupBonus(user);
      isNewUser = true;
    }
    await createSession(res, user, req);
    await recordSecurityEvent({ actorId: user._id, action: 'AUTH_LOGIN', outcome: 'success' });
    res.json({ success: true, isNewUser, user: publicProfile(user, user) });
  } catch (err) {
    await recordSecurityEvent({ action: 'AUTH_LOGIN', outcome: 'failure' });
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/me', requireAuth, async (req, res) => {
  res.json({ success: true, user: publicProfile(req.user, req.user) });
});

app.post('/api/logout', requireAuth, async (req, res) => {
  await revokeCurrent(req, res);
  await recordSecurityEvent({ actorId: req.user._id, action: 'AUTH_LOGOUT', outcome: 'success' });
  res.json({ success: true });
});

app.post('/api/logout-all', requireAuth, async (req, res) => {
  await revokeAllForUser(req.user._id, res);
  await recordSecurityEvent({ actorId: req.user._id, action: 'AUTH_LOGOUT_ALL', outcome: 'success' });
  res.json({ success: true });
});

app.get('/api/sessions', requireAuth, async (req, res) => {
  const sessions = await listSessions(req.user._id, req.authSession._id);
  res.json({ success: true, sessions });
});

app.delete('/api/sessions/:id', requireAuth, async (req, res) => {
  const ok = await revokeOwnedSession(req.user._id, req.params.id);
  if (!ok) return res.status(404).json({ error: 'Sessiya topilmadi' });
  await recordSecurityEvent({ actorId: req.user._id, action: 'SESSION_REVOKE', outcome: 'success', targetType: 'session', targetId: req.params.id });
  res.json({ success: true });
});

app.post('/api/setup-profile', requireAuth, async (req, res) => {
  const { nickname, username } = req.body;
  if (!nickname) return res.status(400).json({ error: 'Nickname kiritilmadi' });
  try {
    const parsed = validateUsername(username);
    if (!parsed.ok) return res.status(400).json({ error: parsed.error });
    if (parsed.username) {
      const existing = await User.findOne({ username: parsed.username });
      if (existing && String(existing._id) !== String(req.user._id)) {
        return res.status(400).json({ error: 'Bu username allaqachon band' });
      }
    }
    req.user.nickname = String(nickname).slice(0, 30);
    req.user.username = parsed.username;
    await req.user.save();
    res.json({ success: true, user: publicProfile(req.user, req.user) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/profile/avatar', requireAuth, uploadAvatar.single('avatar'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Rasm yuborilmadi' });
  try {
    const filename = await processAvatar(req.file.buffer, req.file.mimetype, AVATAR_DIR);
    if (req.user.avatarFile) await removeAvatarFile(AVATAR_DIR, req.user.avatarFile);
    req.user.avatarFile = filename;
    req.user.profileImage = `/api/media/avatar/${filename}`;
    await req.user.save();
    res.json({ success: true, user: publicProfile(req.user, req.user) });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/profile/update-image', requireAuth, async (req, res) => {
  return res.status(400).json({ error: 'Avatarni /api/profile/avatar orqali yuklang' });
});

app.get('/api/media/avatar/:name', requireAuth, async (req, res) => {
  const name = safeAvatarName(req.params.name);
  if (!name) return res.status(400).json({ error: 'Noto‘g‘ri fayl' });
  res.sendFile(path.join(AVATAR_DIR, name), (err) => {
    if (err) res.status(404).json({ error: 'Topilmadi' });
  });
});

app.post('/api/profile/update', requireAuth, async (req, res) => {
  const { nickname, bio, birthDate, username, privacy } = req.body;
  try {
    if (username !== undefined) {
      const parsed = validateUsername(username);
      if (!parsed.ok) return res.status(400).json({ error: parsed.error });
      if (parsed.username) {
        const existing = await User.findOne({ username: parsed.username });
        if (existing && String(existing._id) !== String(req.user._id)) {
          return res.status(400).json({ error: 'Bu username allaqachon band' });
        }
      }
      req.user.username = parsed.username;
    }
    if (nickname !== undefined) req.user.nickname = String(nickname).slice(0, 30);
    if (bio !== undefined) req.user.bio = String(bio).slice(0, 150);
    if (birthDate !== undefined) {
      if (birthDate) {
        const d = new Date(birthDate);
        if (Number.isNaN(d.getTime()) || d > new Date()) {
          return res.status(400).json({ error: 'Tug‘ilgan kun noto‘g‘ri' });
        }
      }
      req.user.birthDate = birthDate || null;
    }
    if (privacy && typeof privacy === 'object') {
      req.user.privacy = {
        findByPhone: privacy.findByPhone !== false,
        showPhone: Boolean(privacy.showPhone),
        showBirthday: Boolean(privacy.showBirthday)
      };
    }
    await req.user.save();
    res.json({ success: true, user: publicProfile(req.user, req.user) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/users/status/:phone', requireAuth, async (req, res) => {
  try {
    if (!isValidPhone(req.params.phone) || !await hasPrivateConversation(req.user.phone, req.params.phone)) {
      return res.status(404).json({ error: 'Foydalanuvchi topilmadi' });
    }
    const user = await User.findOne({ phone: req.params.phone }).select('isOnline lastSeen');
    if (!user) return res.status(404).json({ error: 'Foydalanuvchi topilmadi' });
    res.json({ success: true, isOnline: user.isOnline, lastSeen: user.lastSeen });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/users/block', requireAuth, async (req, res) => {
  const { targetPhone } = req.body;
  if (!isValidPhone(targetPhone) || targetPhone === req.user.phone) return res.status(400).json({ error: 'Telefon raqami noto\'g\'ri' });
  try {
    const user = await User.findByIdAndUpdate(req.user._id, { $addToSet: { blockedUsers: targetPhone } }, { new: true });
    res.json({ success: true, user: publicProfile(user, user) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/users/unblock', requireAuth, async (req, res) => {
  const { targetPhone } = req.body;
  if (!isValidPhone(targetPhone) || targetPhone === req.user.phone) return res.status(400).json({ error: 'Telefon raqami noto\'g\'ri' });
  try {
    const user = await User.findByIdAndUpdate(req.user._id, { $pull: { blockedUsers: targetPhone } }, { new: true });
    res.json({ success: true, user: publicProfile(user, user) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/users/blocked-status', requireAuth, async (req, res) => {
  const { targetPhone } = req.query;
  try {
    if (!isValidPhone(targetPhone) || !await hasPrivateConversation(req.user.phone, targetPhone)) {
      return res.status(404).json({ error: 'Suhbat topilmadi' });
    }
    const target = await User.findOne({ phone: targetPhone });
    res.json({
      success: true,
      iBlockedThem: req.user.blockedUsers?.includes(targetPhone) || false,
      theyBlockedMe: target?.blockedUsers?.includes(req.user.phone) || false
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/reports/create', requireAuth, async (req, res) => {
  const { reportedUser, reason, details } = req.body;
  if (!reportedUser || !reason) return res.status(400).json({ error: 'Ma\'lumotlar yetarli emas' });
  try {
    const report = new Report({ reportedBy: req.user.phone, reportedUser, reason, details: details || '' });
    await report.save();
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/users/search', requireAuth, async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'Qidiruv matni kiritilmadi' });
  try {
    const raw = String(q).trim();
    const uname = raw.startsWith('@') ? raw.slice(1).toLowerCase() : raw.toLowerCase();
    const or = [{ username: uname }];
    if (isValidPhone(raw) || /^\+?\d{9,15}$/.test(raw)) {
      or.push({ phone: raw, 'privacy.findByPhone': { $ne: false } });
    }
    const users = await User.find({ $or: or });
    res.json({
      success: true,
      users: users.map((u) => publicProfile(u, req.user))
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/daily-claim', requireAuth, async (req, res) => {
  try {
    const { user } = await claimDailyBonus(req.user._id);
    res.json({ success: true, user: publicProfile(user, user) });
  } catch (err) {
    const status = err.code === 'COOLDOWN' ? 400 : 400;
    res.status(status).json({ error: err.message });
  }
});

app.post('/api/category-enter', requireAuth, async (req, res) => {
  const { category } = req.body || {};
  try {
    const { user } = await chargeCategoryEntry(req.user._id, category);
    res.json({ success: true, user: publicProfile(user, user) });
  } catch (err) {
    const status = err.code === 'INSUFFICIENT' ? 400 : 400;
    res.status(status).json({ error: err.message });
  }
});

app.get('/api/diamond-transactions', requireAuth, async (req, res) => {
  const rows = await DiamondTransaction.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(50);
  res.json({ success: true, transactions: rows });
});

app.post('/api/rooms/create', requireAuth, async (req, res) => {
  const { name, category } = req.body;
  if (!name || !category) return res.status(400).json({ error: 'Ma\'lumotlar yetarli emas' });
  try {
    const room = new Room({ name, category, createdBy: req.user.phone, messages: [] });
    await room.save();
    res.json({ success: true, room });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/rooms/:category', requireAuth, async (req, res) => {
  try {
    const rooms = await Room.find({ category: req.params.category });
    res.json({ success: true, rooms });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/rooms/single/:roomId', requireAuth, async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId);
    if (!room) return res.status(404).json({ error: 'Xona topilmadi' });
    res.json({ success: true, room });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/rooms/:roomId', requireAuth, async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId);
    if (!room) return res.status(404).json({ error: 'Xona topilmadi' });
    if (room.createdBy !== req.user.phone) return res.status(403).json({ error: 'Faqat yaratuvchi o\'chira oladi' });
    await Room.findByIdAndDelete(req.params.roomId);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/conversations/create', requireAuth, async (req, res) => {
  const { type, name, isPublic, targetPhone, targetUsername } = req.body;
  const phone = req.user.phone;
  if (!type) return res.status(400).json({ error: 'Ma\'lumotlar yetarli emas' });
  try {
    let conversation;
    if (type === 'private') {
      let targetUser = null;
      if (targetPhone) {
        targetUser = await User.findOne({ phone: targetPhone });
        if (targetUser?.privacy?.findByPhone === false) targetUser = null;
      }
      else if (targetUsername) targetUser = await User.findOne({ username: String(targetUsername).toLowerCase() });
      if (!targetUser) return res.status(404).json({ error: 'Foydalanuvchi topilmadi' });
      const existing = await Conversation.findOne({ type: 'private', members: { $all: [phone, targetUser.phone] } });
      if (existing) return res.json({ success: true, conversation: existing, isExisting: true });
      conversation = new Conversation({ type: 'private', members: [phone, targetUser.phone], admins: [phone], createdBy: phone });
    } else if (type === 'group') {
      if (!name) return res.status(400).json({ error: 'Guruh nomi kiritilmadi' });
      conversation = new Conversation({ type: 'group', name, isPublic: isPublic || false, members: [phone], admins: [phone], createdBy: phone });
    } else if (type === 'channel') {
      if (!name) return res.status(400).json({ error: 'Kanal nomi kiritilmadi' });
      conversation = new Conversation({ type: 'channel', name, isPublic: isPublic || false, members: [phone], admins: [phone], subscribers: [], createdBy: phone });
    }
    await conversation.save();
    res.json({ success: true, conversation });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/conversations', requireAuth, async (req, res) => {
  const { type } = req.query;
  const phone = req.user.phone;
  try {
    let query = { type };
    if (type === 'private' || type === 'group') query.members = phone;
    else if (type === 'channel') query.$or = [{ members: phone }, { subscribers: phone }];
    const conversations = await Conversation.find(query).select('-messages').sort({ lastMessageAt: -1 });
    res.json({ success: true, conversations });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/conversations/:id', requireAuth, async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) return res.status(404).json({ error: 'Suhbat topilmadi' });
    if (!memberOf(conversation, req.user.phone)) return res.status(403).json({ error: 'Ruxsat yo‘q' });
    res.json({ success: true, conversation });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/conversations/:id/subscribe', requireAuth, async (req, res) => {
  try {
    const conv = await Conversation.findById(req.params.id);
    if (!conv) return res.status(404).json({ error: 'Kanal topilmadi' });
    if (conv.type !== 'channel' || (!conv.isPublic && conv.createdBy !== req.user.phone)) return res.status(403).json({ error: 'Bu kanalga obuna bo‘lish mumkin emas' });
    if (!conv.subscribers.includes(req.user.phone)) { conv.subscribers.push(req.user.phone); await conv.save(); }
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/conversations/:id/unsubscribe', requireAuth, async (req, res) => {
  try {
    const conv = await Conversation.findById(req.params.id);
    if (!conv) return res.status(404).json({ error: 'Kanal topilmadi' });
    if (conv.type !== 'channel') return res.status(400).json({ error: 'Bu kanal emas' });
    conv.subscribers = conv.subscribers.filter(s => s !== req.user.phone);
    await conv.save();
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/conversations/:id/add-member', requireAuth, async (req, res) => {
  const { targetPhone, targetUsername } = req.body;
  const phone = req.user.phone;
  try {
    const conv = await Conversation.findById(req.params.id);
    if (!conv) return res.status(404).json({ error: 'Guruh topilmadi' });
    if (conv.type !== 'group') return res.status(400).json({ error: 'Bu guruh emas' });
    const selfJoin = conv.isPublic && (targetPhone === phone || (!targetPhone && !targetUsername));
    if (!selfJoin && (!conv.members.includes(phone) || !conv.admins.includes(phone))) return res.status(403).json({ error: 'Faqat guruh administratori a\'zo qo\'sha oladi' });
    let targetUser = null;
    if (selfJoin) targetUser = req.user;
    else if (targetPhone) targetUser = await User.findOne({ phone: targetPhone });
    else if (targetUsername) targetUser = await User.findOne({ username: String(targetUsername).toLowerCase() });
    if (!targetUser) return res.status(404).json({ error: 'Foydalanuvchi topilmadi' });
    if (conv.members.includes(targetUser.phone)) return res.status(400).json({ error: 'Bu foydalanuvchi allaqachon a\'zo' });
    conv.members.push(targetUser.phone);
    await conv.save();
    res.json({ success: true, conversation: conv });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/conversations/:id/leave', requireAuth, async (req, res) => {
  try {
    const conv = await Conversation.findById(req.params.id);
    if (!conv) return res.status(404).json({ error: 'Guruh topilmadi' });
    if (conv.type !== 'group') return res.status(400).json({ error: 'Bu guruh emas' });
    if (!conv.members.includes(req.user.phone)) return res.status(403).json({ error: 'Siz bu guruh a\'zosi emassiz' });
    conv.members = conv.members.filter(m => m !== req.user.phone);
    conv.admins = conv.admins.filter(a => a !== req.user.phone);
    await conv.save();
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/conversations/:id/messages/:msgId', requireAuth, async (req, res) => {
  try {
    const conv = await Conversation.findById(req.params.id);
    if (!conv) return res.status(404).json({ error: 'Suhbat topilmadi' });
    if (!memberOf(conv, req.user.phone)) return res.status(403).json({ error: 'Ruxsat yo‘q' });
    const msg = conv.messages.id(req.params.msgId);
    if (!msg) return res.status(404).json({ error: 'Xabar topilmadi' });
    if (msg.sender !== req.user.phone) return res.status(403).json({ error: 'Faqat o\'z xabaringizni o\'chira olasiz' });
    msg.deleted = true;
    msg.text = '[xabar o\'chirildi]';
    await conv.save();
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/discover', requireAuth, async (req, res) => {
  const { type } = req.query;
  try {
    if (!['group', 'channel'].includes(type)) return res.status(400).json({ error: 'Noto‘g‘ri tur' });
    const rows = await Conversation.find({ type, isPublic: true }).select('name type members subscribers lastMessageAt').sort({ lastMessageAt: -1 }).limit(50).lean();
    const items = rows.map((item) => ({
      _id: item._id,
      name: item.name,
      type: item.type,
      memberCount: item.type === 'channel' ? (item.subscribers || []).length : (item.members || []).length,
      joined: item.type === 'channel'
        ? (item.subscribers || []).includes(req.user.phone)
        : (item.members || []).includes(req.user.phone)
    }));
    res.json({ success: true, items });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/admin/users', requireAuth, requireAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-__v').sort({ createdAt: -1 });
    await recordSecurityEvent({ actorId: req.user._id, action: 'ADMIN_USERS_READ', outcome: 'success' });
    res.json({ success: true, users });
  }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/admin/rooms', requireAuth, requireAdmin, async (req, res) => {
  try {
    const rooms = await Room.find().select('-messages -__v').sort({ createdAt: -1 });
    await recordSecurityEvent({ actorId: req.user._id, action: 'ADMIN_ROOMS_READ', outcome: 'success' });
    res.json({ success: true, rooms });
  }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/admin/conversations', requireAuth, requireAdmin, async (req, res) => {
  try {
    const conversations = await Conversation.find().select('-messages -__v').sort({ createdAt: -1 });
    await recordSecurityEvent({ actorId: req.user._id, action: 'ADMIN_CONVERSATIONS_READ', outcome: 'success' });
    res.json({ success: true, conversations });
  }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/admin/reports', requireAuth, requireAdmin, async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 });
    await recordSecurityEvent({ actorId: req.user._id, action: 'ADMIN_REPORTS_READ', outcome: 'success' });
    res.json({ success: true, reports });
  }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/admin/security-events', requireAuth, requireAdmin, async (req, res) => {
  try {
    const events = await SecurityAuditEvent.find()
      .select('actorId action outcome targetType targetId createdAt -_id')
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    await recordSecurityEvent({ actorId: req.user._id, action: 'ADMIN_AUDIT_READ', outcome: 'success' });
    res.json({ success: true, events });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/admin/reports/:id/resolve', requireAuth, requireAdmin, async (req, res) => {
  try {
    await Report.findByIdAndUpdate(req.params.id, { status: 'resolved' });
    await recordSecurityEvent({ actorId: req.user._id, action: 'ADMIN_REPORT_RESOLVE', outcome: 'success', targetType: 'report', targetId: req.params.id });
    res.json({ success: true });
  }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/admin/users/:phone/diamonds', requireAuth, requireAdmin, async (req, res) => {
  try {
    const target = await User.findOne({ phone: req.params.phone });
    if (!target) return res.status(404).json({ error: 'Foydalanuvchi topilmadi' });
    const amount = Number(req.body.amount);
    const { user } = await adminAdjustDiamonds(target._id, amount);
    await recordSecurityEvent({ actorId: req.user._id, action: 'ADMIN_DIAMOND_ADJUST', outcome: 'success', targetType: 'user', targetId: target._id });
    res.json({ success: true, user: publicProfile(user, user) });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/admin/users/:phone', requireAuth, requireAdmin, async (req, res) => {
  try {
    const deleted = await User.findOneAndDelete({ phone: req.params.phone });
    if (deleted) await recordSecurityEvent({ actorId: req.user._id, action: 'ADMIN_USER_DELETE', outcome: 'success', targetType: 'user', targetId: deleted._id });
    res.json({ success: true });
  }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/admin/rooms/:roomId', requireAuth, requireAdmin, async (req, res) => {
  try {
    const deleted = await Room.findByIdAndDelete(req.params.roomId);
    if (deleted) await recordSecurityEvent({ actorId: req.user._id, action: 'ADMIN_ROOM_DELETE', outcome: 'success', targetType: 'room', targetId: deleted._id });
    res.json({ success: true });
  }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/admin/conversations/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const deleted = await Conversation.findByIdAndDelete(req.params.id);
    if (deleted) await recordSecurityEvent({ actorId: req.user._id, action: 'ADMIN_CONVERSATION_DELETE', outcome: 'success', targetType: 'conversation', targetId: deleted._id });
    res.json({ success: true });
  }
  catch (err) { res.status(500).json({ error: err.message }); }
});

const httpServer = createServer(app);
const io = new Server(httpServer, {
  maxHttpBufferSize: 15 * 1024 * 1024
});

io.use(async (socket, next) => {
  try {
    const auth = await resolveSocketAuth(socket.handshake.headers.cookie || '');
    if (!auth) return next(new Error('auth'));
    socket.user = auth.user;
    socket.authSession = auth.session;
    socket.userPhone = auth.user.phone;
    next();
  } catch (err) {
    next(new Error('auth'));
  }
});

io.on('connection', (socket) => {
  console.log('Ulandi:', socket.id);
  const actorPhone = () => socket.user?.phone;

  socket.on('joinRoom', (roomId) => {
    if (typeof roomId !== 'string' || !roomId) return;
    const key = roomId.toString();
    Promise.all([socketSessionActive(socket), Room.exists({ _id: key })]).then(([active, exists]) => {
      if (!active) return;
      if (!exists) return;
      const info = io.sockets.adapter.rooms.get(key);
      if ((info ? info.size : 0) >= MAX_ROOM_SIZE) { socket.emit('roomFull'); return; }
      socket.join(key);
    }).catch(() => {});
  });

  socket.on('joinConversation', async (convId) => {
    try {
      if (!await socketSessionActive(socket)) return;
      const conv = await Conversation.findById(convId);
      if (!conv || !memberOf(conv, actorPhone())) return;
      socket.join(`conv_${convId}`);
    } catch { /* ignore */ }
  });

  socket.on('sendMessage', async (data) => {
    const { roomId, text, imageData, audioData } = data;
    const phone = actorPhone();
    try {
      if (!await socketSessionActive(socket)) return;
      const room = await Room.findById(roomId);
      if (!room || !socket.rooms.has(String(roomId))) return;
      let msgText = text;
      if (imageData) msgText = `[image:${imageData}]`;
      else if (audioData) msgText = `[audio:${audioData}]`;
      const newMessage = { roomId, text: msgText, sender: phone, sentAt: new Date().toISOString() };
      room.messages.push(newMessage);
      await room.save();
      io.to(roomId.toString()).emit('newMessage', { roomId, text: msgText, sender: phone, sentAt: newMessage.sentAt });
    } catch (err) { console.log('sendMessage xato:', err.message); }
  });

  socket.on('sendConvMessage', async (data) => {
    const { convId, text, imageData, audioData, replyTo } = data;
    const phone = actorPhone();
    try {
      const conv = await socketConversation(socket, convId);
      if (!conv) return;
      if (conv.type === 'channel' && conv.createdBy !== phone) return;
      if (conv.type === 'private') {
        const otherPhone = conv.members.find(m => m !== phone);
        const sender = socket.user;
        const other = await User.findOne({ phone: otherPhone });
        if (sender?.blockedUsers?.includes(otherPhone) || other?.blockedUsers?.includes(phone)) {
          socket.emit('messageBlocked');
          return;
        }
      }
      let msgText = text;
      let lastMsg = text;
      let msgType = 'text';
      if (imageData) { msgText = `[image:${imageData}]`; lastMsg = '📷 Rasm'; msgType = 'image'; }
      else if (audioData) { msgText = `[audio:${audioData}]`; lastMsg = '🎤 Ovozli xabar'; msgType = 'audio'; }
      const newMessage = {
        text: msgText, sender: phone, senderNickname: socket.user.nickname || phone,
        sentAt: new Date().toISOString(), type: msgType,
        replyTo: replyTo || { msgId: null, text: '', sender: '' },
        deleted: false, edited: false, reactions: [], pinned: false
      };
      conv.messages.push(newMessage);
      conv.lastMessage = lastMsg;
      conv.lastMessageAt = newMessage.sentAt;
      await conv.save();
      const savedMsg = conv.messages[conv.messages.length - 1];
      io.to(`conv_${convId}`).emit('newConvMessage', { convId, message: savedMsg });
    } catch (err) { console.log('sendConvMessage xato:', err.message); }
  });

  socket.on('editConvMessage', async (data) => {
    const { convId, msgId, newText } = data;
    const phone = actorPhone();
    try {
      const conv = await socketConversation(socket, convId);
      if (!conv) return;
      const msg = conv.messages.id(msgId);
      if (!msg || msg.sender !== phone || msg.deleted) return;
      msg.text = newText;
      msg.edited = true;
      conv.lastMessage = newText;
      await conv.save();
      io.to(`conv_${convId}`).emit('convMessageEdited', { convId, msgId, newText });
    } catch (err) { console.log('editConvMessage xato:', err.message); }
  });

  socket.on('pinConvMessage', async (data) => {
    const { convId, msgId } = data;
    const phone = actorPhone();
    try {
      const conv = await socketConversation(socket, convId);
      if (!conv) return;
      if (!conv.admins.includes(phone) && conv.createdBy !== phone) return;
      conv.messages.forEach(m => { m.pinned = false; });
      const msg = conv.messages.id(msgId);
      if (msg) {
        msg.pinned = true;
        conv.pinnedMessageId = msgId;
      }
      await conv.save();
      io.to(`conv_${convId}`).emit('convMessagePinned', { convId, msgId, text: msg?.text || '' });
    } catch (err) { console.log('pinConvMessage xato:', err.message); }
  });

  socket.on('unpinConvMessage', async (data) => {
    const { convId } = data;
    const phone = actorPhone();
    try {
      const conv = await socketConversation(socket, convId);
      if (!conv) return;
      if (!conv.admins.includes(phone) && conv.createdBy !== phone) return;
      conv.messages.forEach(m => { m.pinned = false; });
      conv.pinnedMessageId = null;
      await conv.save();
      io.to(`conv_${convId}`).emit('convMessageUnpinned', { convId });
    } catch (err) { console.log('unpinConvMessage xato:', err.message); }
  });

  socket.on('reactConvMessage', async (data) => {
    const { convId, msgId, emoji } = data;
    const phone = actorPhone();
    try {
      const conv = await socketConversation(socket, convId);
      if (!conv) return;
      const msg = conv.messages.id(msgId);
      if (!msg) return;
      const existingIdx = msg.reactions.findIndex(r => r.phone === phone && r.emoji === emoji);
      if (existingIdx >= 0) {
        msg.reactions.splice(existingIdx, 1);
      } else {
        msg.reactions = msg.reactions.filter(r => r.phone !== phone);
        msg.reactions.push({ emoji, phone });
      }
      await conv.save();
      io.to(`conv_${convId}`).emit('convMessageReacted', { convId, msgId, reactions: msg.reactions });
    } catch (err) { console.log('reactConvMessage xato:', err.message); }
  });

  socket.on('typing', async (data = {}) => {
    const { convId } = data;
    if (await socketConversation(socket, convId)) socket.to(`conv_${convId}`).emit('userTyping', { convId, phone: actorPhone(), nickname: socket.user.nickname || actorPhone() });
  });

  socket.on('stopTyping', async (data = {}) => {
    const { convId } = data;
    if (await socketConversation(socket, convId)) socket.to(`conv_${convId}`).emit('userStopTyping', { convId, phone: actorPhone() });
  });

  socket.on('deleteConvMessage', async (data) => {
    const { convId, msgId } = data;
    const phone = actorPhone();
    try {
      const conv = await socketConversation(socket, convId);
      if (!conv) return;
      const msg = conv.messages.id(msgId);
      if (!msg || msg.sender !== phone) return;
      msg.deleted = true;
      msg.text = '[xabar o\'chirildi]';
      await conv.save();
      io.to(`conv_${convId}`).emit('convMessageDeleted', { convId, msgId });
    } catch (err) { console.log('deleteConvMessage xato:', err.message); }
  });

  socket.on('webrtc-offer', async (data = {}) => {
    if (await socketConversation(socket, data.convId)) socket.to(`conv_${data.convId}`).emit('webrtc-offer', { convId: data.convId, offer: data.offer, from: socket.id });
  });
  socket.on('webrtc-answer', async (data = {}) => {
    if (await socketConversation(socket, data.convId)) socket.to(`conv_${data.convId}`).emit('webrtc-answer', { convId: data.convId, answer: data.answer, from: socket.id });
  });
  socket.on('webrtc-ice', async (data = {}) => {
    if (await socketConversation(socket, data.convId)) socket.to(`conv_${data.convId}`).emit('webrtc-ice', { convId: data.convId, candidate: data.candidate, from: socket.id });
  });
  socket.on('webrtc-end', async (data = {}) => {
    if (await socketConversation(socket, data.convId)) socket.to(`conv_${data.convId}`).emit('webrtc-end', { convId: data.convId });
  });

  socket.on('setOnline', async () => {
    const phone = actorPhone();
    try {
      if (!await socketSessionActive(socket)) return;
      await User.findOneAndUpdate({ phone }, { isOnline: true });
      socket.broadcast.emit('userOnline', { phone });
    } catch (err) { console.log('setOnline xato:', err.message); }
  });

  socket.on('disconnect', async () => {
    console.log('Uzildi:', socket.id);
    const phone = actorPhone();
    if (phone) {
      try {
        const lastSeen = new Date().toISOString();
        await User.findOneAndUpdate({ phone }, { isOnline: false, lastSeen });
        socket.broadcast.emit('userOffline', { phone, lastSeen });
      } catch (err) { console.log('disconnect xato:', err.message); }
    }
  });
});

const startServer = async () => {
  await connectDB();
  httpServer.listen(PORT, () => {
    console.log(`Server ishga tushdi: http://localhost:${PORT}`);
    const RENDER_URL = process.env.RENDER_URL || `http://localhost:${PORT}`;
    setInterval(async () => {
      try { await fetch(`${RENDER_URL}/ping`); console.log('[PING] ok'); }
      catch (err) { console.log('[PING] xato:', err.message); }
    }, 14 * 60 * 1000);
  });
};

startServer().catch((err) => {
  const code = /^[A-Z0-9_]+$/i.test(String(err?.code || "")) ? String(err.code).toUpperCase() : "STARTUP_FAILED";
  console.error(`Server ishga tushmadi (${code}).`);
  process.exitCode = 1;
});
