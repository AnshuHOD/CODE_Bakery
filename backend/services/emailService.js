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
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
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
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
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
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
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
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
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

const sendChatbotLeadAdminEmail = async (lead) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log(`[SIMULATED EMAIL TO ADMIN] Subject: New Chatbot Lead: ${lead.name}`);
    console.log(`Details:`, JSON.stringify(lead, null, 2));
    return;
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: `🆕 New Chatbot Lead: ${lead.name} — Hooda's Bakery`,
      html: `
        <h2>New Chatbot Lead Alert!</h2>
        <p>A customer has booked an order via the website chat. Please review and contact them to finalize payment:</p>
        <div style="background: #F5EBE6; padding: 16px; border-radius: 8px; border: 1px solid #D97766;">
          <p><strong>Customer Name:</strong> ${lead.name}</p>
          <p><strong>Phone Number:</strong> ${lead.phone}</p>
          <p><strong>Email Address:</strong> ${lead.email}</p>
          <p><strong>Order Items/Details:</strong> ${lead.items || lead.interestedIn}</p>
          <p><strong>Delivery/Pickup Address:</strong> ${lead.address || "Not provided"}</p>
          <p><strong>Preferred Time slot:</strong> ${lead.timeSlot || "Not provided"}</p>
        </div>
        <p><a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/leads" style="display:inline-block; background:#3E2723; color:white; padding:10px 20px; border-radius:4px; text-decoration:none;">View in CRM / Admin Panel →</a></p>
      `
    });
    console.log(`✅ Chatbot Lead email sent to Admin`);
  } catch (err) {
    console.error("❌ Failed to send chatbot lead email to admin:", err.message);
  }
};

