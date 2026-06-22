# 🎂 Bakery Automation System — Full Project

> **Stack:** Node.js + Express + MongoDB + Razorpay + Nodemailer + PDFKit + React  
> **What it does:** End-to-end bakery automation — customer orders via website, smart bot qualifies leads, Razorpay handles payment, PDF invoice emailed automatically, admin dashboard tracks everything live.

---

## Project Folder Structure

```
bakery-automation/
├── backend/
│   ├── config/
│   │   ├── db.js              ← MongoDB connection
│   │   ├── email.js           ← Nodemailer setup (Gmail SMTP)
│   │   └── razorpay.js        ← Razorpay instance
│   ├── models/
│   │   ├── Product.js         ← Bakery menu items schema
│   │   ├── Customer.js        ← Customer info schema
│   │   ├── Lead.js            ← Lead funnel tracking schema
│   │   ├── Order.js           ← Order schema
│   │   └── Feedback.js        ← Post-delivery feedback schema
│   ├── routes/
│   │   ├── products.js        ← GET /api/products (menu)
│   │   ├── orders.js          ← POST /api/orders (place order)
│   │   ├── payments.js        ← POST /api/payments (Razorpay)
│   │   ├── leads.js           ← GET /api/leads (CRM)
│   │   ├── feedback.js        ← POST /api/feedback
│   │   └── admin.js           ← Admin-only routes
│   ├── controllers/
│   │   ├── productController.js
│   │   ├── orderController.js
│   │   ├── paymentController.js
│   │   ├── leadController.js
│   │   └── feedbackController.js
│   ├── services/
│   │   ├── emailService.js    ← Send emails (confirmation, invoice, feedback request)
│   │   ├── invoiceService.js  ← Generate PDF invoice using PDFKit
│   │   └── cronService.js     ← Scheduled jobs (feedback reminder, SLA check)
│   ├── middleware/
│   │   ├── auth.js            ← Admin JWT authentication
│   │   └── rateLimiter.js     ← Prevent spam/abuse
│   ├── utils/
│   │   └── generateOrderId.js ← Unique order ID generator
│   ├── .env.example           ← Environment variables template
│   ├── package.json
│   └── server.js              ← Main entry point
│
├── frontend/
│   ├── customer/              ← Plain HTML/CSS/JS (no framework needed)
│   │   ├── index.html         ← Landing page
│   │   ├── menu.html          ← Browse bakery menu
│   │   ├── order.html         ← Place order form
│   │   ├── confirmation.html  ← Order placed success page
│   │   └── css/
│   │       └── style.css
│   │
│   └── admin/                 ← React dashboard (Vite)
│       ├── src/
│       │   ├── App.jsx
│       │   ├── main.jsx
│       │   ├── pages/
│       │   │   ├── Dashboard.jsx   ← Overview stats
│       │   │   ├── Orders.jsx      ← All orders + status
│       │   │   ├── Leads.jsx       ← CRM lead list
│       │   │   ├── Menu.jsx        ← Add/edit/remove products
│       │   │   └── Feedback.jsx    ← Customer reviews
│       │   ├── components/
│       │   │   ├── Navbar.jsx
│       │   │   ├── StatCard.jsx
│       │   │   └── StatusBadge.jsx
│       │   └── api/
│       │       └── axios.js    ← Preconfigured Axios instance
│       ├── index.html
│       ├── vite.config.js
│       └── package.json
│
└── README.md
```

---

## Environment Variables — `.env.example`

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGO_URI=mongodb+srv://youruser:yourpassword@cluster.mongodb.net/bakery

# JWT (Admin login)
JWT_SECRET=your_super_secret_jwt_key_here

# Email (Gmail SMTP)
EMAIL_USER=yourbakery@gmail.com
EMAIL_PASS=your_gmail_app_password_here
EMAIL_FROM=Sweet Bites Bakery <yourbakery@gmail.com>

# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret_here

# Frontend URL (for CORS and email links)
FRONTEND_URL=http://localhost:3000

# Admin credentials (for first login)
ADMIN_EMAIL=admin@sweetbites.com
ADMIN_PASSWORD=Admin@1234
```

> ⚠️ Gmail App Password kaise banate hain: Gmail → Settings → Security → 2-Step Verification ON → App Passwords → "Mail" → Generate. Woh 16-char code hi EMAIL_PASS mein jaata hai, actual Gmail password nahi.

---

## `backend/package.json`

```json
{
  "name": "bakery-automation-backend",
  "version": "1.0.0",
  "description": "End-to-end bakery automation backend",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^8.0.0",
    "dotenv": "^16.3.1",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "express-rate-limit": "^7.1.5",
    "nodemailer": "^6.9.7",
    "razorpay": "^2.9.2",
    "pdfkit": "^0.15.0",
    "node-cron": "^3.0.3",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "uuid": "^9.0.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}
```

---

## `backend/server.js`

```javascript
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
app.use(cors({ origin: process.env.FRONTEND_URL })); // Sirf apni frontend se requests allow
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
```

---

## `backend/config/db.js`

```javascript
// db.js — MongoDB se connect karna
// Mongoose use karta hai. Ek baar connect hota hai, phir sab models
// automatically us connection ko use karte hain.

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1); // Connection fail hone par server band karo
  }
};

module.exports = connectDB;
```

---

## `backend/config/email.js`

```javascript
// email.js — Nodemailer transporter setup
// Gmail SMTP use kar raha hai. App Password required hai, normal Gmail
// password kaam nahi karta (security reason se).

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify karo ki setup sahi hai (server start pe)
transporter.verify((error) => {
  if (error) console.error('❌ Email setup error:', error.message);
  else console.log('✅ Email service ready');
});

module.exports = transporter;
```

---

## `backend/config/razorpay.js`

```javascript
// razorpay.js — Razorpay SDK instance
// Key ID aur Secret .env se aate hain. Kabhi code mein hardcode mat karo.

const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

module.exports = razorpay;
```

---

## `backend/models/Product.js`

```javascript
// Product.js — Bakery menu item ka schema
// Yahan store hota hai: cake ka naam, description, price, category,
// availability, aur image URL.

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name required'],
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  category: {
    type: String,
    enum: ['cake', 'pastry', 'bread', 'cookie', 'other'],
    default: 'cake',
  },
  pricePerKg: {
    type: Number,
    required: true,
    min: 0,
  },
  minSizeKg: {
    type: Number,
    default: 0.5,
  },
  available: {
    type: Boolean,
    default: true,
  },
  imageUrl: {
    type: String,
    default: '',
  },
  tags: [String], // jaise ["bestseller", "eggless", "custom"]
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
```

---

## `backend/models/Customer.js`

```javascript
// Customer.js — Customer ka record
// Har unique customer (by phone/email) ka ek record hota hai.
// Repeat orders automatically same customer se link hote hain.

