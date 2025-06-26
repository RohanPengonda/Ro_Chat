const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ],
    lastMessage: {
      text: String,
      timestamp: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Conversation || mongoose.model('Conversation', conversationSchema); 