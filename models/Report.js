import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  reportedBy: { type: String, required: true },
  reportedUser: { type: String, required: true },
  reason: { type: String, required: true },
  details: { type: String, default: '' },
  status: { type: String, default: 'pending' },
  createdAt: { type: String, default: () => new Date().toISOString() }
});

export default mongoose.model("Report", reportSchema);