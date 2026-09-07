// Order.js — Order ka full schema
// Har order mein: kaun, kya, kitna, kab, kahan deliver, payment status.
// Status lifecycle: pending_payment → confirmed → processing → dispatched → delivered

const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  productName: String,       // snapshot at time of order
  category: String,          // e.g. cake, pastry, bread, cookie
  sizeKg: Number,
  pricePerKg: Number,
  subtotal: Number,
  customMessage: String,     // cake pe likhne ke liye
  flavour: String,
});

const orderSchema = new mongoose.Schema({
  orderId: { type: String, unique: true },   // ORD-2031 format
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  customerName: String,                      // immutable snapshot at time of order
  customerEmail: String,                     // immutable snapshot at time of order
  customerPhone: String,                     // immutable snapshot at time of order
  lead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
  items: [orderItemSchema],
  total: { type: Number, required: true },
  deliveryDate: { type: Date, required: true },
  deliveryAddress: {
    street: String,
    city: String,
    pincode: String,
  },
  specialInstructions: String,
  status: {
    type: String,
    enum: ['pending_payment', 'confirmed', 'processing', 'dispatched', 'delivered', 'cancelled'],
    default: 'pending_payment',
  },
  payment: {
    razorpayOrderId: String,
    razorpayPaymentId: String,
    method: String,              // UPI, card, netbanking
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    paidAt: Date,
  },
  invoiceSent: { type: Boolean, default: false },
  feedbackRequested: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
