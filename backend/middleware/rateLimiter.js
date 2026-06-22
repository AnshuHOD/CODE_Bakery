// rateLimiter.js — Spam/abuse se bachao
// Order route pe 10 minutes mein max 20 requests per IP
// Public menu route pe 100 requests per 15 min

const rateLimit = require('express-rate-limit');

const orderLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 20,
  message: { success: false, message: 'Too many requests, please slow down.' },
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

module.exports = { orderLimiter, generalLimiter };
