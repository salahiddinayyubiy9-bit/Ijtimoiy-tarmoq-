import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());


const verificationCodes = {};

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
      createdAt: new Date().toISOString()
    };
    db.data.users.push(user);
    await db.write();
    return res.json({ success: true, isNewUser: true, user: user });
  }

  res.json({ success: true, isNewUser: false, user: user });
});

app.listen(PORT, () => {
  console.log(`Server ishga tushdi: http://localhost:${PORT}`);
});