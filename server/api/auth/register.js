const express = require('express');
const router = express.Router();
const dbConnect = require('../../lib/mongodb');
const User = require('../../models/user');
const bcrypt = require('bcryptjs');

router.post('/', async (req, res) => {
  await dbConnect();
  const { name, email, mobile_no, password } = req.body;

  // Validate email (must be Gmail)
  if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email)) {
    return res.status(400).json({ error: 'Email must be a valid Gmail address' });
  }

  // Validate password
  if (!password || password.length < 8 ||
    !/[A-Z]/.test(password) ||
    !/[a-z]/.test(password) ||
    !/\d/.test(password) ||
    !/[^A-Za-z0-9]/.test(password)) {
    return res.status(400).json({ error: 'Password must be at least 8 characters and include upper, lower, number, and special character' });
  }

  // Validate mobile_no (optional, but if present must be 10 digits)
  if (mobile_no && !/^\d{10}$/.test(mobile_no)) {
    return res.status(400).json({ error: 'Mobile number must be 10 digits' });
  }

  // Check for unique email
  const existingEmail = await User.findOne({ email });
  if (existingEmail) {
    return res.status(400).json({ error: 'Email already exists' });
  }

  // Check for unique mobile_no (if provided)
  if (mobile_no) {
    const existingMobile = await User.findOne({ mobile_no });
    if (existingMobile) {
      return res.status(400).json({ error: 'Mobile number already exists' });
    }
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await User.create({ name, email, mobile_no, password: hashedPassword });
    res.status(201).json({ user: { id: user._id, name: user.name, email: user.email, mobile_no: user.mobile_no } });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;