const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String, required: true },
  address: {
    street: String,
    city: String,
    pincode: String,
  },
  totalOrders: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  lastOrderDate: Date,
}, { timestamps: true });

// Phone ya email se customer dhoodhna
customerSchema.index({ email: 1 }, { unique: true });
customerSchema.index({ phone: 1 });

module.exports = mongoose.model('Customer', customerSchema);
```

---

## `backend/models/Lead.js`

```javascript
// Lead.js — Lead funnel tracking
// Jab customer pehli baar contact karta hai, ek Lead record banta hai.
// Status track karta hai: New → Contacted → Qualified → Order Placed → Closed

const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  name: String,
  email: String,
  phone: String,
  interestedIn: String,       // "Chocolate Truffle Cake, 1kg"
  estimatedBudget: String,
  source: {
    type: String,
    enum: ['website', 'email', 'walk-in', 'referral'],
    default: 'website',
  },
  status: {
    type: String,
    enum: ['new', 'contacted', 'qualified', 'order_placed', 'closed_won', 'closed_lost'],
    default: 'new',
  },
  notes: String,
  convertedOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
}, { timestamps: true });

module.exports = mongoose.model('Lead', leadSchema);
```

---

## `backend/models/Order.js`

```javascript
// Order.js — Order ka full schema
// Har order mein: kaun, kya, kitna, kab, kahan deliver, payment status.
// Status lifecycle: pending_payment → confirmed → processing → dispatched → delivered

const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  productName: String,       // snapshot at time of order
  sizeKg: Number,
  pricePerKg: Number,
  subtotal: Number,
  customMessage: String,     // cake pe likhne ke liye
  flavour: String,
});

const orderSchema = new mongoose.Schema({
  orderId: { type: String, unique: true },   // ORD-2031 format
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  lead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
  items: [orderItemSchema],
  total: { type: Number, required: true },
  deliveryDate: { type: Date, required: true },
  deliveryAddress: {
    street: String,
    city: String,
    pincode: String,
  },
  specialInstructions: String,
  status: {
    type: String,
    enum: ['pending_payment', 'confirmed', 'processing', 'dispatched', 'delivered', 'cancelled'],
    default: 'pending_payment',
  },
  payment: {
    razorpayOrderId: String,
    razorpayPaymentId: String,
    method: String,              // UPI, card, netbanking
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    paidAt: Date,
  },
  invoiceSent: { type: Boolean, default: false },
  feedbackRequested: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
```

---

## `backend/models/Feedback.js`

```javascript
// Feedback.js — Post-delivery customer review
// Delivery ke baad automatic email jaata hai. Customer rating + comment deta hai.

const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, default: '' },
  wouldRecommend: { type: Boolean },
}, { timestamps: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
```

---

## `backend/utils/generateOrderId.js`

```javascript
// generateOrderId.js — Unique readable Order ID banana
// Format: ORD-YYYYMMDD-XXXX (jaise ORD-20260619-4821)
// Human-readable hai aur phone pe bolne mein aasan

const generateOrderId = () => {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(1000 + Math.random() * 9000); // 4-digit random
  return `ORD-${dateStr}-${random}`;
};

module.exports = generateOrderId;
```

---

## `backend/controllers/productController.js`

```javascript
// productController.js — Menu se related sab logic yahan hai
// Kya karta hai:
//   getAllProducts → saara menu (filter support: category, available only)
//   getProductById → ek item ki detail
//   createProduct → admin se naya item add
//   updateProduct → price/availability update
//   deleteProduct → item remove

const Product = require('../models/Product');

// GET /api/products
// Query params: ?category=cake&available=true
const getAllProducts = async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.available === 'true') filter.available = true;

    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: products.length, data: products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/products/:id
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/products  (admin only)
const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// PUT /api/products/:id  (admin only)
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// DELETE /api/products/:id  (admin only)
const deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Product removed' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct };
```

---

## `backend/controllers/orderController.js`

```javascript
// orderController.js — Order place karne ka poora logic
// Kya karta hai:
//   1. Customer find karo ya banao
//   2. Lead record banao (CRM ke liye)
//   3. Order record banao (pending_payment status)
//   4. Razorpay order create karo
//   5. Frontend ko Razorpay order ID bhejo (payment ke liye)
// Payment confirm hone ke baad paymentController chalega

const Order = require('../models/Order');
const Customer = require('../models/Customer');
const Lead = require('../models/Lead');
const razorpay = require('../config/razorpay');
const generateOrderId = require('../utils/generateOrderId');

