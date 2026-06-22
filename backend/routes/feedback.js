const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');

// POST /api/feedback — Customer feedback submit karta hai
router.post('/', async (req, res) => {
  try {
    const { orderId, rating, comment, wouldRecommend } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const feedback = await Feedback.create({
      order: orderId,
      customer: order.customer,
      rating, comment, wouldRecommend,
    });
    res.status(201).json({ success: true, data: feedback });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/feedback — Admin sab reviews dekhe
router.get('/', protect, async (req, res) => {
  const feedbacks = await Feedback.find()
    .populate('customer', 'name email')
    .populate('order', 'orderId')
    .sort({ createdAt: -1 });
  res.json({ success: true, data: feedbacks });
});

module.exports = router;
