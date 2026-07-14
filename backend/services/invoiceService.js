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

    // --- Header Section ---
    // Left: Brand Details
    doc.fillColor('#3D2620').fontSize(26).font('Helvetica-Bold').text("Hooda's Bakery", 50, 50);
    doc.fillColor('#D97B66').fontSize(9).font('Helvetica-Oblique').text('Delivering Happiness, One Slice at a Time 🎂', 50, 80);
    
    doc.fillColor('#4A3530').fontSize(8.5).font('Helvetica')
      .text('Near MDU Main Gate, Rohtak, Haryana - 124001', 50, 98)
      .text('Phone: +91 8168567308 | Email: order@hoodasbakery.com', 50, 110)
      .text('Website: www.hoodasbakery.com', 50, 122);
    
    // Right: Bakery Exterior Photo
    const logoPath = path.join(__dirname, '../../frontend/customer/images/bakery_exterior.png');
    if (fs.existsSync(logoPath)) {
      try {
        doc.image(logoPath, 380, 50, { width: 165, height: 95 });
        doc.strokeColor('#3D2620').lineWidth(1.5).rect(380, 50, 165, 95).stroke();
      } catch (imgErr) {
        console.error("Failed to render logo in invoice PDF:", imgErr.message);
      }
    } else {
      // Fallback empty decorative block
      doc.fillColor('#FCEEEB').rect(380, 50, 165, 95).fill();
      doc.strokeColor('#D97B66').lineWidth(1).rect(380, 50, 165, 95).stroke();
      doc.fillColor('#D97B66').fontSize(12).font('Helvetica-Bold').text("Hooda's Bakery", 380, 85, { width: 165, align: 'center' });
    }

    // Divider Line
    doc.strokeColor('#EFE7DE').lineWidth(1).moveTo(50, 160).lineTo(545, 160).stroke();

    // --- Side-by-Side Metadata Columns ---
    // Left column: Bill To
    doc.fillColor('#3D2620').fontSize(10).font('Helvetica-Bold').text('BILL TO:', 50, 175);
    doc.font('Helvetica').fillColor('#4A3530').fontSize(9)
      .text(order.customer.name, 50, 190, { width: 230 })
      .text(order.customer.email, 50, 203, { width: 230 })
      .text(order.customer.phone, 50, 216, { width: 230 });

    // Right column: Delivery Details
    doc.fillColor('#3D2620').fontSize(10).font('Helvetica-Bold').text('ORDER DETAILS:', 300, 175);
    doc.font('Helvetica').fillColor('#4A3530').fontSize(9)
      .text(`Invoice No: ${order.orderId}`, 300, 190, { width: 245 })
      .text(`Order Date: ${new Date(order.createdAt).toLocaleDateString('en-IN')}`, 300, 203, { width: 245 })
      .text(`Address: ${order.deliveryAddress.street}, ${order.deliveryAddress.city} - ${order.deliveryAddress.pincode}`, 300, 216, { width: 245 })
      .text(`Delivery Date: ${new Date(order.deliveryDate).toLocaleDateString('en-IN', { dateStyle: 'long' })}`, 300, 242, { width: 245 });

    // --- Items Table ---
    const tableTop = 275;

    // Table header background
    doc.fillColor('#3D2620').rect(50, tableTop, 495, 22).fill();
    doc.fillColor('white').fontSize(9).font('Helvetica-Bold')
      .text('Item Name', 55, tableTop + 6)
      .text('Flavour', 200, tableTop + 6)
      .text('Qty / Size', 290, tableTop + 6)
      .text('Rate', 380, tableTop + 6)
      .text('Amount', 470, tableTop + 6);

    // Table rows
    let rowY = tableTop + 28;
    order.items.forEach((item, idx) => {
      const bg = idx % 2 === 0 ? '#FAF6F0' : '#FFFFFF';
      doc.fillColor(bg).rect(50, rowY - 4, 495, 20).fill();
      
      // Draw subtle row separator
      doc.strokeColor('#EFE7DE').lineWidth(0.5).moveTo(50, rowY + 16).lineTo(545, rowY + 16).stroke();
      
      const isCake = item.category === 'cake' || (item.product && item.product.category === 'cake');
      const qtyText = isCake ? `${item.sizeKg} kg` : `${item.sizeKg} pc`;
      const rateText = isCake ? `Rs. ${item.pricePerKg}/kg` : `Rs. ${item.pricePerKg}/pc`;
      const amountText = `Rs. ${item.subtotal}`;

      doc.fillColor('#4A3530').font('Helvetica').fontSize(9)
        .text(item.productName, 55, rowY, { width: 140, height: 15, ellipsis: true })
        .text(item.flavour || '-', 200, rowY, { width: 85, height: 15, ellipsis: true })
        .text(qtyText, 290, rowY)
        .text(rateText, 380, rowY)
        .text(amountText, 470, rowY);
      rowY += 22;
    });

    // Total Amount Box
    rowY += 10;
    doc.fillColor('#FAF6F0').rect(350, rowY, 195, 30).fill();
    doc.strokeColor('#3D2620').lineWidth(1).rect(350, rowY, 195, 30).stroke();
    doc.fillColor('#3D2620').fontSize(11).font('Helvetica-Bold')
      .text('Total Amount:', 360, rowY + 9)
      .text(`Rs. ${order.total}`, 465, rowY + 9);
    rowY += 45;

    // Payment Block
    doc.fillColor('#FCEEEB').rect(50, rowY, 495, 45).fill();
    doc.strokeColor('#D97B66').lineWidth(0.5).rect(50, rowY, 495, 45).stroke();
    doc.fillColor('#D97B66').fontSize(10).font('Helvetica-Bold')
      .text(`✅ Payment Status: PAID`, 60, rowY + 8);
    doc.font('Helvetica').fontSize(8.5).fillColor('#4A3530')
      .text(`Transaction Reference: ${order.payment.razorpayPaymentId} | Paid on: ${new Date(order.payment.paidAt).toLocaleString('en-IN')}`, 60, rowY + 24);

    // Special Instructions
    if (order.specialInstructions) {
      rowY += 60;
      doc.fillColor('#3D2620').font('Helvetica-Bold').fontSize(10).text('Special Instructions:', 50, rowY);
      doc.font('Helvetica').fillColor('#4A3530').fontSize(9).text(order.specialInstructions, 50, rowY + 15, { width: 495 });
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
