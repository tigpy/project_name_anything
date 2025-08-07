// backend/seedAdmin.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/cbms';

const adminSchema = new mongoose.Schema({
  username: String,
  password: String,
});
const Admin = mongoose.model('Admin', adminSchema);

async function createAdmin() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const username = 'admin';
  const password = 'password123'; // Change as needed
  const hash = await bcrypt.hash(password, 10);
  const exists = await Admin.findOne({ username });
  if (!exists) {
    await Admin.create({ username, password: hash });
    console.log('Admin user created.');
  } else {
    // Update password if user exists
    exists.password = hash;
    await exists.save();
    console.log('Admin password updated.');
  }
  mongoose.disconnect();
}

createAdmin();
