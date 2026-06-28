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
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Juda ko\'p so\'rov yuborildi. 15 daqiqadan keyin qaytadan urinib ko\'ring.' }
});

const codeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  message: { error: 'Juda ko\'p kod so\'rovi. 1 daqiqadan keyin qaytadan urinib ko\'ring.' }
});

app.use(generalLimiter);
app.use('/api/send-code', codeLimiter);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json({ limit: '10mb' }));

const verificationCodes = {};
const MAX_ROOM_SIZE = 12;
const DAILY_DIAMOND_AMOUNT = 15;
const CATEGORY_ENTRY_COST = 50;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const ALLOWED_COUNTRY_CODES = ['+998', '+7', '+996', '+992', '+966'];

function generateCode() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

function isValidPhone(phone) {
  return ALLOWED_COUNTRY_CODES.some(code => phone.startsWith(code));
}

// ===== PING (server uxlamasligi) =====
app.get('/ping', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// ===== AUTH =====
app.post('/api/send-code', async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: 'Telefon raqami kiritilmadi' });
  if (!isValidPhone(phone)) return res.status(400).json({ error: 'Bu davlatning raqami qabul qilinmaydi' });
  const code = generateCode();
  verificationCodes[phone] = { code: code, expiresAt: Date.now() + 5 * 60 * 1000 };
  console.log(`[TEST REJIMI] ${phone} raqamiga kod: ${code}`);
  res.json({ success: true, testCode: code });
});

