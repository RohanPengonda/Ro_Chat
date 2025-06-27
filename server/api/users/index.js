const express = require('express');
const router = express.Router();
const dbConnect = require('../../lib/mongodb');
const User = require('../../models/user');
const { verifyJWT } = require('../middleware/auth');
const Message = require('../../models/message');
const Conversation = require('../../models/conversation');

router.get('/', verifyJWT, async (req, res) => {
  await dbConnect();
  const { exclude } = req.query;
  try {
    const users = await User.find(exclude ? { _id: { $ne: exclude } } : {}, '-password');
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user profile
router.patch('/:id', verifyJWT, async (req, res) => {
  await dbConnect();
  const { id } = req.params;
  const { name, password, mobileNo } = req.body;
  try {
    const update = {};
    if (name) update.name = name;
    if (password) update.password = password; // Hashing should be handled in the model or here
    if (mobileNo) update.mobileNo = mobileNo;
    const user = await User.findByIdAndUpdate(id, update, { new: true });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete user and all their conversations and messages
router.delete('/:id', verifyJWT, async (req, res) => {
  await dbConnect();
  const { id } = req.params;
  try {
    // Delete all messages sent by the user
    await Message.deleteMany({ senderId: id });
    // Find all conversations the user is part of
    const conversations = await Conversation.find({ participants: id });
    const convIds = conversations.map(c => c._id);
    // Delete all messages in those conversations
    await Message.deleteMany({ conversationId: { $in: convIds } });
    // Delete those conversations
    await Conversation.deleteMany({ _id: { $in: convIds } });
    // Delete the user
    await User.findByIdAndDelete(id);
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 