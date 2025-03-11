import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

interface InvoiceData {
    invoiceNumber: string;
    invoiceDate: string;
    customerName: string;
    customerAddress: string;
    companyName: string;
    companyAddress: string;
    logoPath: string;
    items: { description: string; quantity: number; price: number }[];
}

function generateInvoice(data: InvoiceData, outputPath: string) {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    // Header
    const headerY = 50;
    const pageWidth = doc.page.width;
    const logoWidth = 100;
    const logoHeight = 50;
    const headerTextX = 50;
    const logoX = pageWidth - logoWidth - 50;

    // Company Logo
    if (data.logoPath) {
        try {
            doc.image(data.logoPath, logoX, headerY, { width: logoWidth, height: logoHeight });
        } catch (e) {
            console.error("error loading logo", e);
        }
    }

    // Invoice Details
    doc
        .fontSize(12)
        .text(`Invoice #${data.invoiceNumber}`, headerTextX, headerY)
        .text(`Date: ${data.invoiceDate}`, headerTextX, headerY + 20)
        .text(`Customer: ${data.customerName}`, headerTextX, headerY + 40);

    // Customer Address
    doc
        .fontSize(10)
        .text(data.customerAddress, headerTextX, headerY + 60);

    // Company Address
    doc
        .fontSize(10)
        .text(data.companyName, headerTextX, headerY + 80)
        .text(data.companyAddress, headerTextX, headerY + 95);

    // Table Header
    const tableTop = 150;
    const tableLeft = 50;
    const itemWidth = 200;
    const quantityWidth = 80;
    const priceWidth = 80;
    const totalWidth = 80;

    doc
        .fontSize(10)
        .text('Description', tableLeft, tableTop)
        .text('Quantity', tableLeft + itemWidth, tableTop)
        .text('Price', tableLeft + itemWidth + quantityWidth, tableTop)
        .text('Total', tableLeft + itemWidth + quantityWidth + priceWidth, tableTop);

    // Table Rows
    let rowY = tableTop + 20;
    let totalAmount = 0;

    data.items.forEach((item) => {
        const itemTotal = item.quantity * item.price;
        totalAmount += itemTotal;

        doc
            .text(item.description, tableLeft, rowY)
            .text(item.quantity.toString(), tableLeft + itemWidth, rowY)
            .text(`$${item.price.toFixed(2)}`, tableLeft + itemWidth + quantityWidth, rowY)
            .text(`$${itemTotal.toFixed(2)}`, tableLeft + itemWidth + quantityWidth + priceWidth, rowY);

        rowY += 20;
    });

    // Total
    doc
        .fontSize(12)
        .text(`Total: $${totalAmount.toFixed(2)}`, tableLeft + itemWidth + quantityWidth, rowY + 20);

    // Footer
    const footerY = doc.page.height - 50;
    doc
        .fontSize(10)
        .text('Thank you for your business!', 50, footerY, { align: 'center', width: doc.page.width - 100 });

    doc.end();

    stream.on('finish', () => {
        console.log(`Invoice generated: ${outputPath}`);
    });
}

// Example Usage
const invoiceData: InvoiceData = {
    invoiceNumber: 'INV-001',
    invoiceDate: '2023-10-27',
    customerName: 'John Doe',
    customerAddress: '123 Main St, Anytown',
    companyName: 'My Company',
    companyAddress: '456 Business Ave, Anytown',
    logoPath: path.join(__dirname, 'logo.png'), //replace with your logo path.
    items: [
        { description: 'Product A', quantity: 2, price: 10 },
        { description: 'Product B', quantity: 1, price: 25 },
    ],
};

generateInvoice(invoiceData, 'invoice.pdf');