const sendChatbotLeadCustomerEmail = async (lead) => {
  const nameParam = encodeURIComponent(lead.name || 'Valued Customer');
  const emailParam = encodeURIComponent(lead.email || '');
  const phoneParam = encodeURIComponent(lead.phone || '');
  const addressParam = encodeURIComponent(lead.address || '');
  const timeSlotParam = encodeURIComponent(lead.timeSlot || '');
  const itemsParam = encodeURIComponent(lead.items || lead.interestedIn || '');

  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const paymentUrl = `${baseUrl}/order.html?name=${nameParam}&email=${emailParam}&phone=${phoneParam}&address=${addressParam}&timeSlot=${timeSlotParam}&items=${itemsParam}`;

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log(`[SIMULATED EMAIL TO CUSTOMER] Subject: Order Request Received — Hooda's Bakery`);
    console.log(`Payment Link: ${paymentUrl}`);
    console.log(`Details:`, JSON.stringify(lead, null, 2));
    return;
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: lead.email,
      subject: `🎂 Order Request Received! — Hooda's Bakery`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
          <div style="background: #3E2723; padding: 24px; text-align: center;">
            <h1 style="color: white; margin: 0;">Hooda's Bakery 🎂</h1>
            <p style="color: #E1F5EE; margin: 4px 0;">We received your booking details!</p>
          </div>
          <div style="padding: 24px;">
            <p>Hi <strong>${lead.name}</strong>,</p>
            <p>Thank you for choosing Hooda's Bakery! We have received your order request via website chat. Here are the details of your requested order:</p>
            
            <h3 style="color: #3E2723; border-bottom: 1px solid #eee; padding-bottom: 6px;">Your Booking Summary:</h3>
            <p><strong>Order Items:</strong> ${lead.items || lead.interestedIn}</p>
            <p><strong>Delivery Address:</strong> ${lead.address || "Not provided"}</p>
            <p><strong>Time Slot:</strong> ${lead.timeSlot || "Not provided"}</p>
            
            <div style="background: #FAF6F0; padding: 20px; border-radius: 12px; border: 1px solid #EFE7DE; text-align: center; margin: 24px 0;">
              <p style="margin-top: 0; font-weight: bold; color: #3E2723;">If the details above are correct, please click the button below to finalize your payment and place your order:</p>
              <a href="${paymentUrl}" style="display: inline-block; background: #D97B66; color: white; padding: 12px 28px; border-radius: 50px; text-decoration: none; font-weight: bold; font-family: sans-serif; box-shadow: 0 4px 15px rgba(217,123,102,0.3); margin-top: 10px;">Pay & Confirm Order →</a>
            </div>

            <p style="background: #FFF9C4; padding: 12px; border-radius: 6px; font-size: 13px; color: #5D4037;">
              <strong>Note:</strong> If you spot any mistakes in your delivery details, you can manually correct them on the checkout page before making the payment.
            </p>
            
            <p>We are excited to bake for you!</p>
            <p>With love,<br><strong>Hooda's Bakery Team</strong> 🎂</p>
          </div>
        </div>
      `
    });
    console.log(`✅ Chatbot Lead email sent to Customer: ${lead.email}`);
  } catch (err) {
    console.error("❌ Failed to send chatbot lead email to customer:", err.message);
  }
};

const sendWhatsAppLeadAdminEmail = async (lead) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log(`[SIMULATED EMAIL TO ADMIN] Subject: New WhatsApp Inquiry Lead: ${lead.phone}`);
    return;
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: `💬 WhatsApp Inquiry Lead Alert — Hooda's Bakery`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; border: 1px solid #eee; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
          <div style="background: #075E54; color: white; padding: 24px; text-align: center;">
            <h2 style="margin: 0; font-size: 22px;">🆕 New WhatsApp Lead!</h2>
          </div>
          <div style="padding: 24px; color: #333;">
            <p>Hello Admin,</p>
            <p>A visitor has clicked the <strong>WhatsApp Connect</strong> button on the Hooda's Bakery website to enquire or place an order.</p>
            <div style="background: #E8F8F5; padding: 16px; border-radius: 8px; border: 1px solid #128C7E; margin: 20px 0;">
              <p style="margin: 4px 0;"><strong>Customer Phone:</strong> ${lead.phone || "Visitor on website"}</p>
              <p style="margin: 4px 0;"><strong>Source Channel:</strong> WhatsApp Button Link</p>
              <p style="margin: 4px 0;"><strong>Interested in:</strong> Bakery Inquiry</p>
              <p style="margin: 4px 0;"><strong>Timestamp:</strong> ${new Date(lead.createdAt || Date.now()).toLocaleString()}</p>
            </div>
            <p>Please log in to the admin dashboard to follow up on this lead.</p>
            <p style="text-align: center; margin-top: 30px;">
              <a href="${process.env.ADMIN_URL || 'http://localhost:3001'}/leads" style="display: inline-block; background: #075E54; color: white; padding: 12px 24px; border-radius: 50px; text-decoration: none; font-weight: bold;">Open CRM / Lead Dashboard →</a>
            </p>
          </div>
        </div>
      `
    });
    console.log(`✅ WhatsApp Lead email sent to Admin`);
  } catch (err) {
    console.error("❌ Failed to send WhatsApp lead email to admin:", err.message);
  }
};

const sendManualCheckoutLeadAdminEmail = async (lead, order) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log(`[SIMULATED EMAIL TO ADMIN] Subject: New Website Lead: ${lead.name}`);
    return;
  }
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: `🆕 New Website Lead Alert: ${lead.name} — Hooda's Bakery`,
      html: `
        <h2>New Website Checkout Lead!</h2>
        <p>A customer has initiated a checkout on the website. Here are their details:</p>
        <div style="background: #F5EBE6; padding: 16px; border-radius: 8px; border: 1px solid #D97766;">
          <p><strong>Customer Name:</strong> ${lead.name}</p>
          <p><strong>Phone Number:</strong> ${lead.phone}</p>
          <p><strong>Email Address:</strong> ${lead.email}</p>
          <p><strong>Order Items:</strong> ${lead.interestedIn}</p>
          <p><strong>Delivery Address:</strong> ${lead.address || "Not provided"}</p>
          <p><strong>Payment Status:</strong> Pending</p>
        </div>
        <p><a href="${process.env.ADMIN_URL || 'https://hoodas-bakery-admin.vercel.app'}/leads" style="display:inline-block; background:#3E2723; color:white; padding:10px 20px; border-radius:4px; text-decoration:none;">View in CRM / Admin Panel →</a></p>
      `
    });
    console.log(`✅ Website Lead email sent to Admin`);
  } catch (err) {
    console.error("❌ Failed to send website lead email to admin:", err.message);
  }
};