// POST /api/orders
const placeOrder = async (req, res) => {
  try {
    const { name, email, phone, address, items, deliveryDate, specialInstructions } = req.body;

    // Step 1: Customer find karo ya pehli baar ho toh create karo
    let customer = await Customer.findOne({ email });
    if (!customer) {
      customer = await Customer.create({ name, email, phone, address });
    }

    // Step 2: Total calculate karo
    let total = 0;
    const processedItems = items.map(item => {
      const subtotal = item.sizeKg * item.pricePerKg;
      total += subtotal;
      return { ...item, subtotal };
    });

    // Step 3: Lead record banao (CRM tracking ke liye)
    const lead = await Lead.create({
      customer: customer._id,
      name, email, phone,
      interestedIn: items.map(i => `${i.productName} (${i.sizeKg}kg)`).join(', '),
      source: 'website',
      status: 'qualified',
    });

    // Step 4: Order record banao (abhi payment pending)
    const orderId = generateOrderId();
    const order = await Order.create({
      orderId,
      customer: customer._id,
      lead: lead._id,
      items: processedItems,
      total,
      deliveryDate,
      deliveryAddress: address,
      specialInstructions,
      status: 'pending_payment',
    });

    // Step 5: Lead ko order se link karo
    lead.convertedOrderId = order._id;
    lead.status = 'order_placed';
    await lead.save();

    // Step 6: Razorpay order create karo
    // Amount paise mein hota hai (INR × 100)
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(total * 100),
      currency: 'INR',
      receipt: orderId,
      notes: { orderId, customerEmail: email },
    });

    // Order mein Razorpay ID save karo
    order.payment.razorpayOrderId = razorpayOrder.id;
    await order.save();

    // Frontend ko sab kuch bhejo — payment ke liye zaroori hai
    res.status(201).json({
      success: true,
      orderId,
      dbOrderId: order._id,
      total,
      razorpayOrderId: razorpayOrder.id,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID,
      customerName: name,
      customerEmail: email,
    });
  } catch (err) {
    console.error('Order placement error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/orders (admin)
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('customer', 'name email phone')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/orders/:id/status (admin — status update)
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('customer');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { placeOrder, getAllOrders, updateOrderStatus };
```

---

## `backend/controllers/paymentController.js`

```javascript
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

    // Step 1: Signature verify karo
    // Razorpay ka secret use karke hash banana, phir compare karna
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    // Step 2: Order update karo
    const order = await Order.findById(dbOrderId).populate('customer');
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
```

---

## `backend/services/invoiceService.js`

```javascript
// invoiceService.js — PDF Invoice banana using PDFKit
// Professional bakery invoice generate karta hai:
//   - Bakery logo area, invoice number, date
//   - Customer details, delivery details
//   - Itemized order table
//   - Total amount, payment method
//   - Thank you note

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generateInvoice = (order) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    
    // Invoice save karne ki jagah
    const invoiceDir = path.join(__dirname, '../invoices');
    if (!fs.existsSync(invoiceDir)) fs.mkdirSync(invoiceDir);
    const filePath = path.join(invoiceDir, `invoice-${order.orderId}.pdf`);
    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);

    // --- Header ---
    doc.fillColor('#1B2A4A').fontSize(24).font('Helvetica-Bold').text('Sweet Bites Bakery', 50, 50);
    doc.fontSize(10).fillColor('#555').text('Delivering Happiness, One Slice at a Time', 50, 80);
    doc.moveTo(50, 100).lineTo(545, 100).strokeColor('#1B2A4A').stroke();

    // INVOICE label
    doc.fontSize(22).fillColor('#0F6E56').text('INVOICE', 400, 50, { align: 'right' });
    doc.fontSize(10).fillColor('#333').text(`Invoice No: ${order.orderId}`, 400, 80, { align: 'right' });
    doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, 400, 95, { align: 'right' });

    // --- Bill To ---
    doc.moveDown(2);
    doc.fillColor('#1B2A4A').fontSize(12).font('Helvetica-Bold').text('Bill To:');
    doc.font('Helvetica').fillColor('#333').fontSize(10)
      .text(order.customer.name)
      .text(order.customer.email)
      .text(order.customer.phone)
      .text(`${order.deliveryAddress.street}, ${order.deliveryAddress.city} - ${order.deliveryAddress.pincode}`);

    // Delivery Date
    doc.moveDown().fillColor('#1B2A4A').font('Helvetica-Bold').text('Delivery Date:')
      .font('Helvetica').fillColor('#333')
      .text(new Date(order.deliveryDate).toLocaleDateString('en-IN', { dateStyle: 'long' }));

    // --- Items Table ---
    doc.moveDown(2);
    const tableTop = doc.y;

    // Table header background
    doc.fillColor('#1B2A4A').rect(50, tableTop, 495, 22).fill();
    doc.fillColor('white').fontSize(10).font('Helvetica-Bold')
      .text('Item', 55, tableTop + 6)
      .text('Flavour', 220, tableTop + 6)
      .text('Size', 310, tableTop + 6)
      .text('Rate/kg', 370, tableTop + 6)
      .text('Amount', 460, tableTop + 6);

    // Table rows
    let rowY = tableTop + 28;
    order.items.forEach((item, idx) => {
      const bg = idx % 2 === 0 ? '#F1EFE8' : 'white';
      doc.fillColor(bg).rect(50, rowY - 4, 495, 20).fill();
      doc.fillColor('#333').font('Helvetica').fontSize(9)
        .text(item.productName, 55, rowY)
        .text(item.flavour || '-', 220, rowY)
        .text(`${item.sizeKg} kg`, 310, rowY)
        .text(`₹${item.pricePerKg}`, 370, rowY)
        .text(`₹${item.subtotal}`, 460, rowY);
      rowY += 22;
    });

    // Total row
    doc.moveTo(50, rowY).lineTo(545, rowY).strokeColor('#1B2A4A').stroke();
    rowY += 10;
    doc.fillColor('#1B2A4A').fontSize(12).font('Helvetica-Bold')
      .text('Total Amount:', 370, rowY)
      .text(`₹${order.total}`, 460, rowY);

    // Payment Status
    doc.moveDown(3).fontSize(10).fillColor('#0F6E56').font('Helvetica-Bold')
      .text(`✅ Payment Status: PAID`, 50);
    doc.font('Helvetica').fillColor('#555')
      .text(`Payment ID: ${order.payment.razorpayPaymentId}`)
      .text(`Paid on: ${new Date(order.payment.paidAt).toLocaleString('en-IN')}`);

    // Special Instructions
    if (order.specialInstructions) {
      doc.moveDown().fillColor('#1B2A4A').font('Helvetica-Bold').text('Special Instructions:')
        .font('Helvetica').fillColor('#555').text(order.specialInstructions);
    }

    // Footer
    doc.moveTo(50, 750).lineTo(545, 750).strokeColor('#1B2A4A').stroke();
    doc.fontSize(9).fillColor('#888')
      .text('Thank you for choosing Sweet Bites Bakery! 🎂', 50, 760, { align: 'center' })
      .text('Contact: yourbakery@gmail.com | This is a computer-generated invoice.', { align: 'center' });

    doc.end();
    writeStream.on('finish', () => resolve(filePath));
    writeStream.on('error', reject);
  });
};

module.exports = { generateInvoice };
```

---

## `backend/services/emailService.js`

```javascript
// emailService.js — Sab email templates yahan hain
// Functions:
//   sendOrderConfirmationEmail → customer ko order + invoice email
//   sendAdminNotificationEmail → owner ko naya order alert
//   sendFeedbackRequestEmail   → delivery ke baad customer ko review maangna
//   sendPaymentFailedEmail     → payment fail hone par customer ko

const transporter = require('../config/email');
const fs = require('fs');

