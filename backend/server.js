// server.js — Main entry point
// Yahan Express app start hoti hai, sab routes mount hote hain,
// MongoDB connect hoti hai, aur CRON jobs schedule hote hain.

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');
const { startCronJobs } = require('./services/cronService');

// Route imports
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const paymentRoutes = require('./routes/payments');
const leadRoutes = require('./routes/leads');
const feedbackRoutes = require('./routes/feedback');
const adminRoutes = require('./routes/admin');

const app = express();

// --- Middleware ---
app.use(helmet());                          // Security headers automatically set karta hai

// Multi-origin CORS support for production & development
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.ADMIN_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  }
}));
app.use(express.json());                    // JSON body parse karna
app.use(express.urlencoded({ extended: true }));

// --- Routes ---
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/admin', adminRoutes);

// Health check route
app.get('/health', (req, res) => res.json({ status: 'Bakery server is running 🎂' }));

// 404 handler
app.use('*', (req, res) => res.status(404).json({ message: 'Route not found' }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server error', error: err.message });
});

// --- Start ---
const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    startCronJobs(); // Scheduled tasks start karo
  });
});
