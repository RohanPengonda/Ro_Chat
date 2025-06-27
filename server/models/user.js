const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/^[a-zA-Z0-9._%+-]+@gmail\.com$/, 'Email must be a valid Gmail address'],
    },
    mobile_no: {
      type: String,
      unique: true,
      sparse: true, // allow multiple docs with undefined
      validate: {
        validator: function(v) {
          return !v || /^\d{10}$/.test(v); // allow empty or 10 digit number
        },
        message: 'Mobile number must be 10 digits',
      },
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      validate: {
        validator: function(v) {
          return /[A-Z]/.test(v) && /[a-z]/.test(v) && /\d/.test(v) && /[^A-Za-z0-9]/.test(v);
        },
        message: 'Password must have upper, lower, number, and special char',
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.User || mongoose.model('User', userSchema); 