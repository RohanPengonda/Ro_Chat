const express = require('express');
const router = express.Router();
const dbConnect = require('../../lib/mongodb');
const User = require('../../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'yoursecretkey';

router.post('/', async (req, res) => {
  await dbConnect();
  const { email, mobile_no, password } = req.body;

  try {
    // Allow login with either email or mobile_no
    const user = await User.findOne({
      $or: [
        { email: email || undefined },
        { mobile_no: mobile_no || undefined }
      ]
    });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    // Create JWT
    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email, mobile_no: user.mobile_no },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({ token, user: { id: user._id, name: user.name, email: user.email, mobile_no: user.mobile_no } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 