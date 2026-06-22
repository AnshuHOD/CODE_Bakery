const express = require('express');
const router = express.Router();
const { verifyPayment } = require('../controllers/paymentController');

router.post('/verify', verifyPayment); // Frontend payment ke baad yeh call karta hai

module.exports = router;
