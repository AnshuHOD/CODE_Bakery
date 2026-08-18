// email.js — Nodemailer transporter setup
// Gmail SMTP use kar raha hai. App Password required hai, normal Gmail
// password kaam nahi karta (security reason se).

const nodemailer = require('nodemailer');

const emailUser = process.env.EMAIL_USER || 'anshuh027@gmail.com';
const rawPass = process.env.EMAIL_PASS || 'tkublahmfelgcsyf';
const emailPass = rawPass.replace(/\s+/g, '');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: emailUser,
    pass: emailPass,
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Verify setup on server start
transporter.verify((error) => {
  if (error) console.error('❌ Email setup error:', error.message);
  else console.log(`✅ Email service ready (${emailUser} via smtp.gmail.com:465)`);
});

module.exports = transporter;
