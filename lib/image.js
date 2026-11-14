import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
import { randomId } from "./security.js";

const MAX_BYTES = 2 * 1024 * 1024;
const MAX_DIM = 8000;
const OUT_SIZE = 400;

function sniffMime(buf) {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return "image/png";
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46) return "image/gif";
  if (
    buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46
    && buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50
  ) return "image/webp";
  return null;
}

export async function processAvatar(buffer, declaredMime, uploadsDir) {
  if (!buffer || buffer.length < 24) throw new Error("Rasm noto‘g‘ri");
  if (buffer.length > MAX_BYTES) throw new Error("Rasm hajmi 2 MB dan oshmasin");
  const magic = sniffMime(buffer);
  if (!magic) throw new Error("Faqat JPEG, PNG, GIF yoki WebP ruxsat etiladi");
  if (declaredMime && declaredMime !== "application/octet-stream" && declaredMime !== magic) {
    throw new Error("Fayl turi mos kelmadi");
  }
  const image = sharp(buffer, { limitInputPixels: MAX_DIM * MAX_DIM, animated: false });
  const meta = await image.metadata();
  if (!meta.width || !meta.height) throw new Error("Rasm o‘qilmadi");
  if (meta.width > MAX_DIM || meta.height > MAX_DIM) throw new Error("Rasm o‘lchami juda katta");
  const out = await image
    .rotate()
    .resize(OUT_SIZE, OUT_SIZE, { fit: "cover", withoutEnlargement: false })
    .jpeg({ quality: 80, mozjpeg: true })
    .toBuffer();
  await fs.mkdir(uploadsDir, { recursive: true });
  const filename = `${randomId(12)}.jpg`;
  await fs.writeFile(path.join(uploadsDir, filename), out);
  return filename;
}

export function safeAvatarName(name) {
  if (!name || typeof name !== "string") return null;
  if (!/^[A-Za-z0-9_-]+\.jpg$/.test(name)) return null;
  return name;
}

export async function removeAvatarFile(uploadsDir, filename) {
  const safe = safeAvatarName(filename);
  if (!safe) return;
  try { await fs.unlink(path.join(uploadsDir, safe)); } catch { /* ignore */ }
}
