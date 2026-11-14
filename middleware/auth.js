import { resolveRequestAuth, ensureDeviceId } from "../lib/sessions.js";
import { isAdminUser } from "../lib/security.js";
import { recordSecurityEvent } from "../lib/audit.js";

export function deviceMiddleware(req, res, next) {
  ensureDeviceId(req, res);
  next();
}

export async function optionalAuth(req, res, next) {
  try {
    const auth = await resolveRequestAuth(req, res);
    if (auth) {
      req.user = auth.user;
      req.authSession = auth.session;
    }
  } catch {
    /* ignore */
  }
  next();
}

export async function requireAuth(req, res, next) {
  try {
    const auth = await resolveRequestAuth(req, res);
    if (!auth) return res.status(401).json({ error: "Kirish talab qilinadi" });
    req.user = auth.user;
    req.authSession = auth.session;
    next();
  } catch (err) {
    res.status(401).json({ error: "Sessiya yaroqsiz" });
  }
}

export async function requireAdmin(req, res, next) {
  if (!req.user || !isAdminUser(req.user)) {
    await recordSecurityEvent({ actorId: req.user?._id || null, action: "ADMIN_ACCESS_DENIED", outcome: "denied" });
    return res.status(403).json({ error: "Ruxsat yo‘q" });
  }
  next();
}

export function publicProfile(user, viewer) {
  if (!user) return null;
  const self = viewer && String(viewer._id) === String(user._id);
  const privacy = user.privacy || {};
  const avatar = user.avatarFile
    ? `/api/media/avatar/${user.avatarFile}`
    : user.profileImage;
  const out = {
    id: String(user._id),
    nickname: user.nickname,
    username: user.username,
    profileImage: avatar,
    bio: user.bio,
    rank: user.rank,
    isOnline: user.isOnline,
    lastSeen: user.lastSeen
  };
  if (self) {
    out.phone = user.phone;
    out.birthDate = user.birthDate;
    out.diamonds = user.diamonds;
    out.blockedUsers = user.blockedUsers || [];
    out.privacy = {
      findByPhone: privacy.findByPhone !== false,
      showPhone: Boolean(privacy.showPhone),
      showBirthday: Boolean(privacy.showBirthday)
    };
    out.isAdmin = isAdminUser(user);
    out.lastDailyClaim = user.lastDailyClaim;
  } else {
    if (privacy.showPhone) out.phone = user.phone;
    if (privacy.showBirthday) out.birthDate = user.birthDate;
  }
  return out;
}
