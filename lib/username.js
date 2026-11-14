const RESERVED = new Set([
  "admin", "administrator", "support", "system", "root", "owner",
  "moderator", "mod", "official", "help", "security", "api",
  "null", "undefined", "telegram", "whatsapp", "ijtimoiy", "tarmoq",
  "channel", "group", "everyone", "staff"
]);

export function normalizeUsername(input) {
  if (input == null || input === "") return null;
  return String(input).trim().replace(/^@+/, "").toLowerCase();
}

export function validateUsername(input) {
  const username = normalizeUsername(input);
  if (!username) return { ok: true, username: null };
  if (username.length < 3 || username.length > 20) {
    return { ok: false, error: "Username 3–20 belgidan iborat bo‘lishi kerak" };
  }
  if (!/^[a-z0-9_]+$/.test(username)) {
    return { ok: false, error: "Username faqat lotin harf, raqam va _ bo‘lishi mumkin" };
  }
  if (RESERVED.has(username)) {
    return { ok: false, error: "Bu username band (reserved)" };
  }
  return { ok: true, username };
}
