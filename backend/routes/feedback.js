const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');

// POST /api/feedback — Customer feedback submit karta hai
router.post('/', async (req, res) => {
  try {
    const { orderId, rating, comment, wouldRecommend, guestName, guestEmail } = req.body;
    
    let feedbackData = {
      rating,
      comment,
      wouldRecommend
    };

    if (orderId) {
      const order = await Order.findById(orderId);
      if (order) {
        feedbackData.order = orderId;
        feedbackData.customer = order.customer;
      }
    } else {
      feedbackData.guestName = guestName || 'Guest Reviewer';
      feedbackData.guestEmail = guestEmail || 'No email registered';
    }

    const feedback = await Feedback.create(feedbackData);
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
