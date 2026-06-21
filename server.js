import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server } from 'socket.io';
import db from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

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

  if (!phone) {
    return res.status(400).json({ error: 'Telefon raqami kiritilmadi' });
  }

  const code = generateCode();

  verificationCodes[phone] = {
    code: code,
    expiresAt: Date.now() + 5 * 60 * 1000
  };

  console.log(`[TEST REJIMI] ${phone} raqamiga kod: ${code}`);

  res.json({ success: true, testCode: code });
});

app.post('/api/verify-code', async (req, res) => {
  const { phone, code } = req.body;

  if (!phone || !code) {
    return res.status(400).json({ error: 'Telefon raqami yoki kod kiritilmadi' });
  }

  const record = verificationCodes[phone];

  if (!record) {
    return res.status(400).json({ error: 'Avval kod so\'rang' });
  }

  if (Date.now() > record.expiresAt) {
    delete verificationCodes[phone];
    return res.status(400).json({ error: 'Kodning muddati tugagan. Qaytadan so\'rang' });
  }

  if (record.code !== code) {
    return res.status(400).json({ error: 'Kod noto\'g\'ri' });
  }

  delete verificationCodes[phone];

  await db.read();

  let user = db.data.users.find(u => u.phone === phone);

  if (!user) {
    user = {
      id: Date.now(),
      phone: phone,
      diamonds: 500,
      rank: 'Oddiy askar',
      createdAt: new Date().toISOString(),
      lastDailyClaim: null
    };
    db.data.users.push(user);
    await db.write();
    return res.json({ success: true, isNewUser: true, user: user });
  }

  res.json({ success: true, isNewUser: false, user: user });
});

app.post('/api/daily-claim', async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ error: 'Telefon raqami kiritilmadi' });
  }

  await db.read();

  const user = db.data.users.find(u => u.phone === phone);

  if (!user) {
    return res.status(404).json({ error: 'Foydalanuvchi topilmadi' });
  }

  if (user.lastDailyClaim) {
    const elapsed = Date.now() - new Date(user.lastDailyClaim).getTime();
    if (elapsed < ONE_DAY_MS) {
      const remainingMs = ONE_DAY_MS - elapsed;
      const remainingHours = Math.ceil(remainingMs / (60 * 60 * 1000));
      return res.status(400).json({ error: `Yana ${remainingHours} soatdan keyin oling` });
    }
  }

  user.diamonds += DAILY_DIAMOND_AMOUNT;
  user.lastDailyClaim = new Date().toISOString();
  await db.write();

  res.json({ success: true, user: user });
});

app.post('/api/category-enter', async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ error: 'Telefon raqami kiritilmadi' });
  }

  await db.read();

  const user = db.data.users.find(u => u.phone === phone);

  if (!user) {
    return res.status(404).json({ error: 'Foydalanuvchi topilmadi' });
  }

  if (user.diamonds < CATEGORY_ENTRY_COST) {
    return res.status(400).json({ error: 'Olmosingiz yetarli emas' });
  }

  user.diamonds -= CATEGORY_ENTRY_COST;
  await db.write();

  res.json({ success: true, user: user });
});

app.post('/api/rooms/create', async (req, res) => {
  const { name, category, phone } = req.body;

  if (!name || !category || !phone) {
    return res.status(400).json({ error: 'Xona nomi, kategoriya yoki telefon kiritilmadi' });
  }

  await db.read();

  const room = {
    id: Date.now(),
    name: name,
    category: category,
    createdBy: phone,
    createdAt: new Date().toISOString(),
    messages: []
  };

  db.data.rooms.push(room);
  await db.write();

  res.json({ success: true, room: room });
});

app.get('/api/rooms/:category', async (req, res) => {
  const { category } = req.params;

  await db.read();

  const rooms = db.data.rooms.filter(r => r.category === category);

  res.json({ success: true, rooms: rooms });
});

app.get('/api/rooms/single/:roomId', async (req, res) => {
  const { roomId } = req.params;

  await db.read();

  const room = db.data.rooms.find(r => r.id === Number(roomId));

  if (!room) {
    return res.status(404).json({ error: 'Xona topilmadi' });
  }

  res.json({ success: true, room: room });
});

app.delete('/api/rooms/:roomId', async (req, res) => {
  const { roomId } = req.params;
  const { phone } = req.body;

  await db.read();

  const room = db.data.rooms.find(r => r.id === Number(roomId));

  if (!room) {
    return res.status(404).json({ error: 'Xona topilmadi' });
  }

  if (room.createdBy !== phone) {
    return res.status(403).json({ error: 'Faqat xona yaratuvchisi o\'chira oladi' });
  }

  db.data.rooms = db.data.rooms.filter(r => r.id !== Number(roomId));
  await db.write();

  res.json({ success: true });
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

    await db.read();
    const room = db.data.rooms.find(r => r.id === Number(roomId));

    if (!room) return;

    const newMessage = {
      id: Date.now(),
      roomId: room.id,
      text: text,
      sender: phone,
      sentAt: new Date().toISOString()
    };

    room.messages.push(newMessage);
    await db.write();

    io.to(roomId.toString()).emit('newMessage', newMessage);
  });

  socket.on('disconnect', () => {
    console.log('Foydalanuvchi uzildi:', socket.id);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server ishga tushdi: http://localhost:${PORT}`);
});