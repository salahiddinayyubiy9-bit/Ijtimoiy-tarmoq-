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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

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
app.use(express.json());

const verificationCodes = {};
const MAX_ROOM_SIZE = 12;
const DAILY_DIAMOND_AMOUNT = 15;
const CATEGORY_ENTRY_COST = 50;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function generateCode() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

app.post('/api/send-code', async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: 'Telefon raqami kiritilmadi' });
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

const httpServer = createServer(app);
const io = new Server(httpServer);

io.on('connection', (socket) => {
  console.log('Yangi foydalanuvchi ulandi:', socket.id);

  socket.on('joinRoom', (roomId) => {
    const roomKey = roomId.toString();
    const roomInfo = io.sockets.adapter.rooms.get(roomKey);
    const currentSize = roomInfo ? roomInfo.size : 0;
    if (currentSize >= MAX_ROOM_SIZE) {
      socket.emit('roomFull');
      return;
    }
    socket.join(roomKey);
    console.log(`Socket ${socket.id} xonaga qo'shildi: ${roomId}`);
  });

  socket.on('sendMessage', async (data) => {
    const { roomId, text, phone } = data;
    try {
      const room = await Room.findById(roomId);
      if (!room) return;
      const newMessage = {
        roomId: roomId,
        text: text,
        sender: phone,
        sentAt: new Date().toISOString()
      };
      room.messages.push(newMessage);
      await room.save();
      io.to(roomId.toString()).emit('newMessage', {
        roomId: roomId,
        text: text,
        sender: phone,
        sentAt: newMessage.sentAt
      });
    } catch (err) {
      console.log("Socket xabari saqlanmadi:", err.message);
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
  });
};

startServer();