const sendManualCheckoutLeadCustomerEmail = async (lead, order) => {
  const nameParam = encodeURIComponent(lead.name || 'Valued Customer');
  const emailParam = encodeURIComponent(lead.email || '');
  const phoneParam = encodeURIComponent(lead.phone || '');
  const addressParam = encodeURIComponent(lead.address || '');
  const itemsParam = encodeURIComponent(lead.interestedIn || '');

  const baseUrl = process.env.FRONTEND_URL || 'https://hoodas-bakery.vercel.app';
  const paymentUrl = `${baseUrl}/order.html?name=${nameParam}&email=${emailParam}&phone=${phoneParam}&address=${addressParam}&items=${itemsParam}`;

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log(`[SIMULATED EMAIL TO CUSTOMER] Subject: Website Lead Received`);
    return;
  }
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: lead.email,
      subject: `🎂 Order Inquiry Received! — Hooda's Bakery`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
          <div style="background: #3E2723; padding: 24px; text-align: center;">
            <h1 style="color: white; margin: 0;">Hooda's Bakery 🎂</h1>
            <p style="color: #E1F5EE; margin: 4px 0;">We received your order inquiry!</p>
          </div>
          <div style="padding: 24px;">
            <p>Hi <strong>${lead.name}</strong>,</p>
            <p>Thank you for choosing Hooda's Bakery! We have received your order checkout inquiry. Here is the summary of your selected items:</p>
            
            <h3 style="color: #3E2723; border-bottom: 1px solid #eee; padding-bottom: 6px;">Your Order Summary:</h3>
            <p><strong>Order Items:</strong> ${lead.interestedIn}</p>
            <p><strong>Delivery Address:</strong> ${lead.address || "Not provided"}</p>
            
            <div style="background: #FAF6F0; padding: 20px; border-radius: 12px; border: 1px solid #EFE7DE; text-align: center; margin: 24px 0;">
              <p style="margin-top: 0; font-weight: bold; color: #3E2723;">To complete your order and process the payment, click the button below:</p>
              <a href="${paymentUrl}" style="display: inline-block; background: #D97B66; color: white; padding: 12px 28px; border-radius: 50px; text-decoration: none; font-weight: bold; font-family: sans-serif; box-shadow: 0 4px 15px rgba(217,123,102,0.3); margin-top: 10px;">Complete Payment & Confirm Order →</a>
            </div>
            
            <p>We are excited to bake for you!</p>
            <p>With love,<br><strong>Hooda's Bakery Team</strong> 🎂</p>
          </div>
        </div>
      `
    });
    console.log(`✅ Website Lead email sent to Customer: ${lead.email}`);
  } catch (err) {
    console.error("❌ Failed to send website lead email to customer:", err.message);
  }
};

module.exports = {
  sendOrderConfirmationEmail,
  sendAdminNotificationEmail,
  sendFeedbackRequestEmail,
  sendPaymentFailedEmail,
  sendChatbotLeadAdminEmail,
  sendChatbotLeadCustomerEmail,
  sendWhatsAppLeadAdminEmail,
  sendManualCheckoutLeadAdminEmail,
  sendManualCheckoutLeadCustomerEmail
};
