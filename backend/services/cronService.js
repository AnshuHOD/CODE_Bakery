// cronService.js — Scheduled automatic tasks
// node-cron use karta hai — jaise crontab Linux mein hota hai
// Cron format: "second minute hour day month weekday"
//
// Yahan kya kya schedule hai:
//   1. Har ghante: "delivered" orders check karo jinka feedback nahi maanga gaya
//      → unhe feedback request email bhejo
//   2. Roz subah 9 baje: pending_payment orders check karo jo 24 ghante se zyada purane hain
//      → unhe cancel karo (seat block na rahe)

const cron = require('node-cron');
const Order = require('../models/Order');
const { sendFeedbackRequestEmail } = require('./emailService');

const startCronJobs = () => {

  // Job 1: Feedback request — har ghante chalega
  cron.schedule('0 * * * *', async () => {
    console.log('⏰ Cron: Checking delivered orders for feedback...');
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const orders = await Order.find({
      status: 'delivered',
      feedbackRequested: false,
      updatedAt: { $lt: oneHourAgo },
    }).populate('customer');

    for (const order of orders) {
      try {
        await sendFeedbackRequestEmail(order);
        order.feedbackRequested = true;
        await order.save();
        console.log(`✅ Feedback email sent for ${order.orderId}`);
      } catch (err) {
        console.error(`❌ Feedback email failed for ${order.orderId}:`, err.message);
      }
    }
  });

  // Job 2: Stale pending payments cancel karo — roz subah 9 baje
  cron.schedule('0 9 * * *', async () => {
    console.log('⏰ Cron: Cancelling stale pending_payment orders...');
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    await Order.updateMany(
      { status: 'pending_payment', createdAt: { $lt: twentyFourHoursAgo } },
      { status: 'cancelled' }
    );
    console.log('✅ Stale orders cancelled');
  });

  console.log('✅ Cron jobs started');
};

module.exports = { startCronJobs };
