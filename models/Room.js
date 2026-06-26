import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  roomId: String,
  text: String,
  sender: String,
  sentAt: String
});

const roomSchema = new mongoose.Schema({
  name: String,
  category: String,
  createdBy: String,
  createdAt: {
    type: String,
    default: () => new Date().toISOString()
  },
  messages: [messageSchema]
});

export default mongoose.model("Room", roomSchema);