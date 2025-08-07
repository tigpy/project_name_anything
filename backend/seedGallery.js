// backend/seedGallery.js
const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/cbms';

const imageSchema = new mongoose.Schema({
  url: String,
  title: String,
  description: String,
  category: String
});
const ProjectImage = mongoose.model('ProjectImage', imageSchema);

const images = [
  {
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
    title: 'Modern Office Complex',
    description: 'A completed modern office building project.',
    category: 'Commercial'
  },
  {
    url: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80',
    title: 'Bridge Construction',
    description: 'Bridge project completed in 2024.',
    category: 'Commercial'
  },
  {
    url: 'https://images.unsplash.com/photo-1523413363574-c30aa1c2a516?auto=format&fit=crop&w=400&q=80',
    title: 'Residential Towers',
    description: 'High-rise residential towers.',
    category: 'Residential'
  },
  {
    url: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=400&q=80',
    title: 'Warehouse Facility',
    description: 'Large warehouse and logistics center.',
    category: 'Commercial'
  },
  {
    url: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=400&q=80',
    title: 'Luxury Villa',
    description: 'A luxury residential villa with modern amenities.',
    category: 'Residential'
  },
  {
    url: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80',
    title: 'Renovated Loft',
    description: 'A stylish loft renovation project.',
    category: 'Renovation'
  },
  {
    url: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80',
    title: 'Downtown Apartment',
    description: 'Renovation of a downtown apartment.',
    category: 'Renovation'
  },
  {
    url: 'https://images.unsplash.com/photo-1503389152951-9c3d8b6e9a2f?auto=format&fit=crop&w=400&q=80',
    title: 'Eco-Friendly Home',
    description: 'A sustainable, eco-friendly residential project.',
    category: 'Residential'
  }
];

async function seedGallery() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  await ProjectImage.deleteMany({});
  await ProjectImage.insertMany(images);
  console.log('Gallery images seeded.');
  mongoose.disconnect();
}

seedGallery();
