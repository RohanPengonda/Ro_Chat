const express = require('express');
const router = express.Router();
const dbConnect = require('../../lib/mongodb');
const Conversation = require('../../models/conversation');
const { verifyJWT } = require('../middleware/auth');
const Message = require('../../models/message');

router.get('/', verifyJWT, async (req, res) => {
  await dbConnect();
  const { userId } = req.query;
  try {
    const conversations = await Conversation.find({
      participants: userId
    }).populate('participants', 'name email');
    res.status(200).json(conversations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', verifyJWT, async (req, res) => {
  await dbConnect();
  const { userIds } = req.body; // [user1, user2]
  try {
    let conversation = await Conversation.findOne({ participants: { $all: userIds, $size: 2 } });
    if (!conversation) {
      conversation = await Conversation.create({ participants: userIds });
    }
    res.status(201).json(conversation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', verifyJWT, async (req, res) => {
  await dbConnect();
  const { id } = req.params;
  try {
    // Delete all messages for this conversation
    await Message.deleteMany({ conversationId: id });
    // Delete the conversation itself
    await Conversation.findByIdAndDelete(id);
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 