app.post('/api/verify-code', async (req, res) => {
  const { phone, code } = req.body;
  if (!phone || !code) return res.status(400).json({ error: 'Telefon raqami yoki kod kiritilmadi' });
  const record = verificationCodes[phone];
  if (!record) return res.status(400).json({ error: 'Avval kod so\'rang' });
  if (Date.now() > record.expiresAt) {
    delete verificationCodes[phone];
    return res.status(400).json({ error: 'Kodning muddati tugagan. Qaytadan so\'rang' });
  }
  if (record.code !== code) return res.status(400).json({ error: 'Kod noto\'g\'ri' });
  delete verificationCodes[phone];
  try {
    let user = await User.findOne({ phone: phone });
    if (!user) {
      user = new User({ phone: phone, diamonds: 500, rank: 'Oddiy askar', lastDailyClaim: null });
      await user.save();
      return res.json({ success: true, isNewUser: true, user: user });
    }
    res.json({ success: true, isNewUser: false, user: user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/setup-profile', async (req, res) => {
  const { phone, nickname, username } = req.body;
  if (!phone || !nickname) return res.status(400).json({ error: 'Telefon va nickname kiritilmadi' });
  try {
    if (username) {
      const existing = await User.findOne({ username: username });
      if (existing && existing.phone !== phone) {
        return res.status(400).json({ error: 'Bu username allaqachon band' });
      }
    }
    const user = await User.findOneAndUpdate(
      { phone: phone },
      { nickname: nickname, username: username || null },
      { new: true }
    );
    res.json({ success: true, user: user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/users/search', async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'Qidiruv matni kiritilmadi' });
  try {
    const users = await User.find({
      $or: [
        { phone: q },
        { username: q.startsWith('@') ? q.slice(1) : q }
      ]
    }).select('phone nickname username profileImage rank');
    res.json({ success: true, users: users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/daily-claim', async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: 'Telefon raqami kiritilmadi' });
  try {
    const user = await User.findOne({ phone: phone });
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
    res.json({ success: true, user: user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/category-enter', async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: 'Telefon raqami kiritilmadi' });
  try {
    const user = await User.findOne({ phone: phone });
    if (!user) return res.status(404).json({ error: 'Foydalanuvchi topilmadi' });
    if (user.diamonds < CATEGORY_ENTRY_COST) return res.status(400).json({ error: 'Olmosingiz yetarli emas' });
    user.diamonds -= CATEGORY_ENTRY_COST;
    await user.save();
    res.json({ success: true, user: user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== ROOMS =====
app.post('/api/rooms/create', async (req, res) => {
  const { name, category, phone } = req.body;
  if (!name || !category || !phone) return res.status(400).json({ error: 'Xona nomi, kategoriya yoki telefon kiritilmadi' });
  try {
    const room = new Room({ name: name, category: category, createdBy: phone, messages: [] });
    await room.save();
    res.json({ success: true, room: room });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/rooms/:category', async (req, res) => {
  const { category } = req.params;
  try {
    const rooms = await Room.find({ category: category });
    res.json({ success: true, rooms: rooms });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/rooms/single/:roomId', async (req, res) => {
  const { roomId } = req.params;
  try {
    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ error: 'Xona topilmadi' });
    res.json({ success: true, room: room });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/rooms/:roomId', async (req, res) => {
  const { roomId } = req.params;
  const { phone } = req.body;
  try {
    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ error: 'Xona topilmadi' });
    if (room.createdBy !== phone) return res.status(403).json({ error: 'Faqat xona yaratuvchisi o\'chira oladi' });
    await Room.findByIdAndDelete(roomId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
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
      const existing = await Conversation.findOne({
        type: 'private',
        members: { $all: [phone, targetUser.phone] }
      });
      if (existing) return res.json({ success: true, conversation: existing, isExisting: true });
      conversation = new Conversation({ type: 'private', members: [phone, targetUser.phone], admins: [phone], createdBy: phone });
    } else if (type === 'group') {
      if (!name) return res.status(400).json({ error: 'Guruh nomi kiritilmadi' });
      conversation = new Conversation({ type: 'group', name: name, isPublic: isPublic || false, members: [phone], admins: [phone], createdBy: phone });
    } else if (type === 'channel') {
      if (!name) return res.status(400).json({ error: 'Kanal nomi kiritilmadi' });
      conversation = new Conversation({ type: 'channel', name: name, isPublic: isPublic || false, members: [phone], admins: [phone], subscribers: [], createdBy: phone });
    }
    await conversation.save();
    res.json({ success: true, conversation: conversation });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/conversations', async (req, res) => {
  const { phone, type } = req.query;
  if (!phone) return res.status(400).json({ error: 'Telefon kiritilmadi' });
  try {
    let query = { type: type };
    if (type === 'private' || type === 'group') {
      query.members = phone;
    } else if (type === 'channel') {
      query.$or = [{ members: phone }, { subscribers: phone }];
    }
    const conversations = await Conversation.find(query).select('-messages').sort({ lastMessageAt: -1 });
    res.json({ success: true, conversations: conversations });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/conversations/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const conversation = await Conversation.findById(id);
    if (!conversation) return res.status(404).json({ error: 'Suhbat topilmadi' });
    res.json({ success: true, conversation: conversation });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/conversations/:id/subscribe', async (req, res) => {
  const { id } = req.params;
  const { phone } = req.body;
  try {
    const conversation = await Conversation.findById(id);
    if (!conversation) return res.status(404).json({ error: 'Kanal topilmadi' });
    if (!conversation.subscribers.includes(phone)) {
      conversation.subscribers.push(phone);
      await conversation.save();
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/conversations/:id/unsubscribe', async (req, res) => {
  const { id } = req.params;
  const { phone } = req.body;
  try {
    const conversation = await Conversation.findById(id);
    if (!conversation) return res.status(404).json({ error: 'Kanal topilmadi' });
    conversation.subscribers = conversation.subscribers.filter(s => s !== phone);
    await conversation.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== ADMIN PANEL API =====
function adminAuth(req, res, next) {
  const secret = req.headers['x-admin-secret'];
  if (secret !== ADMIN_SECRET) return res.status(403).json({ error: 'Ruxsat yo\'q' });
  next();
}

app.get('/api/admin/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find().select('-__v').sort({ createdAt: -1 });
    res.json({ success: true, users: users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/rooms', adminAuth, async (req, res) => {
  try {
    const rooms = await Room.find().select('-messages -__v').sort({ createdAt: -1 });
    res.json({ success: true, rooms: rooms });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/conversations', adminAuth, async (req, res) => {
  try {
    const convs = await Conversation.find().select('-messages -__v').sort({ createdAt: -1 });
    res.json({ success: true, conversations: convs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/users/:phone/diamonds', adminAuth, async (req, res) => {
  const { phone } = req.params;
  const { amount } = req.body;
  try {
    const user = await User.findOneAndUpdate({ phone: phone }, { $inc: { diamonds: amount } }, { new: true });
    if (!user) return res.status(404).json({ error: 'Foydalanuvchi topilmadi' });
    res.json({ success: true, user: user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/users/:phone', adminAuth, async (req, res) => {
  const { phone } = req.params;
  try {
    await User.findOneAndDelete({ phone: phone });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/rooms/:roomId', adminAuth, async (req, res) => {
  const { roomId } = req.params;
  try {
    await Room.findByIdAndDelete(roomId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/conversations/:id', adminAuth, async (req, res) => {
  const { id } = req.params;
  try {
    await Conversation.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== SOCKET.IO =====
const httpServer = createServer(app);
const io = new Server(httpServer, {
  maxHttpBufferSize: 10 * 1024 * 1024
});

io.on('connection', (socket) => {
  console.log('Yangi foydalanuvchi ulandi:', socket.id);

  socket.on('joinRoom', (roomId) => {
    const roomKey = roomId.toString();
    const roomInfo = io.sockets.adapter.rooms.get(roomKey);
    const currentSize = roomInfo ? roomInfo.size : 0;
    if (currentSize >= MAX_ROOM_SIZE) { socket.emit('roomFull'); return; }
    socket.join(roomKey);
  });

  socket.on('joinConversation', (convId) => {
    socket.join(`conv_${convId}`);
  });

  socket.on('sendMessage', async (data) => {
    const { roomId, text, phone, imageData } = data;
    try {
      const room = await Room.findById(roomId);
      if (!room) return;
      const msgText = imageData ? `[image:${imageData}]` : text;
      const newMessage = { roomId: roomId, text: msgText, sender: phone, sentAt: new Date().toISOString() };
      room.messages.push(newMessage);
      await room.save();
      io.to(roomId.toString()).emit('newMessage', { roomId: roomId, text: msgText, sender: phone, sentAt: newMessage.sentAt });
    } catch (err) {
      console.log("Socket xabari saqlanmadi:", err.message);
    }
  });

  socket.on('sendConvMessage', async (data) => {
    const { convId, text, phone, senderNickname, imageData } = data;
    try {
      const conversation = await Conversation.findById(convId);
      if (!conversation) return;
      if (conversation.type === 'channel' && conversation.createdBy !== phone) return;
      const msgText = imageData ? `[image:${imageData}]` : text;
      const newMessage = {
        text: msgText,
        sender: phone,
        senderNickname: senderNickname || phone,
        sentAt: new Date().toISOString(),
        type: imageData ? 'image' : 'text'
      };
      conversation.messages.push(newMessage);
      conversation.lastMessage = imageData ? '📷 Rasm' : text;
      conversation.lastMessageAt = newMessage.sentAt;
      await conversation.save();
      io.to(`conv_${convId}`).emit('newConvMessage', { convId: convId, message: newMessage });
    } catch (err) {
      console.log("Conversation xabari saqlanmadi:", err.message);
    }
  });

  socket.on('disconnect', () => {
    console.log('Foydalanuvchi uzildi:', socket.id);
  });
});

const startServer = async () => {
  await connectDB();
  httpServer.listen(PORT, () => {
    console.log(`Server ishga tushdi: http://localhost:${PORT}`);

    // Server uxlamasligi uchun o'z-o'ziga ping
    const RENDER_URL = process.env.RENDER_URL || `http://localhost:${PORT}`;
    setInterval(async () => {
      try {
        await fetch(`${RENDER_URL}/ping`);
        console.log('[PING] Server uyg\'oq');
      } catch (err) {
        console.log('[PING] Xato:', err.message);
      }
    }, 14 * 60 * 1000);
  });
};

startServer();