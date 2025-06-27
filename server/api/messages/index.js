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

router.delete('/', verifyJWT, async (req, res) => {
  await dbConnect();
  const { conversationId } = req.query;
  if (!conversationId) {
    return res.status(400).json({ error: 'conversationId is required' });
  }
  try {
    // Delete all messages for this conversation
    await Message.deleteMany({ conversationId });
    // Clear lastMessage in the conversation
    await Conversation.findByIdAndUpdate(conversationId, { $unset: { lastMessage: '' } });
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/read', verifyJWT, async (req, res) => {
  await dbConnect();
  const { conversationId, userId } = req.body;
  try {
    await Message.updateMany(
      { conversationId, senderId: { $ne: userId }, isRead: false },
      { $set: { isRead: true } }
    );
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/unread-counts', verifyJWT, async (req, res) => {
  await dbConnect();
  const { userId } = req.query;
  try {
    // Get all conversations for this user
    const conversations = await Conversation.find({
      participants: userId
    });
    
    // Get unread counts for each conversation
    const unreadCounts = {};
    for (const conv of conversations) {
      const count = await Message.countDocuments({
        conversationId: conv._id,
        senderId: { $ne: userId },
        isRead: false
      });
      unreadCounts[conv._id] = count;
    }
    
    res.status(200).json(unreadCounts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 