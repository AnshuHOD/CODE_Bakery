// Product.js — Bakery menu item ka schema
// Yahan store hota hai: cake ka naam, description, price, category,
// availability, aur image URL.

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name required'],
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  category: {
    type: String,
    enum: ['cake', 'pastry', 'bread', 'cookie', 'waffle', 'pancake', 'coffee', 'tea', 'other'],
    default: 'cake',
  },
  pricePerKg: {
    type: Number,
    default: 0,
    min: 0,
  },
  pricePerPiece: {
    type: Number,
    default: 0,
    min: 0,
  },
  minSizeKg: {
    type: Number,
    default: 0.5,
  },
  available: {
    type: Boolean,
    default: true,
  },
  imageUrl: {
    type: String,
    default: '',
  },
  tags: [String], // jaise ["bestseller", "eggless", "custom"]
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
