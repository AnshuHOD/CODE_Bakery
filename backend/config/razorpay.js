// razorpay.js — Razorpay SDK instance
// Key ID aur Secret .env se aate hain. Kabhi code mein hardcode mat karo.

const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

module.exports = razorpay;
