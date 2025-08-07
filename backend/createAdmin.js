require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin');

async function createAdmin() {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const username = 'admin'; // change as needed
  const password = 'admin123'; // change as needed
  const hashedPassword = await bcrypt.hash(password, 10);

  const existing = await Admin.findOne({ username });
  if (existing) {
    console.log('Admin user already exists.');
  } else {
    await Admin.create({ username, password: hashedPassword });
    console.log('Admin user created.');
  }

  mongoose.disconnect();
}

createAdmin();