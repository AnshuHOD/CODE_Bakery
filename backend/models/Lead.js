// Lead.js — Lead funnel tracking
// Jab customer pehli baar contact karta hai, ek Lead record banta hai.
// Status track karta hai: New → Contacted → Qualified → Order Placed → Closed

const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  name: String,
  email: String,
  phone: String,
  interestedIn: String,       // "Chocolate Truffle Cake, 1kg"
  estimatedBudget: String,
  source: {
    type: String,
    enum: ['website', 'email', 'walk-in', 'referral', 'whatsapp'],
    default: 'website',
  },
  status: {
    type: String,
    enum: ['new', 'contacted', 'qualified', 'order_placed', 'closed_won', 'closed_lost'],
    default: 'new',
  },
  notes: String,
  convertedOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
}, { timestamps: true });

module.exports = mongoose.model('Lead', leadSchema);
