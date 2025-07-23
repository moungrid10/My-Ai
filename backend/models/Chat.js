// backend/models/Chat.js
import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  text: String,
  user: Boolean,
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const chatSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: String,
  messages: [messageSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Chat', chatSchema);
