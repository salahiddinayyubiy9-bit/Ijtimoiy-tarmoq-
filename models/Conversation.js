import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  text: { type: String, default: '' },
  sender: { type: String, required: true },
  senderNickname: { type: String, default: '' },
  senderAvatar: { type: String, default: null },
  sentAt: { type: String, default: () => new Date().toISOString() },
  type: { type: String, default: 'text' }
});

const conversationSchema = new mongoose.Schema({
  type: { type: String, enum: ['private', 'group', 'channel'], required: true },
  name: { type: String, default: '' },
  image: { type: String, default: null },
  isPublic: { type: Boolean, default: false },
  members: [{ type: String }],
  admins: [{ type: String }],
  subscribers: [{ type: String }],
  createdBy: { type: String, required: true },
  createdAt: { type: String, default: () => new Date().toISOString() },
  messages: [messageSchema],
  lastMessage: { type: String, default: '' },
  lastMessageAt: { type: String, default: () => new Date().toISOString() }
});

export default mongoose.model("Conversation", conversationSchema);