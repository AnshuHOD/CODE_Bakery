const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Lead = require('../models/Lead');
const Customer = require('../models/Customer');

// POST /api/leads — Public endpoint for Smart Chatbot lead qualification
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, interestedIn, estimatedBudget, notes } = req.body;
    
    // Check if customer exists or create them
    let customer = await Customer.findOne({ email });
    if (!customer && email) {
      customer = await Customer.create({ name, email, phone });
    }

    const lead = await Lead.create({
      customer: customer ? customer._id : undefined,
      name,
      email,
      phone,
      interestedIn,
      estimatedBudget,
      source: 'website',
      status: 'new',
      notes
    });

    res.status(201).json({ success: true, data: lead });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// GET /api/leads — Admin CRM dashboard ke liye
router.get('/', protect, async (req, res) => {
  const leads = await Lead.find()
    .populate('customer', 'name email phone')
    .sort({ createdAt: -1 });
  res.json({ success: true, data: leads });
});

// PUT /api/leads/:id — Status ya notes manually update
router.put('/:id', protect, async (req, res) => {
  const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, data: lead });
});

module.exports = router;
