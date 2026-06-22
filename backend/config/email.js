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
