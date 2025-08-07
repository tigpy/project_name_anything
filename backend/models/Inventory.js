// backend/models/Inventory.js
const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema({
  name: String,
  quantity: Number,
  unit: String,
  supplier: String,
  lowStockAlert: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Inventory', InventorySchema);
