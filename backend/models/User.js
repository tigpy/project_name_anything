// backend/models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: { type: String, enum: ['admin', 'manager', 'worker', 'client'], default: 'worker' },
  password: String, // hashed
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
