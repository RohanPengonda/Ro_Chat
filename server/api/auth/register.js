const express = require('express');
const router = express.Router();
const dbConnect = require('../../lib/mongodb');
const User = require('../../models/user');
const bcrypt = require('bcryptjs');

router.post('/', async (req, res) => {
  await dbConnect();
  const { name, email, mobile_no, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await User.create({ name, email, mobile_no, password: hashedPassword });
    res.status(201).json({ user: { id: user._id, name: user.name, email: user.email, mobile_no: user.mobile_no } });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;