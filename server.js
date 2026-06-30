import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server } from 'socket.io';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import { connectDB } from "./db.js";
import User from "./models/User.js";
import Room from "./models/Room.js";
import Conversation from "./models/Conversation.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'admin_secret_2026';

app.use(helmet({ contentSecurityPolicy: false }));

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 100,
  message: { error: 'Juda ko\'p so\'rov yuborildi.' }
});
const codeLimiter = rateLimit({
  windowMs: 60 * 1000, max: 3,
  message: { error: 'Juda ko\'p kod so\'rovi.' }
});

app.use(generalLimiter);
app.use('/api/send-code', codeLimiter);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json({ limit: '15mb' }));

const verificationCodes = {};
const MAX_ROOM_SIZE = 12;
const DAILY_DIAMOND_AMOUNT = 15;
const CATEGORY_ENTRY_COST = 50;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const ALLOWED_COUNTRY_CODES = ['+998', '+7', '+996', '+992', '+966'];

function generateCode() { return Math.floor(1000 + Math.random() * 9000).toString(); }
function isValidPhone(phone) { return ALLOWED_COUNTRY_CODES.some(code => phone.startsWith(code)); }

app.get('/ping', (req, res) => res.json({ status: 'ok' }));

// ===== AUTH =====
app.post('/api/send-code', async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: 'Telefon raqami kiritilmadi' });
  if (!isValidPhone(phone)) return res.status(400).json({ error: 'Bu davlatning raqami qabul qilinmaydi' });
  const code = generateCode();
  verificationCodes[phone] = { code, expiresAt: Date.now() + 5 * 60 * 1000 };
  console.log(`[TEST] ${phone} => ${code}`);
  res.json({ success: true, testCode: code });
});

