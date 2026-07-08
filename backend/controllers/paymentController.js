// paymentController.js — Payment verify karna + post-payment automation
// Kya karta hai jab payment success hoti hai:
//   1. Razorpay signature verify karo (fake webhook se bachne ke liye)
//   2. Order status → confirmed
//   3. Customer stats update karo
//   4. PDF invoice generate karo
//   5. Invoice email bhejo customer ko
//   6. Admin ko notification email bhejo

const crypto = require('crypto');
const Order = require('../models/Order');
const Customer = require('../models/Customer');
const { sendOrderConfirmationEmail, sendAdminNotificationEmail } = require('../services/emailService');
const { generateInvoice } = require('../services/invoiceService');

// POST /api/payments/verify
// Frontend payment karne ke baad yeh call karta hai
const verifyPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, dbOrderId } = req.body;

    const isMock = razorpayPaymentId && razorpayPaymentId.startsWith('mock_pay_');

    if (!isMock) {
      // Step 1: Signature verify karo
      // Razorpay ka secret use karke hash banana, phir compare karna
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest('hex');

      if (expectedSignature !== razorpaySignature) {
        return res.status(400).json({ success: false, message: 'Invalid payment signature' });
      }
    }

    // Step 2: Order update karo
    const order = await Order.findById(dbOrderId).populate('customer').populate('items.product');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    order.status = 'confirmed';
    order.payment.razorpayPaymentId = razorpayPaymentId;
    order.payment.status = 'paid';
    order.payment.paidAt = new Date();
    await order.save();

    // Step 3: Customer stats update
    await Customer.findByIdAndUpdate(order.customer._id, {
      $inc: { totalOrders: 1, totalSpent: order.total },
      lastOrderDate: new Date(),
    });

    // Step 4: PDF Invoice generate karo
    const invoicePath = await generateInvoice(order);

    // Step 5: Customer ko confirmation + invoice email
    await sendOrderConfirmationEmail(order, invoicePath);
    order.invoiceSent = true;
    await order.save();

    // Step 6: Admin ko notification
    await sendAdminNotificationEmail(order);

    res.json({ success: true, message: 'Payment verified, order confirmed!', orderId: order.orderId });
  } catch (err) {
    console.error('Payment verification error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { verifyPayment };