// Customer ko order confirmation + PDF invoice
const sendOrderConfirmationEmail = async (order, invoicePath) => {
  const itemsList = order.items
    .map(i => `<li>${i.productName} - ${i.sizeKg}kg @ ₹${i.pricePerKg}/kg = <strong>₹${i.subtotal}</strong></li>`)
    .join('');

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: order.customer.email,
    subject: `🎂 Order Confirmed! ${order.orderId} — Sweet Bites Bakery`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <div style="background: #1B2A4A; padding: 24px; text-align: center;">
          <h1 style="color: white; margin: 0;">Sweet Bites Bakery 🎂</h1>
          <p style="color: #E1F5EE; margin: 4px 0;">Your order is confirmed!</p>
        </div>
        <div style="padding: 24px;">
          <p>Hi <strong>${order.customer.name}</strong>,</p>
          <p>Thank you for your order! We're excited to bake for you. Here are your order details:</p>
          
          <div style="background: #F1EFE8; padding: 16px; border-radius: 6px; margin: 16px 0;">
            <p><strong>Order ID:</strong> ${order.orderId}</p>
            <p><strong>Delivery Date:</strong> ${new Date(order.deliveryDate).toLocaleDateString('en-IN', { dateStyle: 'long' })}</p>
            <p><strong>Delivery Address:</strong> ${order.deliveryAddress.street}, ${order.deliveryAddress.city}</p>
          </div>

          <h3 style="color: #1B2A4A;">Order Items:</h3>
          <ul>${itemsList}</ul>
          <p style="font-size: 18px; color: #0F6E56;"><strong>Total Paid: ₹${order.total}</strong></p>

          <p style="color: #888; font-size: 12px; margin-top: 24px;">Your invoice is attached to this email. If you have any questions, reply to this email.</p>
          <p>With love,<br><strong>Sweet Bites Bakery Team</strong> 🎂</p>
        </div>
      </div>
    `,
    attachments: [
      {
        filename: `invoice-${order.orderId}.pdf`,
        path: invoicePath,
        contentType: 'application/pdf',
      },
    ],
  });
  console.log(`✅ Confirmation email sent to ${order.customer.email}`);
};

// Admin ko naya order alert
const sendAdminNotificationEmail = async (order) => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: process.env.EMAIL_USER, // admin khud
    subject: `🆕 New Order Received: ${order.orderId} — ₹${order.total}`,
    html: `
      <h2>New Order Alert!</h2>
      <p><strong>Order ID:</strong> ${order.orderId}</p>
      <p><strong>Customer:</strong> ${order.customer.name} (${order.customer.email})</p>
      <p><strong>Phone:</strong> ${order.customer.phone}</p>
      <p><strong>Total:</strong> ₹${order.total}</p>
      <p><strong>Delivery Date:</strong> ${new Date(order.deliveryDate).toLocaleDateString('en-IN')}</p>
      <p><strong>Items:</strong> ${order.items.map(i => `${i.productName} ${i.sizeKg}kg`).join(', ')}</p>
      ${order.specialInstructions ? `<p><strong>Special Instructions:</strong> ${order.specialInstructions}</p>` : ''}
      <p><a href="${process.env.FRONTEND_URL}/admin/orders">View in Admin Panel →</a></p>
    `,
  });
};

// Delivery ke baad feedback maangna
const sendFeedbackRequestEmail = async (order) => {
  const feedbackUrl = `${process.env.FRONTEND_URL}/feedback/${order._id}`;
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: order.customer.email,
    subject: `How was your order from Sweet Bites? 🌟 — ${order.orderId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <div style="background: #1B2A4A; padding: 20px; text-align: center;">
          <h2 style="color: white;">We hope you loved it! 🎂</h2>
        </div>
        <div style="padding: 24px;">
          <p>Hi <strong>${order.customer.name}</strong>,</p>
          <p>Your order <strong>${order.orderId}</strong> has been delivered. We'd love to hear what you think!</p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${feedbackUrl}" 
               style="background: #0F6E56; color: white; padding: 14px 28px; border-radius: 6px; text-decoration: none; font-size: 16px; font-weight: bold;">
              ⭐ Leave a Review
            </a>
          </div>
          <p style="color: #888; font-size: 12px;">Your feedback helps us improve and serve you better next time!</p>
        </div>
      </div>
    `,
  });
};

// Payment fail hone par
const sendPaymentFailedEmail = async (customerEmail, customerName, orderId) => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: customerEmail,
    subject: `Payment Issue — Order ${orderId}`,
    html: `
      <p>Hi ${customerName},</p>
      <p>We noticed your payment for order <strong>${orderId}</strong> could not be completed.</p>
      <p>Please try again: <a href="${process.env.FRONTEND_URL}/order/${orderId}/pay">Retry Payment →</a></p>
      <p>If you need help, just reply to this email.</p>
      <p>Sweet Bites Bakery Team</p>
    `,
  });
};

module.exports = {
  sendOrderConfirmationEmail,
  sendAdminNotificationEmail,
  sendFeedbackRequestEmail,
  sendPaymentFailedEmail,
};
```

---

## `backend/services/cronService.js`

```javascript
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
```

---

## `backend/middleware/auth.js`

```javascript
// auth.js — Admin routes protect karna
// JWT token verify karta hai. Agar token nahi ya galat, 401 return karta hai.
// Usage: router.get('/orders', protect, getAllOrders)

const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch {
    res.status(401).json({ message: 'Not authorized, invalid token' });
  }
};

module.exports = { protect };
```

---

## `backend/middleware/rateLimiter.js`

```javascript
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
```

---

## `backend/routes/products.js`

```javascript
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getAllProducts, getProductById, createProduct, updateProduct, deleteProduct
} = require('../controllers/productController');

router.get('/', getAllProducts);           // Public — menu dikhana
router.get('/:id', getProductById);       // Public — single item
router.post('/', protect, createProduct); // Admin only
router.put('/:id', protect, updateProduct);
router.delete('/:id', protect, deleteProduct);

module.exports = router;
```

---

## `backend/routes/orders.js`

```javascript
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { orderLimiter } = require('../middleware/rateLimiter');
const { placeOrder, getAllOrders, updateOrderStatus } = require('../controllers/orderController');

router.post('/', orderLimiter, placeOrder);            // Customer order place karta hai
router.get('/', protect, getAllOrders);                 // Admin — saare orders
router.put('/:id/status', protect, updateOrderStatus); // Admin — status update

module.exports = router;
```

---

## `backend/routes/payments.js`

```javascript
const express = require('express');
const router = express.Router();
const { verifyPayment } = require('../controllers/paymentController');

router.post('/verify', verifyPayment); // Frontend payment ke baad yeh call karta hai

module.exports = router;
```

---

## `backend/routes/leads.js`

```javascript
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Lead = require('../models/Lead');

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
```

---

## `backend/routes/feedback.js`

```javascript
const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');

// POST /api/feedback — Customer feedback submit karta hai
router.post('/', async (req, res) => {
  try {
    const { orderId, rating, comment, wouldRecommend } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const feedback = await Feedback.create({
      order: orderId,
      customer: order.customer,
      rating, comment, wouldRecommend,
    });
    res.status(201).json({ success: true, data: feedback });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/feedback — Admin sab reviews dekhe
router.get('/', protect, async (req, res) => {
  const feedbacks = await Feedback.find()
    .populate('customer', 'name email')
    .populate('order', 'orderId')
    .sort({ createdAt: -1 });
  res.json({ success: true, data: feedbacks });
});

module.exports = router;
```

---

## `backend/routes/admin.js`

```javascript
// admin.js — Admin login + stats dashboard
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { protect } = require('../middleware/auth');
const Order = require('../models/Order');
const Lead = require('../models/Lead');
const Customer = require('../models/Customer');

// POST /api/admin/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, token });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

// GET /api/admin/stats — Dashboard numbers
router.get('/stats', protect, async (req, res) => {
  const [totalOrders, totalRevenue, totalLeads, totalCustomers, recentOrders] = await Promise.all([
    Order.countDocuments(),
    Order.aggregate([
      { $match: { 'payment.status': 'paid' } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]),
    Lead.countDocuments(),
    Customer.countDocuments(),
    Order.find().populate('customer', 'name').sort({ createdAt: -1 }).limit(5),
  ]);

  res.json({
    success: true,
    data: {
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      totalLeads,
      totalCustomers,
      recentOrders,
    },
  });
});

module.exports = router;
```

---

## `frontend/customer/index.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Sweet Bites Bakery 🎂</title>
  <link rel="stylesheet" href="css/style.css"/>
</head>
<body>
  <nav class="navbar">
    <div class="brand">🎂 Sweet Bites</div>
    <div class="nav-links">
      <a href="menu.html">Our Menu</a>
      <a href="order.html" class="btn-nav">Order Now</a>
    </div>
  </nav>

  <section class="hero">
    <div class="hero-content">
      <h1>Fresh Baked, With Love</h1>
      <p>Custom cakes, pastries & breads — delivered to your door.</p>
      <a href="menu.html" class="btn-primary">Browse Menu</a>
      <a href="order.html" class="btn-secondary">Place Order</a>
    </div>
  </section>

  <section class="features">
    <div class="feature-card">🎂 Custom Cakes</div>
    <div class="feature-card">🚚 Home Delivery</div>
    <div class="feature-card">💳 Secure Payment</div>
    <div class="feature-card">📧 Invoice on Email</div>
  </section>

  <footer class="footer">
    <p>© 2026 Sweet Bites Bakery · Made with love 🎂</p>
  </footer>
</body>
</html>
```

---

## `frontend/customer/menu.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Menu — Sweet Bites Bakery</title>
  <link rel="stylesheet" href="css/style.css"/>
</head>
<body>
  <nav class="navbar">
    <div class="brand">🎂 Sweet Bites</div>
    <div class="nav-links">
      <a href="index.html">Home</a>
      <a href="order.html" class="btn-nav">Order Now</a>
    </div>
  </nav>

  <main class="menu-page">
    <h2 class="page-title">Our Menu</h2>

    <!-- Category filter buttons -->
    <div class="filter-bar">
      <button class="filter-btn active" onclick="filterMenu('all')">All</button>
      <button class="filter-btn" onclick="filterMenu('cake')">Cakes</button>
      <button class="filter-btn" onclick="filterMenu('pastry')">Pastries</button>
      <button class="filter-btn" onclick="filterMenu('bread')">Breads</button>
    </div>

    <!-- Products load here from API -->
    <div class="product-grid" id="productGrid">
      <p class="loading">Loading menu... 🎂</p>
    </div>
  </main>

  <script>
    const API = 'http://localhost:5000/api';
    let allProducts = [];

    async function loadMenu() {
      try {
        const res = await fetch(`${API}/products?available=true`);
        const data = await res.json();
        allProducts = data.data;
        renderProducts(allProducts);
      } catch (err) {
        document.getElementById('productGrid').innerHTML = '<p>Could not load menu. Please try again.</p>';
      }
    }

    function filterMenu(category) {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      event.target.classList.add('active');
      const filtered = category === 'all' ? allProducts : allProducts.filter(p => p.category === category);
      renderProducts(filtered);
    }

    function renderProducts(products) {
      const grid = document.getElementById('productGrid');
      if (!products.length) { grid.innerHTML = '<p>No items in this category.</p>'; return; }
      grid.innerHTML = products.map(p => `
        <div class="product-card">
          ${p.imageUrl ? `<img src="${p.imageUrl}" alt="${p.name}" class="product-img"/>` : '<div class="product-img-placeholder">🎂</div>'}
          <div class="product-info">
            <span class="product-category">${p.category}</span>
            <h3>${p.name}</h3>
            <p>${p.description}</p>
            <p class="price">₹${p.pricePerKg} / kg</p>
            <p class="min-size">Min size: ${p.minSizeKg} kg</p>
            <a href="order.html?item=${p._id}" class="btn-order">Order This</a>
          </div>
        </div>
      `).join('');
    }

    loadMenu();
  </script>
</body>
</html>
```

---

## `frontend/customer/order.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Place Order — Sweet Bites Bakery</title>
  <!-- Razorpay Checkout SDK -->
  <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
  <link rel="stylesheet" href="css/style.css"/>
</head>
<body>
  <nav class="navbar">
    <div class="brand">🎂 Sweet Bites</div>
    <div class="nav-links"><a href="menu.html">Menu</a></div>
  </nav>

  <main class="order-page">
    <h2 class="page-title">Place Your Order</h2>
    <form id="orderForm" class="order-form" onsubmit="submitOrder(event)">

      <!-- Customer Details -->
      <fieldset>
        <legend>Your Details</legend>
        <label>Full Name <input type="text" name="name" required/></label>
        <label>Email <input type="email" name="email" required/></label>
        <label>Phone <input type="tel" name="phone" required/></label>
      </fieldset>

      <!-- Delivery Details -->
      <fieldset>
        <legend>Delivery Address</legend>
        <label>Street <input type="text" name="street" required/></label>
        <label>City <input type="text" name="city" required/></label>
        <label>Pincode <input type="text" name="pincode" required/></label>
        <label>Delivery Date <input type="date" name="deliveryDate" required min=""/></label>
      </fieldset>

      <!-- Order Items -->
      <fieldset>
        <legend>What would you like?</legend>
        <div id="items">
          <div class="item-row">
            <select name="productId[]" required onchange="updatePrice(this)">
              <option value="">Select item...</option>
            </select>
            <input type="number" name="sizeKg[]" placeholder="Size (kg)" min="0.5" step="0.5" required/>
            <input type="text" name="flavour[]" placeholder="Flavour (e.g. Chocolate)"/>
            <input type="text" name="customMessage[]" placeholder="Message on cake (optional)"/>
          </div>
        </div>
        <button type="button" onclick="addItem()" class="btn-secondary">+ Add Another Item</button>
      </fieldset>

      <label>Special Instructions
        <textarea name="specialInstructions" rows="3" placeholder="Allergies, preferences..."></textarea>
      </label>

      <button type="submit" class="btn-primary" id="submitBtn">Proceed to Payment →</button>
    </form>
  </main>

  <script>
    const API = 'http://localhost:5000/api';
    let products = [];

    // Min delivery date = tomorrow
    document.querySelector('[name="deliveryDate"]').min = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    async function loadProducts() {
      const res = await fetch(`${API}/products?available=true`);
      const data = await res.json();
      products = data.data;
      document.querySelectorAll('[name="productId[]"]').forEach(sel => populateSelect(sel));
    }

    function populateSelect(sel) {
      const current = sel.value;
      sel.innerHTML = '<option value="">Select item...</option>' +
        products.map(p => `<option value="${p._id}" data-price="${p.pricePerKg}" data-name="${p.name}">${p.name} — ₹${p.pricePerKg}/kg</option>`).join('');
      sel.value = current;
    }

    function addItem() {
      const row = document.createElement('div');
      row.className = 'item-row';
      row.innerHTML = `
        <select name="productId[]" required onchange="updatePrice(this)"><option value="">Select item...</option></select>
        <input type="number" name="sizeKg[]" placeholder="Size (kg)" min="0.5" step="0.5" required/>
        <input type="text" name="flavour[]" placeholder="Flavour"/>
        <input type="text" name="customMessage[]" placeholder="Message on cake"/>
        <button type="button" onclick="this.parentElement.remove()">✕</button>
      `;
      document.getElementById('items').appendChild(row);
      populateSelect(row.querySelector('select'));
    }

    async function submitOrder(e) {
      e.preventDefault();
      const btn = document.getElementById('submitBtn');
      btn.disabled = true;
      btn.textContent = 'Processing...';

      const form = e.target;
      const productIds = [...form.querySelectorAll('[name="productId[]"]')].map(el => el.value);
      const sizeKgs = [...form.querySelectorAll('[name="sizeKg[]"]')].map(el => parseFloat(el.value));
      const flavours = [...form.querySelectorAll('[name="flavour[]"]')].map(el => el.value);
      const messages = [...form.querySelectorAll('[name="customMessage[]"]')].map(el => el.value);

      const items = productIds.map((id, idx) => {
        const product = products.find(p => p._id === id);
        return {
          product: id,
          productName: product.name,
          sizeKg: sizeKgs[idx],
          pricePerKg: product.pricePerKg,
          flavour: flavours[idx],
          customMessage: messages[idx],
        };
      });

      const payload = {
        name: form.name.value,
        email: form.email.value,
        phone: form.phone.value,
        address: { street: form.street.value, city: form.city.value, pincode: form.pincode.value },
        deliveryDate: form.deliveryDate.value,
        specialInstructions: form.specialInstructions.value,
        items,
      };

      try {
        const res = await fetch(`${API}/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message);
        openRazorpay(data);
      } catch (err) {
        alert('Error placing order: ' + err.message);
        btn.disabled = false;
        btn.textContent = 'Proceed to Payment →';
      }
    }

    function openRazorpay(data) {
      const options = {
        key: data.razorpayKeyId,
        amount: data.total * 100,
        currency: 'INR',
        name: 'Sweet Bites Bakery',
        description: `Order ${data.orderId}`,
        order_id: data.razorpayOrderId,
        prefill: { name: data.customerName, email: data.customerEmail },
        theme: { color: '#1B2A4A' },
        handler: async (response) => {
          // Payment successful — verify karo backend pe
          const verifyRes = await fetch(`${API}/payments/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              dbOrderId: data.dbOrderId,
            }),
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            window.location.href = `confirmation.html?orderId=${data.orderId}`;
          } else {
            alert('Payment verification failed. Contact support.');
          }
        },
        modal: { ondismiss: () => {
          document.getElementById('submitBtn').disabled = false;
          document.getElementById('submitBtn').textContent = 'Proceed to Payment →';
        }},
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    }

    loadProducts();
  </script>