app.post('/api/verify-code', async (req, res) => {
  const { phone, code } = req.body;
  if (!phone || !code) return res.status(400).json({ error: 'Telefon yoki kod kiritilmadi' });
  const record = verificationCodes[phone];
  if (!record) return res.status(400).json({ error: 'Avval kod so\'rang' });
  if (Date.now() > record.expiresAt) { delete verificationCodes[phone]; return res.status(400).json({ error: 'Kod muddati tugagan' }); }
  if (record.code !== code) return res.status(400).json({ error: 'Kod noto\'g\'ri' });
  delete verificationCodes[phone];
  try {
    let user = await User.findOne({ phone });
    if (!user) {
      user = new User({ phone, diamonds: 500, rank: 'Oddiy askar', lastDailyClaim: null });
      await user.save();
      return res.json({ success: true, isNewUser: true, user });
    }
    res.json({ success: true, isNewUser: false, user });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/setup-profile', async (req, res) => {
  const { phone, nickname, username } = req.body;
  if (!phone || !nickname) return res.status(400).json({ error: 'Telefon va nickname kiritilmadi' });
  try {
    if (username) {
      const existing = await User.findOne({ username });
      if (existing && existing.phone !== phone) return res.status(400).json({ error: 'Bu username allaqachon band' });
    }
    const user = await User.findOneAndUpdate({ phone }, { nickname, username: username || null }, { new: true });
    res.json({ success: true, user });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/profile/update-image', async (req, res) => {
  const { phone, imageData } = req.body;
  if (!phone || !imageData) return res.status(400).json({ error: 'Ma\'lumotlar yetarli emas' });
  try {
    const user = await User.findOneAndUpdate({ phone }, { profileImage: imageData }, { new: true });
    if (!user) return res.status(404).json({ error: 'Foydalanuvchi topilmadi' });
    res.json({ success: true, user });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ===== PROFIL TAHRIRLASH (#6, #7, #8) =====
app.post('/api/profile/update', async (req, res) => {
  const { phone, nickname, bio, birthDate, username } = req.body;
  if (!phone) return res.status(400).json({ error: 'Telefon kiritilmadi' });
  try {
    if (username) {
      const existing = await User.findOne({ username });
      if (existing && existing.phone !== phone) return res.status(400).json({ error: 'Bu username allaqachon band' });
    }
    const update = {};
    if (nickname !== undefined) update.nickname = nickname;
    if (bio !== undefined) update.bio = bio;
    if (birthDate !== undefined) update.birthDate = birthDate;
    if (username !== undefined) update.username = username || null;
    const user = await User.findOneAndUpdate({ phone }, update, { new: true });
    if (!user) return res.status(404).json({ error: 'Foydalanuvchi topilmadi' });
    res.json({ success: true, user });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ===== ONLINE HOLATI / SO'NGGI KO'RILGAN (#9, #10) =====
app.get('/api/users/status/:phone', async (req, res) => {
  try {
    const user = await User.findOne({ phone: req.params.phone }).select('isOnline lastSeen');
    if (!user) return res.status(404).json({ error: 'Foydalanuvchi topilmadi' });
    res.json({ success: true, isOnline: user.isOnline, lastSeen: user.lastSeen });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/users/search', async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'Qidiruv matni kiritilmadi' });
  try {
    const users = await User.find({
      $or: [{ phone: q }, { username: q.startsWith('@') ? q.slice(1) : q }]
    }).select('phone nickname username profileImage rank bio isOnline lastSeen');
    res.json({ success: true, users });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/daily-claim', async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: 'Telefon kiritilmadi' });
  try {
    const user = await User.findOne({ phone });
    if (!user) return res.status(404).json({ error: 'Foydalanuvchi topilmadi' });
    if (user.lastDailyClaim) {
      const elapsed = Date.now() - new Date(user.lastDailyClaim).getTime();
      if (elapsed < ONE_DAY_MS) {
        const remainingHours = Math.ceil((ONE_DAY_MS - elapsed) / (60 * 60 * 1000));
        return res.status(400).json({ error: `Yana ${remainingHours} soatdan keyin oling` });
      }
    }
    user.diamonds += DAILY_DIAMOND_AMOUNT;
    user.lastDailyClaim = new Date().toISOString();
    await user.save();
    res.json({ success: true, user });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/category-enter', async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: 'Telefon kiritilmadi' });
  try {
    const user = await User.findOne({ phone });
    if (!user) return res.status(404).json({ error: 'Foydalanuvchi topilmadi' });
    if (user.diamonds < CATEGORY_ENTRY_COST) return res.status(400).json({ error: 'Olmosingiz yetarli emas' });
    user.diamonds -= CATEGORY_ENTRY_COST;
    await user.save();
    res.json({ success: true, user });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ===== ROOMS =====
app.post('/api/rooms/create', async (req, res) => {
  const { name, category, phone } = req.body;
  if (!name || !category || !phone) return res.status(400).json({ error: 'Ma\'lumotlar yetarli emas' });
  try {
    const room = new Room({ name, category, createdBy: phone, messages: [] });
    await room.save();
    res.json({ success: true, room });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/rooms/:category', async (req, res) => {
  try {
    const rooms = await Room.find({ category: req.params.category });
    res.json({ success: true, rooms });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/rooms/single/:roomId', async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId);
    if (!room) return res.status(404).json({ error: 'Xona topilmadi' });
    res.json({ success: true, room });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/rooms/:roomId', async (req, res) => {
  const { phone } = req.body;
  try {
    const room = await Room.findById(req.params.roomId);
    if (!room) return res.status(404).json({ error: 'Xona topilmadi' });
    if (room.createdBy !== phone) return res.status(403).json({ error: 'Faqat yaratuvchi o\'chira oladi' });
    await Room.findByIdAndDelete(req.params.roomId);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ===== CONVERSATIONS =====
app.post('/api/conversations/create', async (req, res) => {
  const { type, name, phone, isPublic, targetPhone, targetUsername } = req.body;
  if (!phone || !type) return res.status(400).json({ error: 'Ma\'lumotlar yetarli emas' });
  try {
    let conversation;
    if (type === 'private') {
      let targetUser = null;
      if (targetPhone) targetUser = await User.findOne({ phone: targetPhone });
      else if (targetUsername) targetUser = await User.findOne({ username: targetUsername });
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

app.get('/api/conversations', async (req, res) => {
  const { phone, type } = req.query;
  if (!phone) return res.status(400).json({ error: 'Telefon kiritilmadi' });
  try {
    let query = { type };
    if (type === 'private' || type === 'group') query.members = phone;
    else if (type === 'channel') query.$or = [{ members: phone }, { subscribers: phone }];
    const conversations = await Conversation.find(query).select('-messages').sort({ lastMessageAt: -1 });
    res.json({ success: true, conversations });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/conversations/:id', async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) return res.status(404).json({ error: 'Suhbat topilmadi' });
    res.json({ success: true, conversation });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/conversations/:id/subscribe', async (req, res) => {
  const { phone } = req.body;
  try {
    const conv = await Conversation.findById(req.params.id);
    if (!conv) return res.status(404).json({ error: 'Kanal topilmadi' });
    if (!conv.subscribers.includes(phone)) { conv.subscribers.push(phone); await conv.save(); }
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/conversations/:id/unsubscribe', async (req, res) => {
  const { phone } = req.body;
  try {
    const conv = await Conversation.findById(req.params.id);
    if (!conv) return res.status(404).json({ error: 'Kanal topilmadi' });
    conv.subscribers = conv.subscribers.filter(s => s !== phone);
    await conv.save();
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ===== GURUHGA A'ZO QO'SHISH =====
app.post('/api/conversations/:id/add-member', async (req, res) => {
  const { phone, targetPhone, targetUsername } = req.body;
  try {
    const conv = await Conversation.findById(req.params.id);
    if (!conv) return res.status(404).json({ error: 'Guruh topilmadi' });
    if (!conv.admins.includes(phone)) return res.status(403).json({ error: 'Faqat admin a\'zo qo\'sha oladi' });
    let targetUser = null;
    if (targetPhone) targetUser = await User.findOne({ phone: targetPhone });
    else if (targetUsername) targetUser = await User.findOne({ username: targetUsername });
    if (!targetUser) return res.status(404).json({ error: 'Foydalanuvchi topilmadi' });
    if (conv.members.includes(targetUser.phone)) return res.status(400).json({ error: 'Bu foydalanuvchi allaqachon a\'zo' });
    conv.members.push(targetUser.phone);
    await conv.save();
    res.json({ success: true, conversation: conv });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ===== GURUHDAN CHIQISH =====
app.post('/api/conversations/:id/leave', async (req, res) => {
  const { phone } = req.body;
  try {
    const conv = await Conversation.findById(req.params.id);
    if (!conv) return res.status(404).json({ error: 'Guruh topilmadi' });
    conv.members = conv.members.filter(m => m !== phone);
    conv.admins = conv.admins.filter(a => a !== phone);
    await conv.save();
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ===== XABARNI O'CHIRISH =====
app.delete('/api/conversations/:id/messages/:msgId', async (req, res) => {
  const { phone } = req.body;
  try {
    const conv = await Conversation.findById(req.params.id);
    if (!conv) return res.status(404).json({ error: 'Suhbat topilmadi' });
    const msg = conv.messages.id(req.params.msgId);
    if (!msg) return res.status(404).json({ error: 'Xabar topilmadi' });
    if (msg.sender !== phone) return res.status(403).json({ error: 'Faqat o\'z xabaringizni o\'chira olasiz' });
    msg.deleted = true;
    msg.text = '[xabar o\'chirildi]';
    await conv.save();
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ===== OMMAVIY GURUH/KANAL KASHFIYOTI =====
app.get('/api/discover', async (req, res) => {
  const { type } = req.query;
  try {
    const items = await Conversation.find({ type: type, isPublic: true })
      .select('-messages')
      .sort({ lastMessageAt: -1 })
      .limit(50);
    res.json({ success: true, items });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ===== ADMIN =====
function adminAuth(req, res, next) {
  if (req.headers['x-admin-secret'] !== ADMIN_SECRET) return res.status(403).json({ error: 'Ruxsat yo\'q' });
  next();
}

app.get('/api/admin/users', adminAuth, async (req, res) => {
  try { res.json({ success: true, users: await User.find().select('-__v').sort({ createdAt: -1 }) }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/admin/rooms', adminAuth, async (req, res) => {
  try { res.json({ success: true, rooms: await Room.find().select('-messages -__v').sort({ createdAt: -1 }) }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/admin/conversations', adminAuth, async (req, res) => {
  try { res.json({ success: true, conversations: await Conversation.find().select('-messages -__v').sort({ createdAt: -1 }) }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/admin/users/:phone/diamonds', adminAuth, async (req, res) => {
  try {
    const user = await User.findOneAndUpdate({ phone: req.params.phone }, { $inc: { diamonds: req.body.amount } }, { new: true });
    if (!user) return res.status(404).json({ error: 'Foydalanuvchi topilmadi' });
    res.json({ success: true, user });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/admin/users/:phone', adminAuth, async (req, res) => {
  try { await User.findOneAndDelete({ phone: req.params.phone }); res.json({ success: true }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/admin/rooms/:roomId', adminAuth, async (req, res) => {
  try { await Room.findByIdAndDelete(req.params.roomId); res.json({ success: true }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/admin/conversations/:id', adminAuth, async (req, res) => {
  try { await Conversation.findByIdAndDelete(req.params.id); res.json({ success: true }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

// ===== SOCKET.IO =====
const httpServer = createServer(app);
const io = new Server(httpServer, { maxHttpBufferSize: 15 * 1024 * 1024 });

io.on('connection', (socket) => {
  console.log('Ulandi:', socket.id);

  socket.on('joinRoom', (roomId) => {
    const key = roomId.toString();
    const info = io.sockets.adapter.rooms.get(key);
    if ((info ? info.size : 0) >= MAX_ROOM_SIZE) { socket.emit('roomFull'); return; }
    socket.join(key);
  });

  socket.on('joinConversation', (convId) => socket.join(`conv_${convId}`));

  socket.on('sendMessage', async (data) => {
    const { roomId, text, phone, imageData, audioData } = data;
    try {
      const room = await Room.findById(roomId);
      if (!room) return;
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
    const { convId, text, phone, senderNickname, imageData, audioData, replyTo } = data;
    try {
      const conv = await Conversation.findById(convId);
      if (!conv) return;
      if (conv.type === 'channel' && conv.createdBy !== phone) return;
      let msgText = text;
      let lastMsg = text;
      let msgType = 'text';
      if (imageData) { msgText = `[image:${imageData}]`; lastMsg = '📷 Rasm'; msgType = 'image'; }
      else if (audioData) { msgText = `[audio:${audioData}]`; lastMsg = '🎤 Ovozli xabar'; msgType = 'audio'; }
      const newMessage = {
        text: msgText,
        sender: phone,
        senderNickname: senderNickname || phone,
        sentAt: new Date().toISOString(),
        type: msgType,
        replyTo: replyTo || { msgId: null, text: '', sender: '' },
        deleted: false
      };
      conv.messages.push(newMessage);
      conv.lastMessage = lastMsg;
      conv.lastMessageAt = newMessage.sentAt;
      await conv.save();
      const savedMsg = conv.messages[conv.messages.length - 1];
      io.to(`conv_${convId}`).emit('newConvMessage', { convId, message: savedMsg });
    } catch (err) { console.log('sendConvMessage xato:', err.message); }
  });

  socket.on('deleteConvMessage', async (data) => {
    const { convId, msgId, phone } = data;
    try {
      const conv = await Conversation.findById(convId);
      if (!conv) return;
      const msg = conv.messages.id(msgId);
      if (!msg || msg.sender !== phone) return;
      msg.deleted = true;
      msg.text = '[xabar o\'chirildi]';
      await conv.save();
      io.to(`conv_${convId}`).emit('convMessageDeleted', { convId, msgId });
    } catch (err) { console.log('deleteConvMessage xato:', err.message); }
  });

  socket.on('webrtc-offer', (data) => { socket.to(`conv_${data.convId}`).emit('webrtc-offer', { offer: data.offer, from: socket.id }); });
  socket.on('webrtc-answer', (data) => { socket.to(data.to).emit('webrtc-answer', { answer: data.answer, from: socket.id }); });
  socket.on('webrtc-ice', (data) => { socket.to(data.to || `conv_${data.convId}`).emit('webrtc-ice', { candidate: data.candidate, from: socket.id }); });
  socket.on('webrtc-end', (data) => { socket.to(`conv_${data.convId}`).emit('webrtc-end'); });

  socket.on('setOnline', async (phone) => {
    socket.userPhone = phone;
    try {
      await User.findOneAndUpdate({ phone }, { isOnline: true });
      socket.broadcast.emit('userOnline', { phone });
    } catch (err) { console.log('setOnline xato:', err.message); }
  });

  socket.on('disconnect', async () => {
    console.log('Uzildi:', socket.id);
    if (socket.userPhone) {
      try {
        const lastSeen = new Date().toISOString();
        await User.findOneAndUpdate({ phone: socket.userPhone }, { isOnline: false, lastSeen });
        socket.broadcast.emit('userOffline', { phone: socket.userPhone, lastSeen });
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

startServer();