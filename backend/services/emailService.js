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
    subject: `🎂 Order Confirmed! ${order.orderId} — Hooda's Bakery`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <div style="background: #1B2A4A; padding: 24px; text-align: center;">
          <h1 style="color: white; margin: 0;">Hooda's Bakery 🎂</h1>
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
          <p>With love,<br><strong>Hooda's Bakery Team</strong> 🎂</p>
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
  const feedbackUrl = `${process.env.FRONTEND_URL}/feedback.html?orderId=${order._id}`;
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: order.customer.email,
    subject: `How was your order from Hooda's Bakery? 🌟 — ${order.orderId}`,
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
      <p>Hooda's Bakery Team</p>
    `,
  });
};

module.exports = {
  sendOrderConfirmationEmail,
  sendAdminNotificationEmail,
  sendFeedbackRequestEmail,
  sendPaymentFailedEmail,
};