</body>
</html>
```

---

## `frontend/customer/css/style.css`

```css
/* =============================================
   Sweet Bites Bakery — Customer Frontend CSS
   Color Palette:
     Navy:  #1B2A4A (primary dark)
     Teal:  #0F6E56 (accent/CTA)
     Cream: #FAF8F4 (background)
     Light: #E1F5EE (teal light)
============================================= */

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body { font-family: 'Segoe UI', Arial, sans-serif; background: #FAF8F4; color: #2C2C2A; }

/* --- Navbar --- */
.navbar {
  display: flex; justify-content: space-between; align-items: center;
  background: #1B2A4A; padding: 14px 32px;
}
.brand { color: white; font-size: 22px; font-weight: 700; text-decoration: none; }
.nav-links a { color: #E1F5EE; text-decoration: none; margin-left: 20px; font-size: 15px; }
.btn-nav {
  background: #0F6E56; color: white !important; padding: 8px 18px;
  border-radius: 6px; font-weight: 600;
}

/* --- Hero --- */
.hero {
  min-height: 75vh; display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, #1B2A4A 0%, #0F6E56 100%);
  text-align: center; padding: 40px 20px;
}
.hero-content h1 { font-size: clamp(2rem, 6vw, 3.6rem); color: white; margin-bottom: 16px; }
.hero-content p { font-size: 18px; color: #E1F5EE; margin-bottom: 32px; }

/* --- Buttons --- */
.btn-primary {
  background: #0F6E56; color: white; padding: 14px 32px; border-radius: 8px;
  text-decoration: none; font-size: 16px; font-weight: 600; margin-right: 12px;
  display: inline-block; border: none; cursor: pointer;
}
.btn-primary:hover { background: #0a5a45; }
.btn-secondary {
  background: transparent; color: white; padding: 13px 30px; border-radius: 8px;
  text-decoration: none; font-size: 16px; font-weight: 600; border: 2px solid white;
  display: inline-block; cursor: pointer;
}
.btn-order {
  background: #1B2A4A; color: white; padding: 10px 20px; border-radius: 6px;
  text-decoration: none; font-size: 14px; font-weight: 600; display: inline-block;
}

/* --- Features --- */
.features {
  display: flex; flex-wrap: wrap; justify-content: center; gap: 20px;
  padding: 48px 32px; background: white;
}
.feature-card {
  background: #E1F5EE; border-radius: 12px; padding: 24px 32px;
  font-size: 18px; font-weight: 600; color: #1B2A4A;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

/* --- Menu Page --- */
.menu-page, .order-page { max-width: 1100px; margin: 0 auto; padding: 48px 24px; }
.page-title { font-size: 2rem; color: #1B2A4A; margin-bottom: 24px; }

.filter-bar { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 32px; }
.filter-btn {
  padding: 8px 20px; border-radius: 20px; border: 2px solid #1B2A4A;
  background: white; cursor: pointer; font-weight: 600; color: #1B2A4A;
}
.filter-btn.active { background: #1B2A4A; color: white; }

.product-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px; }
.product-card {
  background: white; border-radius: 12px; overflow: hidden;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
}
.product-img { width: 100%; height: 180px; object-fit: cover; }
.product-img-placeholder {
  width: 100%; height: 180px; background: #E1F5EE;
  display: flex; align-items: center; justify-content: center; font-size: 48px;
}
.product-info { padding: 20px; }
.product-category {
  font-size: 11px; font-weight: 700; text-transform: uppercase;
  color: #0F6E56; letter-spacing: 1px;
}
.product-info h3 { font-size: 18px; color: #1B2A4A; margin: 6px 0; }
.product-info p { color: #666; font-size: 14px; margin-bottom: 6px; }
.price { font-size: 20px; font-weight: 700; color: #0F6E56 !important; }

/* --- Order Form --- */
.order-form fieldset {
  border: 1px solid #d0cec8; border-radius: 10px; padding: 24px; margin-bottom: 24px;
}
.order-form legend { font-weight: 700; color: #1B2A4A; font-size: 16px; padding: 0 8px; }
.order-form label {
  display: block; margin-bottom: 14px; font-size: 14px; font-weight: 600; color: #444;
}
.order-form input, .order-form select, .order-form textarea {
  display: block; width: 100%; margin-top: 4px; padding: 10px 14px;
  border: 1.5px solid #d0cec8; border-radius: 6px; font-size: 14px;
  background: white; transition: border 0.2s;
}
.order-form input:focus, .order-form select:focus {
  outline: none; border-color: #0F6E56;
}
.item-row {
  display: grid; grid-template-columns: 2fr 1fr 1fr 2fr auto;
  gap: 10px; margin-bottom: 12px; align-items: center;
}

/* --- Footer --- */
.footer { text-align: center; padding: 24px; background: #1B2A4A; color: #E1F5EE; font-size: 14px; }
```

---

## `frontend/admin/package.json`

```json
{
  "name": "bakery-admin-panel",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "axios": "^1.6.2"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.0.0"
  }
}
```

---

## `frontend/admin/src/api/axios.js`

```javascript
// axios.js — Preconfigured Axios instance
// Base URL set hai, aur har request ke saath Authorization header
// automatically JWT token ke saath bheja jaata hai (localStorage se).

import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:5000/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('bakery_admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
```

---

## `frontend/admin/src/App.jsx`

```jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Leads from './pages/Leads';
import Menu from './pages/Menu';
import Feedback from './pages/Feedback';
import Login from './pages/Login';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('bakery_admin_token');
  return token ? children : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={
          <PrivateRoute>
            <div style={{ display: 'flex', minHeight: '100vh', background: '#FAF8F4' }}>
              <Navbar />
              <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/leads" element={<Leads />} />
                  <Route path="/menu" element={<Menu />} />
                  <Route path="/feedback" element={<Feedback />} />
                </Routes>
              </main>
            </div>
          </PrivateRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}
```

---

## `frontend/admin/src/pages/Login.jsx`

```jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/admin/login', form);
      localStorage.setItem('bakery_admin_token', res.data.token);
      navigate('/');
    } catch {
      setError('Invalid credentials. Please try again.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1B2A4A' }}>
      <form onSubmit={handleSubmit} style={{ background: 'white', padding: '40px', borderRadius: '12px', width: '360px', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
        <h2 style={{ color: '#1B2A4A', marginBottom: '8px' }}>🎂 Sweet Bites</h2>
        <p style={{ color: '#666', marginBottom: '24px' }}>Admin Panel Login</p>
        {error && <p style={{ color: 'red', marginBottom: '12px' }}>{error}</p>}
        <input type="email" placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
          style={{ display: 'block', width: '100%', padding: '12px', marginBottom: '12px', borderRadius: '6px', border: '1.5px solid #d0cec8', fontSize: '14px' }} required/>
        <input type="password" placeholder="Password" value={form.password} onChange={e => setForm({...form, password: e.target.value})}
          style={{ display: 'block', width: '100%', padding: '12px', marginBottom: '20px', borderRadius: '6px', border: '1.5px solid #d0cec8', fontSize: '14px' }} required/>
        <button type="submit" style={{ width: '100%', padding: '13px', background: '#1B2A4A', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '700', cursor: 'pointer' }}>
          Login →
        </button>
      </form>
    </div>
  );
}
```

---

## `frontend/admin/src/pages/Dashboard.jsx`

```jsx
import { useEffect, useState } from 'react';
import api from '../api/axios';

const StatCard = ({ label, value, color }) => (
  <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', borderTop: `4px solid ${color}` }}>
    <p style={{ color: '#888', fontSize: '13px', marginBottom: '6px' }}>{label}</p>
    <h2 style={{ color, fontSize: '32px', fontWeight: '800' }}>{value}</h2>
  </div>
);

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => { api.get('/admin/stats').then(r => setStats(r.data.data)); }, []);
  if (!stats) return <p>Loading...</p>;

  return (
    <div>
      <h1 style={{ color: '#1B2A4A', marginBottom: '24px' }}>Dashboard</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <StatCard label="Total Orders" value={stats.totalOrders} color="#1B2A4A" />
        <StatCard label="Revenue (₹)" value={`₹${stats.totalRevenue.toLocaleString()}`} color="#0F6E56" />
        <StatCard label="Total Leads" value={stats.totalLeads} color="#E8A020" />
        <StatCard label="Customers" value={stats.totalCustomers} color="#9B59B6" />
      </div>

      <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
        <h3 style={{ color: '#1B2A4A', marginBottom: '16px' }}>Recent Orders</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead>
            <tr style={{ background: '#F1EFE8' }}>
              {['Order ID', 'Customer', 'Total', 'Status'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: '#1B2A4A' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {stats.recentOrders.map(o => (
              <tr key={o._id} style={{ borderBottom: '1px solid #f0eee8' }}>
                <td style={{ padding: '10px 14px', fontWeight: '600' }}>{o.orderId}</td>
                <td style={{ padding: '10px 14px' }}>{o.customer?.name}</td>
                <td style={{ padding: '10px 14px', color: '#0F6E56', fontWeight: '700' }}>₹{o.total}</td>
                <td style={{ padding: '10px 14px' }}>
                  <span style={{ background: '#E1F5EE', color: '#0F6E56', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
                    {o.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

---

## `frontend/admin/src/pages/Orders.jsx`

```jsx
import { useEffect, useState } from 'react';
import api from '../api/axios';

const STATUS_COLORS = {
  pending_payment: '#E8A020',
  confirmed: '#2980B9',
  processing: '#8E44AD',
  dispatched: '#16A085',
  delivered: '#0F6E56',
  cancelled: '#E74C3C',
};

export default function Orders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => { api.get('/orders').then(r => setOrders(r.data.data)); }, []);

  const updateStatus = async (id, status) => {
    await api.put(`/orders/${id}/status`, { status });
    setOrders(prev => prev.map(o => o._id === id ? { ...o, status } : o));
  };

  return (
    <div>
      <h1 style={{ color: '#1B2A4A', marginBottom: '24px' }}>All Orders ({orders.length})</h1>
      <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead>
            <tr style={{ background: '#1B2A4A', color: 'white' }}>
              {['Order ID', 'Customer', 'Items', 'Total', 'Delivery Date', 'Payment', 'Status', 'Update Status'].map(h => (
                <th key={h} style={{ padding: '12px 14px', textAlign: 'left' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.map((o, idx) => (
              <tr key={o._id} style={{ background: idx % 2 === 0 ? 'white' : '#F1EFE8', borderBottom: '1px solid #f0eee8' }}>
                <td style={{ padding: '10px 14px', fontWeight: '700', color: '#1B2A4A' }}>{o.orderId}</td>
                <td style={{ padding: '10px 14px' }}>
                  <strong>{o.customer?.name}</strong><br/>
                  <small style={{ color: '#888' }}>{o.customer?.phone}</small>
                </td>
                <td style={{ padding: '10px 14px', color: '#555', fontSize: '13px' }}>
                  {o.items.map(i => `${i.productName} (${i.sizeKg}kg)`).join(', ')}
                </td>
                <td style={{ padding: '10px 14px', fontWeight: '700', color: '#0F6E56' }}>₹{o.total}</td>
                <td style={{ padding: '10px 14px' }}>{new Date(o.deliveryDate).toLocaleDateString('en-IN')}</td>
                <td style={{ padding: '10px 14px' }}>
                  <span style={{ color: o.payment.status === 'paid' ? '#0F6E56' : '#E8A020', fontWeight: '600' }}>
                    {o.payment.status}
                  </span>
                </td>
                <td style={{ padding: '10px 14px' }}>
                  <span style={{ background: STATUS_COLORS[o.status] + '22', color: STATUS_COLORS[o.status], padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
                    {o.status}
                  </span>
                </td>
                <td style={{ padding: '10px 14px' }}>
                  <select value={o.status} onChange={e => updateStatus(o._id, e.target.value)}
                    style={{ padding: '6px', borderRadius: '6px', border: '1.5px solid #d0cec8', fontSize: '13px' }}>
                    {['pending_payment','confirmed','processing','dispatched','delivered','cancelled'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

---

## `frontend/admin/src/components/Navbar.jsx`

```jsx
import { NavLink, useNavigate } from 'react-router-dom';

const links = [
  { to: '/', label: '📊 Dashboard' },
  { to: '/orders', label: '📦 Orders' },
  { to: '/leads', label: '👥 Leads (CRM)' },
  { to: '/menu', label: '🎂 Menu' },
  { to: '/feedback', label: '⭐ Feedback' },
];

export default function Navbar() {
  const navigate = useNavigate();
  const logout = () => { localStorage.removeItem('bakery_admin_token'); navigate('/login'); };

  return (
    <nav style={{ width: '220px', background: '#1B2A4A', minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '28px 16px' }}>
      <h2 style={{ color: 'white', fontSize: '18px', fontWeight: '800', marginBottom: '32px', paddingLeft: '8px' }}>🎂 Sweet Bites<br/><span style={{ fontSize: '11px', color: '#E1F5EE', fontWeight: '400' }}>Admin Panel</span></h2>
      {links.map(l => (
        <NavLink key={l.to} to={l.to} end={l.to === '/'}
          style={({ isActive }) => ({
            display: 'block', padding: '11px 14px', borderRadius: '8px', textDecoration: 'none',
            color: isActive ? 'white' : '#B0C4DE', fontWeight: isActive ? '700' : '400',
            background: isActive ? 'rgba(255,255,255,0.12)' : 'transparent', marginBottom: '4px', fontSize: '14px',
          })}>
          {l.label}
        </NavLink>
      ))}
      <button onClick={logout} style={{ marginTop: 'auto', background: 'transparent', border: '1px solid #B0C4DE', color: '#B0C4DE', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>
        Logout →
      </button>
    </nav>
  );
}
```

---

## How to Run — Step by Step

### 1. Project setup

```bash
# Backend
cd bakery-automation/backend
npm install
cp .env.example .env
# .env mein apni values bharo (MongoDB URI, Gmail, Razorpay)
npm run dev   # Server starts on http://localhost:5000

# Customer Frontend (just open in browser)
# Open: frontend/customer/index.html in Chrome/Firefox

# Admin Panel
cd ../frontend/admin
npm install
npm run dev   # Opens http://localhost:3000
```

### 2. MongoDB setup options

**Option A — Free Cloud (Recommended):** [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas) → Free M0 cluster → Connection string `.env` mein daalo.

**Option B — Local:** `mongodb://localhost:27017/bakery` (MongoDB Community Server install karo).

### 3. Gmail App Password

Gmail → Manage Account → Security → 2-Step Verification (ON karo) → App Passwords → "Mail" → Generate → 16-char code `.env` mein `EMAIL_PASS` mein daalo.

### 4. Razorpay Test Credentials

[dashboard.razorpay.com](https://dashboard.razorpay.com) → Sign up → Settings → API Keys → Test mode key copy karo.

Test card: `4111 1111 1111 1111`, any future date, any CVV.

---

## Complete Automation Flow Summary

```
Customer lands on website
        ↓
Browses Menu (GET /api/products)
        ↓
Fills Order Form (POST /api/orders)
        ↓ [Backend creates Customer + Lead + Order]
Razorpay Payment Popup opens
        ↓
Customer pays (card/UPI/netbanking)
        ↓
Frontend calls POST /api/payments/verify
        ↓ [Backend verifies Razorpay signature → crypto.createHmac]
Order status → "confirmed"
Customer stats updated (totalOrders, totalSpent)
PDF Invoice generated (PDFKit)
Order Confirmation + Invoice → Email to customer (Nodemailer)
New Order Alert → Email to admin
Lead status → "order_placed"
        ↓
Admin changes status to "dispatched" (Admin Panel)
        ↓
Admin marks "delivered"
        ↓
[CRON JOB — runs every hour]
Detects "delivered" orders where feedbackRequested = false
Sends Feedback Request Email to customer
feedbackRequested → true
        ↓
Customer clicks link → fills feedback form
Feedback stored in DB (rating, comment)
Admin sees it in Feedback tab
```

---

## Resume Mein Kaise Likho

**Project Title:** End-to-End Bakery Order Automation System

**Description:** Built a full-stack automation platform for bakery businesses using Node.js, Express, MongoDB, and Razorpay. The system automates the complete order lifecycle — from customer browsing the menu to payment processing, PDF invoice generation, email delivery, and post-order feedback collection — eliminating manual work at every step. Includes a React admin dashboard for real-time order tracking and CRM lead management.

**Tech Stack:** Node.js · Express · MongoDB (Mongoose) · Razorpay API · Nodemailer · PDFKit · node-cron · React · JWT Authentication · REST APIs

**Key Features Delivered:**
- Razorpay webhook signature verification for secure payment processing
- Auto-generated PDF invoices emailed to customers on order confirmation
- Admin notified instantly on every new order
- CRM lead funnel tracking (New → Order Placed)
- Automated feedback email triggered 1 hour post-delivery via cron job
- Rate limiting and JWT-protected admin routes
