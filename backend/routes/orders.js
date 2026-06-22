const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { orderLimiter } = require('../middleware/rateLimiter');
const { placeOrder, getAllOrders, updateOrderStatus } = require('../controllers/orderController');
const Order = require('../models/Order');

// GET /api/orders/track/:orderId — Public tracking endpoint for Chatbot
router.get('/track/:orderId', async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId })
      .populate('customer', 'name');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({
      success: true,
      data: {
        orderId: order.orderId,
        customerName: order.customer?.name,
        status: order.status,
        deliveryDate: order.deliveryDate,
        total: order.total,
        items: order.items.map(i => ({ productName: i.productName, sizeKg: i.sizeKg }))
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', orderLimiter, placeOrder);            // Customer order place karta hai
router.get('/', protect, getAllOrders);                 // Admin — saare orders
router.put('/:id/status', protect, updateOrderStatus); // Admin — status update

module.exports = router;
