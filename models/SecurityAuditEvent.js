import mongoose from "mongoose";

const securityAuditEventSchema = new mongoose.Schema({
  actorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
  action: {
    type: String,
    required: true,
    enum: [
      "OTP_REQUEST", "AUTH_LOGIN", "AUTH_LOGOUT", "AUTH_LOGOUT_ALL", "SESSION_REVOKE",
      "ADMIN_USERS_READ", "ADMIN_ROOMS_READ", "ADMIN_CONVERSATIONS_READ", "ADMIN_REPORTS_READ",
      "ADMIN_REPORT_RESOLVE", "ADMIN_DIAMOND_ADJUST", "ADMIN_USER_DELETE", "ADMIN_ROOM_DELETE",
      "ADMIN_CONVERSATION_DELETE", "ADMIN_AUDIT_READ", "ADMIN_ACCESS_DENIED"
    ]
  },
  outcome: { type: String, required: true, enum: ["success", "failure", "denied"] },
  targetType: { type: String, default: null },
  targetId: { type: String, default: null },
  createdAt: { type: Date, default: Date.now, index: true }
}, { versionKey: false });

securityAuditEventSchema.index({ actorId: 1, createdAt: -1 });
securityAuditEventSchema.index({ action: 1, createdAt: -1 });

export default mongoose.model("SecurityAuditEvent", securityAuditEventSchema);
