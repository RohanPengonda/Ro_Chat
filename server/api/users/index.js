const express = require('express');
const router = express.Router();
const dbConnect = require('../../lib/mongodb');
const User = require('../../models/user');
const { verifyJWT } = require('../middleware/auth');

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

module.exports = router; 