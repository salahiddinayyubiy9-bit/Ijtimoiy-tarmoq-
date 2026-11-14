import SecurityAuditEvent from "../models/SecurityAuditEvent.js";

export async function recordSecurityEvent({ actorId = null, action, outcome, targetType = null, targetId = null }) {
  try {
    await SecurityAuditEvent.create({ actorId, action, outcome, targetType, targetId });
  } catch {
    // Audit yozuvi maxfiy ma'lumotlarsiz, umumiy xabar bilan qayd etiladi.
    console.error("Xavfsizlik hodisasini jurnalga yozib bo‘lmadi.");
  }
}
