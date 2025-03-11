"use strict"
const _INVOICE_GENERATOR = require("./genin");

const _kINVOICE_DATA =
{
    invoiceNumber: "9900001",
    dueDate: "March 31, 2021",
    subtotal: 8000,
    paid: 500,
    memo: "Delivery expected in 7 days",
    addresses:
    {
        billing:
        {
            name: "Santa Claus",
            address: "1 Elf Street",
            city: "Arctic City",
            state: "Arctic Circle",
            postalCode: "H0H 0H0",
            country: "North Pole"
        }
    },
    items:
        [
            {
                itemCode: "12341",
                itemDescription: "Best Run laptop computer",
                quantity: 4,
                price: 2985.00
            },
            {
                itemCode: "12342",
                itemDescription: "Best Run desktop computer",
                quantity: 2,
                price: 2295.00
            }
        ]
};

let ig = new _INVOICE_GENERATOR(_kINVOICE_DATA);

void async function main() {
    await ig.generate();
}()