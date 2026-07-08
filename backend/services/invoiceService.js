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

    // --- Premium Brand Banner ---
    doc.rect(0, 0, 595, 80).fill('#3E2723');
    doc.fillColor('#FFFFFF').fontSize(24).font('Helvetica-Bold').text("Hooda's Bakery", 50, 20);
    doc.fontSize(9).fillColor('#EFEBE9').font('Helvetica-Oblique').text('Delivering Happiness, One Slice at a Time 🎂', 50, 52);
    
    doc.fillColor('#FFFFFF').fontSize(20).font('Helvetica-Bold').text('INVOICE', 300, 26, { width: 245, align: 'right' });

    // --- Side-by-Side Metadata Columns ---
    // Left column: Bill To
    doc.fillColor('#3E2723').fontSize(11).font('Helvetica-Bold').text('BILL TO:', 50, 105);
    doc.font('Helvetica').fillColor('#333').fontSize(9)
      .text(order.customer.name, 50, 120, { width: 230 })
      .text(order.customer.email, 50, 133, { width: 230 })
      .text(order.customer.phone, 50, 146, { width: 230 });

    // Right column: Delivery Details
    doc.fillColor('#3E2723').fontSize(11).font('Helvetica-Bold').text('DELIVERY DETAILS:', 300, 105);
    doc.font('Helvetica').fillColor('#333').fontSize(9)
      .text(`Invoice No: ${order.orderId}`, 300, 120, { width: 245 })
      .text(`Order Date: ${new Date(order.createdAt).toLocaleDateString('en-IN')}`, 300, 133, { width: 245 })
      .text(`Address: ${order.deliveryAddress.street}, ${order.deliveryAddress.city} - ${order.deliveryAddress.pincode}`, 300, 146, { width: 245 })
      .text(`Delivery Date: ${new Date(order.deliveryDate).toLocaleDateString('en-IN', { dateStyle: 'long' })}`, 300, 172, { width: 245 });

    // --- Items Table ---
    const tableTop = 210;

    // Table header background
    doc.fillColor('#3E2723').rect(50, tableTop, 495, 22).fill();
    doc.fillColor('white').fontSize(9).font('Helvetica-Bold')
      .text('Item Name', 55, tableTop + 6)
      .text('Flavour', 200, tableTop + 6)
      .text('Qty / Size', 290, tableTop + 6)
      .text('Rate', 380, tableTop + 6)
      .text('Amount', 470, tableTop + 6);

    // Table rows
    let rowY = tableTop + 28;
    order.items.forEach((item, idx) => {
      const bg = idx % 2 === 0 ? '#FDFBF7' : '#FFFFFF';
      doc.fillColor(bg).rect(50, rowY - 4, 495, 20).fill();
      
      // Draw subtle row separator
      doc.strokeColor('#E0DCD5').lineWidth(0.5).moveTo(50, rowY + 16).lineTo(545, rowY + 16).stroke();
      
      const isCake = item.product && item.product.category === 'cake';
      const qtyText = isCake ? `${item.sizeKg} kg` : `${item.sizeKg} pc`;
      const rateText = isCake ? `Rs. ${item.pricePerKg}/kg` : `Rs. ${item.pricePerKg}/pc`;
      const amountText = `Rs. ${item.subtotal}`;

      doc.fillColor('#333').font('Helvetica').fontSize(9)
        .text(item.productName, 55, rowY, { width: 140, height: 15, ellipsis: true })
        .text(item.flavour || '-', 200, rowY, { width: 85, height: 15, ellipsis: true })
        .text(qtyText, 290, rowY)
        .text(rateText, 380, rowY)
        .text(amountText, 470, rowY);
      rowY += 22;
    });

    // Total Amount Box
    rowY += 10;
    doc.fillColor('#FDFBF7').rect(350, rowY, 195, 30).fill();
    doc.strokeColor('#3E2723').lineWidth(1).rect(350, rowY, 195, 30).stroke();
    doc.fillColor('#3E2723').fontSize(11).font('Helvetica-Bold')
      .text('Total Amount:', 360, rowY + 9)
      .text(`Rs. ${order.total}`, 465, rowY + 9);
    rowY += 45;

    // Payment Block
    doc.fillColor('#E1F5EE').rect(50, rowY, 495, 45).fill();
    doc.strokeColor('#2ECC71').lineWidth(0.5).rect(50, rowY, 495, 45).stroke();
    doc.fillColor('#0F6E56').fontSize(10).font('Helvetica-Bold')
      .text(`✅ Payment Status: PAID`, 60, rowY + 8);
    doc.font('Helvetica').fontSize(8.5).fillColor('#555')
      .text(`Transaction Reference: ${order.payment.razorpayPaymentId} | Paid on: ${new Date(order.payment.paidAt).toLocaleString('en-IN')}`, 60, rowY + 24);

    // Special Instructions
    if (order.specialInstructions) {
      rowY += 60;
      doc.fillColor('#3E2723').font('Helvetica-Bold').fontSize(10).text('Special Instructions:', 50, rowY);
      doc.font('Helvetica').fillColor('#555').fontSize(9).text(order.specialInstructions, 50, rowY + 15, { width: 495 });
    }

    // Centered Footer
    doc.fontSize(8.5).fillColor('#999')
      .text("Thank you for choosing Hooda's Bakery! 🎂", 50, 755, { align: 'center' })
      .text('This is a computer-generated invoice and requires no signature.', { align: 'center' });

    doc.end();
    writeStream.on('finish', () => resolve(filePath));
    writeStream.on('error', reject);
  });
};

module.exports = { generateInvoice };
