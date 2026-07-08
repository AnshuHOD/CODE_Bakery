// Feedback.js — Post-delivery customer review
// Delivery ke baad automatic email jaata hai. Customer rating + comment deta hai.

const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  guestName: { type: String, default: '' },
  guestEmail: { type: String, default: '' },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, default: '' },
  wouldRecommend: { type: Boolean },
}, { timestamps: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
