"use strict"
const _AXIOS = require("axios");
const _FS = require("fs");
const _PDFKIT = require("pdfkit");
const _REQUEST = require("request");
const _REQUEST_UTIL = require("./RequestUtil");

class InvoiceGenerator {
    constructor(invoice) {
        this.invoice = invoice;
    }

    async generate() {
        let pdfkit = new _PDFKIT();
        let pdfOutputFile = `./Invoice-${this.invoice.invoiceNumber}.pdf`;
        //  [COMMENT] The PDF file is to be written to the file system.
        pdfkit.pipe(_FS.createWriteStream(pdfOutputFile));
        await this.writeContent(pdfkit);
        pdfkit.end();
    }

    async writeContent(pdfkit) {
        this.generateHeaders(pdfkit);
        this.generateTable(pdfkit);
        this.drawBoxes(pdfkit);
        await this.displayImage(pdfkit);
        this.generateBulletList(pdfkit);
        this.generateNumberedList(pdfkit);
        this.generateLetteredList(pdfkit);
        this.generateMutliLevelList(pdfkit);
        this.generateHyperlink(pdfkit);
        this.generateFooter(pdfkit);
    }

    generateHeaders(pdfkit) {... }
    generateTable(pdfkit) {... }
    drawBoxes(pdfkit) {... }
    async displayImage(pdfkit) {... }
    //  displayImageBase64(pdfkit) {...}
    generateBulletList(pdfkit) {... }
    generateNumberedList(pdfkit) {... }
    generateLetteredList(pdfkit) {... }
    generateMultiLevelList(pdfkit) {... }
    generateHyperlink(pdfkit) {... }
    generateFooter(pdfkit) {... }
}

module.exports = InvoiceGenerator;

generateHeaders(pdfkit)
{
    let billingAddress = this.invoice.addresses.billing;
    pdfkit.image("./SAP.png", 25, 25, { width: 150 })
        .fillColor("#000")
        .fontSize(20)
        .text("INVOICE", 400, 25, { align: "right" })
        .fontSize(10)
        .text(`Invoice Number: ${this.invoice.invoiceNumber}`, { align: "right" })
        .text(`Due Date: ${this.invoice.dueDate}`, { align: "right" })
        .text(`Balance Due: €${this.invoice.subtotal - this.invoice.paid}`, { align: "right" });
    //  [COMMENT] A blank line between Balance Due and Billing Address.
    pdfkit.moveDown();
    pdfkit.text(`Billing Address:\n${billingAddress.name}`, { align: "right" })
        .text(`${billingAddress.address}\n${billingAddress.city}`, { align: "right" })
        .text(`${billingAddress.state} ${billingAddress.postalCode}`, { align: "right" })
        .text(`${billingAddress.country}`, { align: "right" });
    const _kPAGE_BEGIN = 25;
    const _kPAGE_END = 580;
    //  [COMMENT] Draw a horizontal line.
    pdfkit.moveTo(_kPAGE_BEGIN, 200)
        .lineTo(_kPAGE_END, 200)
        .stroke();
    pdfkit.text(`Memo: ${this.invoice.memo}`, 50, 210);
    pdfkit.moveTo(_kPAGE_BEGIN, 250)
        .lineTo(_kPAGE_END, 250)
        .stroke();
}