import mongoose from "mongoose";

const reactionSchema = new mongoose.Schema({
  emoji: { type: String, required: true },
  phone: { type: String, required: true }
});

const messageSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
  text: { type: String, default: '' },
  sender: { type: String, required: true },
  senderNickname: { type: String, default: '' },
  senderAvatar: { type: String, default: null },
  sentAt: { type: String, default: () => new Date().toISOString() },
  type: { type: String, default: 'text' },
  replyTo: {
    msgId: { type: String, default: null },
    text: { type: String, default: '' },
    sender: { type: String, default: '' }
  },
  deleted: { type: Boolean, default: false },
  edited: { type: Boolean, default: false },
  reactions: [reactionSchema],
  pinned: { type: Boolean, default: false }
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
  lastMessageAt: { type: String, default: () => new Date().toISOString() },
  pinnedMessageId: { type: String, default: null }
});

export default mongoose.model("Conversation", conversationSchema);