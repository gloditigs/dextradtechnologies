// models/Customer.js
const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    fullName: String,
    email: { type: String, required: true },
    whatsappNumber: { type: String, required: true },
    uids: [String], // Array of UIDs
    accounts: [String], // Array of Accounts
    package: String, // Selected package
    expiryDate: Date, // When the package expires
    paymentStatus: { type: String, default: 'unpaid' }, // unpaid/paid
    cloud: { type: Boolean, default: false }, // Whether cloud is enabled or not
    source: { type: String, default: 'website' } // 'website' or 'manual'
});

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;
