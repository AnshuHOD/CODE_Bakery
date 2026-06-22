// Customer.js — Customer ka record
// Har unique customer (by phone/email) ka ek record hota hai.
// Repeat orders automatically same customer se link hote hain.

const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String, required: true },
  address: {
    street: String,
    city: String,
    pincode: String,
  },
  totalOrders: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  lastOrderDate: Date,
}, { timestamps: true });

// Phone ya email se customer dhoodhna
customerSchema.index({ email: 1 }, { unique: true });
customerSchema.index({ phone: 1 });

module.exports = mongoose.model('Customer', customerSchema);
