// backend/models/Project.js
const mongoose = require('mongoose');

/**
 * Project Schema
 * @typedef {Object} Project
 * @property {string} name - Project name
 * @property {string} description - Project description
 * @property {string} status - Project status (planned, active, completed)
 * @property {Date} startDate - Start date
 * @property {Date} endDate - End date
 * @property {Array} workers - Array of User ObjectIds
 * @property {Date} createdAt - Creation date
 */

const ProjectSchema = new mongoose.Schema({
  name: String,
  description: String,
  status: { type: String, enum: ['planned', 'active', 'completed'], default: 'planned' },
  startDate: Date,
  endDate: Date,
  workers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Project', ProjectSchema);
