// backend/models/Estimator.js
const mongoose = require('mongoose');

const EstimatorSchema = new mongoose.Schema({
  projectName: String,
  projectType: String,
  area: Number,
  budget: Number,
  estimatedCost: Number,
  estimatedDuration: Number,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Estimator', EstimatorSchema);
