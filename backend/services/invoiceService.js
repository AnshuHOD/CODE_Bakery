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
    doc.fillColor('#1B2A4A').fontSize(24).font('Helvetica-Bold').text("Hooda's Bakery", 50, 50);
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
      .text("Thank you for choosing Hooda's Bakery! 🎂", 50, 760, { align: 'center' })
      .text('Contact: yourbakery@gmail.com | This is a computer-generated invoice.', { align: 'center' });

    doc.end();
    writeStream.on('finish', () => resolve(filePath));
    writeStream.on('error', reject);
  });
};

module.exports = { generateInvoice };
