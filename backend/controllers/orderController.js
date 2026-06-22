// orderController.js — Order place karne ka poora logic
// Kya karta hai:
//   1. Customer find karo ya banao
//   2. Lead record banao (CRM ke liye)
//   3. Order record banao (pending_payment status)
//   4. Razorpay order create karo
//   5. Frontend ko Razorpay order ID bhejo (payment ke liye)
// Payment confirm hone ke baad paymentController chalega

const Order = require('../models/Order');
const Customer = require('../models/Customer');
const Lead = require('../models/Lead');
const razorpay = require('../config/razorpay');
const generateOrderId = require('../utils/generateOrderId');

// POST /api/orders
const placeOrder = async (req, res) => {
  try {
    const { name, email, phone, address, items, deliveryDate, specialInstructions } = req.body;

    // Step 1: Customer find karo ya pehli baar ho toh create karo
    let customer = await Customer.findOne({ email });
    if (!customer) {
      customer = await Customer.create({ name, email, phone, address });
    }

    // Step 2: Total calculate karo
    let total = 0;
    const processedItems = items.map(item => {
      const subtotal = item.sizeKg * item.pricePerKg;
      total += subtotal;
      return { ...item, subtotal };
    });

    // Step 3: Lead record banao (CRM tracking ke liye)
    const lead = await Lead.create({
      customer: customer._id,
      name, email, phone,
      interestedIn: items.map(i => `${i.productName} (${i.sizeKg}kg)`).join(', '),
      source: 'website',
      status: 'qualified',
    });

    // Step 4: Order record banao (abhi payment pending)
    const orderId = generateOrderId();
    const order = await Order.create({
      orderId,
      customer: customer._id,
      lead: lead._id,
      items: processedItems,
      total,
      deliveryDate,
      deliveryAddress: address,
      specialInstructions,
      status: 'pending_payment',
    });

    // Step 5: Lead ko order se link karo
    lead.convertedOrderId = order._id;
    lead.status = 'order_placed';
    await lead.save();

    // Step 6: Razorpay order create karo
    // Amount paise mein hota hai (INR × 100)
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(total * 100),
      currency: 'INR',
      receipt: orderId,
      notes: { orderId, customerEmail: email },
    });

    // Order mein Razorpay ID save karo
    order.payment.razorpayOrderId = razorpayOrder.id;
    await order.save();

    // Frontend ko sab kuch bhejo — payment ke liye zaroori hai
    res.status(201).json({
      success: true,
      orderId,
      dbOrderId: order._id,
      total,
      razorpayOrderId: razorpayOrder.id,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID,
      customerName: name,
      customerEmail: email,
    });
  } catch (err) {
    console.error('Order placement error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/orders (admin)
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('customer', 'name email phone')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/orders/:id/status (admin — status update)
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('customer');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { placeOrder, getAllOrders, updateOrderStatus };
