// admin.js — Admin login + stats dashboard
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { protect } = require('../middleware/auth');
const Order = require('../models/Order');
const Lead = require('../models/Lead');
const Customer = require('../models/Customer');

// POST /api/admin/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, token });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

// GET /api/admin/stats — Dashboard numbers
router.get('/stats', protect, async (req, res) => {
  try {
    const [totalOrders, totalRevenue, totalLeads, totalCustomers, recentOrders] = await Promise.all([
      Order.countDocuments(),
      Order.aggregate([
        { $match: { 'payment.status': 'paid' } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),
      Lead.countDocuments(),
      Customer.countDocuments(),
      Order.find().populate('customer', 'name').sort({ createdAt: -1 }).limit(5),
    ]);

    res.json({
      success: true,
      data: {
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        totalLeads,
        totalCustomers,
        recentOrders,
      },
    });
  } catch (err) {
    console.error("Error in /admin/stats:", err);
    res.status(500).json({ success: false, message: 'Server error loading stats', error: err.message });
  }
});

module.exports = router;
