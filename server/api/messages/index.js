const express = require('express');
const router = express.Router();
const dbConnect = require('../../lib/mongodb');
const Message = require('../../models/message');
const Conversation = require('../../models/conversation');
const { verifyJWT } = require('../middleware/auth');

router.get('/', verifyJWT, async (req, res) => {
  await dbConnect();
  const { conversationId } = req.query;
  try {
    const messages = await Message.find({ conversationId }).sort('timestamp');
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', verifyJWT, async (req, res) => {
  await dbConnect();
  const { conversationId, senderId, text } = req.body;
  try {
    const message = await Message.create({ conversationId, senderId, text });
    // Update lastMessage in conversation
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: { text, senderId, timestamp: new Date() },
    });
    // Emit newMessage event via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.to(conversationId).emit('newMessage', message);
    }
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 