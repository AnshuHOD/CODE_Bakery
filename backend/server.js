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
const chatbotRoutes = require('./routes/chatbot');
const customerRoutes = require('./routes/customers');

const app = express();

// --- Middleware ---
app.use(helmet({ contentSecurityPolicy: false })); // Security headers

// Multi-origin CORS support for production & development
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    if (
      origin.startsWith('http://localhost:') ||
      origin.startsWith('http://127.0.0.1:') ||
      origin.includes('vercel.app') ||
      origin.includes('hoodas-bakery') ||
      origin.includes('code-bakery') ||
      origin.includes('onrender.com')
    ) {
      return callback(null, true);
    }
    return callback(null, true); // Allow all origins for web application
  },
  credentials: true
}));
app.use(express.json());                    // JSON body parse karna
app.use(express.urlencoded({ extended: true }));

// --- Diagnostic Email Route ---
app.get('/api/test-email', async (req, res) => {
  try {
    const transporter = require('./config/email');
    const toEmail = req.query.to || 'anshuh027@gmail.com';
    const info = await transporter.sendMail({
      from: `Hooda's Bakery <anshuh027@gmail.com>`,
      to: toEmail,
      subject: `🧪 Live Server Email Test — Hooda's Bakery`,
      html: `<h2>Email Test Successful!</h2><p>This email was sent live from the bakery backend server.</p>`
    });
    res.json({ success: true, message: `Email sent successfully to ${toEmail}`, info });
  } catch (err) {
    console.error("Diagnostic email test error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- Routes ---
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/customers', customerRoutes);

// Health check route
app.get('/health', (req, res) => res.json({ status: 'Bakery server is running 🎂', version: '1.0.2 - email-diagnostics' }));

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
