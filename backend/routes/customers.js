// customers.js — Customer authentication and personalized recommendation endpoints
const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const Order = require('../models/Order');
const Product = require('../models/Product');

// POST /api/customers/login
router.post('/login', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }
    const customer = await Customer.findOne({ email: email.toLowerCase().trim() });
    if (!customer) {
      return res.status(404).json({ success: false, message: 'No profile found for this email. Please place an order first or register!' });
    }
    res.json({ success: true, customer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/customers/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, street, city, pincode } = req.body;
    if (!name || !email || !phone) {
      return res.status(400).json({ success: false, message: 'Name, email and phone are required' });
    }
    let customer = await Customer.findOne({ email: email.toLowerCase().trim() });
    if (customer) {
      return res.status(400).json({ success: false, message: 'Email already registered. Please log in!' });
    }
    customer = await Customer.create({
      name,
      email: email.toLowerCase().trim(),
      phone,
      address: { street, city, pincode }
    });
    res.json({ success: true, customer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/customers/recommendations
router.get('/recommendations', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      // Return global bestsellers if guest
      const bestsellers = await Product.find({ available: true }).limit(4);
      return res.json({ success: true, recommendations: bestsellers, type: 'general' });
    }

    const customer = await Customer.findOne({ email: email.toLowerCase().trim() });
    if (!customer) {
      const bestsellers = await Product.find({ available: true }).limit(4);
      return res.json({ success: true, recommendations: bestsellers, type: 'general' });
    }

    // Fetch order history for customer
    const orders = await Order.find({ customer: customer._id });
    
    if (orders.length === 0) {
      // No orders yet, return general bestsellers
      const bestsellers = await Product.find({ available: true }).limit(4);
      return res.json({ success: true, recommendations: bestsellers, type: 'general' });
    }

    // Analyze categories ordered
    const categoryCounts = {};
    orders.forEach(order => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach(item => {
          // If product is not populated but we have category, or check product category
          const category = item.category || 'cake';
          categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        });
      }
    });

    // Sort categories by popularity
    const preferredCategories = Object.keys(categoryCounts).sort((a, b) => categoryCounts[b] - categoryCounts[a]);

    // Find products in preferred categories
    let recommendations = [];
    if (preferredCategories.length > 0) {
      recommendations = await Product.find({
        category: { $in: preferredCategories },
        available: true
      }).limit(4);
    }

    // If we don't have enough recommendations, fill with other available products
    if (recommendations.length < 4) {
      const extra = await Product.find({
        _id: { $nin: recommendations.map(r => r._id) },
        available: true
      }).limit(4 - recommendations.length);
      recommendations = recommendations.concat(extra);
    }

    res.json({ success: true, recommendations, type: 'personalized' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
