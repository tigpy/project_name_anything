// Basic Express server for Construction Business Management System
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Import Mongoose models from separate files
const Contact = require('./models/Contact');
const Admin = require('./models/Admin');
const Gallery = require('./models/Gallery');
const User = require('./models/User');
const Project = require('./models/Project');
const Inventory = require('./models/Inventory');
const Estimator = require('./models/Estimator');

// Set up storage for project files
const projectFilesStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'uploads', 'projects'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const uploadProjectFile = multer({ storage: projectFilesStorage });

// Ensure uploads/projects directory exists
const uploadsDir = path.join(__dirname, 'uploads', 'projects');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded project files
app.use('/uploads/projects', express.static(path.join(__dirname, 'uploads', 'projects')));

// Routes
/**
 * Handles contact form submissions.
 * @route POST /api/contact
 * @param {string} name - Name of the sender
 * @param {string} email - Email address
 * @param {string} message - Message content
 * @returns {Object} Success or error response
 */
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'All fields required.' });
    }
    await Contact.create({ name, email, message });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required.' });
    }
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }
    const bcrypt = require('bcryptjs');
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }
    // Emit notification to all connected admins
    io.emit('notification', { message: `Admin '${username}' logged in successfully.` });
    // In real app, return JWT token
    res.json({ success: true, token: 'dummy-token' });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

app.get('/api/gallery', async (req, res) => {
  try {
    const images = await Gallery.find();
    res.json(images);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// --- User CRUD ---
app.get('/api/users', async (req, res) => {
  res.json(await User.find());
});
app.post('/api/users', async (req, res) => {
  const user = await User.create(req.body);
  res.json(user);
});
app.put('/api/users/:id', async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(user);
});
app.delete('/api/users/:id', async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// --- Project CRUD ---
app.get('/api/projects', async (req, res) => {
  res.json(await Project.find().populate('workers'));
});
app.post('/api/projects', async (req, res) => {
  const project = await Project.create(req.body);
  // Emit notification to all connected admins
  io.emit('notification', { message: `New project created: ${project.projectName || project.name || 'Untitled Project'}` });
  res.json(project);
});
app.put('/api/projects/:id', async (req, res) => {
  const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(project);
});
app.delete('/api/projects/:id', async (req, res) => {
  await Project.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// --- Inventory CRUD ---
app.get('/api/inventory', async (req, res) => {
  res.json(await Inventory.find());
});
app.post('/api/inventory', async (req, res) => {
  const item = await Inventory.create(req.body);
  res.json(item);
});
app.put('/api/inventory/:id', async (req, res) => {
  const item = await Inventory.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(item);
});
app.delete('/api/inventory/:id', async (req, res) => {
  await Inventory.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// --- View Contact Submissions (admin only, for now public) ---
app.get('/api/contacts', async (req, res) => {
  res.json(await Contact.find().sort({ createdAt: -1 }));
});

// --- AI Estimator Submission Endpoint ---
app.post('/api/estimator', async (req, res) => {
  try {
    const { projectName, projectType, area, budget, estimatedCost, estimatedDuration } = req.body;
    const saved = await Estimator.create({ projectName, projectType, area, budget, estimatedCost, estimatedDuration });
    res.json({ success: true, id: saved._id });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// --- AI Estimator Submissions List Endpoint ---
app.get('/api/estimator/all', async (req, res) => {
  try {
    const all = await Estimator.find().sort({ createdAt: -1 });
    res.json(all);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// --- Gallery API ---
app.post('/api/gallery', async (req, res) => {
  try {
    const { imageUrl, title, category, description } = req.body;
    if (!imageUrl || !title || !category) return res.status(400).json({ success: false, message: 'Missing fields' });
    const img = await Gallery.create({ imageUrl, title, category, description });
    res.json({ success: true, image: img });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to add image' });
  }
});
app.delete('/api/gallery/:id', async (req, res) => {
  try {
    await Gallery.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete image' });
  }
});

// --- Bulk Delete Contacts ---
app.delete('/api/contacts', async (req, res) => {
  try {
    await Contact.deleteMany({});
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete all contacts.' });
  }
});
// --- Bulk Delete Gallery ---
app.delete('/api/gallery', async (req, res) => {
  try {
    await Gallery.deleteMany({});
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete all gallery images.' });
  }
});

// Project file upload endpoint
app.post('/api/projects/:id/upload', uploadProjectFile.single('file'), async (req, res) => {
  try {
    const projectId = req.params.id;
    const file = req.file;
    if (!file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    // Optionally, save file info to project document
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    if (!project.files) project.files = [];
    project.files.push({
      filename: file.filename,
      originalname: file.originalname,
      path: file.path,
      uploadedAt: new Date()
    });
    await project.save();
    res.json({ success: true, file: file.filename });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Upload failed' });
  }
});

// Error handling middleware for cleaner error responses
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

// Create HTTP server and attach Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Socket.IO connection event
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  // Example: send a welcome notification
  socket.emit('notification', { message: 'Welcome to CBMS Admin Notifications!' });
  // You can add more events here for project updates, inventory alerts, etc.
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
