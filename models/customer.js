const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    whatsappNumber: { type: String, required: true },
    uids: [String], // Array to store multiple UIDs
    accounts: [String], // Array to store multiple accounts
    package: { type: String, required: true },
    paymentStatus: { type: String, enum: ['paid', 'unpaid'], default: 'unpaid' },
    source: { type: String, enum: ['website', 'manual'], default: 'website' },
    expiryDate: { type: Date },
});

const Customer = mongoose.model('Customer', customerSchema);
module.exports = Customer;
